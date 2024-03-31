const body = document.querySelector('body');
const splash = document.querySelector('.splash');

function getShot() {
    body.classList.add('was-killed')
}

splash.addEventListener('transitionend', function () {
    console.log("transitionend")
    body.classList.remove('was-killed')
})

const connection = new WebSocket(`ws://${window.location.hostname}:3000`);
connection.binaryType = "blob"

const controls = {
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    32: "space",
    87: "up", // 'w'
    65: "left", // 'a'
    83: "down", // 's'
    68: "right", // 'd'
};

function start() {
    window.onkeyup = function (event) {
        if (controls[event.keyCode]) {
            connection.send(JSON.stringify({
                type: 'input-off',
                value: controls[event.keyCode]
            }))
        }
    }
    window.onkeydown = function (event) {
        if (controls[event.keyCode]) {
            connection.send(JSON.stringify({
                type: 'input-on',
                value: controls[event.keyCode]
            }))
        }
    }
}

connection.onmessage = function (message) {
    message = JSON.parse(message.data)

    console.log(message)

    if (message.type === 'shot')
        getShot()
}

connection.onopen = function () {
    let name = "";

    while (!name)
        name = prompt("Player Name")

    connection.send(JSON.stringify({
        type: 'name',
        value: name
    }))
    start()
}
