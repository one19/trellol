var gist = {
  boards: []
};

var success = function(successMsg) {
  console.log(successMsg);
};

var error = function(errorMsg) {
  console.log("ERROR", errorMsg);
};

var getLists = function(board, allLists) {
  allLists.forEach(function(l, i) {
    var list = {
      name: l.name,
      id: l.id
    }
    var last = false;
    if (i === allLists.length - 1) last = true;
    Trello.get('/lists/'+l.id+'/cards', finishUp.bind(this, board, list, last), error);
  });
}

var finishUp = function(board, list, last, allCards) {
  console.log('allCards', allCards);
  console.log('board', board);
  console.log('list', list);
  console.log('last', last);
  list.cards = allCards;
  board.lists.push(list);
  if (last) gist.boards.push(board);
}

var getGist = function(allBoards) {
  allBoards.forEach(function(b) {
    var name = (b.name.slice(-4) === '[E!]')? b.name.slice(0, -4): b.name;
    var board = {
      name: name,
      id: b.id,
      back: b.prefs.backgroundImage || b.prefs.backgroundColor,
      lists: [],
      blackLists: []
    }
    Trello.get('/boards/'+b.id+'/lists', getLists.bind(this, board), error);
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

$(".button").on("click", function(e) {
  if (e.currentTarget.id === "getGist") {
    Trello.get('/member/me/boards', getGist, error);
  }
  console.log('e', e);
})

