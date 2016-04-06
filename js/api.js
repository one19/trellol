var gist = { boards: [], blackList: {boards: [], lists: []}, state: {} };
var preGist = JSON.parse(window.localStorage.getItem("gist")) || { boards: [{lists: [{cards: []}]}], blackList: {boards: [], lists: []}, state: {} };

var success = function(successMsg) {
  console.log(successMsg);
};

var error = function(errorMsg) {
  $('#alert').html(errorMsg);
  console.log("ERROR", errorMsg);
};

var getAll = function(board, last, boardData) {
  var preGistBoard = _.find(preGist.boards, {id: board.id});
  if (preGistBoard) {
    board.ignore = preGistBoard.ignore;
    board.order = preGistBoard.order;
    board.cards = boardData.cards.length;
  }
  boardData.lists.forEach(function(l) {
    var name = (l.name.slice(-4) === "[!E]")? l.name.slice(0, -4): l.name;
    var cards = _.filter(boardData.cards, {idList: l.id});
    var preGistList = {};
    if (preGistBoard) {
      preGistList = _.find(preGistBoard.lists, {id: l.id});
    }
    var simpleCards = cards.map( function (e) {
      var attachments = e.attachments.map( function (i) {return i.name} );
      return {
        id: e.id,
        attachments: attachments,
        dateLastActivity: e.dateLastActivity,
        name: e.name,
        shortUrl: e.shortUrl,
        idBoard: e.idBoard,
        idList: e.idList,
        type: "card"
      };
    });
    board.lists.push({
      name: name,
      type: "list",
      id: l.id,
      idBoard: l.idBoard,
      cards: simpleCards,
      ignore: preGistList.ignore,
      done: preGistList.done,
      order: preGistList.order
    });
  });
  gist.boards.push(board);
  if (last) {
    if (preGist.blackList) gist.blackList = preGist.blackList;
    if (preGist.state) gist.state = preGist.state;
    preGist = gist;
    gist = { boards: [] };
    setGist(preGist);
    console.log("Done storing!");
  }
  setTimeout(redrawPage(preGist.state.obj), 5000);
}

var getBoards = function(allBoards) {
  console.log(allBoards);
  allBoards.forEach(function(b, i) {
    var board = {
      name: b.name,
      type: "board",
      id: b.id,
      back: b.prefs.backgroundImage || b.prefs.backgroundColor,
      lists: [],
      starred: b.starred,
      cards: 0
    }
    var last = false;
    if (i === allBoards.length - 1) last = true;
    Trello.get("/boards/"+b.id+"?fields=all&cards=all&card_fields=all&card_attachments=true&lists=all&list_fields=all&members=all&member_fields=all&checklists=all&checklist_fields=all&organization=false", getAll.bind(this, board, last), error);
  });
}

var setGist = function(gest) {
  window.localStorage.setItem("gist", JSON.stringify(gest));
  console.log("Gist set!")
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
