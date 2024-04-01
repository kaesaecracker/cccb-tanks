import fs from 'fs';
import {PNG} from 'pngjs';
import {displaySettings, mapSettings} from './settings.js';

export default class Drawer {
    _tankSprite = [];
    _tankSpriteWidth;
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
                        self._tankSprite[i] = this.data[idx + 2] > 128 ? 1 : 0;
                    }
                }
                self._tankSpriteWidth = this.width;
            });
    }

    _drawWall(tile_x, tile_y) {
        let i = 0;
        for (let dy = 0; dy < displaySettings.tileSize; dy++) {
            for (let dx = i % 2; dx < displaySettings.tileSize; dx += 2, i++) {
                // y
                i = (tile_y * displaySettings.tileSize + dy) * this._display.width;

                // x
                i += tile_x * displaySettings.tileSize + dx;

                // draw
                this._display.pixels[i] = 1;
            }
        }
    }

    _drawPlayer(pixel_x, pixel_y, dir) {
        pixel_x = Math.round(pixel_x);
        pixel_y = Math.round(pixel_y);
        dir = Math.round(dir) % 16;

        for (let dy = 0; dy < displaySettings.tileSize; dy++) {
            for (let dx = 0; dx < displaySettings.tileSize; dx++) {
                // y
                let i = (pixel_y + dy) * this._display.width;

                // x
                i += pixel_x + dx;

                // draw
                this._display.pixels[i] = this._tankSpriteAt(dx, dy, dir) | this._display.pixels[i];
            }
        }
    }

    _drawBullet(pixel_x, pixel_y) {
        this._display.pixels[Math.round(pixel_y) * this._display.width + Math.round(pixel_x)] = 1;
    }

    _tankSpriteAt(dx, dy, dir) {
        // 0 1 2 3 4 5
        // up ...... right
        const x = (dir % 4) * (displaySettings.tileSize + 1);
        const y = Math.floor(dir / 4) * (displaySettings.tileSize + 1);

        return this._tankSprite[(y + dy) * this._tankSpriteWidth + x + dx];
    }

    draw() {
        this._display.clearCanvas();
        for (let i = 0; i < mapSettings.mapWidth; i++) {
            for (let j = 0; j < mapSettings.mapHeight; j++) {
                if (mapSettings.map[i + mapSettings.mapWidth * j] === '#') {
                    this._drawWall(i, j);
                }
            }
        }

        for (const p of this._playerMgr.getPlayersOnField()) {
            this._drawPlayer(p.x, p.y, p.dir);
        }

        for (const b of this._bulletMgr.getBullets()) {
            this._drawBullet(b.x, b.y);
        }

        this._display.sendPixels();
        this._drawScoreboard();
    }

    _drawScoreboard() {
        const maxLength = 12;
        const maxRows = 20;

        const playerRows = maxRows - 5;

        const playerCopy = this._playerMgr.getAllPlayers().slice();
        playerCopy.sort(function (a, b) {
            return b.score - a.score;
        });

        let text = '';
        text += '== TANKS! ==';
        text += '-- scores --';
        for (let i = 0; i < Math.min(playerCopy.length, playerRows); i++) {
            const score = playerCopy[i].score.toString();
            const nameLength = maxLength - score.length - 1;

            const name = playerCopy[i].name.slice(0, nameLength);
            const spaces = ' '.repeat(nameLength - name.length + 1);

            text += name + spaces + score;
        }

        if (playerCopy.length < playerRows) {
            const missingRows = playerRows - playerCopy.length;
            text += ' '.repeat(missingRows * maxLength);
        }

        text += '--  join  --';
        text += ' http://172 ';
        text += ' .23.42.96/ ';

        this._display.placeText(text, mapSettings.mapWidth, 0, maxLength, maxRows);
    }
}
