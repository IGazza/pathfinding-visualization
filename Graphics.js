Graphics = {
    getSquareColour(square) {
        if (square.end) return "red";
        if (square.start) return "blue";

        if (square.type === "EMPTY") {
            return "grey";
        } else if (square.type === "OBSTACLE") {
            return "black"
        } else if (square.type === "QUEUED") {
            return "lightblue";
        } else if (square.type === "ROUTED") {
            return "green";
        } else if (square.type === "HEAD") {
            return "yellow";
        } else if (square.type === "PATH") {
            return "white";
        }
    },
    drawGridSquare(row, col, colour) {
        context.fillStyle = colour;
        context.fillRect(col * size, row * size, size, size);
    },
    drawGrid(grid) {
        grid.forEach((square, index) => {
            const row = Math.floor(index / gridWidth);
            const col = index % gridWidth;
            const colour = this.getSquareColour(square);
            this.drawGridSquare(row, col, colour);
        });
    }
}