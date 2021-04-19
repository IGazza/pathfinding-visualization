# Pathfinding visualization
A Javascript program that provided a visualization of various path finding algorithms.

## Introduction
This application provides a user inteface to select a pathfinding algorithm and alter the grid it will traverse.

## Usage
To use the application, simply clone the repo and then load the index.html file into your favourite browser.

## Configuration
The index.js file contains the necessary code to start the application, and provides a default configuration.

The Grid object provides methods for configuring the demo. First initialise a Grid with a set number of rows and columns:
```js
Grid.initialiseTiles(ROWS, COLUMNS);
```

Then provide a start and end point:
```js
Grid.setStart(startRow, startColumn);
Grid.setEnd(endRow, endColumn);
```

You can then add some random obstacles using: 
```js
Grid.randomiseGrid(obstalceDensity);
```

