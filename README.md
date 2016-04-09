#TRELLOL

####A derpy little app for interfacing with Trello.

To use the app, grab your own api key from [trello.](https://developers.trello.com/authorize)

Place this api key into the api script link in `index.html` after `key=`

###TODO
* Refactor `front.js` into a cleaner collection of js files
* Promiseify API get-all
* Decide on DB use, or just JSON file store
* Store localhost information to JSON file/DB
* Add burndown screen
* Add weekly information screen
* Add websockets for grabbing from Trello
* FUN THINGS WITH VISUALS
* Fully stateful style

###TODO NEXT:
* Package.json
* Mirror gui commands to cli commands
* Add command for launching configurator
* Decide on electron use
* Add card-movement commands to cli
* Add CLI visuals
* Import MD doc of headers/lists into board/list/cards

###BUGS
* Fix the impromptu ugliness in the patch for empty boards and lists

[See it in action!](http://trellol.bitballoon.com)
