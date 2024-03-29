/*

  Tanks

  by Stephen Lavelle and Felix Niklas at the CCCB in 2015

  Ideas:
      - Make the tank slower when you shoot (Denis)
      - Stable Sort the Scoreboard so that the first person
        getting the highscore stays on top until someone
        scores higher

*/

import {bulletSpeed, map, mapHeight, mapWidth, tankSpeed, tileSize, tileWidth, turnSpeed} from "./settings.js";

import fs from 'fs'
import {PNG} from 'pngjs'

import {WebSocketServer} from 'ws'

const width = tileSize * mapWidth;
const height = tileSize * mapHeight;
let pixels = new Uint8Array(width * height);

let tankSprite = []

let state = {
    players: [],
    bullets: []
};

let tankSpriteWidth;

function randomElem(ar) {
    return ar[Math.floor(Math.random() * ar.length)];
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

//in tile coordinates
function squareContents(x, y) {
    let result = [];
    if (map[x + mapWidth * y] === '#') {
        result.push("#");
    }
    for (let i = 0; i < state.players.length; i++) {
        const p = state.players[i];
        const x0 = Math.floor(p.x / tileWidth);
        const x1 = Math.ceil(p.x / tileWidth);
        const y0 = Math.floor(p.y / tileWidth);
        const y1 = Math.ceil(p.y / tileWidth);
        if ((x0 === x && y0 === y) || (x1 === x && y0 === y) || (x1 === x && y1 === y) || (x0 === x && y1 === y)) {
            result.push(p);
        }
    }
    return result;
}

function findEmptyPos() {
    const candidatePositions = [];
    for (let i = 0; i < mapWidth; i++) {
        for (let j = 0; j < mapHeight; j++) {
            const contents = squareContents(i, j);
            if (contents.length === 0) {
                candidatePositions.push([i, j]);
            }
        }
    }
    return randomElem(candidatePositions);
}

function addPlayer(id, name, connection) {
    const emptyPos = findEmptyPos();
    const player = {
        id: id,
        x: emptyPos[0] * tileWidth,
        y: emptyPos[1] * tileWidth,
        dir: randInt(0, 16),
        score: 0,
        input: {},
        name: name,
        connection: connection
    };
    console.log("adding " + player.name + " at " + player.x + "," + player.y + "," + player.id);
    state.players.push(player);
    return player;
}


function canMove(player, x, y) {
    x = Math.round(x)
    y = Math.round(y)
    const x0 = Math.floor(x / tileWidth);
    const x1 = Math.ceil(x / tileWidth);
    const y0 = Math.floor(y / tileWidth);
    const y1 = Math.ceil(y / tileWidth);
    const points = [[x0, y0], [x0, y1], [x1, y0], [x1, y1]];
    //check against tilemap
    for (let i = 0; i < points.length; i++) {
        const px = points[i][0];
        const py = points[i][1];
        if (map[px + mapWidth * py] === '#') {
            return false;
        }
    }

    //check against other players
    const p1x = x;
    const p1y = y;
    for (let i = 0; i < state.players.length; i++) {
        const other = state.players[i];
        if (other === player)
            continue

        let dx = Math.abs(other.x - p1x);
        let dy = Math.abs(other.y - p1y);

        if (dx < tileWidth && dy < tileWidth) {
            return false
        }
    }

    return true
}

function movePlayer(player) {
    // move turret
    if (player.input.left)
        player.dir = (player.dir + 16 - turnSpeed) % 16
    if (player.input.right)
        player.dir = (player.dir + turnSpeed) % 16

    // move tank
    if (player.input.up || player.input.down) {
        const direction = player.input.up ? 1 : -1;
        const angle = player.dir / 16 * 2 * Math.PI;
        const newX = player.x + Math.sin(angle) * direction * tankSpeed;
        const newY = player.y - Math.cos(angle) * direction * tankSpeed;
        if (canMove(player, newX, newY)) {
            player.x = newX
            player.y = newY
        } else if (canMove(player, newX, player.y)) {
            player.x = newX
        } else if (canMove(player, player.x, newY)) {
            player.y = newY
        }
    }
}

function playerScore(player) {
    player.score++
}

function killPlayer(player) {
    player.connection.send(JSON.stringify({
        type: 'shot'
    }))
    const emptyPos = findEmptyPos();
    player.x = emptyPos[0] * tileWidth
    player.y = emptyPos[1] * tileWidth;
}

function removePlayer(id) {
    state.players.splice(findPlayerIndex(id), 1)
}

function findPlayerIndex(id) {
    for (let i = 0; i < state.players.length; i++) {
        if (state.players[i].id === id)
            return i
    }
}

function shootBullet(player) {
    const angle = player.dir / 16 * 2 * Math.PI;
    const newX = player.x + tileSize / 2 + Math.sin(angle) * bulletSpeed;
    const newY = player.y + tileSize / 2 - Math.cos(angle) * bulletSpeed;

    state.bullets.push({
        x: newX,
        y: newY,
        dir: player.dir,
        owner: player
    })
}

function moveBullet(bullet) {
    const angle = bullet.dir / 16 * 2 * Math.PI;
    bullet.x += Math.sin(angle) * 3
    bullet.y -= Math.cos(angle) * 3

    return bulletHits(bullet);
}

function bulletHits(bullet) {
    const x = Math.round(bullet.x);
    const y = Math.round(bullet.y);
    const x0 = Math.floor(x / tileWidth);
    const y0 = Math.floor(y / tileWidth);
    if (map[x0 + mapWidth * y0] === '#') {
        return true;
    }

    // check against players
    for (let i = 0; i < state.players.length; i++) {
        const other = state.players[i];
        if (other === bullet.owner) continue

        const dx = x - other.x;
        const dy = y - other.y;

        if (dx >= 0 && dx < tileWidth &&
            dy >= 0 && dy < tileWidth) {
            killPlayer(other)
            playerScore(bullet.owner)
            return true
        }
    }

    return false
}

function clearCanvas() {
    pixels = new Uint8Array(width * height)
}

function drawWall(tile_x, tile_y) {
    let i = 0
    for (let dy = 0; dy < tileSize; dy++) {
        for (let dx = i % 2; dx < tileSize; dx += 2, i++) {
            // y
            i = (tile_y * tileSize + dy) * width

            // x
            i += tile_x * tileSize + dx

            // draw
            pixels[i] = 1
        }
    }
}

function drawPlayer(pixel_x, pixel_y, dir) {
    pixel_x = Math.round(pixel_x)
    pixel_y = Math.round(pixel_y)
    dir = Math.round(dir) % 16

    for (let dy = 0; dy < tileSize; dy++) {
        for (let dx = 0; dx < tileSize; dx++) {
            // y
            let i = (pixel_y + dy) * width;

            // x
            i += pixel_x + dx

            // draw
            pixels[i] = tankSpriteAt(dx, dy, dir) | pixels[i]
        }
    }
}

function drawBullet(pixel_x, pixel_y) {
    pixels[Math.round(pixel_y) * width + Math.round(pixel_x)] = 1
}

function tankSpriteAt(dx, dy, dir) {
    // 0 1 2 3 4 5
    // up ...... right
    const x = (dir % 4) * (tileSize + 1);
    const y = Math.floor(dir / 4) * (tileSize + 1);

    return tankSprite[(y + dy) * tankSpriteWidth + x + dx]
}

function drawToCanvas() {
    clearCanvas();
    for (let i = 0; i < mapWidth; i++) {
        for (let j = 0; j < mapHeight; j++) {
            if (map[i + mapWidth * j] === '#') {
                drawWall(i, j);
            }
        }
    }
    for (let i = 0; i < state.players.length; i++) {
        const p = state.players[i];
        drawPlayer(p.x, p.y, p.dir);
    }
    for (let i = 0; i < state.bullets.length; i++) {
        const b = state.bullets[i];
        drawBullet(b.x, b.y);
    }
    sendPixelsToDisplay()
    drawScoreboard()
}

const maxLength = 10;
const maxRows = 20;

function drawScoreboard() {
    let text = "";
    const playerCopy = state.players.slice();
    playerCopy.sort(function (a, b) {
        return b.score - a.score
    })

    for (let i = 0; i < Math.min(playerCopy.length, maxRows); i++) {
        let name = playerCopy[i].name;
        const score = playerCopy[i].score;

        const textLength = maxLength - score.toString().length - 1;
        const spaces = textLength - name.length + 1;

        if (name.length > textLength)
            name = name.slice(0, textLength) + " "
        else
            name += (new Array(spaces + 1).join(" "))

        text += name + score
    }

    if (playerCopy.length < maxRows) {
        const missingRows = maxRows - playerCopy.length + 1;
        text += (new Array(missingRows * maxLength).join(" "))
    }

    placeText(text, mapWidth + 1, 1, maxLength, maxRows - 2)
}

/*

  read assets

*/


fs.createReadStream('images/tank.png')
    .pipe(new PNG({
        filterType: 4
    }))
    .on('parsed', function () {
        let i = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++, i++) {
                const idx = (this.width * y + x) << 2;
                tankSprite[i] = this.data[idx + 2] > 128 ? 1 : 0
            }
        }
        tankSpriteWidth = this.width

        startGame()
    });


