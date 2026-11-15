// ============================================================
// THE STARTING POINT
// The browser runs this file first. It connects the rules
// (game/grid.ts) to the drawing (ui/board.ts) and keeps track
// of the current game.
// ============================================================

import "./style.css";
import { isSolved, rotateBlock, shuffle, type Direction } from "./game/grid";
import { renderBoard } from "./ui/board";

// Find the elements from index.html we need, using their id.
// The "!" at the end tells TypeScript: "trust me, this element exists".
const boardElement = document.querySelector<HTMLDivElement>("#board")!;
const movesElement = document.querySelector<HTMLSpanElement>("#moves")!;
const messageElement = document.querySelector<HTMLSpanElement>("#message")!;
const sizeSelect = document.querySelector<HTMLSelectElement>("#size-select")!;
const newGameButton = document.querySelector<HTMLButtonElement>("#new-game")!;

// The state of the game: everything that changes while playing.
// "let" (instead of "const") means the value may change later.
let size = 3;
let grid = shuffle(size);
let moves = 0;

/** Redraws the whole screen from the current state. */
function draw(): void {
  const solved = isSolved(grid, size);
  movesElement.textContent = `Moves: ${moves}`;
  messageElement.textContent = solved ? `Solved in ${moves} moves!` : "";
  renderBoard(boardElement, grid, size, solved, handleTurn);
}

/** Called by the board when the player clicks a turn button. */
function handleTurn(row: number, col: number, direction: Direction): void {
  grid = rotateBlock(grid, size, row, col, direction);
  moves = moves + 1;
  draw();
}

/** Starts a fresh game with the size chosen in the drop-down. */
function newGame(): void {
  // The drop-down gives text like "4"; Number() turns it into the number 4.
  size = Number(sizeSelect.value);
  grid = shuffle(size);
  moves = 0;
  draw();
}

// React to the controls.
newGameButton.addEventListener("click", newGame);
sizeSelect.addEventListener("change", newGame);

// Draw the first game when the page opens.
draw();
