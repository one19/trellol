/*  global $ _ tinycolor Trello */
/*  global $ redrawPage */

const emptyState = { boards:
  [{ lists: [{ cards: [] }] }],
  blackList: { boards: [],
    lists: [] },
  state: { page: 'board' }
};

let gist = { boards: [], blackList: { boards: [], lists: [] }, state: {} };
let preGist = JSON.parse(window.localStorage.getItem('gist')) || emptyState;
window.preGist = preGist;

const success = (successMsg) => {
  console.log('Successful transaction: ', successMsg);
  return successMsg;
};
const error = (errorMsg) => {
  $('#alert').html(errorMsg);
  console.error('ERROR', errorMsg);
};
const moveCardToList = (cardId, listId) => { // eslint-disable-line
  console.log('moving a card from one place to another');
  Trello.put(`/cards/${cardId}/idList`, { value: listId });
};
const createCard = (listId, name, pos, due) => { // eslint-disable-line
  const p = pos || 'bottom';
  const d = due || null;
  const newCard = {
    name,
    pos: p,
    due: d,
    idList: listId
  };
  Trello.post('/cards/', newCard, success, error);
};
const setGist = (gest) => {
  window.preGist = gest;
  window.localStorage.setItem('gist', JSON.stringify(gest));
};

const getAll = (board, boardData) => {
  const newBoard = board;
  const preGistBoard = _.find(preGist.boards, { id: board.id });
  if (preGistBoard) {
    newBoard.ignore = preGistBoard.ignore;
    newBoard.order = preGistBoard.order;
  }
  newBoard.cards = 0;
  boardData.lists.forEach((l) => {
    const name = (l.name.slice(-4) === '[!E]') ? l.name.slice(0, -4) : l.name;
    const cards = _.filter(boardData.cards, { idList: l.id });
    let preGistList = {
      done: false,
      ignore: false,
      fail: false,
      order: false
    };
    if (preGistBoard) {
      const found = _.find(preGistBoard.lists, { id: l.id });
      if (found) preGistList = found;
    }
    const pgl = _.find(_.flatMap(preGist.boards, 'lists'), { id: l.id });
    let pglCards;
    if (pgl) pglCards = pgl.cards;
    let newCards;
    const simpleCards = cards.map((e) => {
      const attachments = e.attachments.map((i) => {
        const attachmentName = i.name;
        return attachmentName;
      });
      if (!_.find(pglCards, { id: e.id }) && !newCards) newCards = [];
      if (!_.find(pglCards, { id: e.id })) newCards.push(e.id);
      return {
        id: e.id,
        attachments,
        dateLastActivity: e.dateLastActivity,
        name: e.name,
        shortUrl: e.shortUrl,
        idBoard: e.idBoard,
        idList: e.idList,
        type: 'card'
      };
    });
    newBoard.lists.push({
      name,
      type: 'list',
      id: l.id,
      idBoard: l.idBoard,
      cards: simpleCards,
      ignore: preGistList.ignore,
      done: preGistList.done,
      fail: preGistList.fail,
      order: preGistList.order,
      addedCards: newCards
    });
    if (!(preGistList.done || preGistList.fail)) newBoard.cards += cards.length;
  });
  return newBoard;
};

const getBoards = (allBoards) => { // eslint-disable-line
  const all = [];
  allBoards.forEach((b) => {
    const p = new Promise((res, reject) => {
      Trello.get(`/boards/${b.id}?fields=all&cards=all&card_fields=all&card_attachments=true&lists=all&list_fields=all&members=all&member_fields=all&checklists=all&checklist_fields=all&organization=false`, res, reject); // eslint-disable-line
    });
    all.push(p);
  });

  return Promise.all(all).then((fullRet) => {
    fullRet.forEach((board) => {
      const newBoard = {
        name: board.name,
        type: 'board',
        id: board.id,
        back: board.prefs.backgroundImage || board.prefs.backgroundColor,
        lists: [],
        starred: board.starred,
        cards: 0
      };
      gist.boards.push(getAll(newBoard, board));
    });

    if (preGist.blackList) gist.blackList = preGist.blackList;
    if (preGist.state) gist.state = preGist.state;
    if (preGist.state.obj && preGist.state.obj.type === 'board') {
      preGist.state.obj = _.find(gist.boards, { id: preGist.state.obj.id });
    } else if (preGist.state.obj && preGist.state.obj.type === 'list') {
      preGist.state.obj = _.find(_.find(gist.boards,
        { id: preGist.state.obj.idBoard }).lists, { id: preGist.state.obj.id });
    }
    preGist = gist;
    gist = { boards: [] };
    setGist(preGist);
    console.log('Done storing!');
    redrawPage(window.preGist.state.obj, window.preGist);
    $('#getGist').addClass('button').text('RELOAD DATA');
  }, (err) => {
    error(err);
  });
};

Trello.authorize({
  type: 'popup',
  name: 'TEST APP',
  scope: {
    read: true,
    write: true },
  expiration: 'never',
  success,
  error
});