/*

  Server for clients

*/
const server = new WebSocketServer({port: 8001});
let _uid = 0;

function uniqueID() {
    return _uid++
}

server.on('connection', function connection(client) {
    let player

    client.on('message', function incoming(message) {
        console.log('received: %s', message)

        message = JSON.parse(message)
        switch (message.type) {
            case 'input-on':
                if (message.value === 'space')
                    shootBullet(player)
                else
                    player.input[message.value] = true
                break
            case 'input-off':
                player.input[message.value] = false
                break
            case 'name':
                player = addPlayer(uniqueID(), message.value, client)
                break
        }
    })

    client.on('close', function leaving(client) {
        console.log("user left")
        if (player)
            removePlayer(player.id)
    })
})


/*

  Server to Display

*/

import dgram from 'dgram'

const client = dgram.createSocket('udp4');

clearScreen()

function sendPixelsToDisplay() {
    const packedBytes = new Buffer(10 + pixels.length / 8);

    packedBytes[0] = 0
    packedBytes[1] = 19
    packedBytes[2] = 0
    packedBytes[3] = 0
    packedBytes[4] = 0
    packedBytes[5] = 0
    packedBytes[6] = mapWidth / 256
    packedBytes[7] = mapWidth % 256
    packedBytes[8] = height / 256
    packedBytes[9] = height % 256

    for (let i = 0, n = 10, l = pixels.length; i < l; n++) {
        let sum = 0;

        for (let j = 128; j > 0; j = (j >> 1)) {
            sum += pixels[i++] ? j : 0;
        }
        packedBytes[n] = sum;
    }

    client.send(packedBytes, 0, packedBytes.length, 2342, '172.23.42.29');
}

