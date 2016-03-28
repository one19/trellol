var gist = { boards: [] };
var preGist = JSON.parse(window.localStorage.getItem('gist')) || { boards: [] };

var success = function(successMsg) {
  console.log(successMsg);
};

var error = function(errorMsg) {
  $('#alert').html(errorMsg);
  console.log("ERROR", errorMsg);
};

var getLists = function(board, blast, allLists) {
  allLists.forEach(function(l, j) {
    var name = (l.name.slice(-4) === '[E!]')? l.name.slice(0, -4): l.name;
    var list = {
      name: name,
      id: l.id
    }
    var last = false;
    if (j === allLists.length - 1) last = true;
    Trello.get('/lists/'+l.id+'/cards', finishUp.bind(this, board, list, last, blast), error);
  });
}

var finishUp = function(board, list, last, blast, allCards) {
  list.cards = allCards;
  board.lists.push(list);
  if (last) gist.boards.push(board);
  if (last && blast) {
    setTimeout(function() {
      //lololol don't judge me. I'm working with someone else's callbacks
      gist.last = Date.now();
      window.localStorage.setItem('gist', JSON.stringify(gist));
      preGist = gist;
      gist = { boards: [] };
    }, 5000);
  }
}

var getGist = function(allBoards) {
  console.log(allBoards);
  allBoards.forEach(function(b, i) {
    var board = {
      name: b.name,
      id: b.id,
      back: b.prefs.backgroundImage || b.prefs.backgroundColor,
      lists: [],
      blackLists: []
    }
    var blast = false;
    if (i === allBoards.length - 1) blast = true;
    Trello.get('/boards/'+b.id+'/lists', getLists.bind(this, board, blast), error);
  });
}

Trello.authorize({
  type: "popup",
  name: "TEST APP",
  scope: {
    read: true,
    write: true },
  expiration: "never",
  success: success,
  error: error
});
