// console.log('hello there');
const cors = require("cors");
const express = require("express");
// const { Socket } = require('socket.io');
const app = express();
const PORT = process.env.PORT || 5000;
const path = require("path");

app.use(cors());

const server = app.listen(PORT, () => {
  console.log(`server running on PORT : ${PORT}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

const onlinePlayers = {};
const playerStatus = {};
const inGame = {};

app.set("socketio", io);
io.on("connection", (socket) => {
  console.log("new socket connected", socket.id);
  socket.on("im-in", (obj) => {
    onlinePlayers[socket.id] = obj.playerName;
    playerStatus[socket.id] = false; // not in a battle
    io.to(socket.id).emit("getList", { onlinePlayers, playerStatus });
  });
  socket.on("refresh-list", (obj) => {
    console.log("refresh requets from ", obj.playerName);
    onlinePlayers[socket.id] = obj.playerName;
    io.to(obj.socketId).emit("refresh-list", { onlinePlayers, playerStatus });
  });

  socket.on("send-request", (obj) => {
    const requestInfo = {
      playerId: obj.from,
      playerName: onlinePlayers[obj.from],
    };
    if (playerStatus[obj.to] == false) {
      console.log("request sent");
      io.to(obj.to).emit("receive-request", requestInfo);
    } else console.log("already in a match");
  });

  socket.on("accept-request", (data) => {
    console.log("accept request", data);
    playerStatus[data.from] = true;
    playerStatus[data.to] = true;
    inGame[data.from] = data.to;
    io.to(data.from).emit("request-accepted", {
      playerId: data.to,
      playerName: onlinePlayers[data.to],
    });
    io.emit("refresh-list", { onlinePlayers, playerStatus });
  });

  socket.on("reject-request", (data) => {
    io.to(data.from).emit("request-rejected", {
      playerId: data.to,
      playerName: onlinePlayers[data.to],
    });
  });

  socket.on("opponent-move", ({ playerId, index }) => {
    console.log({ playerId, index });
    console.log("Opponent", onlinePlayers[playerId], index);
    io.to(playerId).emit("opponent-move", index);
  });

  // {from : request, to : socket.id});

  socket.on("exit-game", (data) => {
    playerStatus[data.from] = false;
    playerStatus[data.to] = false;
    if (inGame[data.from]) delete inGame[data.from];
    else if (inGame[data.to]) delete inGame[data.to];
    io.to(data.to).emit("exit-game", {
      playerId: data.from,
      playerName: onlinePlayers[data.from],
    });
    io.emit("refresh-list", { onlinePlayers, playerStatus });
  });

  socket.on("tie", ({ from, to }) => {
    io.to(to).emit("tie");
  });

  socket.on("won", ({ from, to }) => {
    io.to(to).emit("won");
  });

  socket.on("disconnect", () => {
    console.log(socket.id, "disconnected");
    delete onlinePlayers[socket.id];
    delete playerStatus[socket.id];
    socket.broadcast.emit("player-left", {
      playerId: socket.id,
      playerName: onlinePlayers[socket.id],
    });
    let ele = inGame[socket.id];
    if (ele) {
      console.log(
        onlinePlayers[socket.id],
        " left during a match with ",
        onlinePlayers[ele]
      );
      playerStatus[ele] = false;
      delete inGame[socket.id];
      io.to(ele).emit("exit-game", {
        playerId: socket.id,
        playerName: onlinePlayers[socket.id],
      });
    } else {
      const keyArray = Object.keys(inGame);
      ele = keyArray.find((x) => inGame[x] === socket.id);
      if (ele) {
        console.log(
          onlinePlayers[socket.id],
          " left during a match with ",
          onlinePlayers[ele]
        );
        playerStatus[ele] = false;
        delete inGame[ele];
        io.to(ele).emit("exit-game", {
          playerId: socket.id,
          playerName: onlinePlayers[socket.id],
        });
      }
    }
    io.emit("refresh-list", { onlinePlayers, playerStatus });
  });
});

if (process.env.NODE_ENV == "production") {
  app.use(express.static("T3/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "T3", "build", "index.html"));
  });
}
