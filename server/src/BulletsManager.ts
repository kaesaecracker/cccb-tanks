import {displaySettings, mapSettings} from './settings';
import PlayerManager from './PlayerManager';
import {Bullet} from './Bullet';

export default class BulletsManager {
    private _bullets: Bullet[] = [];
    private _playerMgr: PlayerManager;

    constructor(playerMgr: PlayerManager) {
        this._playerMgr = playerMgr;
    }

    tick() {
        const bulletsToRemove: Bullet[] = [];
        for (const b of this._bullets) {
            this._move(b);
            if (this._bulletHits(b))
                bulletsToRemove.push(b);
        }

        this._bullets = this._bullets.filter(b => !bulletsToRemove.includes(b));
    }

    add(bullet: Bullet) {
        this._bullets.push(bullet);
    }

    getBullets() {
        return this._bullets;
    }

    _move(bullet: Bullet) {
        const angle = bullet.dir / 16 * 2 * Math.PI;
        bullet.x += Math.sin(angle) * 3;
        bullet.y -= Math.cos(angle) * 3;

        return this._bulletHits(bullet);
    }

    _bulletHits(bullet: Bullet) {
        const x = Math.round(bullet.x);
        const y = Math.round(bullet.y);
        const x0 = Math.floor(x / displaySettings.tileWidth);
        const y0 = Math.floor(y / displaySettings.tileWidth);
        if (mapSettings.map[x0 + mapSettings.mapWidth * y0] === '#') {
            console.log('bullet hits wall', {x, y, x0, y0});
            return true;
        }

        // check against players
        for (const other of this._playerMgr.getPlayersOnField()) {
            if (other === bullet.owner) continue;

            const dx = x - other.tankState.x;
            const dy = y - other.tankState.y;

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
