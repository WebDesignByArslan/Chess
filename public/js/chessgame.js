const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let playerRole = "w"; // "w" for white, "b" for black
let sourceSquare = null;

// 🧩 Render the chessboard
const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";

  board.forEach((row, rowIndex) => {
    row.forEach((square, squareIndex) => {
      const squareElement = document.createElement("div");

      // Add alternating light/dark color
      squareElement.classList.add(
        "square",
        (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
      );

      // Store coordinates
      squareElement.dataset.row = rowIndex;
      squareElement.dataset.col = squareIndex;

      // If square has a piece
      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerHTML = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        // Drag events
        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowIndex, col: squareIndex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        pieceElement.addEventListener("dragend", () => {
          draggedPiece = null;
          sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }

      // Allow drop
      squareElement.addEventListener("dragover", (e) => e.preventDefault());
      squareElement.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSquare = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };
          handleMove(sourceSquare, targetSquare);
        }
      });

      boardElement.appendChild(squareElement);
    });
  });
};

// 🏇 Handle piece movement
const handleMove = (source, target) => {
  const from = `${String.fromCharCode(97 + source.col)}${8 - source.row}`;
  const to = `${String.fromCharCode(97 + target.col)}${8 - target.row}`;
  const move = { from, to, promotion: "q" };

  const result = chess.move(move);

  if (result) {
    renderBoard();
    socket.emit("move", move); // Optional multiplayer sync
  } else {
    console.log("❌ Invalid move");
  }
};



// ♟ Unicode symbols
const getPieceUnicode = (piece) => {
  if (!piece) return "";

  const unicodePieces = {
    p: { w: "♙", b: "♟" },
    r: { w: "♖", b: "♜" },
    n: { w: "♘", b: "♞" },
    b: { w: "♗", b: "♝" },
    q: { w: "♕", b: "♛" },
    k: { w: "♔", b: "♚" },
  };

  return unicodePieces[piece.type][piece.color];
};


socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = "null"; // "s" for spectator
    renderBoard();
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});

// Render initial board
renderBoard();
