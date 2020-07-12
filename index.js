var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

SOCKET_LIST = {};
var players = {};
var chocoblasted = null;

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/chocoblast/index.html');
});

app.get('/helloworld', function(req, res) {
    res.sendFile(__dirname + '/chocoblast/helloworld.html');
});

app.use('/chocoblast', express.static(__dirname + '/chocoblast'));

console.log("Server started.");

io.sockets.on('connection', function(socket) {
    var playerId = handlePlayerConnection(socket);

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
        // delete players[playerId];
    });

});


function handlePlayerConnection(socket) {
    if (socket.request._query['player-id'] != null) {
        var playerId = socket.request._query['player-id'];
        if (players[playerId] != undefined) {
            reconnectPlayer(socket, players[playerId]);
            return playerId;
        } else {
            socket.disconnect('unauthorized');
        }
    } else {
        return createANewPlayer(socket);
    }
}

function reconnectPlayer(socket, player) {
    console.log("Player " + player.pseudo + " is reconnected");
    SOCKET_LIST[player.id] = socket;
    socket.emit('setPlayerId', player.id);
    socket.emit('pseudoSaved', player.pseudo);
    socket.emit('playerConnected');
}

function createANewPlayer(socket) {
    console.log("New player created");
    var playerId = Math.random();
    SOCKET_LIST[playerId] = socket;
    players[playerId] = { id: playerId, pseudo: 'anon', score: 0, move: null }
    socket.emit('setPlayerId', playerId);
    socket.emit('playerConnected');
    return playerId;
}

function changeChocoblasted() {
    let playerIdList = Object.keys(players);
    if (playerIdList.length > 1) {
        let chocoblastedId = playerIdList[Math.floor(Math.random() * playerIdList.length)];
        chocoblasted = players[chocoblastedId]
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