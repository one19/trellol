/*  global $ _ tinycolor Trello */
/*  global moveCardToList setGist updateBackground getBoards error */
/*  global shouldStore getObjects writeObject generateDate retDataNames */
/*  global emptyState back */

const preCacheBigAssets = (preGist) => {
  const store = $('#store');
  if (store.children().length > 0) return true;
  preGist.boards.forEach((board) => {
    const style = {};
    const nothing = $('<div class="store"></div>');
    if (board.back.match(/http|www|\/\//)) {
      style['background-image'] = `url(${board.back})`;
    } else {
      style['background-color'] = 'black';
    }
    store.append(nothing.css(style));
  });
  return store;
};

const rScale = (minWanted, maxWanted, minVal, maxVal, val) => {
  const bSizeDel = maxWanted - minWanted;
  const valDel = maxVal - minVal;

  return Math.round(((bSizeDel) * ((val - minVal) / valDel)) + minWanted);
};
const rgGoodBad = (goodFrac) => {
  const spunColor = tinycolor('rgb(168, 30, 48)').spin(90 * goodFrac).toString();
  return spunColor;
};
const styleBack = (obj, ret) => {
  const backRet = ret;
  if (obj.match(/http|www|\/\//)) {
    backRet['background-image'] = `url(${obj})`;
  } else {
    backRet['background-color'] = obj;
  }
  return backRet;
};
const renderGraph = (shouldGraph, graphContents) => {
  const biggun = $('<div id="biggun"></div>').css({ 'z-index': 998 });
  const graphBack = $('<div id="graphBack"></div>');
  if (shouldGraph) {
    $('#graph').text(' < ').css({ 'z-index': 999 });
    $('.container').css({ '-webkit-filter': 'blur(3px)' });
    $('.topBar').css({ '-webkit-filter': 'blur(3px)' });
    $('body').append(biggun, graphBack);
    console.log('TODO: ', graphContents);
  } else {
    $('#graph').text(' > ').css({ 'z-index': 3 });
    $('.container').css({ '-webkit-filter': 'blur(0px)' });
    $('.topBar').css({ '-webkit-filter': 'blur(0px)' });
    $('#biggun').remove();
    $('#graphBack').remove();
  }
};
const killIgnoreButton = () => {
  $('#ignore').remove();
  $('#noignore').remove();
};
const killPage = () => {
  $('#content').children().remove();
};
const redrawPage = (obj, preGist) => {
  killPage();
  killIgnoreButton();
  const button = $('<h2></h2>').addClass('button main');

  //  show/hide ignored button
  if (preGist.state.ignore) {
    button.attr('id', 'ignore').text('SHOW IGNORED');
  } else {
    button.attr('id', 'noignore').text('HIDE IGNORED');
  }
  $('.topBar').append(button);

  // LOLNO linting, these get called well after doc interp.
  if (preGist.state.page === 'board') {
    boardsPage(preGist); // eslint-disable-line
  } else if (preGist.state.page === 'list') {
    listsPage(obj, preGist); // eslint-disable-line
  } else {
    cardsPage(obj, preGist); // eslint-disable-line
  }
  renderGraph(preGist.state.graph, obj);
};

$('body').on('click', 'h2.button', (e) => {
  const newGist = window.preGist;
  switch (e.currentTarget.id) {
    case 'getGist': {
      $('#getGist').removeClass('button').text('Loading...');
      retDataNames(null, null, true).then((latestDate) => {
        getObjects(latestDate).then((lastObj) => {
          const nowObj = generateDate(newGist);
          const lastJSON = JSON.parse(lastObj.data[0].data);
          if (shouldStore(lastJSON, nowObj)) return writeObject(nowObj);
          return false;
        });
      });
      Trello.get('/member/me/boards', getBoards, error);
      break;
    }
    case 'boards': {
      //  window.history.pushState({}, 'Home', '/');
      $('.alert').text('');
      newGist.state.page = 'board';
      setGist(newGist);
      redrawPage(null, newGist);
      break;
    }
    case 'lists': {
      $('.alert').text('');
      const boardId = newGist.state.obj.idBoard;
      //  window.history.pushState({}, "Home", '/' + idBoard);
      newGist.state.page = 'list';
      newGist.state.obj = _.find(newGist.boards, { id: boardId });
      setGist(newGist);
      redrawPage(newGist.state.obj, newGist);
      break;
    }
    case 'ignore': {
      newGist.state.ignore = false;
      setGist(newGist);
      redrawPage(newGist.state.obj, newGist);
      break;
    }
    case 'noignore': {
      newGist.state.ignore = true;
      setGist(newGist);
      redrawPage(newGist.state.obj, newGist);
      break;
    }
    case 'graph': {
      if (!newGist.state.graph) {
        newGist.state.graph = true;
        setGist(newGist);
      } else {
        newGist.state.graph = false;
        setGist(newGist);
      }
      redrawPage(newGist.state.obj, newGist);
      break;
    }
    default: { // travel between views
      if (newGist.state.page === 'board') {
        const board = _.find(newGist.boards, { id: e.currentTarget.id });
        //  window.history.pushState(board, board.name, '/' + board.id);
        newGist.state.obj = board;
        newGist.state.page = 'list';
        setGist(newGist);
        redrawPage(newGist.state.obj, newGist);
      } else if (newGist.state.page === 'list') {
        const list = _.find(newGist.state.obj.lists, { id: e.currentTarget.id });
        //  window.history.pushState(board, board.name, '/' + list.idBoard + '/' + list.id);
        newGist.state.obj = list;
        newGist.state.page = 'card';
        setGist(newGist);
        redrawPage(newGist.state.obj, newGist);
      } else if (newGist.state.page === 'card') {
        const card = _.find(newGist.state.obj.cards, { id: e.currentTarget.id });
        const win = window.open(card.shortUrl, '_blank');
        win.focus();
      }
      break;
    }
  }
});
$('body').on('click', 'div.checkbox', (e) => {
  const newGist = window.preGist;
  const c = $(`input.${e.currentTarget.className.split(' ').join('.')}`);
  if (c.attr('checked')) { // fine linter, fine, no ternaries
    c.attr('checked', false);
  } else {
    c.attr('checked', true);
  }

  if (!newGist.blackList) newGist.blackList = { boards: [], lists: [] };
  const classes = e.currentTarget.className;
  const targetID = _.last(classes.split(' '));

  if (classes.match(/board/gi)) {
    const bN = _.findIndex(newGist.boards, { id: targetID });

    if (classes.match(/ignore/gi)) {
      if (!(newGist.blackList.boards.includes(targetID))) {
        newGist.boards[bN].ignore = true;
        newGist.blackList.boards.push(targetID);
      } else {
        newGist.boards[bN].ignore = false;
        _.pull(newGist.blackList.boards, targetID);
      }
    } else if (classes.match(/done|fail/gi)) {
      console.warn('Congrats; you\'re a retard.');
    } else if (classes.match(/order/gi)) {
      if (newGist.boards[bN].order) {
        newGist.boards[bN].order = false;
      } else {
        newGist.boards[bN].order = true;
      }
    }
  } else if (classes.match(/list/gi)) {
    const bN = _.findIndex(newGist.boards, { id: newGist.state.obj.id });
    const lN = _.findIndex(newGist.boards[bN].lists, { id: targetID });

    if (classes.match(/ignore/gi)) {
      if (!(newGist.blackList.lists.includes(targetID))) {
        newGist.boards[bN].lists[lN].ignore = true;
        newGist.blackList.lists.push(targetID);
      } else {
        newGist.boards[bN].lists[lN].ignore = false;
        _.pull(newGist.blackList.lists, targetID);
      }
    } else if (classes.match(/done/gi)) {
      const doneList = _.find(newGist.boards[bN].lists, { done: true });
      if (doneList && (doneList.id !== newGist.boards[bN].lists[lN].id)) {
        newGist.boards[bN].lists[lN].done = false;
        $('#alert').text('Only one DONE list allowed.');
      } else if (newGist.boards[bN].lists[lN].done) {
        newGist.boards[bN].lists[lN].done = false;
      } else {
        newGist.boards[bN].lists[lN].done = true;
      }
    } else if (classes.match(/fail/gi)) {
      const failList = _.find(newGist.boards[bN].lists, { fail: true });
      if (failList && (failList.id !== newGist.boards[bN].lists[lN].id)) {
        newGist.boards[bN].lists[lN].fail = false;
        $('#alert').text('Only one FAILURE list allowed.');
      } else if (newGist.boards[bN].lists[lN].fail) {
        newGist.boards[bN].lists[lN].fail = false;
      } else {
        newGist.boards[bN].lists[lN].fail = true;
      }
    } else if (classes.match(/order/gi)) {
      if (newGist.boards[bN].lists[lN].order) {
        newGist.boards[bN].lists[lN].order = false;
      } else {
        newGist.boards[bN].lists[lN].order = true;
      }
    }
    newGist.state.obj = newGist.boards[bN];
  } else if (classes.match(/card/gi)) {
    const bN = _.findIndex(newGist.boards, { id: newGist.state.obj.idBoard });
    const lN = _.findIndex(newGist.boards[bN].lists, { id: newGist.state.obj.id });
    const cN = _.findIndex(newGist.boards[bN].lists[lN].cards, { id: targetID });

    if (classes.match(/done/gi)) {
      const doneList = _.find(newGist.boards[bN].lists, { done: true });
      if (!doneList) {
        return $('.alert').text('No designated DONE list.');
      } else if (doneList.id === newGist.state.obj.id) {
        return $('.alert').text('This task is already done.');
      }
      const dN = _.findIndex(newGist.boards[bN].lists, { id: doneList.id });
      const removed = newGist.boards[bN].lists[lN].cards.splice(cN, 1)[0];
      newGist.state.obj = newGist.boards[bN].lists[lN];
      removed.done = true;
      newGist.boards[bN].lists[dN].cards.push(removed);
      if (!newGist.boards[bN].lists[lN].doneCards) newGist.boards[bN].lists[lN].doneCards = [];
      newGist.boards[bN].lists[lN].doneCards.push(targetID);
      moveCardToList(targetID, doneList.id);
    } else if (classes.match(/ignore|order/gi)) {
      console.warn('Congrats; you\'re a retard.');
    } else if (classes.match(/fail/gi)) {
      const failList = _.find(newGist.boards[bN].lists, { fail: true });
      if (!failList) {
        return $('.alert').text('No designated FAILURE list.');
      } else if (failList.id === newGist.state.obj.id) {
        return $('.alert').text('You failed at this task already.');
      }
      const fN = _.findIndex(newGist.boards[bN].lists, { id: failList.id });
      const removed = newGist.boards[bN].lists[lN].cards.splice(cN, 1)[0];
      newGist.state.obj = newGist.boards[bN].lists[lN];
      removed.fail = true;
      newGist.boards[bN].lists[fN].cards.push(removed);
      if (!newGist.boards[bN].lists[lN].doneCards) newGist.boards[bN].lists[lN].doneCards = [];
      newGist.boards[bN].lists[lN].doneCards.push(targetID);
      moveCardToList(targetID, failList.id);
    }
  }
  setGist(newGist);
  redrawPage(newGist.state.obj, newGist);
  return e;
});
$('body').on('click', 'div.logo', (e) => {
  if (window.interval !== 0) {
    clearInterval(window.interval);
    window.interval = 0;
  } else {
    window.interval = setInterval(() => {
      window.back = updateBackground(back);
    }, 10);
  }
  return e;
});

const styleBlob = (blob, obj, preGist) => {
  let ret = {};
  let boardBack;
  let pcDate;

  if (!blob.type) {
    return console.warn('Way to go dingus, you hid all of everything.');
  } else if (blob.type === 'board') {
    let filteredBoards = _.filter(preGist.boards, (e) => {
      const inBlackList = !(preGist.blackList.boards.includes(e.id));
      return inBlackList;
    });
    //  fixes the odd case of all-hidden boards resulting in errors
    if ((filteredBoards.length === 0) && !preGist.state.ignore) {
      filteredBoards = preGist.boards;
    }
    const maxLists = _.maxBy(filteredBoards, 'lists').lists.length;
    const minLists = _.minBy(filteredBoards, 'lists').lists.length;
    const lastDate = _.maxBy(_.flatMap(blob.lists, 'cards'), 'dateLastActivity');
    if (lastDate) {
      const lastDNum = new Date(lastDate.dateLastActivity).valueOf();
      let denom = preGist.state.latestDate - preGist.state.furthestDate;
      if (denom === 0) denom = 1;
      pcDate = (lastDNum - preGist.state.furthestDate) / denom;
    } else {
      pcDate = 1;
    }
    let raCard = '';
    let sampled = {};

    if (blob.order) {
      sampled = _.sample(_.first(blob.lists).cards);
    } else {
      sampled = _.sample(_.sample(blob.lists).cards);
    }
    if (!sampled) {
      raCard = 'EMPTY LIST';
    } else {
      raCard = sampled.name;
    }
    obj.attr('title', `CARDS: ${blob.cards} \nRANDOM CARD: ${raCard}`);
    boardBack = blob.back;
    ret['font-size'] = `${rScale(10, 45, minLists, maxLists, blob.lists.length)}px`;
  } else if (blob.type === 'list') {
    let sampled;
    let raCard = '';
    const lastDate = _.maxBy(blob.cards, 'dateLastActivity');
    if (lastDate) {
      const lastDNum = new Date(lastDate.dateLastActivity).valueOf();
      let denom = preGist.state.latestDate - preGist.state.furthestDate;
      if (denom === 0) denom = 1;
      pcDate = (lastDNum - preGist.state.furthestDate) / denom;
    } else {
      pcDate = 1;
    }

    if (blob.order) {
      sampled = _.first(blob.cards);
    } else {
      sampled = _.sample(blob.cards);
    }
    boardBack = preGist.state.obj.back;
    if (!sampled) {
      raCard = 'EMPTY LIST';
    } else {
      raCard = sampled.name;
    }

    obj.attr('title', `CARDS: ${blob.cards.length}\nRANDOM CARD: ${raCard}`);
    ret['font-size'] = `${rScale(10, 45, preGist.state.minCards,
      preGist.state.maxCards, blob.cards.length)}px`;
  } else if (blob.type === 'card') {
    boardBack = _.find(preGist.boards, { id: blob.idBoard }).back;
    const lastDNum = new Date(blob.dateLastActivity).valueOf();
    let denom = preGist.state.latestDate - preGist.state.furthestDate;
    if (denom === 0) denom = 1;
    pcDate = (lastDNum - preGist.state.furthestDate) / denom;
  }
  ret = styleBack(boardBack, ret);
  ret.border = `4px solid ${rgGoodBad(Math.pow(pcDate, 7))}`;

  return obj.css(ret);
};

const createBlob = (blob, preGist) => {
  let ignoreChecked = '';
  let doneChecked = '';
  let orderChecked = '';
  let failChecked = '';
  if (blob.ignore) ignoreChecked = ' checked="true"';
  if (blob.done) doneChecked = ' checked="true"';
  if (blob.order) orderChecked = ' checked="true"';
  if (blob.fail) failChecked = ' checked="true"';
  let cardAtt;
  if (blob.attachments) {
    cardAtt = blob.attachments.map((att) => {
      const thisLink = ` <a href=${att} class="attachments">Link</a>`;
      return thisLink;
    });
  } else { cardAtt = ''; }
  const ret = $(
    `<div class="${blob.type} button ${blob.id} over">\n
      <h2 class="main ${blob.type} button" id="${blob.id}">${blob.name}</h2>\n
      <div class="checkbox ignore ${blob.type} ${blob.id}">\n
        <p class="checkbox ignore ${blob.type} ${blob.id}">Ignore: </p>\n
        <input type="checkbox" class="checkbox ignore
         ${blob.type} ${blob.id}" ${ignoreChecked}></input>\n
      </div>\n
      <div class="checkbox done ${blob.type} ${blob.id}">\n
        <p class="checkbox done ${blob.type} ${blob.id}">Done: </p>\n
        <input type="checkbox" class="checkbox done
         ${blob.type} ${blob.id}" ${doneChecked}></input>\n
      </div>\n
      <div class="checkbox fail ${blob.type} ${blob.id}">\n
        <p class="checkbox fail ${blob.type} ${blob.id}">Fail: </p>\n
        <input type="checkbox" class="checkbox fail
         ${blob.type} ${blob.id}" ${failChecked}></input>\n
      </div>\n
      <div class="checkbox order ${blob.type} ${blob.id}">\n
        <p class="checkbox order ${blob.type} ${blob.id}">Ordered: </p>\n
        <input type="checkbox" class="checkbox order
         ${blob.type} ${blob.id}" ${orderChecked}></input>\n
      </div>\n
      ${cardAtt}\n
    </div>`);
  return styleBlob(blob, ret, preGist);
};

const boardsPage = (preGist) => {
  let total = 0;
  const newGist = preGist;
  if (_.isEqual(preGist === emptyState)) return error('No Boards; Click reload data!');

  const filterBoards = _.filter(preGist.boards, (e) => {
    if (!preGist.state.ignore) return true;
    return !(preGist.blackList.boards.includes(e.id));
  });
  const fCards = _.map(filterBoards, 'lists').map((board) => {
    if (_.flatMap(board, 'cards').length === 0) return new Date();
    const latestCard = _.maxBy(_.flatMap(board, 'cards'), 'dateLastActivity').dateLastActivity;
    return latestCard;
  });
  newGist.state.furthestDate = new Date(_.min(fCards, 'dateLastActivity')).valueOf();
  newGist.state.latestDate = new Date(_.max(fCards, 'dateLastActivity')).valueOf();

  const content = $('#content');
  filterBoards.forEach((b) => {
    total += b.cards;
    content.append(createBlob(b, preGist));
  });
  $('#total').html(`TOTAL CARDS: ${total}`);
  window.preGist = newGist;
  return 'boards';
};
const listsPage = (board, preGist) => {
  const newGist = preGist;
  const filteredLists = _.filter(board.lists, (e) => {
    if (!preGist.state.ignore) return true;
    return !(preGist.blackList.lists.includes(e.id));
  });

  const total = _.reduce(board.lists, (sum, n) => {
    if (n.done || n.fail) return sum;
    if (preGist.blackList.lists.includes(n.id) && preGist.state.ignore) return sum;
    return sum + n.cards.length;
  }, 0);
  //  fixes the odd case of all-hidden lists resulting in errors
  if (filteredLists.length === 0) { filteredLists[0] = { cards: [0, 0] }; }
  const fCards = _.map(_.flatMap(filteredLists, 'cards'), 'dateLastActivity');
  newGist.state.latestDate = new Date(_.max(fCards)).valueOf();
  newGist.state.furthestDate = new Date(_.min(fCards)).valueOf();
  newGist.state.maxCards = _.maxBy(filteredLists, 'cards').cards.length;
  newGist.state.minCards = _.minBy(filteredLists, 'cards').cards.length;

  const content = $('#content');
  content.append($('<h2 class="button main" id="boards">BACK</div>'));
  filteredLists.forEach((l) => {
    content.append(createBlob(l, preGist));
  });
  $('#total').html(`TOTAL CARDS: ${total}`);
  window.preGist = newGist;
  return 'lists';
};
const cardsPage = (list, preGist) => {
  const content = $('#content');
  const fCards = _.map(list.cards, 'dateLastActivity');
  const total = list.cards.length;
  const newGist = preGist;
  newGist.state.latestDate = new Date(_.max(fCards)).valueOf();
  newGist.state.furthestDate = new Date(_.min(fCards)).valueOf();

  content.append($('<h2 class="button main" id="lists">BACK</div>'));
  list.cards.forEach((c) => {
    content.append(createBlob(c, preGist));
  });
  $('#total').html(`TOTAL CARDS: ${total}`);
  window.preGist = newGist;
  return 'cards';
};

redrawPage(window.preGist.state.obj, window.preGist);
if (!_.isEqual(window.preGist, emptyState)) preCacheBigAssets(window.preGist);
