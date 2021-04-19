const PathFinding = {
    stepTimer: 10,
    intervalID: null,
    currentPathLength: 0,
    currentPathTurnsCount: 0,


    
    /**
     * Resets the path length and turn counts metric for the
     * current path being calculated.
     */
    resetMetrics() {
        this.currentPathLength = 0;
        this.currentPathTurnsCount = 0;
    },



    /**
     * Converts a grid tiles index into a row, col position
     * @param {number} index 
     * @returns {row: number, col: number}
     */
    convertIndexToRowCol(index) {
        const row = Math.floor(index / Grid.getCols());
        const col = Math.floor(index % Grid.getCols());
        return { row, col };
    },


    
    /**
     * Converts a row and column to the index in the Grid tiles array
     * @param {number} row 
     * @param {number} col 
     * @returns {number}
     */
    convertRowColToIndex(row, col) {
        return row * Grid.getCols() + col;
    },



    /**
     * Function for obtaining named direction functions used to get neighbours for
     * a specified node by using its index. This interfaces directly with the Grid
     * Object to get tiles using the index.
     * @returns {Object} Object containing function for each cardinal direction.
     * Each function uses a node index to calculate the new node if it is within
     * the valid range.
     */
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



    /**
     * Function for obtaining named direction functions used to get neighbours for
     * a specified node by using its position.
     * @returns {Object} Object containing function for each cardinal direction.
     * Each function uses a nodes position to calculate a neighbour node if it
     * exists in the valid range.
     */
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



    /**
     * Clears the current interval
     */
    stopSimulation() {
        clearInterval(this.intervalID);
    },



    /**
     * Checks whether two nodes are equal based on their
     * row and column position
     * @param {node} node1 
     * @param {node} node2 
     * @returns {boolean}
     */
    nodesAreEqual(node1, node2) {
        const sameRow = node1.row === node2.row;
        const sameCol = node1.col === node2.col;
        if (sameRow && sameCol) return true;
        return false;
    },



    /**
     * Takes a node and a direction function and checks whether the node in that 
     * direction is valid. If so, it returns the node, otherwise it returns null.
     * @param {node} currentNode 
     * @param {Function} getNodeInDirectionFunc 
     * @returns {node|null}
     */
    getValidNeighbourNode(currentNode, getNodeInDirectionFunc) {
        const currentIndex = this.convertRowColToIndex(currentNode.row, currentNode.col);
        const newNode = getNodeInDirectionFunc(currentIndex);
        if (newNode && newNode.type === "EMPTY" && !newNode.inQueue) {
            return newNode;
        }
        return null;
    },



    /**
     * Considers each neighbour of the current node, and if valid, adds
     * them to an array of nodes that should be added to the pathfinding queue.
     * @param {node} currentNode 
     * @returns {Array<node>}
     */
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



    /**
     * Checks if a turn is needed to reach the neighbour of the specified node, using
     * the current direction the node is heading in.
     * @param {node} currentNode 
     * @param {node} previousNode 
     * @returns {0|1}
     */
    checkForTurn(currentNode, previousNode) {
        if (currentNode.pointingDirection && previousNode.pointingDirection) {
            if (currentNode.pointingDirection !== previousNode.pointingDirection) {
                return 1
            }
        }
        return 0;
    },



    /**
     * Traverses the nodes chain made in the pathfinding algorithms 
     * and displays the path on a regular interval.
     * @param {Grid.tile} endNode 
     * @param {Grid.tile} startNode 
     */
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



    /**
     * Iteratively calculates and display the steps in the
     * Depth First Search pathfinding algorithm.
     */
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



    /**
     * Iteratively calculates and display the steps in the
     * Bread First Search pathfinding algorithm.
     */
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



    /**
     * Takes a node and its previous node connection to determine which direction
     * the node chain is currently heading in.
     * @param {node} node 
     * @param {node} previousNode 
     * @returns {"RIGHT"|"UP"|"DOWN"|"LEFT"}
     */
    getDirection(node, previousNode) {
        const rowDiff = node.row - previousNode.row;
        const colDiff = node.col - previousNode.col;
        if (rowDiff === 0 && colDiff > 0) return "RIGHT";
        if (rowDiff === 0 && colDiff < 0) return "LEFT";
        if (colDiff === 0 && rowDiff < 0) return "UP";
        if (colDiff === 0 && rowDiff > 0) return "DOWN";
    },



    /**
     * Checks if a turn is needed to reach the neighbour of the specified node, using
     * the current direction the node is heading in.
     * @param {node} node 
     * @param {string} direction 
     * @returns {0|1}
     */
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



    /**
     * Takes a node and a direction function and checks whether the node in that 
     * direction is valid. If so, it returns the node, otherwise it returns null.
     * @param {node} currentNode 
     * @param {Function} getNodeInDirectionFunc 
     * @returns {node|null}
     */
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



    /**
     * Considers each neighbour of the current node, and if valid, assigns 
     * them to the corresponding array based on whether or not a turn is 
     * required to reach the new node.
     * @param {*} currentNode 
     * @returns {Object} Object
     * @returns {Array<node>} Object.nodesNotRequiringTurn Valid neighbours of the current node which do not require a turn to reach
     * @returns {Array<node>} Object.nodesRequiringTurn Valid neighbours of the current node which do require a turn to reach
     */
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



    /**
     * Traverses the nodes chain made in the leastTurns algorithm
     * and displays the path on a regular interval. Contains logic needed
     * to determine the shortest path when backtracking.
     * @param {Grid.tile} endNode 
     * @param {Grid.tile} startNode 
     */
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
     * Iteratively calculates and display the steps in a
     * least turn pathfinding algorithm. Finding a path that
     * has the minimum turns to the end node.
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

    /**
     * Returns the Euclidean distance between two nodes
     * @param {node} nodeA 
     * @param {node} nodeB 
     * @returns {number}
     */
    getDistance(nodeA, nodeB) {
        const dx = nodeA.col - nodeB.col;
        const dy = nodeA.row - nodeB.row;
        return Math.sqrt(dx * dx + dy * dy);
    },

    /**
     * Iteratively calculates and display the steps the A* 
     * pathfinding algorithm.
     */
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