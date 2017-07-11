# Seed
Original implementation by Bryant Chen (Github @bryantc99). Some updates made by Mateo Garcia (Github @mog96).

## Server-side
### webserver.py:
Webserver.py houses the main backend infrastructure. It hosts three types of WebSocket connections. One for the session waiting room, one for the game waiting room, one for the game itself.

#### SessionConnection:
Simple class. Registers each person who loads the session waiting room page, decrements the count of people on the page each time a connection closes. Admin also creates this type of connection in order to send message to create a new session.

#### WaitingRoomConnection:
Similar to SessionConnection, but also contains the matching algorithm and assigns game IDs to people. More details in the code comments.

#### GameConnection:
Each connection has two clients, every message is bounced back to both with info on contract, effort level, etc. Pretty simple backend, more going on in Angular on the client side.

### handlers.py
Most HTML requests are resolved in handlers.py, except those that rely on Websocket Connection variables — specifically AdminHandler for the admin screen. This module is pretty self explanatory. Contains some leftover handlers from UbiquityLab.


## Client-side
### templates
As in a typical Angular.js web app, this folder containts the HTML templates for all of the app's pages. The Quiz and Game pages make use of `ngView` to display the subtemplates located in the static/quiz and static/game folders, respectively.

### main.js
The module handles timer countdown and validating MTurk IDs. It is included in most static pages that are not the waiting room, quiz or game pages.

### session.js
This module begins the initial socket communication with the server. It opens a websocket connection to the server when a user enters their MTurk ID on the first page. Sends MTurk ID along with code `ENTRY_MSG` in initial message.

Shows 'Proceed' button when `ACTIVATE_MSG` is received, which takes place once a new session is created from the Admin page. It also contains a utility fuunction `getUrlVars()`, which is used to pull parameters from a URL string.

### waiting-room.js
See session.js — nearly identical.
  - TODO: Unify with session.js.

### quiz.js
Controls quiz. Very self explanatory. More details in the code comments.

### tutorial.js and tutorial2.js
Control the tutorial. Currently pretty messy, as they are mostly copied from game.js with minor changes. Can probably be combined into a single file. May even be combined into game.js perhaps.

### game.js
A lot going on here. Opens a GameConnection WebSocket. Most data saved in dataModel rather than $scope as it persists through the loading of a new page.

General data flow:
-	Client submits a decision.
-	Function “sendEffortLevel” (or sendContract, sendAccept, etc) sends decision to server.
-	Message bounces back to both parties in connection.
-	Message is processed in `conn.onmessage()`, which works with `$scope.nextPage()` to determine game logic, based on selections by employer and worker.
  - TODO: Unify.
- New page is loaded.