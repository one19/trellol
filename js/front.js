var maxCards = 0;
var minCards = 0;

var rScale = function (minWanted, maxWanted, minVal, maxVal, val) {
  var bSizeDel = maxWanted - minWanted;
  var valDel = maxVal - minVal;

  return Math.round(((bSizeDel) * ((val - minVal)/valDel)) + minWanted);
}

$("body").on("click", "h2.button", function(e) {
  console.log('e', e);
  switch (e.currentTarget.id) {
    case "getGist":
      Trello.get('/member/me/boards', getBoards, error);
      break;
    case "boards":
      boardsPage();
      break;
    default:
      var board = _.find(preGist.boards, {id: e.currentTarget.id})
      if (board) listsPage(board);
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
    
    if (classes.match(/ignore/gi)) {
      if (!(preGist.blackList.boards.includes(targetID))) {
        preGist.blackList.boards.push(targetID);
      } else {
        _.pull(preGist.blackList.boards, targetID);
      }
    } else if (classes.match(/done/gi)) {
      console.log("Congrats, you're a retard.");
    } else if (classes.math(/order/gi)) {
      var ord = _.find(preGist.boards, {id: targetID}).order;
      (ord)? ord = false: ord = true;
    }

    setGist(preGist);
    boardsPage();

  } else if (classes.match(/list/gi)) {
    if (classes.match(/ignore/gi)) {

    } else if (classes.match(/done/gi)) {

    } else if (classes.math(/order/gi)) {

    }
  }

});

var killPage = function() {
  $('#content').html("");
}

var boardsPage = function() {
  killPage();
  var total = 0;

  var content = $("#content");
  if (preGist.boards.length == 0) return error("No Boards; Click reload data!");
  _.filter(preGist.boards, function(e) {
    return !(preGist.blackList.boards.includes(e.id));
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
  board.lists.forEach(function(l) {
    total += l.cards.length;
    content.append(createBlob(l));
  });

  $('#total').html("TOTAL CARDS: " + total);
}

var createBlob = function(blob) {
  var ret = $("<div class=\"" + blob.type + " button " + blob.id + "\">"
    + "<h2 class=\"main " + blob.type + " button\" id=\"" + blob.id + "\">"
    + blob.name + "</h2>"
      + "<div class=\"checkbox ignore " + blob.type + " " + blob.id + "\">"
        + "<p class=\"checkbox ignore " + blob.type + " " + blob.id + "\">"
        + "Ignore:</p>"
        + "<input type=\"checkbox\" class=\"checkbox ignore " + blob.type + " "
        + blob.id + "\"></input>"
      + "</div>"
      + "<div class=\"checkbox done " + blob.type + " " + blob.id + "\">"
        + "<p class=\"checkbox done " + blob.type + " " + blob.id + "\">"
        + "Done:</p>"
        + "<input type=\"checkbox\" class=\"checkbox done " + blob.type + " "
        + blob.id + "\"></input>"
      + "</div>"
      + "<div class=\"checkbox order " + blob.type + " " + blob.id + "\">"
        + "<p class=\"checkbox order " + blob.type + " " + blob.id + "\">"
        + "Ordered:</p>"
        + "<input type=\"checkbox\" class=\"checkbox order " + blob.type + " "
        + blob.id + "\"></input>"
      + "</div>"
    + "</div>");
  return styleBlob(blob, ret);
}

var styleBlob = function(blob, obj) {
  var ret = {};

  if (blob.type === "board") {
    var maxLists = _.maxBy(preGist.boards, 'lists').lists.length;
    var minLists = _.minBy(preGist.boards, 'lists').lists.length;
    var raCard = "";
    var sampled = _.sample(_.sample(blob.lists).cards);
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

boardsPage();
