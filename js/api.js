var gist = { boards: [], blackList: {boards: [], lists: []}, state: {} };
var preGist = JSON.parse(window.localStorage.getItem("gist")) || { boards: [{lists: [{cards: []}]}], blackList: {boards: [], lists: []}, state: {page: "board"} };

var success = function(successMsg) {
  console.log(successMsg);
};

var error = function(errorMsg) {
  $('#alert').html(errorMsg);
  console.log("ERROR", errorMsg);
};

var getAll = function(board, boardData) {
  var preGistBoard = _.find(preGist.boards, {id: board.id});
  if (preGistBoard) {
    board.ignore = preGistBoard.ignore;
    board.order = preGistBoard.order;
    board.cards = boardData.cards.length;
  }
  board.cards = 0;
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
      fail: preGistList.fail,
      order: preGistList.order
    });
    if (!(preGistList.done || preGistList.fail)) board.cards += cards.length;
  });
  return board;
}

var getBoards = function(allBoards) {
  var all = [];

  allBoards.forEach(function(b, i) {
    var p = new Promise(function(res, error) {
      Trello.get("/boards/"+b.id+"?fields=all&cards=all&card_fields=all&card_attachments=true&lists=all&list_fields=all&members=all&member_fields=all&checklists=all&checklist_fields=all&organization=false", res, error);
    });
    all.push(p);
  });

  Promise.all(all).then(function(fullRet){
    fullRet.forEach(function(board) {
      var newBoard = {
        name: board.name,
        type: "board",
        id: board.id,
        back: board.prefs.backgroundImage || board.prefs.backgroundColor,
        lists: [],
        starred: board.starred,
        cards: 0
      }
      gist.boards.push(getAll(newBoard, board));
    });

    if (preGist.blackList) gist.blackList = preGist.blackList;
    if (preGist.state) gist.state = preGist.state;
    preGist = gist;
    gist = { boards: [] };
    setGist(preGist);
    console.log("Done storing!");
    redrawPage(preGist.state.obj);
  }, function(err) {
    error(err);
  })
}

var moveCardToList = function(cardId, listId) {
  console.log('moving a card from one place to another')
  Trello.put("/cards/" + cardId + "/idList", {value: listId});
}

var setGist = function(gest) {
  window.localStorage.setItem("gist", JSON.stringify(gest));
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
