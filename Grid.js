const Grid = (function() {

    let tiles = [];
    let rows = 0;
    let cols = 0;
    let startNodeIndex = null;
    let endNodeIndex = null;

    const tileTypes = {
        EMPTY: "EMPTY",
        OBSTACLE: "OBSTACLE"
    }

    const generateTiles = (rows, cols) => {
        const tiles = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                tiles.push({
                    row,
                    col,
                    type: tileTypes.EMPTY,
                    isStart: false,
                    isEnd: false
                });
            }
        }
        return tiles;
    }

    const getTile = (row, col) => {
        const tileIndex = row * cols + col;
        return tiles[tileIndex];
    }

    const clearStartTiles = () => {
        if (tiles[startNodeIndex]) {
            tiles[startNodeIndex].isStart = false;
        }
    }

    const clearEndTiles = () => {
        if (tiles[endNodeIndex]) {
            tiles[endNodeIndex].isEnd = false;
        }
    }

    const clearObstacles = () => {
        for (let tile of tiles) tile.type = tileTypes.EMPTY;
    }

    return {
        tileTypes,

        getTiles() {
            return tiles;
        },

        getTileAtIndex(index) {
            return tiles[index];
        },

        getTileAtPosition(row, col) {
            const index = row * cols + col;
            return tiles[index];
        },

        initialiseTiles(newRows, newCols) {
            rows = newRows;
            cols = newCols;
            tiles = generateTiles(rows, cols);
        },

        getDimensions() {
            return { rows, cols };
        },

        getRows() {
            return rows;
        },

        getCols() {
            return cols;
        },

        setObstacle(row, col) {
            const tile = getTile(row, col);
            if (tile && !tile.isStart && !tile.isEnd) {
                tile.type = tileTypes.OBSTACLE;
            }
        },

        removeObstacle(row, col) {
            const tile = getTile(row, col);
            tile.type = tileTypes.EMPTY;
        },

        getStart() {
            return tiles[startNodeIndex];
        },

        setStart(row, col) {
            const tile = getTile(row, col);
            if (tile && !tile.isStart && !tile.isEnd) {
                tile.type = tileTypes.EMPTY;
                clearStartTiles();
                tile.isStart = true;
                startNodeIndex = row * cols + col;
            }
        },

        setEnd(row, col) {
            const tile = getTile(row, col);
            if (tile && !tile.isStart && !tile.isEnd) {
                tile.type = tileTypes.EMPTY;
                clearEndTiles();
                tile.isEnd = true;
                endNodeIndex = row * cols + col;
            }
        },

        getEnd() {
            return tiles.find(tile => tile.isEnd);
        },

        getMaxPathDistance() {
            const tilePathDistances = tiles.map(tile => tile.pathDistance || 0);
            return Math.max.apply(null, tilePathDistances);
        },

        randomiseGrid(probability) {
            clearObstacles();
            for (let tile of tiles) {
                if (!tile.isStart && !tile.isEnd) {
                    if (Math.random() < probability) {
                        tile.type = tileTypes.OBSTACLE;
                    }
                }
            }
        },

        reset() {
            for (let tile of tiles) {
                if (tile.type !== tileTypes.OBSTACLE) {
                    tile.type = tileTypes.EMPTY;
                    tile.inQueue = false;
                    tile.turnCount = undefined;
                    tile.pathDistance = 0;
                    tile.previous = undefined;
                    tile.pointingDirections = undefined;
                }
            }
        }
    }
})();