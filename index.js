const gridWidth = 10;
const gridHeight = 10;
const size = 40;
const canvas = new Canvas("canvas");
if (window.innerWidth < 1000) {
    canvas.setTileSize(6);
} else {
    canvas.setTileSize(40);
}

canvas.setGridDimensions(gridWidth, gridHeight);

Grid.initialiseTiles(gridHeight, gridWidth);
Grid.setStart(0, 0);
Grid.setEnd(gridHeight - 1, gridWidth - 1);
Grid.randomiseGrid(0.2)
canvas.drawGrid(Grid.getTiles());