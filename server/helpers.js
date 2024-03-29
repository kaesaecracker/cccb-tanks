
export function randomElem(ar) {
    return ar[Math.floor(Math.random() * ar.length)];
}

export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
