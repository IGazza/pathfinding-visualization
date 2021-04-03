const gridWidth = 20;
const gridHeight = 20;
const size = 20;
const canvas = new Canvas("canvas");
canvas.setTileSize(size);
canvas.setDimensions(gridWidth * size, gridHeight * size);

Grid.initialiseTiles(gridHeight, gridWidth);
Grid.setStart(0, 0);
Grid.setEnd(gridHeight - 1, gridWidth - 1);
Grid.randomiseGrid(0.3)
canvas.drawGrid(Grid.getTiles());

const runButton = document.getElementById("run");
runButton.onclick = function () {
    PathFinding.lee(
        Grid.getTiles(),
        gridWidth,
        Grid.getStart(),
        Grid.getEnd()
    );
}