import Display from './Display.js';
import PlayerManager from './PlayerManager';
import BulletsManager from './BulletsManager';
import Drawer from './Drawer.js';
import InteractionManager from './InteractionManager.js';
import Player from './Player.js';
import {Message} from "./Message.js";
import {WebSocket} from 'ws';

export default class TankServer {
    _display = new Display();
    _playerManager = new PlayerManager();
    _bullets = new BulletsManager(this._playerManager);
    _drawer = new Drawer(this._display, this._bullets, this._playerManager);
    _interactionManager = new InteractionManager(this._bullets, this._playerManager);

    constructor() {
        this._drawer.draw();
        setInterval(() => {
            this._interactionManager.tick();
            this._bullets.tick();
            this._playerManager.tick();
            this._drawer.draw();
        }, 1000 / 25);
    }

    onConnection(connection: WebSocket) {
        console.log('client connected');
        let player = new Player(connection);
        let self = this;

        function handleMessage(message: Message) {
            if (message.type === 'name') {
                player.name = message.value;
                player = self._playerManager.join(player);
                return;
            }

            if (message.type === 'input-on' || message.type === 'input-off') {
                if (!message.value)
                    throw new Error('message is missing value');

                if (!(message.value in player.input)) {
                    console.error('unknown input', message.value);
                    return;
                }

                player[message.value] = message.type === 'input-on';
                return;
            }

            console.log('unknown command', message.type);
        }

        function onMessage(message: string) {
            try {
                const parsedMessage = JSON.parse(message) as Message;
                console.log('received message', {parsedMessage, player: player.name});
                handleMessage(parsedMessage);
            } catch (e) {
                console.error('closing connection because of error', e)
                connection.close();
            }
        }

        function onClose() {
            player.connection = null;
            self._playerManager.leave(player);
        }

        connection.on('message', onMessage);
        connection.on('close', onClose);
    }
}
