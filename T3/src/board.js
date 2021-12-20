import SocketClient from 'socket.io-client'
import React , { useState , useEffect } from 'react'
import {Row, Col, Container} from 'react-bootstrap'
import { Button } from '@material-ui/core'
import './App.css';
import RequestModal from './requestModal'
import { checkboxClasses } from '@mui/material';
import { keys } from '@mui/system';

let socket;

export default function Board(){
    const [turn, setTurn] = useState(false);
    const [count, setCount] = useState(0); 
    const [mark, setMark] = useState(new Array(9).fill(""));
    const [playerA,setplayerA] = useState(0);
    const [playerB,setplayerB] = useState(0);
    const [tie,setTie] = useState(0);
    const [D1 , setD1] = useState(true);
    const [D2 , setD2] = useState(false);
    const [D3 , setD3] = useState(false);
    // to signify , if the player maked the 1st turn    => mark X
    const [one, setOne] = useState(false);
    const [result, setResult] = useState("the battle is on ...");
    //to poput game play request
    const [popup,setPopup] = useState(false);
    const [nameA , setNameA] = useState("");
    const [opponent, setOpponent] =  useState({
        id : null,
        name : null
    }); 

    const [onlinePlayers, setOnlinePlayers] = useState([]);
    function reset(){
        setTurn(false);
        setCount(0);
        setMark(new Array(9).fill(""));
        setplayerA(0);
        setplayerB(0);
        setTie(0);
        setD1(true);
        setD2(false);
        setD3(false);
        setOne(false);
        setResult("the battle is on ...");
        setPopup(false);
        setOpponent({
            id : null,
            name : null
        }); 
    }

 
    // let onlinePlayers = [];

    useEffect(() => {
        if(socket){
            socket.on('getList', ({onlinePlayers, playerStatus}) => {
                for (const key in onlinePlayers) {
                    if(key !== socket.id)
                    setOnlinePlayers((player) => [...player, {playerId : key, playerName : onlinePlayers[key], playerStatus : playerStatus[key]}]);
                }
            });

            socket.on('refresh-list', ({onlinePlayers, playerStatus}) => {
                console.log('Atif', onlinePlayers, playerStatus)
                setOnlinePlayers([]);
                for (const key in onlinePlayers) {
                    if(key !== socket.id)
                    setOnlinePlayers((player) => [...player, {playerId : key, playerName : onlinePlayers[key], playerStatus : playerStatus[key]}]);
                }
            });
    socket.on("request-accepted", data =>{
            setCount(0);
            setOne(true);
            setTurn(true);
            setD3(true);
            setD2(false);
    });        

        socket.on("request-rejected", data =>{
            console.log(data.playerName+' rejected your request');
            setOpponent({id : null, name : null});
            //waiting over
        });

        socket.on("receive-request", data =>{
            setOpponent({id : data.playerId, name : data.playerName});
            setPopup(true);
        });      
        socket.on("player-left", data => {
            // let ind = onlinePlayers.findIndex(x=>x.playerId === data.playerId );
            setOnlinePlayers(onlinePlayers.filter(item => item.playerId !== data.playerId));
        });    

        //data here is index of the 9x9 box
        socket.on("opponent-move", data => {
            mark[data] = one?"O":"X";
            setTurn(true);
        });  

        socket.on("tie", () => {
            showTie();
            setTie(prev=>prev+1);
            setTurn(true);
            setOne(true);
            setCount(0);
            setMark(new Array(9).fill(""));
        });

        socket.on("won", ()=>{
            setMark(new Array(9).fill(""));
            setTurn(false);
            setOne(false);
            setplayerB(prev=>prev+1);
            setCount(0);
            showResult("LOST");
        });        

        socket.on("exit-game", (data) => {
            alert('the opponent left....');
            reset();
        });
        return ()=> socket.off();  
      }
    });

    function showResult(res){
        setResult(`you ${res} the match`);
        setTimeout(()=>setResult("the battle is on..."), 5000);
    }

    
    function showTie(){
        setResult(`impressive..........that was a TIE !`);
        setTimeout(()=>setResult("the battle is on..."), 4000);
    }

    function refreshList(){
        socket.emit("refresh-list", {socketId : socket.id, playerName : nameA});
    }

    function exitGame(e){
        alert('exit game');
        setD3(false);
        setD2(true);
        setOpponent({id :null, name : null});
        setCount(0);
        setTurn(false);
        socket.emit("exit-game", {from : socket.id, to : opponent.id});
    }
    function acceptRequest(){
        setPopup(false);
        setTurn(false);
        setOne(false);
        setD3(true);
        setD2(false);
        socket.emit("accept-request", {from : opponent.id, to : socket.id});
    }
    function rejectRequest(){
        setPopup(false);
        setOpponent({id : null, name : null});
        socket.emit("reject-request", {from : opponent.id, to : socket.id});
    }
    //to = {playerId, playerName}
    function sendRequest(to){
        console.log('sending request to', to);
        socket.emit("send-request", {from : socket.id,  to : to.playerId});
        setOpponent({id : to.playerId, name : to.playerName});
    }

    function enterTheGame() {
        if(nameA){
            
          socket = SocketClient('https://thet3game.herokuapp.com/', { transports : ['websocket']});
            socket.on("connect", ()=>{
                socket.emit("im-in",{playerName : nameA});
            });
            setD1(false);
            setD3(false);
            setD2(true);
            // setDispInput('none')
        }
    }

    function checkResult(){
        const myChar = one ? "X":"O";
            if( ( mark[0]===myChar && mark[1]===myChar && mark[2]===myChar) ||
             (mark[3]===myChar && mark[4]===myChar && mark[5]===myChar) ||
             (mark[6]===myChar && mark[7]===myChar && mark[8]===myChar) ||
             (mark[0]===myChar && mark[3]===myChar && mark[6]===myChar) ||
             (mark[1]===myChar && mark[4]===myChar && mark[7]===myChar) ||
             (mark[2]===myChar && mark[5]===myChar && mark[8]===myChar) ||
             (mark[0]===myChar && mark[4]===myChar && mark[8]===myChar) ||
             (mark[2]===myChar && mark[4]===myChar && mark[6]===myChar) 
            ){
                setplayerA(prev => prev+1);
                setTurn(true);
                setOne(true);
                setCount(0);
                setMark(new Array(9).fill(""));
                showResult("WON");
                socket.emit("won", {from : socket.id, to : opponent.id});
                return true;
            };
            return false;
    }

    async function makeMove(boxNo){
        if(turn && mark[boxNo] === ""){
            if(one){
                setTurn(false);
                mark[boxNo] = "X";
                if(checkResult())
                    return;
                setCount( prev => prev+1);
                if(count === 4){
                    showTie();
                    setCount(0);
                    setOne(false);
                    setTurn(false);
                    setTie(prev => prev+1);
                    setMark(new Array(9).fill(""));
                    socket.emit("tie", {from : socket.id, to : opponent.id});
                    return; 
                }
                socket.emit("opponent-move", {playerId : opponent.id, index : boxNo});
            }else{
                setTurn(false);
                mark[boxNo] = "O";
                if(checkResult()){
                    // socket.emit("opponent-move", {playerId : opponent.id, index : boxNo});
                    return;
                }
                socket.emit("opponent-move", {playerId : opponent.id, index : boxNo});

            }
        }
    }

    return(
        <div className="contents">
        <form className = "nameInput" style = {{ display : D1?"block":"none" } } > 
                    <input id ="A" className="entry-field" name ="playerA" type = "text" placeholder = "your name" required  onChange = { (e)=>setNameA(e.target.value)}/>
                    <Button
                    variant = "contained"
                    className="startButton"
                    color="secondary" onClick = { enterTheGame }>Battle</Button>
         </form>

         <div className="heading">Tic  Tac Toe</div>
<div className='onlinePlayers' style={{display : D2?"block":"none"}}>
    <div className="refresh-button" onClick={refreshList}>
        Refresh
    </div>

    {/* <div className = "list"> */}
        <Container>
    {
        onlinePlayers.map( to => 
            <Row onClick={()=>sendRequest(to)}>
                <Col md={6} lg={6} sm={6}>{to.playerName}</Col>
                <Col md={6} lg={6} sm={6}>{
                (to.playerStatus === false)?
                "send request"
                :
                "in a match"
                }</Col>
            </Row>    
        )
    }
    </Container>
    {/* </div> */}
</div>

<div className = "myboard" style = {{ display : D3?"block":"none" } } >
<div className="grid">
    <div onMouseDown = {()=>makeMove(0)}>{mark[0]}</div>
    <div onMouseDown = {()=>makeMove(1)}>{mark[1]}</div>
    <div onMouseDown = {()=>makeMove(2)}>{mark[2]}</div>
    <div onMouseDown = {()=>makeMove(3)}>{mark[3]}</div>
    <div onMouseDown = {()=>makeMove(4)}>{mark[4]}</div>
    <div onMouseDown = {()=>makeMove(5)}>{mark[5]}</div>
    <div onMouseDown = {()=>makeMove(6)}>{mark[6]}</div>
    <div onMouseDown = {()=>makeMove(7)}>{mark[7]}</div>
    <div onMouseDown = {()=>makeMove(8)}>{mark[8]}</div>
</div>
</div> 
                <div className="pointsT" style={{display : D3?"block":"none"}}>
                    <h2>{turn ? "Your turn":`${opponent.name}'s Turn`}</h2>
                <h3>{nameA} {playerA}<br/>{opponent.name} {playerB} <br/>Ties {tie}</h3>
                <Button variant = "outlined" color = "success" onClick = {exitGame}>Exit Game</Button>
                <p>{result}</p>
                 </div>
<br/>
<RequestModal
    from = {opponent}
    show = {popup}
    onHide = {()=>setPopup(false)}
    onAccept = {acceptRequest}
    onReject = {rejectRequest}
/>
    </div>
)
}


