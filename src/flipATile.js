//------------------------------------------
//---  flip a tile -------------------------
//------------------------------------------

// Classes
class boardSpace{
    constructor(id, color, historyId){
        this.id = id;
        this.color = color;
        this.historyId = historyId;
    }}

// Constants
const root = document.querySelector(':root');
const gameBoard = document.getElementsByTagName('gameBoard')[0]



// Variables
let historyCounter = 0;
let boardTracker = [].fill(null);
let currentPlayer = 'white'
let playableSquares = 0;

// Events
document.addEventListener('DOMContentLoaded',()=> initalSetup())
window.addEventListener('resize',()=> handleWindowResize());

// Game Logic

// Functions

initalSetup = ()=>{
    handleWindowResize();
    buildBoard();
    startingPieces();
    setPlay(currentPlayer);
    checkAllFreeSpaces();
}

buildBoard = () =>{
    for(let i=0;i<64;i++){
        sqr = document.createElement('square');
        sqr.id = i;
        sqr.addEventListener('drop',(args)=>handleDrop(args));
        sqr.addEventListener('dragover', (args)=>handleAllowDrop(args));
        
        sqr.addEventListener('dragenter', (args)=>handleDragEnter(args));
        gameBoard.appendChild(sqr);
        boardTracker[i] = new boardSpace(i,null,null);
        
    }


}

startingPieces = () =>{
    placePiece(document.getElementById('27'),'white');
    placePiece(document.getElementById('28'),'black');
    placePiece(document.getElementById('36'),'white');
    placePiece(document.getElementById('35'),'black');
}

switchPlayers = ()=>{
    currentPlayer = (currentPlayer==='black') ? 'white' : 'black';
    setPlay();
    checkAllFreeSpaces();
    if(playableSquares ===0){
        alert('no spaces switching to other player');
        switchPlayers();
    }

}

setPlay = () =>{
    let id = (currentPlayer==='black') ? 'bp' : 'wp';
    let altId = (currentPlayer==='black') ? 'wp' : 'bp'
    let masterPiece = document.getElementById(id);
    masterPiece.setAttribute('draggable', true);
    masterPiece.classList.remove('hidden')
    let AltPiece = document.getElementById(altId);
    AltPiece.setAttribute('draggable', false);
    AltPiece.classList.add('hidden');
    
}




handleWindowResize = ()=>{
    let width = window.innerWidth;
    let height = window.innerHeight - 150;

    let margin = 20;

    let max = (width <= height) ? width : height;
    max -= margin*2;

    let realmax = (Math.floor(max/8)*8)-margin;

    gameBoard.style.width = realmax+"px";
    gameBoard.style.height = realmax+"px";
    root.style.setProperty('--SquareWidth', `${realmax/8}px`);
    root.style.setProperty('--SquareBorder', `${Math.ceil(realmax/185)}px`);
}

// Events for Drag and Drop

handleAllowDrop = (args) => {
// allowdrop event
    if(!args.target.classList.contains('full'))
        args.preventDefault();
   
}

handleDrag = (args) => {
// drag event


    args.dataTransfer.setData("text", args.target.id)
}

//used to check last target in the drag and drop
var lastTarget = "";

handleDragEnter = (args) => {
//dragenter event
    console.log(args.target);
    console.log(lastTarget);
    target = args.target;
    if (target.classList.contains('white') || target.classList.contains('black'))
    {
        return;
    }
    if (target !== lastTarget && lastTarget!=="")
  
        if (lastTarget.classList.contains('invalid'))
            lastTarget.classList.remove('invalid'); 
  
    if(target.classList.contains('full'))
       { lastTarget = target;
        target.classList.add('invalid');}
}

handleDragEnd = (args)=> {
    try{
        lastTarget.classList.remove('invalid');
    } catch {

    }
}

handleDrop = (args) => {
//dragstart event (called from the ondragstart of the html piece)
if(!args.target.classList.contains('valid'))
    return;

args.preventDefault();
    
    var data = args.dataTransfer.getData("text");
    if (data!="bp" && data!="wp") return;
   
    target = args.target;
    color = document.getElementById(data).className;

    placePiece(target, color);
    flipLines(color, parseInt(target.id));
    switchPlayers();
}

