const {Server,Message} = require('uvyper');
const Adapter = require('./index.js');
const chalk = require('chalk');

const WSServer = new Server({port: 3000});
WSServer.setAdapter(new Adapter());
WSServer.on('connection',function(socket) {
    console.log(`Socket ${chalk.green.bold(socket.id)} connected on Server ${chalk.magenta.bold(WSServer.id)}!`);
    try {
        console.log(`${WSServer.id}:: broadcast test event!`);
        new Message('test',{msg: 'hello world!'}).publish(WSServer);
    }
    catch(E) {
        console.error(E);
    }

    socket.on('close',function() {
        console.log(`Socket ${socket.id} disconnected!`);
    });
});