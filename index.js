var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/chocoblast/index.html');
});

app.get('/helloworld', function(req, res) {
    res.sendFile(__dirname + '/chocoblast/helloworld.html');
});

app.use('/chocoblast', express.static(__dirname + '/chocoblast'));


console.log("Server started.");

SOCKET_LIST = {};
var players = {};
var chocoblasted = null;

io.sockets.on('connection', function(socket) {

    console.log('new user!');
    var playerId = Math.random();
    SOCKET_LIST[playerId] = socket;
    players[playerId] = { id: playerId, pseudo: 'anon', score: 0, move: null }
    socket.emit('setPlayerId', playerId);

    // Refresh the list of player for each connected players
    refreshPlayerList();

    socket.on('setPseudo', function(data) {
        console.log('The player with ID : ' + playerId + ' is renamed "' + data + '"');
        players[playerId].pseudo = data;
        socket.emit('pseudoSaved', data);
        refreshPlayerList();
    });

    socket.on('disconnect', function() {
        delete SOCKET_LIST[playerId];
        delete players[playerId];
    });

});

function changeChocoblasted() {
    let playerIdList = Object.keys(players);
    if (playerIdList.length > 1) {
        let chocoblastedId = playerIdList[Math.floor(Math.random() * playerIdList.length)];
        let chocoblasted = players[chocoblastedId]
        console.log('The new chocoblasted is :' + chocoblasted.pseudo);
        broadcastToPlayers('changeChocoblasted', chocoblasted)
    } else {
        console.log('Not enough player to start the chocoblasting');
    }

}

function refreshPlayerList() {
    broadcastToPlayers('refreshPlayerList', players);
}

function broadcastToPlayers(msg, data) {
    for (var i in SOCKET_LIST) {
        SOCKET_LIST[i].emit(msg, data);
    }
}
server.listen(4141);

setInterval(function() {
    //Change the Chocoblasted every 10 seconds
    changeChocoblasted();
}, 10000);