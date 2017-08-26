const {Server,Message} = require('uvyper');
const Adapter = require('./index.js');

const WSServer = new Server({port: 3000});
WSServer.setAdapter(new Adapter());
WSServer.on('connection',function(socket) {
    console.log(`Socket ${socket.id} connected!`);
    new Message('test',{msg: 'hello world!'})
        .publish(socket)
        .catch( E => console.error(E) );
});

WSServer.on('error',function() {
    console.error('Failed to start uVyper server...');
});

console.log('Socket server started...');