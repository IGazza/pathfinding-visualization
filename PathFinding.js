const PathFinding = {
    stepTimer: 10,
    intervalID: null,

    currentPathLength: 0,
    currentPathTurnsCount: 0,

    resetMetrics() {
        this.currentPathLength = 0;
        this.currentPathTurnsCount = 0;
    },

    convertIndexToRowCol(index) {
        const row = Math.floor(index / this.cols);
        const col = Math.floor(index % this.cols);
        return { row, col };
    },

    convertRowColToIndex(row, col) {
        return row * this.cols + col;
    },

    cacheGridDimensions() {
        const { rows, cols } = Grid.getDimensions();
        this.rows = rows;
        this.cols = cols;
    },

    namedDirections() {
        return {
            UP: (index) => {
                const { row, col } = this.convertIndexToRowCol(index);
                const newIndex = this.convertRowColToIndex(row - 1, col);
                return Grid.getTileAtIndex(newIndex);
            },
            RIGHT: (index) => {
                const { row, col } = this.convertIndexToRowCol(index);
                if (col === this.cols - 1) return null; // Index can wrap at the border
                const newIndex = this.convertRowColToIndex(row, col + 1);
                return Grid.getTileAtIndex(newIndex);
            },
            DOWN: (index) => {
                const { row, col } = this.convertIndexToRowCol(index);
                const newIndex = this.convertRowColToIndex(row + 1, col);
                return Grid.getTileAtIndex(newIndex);
            },
            LEFT: (index) => {
                const { row, col } = this.convertIndexToRowCol(index);
                if (col === 0) return null; // Index can wrap at the border
                const newIndex = this.convertRowColToIndex(row, col - 1);
                return Grid.getTileAtIndex(newIndex);
            },
        }
    },

    namedDirectionsPositions() {
        return {
            UP: (node) => {
                if (node.row > 0) {
                    return {
                        row: node.row - 1,
                        col: node.col
                    }
                }
                return null;
            },
            RIGHT: (node) => {
                if (node.col < this.cols) {
                    return {
                        row: node.row,
                        col: node.col + 1
                    }
                }
                return null;
            },
            DOWN: (node) => {
                if (node.row < this.rows) {
                    return {
                        row: node.row + 1,
                        col: node.col
                    }
                }
                return null;
            },
            LEFT: (node) => {
                if (node.col > 0) {
                    return {
                        row: node.row,
                        col: node.col - 1
                    }
                }
                return null;
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

    getValidNeighbourNode(currentNode, getNodeInDirectionFunc) {
        const currentIndex = this.convertRowColToIndex(currentNode.row, currentNode.col);
        const newNode = getNodeInDirectionFunc(currentIndex);
        if (newNode && newNode.type === "EMPTY" && !newNode.inQueue) {
            return newNode;
        }
        return null;
    },

    processNeighbourNodes(currentNode) {
        const nodesToBeAddedToQueue = [];
        for (let [direction, getIndexOfNodeInDirectionFunc] of Object.entries(this.namedDirections())) {
            const newNode = this.getValidNeighbourNode(currentNode, getIndexOfNodeInDirectionFunc);
            if (newNode) {
                newNode.pointingDirection = direction;
                newNode.previous = currentNode;
                newNode.type = "QUEUED";
                newNode.inQueue = true;
                nodesToBeAddedToQueue.push(newNode);
            }
        }
        return nodesToBeAddedToQueue;
    },

    checkForTurn(currentNode, previousNode) {
        if (currentNode.pointingDirection && previousNode.pointingDirection) {
            if (currentNode.pointingDirection !== previousNode.pointingDirection) {
                return 1
            }
        }
        return 0;
    },

    backtrackChain(endNode, startNode) {
        const path = [];
        let currentNode = endNode;
        this.intervalID = setInterval(() => {
            currentNode.type = "PATH";
            path.push(currentNode);
            if (this.nodesAreEqual(currentNode, startNode)) {
                clearInterval(this.intervalID);
            } else {
                const previousNode = currentNode.previous;
                this.currentPathLength++;
                this.currentPathTurnsCount += this.checkForTurn(currentNode, previousNode)
                currentNode = currentNode.previous;
            }
            canvas.drawGrid(Grid.getTiles());
            document.getElementById("path-length").innerText = this.currentPathLength;
            document.getElementById("turns-count").innerText = this.currentPathTurnsCount;
        }, this.stepTimer);
    },

    DFS() {
        const startNode = Grid.getStart();
        const endNode = Grid.getEnd();
        const nodeQueue = [startNode];
        startNode.inQueue = true;
        this.cacheGridDimensions();

        this.intervalID = setInterval(() => {
            if (nodeQueue.length > 0) {
                const currentNode = nodeQueue.pop();
                currentNode.type = "HEAD";
                canvas.drawGrid(Grid.getTiles());

                if (this.nodesAreEqual(currentNode, endNode)) {
                    clearInterval(this.intervalID);
                    this.backtrackChain(endNode, startNode);
                } else {
                    const newNodes = this.processNeighbourNodes(currentNode);
                    for (let node of newNodes) nodeQueue.push(node);
                    currentNode.type = "ROUTED";
                }
            } else {
                // End node is unreachable: stop simulation
                clearInterval(this.intervalID);
            }
        }, this.stepTimer);
    },


    BFS() {
        const startNode = Grid.getStart();
        const endNode = Grid.getEnd();
        const nodeQueue = [startNode];
        startNode.inQueue = true;
        this.cacheGridDimensions();

        this.intervalID = setInterval(() => {
            if (nodeQueue.length > 0) {
                const currentNode = nodeQueue.shift();
                currentNode.type = "HEAD";
                canvas.drawGrid(Grid.getTiles());

                if (this.nodesAreEqual(currentNode, endNode)) {
                    clearInterval(this.intervalID);
                    this.backtrackChain(endNode, startNode);
                } else {
                    const newNodes = this.processNeighbourNodes(currentNode);
                    for (let node of newNodes) nodeQueue.push(node);
                    currentNode.type = "ROUTED";
                }
            } else {
                // End node is unreachable: stop simulation
                clearInterval(this.intervalID);
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

    getTurnsToNeighbour(node, direction) {
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

    getValidNeighbourNodeLeastTurns(currentNode, getNodeInDirectionFunc) {
        const currentIndex = this.convertRowColToIndex(currentNode.row, currentNode.col);
        const newNode = getNodeInDirectionFunc(currentIndex);
        const isDirectionBackwards = this.goingBackwards(direction, currentNode.previousPointingDirection)
        if (newNode && newNode.type === "EMPTY" && !newNode.inQueue && !isDirectionBackwards) {
            return newNode;
        }
        return null;
    },

    processNeighbourNodesLeastTurns(currentNode) {
        for (let [direction, getIndexOfNodeInDirectionFunc] of Object.entries(this.namedDirections())) {
            const newNode = this.getValidNeighbourNodeLeastTurns(currentNode, getIndexOfNodeInDirectionFunc);

            if (newNode) {
                const turn = this.getTurnsToNeighbour(currentNode, direction);
                const turnsToNeighbour = turnCount + turn;

                if (newNode.turnCount === undefined) { // No turn count set yet (not visited)
                    newNode.turnCount = turnsToNeighbour;
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
    },

    leastTurns() {
        const startNode = Grid.getStart();
        const endNode = Grid.getEnd();
        let currentNode = startNode;
        let turnCount = startNode.turnCount = 0;
        let currentWave = [startNode];
        let nextWave = [];
        startNode.pointingDirections = [];
        startNode.previousNodes = [];

        this.intervalID = setInterval(() => {
            // Check that there are entries in both queues
            if (currentWave.length > 0) {
                currentNode = currentWave.shift();
                currentNode.type = "HEAD";
                canvas.drawGrid(Grid.getTiles());


                if (this.nodesAreEqual(currentNode, endNode)) {
                    clearInterval(this.intervalID);
                    this.backtrackLeastTurnsChain(endNode, startNode);
                    canvas.drawGrid(Grid.getTiles(), "DISTANCE");

                } else {
                    const newNodes = this.processNeighbourNodesLeastTurns(currentNode);
                    // Decide which list they go in...
                    currentNode.type = "ROUTED";                    
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

    iterateWave(wave, nextWave) {
        wave = nextWave;
        nextWave = [];
    },

    getDirection(node, previousNode) {
        const rowDiff = node.row - previousNode.row;
        const colDiff = node.col - previousNode.col;
        if (rowDiff === 0 && colDiff > 0) return "RIGTH";
        if (rowDiff === 0 && colDiff < 0) return "LEFT";
        if (colDiff === 0 && rowDiff < 0) return "UP";
        if (colDiff === 0 && rowDiff > 0) return "DOWN";
    },

    getTurnsToNeighbour(node, direction) {
        if (node.previous) { //Start node has no previous node: no turns from starting node
            const previousDirection = this.getDirection(node, node.previous);
            if (previousDirection === direction) return 0;
        }
        return 1;
    },

    getValidNeighbourNodeLeastTurns(currentNode, getNodeInDirectionFunc) {
        const newNode = getNodeInDirectionFunc(currentNode);
        const isPreviousNode = this.nodesAreEqual(currentNode.previous, newNode);
        if (newNode && newNode.type === "EMPTY" && !isPreviousNode) {
            newNode.previous = currentNode;
            return newNode;
        }
        return null;
    },

    getGridNode(node) {
        const index = node.row * this.cols + node.col;
        return Grid.getTileAtIndex(index);
    },

    processNeighbourNodesLeastTurns(currentNode) {
        const currentWave = [];
        const nextWave = [];
        for (let [direction, getIndexOfNodeInDirectionFunc] of Object.entries(this.namedDirectionsPositions())) {
            const newNode = this.getValidNeighbourNodeLeastTurns(currentNode, getIndexOfNodeInDirectionFunc);

            if (newNode) {
                const turn = this.getTurnsToNeighbour(currentNode, direction);
                const turnsToNeighbour = currentNode.turnCount + turn;
                newNode.turnCount = turnsToNeighbour;
                const gridNode = this.getGridNode(newNode);

                if (gridNode.turnCount === undefined) {
                    gridNode.previousNodes = [currentNode];
                    gridNode.turnCount = turnsToNeighbour;
                    gridNode.type = "QUEUED";
                    if (turn) {
                        currentWave.push(newNode);
                    } else {
                        nextWave.push(newNode);
                    }

                } else {
                    if (turnsToNeighbour < gridNode.turnCount) {
                        gridNode.previousNodes = [currentNode];
                        gridNode.turnCount = turnsToNeighbour;
                        newNode.type = "QUEUED";
                        currentWave.push(newNode)

                    } else if (turnsToNeighbour === gridNode.turnCount) {
                        const isPreviousNodeAlreadyAdded
                            = gridNode.previousNodes.some(node => this.nodesAreEqual(node, newNode));
                        if (isPreviousNodeAlreadyAdded) {
                            gridNode.previousNodes.push(currentNode); // Add the current node to the list of previous nodes
                        }
                        newNode.type = "QUEUED";
                        if (turn) {
                            currentWave.push(newNode);
                        } else {
                            nextWave.push(newNode);
                        }
                    }
                }
            }
        }
        return { currentWave, nextWave };
    },

    leastTurnsUsingPositionReference() {
        this.cacheGridDimensions();
        const startNode = {
            row: Grid.getStart().row,
            col: Grid.getStart().col
        }
        const endNode = {
            row: Grid.getEnd().row,
            col: Grid.getEnd().col
        }
        const currentWave = [startNode];
        const nextWave = [];

        this.intervalID = setInterval(() => {
            if (currentWave.length > 0) {
                const currentNode = currentWave.shift();
                currentNode.type = "HEAD";

                if (this.nodesAreEqual(currentNode, endNode)) {
                    clearInterval(this.intervalID);
                    // Backtrack
                } else {
                    const { currentWave: noTurnNodes, nextWave: oneTurnNodes }
                        = this.getValidNeighbourNodeLeastTurns(currentNode);

                    for (let node of noTurnNodes) {
                        currentWave.push(node);
                    }
                    for (let node of oneTurnNodes) {
                        nextWave.push(node);
                    }
                    currentNode.type = "ROUTED";
                }
                // Run the pathfinding
            } else {
                // Check if the next wave has entries
                if (nextWave.length > 0) {
                    this.iterateWave(currentWave, nextWave);
                } else {
                    // No nodes reached: end simulation
                    clearInterval(this.intervalID);
                }
            }

        }, this.stepTimer)

    },

    getDistance(nodeA, nodeB) {
        const dx = nodeA.col - nodeB.col;
        const dy = nodeA.row - nodeB.row;
        return Math.sqrt(dx * dx + dy * dy);
    },

    AStar() {
        this.cacheGridDimensions();
        const startNode = Grid.getStart();
        const endNode = Grid.getEnd();
        const nodeQueue = [startNode];
        startNode.inQueue = true;
        startNode.gScore = 0;

        this.intervalID = setInterval(() => {
            if (nodeQueue.length > 0) {
                nodeQueue.sort((a, b) => a.fScore - b.fScore);
                const currentNode = nodeQueue.shift(); // Take node with lowest fScore
                currentNode.type = "HEAD";
                canvas.drawGrid(Grid.getTiles());

                if (this.nodesAreEqual(currentNode, endNode)) {
                    clearInterval(this.intervalID);
                    this.backtrackChain(endNode, startNode);

                } else {
                    const newNodes = this.processNeighbourNodes(currentNode);
                    for (let node of newNodes) {
                        const distanceToEnd = this.getDistance(currentNode, endNode);
                        node.gScore = currentNode.gScore + 1;
                        node.fScore = node.gScore + distanceToEnd;
                        nodeQueue.push(node);
                    }
                    currentNode.type = "ROUTED";
                }
            }
        }, this.stepTimer);
    }
}