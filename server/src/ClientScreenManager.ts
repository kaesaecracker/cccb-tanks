import {WebSocket} from 'ws';

export default class ClientScreenManager {
    private _connections: ScreenConnection[] = [];

    send(pixels: Uint8Array) {
        for (const c of this._connections)
            c.send(pixels);
    }

    addClient(connection: WebSocket) {
        const sc = new ScreenConnection(connection);
        connection.onclose = () =>{
            const index = this._connections.indexOf(sc);
            if (index >= 0)
                this._connections.splice(index, 1);
        };
        this._connections.push(sc);
    }
}

function arraysEqual(a: Uint8Array | null, b: Uint8Array | null) {
    if (a === null || b === null)
        return false;
    if (a.length != b.length)
        return false;
    for (const [index, aValue] of a.entries()) {
        if (aValue !== b[index])
            return false;
    }
    return true;
}

class ScreenConnection {
    private _socket: WebSocket;
    private _wantsNewFrame: boolean = true;
    private _lastSeenFrame: Uint8Array = new Uint8Array();

    constructor(socket: WebSocket) {
        this._socket = socket;
        this._socket.onmessage = () => this._wantsNewFrame = true;
    }

    send(pixels: Uint8Array){
        if (!this._wantsNewFrame)
            return;

        // do not send pixels if not needed
        if (arraysEqual(pixels, this._lastSeenFrame))
            return;

        this._wantsNewFrame = false;
        this._lastSeenFrame = pixels;

        this._socket.send(pixels);
    }
}
