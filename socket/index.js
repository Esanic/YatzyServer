let participantsTwosGame = [];
let counterTwoPlayer = 0;
let roomTwoPlayer = '[2]Game-'+counterTwoPlayer;

let participantsThreeGame = [];
let counterThreePlayer = 0;
let roomThreePlayer = '[3]Game-'+counterThreePlayer;

let participantsFourGame = [];
let counterFourPlayer = 0;
let roomFourPlayer = '[4]Game-'+counterFourPlayer;



module.exports = (io) => {
    const rooms = io.of("/game").adapter.rooms;
    const sids = io.of("/game").adapter.sids;
    // let room = 'game-'+counter

    io.on('connection', socket => {
        console.log('new connection', socket.id);
        socket.emit('userID', socket.id)

		socket.on('disconnect', () => {
            let index = participantsFourGame.findIndex(x => x.sid == socket.id);
            
            //If user found in participantsFourGame
            if(index !== -1){
                participantsFourGame.splice(index, 1);
                io.emit('disconnectedInQueueFour', participantsFourGame.length)
            }
            
            //If user not found in participantsFourGame
            if(index === -1){
                index = participantsThreeGame.findIndex(x => x.sid === socket.id)

                //If user found in participantsThreeGame
                if(index !== -1){
                    participantsThreeGame.splice(index, 1);
                    io.emit('disconnectedInQueueThree', participantsThreeGame.length);
                }
                
                //If user not found in participantsThreeGame
                if(index === -1){
                    index = participantsTwosGame.findIndex(x => x.sid === socket.id);
                    
                    //If user found in participantsTwosGame
                    if(index !== -1){
                        participantsTwosGame.splice(index, 1);
                        io.emit('disconnectedInQueueTwos', participantsTwosGame.length)
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
                if(participantsTwosGame.length <= 2){
                    participantsTwosGame.push({name: name, sid: socket.id});
                    socket.join(roomTwoPlayer);
                    console.log(socket.id, 'has joined', roomTwoPlayer)
                    io.to(roomTwoPlayer).emit('amtOfPlayers', participantsTwosGame.length)
                    socket.emit('roomName', roomTwoPlayer);
                    
                    if(participantsTwosGame.length === 2){
                        io.to(roomTwoPlayer).emit('fullGame', true);
                        io.to(roomTwoPlayer).emit('players', participantsTwosGame);
                        console.log(roomTwoPlayer, 'has started.')
                    }
                }
                if(participantsTwosGame.length > 2){
                    roomTwoPlayer = '[2]Game-'+(counterTwoPlayer++);
                    participantsTwosGame = []
                    socket.join(roomTwoPlayer);
                    console.log(socket.id, 'has joined', roomTwoPlayer)
                    participantsTwosGame.push({name: name, sid: socket.id});
                }
            }

            //If user wants to join a three-player room
            if(maxPlayers === 3){
                if(participantsThreeGame.length <= 3){
                    participantsThreeGame.push({name: name, sid: socket.id});
                    socket.join(roomThreePlayer);
                    console.log(socket.id, 'has joined', roomThreePlayer)
                    io.to(roomThreePlayer).emit('amtOfPlayers', participantsThreeGame.length)
                    socket.emit('roomName', roomThreePlayer);
                    
                    if(participantsThreeGame.length === 3){
                        io.to(roomThreePlayer).emit('fullGame', true);
                        io.to(roomThreePlayer).emit('players', participantsThreeGame);
                        console.log(roomThreePlayer, 'has started.')
                    }
                }
                if(participantsThreeGame.length > 3){
                    roomThreePlayer = '[3]Game-'+(counterThreePlayer++);
                    participantsThreeGame = []
                    socket.join(roomThreePlayer);
                    participantsThreeGame.push({name: name, sid: socket.id});
                }
            }

            //If user wants to join a four-player room
            if(maxPlayers === 4){
                if(participantsFourGame.length <= 4){
                    participantsFourGame.push({name: name, sid: socket.id});
                    socket.join(roomFourPlayer);
                    console.log(socket.id, 'has joined', roomFourPlayer)
                    io.to(roomFourPlayer).emit('amtOfPlayers', participantsFourGame.length)
                    socket.emit('roomName', roomFourPlayer);
                    
                    if(participantsFourGame.length == 4){
                        io.to(roomFourPlayer).emit('fullGame', true);
                        io.to(roomFourPlayer).emit('players', participantsFourGame);
                        console.log(roomFourPlayer, 'has started.')
                    }
                }
                if(participantsFourGame.length > 4){
                    roomFourPlayer = '[4]Game-'+(counterFourPlayer++);
                    participantsFourGame = []
                    socket.join(room);
                    participantsFourGame.push({name: name, sid: socket.id});
                }
            }
        })
        
        //Dice Hit
        socket.on('diceHit', (dice, room) => {
            io.to(room).emit('getDice', dice);
        })

        //Dice Movement
        socket.on('diceMove', (objWithDiceArrays, room) => {
            io.to(room).emit('getDiceMovement', objWithDiceArrays);
        })

        //Next player
        socket.on('nextPlayer',(scoreRowName, dice, room) => {
            socket.broadcast.to(room).emit('getNextPlayer', {scoreRowName, dice})
        })
	})

}