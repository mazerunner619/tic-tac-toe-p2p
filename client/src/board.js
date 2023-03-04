import SocketClient from "socket.io-client";
import React, { useState, useEffect } from "react";
import { Row, Col, Container } from "react-bootstrap";
import { Button } from "@material-ui/core";
import "./App.css";
import RequestModal from "./requestModal";
import { checkboxClasses } from "@mui/material";
import { keys } from "@mui/system";
import AlertMessage from "./Alerts";
import { HiRefresh } from "react-icons/hi";
import { FcRefresh } from "react-icons/fc";

let socket;

export default function Board() {
  const [landing, setLanding] = useState("block");
  const [turn, setTurn] = useState(false);
  const [count, setCount] = useState(0);
  const [mark, setMark] = useState(new Array(9).fill(""));
  const [playerA, setplayerA] = useState(0);
  const [playerB, setplayerB] = useState(0);
  const [tie, setTie] = useState(0);
  const [D1, setD1] = useState(true);
  const [D2, setD2] = useState(false);
  const [D3, setD3] = useState(false);
  // to signify , if the player maked the 1st turn    => mark X
  const [one, setOne] = useState(false);
  const [result, setResult] = useState("the battle is on ...");
  //to poput game play request
  const [popup, setPopup] = useState(false);
  const [nameA, setNameA] = useState("");
  const [opponent, setOpponent] = useState({
    id: null,
    name: null,
  });

  const avatar1 = "❌";
  const avatar2 = "⭕";

  const [alertMessage, setAlertMessage] = useState({
    open: false,
    message: "",
    severity: "", // error warning information success
  });
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  function reset() {
    setTurn(false);
    setCount(0);
    setMark(new Array(9).fill(""));
    setplayerA(0);
    setplayerB(0);
    setTie(0);
    setD1(false);
    setD2(true);
    setD3(false);
    setOne(false);
    setResult("the battle is on ...");
    setPopup(false);
    setOpponent({
      id: null,
      name: null,
    });
  }

  // let onlinePlayers = [];

  useEffect(() => {
    setTimeout(() => setLanding("none"), 3000);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("getList", ({ onlinePlayers, playerStatus }) => {
        for (const key in onlinePlayers) {
          if (key !== socket.id)
            setOnlinePlayers((player) => [
              ...player,
              {
                playerId: key,
                playerName: onlinePlayers[key],
                playerStatus: playerStatus[key],
              },
            ]);
        }
      });

      socket.on("refresh-list", ({ onlinePlayers, playerStatus }) => {
        // console.log('Atif', onlinePlayers, playerStatus)
        setOnlinePlayers([]);
        for (const key in onlinePlayers) {
          if (key !== socket.id)
            setOnlinePlayers((player) => [
              ...player,
              {
                playerId: key,
                playerName: onlinePlayers[key],
                playerStatus: playerStatus[key],
              },
            ]);
        }
      });
      socket.on("request-accepted", (data) => {
        setAlertMessage({
          open: true,
          message: `${data.playerName} accepted your challenge`,
          severity: "success",
        });
        setOne(true);
        setTurn(true);
        setCount(0);
        setD3(true);
        setD2(false);
      });

      socket.on("request-rejected", (data) => {
        setAlertMessage({
          open: true,
          message: `${data.playerName} declined to accept your challenge`,
          severity: "error",
        });
        // console.log(data.playerName+' rejected your request');
        setOpponent({ id: null, name: null });
        //waiting over
      });
      socket.on("receive-request", (data) => {
        setAlertMessage({
          open: true,
          message: `${data.playerName} wants to challenge you`,
          severity: "information",
        });
        setOpponent({ id: data.playerId, name: data.playerName });
        setPopup(true);
      });
      socket.on("player-left", (data) => {
        // let ind = onlinePlayers.findIndex(x=>x.playerId === data.playerId );
        setOnlinePlayers(
          onlinePlayers.filter((item) => item.playerId !== data.playerId)
        );
      });

      //data here is index of the 9x9 box
      socket.on("opponent-move", (data) => {
        mark[data] = one ? avatar2 : avatar1;
        setTurn(true);
      });

      socket.on("tie", () => {
        setAlertMessage({
          open: true,
          message: "impressive !.... a TIE",
          severity: "information",
        });
        setTie((prev) => prev + 1);
        setTurn(true);
        setOne(true);
        setCount(0);
        setMark(new Array(9).fill(""));
      });

      socket.on("won", () => {
        setAlertMessage({
          open: true,
          message: "you lost !",
          severity: "warning",
        });
        setMark(new Array(9).fill(""));
        setTurn(false);
        setOne(false);
        setplayerB((prev) => prev + 1);
        setCount(0);
      });

      socket.on("exit-game", (data) => {
        setAlertMessage({
          open: true,
          message: `opponent left !`,
          severity: "error",
        });
        reset();
      });
      return () => socket.off();
    }
  });

  function refreshList() {
    console.log("refresh requested");
    socket.emit("refresh-list", { socketId: socket.id, playerName: nameA });
  }

  function exitGame(e) {
    setAlertMessage({
      open: true,
      message: `you left the game `,
      severity: "warning",
    });
    reset();
    socket.emit("exit-game", { from: socket.id, to: opponent.id });
  }
  function acceptRequest() {
    setPopup(false);
    setTurn(false);
    setOne(false);
    setD3(true);
    setD2(false);
    socket.emit("accept-request", { from: opponent.id, to: socket.id });
  }
  function rejectRequest() {
    setPopup(false);
    setOpponent({ id: null, name: null });
    socket.emit("reject-request", { from: opponent.id, to: socket.id });
  }
  //to = {playerId, playerName}
  function sendRequest(to) {
    setAlertMessage({
      open: true,
      message: `request sent to ${to.playerName}`,
      severity: "success",
    });
    socket.emit("send-request", { from: socket.id, to: to.playerId });
    setOpponent({ id: to.playerId, name: to.playerName });
  }

  function enterTheGame() {
    if (nameA) {
      // socket = SocketClient('http://localhost:5000/');
      socket = SocketClient("https://tictactoe-6avf.onrender.com/", {
        transports: ["websocket"],
      });
      socket.on("connect", () => {
        socket.emit("im-in", { playerName: nameA });
      });
      setD1(false);
      setD3(false);
      setD2(true);
    }
  }

  function checkResult() {
    const myChar = one ? avatar1 : avatar2;
    if (
      (mark[0] === myChar && mark[1] === myChar && mark[2] === myChar) ||
      (mark[3] === myChar && mark[4] === myChar && mark[5] === myChar) ||
      (mark[6] === myChar && mark[7] === myChar && mark[8] === myChar) ||
      (mark[0] === myChar && mark[3] === myChar && mark[6] === myChar) ||
      (mark[1] === myChar && mark[4] === myChar && mark[7] === myChar) ||
      (mark[2] === myChar && mark[5] === myChar && mark[8] === myChar) ||
      (mark[0] === myChar && mark[4] === myChar && mark[8] === myChar) ||
      (mark[2] === myChar && mark[4] === myChar && mark[6] === myChar)
    ) {
      setAlertMessage({
        open: true,
        message: "you won !",
        severity: "success",
      });
      setplayerA((prev) => prev + 1);
      setTurn(true);
      setOne(true);
      socket.emit("won", { from: socket.id, to: opponent.id });
      setCount(0);
      setMark(new Array(9).fill(""));
      return true;
    }
    return false;
  }

  async function makeMove(boxNo) {
    if (turn && mark[boxNo] === "") {
      setTurn(false);
      if (one) {
        // setTurn(false);
        mark[boxNo] = avatar1;
        if (checkResult()) return;
        setCount((prev) => prev + 1);
        if (count === 4) {
          setCount(0);
          setOne(false);
          // setTurn(false);
          setTie((prev) => prev + 1);
          setMark(new Array(9).fill(""));
          setAlertMessage({
            open: true,
            message: "impressive !.... a TIE",
            severity: "information",
          });
          socket.emit("tie", { from: socket.id, to: opponent.id });
          return;
        }
        socket.emit("opponent-move", { playerId: opponent.id, index: boxNo });
      } else {
        // setTurn(false);
        mark[boxNo] = avatar2;
        if (checkResult()) {
          return;
        }
        socket.emit("opponent-move", { playerId: opponent.id, index: boxNo });
      }
    }
  }

  return (
    <div>
      <div className="landing" style={{ display: landing }}>
        <div>LET'S TIC-TAC-TOE</div>
      </div>

      <div className="contents" style={{ display: !landing }}>
        <form className="nameInput" style={{ display: D1 ? "block" : "none" }}>
          <input
            id="A"
            className="entry-field"
            autoComplete="off"
            name="playerA"
            type="text"
            placeholder="your name"
            required
            onChange={(e) => setNameA(e.target.value)}
          />
          <Button
            variant="contained"
            className="startButton"
            color="secondary"
            onClick={enterTheGame}
            id="battle-button"
          >
            Battle
          </Button>
        </form>

        <div className="heading">Tic Tac Toe</div>
        <div
          className="onlinePlayers"
          style={{ display: D2 ? "block" : "none" }}
        >
          <Container>
            {!onlinePlayers.length ? (
              <div
                style={{
                  color: "green",
                  fontFamily: "fantasy",
                  fontSize: "200%",
                  margin: "0 auto",
                }}
              >
                no one is online.....
              </div>
            ) : (
              onlinePlayers.map((to) => (
                <div className="player-list">
                  <div className="player-name">{to.playerName}</div>
                  <div
                    className="player-status"
                    style={{ background: to.playerStatus ? "red" : "green" }}
                    onClick={() => {
                      if (to.playerStatus) return;
                      sendRequest(to);
                    }}
                  >
                    {to.playerStatus === false ? "challenge" : "in a match"}
                  </div>
                </div>
              ))
            )}
          </Container>

          <div className="refresh-button" onClick={refreshList}>
            <FcRefresh />
            Refresh
          </div>
          {/* </div> */}
        </div>

        <div className="myboard" style={{ display: D3 ? "block" : "none" }}>
          <div className="container" style={{ fontSize: "" }}>
            <div className="item" onMouseDown={() => makeMove(0)}>
              <div>{mark[0]}</div>
            </div>
            <div className="item" onMouseDown={() => makeMove(1)}>
              <div>{mark[1]}</div>
            </div>
            <div className="item" onMouseDown={() => makeMove(2)}>
              <div>{mark[2]}</div>
            </div>
            <div className="item" onMouseDown={() => makeMove(3)}>
              <div>{mark[3]}</div>
            </div>
            <div className="item" onMouseDown={() => makeMove(4)}>
              <div>{mark[4]}</div>
            </div>
            <div className="item" onMouseDown={() => makeMove(5)}>
              <div>{mark[5]}</div>
            </div>
            <div className="item" onMouseDown={() => makeMove(6)}>
              <div>{mark[6]}</div>
            </div>
            <div className="item" onMouseDown={() => makeMove(7)}>
              <div>{mark[7]}</div>
            </div>
            <div className="item" onMouseDown={() => makeMove(8)}>
              <div>{mark[8]}</div>
            </div>
          </div>
        </div>
        <div className="pointsT" style={{ display: D3 ? "block" : "none" }}>
          <h2>{turn ? "Your turn" : `${opponent.name}'s Turn`}</h2>
          <h3 style={{ color: "green" }}>
            {nameA} {playerA}
          </h3>
          {/* <br/> */}
          <h3 style={{ color: "red" }}>
            {opponent.name} {playerB}{" "}
          </h3>
          {/* <br/> */}
          <h3 style={{ color: "orange" }}>Ties {tie}</h3>
          <Button variant="outlined" color="success" onClick={exitGame}>
            Exit Game
          </Button>
          <p>{result}</p>
        </div>
        <br />
        <RequestModal
          from={opponent}
          show={popup}
          onHide={() => setPopup(false)}
          onAccept={acceptRequest}
          onReject={rejectRequest}
        />

        <AlertMessage
          open={alertMessage.open}
          message={alertMessage.message}
          severity={alertMessage.severity}
          onClose={() => setAlertMessage({ ...alertMessage, open: false })}
        />
      </div>
    </div>
  );
}
