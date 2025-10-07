const express = require('express');
const socket = require('socket.io');
const http = require('http');
const {Chess}= require('chess.js');
const path = require('path');
const { title } = require('process');


const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess= new Chess();
let players = {};
let currentPlayer = "w";

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,"public")));

app.get('/', (req, res) => {
    res.render('index',{title:"Online Chess Game"});
});

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    if(!players.white)
    {
        players.white=socket.id;
        socket.emit("playerRole","w");
    }
    else if(!players.black)
    {
        players.black=socket.id;
        socket.emit("playerRole","b");
    }
    else
    {
        socket.emit("spectatorRole");
    }

    socket.on("disconnect",()=>{
        if(players.white===socket.id)
        {
            delete players.white;
        }
        else if(players.black===socket.id)
        {
            delete players.black;
        }
    });


    socket.on("move", (move) => {
        try{
           if(chess.turn()=== "w" && socket.id !== players.white) return;
              if(chess.turn()=== "b" && socket.id !== players.black) return;

              const result = chess.move(move);
              if(result)
              {
                currentPlayer= chess.turn()
                io.emit("move", move);
                io.emit("boardState", chess.fen());
              }
              else{
                console.log("Invalid move attempted:", move);
                socket.emit("invalidMove", move);
              }

        }
        catch(err){
            console.log(err);
            socket.emit("Invalid move:", move);
        }


    // socket.on("Churan",()=>{
    //     io.emit("Churan paapdi")
    //     // console.log("Churan Rreceived");


    // });

    // socket.on('disconnect', () => {
    //     console.log('Client disconnected:', socket.id);
    // });
 });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
