import fs from "fs";
import {PNG} from "pngjs";
import {map, mapHeight, mapWidth, tileSize} from "./settings.js";

export default class Drawer {
    tankSprite = []
    tankSpriteWidth;
    _display;
    _playerMgr;
    _bulletMgr;

    constructor(display, bulletMgr, playerMgr) {
        this._display = display;
        this._bulletMgr = bulletMgr;
        this._playerMgr = playerMgr;

        const self = this;
        fs.createReadStream('images/tank.png')
            .pipe(new PNG({filterType: 4}))
            .on('parsed', function () {
                let i = 0;
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++, i++) {
                        const idx = (this.width * y + x) << 2;
                        self.tankSprite[i] = this.data[idx + 2] > 128 ? 1 : 0
                    }
                }
                self.tankSpriteWidth = this.width
            });
    }

    _drawWall(tile_x, tile_y) {
        let i = 0
        for (let dy = 0; dy < tileSize; dy++) {
            for (let dx = i % 2; dx < tileSize; dx += 2, i++) {
                // y
                i = (tile_y * tileSize + dy) * this._display.width

                // x
                i += tile_x * tileSize + dx

                // draw
                this._display.pixels[i] = 1
            }
        }
    }

    _drawPlayer(pixel_x, pixel_y, dir) {
        pixel_x = Math.round(pixel_x)
        pixel_y = Math.round(pixel_y)
        dir = Math.round(dir) % 16

        for (let dy = 0; dy < tileSize; dy++) {
            for (let dx = 0; dx < tileSize; dx++) {
                // y
                let i = (pixel_y + dy) * this._display.width;

                // x
                i += pixel_x + dx

                // draw
                this._display.pixels[i] = this._tankSpriteAt(dx, dy, dir) | this._display.pixels[i]
            }
        }
    }

    _drawBullet(pixel_x, pixel_y) {
        this._display.pixels[Math.round(pixel_y) * this._display.width + Math.round(pixel_x)] = 1
    }

    _tankSpriteAt(dx, dy, dir) {
        // 0 1 2 3 4 5
        // up ...... right
        const x = (dir % 4) * (tileSize + 1);
        const y = Math.floor(dir / 4) * (tileSize + 1);

        return this.tankSprite[(y + dy) * this.tankSpriteWidth + x + dx]
    }

    draw() {
        this._display.clearCanvas();
        for (let i = 0; i < mapWidth; i++) {
            for (let j = 0; j < mapHeight; j++) {
                if (map[i + mapWidth * j] === '#') {
                    this._drawWall(i, j);
                }
            }
        }
        for (let i = 0; i < this._playerMgr.players.length; i++) {
            const p = this._playerMgr.players[i];
            this._drawPlayer(p.x, p.y, p.dir);
        }
        for (let i = 0; i < this._bulletMgr.bullets.length; i++) {
            const b = this._bulletMgr.bullets[i];
            this._drawBullet(b.x, b.y);
        }
        this._display.sendPixels()
        this._drawScoreboard()
    }

    maxLength = 10;
    maxRows = 20;

    _drawScoreboard() {
        let text = "";
        const playerCopy = this._playerMgr.players.slice();
        playerCopy.sort(function (a, b) {
            return b.score - a.score
        })

        for (let i = 0; i < Math.min(playerCopy.length,this. maxRows); i++) {
            let name = playerCopy[i].name;
            const score = playerCopy[i].score;

            const textLength = this.maxLength - score.toString().length - 1;
            const spaces = textLength - name.length + 1;

            if (name.length > textLength)
                name = name.slice(0, textLength) + " "
            else
                name += (new Array(spaces + 1).join(" "))

            text += name + score
        }

        if (playerCopy.length < this.maxRows) {
            const missingRows =this. maxRows - playerCopy.length + 1;
            text += (new Array(missingRows * this.maxLength).join(" "))
        }

        this._display.placeText(text, mapWidth + 1, 1,this.maxLength, this.maxRows - 2)
    }
}
