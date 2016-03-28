#TRELLOL

####A derpy little app for interfacing with Trello.

To use the app, grab your own api key from [trello.](https://developers.trello.com/authorize)

Place this api key into the api script link in `index.html` after `key=`

###FUTURE PLANS:
This app is pretty much useless for the moment, and the API is literally a nightmare, re-downloading everyting every time you click sync. This was just to get me started, however. Next, I plan on adding exclusion lists and some other features, and then calling this static page as a visual configurator for a command-line tool. You'll be able to grab trello tasks, and when done with them, quickly send them on thier way with a few terse command line inputs.

I also don't intend to leave the frontend style in such a sorry state. Tools like D3 will be added to show burndown pace, and to mix things up so that the information is presented in a more visually interesting way than: many tasks, bigger button.

So far it's been fun spamming trello with tons of requests, and getting an incredbly basic web app spinning with nothing more than jQuery, and good object interpretation.

Also todo: reduce the weight of the json object that builds the gui. Store the object in a file where the command line is `npm linked` to. Run the backend api in a node process that updates with sockets instead of big dumb nested api calls. I'll get there, or I'll move on to something better. It does already give me hard numbers about the number of trello cards, and once I add exclusions, that might make me happy enough. We'll see. No promises.
