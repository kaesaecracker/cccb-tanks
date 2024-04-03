import {WebSocket} from 'ws';
import {Message} from './Message';

export default class Player {
    connection: WebSocket | null;
    name?: string;
    score = 0;
    respawnAfter = 0;
    wantsDisplayUpdate = false;
    input = {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false,
    };

    tankState = {
        dir: 0,
        x: 0,
        y: 0,
        shootAfter: 0,
    };

    constructor(connection: WebSocket) {
        this.connection = connection;
    }

    send(msg: Message) {
        this.connection?.send(JSON.stringify(msg));
    }
}
