import {bulletsSettings, displaySettings, mapSettings} from "./settings.js";

export default class BulletsManager {
    bullets = [];
    _playerMgr;

    constructor(playerMgr) {
        this._playerMgr = playerMgr;
    }

    tick() {
        for (let i = 0; i < this.bullets.length; i++) {
            if (this._move(this.bullets[i])) {
                this.bullets.splice(i, 1)
                i--
            }
        }
    }

    _move(bullet) {
        const angle = bullet.dir / 16 * 2 * Math.PI;
        bullet.x += Math.sin(angle) * 3
        bullet.y -= Math.cos(angle) * 3

        return this._bulletHits(bullet);
    }

    _bulletHits(bullet) {
        const x = Math.round(bullet.x);
        const y = Math.round(bullet.y);
        const x0 = Math.floor(x /displaySettings.tileWidth);
        const y0 = Math.floor(y / displaySettings.tileWidth);
        if (mapSettings.map[x0 + mapSettings.mapWidth * y0] === '#') {
            return true;
        }

        // check against players
        for (let i = 0; i < this._playerMgr.players.length; i++) {
            const other = this._playerMgr.players[i];
            if (other === bullet.owner) continue

            const dx = x - other.x;
            const dy = y - other.y;

            if (dx >= 0 && dx < displaySettings.tileWidth &&
                dy >= 0 && dy < displaySettings.tileWidth) {
                this._playerMgr.killPlayer(other)
                this._playerMgr.playerScore(bullet.owner)
                return true
            }
        }

        return false
    }

    shootBullet(player) {
        const angle = player.dir / 16 * 2 * Math.PI;
        const newX = player.x + displaySettings.tileSize / 2 + Math.sin(angle) * bulletsSettings.bulletSpeed;
        const newY = player.y + displaySettings.tileSize / 2 - Math.cos(angle) * bulletsSettings.bulletSpeed;

        this.bullets.push({
            x: newX,
            y: newY,
            dir: player.dir,
            owner: player
        });
    }
}
