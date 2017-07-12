# Seed
Original implementation by Bryant Chen (Github @bryantc99). Some updates made by Mateo Garcia (Github @mog96).

## Usage
- Game administrator loads the admin page: https://intense-sands-23697.herokuapp.com/admin.
- Users load the user landing page: https://intense-sands-23697.herokuapp.com/?mid=us1&aid=2.
  - 'mid' stands for MTurk ID.
  - 'aid' stands for assignment ID.
- Users enter their MTurk ID (which should be pre-filled) and click 'OK' to advance to a waiting screen.
- Game administrator starts a 'session'. She selects a type of session (US-US, India-India, US-India, India-US), specifies a number of users to be included in the session, and clicks 'OK'. A new session appears under the 'Sessions' header at the bottom of the page.
  - `// TODO: Combine US-India and India-US?`
  - `// TODO: Only show 'Sessions' header when at least one session has been started?`
- Users selected to join a session see a 'Proceed' button appear on their waiting screen, and click it to advance to the game instructions.
- Users read the instructions and click 'Continue' at the bottom of the page to enter the instructions quiz.
- Users are presented four consecutive screens, containing six questions in total. Users must get at least a score of 66% (four out of six questions correct) in order to proceed to the game.
  - Users who score below 66% exit the game and are taken to a 'Thank You' page.
- Users are then asked to complete a game tutorial. The tutorial is comprised of example screens form the game. Users play one example 'round' as a worker, and one example 'round' as an employer.
- When users have completed the tutorial, they are presented a waiting screen, which states that they are being matched with an opponent.
- On the admin page, the word 'READY' will appear next to the MTurk ID of users who have completed the game tutorial.
- When all users are marked 'READY', the game administrator can click 'Start Game' to begin a game.
  - `// TODO: Only show 'Start Game' button when all users are ready?`
- Once a user has been matched with an opponent selected at random from the group of users in the session, the user begins a round of the game as either an employer or a worker.
- Each user will play an equal number of rounds as a worker and as an employer. The number of rounds is determined by the number of users in the session.
- At the end of the game, users are presented a 'Thank You' screen, which states the amount they will be paid. Each user is paid for the points earned in one round as an employer and one round as a worker, each selected at random from the rounds played. This page directs users back to MTurk.
  - `// TODO: Implement 'direct back to MTurk'.`
  - `// TODO: Implement payment for two randomly selected rounds (one as employer, one as worker).`

## Server-side
### `webserver.py`
Houses the main backend infrastructure. It hosts three types of websocket connections. One for the session waiting room, one for the game waiting room, one for the game itself.

Of most importance to a **future developer** is the `on_message` function of the `GameConnection` class. At the bottom of this function is the code that stores the final information about a game round in the database.

#### `SessionConnection`
Simple class. Registers each person who loads the session waiting room page, decrements the count of people on the page each time a connection closes. Admin also creates this type of connection in order to send message to create a new session.

#### `WaitingRoomConnection`
Similar to SessionConnection, but also contains the matching algorithm and assigns game IDs to people. More details in the code comments.

#### `GameConnection`
Each connection has two clients, every message is bounced back to both with info on contract, effort level, etc. Pretty simple backend, more going on in Angular on the client side.

### `handlers.py`
Most HTML requests are resolved in handlers.py, except those that rely on websocket Connection variables — specifically AdminHandler for the admin screen. This module is pretty self explanatory. Contains some leftover handlers from UbiquityLab.


## Client-side
### `templates`
As in a typical Angular.js web app, this folder containts the HTML templates for all of the app's pages.

User flow, as specified under 'Usage' above:
`index.html` --> `session.html` --> `about.html` --> `quiz.html` --> `instructions.html` --> `tutorial.html` --> `instructions2.html` --> `tutorial2.html` --> `welcome.html` --> `game.html` --> `payment.html`

Descriptions of each template:
#### `about.html`
Contains game instructions.
#### `admin.html`
Admin page. Used by the game administrator to start a 'session', and then start a 'game' once the word 'READY' appears next to the MTurk ID of each user in a session.
#### `game.html`
Game page. Uses `ngView` to display subtemplates located in `static/game`.
#### `index.html`
User landing page. URL params include MTurk ID (required) and Assignment ID (currently optional).
#### `instructions.html`
Tutorial splash page for sample round as employer.
#### `instructions2.html`
Tutorial splash page for sample round as worker.
#### `payment.html`
Payment page. Last page seen by the user.
#### `quiz.html`
Quiz page. Uses `ngView` to display subtemplates located in `static/quiz`.
#### `session.html`
Initial waiting page seen by user. User waits here until they have been added to a session, at which point a 'Proceed' button appears.
#### `tutorial.html`
Template for tutorial as employer.
#### `tutorial2.html`
Template for tutorial as worker.
#### `welcome.html`
Template for 'waiting room' page, where a user waits to be matched with an opponent.
  - `// TODO: Rename to something like 'waiting-room.html'.`

### `main.js`
This module handles timer countdown and validating MTurk IDs. It is included in most static pages that are not the waiting room, quiz or game pages.

This module also contains the list of accepted MTurk IDs (temporary).

### `session.js`
Controller for the `session.html` template. This module begins the initial socket communication with the server, sending the MTurk ID along with code `ENTRY_MSG` in its initial message.

Shows 'Proceed' button when `ACTIVATE_MSG` is received, which takes place once a new session is created from the Admin page. It also contains a utility function `getUrlVars()`, which is used to pull parameters from a URL string.

### `waiting-room.js`
See session.js — nearly identical. This module controls the waiting room page (`welcome.html` template).
  - `// TODO: Unify with session.js.`

### `quiz.js`
Controls quiz. Fairly straightforward -- code should be easy to read and understand.

### `tutorial.js` and `tutorial2.js`
Control the tutorial. Mostly copied from `game.js` with minor changes.
  - `// TODO: Combine into a single file. May even be combined into game.js.`

### `game.js`
A lot going on here. Opens a `GameConnection` websocket (see `webserver.py`).

Most data is saved in `dataModel` service object rather than a `$scope` object as it persists through the loading of a new page.

General data flow:
-	Client submits a decision.
-	Function `$scope.game.sendEffortLevel()` (or `sendContract()`, `sendAccept()`, etc.) sends decision to server via websockets.
-	Server bounces the message back to both connected clients.
-	Message is processed on the client side in `conn.onmessage()`, which, in combination with `$scope.game.nextPage()`, handles the game logic. In their current state, these functions awkwardly split the responsibility of processing the selections by employer and worker. (`// TODO: Unify.`)
- New page is loaded on the client side.

The logic for computing the final wages earned by the employer and the worker, as well as the payment (in dollars) that each would earn given these wages, is currently in `$scope.game.nextPage()`. A **future developer** should look here to begin implementing payment integration with the MTurk platform.

As noted above, the `on_message` function of the `GameConnection` class in [`webserver.py`](https://github.com/mog96/seed/tree/mog-payment-structure#webserverpy) contains the code that stores the final information about a game round in the database. It currently takes all of the parameters sent from `$scope.game.nextPage()` in this `game.js` module and puts them directly in the database. A **future developer** should look here to begin modifying what is stored in the DB.