const Grid = (function() {

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
        for (let tile of tiles) tile.isStart = false;
    }

    const clearEndTiles = () => {
        for (let tile of tiles) tile.isEnd = false;
    }

    const clearObstacles = () => {
        for (let tile of tiles)  tile.type = tileTypes.EMPTY;
    }

    let tiles = [];
    let rows = 0;
    let cols = 0;

    return {
        tileTypes,

        getTiles() {
            return tiles;
        },

        initialiseTiles(newRows, newCols) {
            rows = newRows;
            cols = newCols;
            tiles = generateTiles(rows, cols);
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
            return tiles.find(tile => tile.isStart);
        },

        setStart(row, col) {
            const tile = getTile(row, col);
            if (tile && !tile.isStart && !tile.isEnd) {
                tile.type = tileTypes.EMPTY;
                clearStartTiles();
                tile.isStart = true;
            }
        },

        setEnd(row, col) {
            const tile = getTile(row, col);
            if (tile && !tile.isStart && !tile.isEnd) {
                tile.type = tileTypes.EMPTY;
                clearEndTiles();
                tile.isEnd = true;
            }
        },

        getEnd() {
            return tiles.find(tile => tile.isEnd);
        },

        getMaxPathDistance() {
            // Find the max pathDistance
            // THen get element attaining that
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
                }
            }
        }
    }
})();