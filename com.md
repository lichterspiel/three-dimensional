# FE

# BE

# userID for guest
either generate in client and save and send every request or use the flask session

# Communication Websockets

## Initgame
1. FE -> BE
2. FE Creates game in the lobby when pressing create
3. FE emits __player-Join__ : DATA  {userID, gameID} , set the userID already when joining the page
4. BE emits __player-Joined__ : DATA{}
--6. FE emits __pls-init__: DATA{}
6. After everyone joined BE emits init
7. BE emits either __load-game__ or __init-game__: DATA{}
8. FE loads board and playing can begin

## Gameplay
1. FE emits __player-move__: DATA{}
2. BE emits if successfull __move-confirmed__: DATA{}
3. BE could also emit __game-over__ if one player won: DATA {}
