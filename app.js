var gist = {
  boards: []
};

var success = function(successMsg) {
  console.log(successMsg);
};

var error = function(errorMsg) {
  console.log("ERROR", errorMsg);
};

var getLists = function(allLists, board) {
  allLists.forEach(function(l, i) {
    var list = {
      name: l.name,
      id: l.id
    }
    var last = false;
    if (i === allLists.length - 1) last = true;
    Trello.get('/lists/'+l.id+'/cards', finishUp.bind(board, list, last), error);
  });
}

var finishUp = function(allCards, board, list, last) {
  list.cards = allCards;
  board.lists.push(list);
  if (last) gist.boards.push(board);
}

var getGist = function(allBoards) {
  allBoards.forEach(function(b) {
    var board = {
      name: b.name,
      id: b.id,
      back: b.prefs.backgroundImage || b.prefs.backgroundColor,
      lists: [],
      blackLists: []
    }
    Trello.get('/boards/'+b.id+'/lists', getLists.bind(board), error);
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