function placeText(text, x, y, width, height) {
    const packedBytes = new Buffer(10 + text.length);

    packedBytes[0] = 0
    packedBytes[1] = 3
    packedBytes[2] = x / 256
    packedBytes[3] = x % 256
    packedBytes[4] = y / 256
    packedBytes[5] = y % 256
    packedBytes[6] = width / 256
    packedBytes[7] = width % 256
    packedBytes[8] = height / 256
    packedBytes[9] = height % 256

    for (let i = 0, n = 10; i < text.length; n++) {
        packedBytes[n] = text.charCodeAt(i++);
    }


    client.send(packedBytes, 0, packedBytes.length, 2342, '172.23.42.29');
}

function clearScreen() {
    const buffer = new Buffer(2);
    buffer[0] = 0
    buffer[1] = 2
    client.send(buffer, 0, 2, 2342, '172.23.42.29');
}


function tick() {
    for (let i = 0; i < state.players.length; i++) {
        movePlayer(state.players[i])
    }
    for (let i = 0; i < state.bullets.length; i++) {
        if (moveBullet(state.bullets[i])) {
            state.bullets.splice(i, 1)
            i--
        }
    }

    drawToCanvas()
}

function startGame() {
    drawToCanvas();

    setInterval(tick, 1000 / 25);
}
