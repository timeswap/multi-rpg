$(function() {

  // leftArrow = keyCode 37, upArrow = keyCode 38
  // rightArrow = keyCode 39, downArrow = keyCode 40
  var gameId = document.querySelector('#gameId');
  var gameIdQuery = document.querySelector('#gameIdQuery');
  var tictactoe = document.querySelector('#tictactoe');
  var output = document.querySelector('#output');
  var whosTurn = document.getElementById('whosTurn');

  var gameid = '';
  var rand = (Math.random() * 9999).toFixed(0);

  gameid = (getGameId()) ? getGameId() : rand;

  gameId.textContent = gameid;

  var oppenetUrl = 'http://codepen.io/PubNub/pen/jbVbdj/?id=' +gameid;
  gameIdQuery.innerHTML = '<a href="' +oppenetUrl+ '" target="_blank">' +oppenetUrl+ '</a>';

  var channel = 'tictactoe--' + gameid;
  console.log('Channel: ' + channel);

  var uuid = PUBNUB.uuid();

  // When you fork the project, please do use your own pub/sub keys.
  // http://admin.pubnub.com
  var pubnub = PUBNUB.init({
    subscribe_key: 'sub-c-182105ac-0001-11e5-8fd4-0619f8945a4f',
    publish_key: 'pub-c-ce04f67b-0f26-43ce-8be2-192e9821d1a3',
    uuid: uuid
  });

  function displayOutput(m) {
    if (!m) return;
    return '<li><strong>' + m.player + '</strong>: ' + m.position + '</li>';
  }

  /*
   * Tic-tac-toe
   * Based on the single-player Tic Tac Toe on http://jsfiddle.net/5wKfF/378/
   * Multiplayer feature with PubNub
   */

  var mySign = 'X';

  pubnub.subscribe({
    channel: channel,
    connect: play,
    presence: function(m) {
      console.log(m);
      whosTurn

      if (m.uuid === uuid && m.action === 'join') {
        if (m.occupancy < 2) {
          whosTurn.textContent = 'Waiting for your opponent...';
        } else if (m.occupancy === 2) {
          mySign = 'O';
        } else if (m.occupancy > 2) {
          alert('This game already have two players!');
          tictactoe.className = 'disabled';
        }
      }

      if (m.occupancy === 2) {
        tictactoe.className = '';
        startNewGame();
      }

      document.getElementById('you').textContent = mySign;
    },
    callback: function(m) {
      // Display the move
      if (document.querySelector('#moves')) {
        var movesOutput = document.querySelector('#moves');
        movesOutput.innerHTML = movesOutput.innerHTML + displayOutput(m);
      }

      // Display the move on the board
      var el = document.querySelector('[data-position="' + m.position + '"]');
      el.firstChild.nodeValue = m.player;
      console.log(el);

      checkGameStatus(m.player, el);

    },
  });

  // Simulates clicking a key
  function fireKey(el, key) {
      if (document.createEventObject) {
          var eventObj = document.createEventObject();
          eventObj.keyCode = key;
          el.fireEvent("onkeydown", eventObj);
      } else if (document.createEvent) {
          var eventObj = document.createEvent("Events");
          eventObj.initEvent("keydown", true, true);
          eventObj.which = key;
          eventObj.keyCode = key;
          el.dispatchEvent(eventObj);
      }
  }

  function publishPosition(player, position) {
    pubnub.publish({
      channel: channel,
      message : function(message){
        if (message.type == "button") {
          switch(message.data){
            case "UP":
              fireKey(el, 38);  // Up Arrow Key
              break;
            case "DOWN":
              fireKey(el, 40);  // Down Arrow Key
              break;
            case "LEFT":
              fireKey(el, 37);  // Left Arrow Key
              break;
            case "RIGHT":
              fireKey(el, 39);  // Right Arrow Key
              break;
            default:
              break;
          }
        }
      }
    })
  }

  function getGameId(){
    // If the uRL comes with referral tracking queries from the URL
    if(window.location.search.substring(1).split('?')[0].split('=')[0] !== 'id') {
      return null;
    } else {
      return window.location.search.substring(1).split('?')[0].split('=')[1];
    }
  }

  var squares = [],
    EMPTY = '\xA0',
    score,
    moves,
    turn = 'X',
    wins = [7, 56, 448, 73, 146, 292, 273, 84];

  function startNewGame() {
    var i;

    turn = 'X';
    score = {
      'X': 0,
      'O': 0
    };
    moves = 0;
    for (i = 0; i < squares.length; i += 1) {
      squares[i].firstChild.nodeValue = EMPTY;
    }

    whosTurn.textContent = (turn === mySign) ? 'Your turn' : 'Your opponent\'s turn';
  }

  function win(score) {
    var i;
    for (i = 0; i < wins.length; i += 1) {
      if ((wins[i] & score) === wins[i]) {
        return true;
      }
    }
    return false;
  }

  function checkGameStatus(player, el) {
    moves += 1;
    console.log('Moves: ' + moves);

    score[player] += el.indicator;
    console.log('Score for player, ' + player + ': ' + score[player]);

    if (win(score[turn])) {
      alert(turn + ' wins!');
    } else if (moves === 9) {
      alert('Boooo!');
    } else {
      turn = (turn === 'X') ? 'O' : 'X';
      whosTurn.textContent = (turn === mySign) ? 'Your turn' : 'Your opponent\'s turn';
    }
  }

  function set() {

    if (turn !== mySign) return;

    if (this.firstChild.nodeValue !== EMPTY) return;

    publishPosition(mySign, this.dataset.position);

  }

  function play() {

    var board = document.createElement('table'),
      indicator = 1,
      i, j,
      row, cell;
    board.border = 1;

    for (i = 1; i < 4; i += 1) {
      row = document.createElement('tr');
      board.appendChild(row);
      for (j = 1; j < 4; j += 1) {
        cell = document.createElement('td');
        cell.dataset.position = i + '-' + j;
        cell.width = cell.height = 50;
        cell.align = cell.valign = 'center';
        cell.indicator = indicator;
        cell.onclick = set;
        cell.appendChild(document.createTextNode(''));
        row.appendChild(cell);
        squares.push(cell);
        indicator += indicator;

      }
    }

    tictactoe = document.getElementById('tictactoe');
    tictactoe.appendChild(board);
    startNewGame();
  }

})();
}
