const ROWS = 40;
const COLUMNS = 65;
Grid.initialiseTiles(ROWS, COLUMNS);
Grid.setStart(0, 0);
Grid.setEnd(ROWS - 1, COLUMNS - 1);
Grid.randomiseGrid(0.2)

const canvas = new Canvas("canvas");
canvas.drawGrid(Grid.getTiles());