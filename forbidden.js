var colors = ['red', 'teal', 'orange', 'purple'];

var createFloodDeck = function() {
  var floodDeck = [];

  for (var i = 0; i < colors.length; i++) {
    var color = colors[i];
    for (var j = 0; j < 6; j++) {
      var isTemple = false;
      var isStartFor = null;
      var pawn = null;

      if (j === 0 || j === 1) {
        isTemple = true;
      }

      if (j === 5 && color === colors[0]) {
        pawn = 'black';
      }

      if (j === 5 && color === colors[3]) {
        pawn = 'white';
      }

      var properties = {name: color + j, color: color, temple: isTemple, pawn: pawn};
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

var island = d3.selectAll('td').data(islandTiles);

island.attr('height', '75px')
  .attr('width', '75px')
  .style('background-color', function(data) {
    if (data) {
      return data.color;
    }
  })
  .style('align', 'center')
  .style('position', 'relative')
  .html(function(data) {
    var html = '';

    if (data && data.temple) {
      html += '<img src="assets/treasureChest.png" height=70px width=70px style="top: 0; position: absolute; z-index: 50">';
    }
    if (data && data.pawn) {
      html += '<img src=assets/' + data.pawn + '.png height=70px width=70px style="top: 0; position: absolute; z-index: 100">';
    }
    console.log(html);
    return html;
  });
