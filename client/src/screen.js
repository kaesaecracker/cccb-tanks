import './screen.css';

const canvas = document.querySelector('#screen');
if (!canvas)
    throw new Error('required element not found');

const drawContext = canvas.getContext('2d');
if (drawContext === null)
    throw new Error('cannot get 2d context');

const connection = new WebSocket(`ws://${window.location.hostname}:3000/screen`);
connection.binaryType = 'arraybuffer';

connection.onerror = console.log;
connection.onclose = console.log;

connection.onmessage = function (message) {
    const pixels = new Uint8Array(message.data);
    const imageData = drawContext.getImageData(0, 0, canvas.width, canvas.height, {colorSpace: 'srgb'});
    const data = imageData.data;

    for (let i = 0; i < canvas.width * canvas.height; i++) {
        const pixel = pixels[i];
        const dataIndex = 4 * i;

        if (pixel === 0) {
            data[dataIndex] = 0; // r
            data[dataIndex + 1] = 0; // g
            data[dataIndex + 2] = 0; // b
            data[dataIndex + 3] = 255; // a
        } else {
            data[dataIndex] = 255; // r
            data[dataIndex + 1] = 255; // g
            data[dataIndex + 2] = 255; // b
            data[dataIndex + 3] = 255; // a
        }

    }

    drawContext.putImageData(imageData, 0, 0);
    connection.send('');
};

