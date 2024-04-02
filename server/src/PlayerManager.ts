import {displaySettings, mapSettings, playerSettings} from './settings.js';
import Player from "./Player.js";

export default class PlayerManager {
    _players: Player[] = [];
    _playersOnField: Player[] = [];
    _playersToPlace: Player[] = [];

    join(player: Player) {
        const existingPlayer = this._players.find(p => p.name === player.name);
        if (existingPlayer) {
            if (existingPlayer.connection !== null)
                throw new Error('user already connected');

            existingPlayer.connection = player.connection;
            player = existingPlayer;
        } else {
            this._players.push(player);
        }

        console.log('player joins', {name: player.name});
        this._playersToPlace.push(player);
        return player;
    }

    leave(player) {
        console.log('player left', {name: player.name});
        this._playersToPlace = this._playersToPlace.filter(p => p !== player);
        this._playersOnField = this._playersOnField.filter(p => p !== player);
        if (player.score === 0)
            this._players = this._players.filter(p => p !== player);
    }

    tick() {
        const playerToPlace = this._playersToPlace.shift();
        if (!playerToPlace)
            return;

        const now = Date.now();
        if (playerToPlace.respawnAfter > now) {
            this._playersToPlace.push(playerToPlace);
            return;
        }

        this._resetPosition(playerToPlace);
        playerToPlace.dir = randInt(0, 16);

        console.log('player spawns', playerToPlace.name);
        this._playersOnField.push(playerToPlace);
    }

    kill(player) {
        player.connection.send(JSON.stringify({type: 'shot'}));
        this._playersOnField = this._playersOnField.filter(p => p !== player);
        player.respawnAfter = new Date(new Date().getTime() + (1000 * playerSettings.respawnDelay));
        this._playersToPlace.push(player);
    }

    getPlayersOnField() {
        return this._playersOnField;
    }

    getAllPlayers() {
        return this._players;
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
        let result: (String|Player)[] = [];
        if (mapSettings.map[x + mapSettings.mapWidth * y] === '#') {
            result.push('#');
        }
        for (const p of this.getPlayersOnField()) {
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
        const candidatePositions: { x: number, y: number }[] = [];
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


function randomElem<T>(ar: T[]): T {
    return ar[Math.floor(Math.random() * ar.length)];
}

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}
