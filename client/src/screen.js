import './screen.css';

const screenDiv = document.querySelector('#screen');
if (!screenDiv)
    throw new Error('required element not found');

const drawContext = screenDiv.getContext('2d');
if (drawContext === null)
    throw new Error('cannot get 2d context');

const pixelsPerRow = 44 * 8;
const rows = 160;

export const renderPixelString = (pixels) => {
    console.log(`length: ${pixels.length}`);

    for (let y = 0; y < rows; y++) {
        const rowStartIndex = y * pixelsPerRow;

        for (let x = 0; x < pixelsPerRow; x++) {
            const pixel = pixels.at(rowStartIndex + x);
            drawContext.fillStyle = pixel === '1' ? 'green' : 'darkgrey';
            drawContext.fillRect(x, y, 1, 1);
        }
    }
};
