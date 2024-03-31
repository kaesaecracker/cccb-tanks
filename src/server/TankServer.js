import Display from "./Display.js";
import PlayerManager from "./PlayerManager.js";
import BulletsManager from "./BulletsManager.js";
import Drawer from "./Drawer.js";

export default class TankServer {
    _uid = 0;
    _display = new Display()
    _playerManager = new PlayerManager()
    _bullets = new BulletsManager(this._playerManager)
    _drawer = new Drawer(this._display, this._bullets, this._playerManager)

    constructor() {
        this._drawer.draw();
        setInterval(() => {
            this._playerManager.tick()
            this._bullets.tick()
            this._drawer.draw()
        }, 1000 / 25);
    }

    onConnection(client) {
        console.log('client connected')

        let player
        const id = this._uid++

        let self = this;

        function onMessage(message) {
            console.log('received: %s', message)
            message = JSON.parse(message)
            switch (message.type) {
                case 'input-on':
                    if (message.value === 'space')
                        self._bullets.shootBullet(player)
                    else
                        player.input[message.value] = true
                    break
                case 'input-off':
                    player.input[message.value] = false
                    break
                case 'name':
                    player = self._playerManager.addPlayer(id, message.value, client)
                    break
            }
        }

        function onClose() {
            if (player)
                self._playerManager.removePlayer(player.id)
        }

        client.on('message', onMessage)
        client.on('close', onClose)
    }
}
