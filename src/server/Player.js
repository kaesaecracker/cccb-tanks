export default class Player {
    connection;
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
        this.connection = connection;
    }
}
