// console.log('hello there');
const cors = require('cors');
const express = require('express');
// const { Socket } = require('socket.io');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.get('/', (req, res)=>{
    res.send('<b>hello its, Atif</b>');
})

const server = app.listen(PORT, ()=>{
    console.log(`server running on PORT : ${PORT}`);
});

const io = require('socket.io')(server, {
    cors : {
        origin : ['http://localhost:3000']
    },
});

const onlinePlayers = {};
const playerStatus = {};
const inGame = {};

app.set('socketIO', io);
    io.on("connection", (socket) => {
        
        console.log('new socket connected', socket.id);
        socket.on("im-in", obj => {
            onlinePlayers[socket.id] = obj.playerName;
            playerStatus[socket.id] = false;     // not in a battle
            io.to(socket.id).emit("getList", {onlinePlayers, playerStatus});
        });
        socket.on("refresh-list", obj => {
            console.log('refresh requets from ', obj.playerName);
            onlinePlayers[socket.id] = obj.playerName;
            io.to(obj.socketId).emit("refresh-list", {onlinePlayers, playerStatus});
        });


    socket.on("send-request", obj => {
        const requestInfo = {playerId : obj.from, playerName : onlinePlayers[obj.from]};
        if(playerStatus[obj.to] == false){
            console.log('request sent');
            io.to(obj.to).emit("receive-request", requestInfo);
        }
        else
        console.log('already in a match');
    });

    socket.on("accept-request", (data)=>{
        console.log('accept request',data);
        playerStatus[data.from] = true; 
        playerStatus[data.to] = true; 
        io.to(data.from).emit("request-accepted", {playerId : data.to, playerName : onlinePlayers[data.to]});
        io.emit("refresh-list", {onlinePlayers, playerStatus});
    });

    socket.on("reject-request", (data)=>{
        io.to(data.from).emit("request-rejected", {playerId : data.to, playerName : onlinePlayers[data.to]});
    });

    socket.on("opponent-move", ({playerId, index})=> {
        console.log({playerId, index});
        console.log('Opponent',onlinePlayers[playerId], index);
        io.to(playerId).emit("opponent-move", index);
    });

        // {from : request, to : socket.id});

        socket.on("exit-game", data => {
            playerStatus[data.from] = false;
            playerStatus[data.to] = false;
            io.to(data.to).emit("exit-game", {playerId : data.from, playerName : onlinePlayers[data.from]});
            io.emit("refresh-list", {onlinePlayers, playerStatus});
        });

    socket.on("tie", ({from, to}) => {
        io.to(to).emit("tie");
    });

    socket.on("won", ({from, to}) => {
        io.to(to).emit("won");        
    });


    socket.on("disconnect", ()=>{
        console.log(socket.id, 'disconnected');
        socket.broadcast.emit('player-left', {playerId : socket.id, playerName : onlinePlayers[socket.id]});
        let ele = inGame[socket.id];
        if(ele){
            playerStatus[ele] = false;
            io.to(ele).emit("exit-game", {playerId : socket.id, playerName : onlinePlayers[socket.id]});
        }
        else{
            const keyArray = Object.keys(inGame);
            ele = keyArray.find( x => inGame[x] === socket.id);
            if(ele){
                playerStatus[ele] = false;
                io.to(ele).emit("exit-game", {playerId : socket.id, playerName : onlinePlayers[socket.id]});
            }
        }
        delete onlinePlayers[socket.id];
        delete playerStatus[socket.id];
    });
});