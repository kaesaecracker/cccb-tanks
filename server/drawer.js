import fs from "fs";
import {PNG} from "pngjs";
import {map, mapHeight, mapWidth, tileSize} from "./settings.js";
import {clearCanvas, pixels, placeText, sendPixelsToDisplay, width} from "./display.js";
import {players} from "./players.js";
import {bullets} from "./bullets.js";

let tankSprite = []
let tankSpriteWidth;

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
    });

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

export function drawToCanvas() {
    clearCanvas();
    for (let i = 0; i < mapWidth; i++) {
        for (let j = 0; j < mapHeight; j++) {
            if (map[i + mapWidth * j] === '#') {
                drawWall(i, j);
            }
        }
    }
    for (let i = 0; i < players.length; i++) {
        const p = players[i];
        drawPlayer(p.x, p.y, p.dir);
    }
    for (let i = 0; i < bullets.length; i++) {
        const b = bullets[i];
        drawBullet(b.x, b.y);
    }
    sendPixelsToDisplay()
    drawScoreboard()
}

const maxLength = 10;
const maxRows = 20;

function drawScoreboard() {
    let text = "";
    const playerCopy = players.slice();
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
