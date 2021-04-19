/**
 * An object used to setup event handling of the pathfinding controls,
 * and display metrics for the path calculated by the pathfinding 
 * algorithm.
 */
const UI = (function () {

    const tileSelectors = [...document.querySelectorAll('.options__option')];
    tileSelectors.forEach(tile => {
        tile.onclick = function() {
            tileSelectors.forEach(t => t.removeAttribute("selected"));
            tile.setAttribute("selected", "yes");
            canvas.setPaintMode(tile.getAttribute("tile-type"));
        }
    });

    const pathLengthDiv = document.getElementById("path-length");
    const turnCountDiv = document.getElementById("turns-count");

    /**
     * Resets the value of the path length and turn count elements
     */
    const resetMetrics = () => {
        pathLengthDiv.innerText = 0;
        turnCountDiv.innerText = 0;
    }

    /**
     * Sets the value of the path length element
     * @param {number} pathLength 
     */
    const setPathLength = (pathLength) => {
        pathLengthDiv.innerText = pathLength
    }

    /**
     * Sets the value of the turn count element
     * @param {number} turnCount 
     */
    const setTurnCount = (turnCount) => {
        turnCountDiv.innerText = turnCount;
    }

    const runButton = document.getElementById("run");
    runButton.onclick = function () {
        PathFinding.resetMetrics();
        resetMetrics();
        pathfindingAlgorithm.bind(PathFinding)();
    }

    const resetButton = document.getElementById("reset");
    resetButton.onclick = function() {
        PathFinding.stopSimulation();
        Grid.reset();
        canvas.drawGrid(Grid.getTiles());
    }

    const randomiseButton = document.getElementById("randomise");
    randomiseButton.onclick = function () {
        Grid.reset();
        Grid.randomiseGrid(obstacleDensity);
        canvas.drawGrid(Grid.getTiles());
    }

    let pathfindingAlgorithm = PathFinding.BFS;
    const selectElement = document.getElementById("algorithm-select");
    selectElement.onchange = function () {
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
                pathfindingAlgorithm = PathFinding.AStar;
                break;
            default:
                pathfindingAlgorithm = PathFinding.BFS;
                break;
        }
    }

    const runSpeedInput = document.getElementById("run-speed");
    runSpeedInput.onchange = function() {
        PathFinding.stepTimer = Number(this.value) * 1000; // Convert to millseconds
    }

    let obstacleDensity = 0.2;
    const obstacleDensityInput = document.getElementById("obstacle-density");
    obstacleDensityInput.onchange = function() {
        obstacleDensity = Number(this.value);
    }


    return {
        resetMetrics,
        setPathLength,
        setTurnCount
    }
})();