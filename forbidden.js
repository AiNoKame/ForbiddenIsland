var refreshRate = 500;
var islandTileSize = '75px';
var handCardSize = '30px';
var handLimit = 5;
var actionCount = 6;
var colors = ['red', 'teal', 'orange', 'purple'];
var pieceColors = ['black', 'white'];
var treasuresClaimed = {
  red: false,
  teal: false,
  orange: false,
  purple: false
};

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

      var properties = {name: color + j, color: color, temple: isTemple, pawn: pawn, status: 'afloat', rise: false};
      floodDeck.push(properties);
    }
  }

  return _.shuffle(floodDeck);
};

var createIslandTiles = function(floodDeck) {
  var islandTiles = [];
  var floodDeck = _.shuffle(floodDeck.slice());

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

var createTreasureDeck = function(floodDeck) {
  var treasureDeck = _.shuffle(floodDeck.slice());

  for (var i = 0; i < 3; i++) {
    treasureDeck.push({rise: true});
  }

  return _.shuffle(treasureDeck);
};

var floodDeck = createFloodDeck();
var floodDiscardDeck = [];
var islandTiles = createIslandTiles(floodDeck);
var treasureDeck = createTreasureDeck(floodDeck);
var treasureDiscardDeck = [];
var player1Hand = [];
var player2Hand = [];
var playerPiece = {
  white: player1Hand,
  black: player2Hand
};
var focus = '.white';

var raiseWaterLevel = function() {
  console.log('Water is rising!');
  var currentWaterLevel = d3.select('.waterLevel').text();
  var newWaterLevel = +currentWaterLevel + 1;
  d3.select('.waterLevel').text(newWaterLevel);

  floodDeck = floodDeck.concat(_.shuffle(floodDiscardDeck.slice()));
  floodDiscardDeck = [];
  drawFloods(newWaterLevel);
};

var drawTreasures = function(count, destination) {
  for (var i = 0; i < count; i++) {
    if (destination.length >= handLimit) {
      break;
    } else {
      var drawnCard = treasureDeck.pop();

      if (!treasureDeck.length) {
        treasureDeck = _.shuffle(treasureDiscardDeck.slice());
        treasureDiscardDeck = [];
      }

      if (drawnCard.rise) {
        raiseWaterLevel();
        treasureDiscardDeck.push(drawnCard);
      } else {
        destination.push(drawnCard);
      }
    }
  }
};

var discardTreasure = function(playerHand, index) {
  if (playerHand.length >= (index + 1)) {
    playerHand.splice(index, 1);
  }
};

var flood = function(tileName) {
  var gameOver = false;
  for (var i = 0; i < islandTiles.length; i++) {
    if (islandTiles[i] && tileName === islandTiles[i].name) {
      if (islandTiles[i].status === 'afloat') {
        islandTiles[i].status = 'sinking';
      } else if (islandTiles[i].status === 'sinking') {
        if (islandTiles[i].pawn.black || islandTiles[i].pawn.white) {
          gameOver = true;;
        }
        islandTiles[i] = null;
        floodDiscardDeck.pop();
      }
      if (gameOver) {
        alert('YOUR PAWN IS LOST AT SEA - GAME OVER');
      }

      return;
    }
  }
};

var drawFloods = function(count) {
  for (var i = 0; i < count; i++) {
    var drawnCard = floodDeck.pop();

    if (!floodDeck.length) {
      floodDeck = _.shuffle(floodDiscardDeck.slice());
      floodDiscardDeck = [];
    }

    floodDiscardDeck.push(drawnCard);
    flood(drawnCard.name);
  }
};

var endTurn = function(playerColor) {
  drawFloods(d3.select('.waterLevel').text());
  drawTreasures(2, playerPiece[playerColor]);
  d3.select('.remainingMoves').text(actionCount.toString());
  if (focus === '.white') {
    focus = '.black';
    d3.select('.white').classed('active', false);
    d3.select('.black').classed('active', true);
    d3.select('.p1Title').classed('active', false);
    d3.select('.p2Title').classed('active', true);
  } else if (focus === '.black') {
    focus = '.white';
    d3.select('.black').classed('active', false);
    d3.select('.white').classed('active', true);
    d3.select('.p2Title').classed('active', false);
    d3.select('.p1Title').classed('active', true);
  }
};

drawFloods(6);
drawTreasures(2, player1Hand);
drawTreasures(2, player2Hand);


var island = d3.selectAll('.islandTile').data(islandTiles);

island.attr('height', islandTileSize)
  .attr('width', islandTileSize)
  .style('background-color', function(data) {
    if (data) {
      return data.color;
    }
  })
  .style('align', 'center')
  .style('position', 'relative')
  .html(function(data) {
    var html = '';

    if (data) {
      if (data.temple) {
        html += '<img src="assets/treasureChest.png" height=70px width=70px class="temple" style="top: 0; position: absolute; z-index: 0">';
      }
      if (data.pawn.black) {
        html += '<img src=assets/black.png height=70px width=70px class="playerPiece black" style="top: 0; position: absolute; z-index: 1">';
      }
      if (data.pawn.white) {
        html += '<img src=assets/white.png height=70px width=70px class="playerPiece white active" style="top: 0; position: absolute; z-index: 1">';
      }

      return html;
    }
  });


var updateHands = function() {
  var player1 = d3.select('.player1');
  var player1Cards = player1.selectAll('.player1Cards').data(player1Hand);

  player1Cards.style('background-color', function(data) {
      if (data) {
        return data.color;
      }
    });

  player1Cards.enter().append('td')
    .attr('height', handCardSize)
    .attr('width', handCardSize)
    .attr('class', 'player1Cards')
    .style('background-color', function(data) {
      if (data) {
        return data.color;
      }
    });

  player1Cards.exit().remove();

  var player2 = d3.select('.player2');
  var player2Cards = player2.selectAll('.player2Cards').data(player2Hand);

  player2Cards.style('background-color', function(data) {
      if (data) {
        return data.color;
      }
    });

  player2Cards.enter().append('td')
    .attr('height', handCardSize)
    .attr('width', handCardSize)
    .attr('class', 'player2Cards')
    .style('background-color', function(data) {
      if (data) {
        return data.color;
      }
    });

  player2Cards.exit().remove();
};

var updateIsland = function() {
  var island = d3.selectAll('.islandTile').data(islandTiles);

  island.transition().duration(500)
    .style('background-color', function(data) {
      if (data) {
        if (data.status === 'afloat') {
          return data.color;
        } else if (data.status === 'sinking') {
          return 'skyblue';
        }
      }
    });

  var convertColRowToIndex = function(col, row, squareArray) {
    var length = squareArray.length;
    var sideLength = Math.sqrt(length);

    if (col < 0 || row < 0 || col >= sideLength || row >= sideLength) {
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

  var shore = function(col, row, pieceColor) {
    var index = convertColRowToIndex(col, row, islandTiles);
    if (islandTiles[index].status !== 'afloat') {
      var currentRemainingMoves = d3.select('.remainingMoves').text();
      var newRemainingMoves = +currentRemainingMoves - 1;

      islandTiles[index].status = 'afloat';

      d3.select('.remainingMoves').text(newRemainingMoves);
      if (!newRemainingMoves) {
        endTurn(pieceColor);
      }
    }
  };

  var claimTreasure = function(col, row, pieceColor, playerHand) {
    var index = convertColRowToIndex(col, row, islandTiles);
    var color = islandTiles[index].color;
    var colorCount = 0;
    var indices = [];

    for (var i = 0; i < playerHand.length; i++) {
      if (playerHand[i].color === color) {
        colorCount++;
        if (colorCount < 4) {
          indices.push(i);
        }
      }
    }

    if (islandTiles[index].temple && colorCount >= 4) {
      var currentRemainingMoves = d3.select('.remainingMoves').text();
      var newRemainingMoves = +currentRemainingMoves - 1;
      var treasures = d3.select('.treasuresClaimed').text();
      var allClaimed = true;

      for (var j = 0; j < indices.length; j++) {
        discardTreasure(playerHand, indices[j]);
      }

      treasuresClaimed[color] = true;
      d3.select('.treasuresClaimed').text(treasures + ' ' + color);
      d3.select('.remainingMoves').text(newRemainingMoves);

      for (var key in treasuresClaimed) {
        if (!treasuresClaimed[key]) {
          allClaimed = false;
        }
      }

      if (allClaimed) {
        alert('YOU ARE THE GREATEST TREASURE HUNTER IN THE WORLD! YOU WIN!');
      };

      if (!newRemainingMoves) {
        endTurn(pieceColor);
      }
    }
  };

  var movePawn = function(oldCol, oldRow, newCol, newRow, pieceColor, piece) {
    var oldIndex = convertColRowToIndex(oldCol, oldRow, islandTiles);
    var newIndex = convertColRowToIndex(newCol, newRow, islandTiles);

    if (pieceColors.indexOf(pieceColor) !== -1) {
      var movingPiece = $(piece.node()).detach();
      var currentRemainingMoves = d3.select('.remainingMoves').text();
      var newRemainingMoves = +currentRemainingMoves - 1;

      islandTiles[oldIndex].pawn[pieceColor] = false;
      islandTiles[newIndex].pawn[pieceColor] = true;

      $('table tr:eq(' + newRow + ') td:eq(' + newCol + ')').append(movingPiece);

      d3.select('.remainingMoves').text(newRemainingMoves);
      if (!newRemainingMoves) {
        endTurn(pieceColor);
      }
    }
  };

  d3.select('body').
    on('keydown', function() {
      var piece = d3.select(focus);
      var col = piece.node().parentNode.cellIndex;
      var row = piece.node().parentNode.parentNode.rowIndex;
      var pieceColor = _.last(piece.node().src.split('/')).replace('.png', '');
      var key = d3.event.keyCode;
      console.log(key);

      if (key === 38) { // up
        if (isValidMove(col, row - 1)) {
            movePawn(col, row, col, row - 1, pieceColor, piece);
        }
      } else if (key === 40) { // down
        if (isValidMove(col, row + 1)) {
            movePawn(col, row, col, row + 1, pieceColor, piece);
        }
      } else if (key === 37) { // left
        if (isValidMove(col - 1, row)) {
            movePawn(col, row, col - 1, row, pieceColor, piece);
        }
      } else if (key === 39) { // right
        if (isValidMove(col + 1, row)) {
            movePawn(col, row, col + 1, row, pieceColor, piece);
        }
      } else if (key === 27) { // esc
        endTurn(pieceColor);
      } else if (key === 65) { // a
        var playerHand = playerPiece[pieceColor];
        console.log('player color ', pieceColor);
        console.log('card to discard ', playerHand[0]);
        discardTreasure(playerHand, 0);
        console.log('card should be different... ', playerHand[0]);
      } else if (key === 83) { // s
        var playerHand = playerPiece[pieceColor];

        discardTreasure(playerHand, 1);
      } else if (key === 68) { // d
        var playerHand = playerPiece[pieceColor];

        discardTreasure(playerHand, 2);
      } else if (key === 70) { // f
        var playerHand = playerPiece[pieceColor];

        discardTreasure(playerHand, 3);
      } else if (key === 71) { // g
        var playerHand = playerPiece[pieceColor];

        discardTreasure(playerHand, 4);
      } else if (key === 32) { // space bar
        shore(col, row, pieceColor);
      } else if (key === 13) { // return
        claimTreasure(col, row, pieceColor, playerPiece[pieceColor]);
      }
    });
};

updateIsland();
updateHands();

setInterval(function() {
  updateIsland();
  updateHands();
}, refreshRate);
