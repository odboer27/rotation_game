// ============================================================
// THE STARTING POINT
// The browser runs this file first. It connects the rules
// (game/grid.ts) to the drawing (ui/board.ts) and keeps track
// of the current game and its timer.
// ============================================================

import "./style.css";
import { isSolved, rotateBlock, shuffle, type Direction } from "./game/grid";
import { renderBoard, type Turn } from "./ui/board";

// Find the elements from index.html we need, using their id.
// The "!" at the end tells TypeScript: "trust me, this element exists".
const boardElement = document.querySelector<HTMLDivElement>("#board")!;
const timerElement = document.querySelector<HTMLSpanElement>("#timer")!;
const messageElement = document.querySelector<HTMLSpanElement>("#message")!;
const sizeSelect = document.querySelector<HTMLSelectElement>("#size-select")!;
const newGameButton = document.querySelector<HTMLButtonElement>("#new-game")!;

// The state of the game: everything that changes while playing.
// "let" (instead of "const") means the value may change later.
let size = 3;
let grid = shuffle(size);

// ---------------- The timer ----------------
// Like Minesweeper, the clock starts at your first move, not when the
// page opens, so you can look at the puzzle first without losing time.

// The moment the clock started, or null when the clock isn't running.
let startTime: number | null = null;
// How much time has passed, in milliseconds.
let elapsedMs = 0;
// The id of the repeating update, needed to stop it again.
let timerId: number | undefined;

/** Turns milliseconds into text like "1:05.3" (minutes:seconds.tenths). */
function formatTime(ms: number): string {
  const totalTenths = Math.floor(ms / 100);
  const minutes = Math.floor(totalTenths / 600); // 600 tenths in a minute
  const seconds = Math.floor(totalTenths / 10) % 60; // % 60 = what's left after full minutes
  const tenths = totalTenths % 10;
  // padStart(2, "0") turns 5 into "05", so it reads 1:05 instead of 1:5.
  return `${minutes}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

/** Recalculates the time and shows it on the page. */
function updateTimer(): void {
  // performance.now() is a precise clock that counts milliseconds.
  if (startTime !== null) elapsedMs = performance.now() - startTime;
  timerElement.textContent = `Time: ${formatTime(elapsedMs)}`;
}

function startTimer(): void {
  startTime = performance.now();
  // setInterval runs updateTimer again and again, every 100 ms.
  timerId = window.setInterval(updateTimer, 100);
}

function stopTimer(): void {
  updateTimer(); // one last update, so the final time is exact
  window.clearInterval(timerId);
  startTime = null;
}

// ---------------- Playing ----------------

/** Redraws the whole screen from the current state. */
function draw(lastTurn?: Turn): void {
  const solved = isSolved(grid, size);
  updateTimer();
  messageElement.textContent = solved ? `Solved in ${formatTime(elapsedMs)}!` : "";
  renderBoard(boardElement, grid, size, solved, handleTurn, lastTurn);
}

/** Called by the board when the player clicks a turn button. */
function handleTurn(row: number, col: number, direction: Direction): void {
  // The very first turn of a game starts the clock.
  if (startTime === null) startTimer();

  grid = rotateBlock(grid, size, row, col, direction);

  // That turn may have solved the puzzle: then stop the clock.
  if (isSolved(grid, size)) stopTimer();

  // Pass the turn along, so the board knows what to animate.
  draw({ row, col, direction });
}

/** Starts a fresh game with the size chosen in the drop-down. */
function newGame(): void {
  // Stop a clock that may still be running from the previous game.
  window.clearInterval(timerId);
  startTime = null;
  elapsedMs = 0;

  // The drop-down gives text like "4"; Number() turns it into the number 4.
  size = Number(sizeSelect.value);
  grid = shuffle(size);
  draw();
}

// React to the controls.
newGameButton.addEventListener("click", newGame);
sizeSelect.addEventListener("change", newGame);

// Draw the first game when the page opens.
draw();
