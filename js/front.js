var maxCards = 0;
var minCards = 0;

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
      preGist.state.page = "board";
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
    default:
      var board = _.find(preGist.boards, {id: e.currentTarget.id});
      if (board) {
        preGist.state.obj = board;
        preGist.state.page = "list";
        setGist(preGist);
        redrawPage(preGist.state.obj);
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
    } else if (classes.match(/done/gi)) {
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

    } else if (classes.match(/order/gi)) {

    }
    preGist.state.obj = preGist.boards[bN];
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
  killPage();
  //LOOK AWAY LOOK AWAY, THERE ISN'T GLOBAL POLLUTION & MUTATION HAPPENING HERE!
  maxCards = _.maxBy(board.lists, "cards").cards.length;
  minCards = _.minBy(board.lists, "cards").cards.length;
  var total = 0;

  var content = $("#content");
  content.append($("<h2 class=\"button\" id=\"boards\">BACK</div>"));
  _.filter(board.lists, function(e) {
    if (preGist.state.ignore) {
      return !(preGist.blackList.lists.includes(e.id));
    } else {
      return true;
    }
  }).forEach(function(l) {
    total += l.cards.length;
    content.append(createBlob(l));
  });

  $('#total').html("TOTAL CARDS: " + total);
}

var createBlob = function(blob) {
  var ignoreChecked;
  var doneChecked;
  var orderChecked;
  if (blob.ignore) ignoreChecked = " checked=\"true\"";
  if (blob.done) doneChecked = " checked=\"true\"";
  if (blob.order) orderChecked = " checked=\"true\"";
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

  if (blob.type === "board") {
    var filteredBoards = _.filter(preGist.boards, function(e) {
      return !(preGist.blackList.boards.includes(e.id));
    });
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
    if (blob.back.match(/http|www|\/\//)) {
      ret["background-image"] = "url(" + blob.back + ")";
    } else {
      ret["background-color"] = blob.back;
    }
    ret["font-size"] = rScale(10, 45, minLists, maxLists, blob.lists.length) + "px";

  } else if (blob.type === "list") {
    var raCard = "";
    var sampled = _.sample(blob.cards);
    (!sampled)? raCard = "EMPTY LIST": raCard = sampled.name;

    obj.attr("title", "CARDS: " + blob.cards.length + "\nRANDOM CARD: " + raCard);
    ret["font-size"] = rScale(10, 45, minCards, maxCards, blob.cards.length) + "px";
  }

  return obj.css(ret);;
}

redrawPage(preGist.state.obj);
