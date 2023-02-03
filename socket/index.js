let playerTwosGame = [];
let counterTwoPlayer = 0;
let roomTwoPlayer = '[2]Game-'+counterTwoPlayer;

let playerThreeGame = [];
let counterThreePlayer = 0;
let roomThreePlayer = '[3]Game-'+counterThreePlayer;

let playerFourGame = [];
let counterFourPlayer = 0;
let roomFourPlayer = '[4]Game-'+counterFourPlayer;



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
            let index = playerFourGame.findIndex(x => x.sid == socket.id);
            
            //If user found in participantsFourGame
            if(index !== -1){
                playerFourGame.splice(index, 1);
                io.emit('disconnectedInQueueFour', playerFourGame.length)
            }
            
            //If user not found in participantsFourGame
            if(index === -1){
                index = playerThreeGame.findIndex(x => x.sid === socket.id)

                //If user found in participantsThreeGame
                if(index !== -1){
                    playerThreeGame.splice(index, 1);
                    io.emit('disconnectedInQueueThree', playerThreeGame.length);
                }
                
                //If user not found in participantsThreeGame
                if(index === -1){
                    index = playerTwosGame.findIndex(x => x.sid === socket.id);
                    
                    //If user found in participantsTwosGame
                    if(index !== -1){
                        playerTwosGame.splice(index, 1);
                        io.emit('disconnectedInQueueTwos', playerTwosGame.length)
                    }
                }
            }
            
            io.emit('disconnected', socket.id);
            
            console.log(socket.id, ' disconnected');
        });
        
        //Join Room
        socket.on('joinRoom', (name, maxPlayers) => {
            
            //If user wants to join a two-player room
            if(maxPlayers === 2){
                if(playerTwosGame.length <= 2){
                    playerTwosGame.push({name: name, sid: socket.id});
                    socket.join(roomTwoPlayer);
                    console.log(socket.id, 'has joined', roomTwoPlayer)
                    io.to(roomTwoPlayer).emit('amtOfPlayers', playerTwosGame.length)
                    socket.emit('roomName', roomTwoPlayer);
                    
                    if(playerTwosGame.length === 2){
                        io.to(roomTwoPlayer).emit('fullGame', true);
                        io.to(roomTwoPlayer).emit('players', playerTwosGame);
                        console.log(roomTwoPlayer, 'has started.')
                    }
                }
                if(playerTwosGame.length > 2){
                    roomTwoPlayer = '[2]Game-'+(counterTwoPlayer++);
                    playerTwosGame = []
                    socket.join(roomTwoPlayer);
                    console.log(socket.id, 'has joined', roomTwoPlayer)
                    playerTwosGame.push({name: name, sid: socket.id});
                }
            }

            //If user wants to join a three-player room
            if(maxPlayers === 3){
                if(playerThreeGame.length <= 3){
                    playerThreeGame.push({name: name, sid: socket.id});
                    socket.join(roomThreePlayer);
                    console.log(socket.id, 'has joined', roomThreePlayer)
                    io.to(roomThreePlayer).emit('amtOfPlayers', playerThreeGame.length)
                    socket.emit('roomName', roomThreePlayer);
                    
                    if(playerThreeGame.length === 3){
                        io.to(roomThreePlayer).emit('fullGame', true);
                        io.to(roomThreePlayer).emit('players', playerThreeGame);
                        console.log(roomThreePlayer, 'has started.')
                    }
                }
                if(playerThreeGame.length > 3){
                    roomThreePlayer = '[3]Game-'+(counterThreePlayer++);
                    playerThreeGame = []
                    socket.join(roomThreePlayer);
                    playerThreeGame.push({name: name, sid: socket.id});
                }
            }

            //If user wants to join a four-player room
            if(maxPlayers === 4){
                if(playerFourGame.length <= 4){
                    playerFourGame.push({name: name, sid: socket.id});
                    socket.join(roomFourPlayer);
                    console.log(socket.id, 'has joined', roomFourPlayer)
                    io.to(roomFourPlayer).emit('amtOfPlayers', playerFourGame.length)
                    socket.emit('roomName', roomFourPlayer);
                    
                    if(playerFourGame.length == 4){
                        io.to(roomFourPlayer).emit('fullGame', true);
                        io.to(roomFourPlayer).emit('players', playerFourGame);
                        console.log(roomFourPlayer, 'has started.')
                    }
                }
                if(playerFourGame.length > 4){
                    roomFourPlayer = '[4]Game-'+(counterFourPlayer++);
                    playerFourGame = []
                    socket.join(room);
                    playerFourGame.push({name: name, sid: socket.id});
                }
            }
        })
        socket.on('checkOnline', x => {
            socket.emit('online', true)
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
	})

}