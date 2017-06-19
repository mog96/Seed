# Seed
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
This folder holds the HTML templates for all pages besides the quiz and game pages, which are in their own folders. Most use Angular controllers which will be described below.

### main.js
This module controls most static pages that are not the waiting room, quiz or game pages. Main functions concern timer countdown and validating MTurk IDs.

### session.js
Pulls parameters from URL. Opens a websocket connection. Sends parameter data in initial message. Manipulates DOM to show Proceed button when activate message is received. Similar to waiting-room.js.

### quiz.js
Controls quiz. Very self explanatory. More details in the code comments.

### tutorial.js and tutorial2.js
Control the tutorial. Currently pretty messy, as they are mostly copied from game.js with minor changes. Can probably be combined into a single file. May even be combined into game.js perhaps.

### waiting-room.js
See session.js — nearly identical.

### game.js
A lot going on here. Opens a GameConnection WebSocket. Most data saved in dataModel rather than $scope as it persists through the loading of a new page. General data flow:
-	Client submits a decision
-	Function “sendEffortLevel” (or sendContract, sendAccept, etc) sends decision to server
-	Message bounces back to both parties in connection
-	Processing of message occurs in `conn.onmessage` and `$scope.nextPage` with different behavior depending on the stage of the game.
-	New page is loaded.
