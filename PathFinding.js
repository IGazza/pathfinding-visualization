const PathFinding = {
    refreshTime: 1,

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
                currentNode = currentNode.previous;
            } else {
                // At the start node
                currentNode.type = "PATH";
                path.push(currentNode);
                clearInterval(intervalID);
            }
            canvas.drawGrid(Grid.getTiles());
        }, this.refreshTime);
    },

    BFS(grid, cols, startNode, endNode) {
        startNode.start = true;
        endNode.end = true;

        let currentNode = startNode;
        startNode.inQueue = true;
        const nodeQueue = [];

        const intervalID = setInterval(() => {
            if(currentNode && !this.nodesAreEqual(currentNode, endNode)) {
                for (let dir of this.directions()) {
                    const currentIndex = this.convertRowColToIndex(currentNode.row, currentNode.col, cols);
                    const newNode = dir(grid, cols, currentIndex);
                    if (newNode && newNode.type === "EMPTY" && !newNode.inQueue) {
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

        // while (!nodesAreEqual(currentNode, endNode) && currentNode) {
        //     for (let dir of this.directions()) {
        //         const currentIndex = this.convertRowColToIndex(currentNode.row, currentNode.col, cols);
        //         const newNode = dir(grid, cols, currentIndex);
        //         if (newNode && newNode.type === "EMPTY" && !newNode.inQueue) {
        //             newNode.previous = currentNode;
        //             nodeQueue.push(newNode);
        //             newNode.type = "QUEUED";
        //             newNode.inQueue = true;
        //         }
        //     }
        //     currentNode.type = "ROUTED";
        //     currentNode = nodeQueue.shift();
        // }
        return currentNode;
    }
}