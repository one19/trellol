$(".button").on("click", function(e) {
  if (e.currentTarget.id === "getGist") {
    Trello.get('/member/me/boards', getGist, error);
  }
});

var killPage = function(){
  
}