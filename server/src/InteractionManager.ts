import {displaySettings, mapSettings, playerSettings} from './settings';
import BulletsManager from './BulletsManager';
import PlayerManager from './PlayerManager';
import Player from './Player';

export default class InteractionManager {
    private _bulletMgr: BulletsManager;
    private _playerMgr: PlayerManager;

    constructor(bulletMgr: BulletsManager, playerMgr: PlayerManager) {
        this._bulletMgr = bulletMgr;
        this._playerMgr = playerMgr;
    }

    tick() {
        for (const p of this._playerMgr.getPlayersOnField()) {
            if (!this._movePlayer(p) && p.input.shoot)
                this._shootBullet(p);
        }
    }

    private _shootBullet(player: Player) {
        if (player.tankState.shootAfter >= Date.now())
            return;

        player.tankState.shootAfter = Date.now() + (1000 * playerSettings.shootDelay);
        const angle = player.tankState.dir / 16 * 2 * Math.PI;
        const newX = player.tankState.x + displaySettings.tileSize / 2 + Math.sin(angle) * playerSettings.bulletSpeed;
        const newY = player.tankState.y + displaySettings.tileSize / 2 - Math.cos(angle) * playerSettings.bulletSpeed;

        console.log('player shooting', player.name);
        this._bulletMgr.add({
            x: newX,
            y: newY,
            dir: player.tankState.dir,
            owner: player
        });
    }

    private _canMove(player: Player, x: number, y: number) {
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

            const dx = Math.abs(other.tankState.x - p1x);
            const dy = Math.abs(other.tankState.y - p1y);

            if (dx < displaySettings.tileWidth && dy < displaySettings.tileWidth) {
                return false;
            }
        }

        return true;
    }

    private _movePlayer(player: Player) {
        // move turret
        if (player.input.left)
            player.tankState.dir = (player.tankState.dir + 16 - playerSettings.turnSpeed) % 16;
        if (player.input.right)
            player.tankState.dir = (player.tankState.dir + playerSettings.turnSpeed) % 16;

        // move tank
        if (player.input.up || player.input.down) {
            const direction = player.input.up ? 1 : -1;
            const angle = player.tankState.dir / 16 * 2 * Math.PI;
            const newX = player.tankState.x + Math.sin(angle) * direction * playerSettings.tankSpeed;
            const newY = player.tankState.y - Math.cos(angle) * direction * playerSettings.tankSpeed;
            if (this._canMove(player, newX, newY)) {
                player.tankState.x = newX;
                player.tankState.y = newY;
                return true;
            } else if (this._canMove(player, newX, player.tankState.y)) {
                player.tankState.x = newX;
                return true;
            } else if (this._canMove(player, player.tankState.x, newY)) {
                player.tankState.y = newY;
                return true;
            }
        }

        return false;
    }
}
