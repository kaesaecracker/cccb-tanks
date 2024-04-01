const body = document.querySelector('body');
const splash = document.querySelector('.splash');

splash.addEventListener('transitionend', function () {
    body.classList.remove('was-killed');
});

const connection = new WebSocket(`ws://${window.location.hostname}:3000`);
connection.binaryType = 'blob';

connection.onmessage = function (message) {
    message = JSON.parse(message.data);
    console.log('got message', {message});
    if (message.type === 'shot')
        body.classList.add('was-killed');
};

connection.onerror = event => {
    console.log('error', event)
    alert('connection error')
}

connection.onclose = event => {
    console.log('closed', event)
    alert('connection closed - maybe a player with this name is already connected')
}

const keyEventListener = (type) => (event) => {
    if (event.defaultPrevented)
        return;

    const controls = {
        'ArrowLeft': 'left',
        'ArrowUp': 'up',
        'ArrowRight': 'right',
        'ArrowDown': 'down',
        'Space': 'shoot',
        'KeyW': 'up',
        'KeyA': 'left',
        'KeyS': 'down',
        'KeyD': 'right',
    };

    const value = controls[event.code];
    if (!value)
        return;

    send({type, value});
};

connection.onopen = () => {
    let name = getPlayerName();
    send({type: 'name', value: name});

    window.onkeyup = keyEventListener('input-off');
    window.onkeydown = keyEventListener('input-on');

    console.log('connection opened, game ready');
};

function getPlayerName() {
    let name = '';
    while (!name)
        name = prompt('Player Name');
    return name;
}

function send(obj) {
    connection.send(JSON.stringify(obj));
}
