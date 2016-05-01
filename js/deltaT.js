var generateDate = function() {
  var boardData = preGist.boards.map(function(board) {
    var listData = board.lists.map(function(list) {

      return {
        id: list.id,
        totalCards: list.cards.length,
        removedCards: diffCards(list.id, "doneCards"),
        addedCards: diffCards(list.id, "addedCards")
      };
    });
    return {
      id: board.id,
      totalCards: _.flatMap(board.lists, "cards").length,
      filteredTotalCards: board.cards,
      unDoneCards: _.flatMap(_.reject(_.reject(_.reject(board.lists, "ignore"), "done"), "fail"), "cards").length,
      lists: listData
    }
  });
  return {
    date: Date.now(),
    data: {
      totalCards: _.flatMap(_.flatMap(preGist.boards, "lists"), "cards").length,
      filteredTotalCards: _.sum(_.flatMap(preGist.boards, "cards")),
      unDoneCards: _.flatMap(_.reject(_.reject(_.reject(_.flatMap(_.reject(preGist.boards, "ignore"), "lists"), "ignore"), "done"), "fail"), "cards").length,
      boards: boardData
    }
  }
}

var shouldStore = function(lastObj, thisObj) {
  if (_.isEqual(lastObj.data, thisObj.data)) return false;
  var hour = 1000 * 60 * 60;
  if (lastObj.date + hour >= thisObj.date) return false;
  return true;
}

var diffCards = function(listId, addedOrDone) {
  var board = _.find(preGist.boards, {id: listId});
  var bN = board.id;
  var lN = _.findIndex(board.lists, {id: listId});
  var diffCards = preGist.boards[bN].lists[ln][addedOrDone];
  if (diffCards) delete preGist.boards[bN].lists[ln][addedOrDone];
  return diffCards;
}