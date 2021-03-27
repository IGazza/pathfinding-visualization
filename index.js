// Git testing
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const gridWidth = 50;
const gridHeight = 50;
const size = 8;
const width = canvas.width = gridWidth * size;
const height = canvas.height = gridHeight * size;

const grid = [];
for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
        grid.push({
            row,
            col,
            type: "EMPTY"
        });
    }
}

let startIndex = 0;
grid[startIndex].start = true;
let endIndex = grid.length - 1;
grid[endIndex].end = true;

canvas.addEventListener("click", e => {
    console.log(`(${e.offsetX},${e.offsetY})`);
    const { gridX: x, gridY: y } = getGridSquare(e.offsetX, e.offsetY);
    if (paintmode === "OBSTACLE") {
        setObstacle(x, y);
    } else if (paintmode === "START") {
        setStart(x, y);
    } else if (paintmode === "END") {
        setEnd(x, y);
    }
    Graphics.drawGrid(grid);
});

canvas.addEventListener("contextmenu", e => {
    e.preventDefault();
    const { gridX: x, gridY: y } = getGridSquare(e.offsetX, e.offsetY);
    removeObstacle(x, y);
    Graphics.drawGrid(grid);
});

function removeObstacle(x, y) {
    const index = y * gridWidth + x;
    grid[index].type = "EMPTY";
}

function setObstacle(x, y) {
    const index = y * gridWidth + x;
    if (index === startIndex || index === endIndex) {
        return;
    }
    grid[index].type = "OBSTACLE";
}

function setStart(x, y) {
    startIndex = y * gridWidth + x;
    grid.forEach(g => g.start = false);
    grid[startIndex].start = true;
    setRunParameters(startIndex, endIndex);
}

function setEnd(x, y) {
    endIndex = y * gridWidth + x;
    grid.forEach(g => g.end = false);
    grid[endIndex].end = true;
    setRunParameters(startIndex, endIndex);
}

function getGridSquare(x, y) {
    const gridX = Math.floor(x / size);
    const gridY = Math.floor(y / size);
    return { gridX, gridY };
}

function randomiseGrid(probability) {
    for (let i = 0; i < grid.length; i++) {
        if (i !== startIndex && i !== endIndex) {
            if (Math.random() < probability) {
                grid[i].type = "OBSTACLE";
            }
        }
    }
}

let paintmode = "OBSTACLE";

function setPaintMode(type) {
    paintmode = type;
}

randomiseGrid(0.3);
Graphics.drawGrid(grid);

const runButton = document.getElementById("run");
function setRunParameters (start, end) {
    runButton.onclick = function() {
        PathFinding.BFS(
            grid,
            gridWidth,
            grid[start],
            grid[end]
        );
    }
}
setRunParameters(startIndex, endIndex);