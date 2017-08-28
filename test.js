const {Server,Message} = require('uvyper');
const Adapter = require('./index.js');

const WSServer = new Server({port: 3000});
WSServer.setAdapter(new Adapter());
WSServer.on('connection',function(socket) {
    console.log(`Socket ${socket.id} connected!`);
    try {
        new Message('test',{msg: 'hello world!'}).publish('socket-id');
    }
    catch(E) {
        console.error(E);
    }

    socket.on('close',function() {
        console.log(`Socket ${socket.id} disconnected!`);
    });
});

WSServer.on('error',function() {
    console.error('Failed to start uVyper server...');
});

console.log('Socket server started...');