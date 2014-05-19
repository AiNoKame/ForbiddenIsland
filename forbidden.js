var floodDeck = []; // {color: red/blue/yellow/purple, temple: true/false, start: black/white/undefined}
var treasureDeck = [];
var player1Hand = [];
var player2Hand = [];
var islandTiles = {

};

var createFloodDeck = function(color) {
  for (var i = 0; i < 6; i++) {
    var isTemple = false;
    var isStart = undefined;

    if (i === 0 || i === 1) {
      isTemple = true;
    }

    if (i === 5 && color === 'red') {
      isStart = 'black';
    }

    if (i === 5 && color === 'purple') {
      isStart = 'white';
    }

    var properties = {color: color + i, temple: isTemple, start: isStart};
    floodDeck.push(properties);
  }
};

createFloodDeck('red');
createFloodDeck('blue');
createFloodDeck('yellow');
createFloodDeck('purple');
floodDeck = _.shuffle(floodDeck);

console.log(floodDeck);

