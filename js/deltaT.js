/*  global $ _ tinycolor Trello */
const shouldStore = (lastObj, thisObj) => {
  if (_.isEqual(lastObj.data, thisObj.data)) return false;
  const hour = 1000 * 60 * 60;
  if (lastObj.date + hour >= thisObj.date) return false;
  return true;
};
const diffCards = (listId, addedOrDone, preGist) => {
  const newGist = preGist;
  const board = _.find(preGist.boards, { id: listId });
  const bN = board.id;
  const lN = _.findIndex(board.lists, { id: listId });
  const diffyCards = preGist.boards[bN].lists[lN][addedOrDone];
  if (diffyCards) delete newGist.boards[bN].lists[lN][addedOrDone];
  window.preGist = newGist;
  return diffyCards;
};
const getObjects = (timeStamps, justMax) => {
  const times = new Promise((resolve, reject) => {
    $.post('/times', {
      dataType: 'json',
      data: JSON.stringify(timeStamps)
    }.done((data) => {
      console.log('data', data);
      window.graph = data;
      return resolve(data);
    })).fail((error) => {
      console.log('jQuery post error!');
      return reject(error);
    });
  });
  return times;
};

const generateDate = (preGist) => {
  const boardData = preGist.boards.map((board) => {
    const listData = board.lists.map((list) => {
      return {
        id: list.id,
        totalCards: list.cards.length,
        removedCards: diffCards(list.id, 'doneCards', preGist),
        addedCards: diffCards(list.id, 'addedCards', preGist)
      };
    });
    return {
      id: board.id,
      totalCards: _.flatMap(board.lists, 'cards').length,
      filteredTotalCards: board.cards,
      unDoneCards: _.flatMap(_.reject(_.reject(_.reject(board.lists, 'ignore'), 'done'), 'fail'), 'cards').length,
      lists: listData
    };
  });
  return {
    date: Date.now(),
    data: {
      totalCards: _.flatMap(_.flatMap(preGist.boards, 'lists'), 'cards').length,
      filteredTotalCards: _.sum(_.flatMap(preGist.boards, 'cards')),
      unDoneCards: _.flatMap(_.reject(_.reject(_.reject(_.flatMap(_.reject(preGist.boards, 'ignore'), 'lists'), 'ignore'), 'done'), 'fail'), 'cards').length,
      boards: boardData
    }
  };
};

const retDataNames = (min, max, justMax) => {
  const histFiltered = new Promise((resolve, reject) => {
    $.getJSON('/data').done((data) => {
      let times = _.filter(data.data, (e) => {
        if (!!Number.parseInt(e, 10)) return true;
        return false;
      }).map((e) => {
        const numericalDate = Number.parseInt(e, 10);
        return numericalDate;
      });
      //  fuck you linter; these filtering lines are gorgeous.
      if (min) times = _.filter(times, (e) => { return (e >= min); });
      if (max) times = _.filter(times, (e) => { return (e <= max); });
      if (justMax) times = times[times.length - 1];
      return resolve(times);
    }).fail((error) => {
      reject(error);
    });
  }).then((times) => {
    const filteredObjects = getObjects(times, justMax);
    return filteredObjects;
  });
  return histFiltered;
};
