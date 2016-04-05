#TRELLOL

####A derpy little app for interfacing with Trello.

To use the app, grab your own api key from [trello.](https://developers.trello.com/authorize)

Place this api key into the api script link in `index.html` after `key=`

###TODO
* Refactor `front.js` into a cleaner collection of js files
* Fix the error that appends tons of boards when fetching your Trello data
* Only allow one list per board to be the `Done` list
* Style lists to board page background
* Decide on DB use, or just JSON file store
* Store localhost information to JSON file/DB
* Add burndown screen
* Add weekly information screen
* Add websockets for grabbing from Trello
* Reduce `pregist.state.obj` weight to improve page load
* Store large assets in hidden objects to improve page load
* FUN THINGS WITH VISUALS
* Stateful style

###TODO NEXT:
* Package.json
* Mirror gui commands to cli commands
* Add command for launching configurator
* Decide on electron use
* Add card-movement commands to cli
* Add CLI visuals

[See it in action!](http://trellol.bitballoon.com)
