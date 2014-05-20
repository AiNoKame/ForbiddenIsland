var refreshRate = 500;
var colors = ['red', 'teal', 'orange', 'purple'];
var pieceColors = ['black', 'white'];

var createPieces = function() {
  var pieces = [];

  for (var i = 0; i < pieceColors.length; i++) {
    var piece = {};
    var color = pieceColors[i];
    piece.color = color;

    pieces.push(piece);
  }

  return pieces;
};

var createFloodDeck = function() {
  var floodDeck = [];

  for (var i = 0; i < colors.length; i++) {
    var color = colors[i];
    for (var j = 0; j < 6; j++) {
      var isTemple = false;
      var isStartFor = null;
      var pawn = {
        white: false,
        black: false
      };

      if (j === 0 || j === 1) {
        isTemple = true;
      }

      if (j === 5 && color === colors[0]) {
        pawn.black = true;
      }

      if (j === 5 && color === colors[3]) {
        pawn.white = true;
      }

      var properties = {name: color + j, color: color, temple: isTemple, pawn: pawn, status: 'afloat'};
      floodDeck.push(properties);
    }
  }

  return floodDeck;
};

var createIslandTiles = function(floodDeck) {
  var islandTiles = [];
  var floodDeck = floodDeck.slice();

  for (var i = 0; i < 6; i++) {
    for (var j = 0; j < 6; j++) {
      if (((i === 0 || i === 5) && (j === 0 || j === 1 || j === 4 || j === 5)) || ((i === 1 || i === 4) && (j === 0 || j === 5))) {
        islandTiles.push(null);
      } else {
        islandTiles.push(floodDeck.pop());
      }
    }
  }

  return islandTiles;
};


var floodDeck = createFloodDeck();
floodDeck = _.shuffle(floodDeck);
var islandTiles = createIslandTiles(floodDeck);
floodDeck = _.shuffle(floodDeck);

var convertColRowToIndex = function(col, row, squareArray) {
  var length = squareArray.length;
  var sideLength = Math.sqrt(length);

  if (row >= sideLength || col >= sideLength) {
    return -1;
  }

  return row * sideLength + col;
};

var isValidMove = function(nextSpaceCol, nextSpaceRow) {
  var index = convertColRowToIndex(nextSpaceCol, nextSpaceRow, islandTiles);

  if (index === -1) {
    return false;
  }

  return islandTiles[index] !== null;
};

var movePawn = function(oldCol, oldRow, newCol, newRow, pieceColor) {
  var oldIndex = convertColRowToIndex(oldCol, oldRow, islandTiles);
  var newIndex = convertColRowToIndex(newCol, newRow, islandTiles);

  if(pieceColors.indexOf(pieceColor) !== -1) {
    islandTiles[oldIndex].pawn[pieceColor] = false;
    islandTiles[newIndex].pawn[pieceColor] = true;
  }
};

var treasureDeck = [];
var player1Hand = [];
var player2Hand = [];
var focus = null;

var render = function() {
  var island = d3.selectAll('td').data(islandTiles);

  island.attr('height', '75px')
    .attr('width', '75px')
    .style('background-color', function(data) {
      if (data) {
        return data.color;
      }
    })
    .style('opacity', function(data) {
      if (data) {
        switch(data.status) {
          case 'afloat':
            return 1;
          case 'sinking':
            return 0.2;
          case 'sunk':
            return 0;
        }
      } else {
        return 0;
      }
    })
    .style('align', 'center')
    .style('position', 'relative')
    .html(function(data) {
      var html = '';

      if (data && data.temple) {
        html += '<img src="assets/treasureChest.png" height=70px width=70px style="top: 0; position: absolute; z-index: 0">';
      }
      if (data && data.pawn.black) {
        html += '<img src=assets/black.png height=70px width=70px class="playerPiece black" style="top: 0; position: absolute; z-index: 1">';
      }
      if (data && data.pawn.white) {
        html += '<img src=assets/white.png height=70px width=70px class="playerPiece white" style="top: 0; position: absolute; z-index: 1">';
      }
      return html;
    });

  var pawns = d3.selectAll('.playerPiece').
    on('click', function() {
      focus = '.' + this.classList[1];
    });

  d3.select('body').
    on('keydown', function() {
      var piece = d3.select(focus);
      var col = piece.node().parentNode.cellIndex;
      var row = piece.node().parentNode.parentNode.rowIndex;
      var pieceColor = _.last(piece.node().src.split('/')).replace('.png', '');

      switch(d3.event.keyCode) {
        case 38: // up
          if (isValidMove(col, row - 1)) {
            movePawn(col, row, col, row - 1, pieceColor);
          }
          break;
        case 40: // down
          if (isValidMove(col, row + 1)) {
            movePawn(col, row, col, row + 1, pieceColor);
          }
          break;
        case 37: // left
          if (isValidMove(col - 1, row)) {
            movePawn(col, row, col - 1, row, pieceColor);
          }
          break;
        case 39: // right
          if (isValidMove(col + 1, row)) {
            movePawn(col, row, col + 1, row, pieceColor);
          }
          break;
      }
    });
};

render();
setInterval(function() {
  render();
}, refreshRate);
