import {clearScreen} from "./display.js";
import {addPlayer, removePlayer, shootBullet, tickPlayers} from "./players.js";
import {tickBullets} from "./bullets.js";
import {drawToCanvas} from "./drawer.js";

let _uid = 0;

function uniqueID() {
    return _uid++
}

function onMessage(player, message) {
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
}

function onClose(player) {
    console.log("user left")
    if (player)
        removePlayer(player.id)
}

export function onConnection(client) {
    let player
    client.on('message', message => onMessage(player, message))
    client.on('close', () => onClose(player))
}

function tick() {
    tickPlayers()
    tickBullets()
    drawToCanvas()
}

export function start() {
    clearScreen()
    drawToCanvas();
    setInterval(tick, 1000 / 25);
}
