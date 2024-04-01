import Display from './Display.js';
import PlayerManager from './PlayerManager.js';
import BulletsManager from './BulletsManager.js';
import Drawer from './Drawer.js';
import InteractionManager from './InteractionManager.js';

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
        let player = {connection};
        let self = this;

        function onMessage(message) {
            console.log('received message:', message);
            message = JSON.parse(message);
            switch (message.type) {
            case 'input-on':
                player.input[message.value] = true;
                break;
            case 'input-off':
                player.input[message.value] = false;
                break;
            case 'name':
                player.name = message.value;
                self._playerManager.join(player);
                break;
            }
        }

        function onClose() {
            if (player)
                self._playerManager.leave(player);
        }

        connection.on('message', onMessage);
        connection.on('close', onClose);
    }
}
