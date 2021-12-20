import React , { useState , useEffect } from 'react';
import { Button, Grid, Typography, Paper} from '@material-ui/core';
import './App.css';

function Board(){
    let flag = 0 ;
    const [mark, setMark] = useState([])
    const [playerA,setplayerA] = useState(0);
    const [playerB,setplayerB] = useState(0);
    const [tie,setTie] = useState(0);
    const [count,setCount] = useState(0);
    const [dispBoard , setDispBoard] = useState('grid');
    const [dispInput , setDispInput] = useState('block');
    const [nameA , setNameA] = useState("");
    const [nameB , setNameB] = useState("");

    function startGame() {
        if(nameA && nameB){
            setDispBoard('grid');
            setDispInput('none')
        }
        else
        {
            alert("Enter player names !!!");
        }
    }

    function  getName(e) {
        if(e.target.id == "A"){
            setNameA(e.target.value);
        }
        else{
            setNameB(e.target.value);
        }
        
    }

    function checkA() {
        if( ( mark[0]=="X" && mark[1]=="X" && mark[2]=="X") ||
             (mark[3]=="X" && mark[4]=="X" && mark[5]=="X") ||
             (mark[6]=="X" && mark[7]=="X" && mark[8]=="X") ||
             (mark[0]=="X" && mark[3]=="X" && mark[6]=="X")  ||
             (mark[1]=="X" && mark[4]=="X" && mark[7]=="X") ||
             (mark[2]=="X" && mark[5]=="X" && mark[8]=="X") ||
             (mark[0]=="X" && mark[4]=="X" && mark[8]=="X") ||
             (mark[2]=="X" && mark[4]=="X" && mark[6]=="X") 
            ){
                alert(nameA+" won !!!!");
                setplayerA(prev => prev+1);
                setCount(0);
                setMark([]);
                flag = 1;
            }
            else return;
    }
    function checkB() {

        if( ( mark[0]=="O" && mark[1]=="O" && mark[2]=="O") ||
             (mark[3]=="O" && mark[4]=="O" && mark[5]=="O") ||
             (mark[6]=="O" && mark[7]=="O" && mark[8]=="O") ||
             (mark[0]=="O" && mark[3]=="O" && mark[6]=="O") ||
             (mark[1]=="O" && mark[4]=="O" && mark[7]=="O") ||
             (mark[2]=="O" && mark[5]=="O" && mark[8]=="O") ||
             (mark[0]=="O" && mark[4]=="O" && mark[8]=="O") ||
             (mark[2]=="O" && mark[4]=="O" && mark[6]=="O") 
            ){
                alert(nameB+" won !!!!");
                setplayerB(prev => prev+1);
                setMark([]);
                setCount(0);
                flag = 1;
            }
            else return;
    }
    function checkMove(e){
        let val = e.target.value-1;
        if(count%2){
            if(mark[val]==null)
                mark[val] = "O";
        }
        else
        {
            if(mark[val] == null)
          mark[val] = "X";
        }
        setCount(prev => prev+1);
        checkA();  
        checkB(); 
        if(count === 8 && flag===0){
            setMark([]);
            setTie(prev => prev+1);
            setCount(0);
            alert("Its a TIE !!!");
        }
        else{
            flag=0;
        }
    }  
       
    return(
        <div class="contents">

        <form className = "nameInput" style = {{ display : dispInput } } > 
                    <input id ="A" className="entry-field" name ="playerA" type = "text" placeholder = "Player 1" required value = {nameA} onChange = {getName}/>
                    <label className="entry-label" for="playerA">V / S </label>
                    <input id="B" className="entry-field" name = "playerB" type = "text" placeholder = "Player 2" required value = {nameB} onChange = {getName}/>
                    <Button 
                    variant = "contained"
                    className="startButton"
                    color="secondary" onClick = { startGame}>Battle</Button>

                    <Button 
                    variant = "contained"
                    className="startButton"
                    color="secondary" onClick = {() => setCount(p=>p+1)}>Atif's Button{count}</Button>
         </form>

         <div class="heading">Tic  Tac Toe</div>


                 <button onMouseDown = {checkMove} className =  "rooms"  value = "1" style = {{display : dispBoard}}>{mark[0]}</button>
                 <button onMouseDown = {checkMove} className =  "rooms" value = "2" style = {{display : dispBoard}}>{mark[1]}</button>
                 <button onMouseDown = {checkMove} className =  "rooms" value = "3" style = {{display : dispBoard}} >{mark[2]}</button>
                 <button onMouseDown = {checkMove} className =  "rooms"  value = "4" style = {{display : dispBoard}}>{mark[3]}</button>
                 <button onMouseDown = {checkMove} className =  "rooms"  value = "5" style = {{display : dispBoard}}>{mark[4]}</button>
                 <button onMouseDown = {checkMove} className =  "rooms" value = "6" style = {{display : dispBoard}}>{mark[5]}</button>
                 <button onMouseDown = {checkMove} className =  "rooms"  value = "7" style = {{display : dispBoard}}>{mark[6]}</button>
                 <button onMouseDown = {checkMove} className =  "rooms"  value = "8" style = {{display : dispBoard}}>{mark[7]}</button>
                 <button onMouseDown = {checkMove} className =  "rooms"  value = "9" style = {{display : dispBoard}}>{mark[8]}</button>
             
                <div className="pointsT" style = {{display : dispBoard}}>
                <h3>{nameA} {playerA}<br/>{nameB} {playerB} </h3>
                 </div>
                 <h className="creator">.... A t i f</h>
                 <p>{mark[0]}</p>
                 <p>{mark[1]}</p>
                 <p>{mark[2]}</p>
                 <p>{mark[3]}</p>
                 <p>{mark[4]}</p>

                 
    </div>


    )
}
export default Board;