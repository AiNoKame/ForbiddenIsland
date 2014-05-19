var colors = ['red', 'teal', 'orange', 'purple'];

var createFloodDeck = function() {
  var floodDeck = [];

  for (var i = 0; i < colors.length; i++) {
    var color = colors[i];
    for (var j = 0; j < 6; j++) {
      var isTemple = false;
      var isStart = undefined;

      if (j === 0 || j === 1) {
        isTemple = true;
      }

      if (j === 5 && color === colors[0]) {
        isStart = 'black';
      }

      if (j === 5 && color === colors[3]) {
        isStart = 'white';
      }

      var properties = {name: color + j, color: color, temple: isTemple, start: isStart};
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

var floodDeck = createFloodDeck(); // {color: red/blue/yellow/purple, temple: true/false, start: black/white/undefined}
floodDeck = _.shuffle(floodDeck);
var islandTiles = createIslandTiles(floodDeck);
var treasureDeck = [];
var player1Hand = [];
var player2Hand = [];

console.log('island tiles: ', islandTiles);

var island = d3.selectAll('td').data(islandTiles);

island.attr('height', '50px')
  .attr('width', '50px')
  .style('background-color', function(data) {
    if (data) {
      return data.color;
    }
  });
