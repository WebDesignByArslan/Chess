const socket = io();
const chess= new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let playerRole = null; // "w" for white, "b" for black, null for spectator
let sourceSquare = null;




socket.emit("Churan")

socket.on("Churan paapdi",()=>{
    console.log("Churan paapdi received at client");
});