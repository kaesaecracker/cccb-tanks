import './screen.css';

const screenDiv = document.querySelector('#screen');
if (!screenDiv)
    throw new Error('required element not found');

const drawContext = screenDiv.getContext('2d');
if (drawContext === null)
    throw new Error('cannot get 2d context');

const connection = new WebSocket(`ws://${window.location.hostname}:3000/screen`);
connection.binaryType = 'arraybuffer';

const pixelsPerRow = 44 * 8;
const rows = 160;
connection.onmessage = function (message) {
    const pixels = new Uint8Array(message.data);

    for (let y = 0; y < rows; y++) {
        const rowStartIndex = y * pixelsPerRow;

        for (let x = 0; x < pixelsPerRow; x++) {
            const pixel = pixels[rowStartIndex + x];
            drawContext.fillStyle = pixel === 1 ? 'green' : 'darkgrey';
            drawContext.fillRect(x, y, 1, 1);
        }
    }

    connection.send('');
};

