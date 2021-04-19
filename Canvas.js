/**
 * Class to create a canvas for controlling graphics used in the path
 * finding algorithm, and adding event listeners for interaction with the canvas element.
 */
class Canvas {

    constructor(canvasID) {
        this.element = document.getElementById(canvasID);
        if (!this.element) {
            throw new Error(`Could not get HTML canvas element with id ${canvasID}`);
        }
        this.context = this.element.getContext("2d");
        this.width = this.element.width;
        this.height = this.element.height;
        this.tileSize = 10;
        this.paintmode = Grid.tileTypes.OBSTACLE;
        this.setDimensions();
        this.setupEventListeners();
    }



    setupEventListeners() {
        this.element.addEventListener("click", e => {
            const x = e.offsetX;
            const y = e.offsetY;
            const { row, col } = this.convertXYToRowCol(x, y);
            console.log(`(${x},${y}) -> (${row},${col})`);
            if (this.paintmode === Grid.tileTypes.OBSTACLE) {
                Grid.setObstacle(row, col);
            } else if (this.paintmode === "START") {
                Grid.setStart(row, col);
            } else if (this.paintmode === "END") {
                Grid.setEnd(row, col);
            }
            this.drawGrid(Grid.getTiles());
        });
        
        this.element.addEventListener("contextmenu", e => {
            e.preventDefault();
            const x = e.offsetX;
            const y = e.offsetY;
            const { row, col } = this.convertXYToRowCol(x, y);
            Grid.removeObstacle(row, col);
            this.drawGrid(Grid.getTiles());
        });

        window.addEventListener("resize", e => {
            if (window.innerWidth < 1000) {
                this.setTileSize(6);
            } else {
                this.setTileSize(10);
            }
            this.setDimensions(
                this.gridWidth * this.tileSize,
                this.gridHeight * this.tileSize
            )
            this.drawGrid(Grid.getTiles());
        });
    }



    setPaintMode(paintMode) {
        this.paintmode = paintMode;
    }



    convertXYToRowCol(x, y) {
        const row = Math.floor(y / this.tileSize);
        const col = Math.floor(x / this.tileSize);
        return { row, col };
    }



    setDimensions() {
        const { rows, cols } = Grid.getDimensions();
        this.width = this.element.width = cols * this.tileSize;
        this.height = this.element.height = rows * this.tileSize;;
    }



    setTileSize(size) {
        this.tileSize = size;
    }



    getDimensions() {
        return {
            width: this.width,
            height: this.height
        };
    }



    getMaxDimension() {
        return Math.max(this.height, this.width);
    }



    drawGrid(grid, mode = "DEFAULT") {
        const maxDistance = Grid.getMaxPathDistance();
        for (let tile of grid) {
            let tileColour;
            if (mode === "DEFAULT") {
                tileColour = this.getTileColour(tile);
            } else if (mode === "DISTANCE") {
                tileColour = this.getTileDistanceColour(tile, maxDistance);
            }
            this.context.fillStyle = tileColour;
            this.context.fillRect(
                tile.col * this.tileSize,
                tile.row * this.tileSize,
                this.tileSize,
                this.tileSize
            );
        }
    }



    getTileColour(tile) {
        if (tile.isEnd) return "red";
        if (tile.isStart) return "blue";

        if (tile.type === "EMPTY") {
            return "grey";
        } else if (tile.type === "OBSTACLE") {
            return "black"
        } else if (tile.type === "QUEUED") {
            return "lightblue";
        } else if (tile.type === "ROUTED") {
            return "green";
        } else if (tile.type === "HEAD") {
            return "yellow";
        } else if (tile.type === "PATH") {
            return "white";
        }
    }



    getTileDistanceColour(tile, maxPathDistance) {
        if (tile.isEnd) return "red";
        if (tile.isStart) return "blue";
        if (!tile.pathDistance) {
            return this.getTileColour(tile)
        }
        // Just lerp the values betwenn 50 and 255 and the red channel
        const RANGE = 255;
        const redChannel
            = Math.floor(tile.pathDistance / maxPathDistance * RANGE);
        const blueChannel
            = Math.floor(RANGE * (1 - tile.pathDistance / maxPathDistance));
        const colour = this.convertRGBToHex([redChannel, 0, blueChannel]);
        return colour;
    }



    convertRGBToHex(rgb) {
        const rgbInHexFormat = rgb.map(c => {
            let channelString = c.toString(16);
            if (channelString.length === 1) {
                channelString = "0" + channelString;
            }
            return channelString;
        });
        const hexColourString = rgbInHexFormat.join('');
        return `#${hexColourString}`;
    }

    

    clear() {
        this.context.fillStyle = "grey";
        this.context.fillRect(-this.width, -this.height, 2 * this.width, 2 * this.height);
    }
}