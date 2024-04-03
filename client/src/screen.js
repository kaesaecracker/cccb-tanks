import './screen.css';

const screenDiv = document.querySelector('#screen');

if (!screenDiv)
    throw new Error('required element not found');

export const renderPixelString = (pixels) => {
    console.log(`length: ${pixels.length}`);
    screenDiv.replaceChildren(... [...pixels].map(pixel => {
        const newNode = document.createElement('div');
        newNode.setAttribute('class', `pixel ${pixel === '1' ? 'on' : 'off'}`);
        return newNode;
    }));
};
