const PathFinding = {
    refreshTime: 10,

    currentPathLength: 0,
    currentPathTurnsCount: 0,

    resetMetrics() {
        this.currentPathLength = 0;
        this.currentPathTurnsCount = 0;
    },

    convertIndexToRowCol(index, cols) {
        const row = Math.floor(index / cols);
        const col = Math.floor(index % cols);
        return { row, col };
    },

    convertRowColToIndex(row, col, numOfCols) {
        return row * numOfCols + col;
    },

    directions() {
        return [
            (grid, cols, index) => { // UP
                const { row, col } = this.convertIndexToRowCol(index, cols);
                const newIndex = this.convertRowColToIndex(row - 1, col, cols);
                return grid[newIndex];
            },
            (grid, cols, index) => { // RIGHT
                const { row, col } = this.convertIndexToRowCol(index, cols);
                if (col === cols - 1) return null; // Index can wrap at the border
                const newIndex = this.convertRowColToIndex(row, col + 1, cols);
                return grid[newIndex];
            },
            (grid, cols, index) => { // DOWN
                const { row, col } = this.convertIndexToRowCol(index, cols);
                const newIndex = this.convertRowColToIndex(row + 1, col, cols);
                return grid[newIndex];
            },
            (grid, cols, index) => {// LEFT
                const { row, col } = this.convertIndexToRowCol(index, cols);
                if (col === 0) return null; // Index can wrap at the border
                const newIndex = this.convertRowColToIndex(row, col - 1, cols);
                return grid[newIndex];
            },
        ]
    },

    directionsNamed() {
        return {
            UP: (grid, cols, index) => { // UP
                const { row, col } = this.convertIndexToRowCol(index, cols);
                const newIndex = this.convertRowColToIndex(row - 1, col, cols);
                return grid[newIndex];
            },
            RIGHT: (grid, cols, index) => { // RIGHT
                const { row, col } = this.convertIndexToRowCol(index, cols);
                if (col === cols - 1) return null; // Index can wrap at the border
                const newIndex = this.convertRowColToIndex(row, col + 1, cols);
                return grid[newIndex];
            },
            DOWN: (grid, cols, index) => { // DOWN
                const { row, col } = this.convertIndexToRowCol(index, cols);
                const newIndex = this.convertRowColToIndex(row + 1, col, cols);
                return grid[newIndex];
            },
            LEFT: (grid, cols, index) => {// LEFT
                const { row, col } = this.convertIndexToRowCol(index, cols);
                if (col === 0) return null; // Index can wrap at the border
                const newIndex = this.convertRowColToIndex(row, col - 1, cols);
                return grid[newIndex];
            },
        }
    },

    nodesAreEqual(node1, node2) {
        const sameRow = node1.row === node2.row;
        const sameCol = node1.col === node2.col;
        if (sameRow && sameCol) return true;
        return false;
    },

    backtrackChain(endNode, startNode) {
        const path = [];
        let currentNode = endNode;
        const intervalID = setInterval(() => {
            if (!this.nodesAreEqual(currentNode, startNode) && currentNode) {
                currentNode.type = "PATH";
                path.push(currentNode);
                const previousNode = currentNode.previous;
                // Count the turns
                if (currentNode.pointingDirection && previousNode.pointingDirection) {
                    if (currentNode.pointingDirection !== previousNode.pointingDirection) {
                        this.currentPathTurnsCount++;
                    }
                }
                currentNode = currentNode.previous;
                this.currentPathLength++;
            } else {
                // At the start node
                currentNode.type = "PATH";
                path.push(currentNode);
                clearInterval(intervalID);
            }
            canvas.drawGrid(Grid.getTiles());
            document.getElementById("path-length").innerText = this.currentPathLength;
            document.getElementById("turns-count").innerText = this.currentPathTurnsCount;
        }, this.refreshTime);
    },

    BFS(grid, cols, startNode, endNode) {
        startNode.start = true;
        endNode.end = true;

        let currentNode = startNode;
        startNode.inQueue = true;
        const nodeQueue = [];

        const intervalID = setInterval(() => {
            if (currentNode && !this.nodesAreEqual(currentNode, endNode)) {
                for (let [direction, dir] of Object.entries(this.directionsNamed())) {
                    const currentIndex = this.convertRowColToIndex(currentNode.row, currentNode.col, cols);
                    const newNode = dir(grid, cols, currentIndex);
                    if (newNode && newNode.type === "EMPTY" && !newNode.inQueue) {
                        newNode.pointingDirection = direction;
                        newNode.previous = currentNode;
                        nodeQueue.push(newNode);
                        newNode.type = "QUEUED";
                        newNode.inQueue = true;
                    }
                }
                currentNode.type = "ROUTED";
                currentNode = nodeQueue.shift();
                if (currentNode) currentNode.type = "HEAD";
                canvas.drawGrid(Grid.getTiles());
            } else {
                clearInterval(intervalID);
                if (currentNode && this.nodesAreEqual(currentNode, endNode)) {
                    this.backtrackChain(endNode, startNode);
                }
                console.log(currentNode);
            }
        }, this.refreshTime);
    },

    lee(grid, cols, startNode, endNode) {
        startNode.start = true;
        endNode.end = true;

        let currentNode = startNode;
        startNode.inQueue = true;
        let pathDistance = 0;
        startNode.pathDistance = pathDistance;

        let currentWave = [startNode];
        let nextWave = [];

        const intervalID = setInterval(() => {
            // Check that there are entries in both queues
            if (currentWave.length > 0) {
                currentNode = currentWave.shift();
                if (!this.nodesAreEqual(currentNode, endNode)) {
                    currentNode.type = "HEAD";
                    for (let dir of this.directions()) {
                        const currentIndex = this.convertRowColToIndex(currentNode.row, currentNode.col, cols);
                        const newNode = dir(grid, cols, currentIndex);
                        if (newNode && newNode.type === "EMPTY" && !newNode.inQueue) {
                            newNode.previous = currentNode;
                            newNode.type = "QUEUED";
                            newNode.inQueue = true;
                            newNode.pathDistance = pathDistance;
                            nextWave.push(newNode);
                        }
                    }
                    currentNode.type = "ROUTED";
                    canvas.drawGrid(Grid.getTiles());
                } else {
                    clearInterval(intervalID);
                    this.backtrackChain(endNode, startNode);
                    canvas.drawGrid(Grid.getTiles(), "DISTANCE");
                }
            } else {
                if (nextWave.length > 0) {
                    currentWave = [...nextWave];
                    nextWave = [];
                    pathDistance++;
                } else {
                    clearInterval(intervalID);
                    canvas.drawGrid(Grid.getTiles(), "DISTANCE");
                }
            }
        }, this.refreshTime);
    },

    goingBackwards(toDirection, fromDirection) {
        if (toDirection === "RIGHT" && fromDirection === "LEFT") return true;
        if (toDirection === "UP" && fromDirection === "DOWN") return true;
        if (toDirection === "LEFT" && fromDirection === "RIGHT") return true;
        if (toDirection === "DOWN" && fromDirection === "UP") return true;
        return false;
    },

    turnsCounting(node, direction) {
        if (node.pointingDirections.length === 0) return 0; // Starting node has no pointing direction, so no turn
        if (node.previousPointingDirection === direction) return 0; // No turn needed
        return 1;
    },

    backtrackLeastTurnsChain(endNode, startNode) {
        const path = [];
        let currentNode = endNode;
        const intervalID = setInterval(() => {
            if (!this.nodesAreEqual(currentNode, startNode) && currentNode) {
                currentNode.type = "PATH";
                path.push(currentNode);

                let previousNode;
                if (currentNode.previous.length > 1) {
                    // Get the one that doesn't turn
                    null; // for now
                } else {
                    previousNode = currentNode.previous[0]; // Should only be one entry
                }
                // Count the turns
                if (currentNode.pointingDirection && previousNode.pointingDirection) {
                    if (currentNode.pointingDirection !== previousNode.pointingDirection) {
                        this.currentPathTurnsCount++;
                    }
                }
                currentNode = previousNode;
                this.currentPathLength++;
            } else {
                // At the start node
                currentNode.type = "PATH";
                path.push(currentNode);
                clearInterval(intervalID);
            }
            canvas.drawGrid(Grid.getTiles());
            document.getElementById("path-length").innerText = this.currentPathLength;
            document.getElementById("turns-count").innerText = this.currentPathTurnsCount;
        }, this.refreshTime);
    },

    leastTurns(grid, cols, startNode, endNode) {
        startNode.start = true;
        endNode.end = true;

        let currentNode = startNode;
        startNode.inQueue = true;
        let turnCount = 0;
        startNode.turnCount = turnCount;

        let currentWave = [startNode];
        let nextWave = [];

        const intervalID = setInterval(() => {
            // Check that there are entries in both queues
            if (currentWave.length > 0) {
                currentNode = currentWave.shift();
                // Initialise direction and previous links
                if (!currentNode.pointingDirections) currentNode.pointingDirections = [];
                if (!currentNode.previous) currentNode.previous = [];
                
                if (!this.nodesAreEqual(currentNode, endNode)) {
                    currentNode.type = "HEAD";
                    for (let [direction, dir] of Object.entries(this.directionsNamed())) {
                        const currentIndex = this.convertRowColToIndex(currentNode.row, currentNode.col, cols);
                        const newNode = dir(grid, cols, currentIndex);
                        // Make sure not going back on yourself
                        const tileIsValid = newNode && newNode.type !== Grid.tileTypes.OBSTACLE;
                        if (tileIsValid && !this.goingBackwards(direction, currentNode.previousPointingDirection)) {
                            // Does the next node had a turn count, if not just assing it and put in the correct queue
                            const turn = this.turnsCounting(currentNode, direction);
                            const turnsToNeighbour = turnCount + turn;

                            if (newNode.turnCount === undefined) { // No turn count set yet
                                newNode.turnCount = turnsToNeighbour;
                                if (!newNode.previous) {
                                    newNode.previous = [currentNode];
                                } else {
                                    newNode.previous.push(currentNode);
                                }
                                newNode.previousPointingDirection = direction;
                                newNode.type = "QUEUED";
                                if (turn) {
                                    nextWave.push(newNode);
                                } else {
                                    currentWave.push(newNode);
                                }
                                currentNode.pointingDirections.push(direction);
                                
                            } else { // Turn count is set
                                if (turnsToNeighbour < newNode.turnCount) {
                                    currentNode.pointingDirections.push(direction);
                                    newNode.turnCount = turnsToNeighbour;
                                    newNode.previous = [currentNode]; // All other previous node has longer turn counts so remove them
                                    newNode.previousPointingDirection = direction;
                                    newNode.type = "QUEUED";
                                    currentWave.push(newNode);

                                } else if (turnsToNeighbour === newNode.turnCount) {
                                    currentNode.pointingDirections.push(direction);
                                    newNode.previous.push(currentNode); // Add the current node to the list of previous nodes
                                    newNode.previousPointingDirection = direction;
                                    newNode.type = "QUEUED";
                                    
                                }
                            }
                        }
                    }
                    canvas.drawGrid(Grid.getTiles());
                    currentNode.type = "ROUTED";
                } else {
                    clearInterval(intervalID);
                    this.backtrackLeastTurnsChain(endNode, startNode);
                    canvas.drawGrid(Grid.getTiles(), "DISTANCE");
                }
            } else {
                if (nextWave.length > 0) {
                    currentWave = [...nextWave];
                    nextWave = [];
                    turnCount++;
                } else {
                    clearInterval(intervalID);
                    canvas.drawGrid(Grid.getTiles(), "DISTANCE");
                }
            }
        }, this.refreshTime);
    }
}