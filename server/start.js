import {WebSocketServer} from "ws";
import {clearScreen} from "./display.js";
import {addPlayer, removePlayer, shootBullet, tickPlayers} from "./players.js";
import {tickBullets} from "./bullets.js";
import {drawToCanvas} from "./drawer.js";

clearScreen()

// Server for clients
const server = new WebSocketServer({port: 8001});
let _uid = 0;

function uniqueID() {
    return _uid++
}

server.on('connection', function connection(client) {
    let player

    client.on('message', function incoming(message) {
        console.log('received: %s', message)

        message = JSON.parse(message)
        switch (message.type) {
            case 'input-on':
                if (message.value === 'space')
                    shootBullet(player)
                else
                    player.input[message.value] = true
                break
            case 'input-off':
                player.input[message.value] = false
                break
            case 'name':
                player = addPlayer(uniqueID(), message.value, client)
                break
        }
    })

    client.on('close', function leaving() {
        console.log("user left")
        if (player)
            removePlayer(player.id)
    })
})


function tick() {
    tickPlayers()
    tickBullets()
    drawToCanvas()
}

drawToCanvas();

setInterval(tick, 1000 / 25);
