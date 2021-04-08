const PathFinding = {
    stepTimer: 10,
    intervalID: null,

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

    stopSimulation() {
        clearInterval(this.intervalID);
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
        this.intervalID = setInterval(() => {
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
                clearInterval(this.intervalID);
            }
            canvas.drawGrid(Grid.getTiles());
            document.getElementById("path-length").innerText = this.currentPathLength;
            document.getElementById("turns-count").innerText = this.currentPathTurnsCount;
        }, this.stepTimer);
    },

    DFS(grid, cols, startNode, endNode) {
        startNode.start = true;
        endNode.end = true;

        let currentNode = startNode;
        startNode.inQueue = true;
        const nodeQueue = [];

        this.intervalID = setInterval(() => {
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
                currentNode = nodeQueue.pop();
                if (currentNode) currentNode.type = "HEAD";
                canvas.drawGrid(Grid.getTiles());
            } else {
                clearInterval(this.intervalID);
                if (currentNode && this.nodesAreEqual(currentNode, endNode)) {
                    this.backtrackChain(endNode, startNode);
                }
                console.log(currentNode);
            }
        }, this.stepTimer);
    },

    BFS(grid, cols, startNode, endNode) {
        startNode.start = true;
        endNode.end = true;

        let currentNode = startNode;
        startNode.inQueue = true;
        const nodeQueue = [];

        this.intervalID = setInterval(() => {
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
                clearInterval(this.intervalID);
                if (currentNode && this.nodesAreEqual(currentNode, endNode)) {
                    this.backtrackChain(endNode, startNode);
                }
                console.log(currentNode);
            }
        }, this.stepTimer);
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

        this.intervalID = setInterval(() => {
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
                    clearInterval(this.intervalID);
                    this.backtrackChain(endNode, startNode);
                    canvas.drawGrid(Grid.getTiles(), "DISTANCE");
                }
            } else {
                if (nextWave.length > 0) {
                    currentWave = [...nextWave];
                    nextWave = [];
                    pathDistance++;
                } else {
                    clearInterval(this.intervalID);
                    canvas.drawGrid(Grid.getTiles(), "DISTANCE");
                }
            }
        }, this.stepTimer);
    },

    goingBackwards(toDirection, fromDirection) {
        if (toDirection === "RIGHT" && fromDirection === "LEFT") return true;
        if (toDirection === "UP" && fromDirection === "DOWN") return true;
        if (toDirection === "LEFT" && fromDirection === "RIGHT") return true;
        if (toDirection === "DOWN" && fromDirection === "UP") return true;
        return false;
    },

    turnsCounting(node, direction) {
        if (node.isStart) return 0; // No turns from starting node
        if (node.previousPointingDirection === direction) return 0; // No turn needed
        return 1;
    },

    getBacktrackDirection(node, previousNode) {
        if (previousNode.row === node.row - 1) return "UP";
        if (previousNode.row === node.row + 1) return "DOWN";
        if (previousNode.col === node.col - 1) return "LEFT";
        if (previousNode.col === node.col + 1) return "RIGHT";
        throw new Error("Unable to calculate backtrack direction: Nodes are not nearest neighbours");
    },

    backtrackLeastTurnsChain(endNode, startNode) {
        const path = [];
        let currentNode = endNode;
        // If there are two routes to the end node, we need to just take one route back
        // Take the first entry in the previous nodes array
        let backtrackDirection
            = this.getBacktrackDirection(endNode, endNode.previous[0]);

        this.intervalID = setInterval(() => {
            if (!this.nodesAreEqual(currentNode, startNode) && currentNode) {
                currentNode.type = "PATH";
                path.push(currentNode);

                let previousNode;
                if (currentNode.previous.length > 1) {
                    // This will handle the case that two routes get to
                    // the end at the same time It will pick the last 
                    const possibleBackTrackDirections
                        = currentNode.previous.map(neighbour => this.getBacktrackDirection(currentNode, neighbour));
                    const previousNodeIndex
                        = possibleBackTrackDirections.findIndex(direction => direction === backtrackDirection);

                    previousNode = currentNode.previous[previousNodeIndex];
                    const nextDirection = this.getBacktrackDirection(currentNode, previousNode);
                    if (nextDirection !== backtrackDirection) {
                        this.currentPathTurnsCount++;
                    }
                } else {
                    previousNode = currentNode.previous[0]; // Should only be one entry
                    const nextDirection = this.getBacktrackDirection(currentNode, previousNode);
                    if (nextDirection !== backtrackDirection) {
                        this.currentPathTurnsCount++;
                    }
                    backtrackDirection = nextDirection;
                }
                currentNode = previousNode;
                this.currentPathLength++;
                document.getElementById("path-length").innerText = this.currentPathLength;
                document.getElementById("turns-count").innerText = this.currentPathTurnsCount;
            } else {
                // At the start node
                currentNode.type = "PATH";
                path.push(currentNode);
                clearInterval(this.intervalID);
            }
            canvas.drawGrid(Grid.getTiles());
        }, this.stepTimer);
    },

    leastTurns(grid, cols, startNode, endNode) {
        let currentNode = startNode;
        let turnCount = 0;
        startNode.inQueue = true;
        startNode.turnCount = turnCount;

        let currentWave = [startNode];
        let nextWave = [];

        this.intervalID = setInterval(() => {
            // Check that there are entries in both queues
            if (currentWave.length > 0) {
                currentNode = currentWave.shift();
                if (!currentNode.pointingDirections) currentNode.pointingDirections = [];

                if (!this.nodesAreEqual(currentNode, endNode)) {
                    currentNode.type = "HEAD";
                    canvas.drawGrid(Grid.getTiles());

                    for (let [direction, dir] of Object.entries(this.directionsNamed())) {
                        const currentIndex = this.convertRowColToIndex(currentNode.row, currentNode.col, cols);
                        const newNode = dir(grid, cols, currentIndex);
                        const tileIsValid = newNode && newNode.type !== Grid.tileTypes.OBSTACLE;

                        if (tileIsValid && !this.goingBackwards(direction, currentNode.previousPointingDirection)) {
                            const turn = this.turnsCounting(currentNode, direction);
                            const turnsToNeighbour = turnCount + turn;

                            if (newNode.turnCount === undefined) { // No turn count set yet (not visited)
                                newNode.turnCount = turnsToNeighbour;
                                newNode.previousPointingDirection = direction;
                                newNode.type = "QUEUED";
                                newNode.previous = [currentNode];
                                if (!currentNode.pointingDirections.includes(direction)) {
                                    currentNode.pointingDirections.push(direction);
                                }
                                if (turn) {
                                    nextWave.push(newNode);
                                } else {
                                    currentWave.push(newNode);
                                }

                            } else { // Turn count is set
                                if (turnsToNeighbour < newNode.turnCount) {
                                    if (!currentNode.pointingDirections.includes(direction)) {
                                        currentNode.pointingDirections.push(direction);
                                    }
                                    newNode.turnCount = turnsToNeighbour;
                                    newNode.previous = [currentNode]; // All other previous node has longer turn counts so remove them
                                    newNode.previousPointingDirection = direction;
                                    newNode.type = "QUEUED";
                                    currentWave.push(newNode);

                                } else if (turnsToNeighbour === newNode.turnCount) {
                                    if (!currentNode.pointingDirections.includes(direction)) {
                                        currentNode.pointingDirections.push(direction);
                                    }
                                    const isPreviousNodeAlreadyAssigned = newNode.previous.some(node => {
                                        const sameRow = node.row === currentNode.row;
                                        const sameCol = node.col === currentNode.col;
                                        if (sameRow && sameCol) return true;
                                    });
                                    if (!isPreviousNodeAlreadyAssigned) {
                                        newNode.previous.push(currentNode); // Add the current node to the list of previous nodes
                                    }
                                    newNode.previousPointingDirection = direction;
                                    newNode.type = "QUEUED";
                                    if (turn) {
                                        nextWave.push(newNode);
                                    } else {
                                        currentWave.push(newNode);
                                    }

                                }
                            }
                        }
                    }
                    currentNode.type = "ROUTED";
                } else {
                    clearInterval(this.intervalID);
                    this.backtrackLeastTurnsChain(endNode, startNode);
                    canvas.drawGrid(Grid.getTiles(), "DISTANCE");
                }
            } else {
                if (nextWave.length > 0) {
                    currentWave = [...nextWave];
                    nextWave = [];
                    turnCount++;
                } else {
                    clearInterval(this.intervalID);
                    canvas.drawGrid(Grid.getTiles(), "DISTANCE");
                }
            }
        }, this.stepTimer);
    },

    getDistance(nodeA, nodeB) {
        const dx = nodeA.col - nodeB.col;
        const dy = nodeA.row - nodeB.row;
        return Math.sqrt(dx * dx + dy * dy);
    },

    AStar(grid, cols, startNode, endNode) {
        startNode.pathDistance = startNode.gScore = 0;
        startNode.inQueue = true;
        const nodes = [startNode];

        this.intervalID = setInterval(() => {
            if (nodes.length > 0) {
                nodes.sort((a, b) => a.fScore - b.fScore);
                const currentNode = nodes.shift();
                currentNode.type = "HEAD";
                canvas.drawGrid(Grid.getTiles());

                if (!this.nodesAreEqual(currentNode, endNode)) {
                    for (let [direction, dir] of Object.entries(this.directionsNamed())) {
                        const currentIndex = this.convertRowColToIndex(currentNode.row, currentNode.col, cols);
                        const newNode = dir(grid, cols, currentIndex);
                        const tileIsValid = newNode && newNode.type !== Grid.tileTypes.OBSTACLE;
                        if (tileIsValid && !newNode.inQueue) {
                            newNode.inQueue = true;
                            newNode.type = "QUEUED";
                            newNode.previous = currentNode;
                            newNode.pointingDirection = direction;
                            const distanceToEnd = this.getDistance(currentNode, endNode);
                            newNode.gScore = currentNode.gScore + 1;
                            newNode.fScore = newNode.gScore + distanceToEnd;
                            nodes.push(newNode);
                        }
                    }
                    currentNode.type = "ROUTED";

                } else {
                    clearInterval(this.intervalID);
                    if (currentNode && this.nodesAreEqual(currentNode, endNode)) {
                        this.backtrackChain(endNode, startNode);
                    }
                }
            }
        }, this.stepTimer);
    }
}