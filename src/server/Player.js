export default class Player{
    _connection;
    score = 0;
    respawnAfter = 0;
    input = {
        up: false,
        down: false,
        left: false,
        right: false,
        shoot: false
    };
    name;
    shootAfter = 0;

    constructor(connection) {
        this._connection = connection;
    }
}