placePiece = (target, color)=>{
    newPiece = piece(color);
    target.appendChild(newPiece);
    UpdateBoardData(color, target.id);
    target.className="full";

    //identify valid moves for next player, mark in boardTracker
    //then css could be marked with valids and invalids???
    //
}

 piece = (color)=>{
    newPiece = document.createElement('piece');
    classColor = color;
    newPiece.classList.add(classColor, 'full');
    newPiece.draggable = false;
    return newPiece;
}

UpdateBoardData = (color, target)=>{
    boardTracker[parseInt(target)].id = parseInt(target);
    boardTracker[parseInt(target)].color = color,
    boardTracker[parseInt(target)].history = historyCounter;
    historyCounter +=1;
}

checkAllFreeSpaces = ()=>{
    playableSquares = 0;
    for(let i = 0; i<64; i++){
        if (boardTracker[i].color){
            continue;
        } else {
            if (checkAllLines(currentPlayer,i)){
                document.getElementById(i.toString()).classList.add('valid');
            } else {
                document.getElementById(i.toString()).classList.remove('valid');
            }
            //check for a valid line
            //if a valid line mark with a class
        }
    }
}

checkAllLines = (color,space)=> {
    for (let i = 0; i<8; i++){
        if (checkline(color,i,space)) {
            console.log(`got one at ${space}`);
            playableSquares+=1;
            return true;
        }
    }
    
    return false;
}

opponent = ()=>{
    return (currentPlayer==='black') ? 'white' : 'black'
}

//space adjustments to get the next item in the line
const dirAdjust = [-8,-7,1,9,8,7,-1,-9]

checkline = (color, direction, space) => {
    if (isLimit(space,direction)) return false;
    //returns true if a pieces would be taken

    //color: black or white, color of the piece placed or to be placed
    //directions
    // 0 north, 1 north east, 2 east, 3 south east, 4 south
    // 5 south west, 6 west, 7 north west

  //  let opponent = (color==='black') ? 'white' : 'black';
    let testingSpace = space;
    
    testingSpace = testingSpace + dirAdjust[direction];
    
    console.log(`direction: ${direction}     space:${space}    testing:${testingSpace}`);
   
    if (boardTracker[testingSpace].color === null) return false;
        //blank square
    if (boardTracker[testingSpace].color === color) return false;
        //same colour

    while (!isLimit(testingSpace,direction)){
        testingSpace = testingSpace + dirAdjust[direction];
        if (boardTracker[testingSpace].color === null) return false;
        //blank square
        if (boardTracker[testingSpace].color === color) return true;
        //same colour
    }
        
    return false;
}

flipLines = (color, space) => {
    for (let direction = 0; direction<8; direction++){
        if (checkline(color,direction,space)) {
            //direction works
            //direction has a valid flip

            let toFlip = space;
            toFlip = toFlip + dirAdjust[direction]; 
            do{
                switchPiece = document.getElementById(toFlip.toString()).firstChild;
                switchPiece.classList.remove(opponent());
                switchPiece.classList.add(color);
                boardTracker[toFlip].color = color;
                toFlip += dirAdjust[direction];
            }while(boardTracker[toFlip].color!==color)
        }
    }
    




    //start with square
    //examin a line at a time
        //flip a line if valid
    //repeat
}

isLimit = (space, direction) => {
//return true if the end of the board has been reached in the direction of travel

    switch(direction)
    {
        case 0:
            if (space<=7 ) return true
            break;
        case 1:
            if (space<=7 ) return true
            if ((space-7)%8===0) return true
            break;
        case 2:
            if ((space-7)%8===0) return true
            break;
        case 3:
            if ((space-7)%8===0) return true
            if (space>=56) return true
            break;
        case 4:
            if (space>=56) return true
            break;
        case 5:
            if (space>=56) return true
            if (space%8===0) return true
            break;
        case 6:
            if (space%8===0) return true
            break;
        case 7:
            if (space%8===0) return true
            if (space<=7 ) return true
            break;
    }
    return false;
}