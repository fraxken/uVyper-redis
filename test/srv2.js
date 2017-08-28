const {Server} = require('uvyper');
const Adapter = require('./index.js');

const WSServer2 = new Server({port: 4000});
WSServer2.setAdapter(new Adapter());
WSServer2.on('connection',function(socket) {
    console.log(`Socket ${socket.id} connected on Server ${WSServer2.id}!`);
    socket.on('close',function() {
        console.log(`Socket ${socket.id} disconnected!`);
    });
});