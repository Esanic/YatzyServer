let playerTwosQueue = [];
let counterTwoPlayers = {counter:0};
let roomTwoPlayers = {room:'[2]Game-'+counterTwoPlayers.counter};

let playerThreeQueue = [];
let counterThreePlayers = {counter:0};
let roomThreePlayers = {room:'[3]Game-'+counterThreePlayers.counter};

let playerFourQueue = [];
let counterFourPlayers = {counter:0};
let roomFourPlayers = {room:'[4]Game-'+counterFourPlayers.counter};



module.exports = (io) => {
    io.on('connection', socket => {
        socket.emit('userID', socket.id)
        
        //Online check
        socket.emit('online', true)

		socket.on('disconnect', (reason) => {
            let indexFourPlayer = playerFourQueue.findIndex(x => x.sid === socket.id);
            let indexThreePlayer = playerThreeQueue.findIndex(x => x.sid === socket.id);
            let indexTwoPlayer = playerTwosQueue.findIndex(x => x.sid === socket.id);
            
            //If user found in participantsFourGame
            if(indexFourPlayer !== -1){
                playerFourQueue.splice(indexFourPlayer, 1);
                emitQueueNumbers();
                io.emit('disconnectedInQueueFour', playerFourQueue.length)
            }
            //If user found in participantsThreeGame
            if(indexThreePlayer !== -1){
                playerThreeQueue.splice(indexThreePlayer, 1);
                emitQueueNumbers();
                io.emit('disconnectedInQueueThree', playerThreeQueue.length);
            }
            //If user found in participantsTwosGame
            if(indexTwoPlayer !== -1){
                playerTwosQueue.splice(indexTwoPlayer, 1);
                emitQueueNumbers();
                io.emit('disconnectedInQueueThree', playerTwosQueue.length);
            }
            
            io.emit('disconnected', socket.id);
            
            console.log(socket.id, ' disconnected');
        });
        
        //Join Room
        socket.on('joinRoom', (name, maxPlayers) => {
            if(maxPlayers === 2){
                joinRoom(2, playerTwosQueue, name, socket, roomTwoPlayers, counterTwoPlayers);
            }
            if(maxPlayers === 3){
                joinRoom(3, playerThreeQueue, name, socket, roomThreePlayers, counterThreePlayers);
            }
            if(maxPlayers === 4){
                joinRoom(4, playerFourQueue, name, socket, roomFourPlayers, counterFourPlayers);
            }
        })
        
        //Dice Hit
        socket.on('diceHit', (dice, room) => {
            socket.broadcast.to(room).emit('getDice', dice);
        })

        //Dice Movement
        socket.on('diceMove', (objWithDiceArrays, room) => {
            socket.broadcast.to(room).emit('getDiceMovement', objWithDiceArrays);
        })

        //Next player
        socket.on('nextPlayer',(scoreRowName, dice, room) => {
            socket.broadcast.to(room).emit('getNextPlayer', {scoreRowName, dice})
        })

        //Once game is done, disconnect all clients from room.
        socket.on('gameDone', (room) => {
            io.in(room).socketsLeave(room);
            console.log(`Game ${room} is done. Disconnecting clients...`)
        })

        //Responds in order to set the current online status
        socket.on('checkOnline', x => {
            socket.emit('online', true)
        })

        //In order to display queue numbers
        socket.on('triggerQueue', x => {
            emitQueueNumbers();
        })

        function emitQueueNumbers() {
            io.emit('queueNumbers', {qTwo: playerTwosQueue.length, qThree: playerThreeQueue.length, qFour: playerFourQueue.length})
        }

        function joinRoom(numOfPlayers, queueArray, name, socket, room, counter){
            if(queueArray.length <= numOfPlayers){
                queueArray.push({name: name, sid: socket.id});
                emitQueueNumbers();
                socket.join(room.room);
                console.log(socket.id, 'has joined', room.room);
                io.to(room.room).emit('amtOfPlayers', queueArray.length)
                socket.emit('roomName', room.room);
                
                if(queueArray.length === numOfPlayers){
                    io.to(room.room).emit('fullGame', true);
                    io.to(room.room).emit('players', queueArray);
                    console.log(room.room, 'has started.')
                    room.room = '['+numOfPlayers+']Game-'+(counter.counter += 1);
                    queueArray.length = 0;
                    emitQueueNumbers();
                }
            }
        }
	})
}