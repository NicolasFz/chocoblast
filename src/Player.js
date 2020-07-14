class Player {
    constructor(socket, pseudo) {
        this.socket = socket;
        this.id = Math.random();
        this.pseudo = pseudo;
    }
}
module.exports = Player;