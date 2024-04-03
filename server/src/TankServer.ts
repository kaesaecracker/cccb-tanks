import Display from './Display';
import PlayerManager from './PlayerManager';
import BulletsManager from './BulletsManager';
import Drawer from './Drawer';
import InteractionManager from './InteractionManager';
import Player from './Player';
import {Message} from './Message';
import {WebSocket} from 'ws';
import {serverSettings} from './settings';
import ClientScreenManager from './ClientScreenManager';


export default class TankServer {
    private _display = new Display();
    private _playerManager = new PlayerManager();
    private _bullets = new BulletsManager(this._playerManager);
    private _drawer = new Drawer(this._display, this._bullets, this._playerManager);
    private _interactionManager = new InteractionManager(this._bullets, this._playerManager);
    private _idleAfter = Date.now();
    private _clientScreenManager: ClientScreenManager;

    constructor(clientScreenManager: ClientScreenManager) {
        this._clientScreenManager = clientScreenManager;
        setInterval(this._onTick, 1000 / 25);
    }

    private _onTick = () => {
        if (this._idleAfter < Date.now())
            return;

        this.logicPhase();
        this.graphicsPhase();
    };

    onConnection(connection: WebSocket) {
        console.log('client connected');
        let player = new Player(connection);

        const handleMessage = (message: Message) => {
            this._idleAfter = Date.now() + (serverSettings.idleTimeoutMinutes * 60 * 1000);

            if (message.type === 'name') {
                player.name = message.value;
                player = this._playerManager.join(player);
                return;
            }

            if (message.type === 'input-on' || message.type === 'input-off') {
                if (!message.value)
                    throw new Error('message is missing value');

                if (!(message.value in player.input)) {
                    console.error('unknown input', message.value);
                    return;
                }

                // @ts-expect-error we checked in the line above and input only contains booleans
                player.input[message.value] = message.type === 'input-on';
                return;
            }

            console.log('unknown command', message.type);
        };

        const onMessage = (message: string) => {
            try {
                const parsedMessage = JSON.parse(message) as Message;
                console.log('received message', {parsedMessage, player: player.name});
                handleMessage(parsedMessage);
            } catch (e) {
                console.error('closing connection because of error', e);
                connection.close();
            }
        };

        const onClose = () => {
            player.connection = null;
            this._playerManager.leave(player);
        };

        connection.on('message', onMessage);
        connection.on('close', onClose);
    }

    private logicPhase() {
        this._interactionManager.tick();
        this._bullets.tick();
        this._playerManager.tick();
    }

    private graphicsPhase = () => {
        const nextPixels = this._display.createPixelBuffer();
        this._drawer.draw(nextPixels);

        this._display.send(nextPixels);
        this._clientScreenManager.send(nextPixels);
    };
}
