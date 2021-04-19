/**
 * Object for controlling the data structure, and assigning data during
 * the pathfinding algorithm.
 */
const Grid = (function () {

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

        /**
         * @typedef {Object} Tile
         * @property {number} row
         * @property {number} col
         * @property {string} type
         * @property {boolean} isStart
         * @property {boolean} isEnd
         */

        /**
         * Returns the list of all tiles in the grid.
         * @returns {Tile[]}
         */
        getTiles() {
            return tiles;
        },


        /**
         * Returns the tile in the grid at the specified index
         * @param {number} index Index in the tiles array
         * @returns {Tile}
         */
        getTileAtIndex(index) {
            return tiles[index];
        },


        /**
         * Return the tile in the grid at the specified row and column
         * @param {number} row Row position of tile
         * @param {number} col Column position of tile
         * @returns {Tile}
         */
        getTileAtPosition(row, col) {
            const index = row * cols + col;
            return tiles[index];
        },


        /**
         * Creates an array of tiles with the specified number of rows and columns
         * @param {number} newRows The number of rows of tiles in the grid
         * @param {number} newCols The number of columns of tiles in the grid
         */
        initialiseTiles(newRows, newCols) {
            rows = newRows;
            cols = newCols;
            tiles = generateTiles(rows, cols);
        },


        /**
         * Get the current dimensions of the grid
         * @returns {{rows: number, cols: number}}
         */
        getDimensions() {
            return { rows, cols };
        },


        /**
         * Gets the number of rows from the grid
         * @returns {number}
         */
        getRows() {
            return rows;
        },


        /**
         * Gets the number of columns from the grid
         * @returns {number}
         */
        getCols() {
            return cols;
        },


        /**
         * Takes a position and sets the grid element in that position to 
         * an obstacle if it is not the start or end point.
         * @param {number} row Row position of the new obstacle to be set
         * @param {number} col Col position of the new obstacle to be set
         */
        setObstacle(row, col) {
            const tile = getTile(row, col);
            if (tile && !tile.isStart && !tile.isEnd) {
                tile.type = tileTypes.OBSTACLE;
            }
        },


        /**
         * Removes an obstacle at the specified position by setting the
         * corresponding grid entry to type EMPTY.
         * @param {number} row Row position of the obstacle to be removed
         * @param {number} col Col position of the obstacle to be removed
         */
        removeObstacle(row, col) {
            const tile = getTile(row, col);
            tile.type = tileTypes.EMPTY;
        },


        /**
         * Gets the start tile in the grid
         * @returns {Tile}
         */
        getStart() {
            return tiles[startNodeIndex];
        },


        /**
         * Gets the end tile in the grid
         * @returns {Tile}
         */
        getEnd() {
            return tiles.find(tile => tile.isEnd);
        },


        /**
         * Sets the tile at the specified position as the new start tile.
         * @param {number} row Row position of the new start tile
         * @param {number} col Column position of the new start tile
         */
        setStart(row, col) {
            const tile = getTile(row, col);
            if (tile && !tile.isStart && !tile.isEnd) {
                tile.type = tileTypes.EMPTY;
                clearStartTiles();
                tile.isStart = true;
                startNodeIndex = row * cols + col;
            }
        },


        /**
         * Sets the tile at the specified position as the new end tile.
         * @param {number} row Row position of the new end tile
         * @param {number} col Column position of the new end tile
         */
        setEnd(row, col) {
            const tile = getTile(row, col);
            if (tile && !tile.isStart && !tile.isEnd) {
                tile.type = tileTypes.EMPTY;
                clearEndTiles();
                tile.isEnd = true;
                endNodeIndex = row * cols + col;
            }
        },


        /**
         * Calculates the largest distance of tiles from the start tile.
         * @returns {number}
         */
        getMaxPathDistance() {
            const tilePathDistances = tiles.map(tile => tile.pathDistance || 0);
            return Math.max.apply(null, tilePathDistances);
        },


        /**
         * Loops through the grid tiles and assign it to an obstacle with
         * a specified probability.
         * @param {number} probability A number in [0, 1] to represent the chance
         * a tile has of being an obstacle.
         */
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


        /**
         * Clears all recorded path data for tiles in the grid.
         */
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