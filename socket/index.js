let playerTwosQueue = [];
let counterTwoPlayers = 0;
let roomTwoPlayers = '[2]Game-'+counterTwoPlayers;

let playerThreeQueue = [];
let counterThreePlayers = 0;
let roomThreePlayers = '[3]Game-'+counterThreePlayers;

let playerFourQueue = [];
let counterFourPlayers = 0;
let roomFourPlayers = '[4]Game-'+counterFourPlayers;



module.exports = (io) => {
    const rooms = io.of("/game").adapter.rooms;
    const sids = io.of("/game").adapter.sids;
    // let room = 'game-'+counter

    io.on('connection', socket => {
        console.log('new connection', socket.id);
        socket.emit('userID', socket.id)
        
        //Online check
        socket.emit('online', true)

		socket.on('disconnect', () => {
            let indexFourPlayer = playerFourQueue.findIndex(x => x.sid === socket.id);
            let indexThreePlayer = playerThreeQueue.findIndex(x => x.sid === socket.id);
            let indexTwoPlayer = playerTwosQueue.findIndex(x => x.sid === socket.id);
            
            //If user found in participantsFourGame
            if(indexFourPlayer !== -1){
                playerFourQueue.splice(indexFourPlayer, 1);
                io.emit('disconnectedInQueueFour', playerFourQueue.length)
            }
            //If user found in participantsThreeGame
            if(indexThreePlayer !== -1){
                playerThreeQueue.splice(indexThreePlayer, 1);
                io.emit('disconnectedInQueueThree', playerThreeQueue.length);
            }
            //If user found in participantsTwosGame
            if(indexTwoPlayer !== -1){
                playerThreeQueue.splice(indexTwoPlayer, 1);
                io.emit('disconnectedInQueueThree', playerThreeQueue.length);
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

        socket.on('checkOnline', x => {
            socket.emit('online', true)
        })

        socket.on('triggerQueue', x => {
            emitQueueNumbers();
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

        function emitQueueNumbers() {
            io.emit('queueNumbers', {qTwo: playerTwosQueue.length, qThree: playerThreeQueue.length, qFour: playerFourQueue.length})
        }

        function joinRoom(numOfPlayers, queueArray, name, socket, room, counter){
            if(queueArray.length <= numOfPlayers){
                queueArray.push({name: name, sid: socket.id});
                emitQueueNumbers();
                socket.join(room);
                console.log(socket.id, 'has joined', room);
                io.to(room).emit('amtOfPlayers', queueArray.length)
                socket.emit('roomName', room);
                
                if(queueArray.length === numOfPlayers){
                    io.to(room).emit('fullGame', true);
                    io.to(room).emit('players', queueArray);
                    console.log(room, 'has started.')
                    room = '['+counter+']Game-'+(counter++);
                    queueArray.length = 0;
                    emitQueueNumbers();
                }
            }
        }
	})
}