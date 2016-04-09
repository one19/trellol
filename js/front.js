var maxCards = 0;
var minCards = 0;

var preCacheBigAssets = function () {
  var store = $('#store');
  if (store.children().length > 0) return true;
  preGist.boards.forEach(function(board){
    var style = {};
    var nothing = $("<div class=\"store\"></div>");
    if (board.back.match(/http|www|\/\//)) {
      style["background-image"] = "url(" + board.back + ")";
    } else {
      return true;
    }
    store.append(nothing.css(style));
  });
}

var rScale = function (minWanted, maxWanted, minVal, maxVal, val) {
  var bSizeDel = maxWanted - minWanted;
  var valDel = maxVal - minVal;

  return Math.round(((bSizeDel) * ((val - minVal)/valDel)) + minWanted);
};

$("body").on("click", "h2.button", function(e) {
  switch (e.currentTarget.id) {
    case "getGist":
      Trello.get('/member/me/boards', getBoards, error);
      break;
    case "boards":
      // window.history.pushState({}, "Home", '/');
      $(".alert").text("");
      preGist.state.page = "board";
      setGist(preGist);
      redrawPage(null);
      break;
    case "lists":
      $(".alert").text("");
      var boardId = preGist.state.obj.idBoard;
      // window.history.pushState({}, "Home", '/' + idBoard);
      preGist.state.page = "list";
      preGist.state.obj = _.find(preGist.boards, {id: boardId});
      setGist(preGist);
      redrawPage(preGist.state.obj);
      break;
    case "ignore":
      preGist.state.ignore = false;
      setGist(preGist);
      redrawPage(preGist.state.obj);
      break;
    case "noignore":
      preGist.state.ignore = true;
      setGist(preGist);
      redrawPage(preGist.state.obj);
      break;
    default: //travel between views
      if (preGist.state.page === "board") {
        var board = _.find(preGist.boards, {id: e.currentTarget.id})
        // window.history.pushState(board, board.name, '/' + board.id);
        preGist.state.obj = board;
        preGist.state.page = "list";
        setGist(preGist);
        redrawPage(preGist.state.obj);
      } else if (preGist.state.page === "list") {
        var list = _.find(preGist.state.obj.lists, {id: e.currentTarget.id});
        // window.history.pushState(board, board.name, '/' + list.idBoard + '/' + list.id);
        preGist.state.obj = list;
        preGist.state.page = "card";
        setGist(preGist);
        redrawPage(preGist.state.obj);
      } else if (preGist.state.page === "card") {
        var card = _.find(preGist.state.obj.cards, {id: e.currentTarget.id});
        var win = window.open(card.shortUrl, '_blank');
        win.focus();
      }
      break;
  }
});

$("body").on("click", "div.checkbox", function(e) {
  var c = $("input." + e.currentTarget.className.split(" ").join("."));
  (c.attr("checked"))? c.attr("checked", false): c.attr("checked", true);

  if (!preGist.blackList) preGist.blackList = {boards: [], lists: []};
  var classes = e.currentTarget.className;
  var targetID = _.last(classes.split(" "));

  if (classes.match(/board/gi)) {
    var bN = _.findIndex(preGist.boards, {id: targetID});

    if (classes.match(/ignore/gi)) {
      if (!(preGist.blackList.boards.includes(targetID))) {
        preGist.boards[bN].ignore = true;
        preGist.blackList.boards.push(targetID);
      } else {
        preGist.boards[bN].ignore = false;
        _.pull(preGist.blackList.boards, targetID);
      }
    } else if (classes.match(/done|fail/gi)) {
      console.log("Congrats; you're a retard.");
    } else if (classes.match(/order/gi)) {
      if (preGist.boards[bN].order) {
        preGist.boards[bN].order = false;
      } else {
        preGist.boards[bN].order = true;
      }
    }

  } else if (classes.match(/list/gi)) {
    var bN = _.findIndex(preGist.boards, {id: preGist.state.obj.id});
    var lN = _.findIndex(preGist.boards[bN].lists, {id: targetID});

    if (classes.match(/ignore/gi)) {
      if (!(preGist.blackList.lists.includes(targetID))) {
        preGist.boards[bN].lists[lN].ignore = true;
        preGist.blackList.lists.push(targetID);
      } else {
        preGist.boards[bN].lists[lN].ignore = false;
        _.pull(preGist.blackList.lists, targetID);
      }
    } else if (classes.match(/done/gi)) {
      var doneList = _.find(preGist.boards[bN].lists, {done: true});
      if (doneList && (doneList.id !== preGist.boards[bN].lists[lN].id)) {
        preGist.boards[bN].lists[lN].done = false;
        $("#alert").text("Only one DONE list allowed.");
      } else if (preGist.boards[bN].lists[lN].done) {
        preGist.boards[bN].lists[lN].done = false;
      } else {
        preGist.boards[bN].lists[lN].done = true;
      }
    } else if (classes.match(/fail/gi)) {
      var failList = _.find(preGist.boards[bN].lists, {fail: true});
      if (failList && (failList.id !== preGist.boards[bN].lists[lN].id)) {
        preGist.boards[bN].lists[lN].fail = false;
        $("#alert").text("Only one FAILURE list allowed.");
      } else if (preGist.boards[bN].lists[lN].fail) {
        preGist.boards[bN].lists[lN].fail = false;
      } else {
        preGist.boards[bN].lists[lN].fail = true;
      }
    } else if (classes.match(/order/gi)) {
      if (preGist.boards[bN].lists[lN].order) {
        preGist.boards[bN].lists[lN].order = false;
      } else {
        preGist.boards[bN].lists[lN].order = true;
      }
    }
    preGist.state.obj = preGist.boards[bN];

  } else if (classes.match(/card/gi)) {
    var bN = _.findIndex(preGist.boards, {id: preGist.state.obj.idBoard});
    var lN = _.findIndex(preGist.boards[bN].lists, {id: preGist.state.obj.id});
    var cN = _.findIndex(preGist.boards[bN].lists[lN].cards, {id: targetID});

    if (classes.match(/done/gi)) {
      var doneList = _.find(preGist.boards[bN].lists, {done: true});
      if (!doneList) {
        return $(".alert").text("No designated DONE list.");
      } else if (doneList.id === preGist.state.obj.id) {
        return $(".alert").text("This task is already done.");
      } else {
        var dN = _.findIndex(preGist.boards[bN].lists, {id: doneList.id});
        var removed = preGist.boards[bN].lists[lN].cards.splice(cN, 1)[0];
        preGist.state.obj = preGist.boards[bN].lists[lN];
        removed.done = true;
        preGist.boards[bN].lists[dN].cards.push(removed);
        moveCardToList(targetID, doneList.id);
      }
    } else if (classes.match(/ignore|order/gi)) {
      console.log("Congrats; you're a retard.");
    } else if (classes.match(/fail/gi)) {
      var failList = _.find(preGist.boards[bN].lists, {fail: true});
      if (!failList) {
        return $(".alert").text("No designated FAILURE list.");
      } else if (failList.id === preGist.state.obj.id) {
        return $(".alert").text("You failed at this task already.");
      } else {
        var fN = _.findIndex(preGist.boards[bN].lists, {id: failList.id});
        var removed = preGist.boards[bN].lists[lN].cards.splice(cN, 1)[0];
        preGist.state.obj = preGist.boards[bN].lists[lN];
        removed.fail = true;
        preGist.boards[bN].lists[fN].cards.push(removed);
        moveCardToList(targetID, failList.id);
      }
    }

  }

  setGist(preGist);
  redrawPage(preGist.state.obj);

});

var killIgnoreButton = function() {
  $("#ignore").remove();
  $("#noignore").remove();
}
var killPage = function() {
  $("#content").children().remove();
}

var redrawPage = function(obj) {
  killPage();
  killIgnoreButton();
  var button = $("<h2></h2>").addClass("button main");

  //show/hide ignored button
  if (preGist.state.ignore) {
    button.attr("id", "ignore").text("SHOW IGNORED");
  } else {
    button.attr("id", "noignore").text("HIDE IGNORED");
  }
  $(".topBar").append(button);

  if (preGist.state.page === "board") {
    boardsPage();
  } else if (preGist.state.page === "list") {
    listsPage(obj);
  } else {
    cardsPage(obj);
  }
}

var boardsPage = function() {
  var total = 0;
  var content = $("#content");
  if (preGist.boards.length == 0) return error("No Boards; Click reload data!");

  _.filter(preGist.boards, function(e) {
    if (preGist.state.ignore) {
      return !(preGist.blackList.boards.includes(e.id));
    } else {
      return true;
    }
  }).forEach(function(b) {
    total += b.cards;
    content.append(createBlob(b));
  });

  $("#total").html("TOTAL CARDS: " + total);
}

var listsPage = function(board) {
  var filteredLists = _.filter(board.lists, function(e) {
    if (!preGist.state.ignore) return true;
    return !(preGist.blackList.lists.includes(e.id));
  });
  if (!preGist.state.ignore) {
    filteredLists = _.find(preGist.boards, {id: board.id}).lists;
  }
  var total = _.reduce(board.lists, function(sum, n) {
    if (n.done) return sum;
    if (preGist.blackList.lists.includes(n.id) && preGist.state.ignore) return sum;
    return sum + n.cards.length;
  }, 0);
  //LOOK AWAY LOOK AWAY, THERE ISN'T GLOBAL POLLUTION & MUTATION HAPPENING HERE!
  //fixes the odd case of all-hidden lists resulting in errors
  if (filteredLists.length === 0) {
    filteredLists[0] = {cards: [0, 0]};
  }
  maxCards = _.maxBy(filteredLists, "cards").cards.length;
  minCards = _.minBy(filteredLists, "cards").cards.length;

  var content = $("#content");
  content.append($("<h2 class=\"button main\" id=\"boards\">BACK</div>"));
  filteredLists.forEach(function(l) {
    content.append(createBlob(l));
  });

  $('#total').html("TOTAL CARDS: " + total);
}

var cardsPage = function(list) {
  var content = $("#content");
  content.append($("<h2 class=\"button main\" id=\"lists\">BACK</div>"));
  list.cards.forEach(function(c) {
    content.append(createBlob(c));
  });
}

var createBlob = function(blob) {
  var ignoreChecked;
  var doneChecked;
  var orderChecked;
  var failChecked;
  if (blob.ignore) ignoreChecked = " checked=\"true\"";
  if (blob.done) doneChecked = " checked=\"true\"";
  if (blob.order) orderChecked = " checked=\"true\"";
  if (blob.fail) failChecked = " checked=\"true\"";
  var ret = $("<div class=\"" + blob.type + " button " + blob.id + "\">"
    + "<h2 class=\"main " + blob.type + " button\" id=\"" + blob.id + "\">"
    + blob.name + "</h2>"
      + "<div class=\"checkbox ignore " + blob.type + " " + blob.id + "\">"
        + "<p class=\"checkbox ignore " + blob.type + " " + blob.id + "\">"
        + "Ignore:</p>"
        + "<input type=\"checkbox\" class=\"checkbox ignore " + blob.type + " "
        + blob.id + "\"" + ignoreChecked + "></input>"
      + "</div>"
      + "<div class=\"checkbox done " + blob.type + " " + blob.id + "\">"
        + "<p class=\"checkbox done " + blob.type + " " + blob.id + "\">"
        + "Done:</p>"
        + "<input type=\"checkbox\" class=\"checkbox done " + blob.type + " "
        + blob.id + "\"" + doneChecked + "></input>"
      + "</div>"
      + "<div class=\"checkbox fail " + blob.type + " " + blob.id + "\">"
        + "<p class=\"checkbox fail " + blob.type + " " + blob.id + "\">"
        + "Fail:</p>"
        + "<input type=\"checkbox\" class=\"checkbox fail " + blob.type + " "
        + blob.id + "\"" + failChecked + "></input>"
      + "</div>"
      + "<div class=\"checkbox order " + blob.type + " " + blob.id + "\">"
        + "<p class=\"checkbox order " + blob.type + " " + blob.id + "\">"
        + "Ordered:</p>"
        + "<input type=\"checkbox\" class=\"checkbox order " + blob.type + " "
        + blob.id + "\"" + orderChecked + "></input>"
      + "</div>"
    + "</div>");
  return styleBlob(blob, ret);
}

var styleBlob = function(blob, obj) {
  var ret = {};
  var boardBack;

  if (blob.type === "board") {
    var filteredBoards = _.filter(preGist.boards, function(e) {
      return !(preGist.blackList.boards.includes(e.id));
    });
    //fixes the odd case of all-hidden boards resulting in errors
    if ((filteredBoards.length === 0) && !preGist.state.ignore) {
      filteredBoards = preGist.boards;
    }
    var maxLists = _.maxBy(filteredBoards, 'lists').lists.length;
    var minLists = _.minBy(filteredBoards, 'lists').lists.length;
    var raCard = "";
    var sampled = {};

    if (blob.order) {
      sampled = _.sample(_.first(blob.lists).cards);
    } else {
      sampled = _.sample(_.sample(blob.lists).cards);
    }
    (!sampled)? raCard = "EMPTY LIST": raCard = sampled.name;
    obj.attr("title", "CARDS: " + blob.cards + "\nRANDOM CARD: " + raCard);
    boardBack = blob.back;
    ret["font-size"] = rScale(10, 45, minLists, maxLists, blob.lists.length)
      + "px";

  } else if (blob.type === "list") {
    var raCard = "";

    if (blob.order) {
      sampled = _.first(blob.cards);
    } else {
      sampled = _.sample(blob.cards);
    }
    boardBack = preGist.state.obj.back;
    (!sampled)? raCard = "EMPTY LIST": raCard = sampled.name;

    obj.attr("title", "CARDS: " + blob.cards.length
      + "\nRANDOM CARD: " + raCard);
    ret["font-size"] = rScale(10, 45, minCards, maxCards, blob.cards.length)
      + "px";
  } else {
    boardBack = _.find(preGist.boards, {id: blob.idBoard}).back;
  }
  ret = styleBack(boardBack, ret);

  return obj.css(ret);;
}

var styleBack = function(obj, ret) {
  if (obj.match(/http|www|\/\//)) {
    ret["background-image"] = "url(" + obj + ")";
  } else {
    ret["background-color"] = obj;
  }
  return ret;
}

redrawPage(preGist.state.obj);
preCacheBigAssets();
