import {bulletSpeed, map, mapHeight, mapWidth, tankSpeed, tileSize, tileWidth, turnSpeed} from "./settings.js";
import {randInt, randomElem} from "./helpers.js";
import {bullets} from "./bullets.js";

export const players = [];

export function addPlayer(id, name, connection) {
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
    players.push(player);
    return player;
}

export function removePlayer(id) {
    console.log(`user $(id) left`)
    players.splice(findPlayerIndex(id), 1)
}

function findPlayerIndex(id) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].id === id)
            return i
    }
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
    for (let i = 0; i < players.length; i++) {
        const other = players[i];
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

export function tickPlayers() {
    for (let i = 0; i < players.length; i++) {
        movePlayer(players[i])
    }
}

export function killPlayer(player) {
    player.connection.send(JSON.stringify({
        type: 'shot'
    }))
    const emptyPos = findEmptyPos();
    player.x = emptyPos[0] * tileWidth
    player.y = emptyPos[1] * tileWidth;
}

export function playerScore(player) {
    player.score++
}

//in tile coordinates
function squareContents(x, y) {
    let result = [];
    if (map[x + mapWidth * y] === '#') {
        result.push("#");
    }
    for (let i = 0; i < players.length; i++) {
        const p = players[i];
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

export function findEmptyPos() {
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

export function shootBullet(player) {
    const angle = player.dir / 16 * 2 * Math.PI;
    const newX = player.x + tileSize / 2 + Math.sin(angle) * bulletSpeed;
    const newY = player.y + tileSize / 2 - Math.cos(angle) * bulletSpeed;

    bullets.push({
        x: newX,
        y: newY,
        dir: player.dir,
        owner: player
    })
}

