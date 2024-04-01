import {displaySettings, mapSettings, playerSettings} from './settings.js';

export default class PlayerManager {
    players = [];

    addPlayer(id, name, connection) {
        const emptyPos = this._findEmptyPos();
        const player = {
            id: id,
            x: emptyPos[0] * displaySettings.tileWidth,
            y: emptyPos[1] * displaySettings.tileWidth,
            dir: randInt(0, 16),
            score: 0,
            input: {},
            name: name,
            connection: connection
        };
        console.log('adding ' + player.name + ' at ' + player.x + ',' + player.y + ',' + player.id);
        this.players.push(player);
        return player;
    }

    removePlayer(id) {
        console.log(`user $(id) left`);
        this.players.splice(this._findPlayerIndex(id), 1);
    }

    _findPlayerIndex(id) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].id === id)
                return i;
        }
    }

    _canMove(player, x, y) {
        x = Math.round(x);
        y = Math.round(y);
        const x0 = Math.floor(x / displaySettings.tileWidth);
        const x1 = Math.ceil(x / displaySettings.tileWidth);
        const y0 = Math.floor(y / displaySettings.tileWidth);
        const y1 = Math.ceil(y / displaySettings.tileWidth);
        const points = [[x0, y0], [x0, y1], [x1, y0], [x1, y1]];
        //check against tilemap
        for (let i = 0; i < points.length; i++) {
            const px = points[i][0];
            const py = points[i][1];
            if (mapSettings.map[px + mapSettings.mapWidth * py] === '#') {
                return false;
            }
        }

        //check against other players
        const p1x = x;
        const p1y = y;
        for (let i = 0; i < this.players.length; i++) {
            const other = this.players[i];
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
            } else if (this._canMove(player, newX, player.y)) {
                player.x = newX;
            } else if (this._canMove(player, player.x, newY)) {
                player.y = newY;
            }
        }
    }

    tick() {
        for (let i = 0; i < this.players.length; i++) {
            this._movePlayer(this.players[i]);
        }
    }

    killPlayer(player) {
        player.connection.send(JSON.stringify({
            type: 'shot'
        }));
        const emptyPos = this._findEmptyPos();
        player.x = emptyPos[0] * displaySettings.tileWidth;
        player.y = emptyPos[1] * displaySettings.tileWidth;
    }

    playerScore(player) {
        player.score++;
    }

    //in tile coordinates
    _squareContents(x, y) {
        let result = [];
        if (mapSettings.map[x + mapSettings.mapWidth * y] === '#') {
            result.push('#');
        }
        for (let i = 0; i < this.players.length; i++) {
            const p = this.players[i];
            const x0 = Math.floor(p.x / displaySettings.tileWidth);
            const x1 = Math.ceil(p.x / displaySettings.tileWidth);
            const y0 = Math.floor(p.y / displaySettings.tileWidth);
            const y1 = Math.ceil(p.y / displaySettings.tileWidth);
            if ((x0 === x && y0 === y) || (x1 === x && y0 === y) || (x1 === x && y1 === y) || (x0 === x && y1 === y)) {
                result.push(p);
            }
        }
        return result;
    }

    _findEmptyPos() {
        const candidatePositions = [];
        for (let i = 0; i < mapSettings.mapWidth; i++) {
            for (let j = 0; j < mapSettings.mapHeight; j++) {
                const contents = this._squareContents(i, j);
                if (contents.length === 0) {
                    candidatePositions.push([i, j]);
                }
            }
        }
        return randomElem(candidatePositions);
    }
}


function randomElem(ar) {
    return ar[Math.floor(Math.random() * ar.length)];
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
