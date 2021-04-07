const gridWidth = 40;
const gridHeight = 20;
const size = 20;
const canvas = new Canvas("canvas");
canvas.setTileSize(size);
canvas.setDimensions(gridWidth * size, gridHeight * size);

Grid.initialiseTiles(gridHeight, gridWidth);
Grid.setStart(0, 0);
Grid.setEnd(gridHeight - 1, gridWidth - 1);
Grid.randomiseGrid(0.2)
canvas.drawGrid(Grid.getTiles());

let pathfindingAlgorithm = PathFinding.BFS;

const runButton = document.getElementById("run");
runButton.onclick = function () {
    PathFinding.resetMetrics();
    document.getElementById("path-length").innerText = 0;
    document.getElementById("turns-count").innerText = 0;
    pathfindingAlgorithm.bind(PathFinding)(
        Grid.getTiles(),
        gridWidth,
        Grid.getStart(),
        Grid.getEnd()
    );
}

const resetButton = document.getElementById("reset");
resetButton.onclick = function () {
    Grid.reset();
    canvas.drawGrid(Grid.getTiles());
}

const randomiseButton = document.getElementById("randomise");
randomiseButton.onclick = function () {
    Grid.reset();
    Grid.randomiseGrid(0.2);
    canvas.drawGrid(Grid.getTiles());
}

const selectElement = document.getElementById("algorithm-select");
selectElement.onchange = function() {
    // Map the value ID to a pathfinding algorithm
    switch (this.value) {
        case "1":
            pathfindingAlgorithm = PathFinding.BFS;
            break;
        case "2":
            pathfindingAlgorithm = PathFinding.DFS;
            break;
        case "3":
            pathfindingAlgorithm = PathFinding.leastTurns;
            break;
        case "4":
            console.warn('A* not implemented yet');
            break;
        default:
            pathfindingAlgorithm = PathFinding.BFS;
            break;
    }
}