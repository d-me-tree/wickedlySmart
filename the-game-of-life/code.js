var rows = 30;
var cols = 50;

var playing = false;
var timer;
var reproductionTime = 100;

var grid = new Array(rows);
var nextGrid = new Array(rows);

function initializeGrids() {
    // Create 2D arrays
    for (var i = 0; i < rows; i++) {
        grid[i] = new Array(cols);
        nextGrid[i] = new Array(cols);
    }
}

function resetGrids() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            grid[i][j] = 0;
            nextGrid[i][j] = 0;
        }
    }
}

function copyAndResetGrid() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            grid[i][j] = nextGrid[i][j];
            nextGrid[i][j] = 0;
        }
    }
}

// Initialize
function initialize() {
    createTable();
    initializeGrids();
    resetGrids();
    setupControlButtons();
}

// Lay out the board
function createTable() {
    var gridContainer = document.getElementById("gridContainer");
    if (!gridContainer) {
        // Throw error
        console.error("Problem: no div for the grid table!");
    }
    var table = document.createElement("table");
    
    for (var row = 0; row < rows; row++) {
        var tr = document.createElement("tr");
        for (var col = 0; col < cols; col++) {
            var cell = document.createElement("td");
            cell.setAttribute("id", row + "_" + col);
            cell.setAttribute("class", "dead");
            cell.onclick = cellClickHandler;
            tr.appendChild(cell);
        }
        table.appendChild(tr);
    }
    gridContainer.appendChild(table);
}

function updateView() {
    for (var i=0; i < rows; i++) {
        for (var j=0; j < cols; j++) {
            var cell = document.getElementById(i + "_" + j);
            if ( grid[i][j] ) {  // === 1
                cell.setAttribute("class", "live");
            } else {  // grid[i][j] === 0
                cell.setAttribute("class", "dead");
            }
        }
    }
}

function cellClickHandler() {
    var rowcol = this.id.split("_");
    var row = rowcol[0];
    var col = rowcol[1];
    
    var klass = this.getAttribute("class");
    if (klass.indexOf("live") > -1) {
        this.setAttribute("class", "dead");
        grid[row][col] = 0;
    } else {
        this.setAttribute("class", "live");
        grid[row][col] = 1;
    }
}

function setupControlButtons() {
    // Button to start
    var startButton = document.getElementById("start");
    startButton.onclick = startButtonHandler;
    
    // Button to clear
    var clearButton = document.getElementById("clear");
    clearButton.onclick = clearButtonHandler;
    
    // Button to set random initial state
    var randomButton = document.getElementById("random");
    randomButton.onclick = randomButtonHandler;
}

function randomButtonHandler() {
    if (!playing) {
        clearTimeout(timer);
        for (var i=0; i < rows; i++) {
            for (var j=0; j < cols; j++) {
                grid[i][j] = Math.round(Math.random());
                nextGrid[i][j] = 0;
            }
        }
        updateView();
    }
}

// Clear the grid
function clearButtonHandler() {
    console.log("Clear the game: stop playing, clear the grid");
    playing = false;
    clearTimeout(timer);
    resetGrids();
    updateView();
    var startButton = document.getElementById("start");
    startButton.innerHTML = "start";
}

// start/pause/continue the game
function startButtonHandler() {
    if (playing) {
        console.log("Pause the game");
        playing = false;
        clearTimeout(timer);
        this.innerHTML = "continue";    
    } else {
        console.log("Continue the game");
        playing = true;
        this.innerHTML = "pause";
        play()
    }
}

// Run the life game
function play() {
    computeNextGen();
    
    if (playing) {
        timer = setTimeout(play, reproductionTime);
    }
}

function computeNextGen() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            applyRules(i, j);
        }
    }
    
    // Copy nextGrid to grid, and reset nextGrid
    copyAndResetGrid();
    updateView();
}


/*
RULES:
- Any live cell with fewer than two live neighbors dies,
as if caused by under-population.
- Any live cell with two or three live neighbors
lives on to the next generation.
- Any live cell with more than three live neighbors dies,
as if by overcrowding.
- Any dead cell with exactly three live neighbors becomes a live cell,
as if by reproduction.
*/
function applyRules(row, col) {
    var numNeighbours = countNeighbours(row, col);
    
    if (grid[row][col] === 1) {  // Live cell
        if (numNeighbours === 2 || numNeighbours === 3) {
            // Live cell lives
            nextGrid[row][col] = 1;
        }
    } else {  // Dead cell
        if (numNeighbours === 3) {
            nextGrid[row][col] = 1;
        }
    }
}

function countNeighbours(row, col) {
    // neighbours = [
    //     grid[row-1][col-1], grid[row-1][col], grid[row-1][col+1],
    //     grid[row][col-1],                     grid[row][col+1],
    //     grid[row+1][col-1], grid[row+1][col], grid[row+1][col+1],
    // ]
    
    var neighbours =  [
        (grid[row-1] || [])[col-1],
        (grid[row-1] || [])[col],
        (grid[row-1] || [])[col+1],
        grid[row][col-1],
        grid[row][col+1],
        (grid[row+1] || [])[col-1],
        (grid[row+1] || [])[col],
        (grid[row+1] || [])[col+1],
    ]
    
    return neighbours.reduce(function(a,b) {
        if (a && b) {
            return a +  b;
        } else {
            // Corner cases, such as grid[0][0]
            // grid[-1][-1] -> undefined
            return a || b;
        }
    }, 0);
}

// Start everything
window.onload = initialize;