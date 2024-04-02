import {displaySettings, mapSettings, playerSettings} from './settings.js';

export default class InteractionManager {
    constructor(bulletMgr, playerMgr) {
        this._bulletMgr = bulletMgr;
        this._playerMgr = playerMgr;
    }

    tick() {
        for (const p of this._playerMgr.getPlayersOnField()) {
            if (!this._movePlayer(p) && p.input.shoot)
                this._shootBullet(p);
        }
    }

    _shootBullet(player) {
        if (player.shootAfter >= Date.now())
            return;

        player.shootAfter = new Date(new Date().getTime() + (1000 * playerSettings.shootDelay));
        const angle = player.dir / 16 * 2 * Math.PI;
        const newX = player.x + displaySettings.tileSize / 2 + Math.sin(angle) * playerSettings.bulletSpeed;
        const newY = player.y + displaySettings.tileSize / 2 - Math.cos(angle) * playerSettings.bulletSpeed;

        console.log('player shooting', player.name)
        this._bulletMgr.add({
            x: newX,
            y: newY,
            dir: player.dir,
            owner: player
        });
    }

    _canMove(player, x, y) {
        x = Math.round(x);
        y = Math.round(y);
        const x0 = Math.floor(x / displaySettings.tileWidth);
        const x1 = Math.ceil(x / displaySettings.tileWidth);
        const y0 = Math.floor(y / displaySettings.tileWidth);
        const y1 = Math.ceil(y / displaySettings.tileWidth);
        const points = [[x0, y0], [x0, y1], [x1, y0], [x1, y1]];
        //check against tile map
        for (const [px, py] of points) {
            if (mapSettings.map[px + mapSettings.mapWidth * py] === '#') {
                return false;
            }
        }

        //check against other players
        const p1x = x;
        const p1y = y;
        for (const other of this._playerMgr.getPlayersOnField()) {
            if (other === player)
                continue;

            let dx = Math.abs(other.x - p1x);
            let dy = Math.abs(other.y - p1y);

            if (dx < displaySettings.tileWidth && dy < displaySettings.tileWidth) {
                return false;
            }
        }

        return true;
    }

    _movePlayer(player) {
        // move turret
        if (player.input.left)
            player.dir = (player.dir + 16 - playerSettings.turnSpeed) % 16;
        if (player.input.right)
            player.dir = (player.dir + playerSettings.turnSpeed) % 16;

        // move tank
        if (player.input.up || player.input.down) {
            const direction = player.input.up ? 1 : -1;
            const angle = player.dir / 16 * 2 * Math.PI;
            const newX = player.x + Math.sin(angle) * direction * playerSettings.tankSpeed;
            const newY = player.y - Math.cos(angle) * direction * playerSettings.tankSpeed;
            if (this._canMove(player, newX, newY)) {
                player.x = newX;
                player.y = newY;
                return true;
            } else if (this._canMove(player, newX, player.y)) {
                player.x = newX;
                return true;
            } else if (this._canMove(player, player.x, newY)) {
                player.y = newY;
                return true;
            }
        }

        return false;
    }
}
