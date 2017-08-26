const uVyper = require('uvyper');
const redis = require('redis');
const events = require('events');

class Adapter extends events {

    constructor() {
        super();
        this.sub = redis.createClient();
        this.pub = redis.createClient();
        console.log('Adapter created...');
    }

    async init(Observer,Server) {
        if(Observer instanceof uVyper.Controller === false) {
            throw new TypeError('Invalid Observer');
        }
        if(Server instanceof uVyper.Server === false) {
            throw new TypeError('Invalid Server');
        }
        console.log('Initialize Adapter...');
        this.serverID = Server.id;
        this.sub.subscribe('umsg');
        this.sub.on('message',function(channel,messageStr) {
            console.log('Echo socket message :');
            console.log(messageStr);
        });

        Observer.on('send',(dataStr) => {
            console.log('send triggered!');
            if('string' !== typeof(dataStr)) {
                dataStr = dataStr.toString();
            }
            this.pub.publish('umsg',dataStr);
        });

        return true;
    }

}

module.exports = Adapter;