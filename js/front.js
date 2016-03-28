var maxLists = _.maxBy(preGist.boards, 'lists').lists.length;
var minLists = _.minBy(preGist.boards, 'lists').lists.length;
var maxCards = 0;
var minCards = 0;

var rScale = function (minWanted, maxWanted, minVal, maxVal, val) {
  var bSizeDel = maxWanted - minWanted;
  var valDel = maxVal - minVal;

  return Math.round(((bSizeDel) * ((val - minVal)/valDel)) + minWanted);
}

$("body").on("click", "div.button", function(e) {
  console.log(e.currentTarget.id);
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

var killPage = function() {
  $('#content').html("");
}

var boardsPage = function() {
  killPage();
  var total = 0;

  var content = $("#content");
  preGist.boards.forEach(function(b) {
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
  content.append($("<div class=\"button\" id=\"boards\">BACK</div>"));
  board.lists.forEach(function(l) {
    total += l.cards.length;
    content.append(createBlob(l));
  });

  $('#total').html("TOTAL CARDS: " + total);
}

var createBlob = function(blob) {
  var ret = $("<div class=\"" + blob.type + " button\" id=\"" + blob.id + "\">" + blob.name + "</div>");
  return styleBlob(blob, ret);
}

var styleBlob = function(blob, obj) {
  var ret = {};

  if (blob.type === "board") {
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