// ============================================================
// DRAWING THE BOARD
// This file turns a Grid (a list of letters) into things you
// can see and click on the web page.
// ============================================================

// "import type" borrows only the type labels from the rules file.
import type { Direction, Grid } from "../game/grid";

// Describes the function that main.ts gives us, which we call
// whenever the player clicks a turn button.
export type TurnHandler = (row: number, col: number, direction: Direction) => void;

export function renderBoard(
  boardElement: HTMLElement, // the empty <div id="board"> from index.html
  grid: Grid,
  size: number,
  solved: boolean,
  onTurn: TurnHandler,
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
}
