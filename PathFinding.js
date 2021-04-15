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
        const row = Math.floor(index / Grid.getCols());
        const col = Math.floor(index % Grid.getCols());
        return { row, col };
    },

    convertRowColToIndex(row, col) {
        return row * Grid.getCols() + col;
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
                if (col === Grid.getCols() - 1) return null; // Index can wrap at the border
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
                if (node.col < Grid.getCols() - 1) {
                    return {
                        row: node.row,
                        col: node.col + 1
                    }
                }
                return null;
            },
            DOWN: (node) => {
                if (node.row < Grid.getRows() - 1) {
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

    getDirection(node, previousNode) {
        const rowDiff = node.row - previousNode.row;
        const colDiff = node.col - previousNode.col;
        if (rowDiff === 0 && colDiff > 0) return "RIGHT";
        if (rowDiff === 0 && colDiff < 0) return "LEFT";
        if (colDiff === 0 && rowDiff < 0) return "UP";
        if (colDiff === 0 && rowDiff > 0) return "DOWN";
    },

    getTurnsToNeighbour(node, direction) {
        if (node.previous) {
            const previousDirection = this.getDirection(node, node.previous);
            if (previousDirection === direction) {
                return 0;
            } else {
                return 1;
            }
        }
        return 0; // Start node have no previous node, so no turning required from it
    },

    getValidNeighbourNodeLeastTurns(currentNode, getNodeInDirectionFunc) {
        const newNode = getNodeInDirectionFunc(currentNode);
        if (newNode) {
            const newGridNode = Grid.getTileAtPosition(newNode.row, newNode.col);
            if (newGridNode.type === Grid.tileTypes.OBSTACLE) return null;
            if (currentNode.previous) {
                const isPreviousNode = this.nodesAreEqual(currentNode.previous, newNode);
                if (!isPreviousNode) return newNode;
            } else {
                // Start node has no previous node, so we don't need to check 
                // if we are going back on ourselves
                return newNode;
            }
        }
        return null;
    },

    getGridNode(node) {
        const index = node.row * Grid.getCols() + node.col;
        return Grid.getTileAtIndex(index);
    },

    processNeighbourNodesLeastTurns(currentNode) {
        const nodesNotRequiringTurn = [];
        const nodesRequiringTurn = [];
        const currentGridNode = Grid.getTileAtPosition(currentNode.row, currentNode.col);
        for (let [direction, getIndexOfNodeInDirectionFunc] of Object.entries(this.namedDirectionsPositions())) {
            const newNode = this.getValidNeighbourNodeLeastTurns(currentNode, getIndexOfNodeInDirectionFunc);

            if (newNode) {
                newNode.previous = currentNode;

                const turn = this.getTurnsToNeighbour(currentNode, direction);
                const turnsToNeighbour = currentNode.turnCount + turn;
                newNode.turnCount = turnsToNeighbour;

                const newGridNode = Grid.getTileAtPosition(newNode.row, newNode.col);

                if (newGridNode.turnCount === undefined) { // Node has not been visited yet

                    newGridNode.previousNodes = [currentGridNode];
                    newGridNode.turnCount = turnsToNeighbour;
                    newGridNode.type = "QUEUED";
                    if (turn) {
                        nodesRequiringTurn.push(newNode);
                    } else {
                        nodesNotRequiringTurn.push(newNode);
                    }

                } else {
                    if (turnsToNeighbour < newGridNode.turnCount) {
                        // TODO: It may be worth checking if this node was previously added to the next wave
                        //       As we have found a shorter turning path to it, there's no need to process it in the next wave
                        newGridNode.previousNodes = [currentGridNode];
                        newGridNode.turnCount = turnsToNeighbour;
                        newGridNode.type = "QUEUED";
                        nodesNotRequiringTurn.push(newNode)

                    } else if (turnsToNeighbour === newGridNode.turnCount) {
                        const previousNodeIsAlreadyAdded
                            = newGridNode.previousNodes.some(node => this.nodesAreEqual(node, newNode));
                        if (!previousNodeIsAlreadyAdded) {
                            newGridNode.previousNodes.push(currentGridNode); // Add the current node to the list of previous nodes
                        }
                        newGridNode.type = "QUEUED";
                        if (turn) {
                            nodesRequiringTurn.push(newNode);
                        } else {
                            nodesNotRequiringTurn.push(newNode);
                        }
                    }
                }
            }
        }
        currentGridNode.type = "ROUTED";
        return {
            nodesNotRequiringTurn,
            nodesRequiringTurn
        };
    },

    backtrackChainLeastTurns(endNode, startNode) {
        const path = [];
        let currentNode = endNode;
        let pointingDirection = null;
        this.intervalID = setInterval(() => {
            currentNode.type = "PATH";
            path.push(currentNode);
            if (this.nodesAreEqual(currentNode, startNode)) {
                clearInterval(this.intervalID);
            } else {
                // Check if there is a choice of directions to go in
                // If so pick the one that goes straight
                const nodeHasMultiplePreviousNodes = currentNode.previousNodes.length > 1;
                if (nodeHasMultiplePreviousNodes && !this.nodesAreEqual(currentNode, endNode)) {
                    const directionsToNodes = currentNode.previousNodes.map(node => {
                        return this.getDirection(currentNode, node);
                    });
                    const index = directionsToNodes.findIndex(dir => dir === pointingDirection);
                    const previousNode = currentNode.previousNodes[index];
                    const newPointingDirection = directionsToNodes[index];
                    if (newPointingDirection !== pointingDirection) {
                        this.currentPathTurnsCount++;
                    }
                    pointingDirection = newPointingDirection;
                    currentNode = previousNode;

                } else {
                    const previousNode = currentNode.previousNodes[0];
                    const newPointingDirection = this.getDirection(currentNode, previousNode);
                    if (pointingDirection && newPointingDirection !== pointingDirection) {
                        this.currentPathTurnsCount++;
                    }
                    pointingDirection = newPointingDirection;
                    currentNode = previousNode;
                }
                this.currentPathLength++;
            }
            canvas.drawGrid(Grid.getTiles());
            document.getElementById("path-length").innerText = this.currentPathLength;
            document.getElementById("turns-count").innerText = this.currentPathTurnsCount;
        }, this.stepTimer);
    },

    /**
     * 
     */
    leastTurns() {
        const startNode = {
            row: Grid.getStart().row,
            col: Grid.getStart().col,
            turnCount: 0
        }
        const endNode = {
            row: Grid.getEnd().row,
            col: Grid.getEnd().col
        }
        let currentWave = [startNode];
        let nextWave = [];

        this.intervalID = setInterval(() => {
            if (currentWave.length > 0) {
                const currentNode = currentWave.shift();
                currentNode.type = "HEAD";
                canvas.drawGrid(Grid.getTiles());

                if (this.nodesAreEqual(currentNode, endNode)) {
                    clearInterval(this.intervalID);
                    this.backtrackChainLeastTurns(Grid.getEnd(), Grid.getStart());
                } else {
                    const { nodesNotRequiringTurn, nodesRequiringTurn }
                        = this.processNeighbourNodesLeastTurns(currentNode);

                    for (let node of nodesNotRequiringTurn) {
                        currentWave.push(node);
                    }
                    for (let node of nodesRequiringTurn) {
                        nextWave.push(node);
                    }
                    currentNode.type = "ROUTED";
                }
                // Run the pathfinding
            } else {
                // Check if the next wave has entries
                if (nextWave.length > 0) {
                    currentWave = nextWave;
                    nextWave = [];
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