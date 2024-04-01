import {displaySettings, mapSettings} from './settings.js';

export default class BulletsManager {
    bullets = [];
    _playerMgr;

    constructor(playerMgr) {
        this._playerMgr = playerMgr;
    }

    tick() {
        for (const b of this.bullets){
            this._move(b);
            if (this._bulletHits(b))
                this.bullets.splice(this.bullets.indexOf(b), 1);
        }
    }

    add(bullet){
        this.bullets.push(bullet);
    }

    _move(bullet) {
        const angle = bullet.dir / 16 * 2 * Math.PI;
        bullet.x += Math.sin(angle) * 3;
        bullet.y -= Math.cos(angle) * 3;

        return this._bulletHits(bullet);
    }

    _bulletHits(bullet) {
        const x = Math.round(bullet.x);
        const y = Math.round(bullet.y);
        const x0 = Math.floor(x / displaySettings.tileWidth);
        const y0 = Math.floor(y / displaySettings.tileWidth);
        if (mapSettings.map[x0 + mapSettings.mapWidth * y0] === '#') {
            console.log('bullet hits wall', {x, y, x0, y0});
            return true;
        }

        // check against players
        for (const other of this._playerMgr.players) {
            if (other === bullet.owner) continue;

            const dx = x - other.x;
            const dy = y - other.y;

            if (dx >= 0 && dx < displaySettings.tileWidth &&
                dy >= 0 && dy < displaySettings.tileWidth) {
                this._playerMgr.kill(other);
                this._playerMgr.playerScore(bullet.owner);
                console.log('bullet hits player', {x, y, fromPlayer: bullet.owner.name, toPlayer: other.name});
                return true;
            }
        }

        return false;
    }
}