// <h className="creator">.... A t i f</h> 


//  <button onMouseDown = {checkMove} className =  "rooms"  value = "1" >{mark[0]}</button>
//  <button onMouseDown = {checkMove} className =  "rooms" value = "2" >{mark[1]}</button>
//  <button onMouseDown = {checkMove} className =  "rooms" value = "3"  >{mark[2]}</button>
//  <button onMouseDown = {checkMove} className =  "rooms"  value = "4" >{mark[3]}</button>
//  <button onMouseDown = {checkMove} className =  "rooms"  value = "5" >{mark[4]}</button>
//  <button onMouseDown = {checkMove} className =  "rooms" value = "6" >{mark[5]}</button>
//  <button onMouseDown = {checkMove} className =  "rooms"  value = "7" >{mark[6]}</button>
//  <button onMouseDown = {checkMove} className =  "rooms"  value = "8" >{mark[7]}</button>
//  <button onMouseDown = {checkMove} className =  "rooms"  value = "9" >{mark[8]}</button> 
 // function checkMe() {
    //     if( ( mark[0]==="X" && mark[1]==="X" && mark[2]==="X") ||
    //          (mark[3]==="X" && mark[4]==="X" && mark[5]==="X") ||
    //          (mark[6]==="X" && mark[7]==="X" && mark[8]==="X") ||
    //          (mark[0]==="X" && mark[3]==="X" && mark[6]==="X") ||
    //          (mark[1]==="X" && mark[4]==="X" && mark[7]==="X") ||
    //          (mark[2]==="X" && mark[5]==="X" && mark[8]==="X") ||
    //          (mark[0]==="X" && mark[4]==="X" && mark[8]==="X") ||
    //          (mark[2]==="X" && mark[4]==="X" && mark[6]==="X") 
    //         ){
    //             setplayerA(prev => prev+1);
    //             setCount(0);
    //             setMark(new Array(9).fill(''));
    //             alert(nameA+" won !!!!");
    //             // flag = 0;
    //         }
    //         else return;
    // }

    // function checkOpponent() {

    //     if( ( mark[0]==="O" && mark[1]==="O" && mark[2]==="O") ||
    //          (mark[3]==="O" && mark[4]==="O" && mark[5]==="O") ||
    //          (mark[6]==="O" && mark[7]==="O" && mark[8]==="O") ||
    //          (mark[0]==="O" && mark[3]==="O" && mark[6]==="O") ||
    //          (mark[1]==="O" && mark[4]==="O" && mark[7]==="O") ||
    //          (mark[2]==="O" && mark[5]==="O" && mark[8]==="O") ||
    //          (mark[0]==="O" && mark[4]==="O" && mark[8]==="O") ||
    //          (mark[2]==="O" && mark[4]==="O" && mark[6]==="O") 
    //         ){
    //             alert(opponent.name+" won !!!!");
    //             setplayerB(prev => prev+1);
    //             setMark(new Array(9).fill(''));
    //             setCount(0);
    //             // flag = 0;
    //         }
    //         else return;
    // }
    // function checkMove(e){
    //     let val = e.target.value-1;
    //     if(mark[val] === "X" || mark[val] === "O" )
    //         return;
    //     if(count%2){
    //         //player B
    //         if(mark[val]==='')
    //             mark[val] = "O";
    //         checkB(); 
    //     }
    //     else
    //     {
    //         //player A
    //       if(mark[val] === '')
    //       mark[val] = "X";
    //       checkA();  
    //     }

    //     setCount(prev => prev+1);
        // if(count === 8){
        //     setMark(new Array(9).fill(''));
        //     setTie(prev => prev+1);
        //     setCount(0);
        //     alert("Its a TIE !!!");
        // }
    // }

