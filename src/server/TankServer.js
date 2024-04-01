import Display from './Display.js';
import PlayerManager from './PlayerManager.js';
import BulletsManager from './BulletsManager.js';
import Drawer from './Drawer.js';
import InteractionManager from './InteractionManager.js';
import Player from './Player.js';

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

    onConnection(connection) {
        console.log('client connected');
        let player = new Player(connection);
        let self = this;

        function onMessage(message) {
            message = JSON.parse(message);
            console.log('received message', {message, player: player.name});
            switch (message.type) {
            case 'input-on':
                player.input[message.value] = true;
                break;
            case 'input-off':
                player.input[message.value] = false;
                break;
            case 'name':
                player.name = message.value;
                try {
                    player = self._playerManager.join(player);
                } catch (e) {
                    connection.close();
                }

                break;
            default:
                console.log('unknown command', message);
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
