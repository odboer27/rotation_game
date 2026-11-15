// ============================================================
// DRAWING THE BOARD
// This file turns a Grid (a list of letters) into things you
// can see and click on the web page, and animates the turns.
// ============================================================

// "import type" borrows only the type labels from the rules file.
import type { Direction, Grid } from "../game/grid";

// Describes the function that main.ts gives us, which we call
// whenever the player clicks a turn button.
export type TurnHandler = (row: number, col: number, direction: Direction) => void;

// Describes one turn: which block (by its top-left tile) and which way.
export type Turn = { row: number; col: number; direction: Direction };

// How long one turn animation takes, in milliseconds (1000 ms = 1 second).
const ANIMATION_MS = 300;

export function renderBoard(
  boardElement: HTMLElement, // the empty <div id="board"> from index.html
  grid: Grid,
  size: number,
  solved: boolean,
  onTurn: TurnHandler,
  lastTurn?: Turn, // the "?" means optional: only given right after a turn
): void {
  // Remove everything from the previous drawing, then draw fresh.
  boardElement.innerHTML = "";

  // Hand the grid size to the CSS, which uses it to make
  // the right number of columns (see style.css: --size).
  boardElement.style.setProperty("--size", String(size));

  // Add or remove the "solved" class, which turns the tiles green.
  boardElement.classList.toggle("solved", solved);

  // 1) The tiles: one <div> per letter, in reading order.
  for (const letter of grid) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = letter.toUpperCase();
    boardElement.append(tile);
  }

  // 2) The turn buttons: one on every inner corner where 4 tiles meet.
  //    A 3x3 grid has 2x2 = 4 of these corners, a 4x4 has 3x3 = 9.
  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      const button = document.createElement("button");
      button.className = "turn-button";
      button.textContent = "⟳";

      // Place the button on the corner. E.g. on a 3x3 grid, the corner
      // after column 0 lies at 1/3 of the width = 33.3%.
      button.style.left = `${((col + 1) / size) * 100}%`;
      button.style.top = `${((row + 1) / size) * 100}%`;

      // A description for screen readers (people who can't see the page).
      button.setAttribute("aria-label", `Turn block at row ${row + 1}, column ${col + 1}`);

      // Once the puzzle is solved, the buttons stop working.
      button.disabled = solved;

      // Left click: turn clockwise.
      button.addEventListener("click", () => onTurn(row, col, "clockwise"));

      // Right click ("contextmenu"): turn counter-clockwise.
      // preventDefault() stops the browser's own right-click menu from opening.
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        if (!solved) onTurn(row, col, "counterclockwise");
      });

      boardElement.append(button);
    }
  }

  // 3) If this drawing was caused by a turn, animate it.
  if (lastTurn) animateTurn(boardElement, size, lastTurn);
}

/**
 * The "ferris wheel" animation.
 *
 * The tiles are already drawn in their NEW places. We now make each of the
 * 4 moved tiles start at its OLD place and travel along a circle around the
 * block's centre to the new place. Like gondolas on a ferris wheel, the
 * letters move around the circle but stay upright.
 */
function animateTurn(boardElement: HTMLElement, size: number, turn: Turn): void {
  // Some people switch off animations in their computer settings (for example
  // because motion makes them dizzy). We respect that and skip the animation.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const tiles = boardElement.querySelectorAll<HTMLElement>(".tile");

  // Measure the board on screen to know how far the tiles must travel.
  const tileSize = boardElement.clientWidth / size;
  // The distance from the block's centre to a tile's centre (Pythagoras:
  // half a tile across and half a tile down = half a tile times √2).
  const radius = (tileSize / 2) * Math.SQRT2;

  // A clockwise turn moves every tile 90 degrees forward around the circle,
  // a counter-clockwise turn 90 degrees back.
  const step = turn.direction === "clockwise" ? 90 : -90;

  // The 4 tiles of the block, with the angle where each one ENDS.
  // Angles are measured like a clock hand that starts pointing right
  // (0 degrees) and turns clockwise; on screens "down" is positive.
  const topLeft = turn.row * size + turn.col;
  const blockTiles = [
    { index: topLeft, angle: -135 }, // top-left: up and to the left
    { index: topLeft + 1, angle: -45 }, // top-right
    { index: topLeft + size + 1, angle: 45 }, // bottom-right
    { index: topLeft + size, angle: 135 }, // bottom-left
  ];

  for (const { index, angle } of blockTiles) {
    const endAngle = angle;
    const startAngle = angle - step;

    // A "keyframe" is a snapshot of where the tile should be at a moment
    // in the animation. We take 12 snapshots along the circle, so the
    // browser follows the curve instead of a straight line.
    const keyframes: Keyframe[] = [];
    const STEPS = 12;
    for (let i = 0; i <= STEPS; i++) {
      const progress = i / STEPS; // goes from 0 to 1
      const current = startAngle + (endAngle - startAngle) * progress;
      // How far the tile is from its final place at this moment.
      // cos/sin turn an angle into a point on the circle; they expect
      // radians, so we convert degrees with "* Math.PI / 180".
      const x = radius * (Math.cos(toRadians(current)) - Math.cos(toRadians(endAngle)));
      const y = radius * (Math.sin(toRadians(current)) - Math.sin(toRadians(endAngle)));
      keyframes.push({ transform: `translate(${x}px, ${y}px)` });
    }

    const tile = tiles[index];
    tile.classList.add("moving"); // draws moving tiles above the others
    tile.animate(keyframes, {
      duration: ANIMATION_MS,
      easing: "ease-in-out", // start slowly, speed up, slow down at the end
    });
  }
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
