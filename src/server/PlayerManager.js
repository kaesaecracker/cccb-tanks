import {displaySettings, mapSettings} from './settings.js';

export default class PlayerManager {
    _playersToJoin = [];
    players = [];

    add(player) {
        player.score = 0;
        player.input = {
            up: false,
            down: false,
            left: false,
            right: false,
            shoot: false
        };

        console.log('adding player to join queue', {name: player.name, x: player.x, y: player.y});
        this._playersToJoin.push(player);
        return player;
    }

    remove(player) {
        console.log('player left', {name: player.name});
        this.players = this.players.filter(p => p !== player);
    }

    tick() {
        const joiningPlayer = this._playersToJoin.shift();
        if (!joiningPlayer)
            return;

        this._resetPosition(joiningPlayer);
        joiningPlayer.dir = randInt(0, 16);

        console.log('player joins game');
        this.players.push(joiningPlayer);
    }

    kill(player) {
        player.connection.send(JSON.stringify({type: 'shot'}));
        this._resetPosition(player);
    }

    _resetPosition(player) {
        const emptyPos = this._findEmptyPos();
        player.x = emptyPos.x;
        player.y = emptyPos.y;
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
        for (const p of this.players) {
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
        for (let x = 0; x < mapSettings.mapWidth; x++) {
            for (let y = 0; y < mapSettings.mapHeight; y++) {
                const contents = this._squareContents(x, y);
                if (contents.length === 0) {
                    candidatePositions.push({x, y});
                }
            }
        }

        const location = randomElem(candidatePositions);
        return {
            x: location.x * displaySettings.tileWidth,
            y: location.y * displaySettings.tileWidth
        };
    }
}


function randomElem(ar) {
    return ar[Math.floor(Math.random() * ar.length)];
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
