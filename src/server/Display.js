import {displaySettings, mapHeight, mapWidth, tileSize} from "./settings.js";
import dgram from 'dgram';

export default class Display {
    _client = dgram.createSocket('udp4');

    width = tileSize * mapWidth;
    height = tileSize * mapHeight;

    pixels = new Uint8Array(this.width * this.height);

    constructor() {
        this._clearScreen()
    }

    sendPixels() {
        const packedBytes = new Buffer(10 + this.pixels.length / 8);

        packedBytes[0] = 0
        packedBytes[1] = 19
        packedBytes[2] = 0
        packedBytes[3] = 0
        packedBytes[4] = 0
        packedBytes[5] = 0
        packedBytes[6] = mapWidth / 256
        packedBytes[7] = mapWidth % 256
        packedBytes[8] = this.height / 256
        packedBytes[9] = this.height % 256

        for (let i = 0, n = 10, l = this.pixels.length; i < l; n++) {
            let sum = 0;

            for (let j = 128; j > 0; j = (j >> 1)) {
                sum += this.pixels[i++] ? j : 0;
            }
            packedBytes[n] = sum;
        }

        this._client.send(packedBytes, 0, packedBytes.length, displaySettings.port, displaySettings.ip);
    }

    placeText(text, x, y, width, height) {
        const packedBytes = new Buffer(10 + text.length);

        packedBytes[0] = 0
        packedBytes[1] = 3
        packedBytes[2] = x / 256
        packedBytes[3] = x % 256
        packedBytes[4] = y / 256
        packedBytes[5] = y % 256
        packedBytes[6] = width / 256
        packedBytes[7] = width % 256
        packedBytes[8] = height / 256
        packedBytes[9] = height % 256

        for (let i = 0, n = 10; i < text.length; n++) {
            packedBytes[n] = text.charCodeAt(i++);
        }


        this._client.send(packedBytes, 0, packedBytes.length, displaySettings.port, displaySettings.ip);
    }

    _clearScreen() {
        const buffer = new Buffer(2);
        buffer[0] = 0
        buffer[1] = 2
        this._client.send(buffer, 0, 2, displaySettings.port, displaySettings.ip);
    }

    clearCanvas() {
        this.pixels = new Uint8Array(this.width * this.height)
    }
}
