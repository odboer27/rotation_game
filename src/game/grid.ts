// ============================================================
// THE GAME RULES
// This file only contains the logic of the puzzle. It knows
// nothing about buttons, colours or the web page, which makes
// it easy to understand, test and reuse (for example in a
// mobile app later).
// ============================================================

// A "type" is a label that describes what a value looks like.
// Our grid is a list of letters, stored row by row in ONE list.
// For a 3x3 grid the positions (indexes) are:
//
//    0 1 2        a b c
//    3 4 5   =>   d e f   (the solved grid)
//    6 7 8        g h i
//
export type Grid = string[];

// A turn can go one of two ways. Using a fixed set of words
// means TypeScript warns us if we ever make a typo like "clokwise".
export type Direction = "clockwise" | "counterclockwise";

// Enough letters for the biggest grid we support (5x5 = 25 tiles).
const LETTERS = "abcdefghijklmnopqrstuvwxy";

/** Returns the solved grid, e.g. for size 3: ["a","b","c", ... ,"i"]. */
export function createSolvedGrid(size: number): Grid {
  // slice() takes the first size*size letters, split("") turns the
  // text "abc..." into a list ["a", "b", "c", ...].
  return LETTERS.slice(0, size * size).split("");
}

/**
 * Turns ONE 2x2 block and returns a NEW grid (the old one is left alone).
 * (row, col) is the top-left tile of the block, counted from 0.
 */
export function rotateBlock(
  grid: Grid,
  size: number,
  row: number,
  col: number,
  direction: Direction,
): Grid {
  // [...grid] makes a copy of the list, so we never change the original.
  const next = [...grid];

  // Work out the 4 positions in the flat list.
  // Moving one row down means jumping "size" places further in the list.
  const topLeft = row * size + col;
  const topRight = topLeft + 1;
  const bottomLeft = topLeft + size;
  const bottomRight = bottomLeft + 1;

  if (direction === "clockwise") {
    //  a b   becomes   c a
    //  c d             d b
    next[topLeft] = grid[bottomLeft];
    next[topRight] = grid[topLeft];
    next[bottomRight] = grid[topRight];
    next[bottomLeft] = grid[bottomRight];
  } else {
    //  a b   becomes   b d
    //  c d             a c
    next[topLeft] = grid[topRight];
    next[topRight] = grid[bottomRight];
    next[bottomRight] = grid[bottomLeft];
    next[bottomLeft] = grid[topLeft];
  }
  return next;
}

/** True when every letter is back in alphabetical order. */
export function isSolved(grid: Grid, size: number): boolean {
  // join("") glues a list back into text, so we can compare two texts.
  return grid.join("") === createSolvedGrid(size).join("");
}

/**
 * Makes a shuffled grid by doing many random turns on a solved grid.
 * Because we only use real turns, the result is always solvable
 * (and we proved earlier that every arrangement is solvable anyway).
 */
export function shuffle(size: number, turns = 100): Grid {
  let grid = createSolvedGrid(size);

  // Keep shuffling until the grid is NOT accidentally solved.
  while (isSolved(grid, size)) {
    for (let i = 0; i < turns; i++) {
      // Math.random() gives a number between 0 and 1.
      // Multiplying and rounding down picks a random whole number.
      // There are (size - 1) possible blocks per row and per column.
      const row = Math.floor(Math.random() * (size - 1));
      const col = Math.floor(Math.random() * (size - 1));
      grid = rotateBlock(grid, size, row, col, "clockwise");
    }
  }
  return grid;
}
