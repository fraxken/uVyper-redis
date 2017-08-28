// Require npm & node packages
const uVyper = require('uvyper');
const redis = require('redis');
const events = require('events');
const { red, yellow, cyan, magenta , green } = require('chalk');

/*
 * @interface IAdapterConstructor
 */
const IAdapterConstructor = {
    redisPort: 6379
};

/*
 * @class Adapter 
 * @extend events 
 * 
 * @property {redis.Client} sub
 * @property {redis.Client} pub
 */
class Adapter extends events {

    /*
     * @constructor
     */
    constructor(IOptions = {}) {
        super();
        IOptions = Object.assign(IAdapterConstructor,IOptions);
        this.sub = redis.createClient();
        this.pub = redis.createClient();
    }

    /*
     * @function Adapter.init 
     * @param {uVyper.Server} Server
     * @return Promise<void 0>
     */
    async init(Server,Events) {
        if(Server instanceof uVyper.Server === false) {
            throw new TypeError('Server should by typeof uVyper.Server');
        }

        console.log('Initialize Adapter for server id => '+yellow.bold(Server.id));

        // Subscribe to message channel
        this.sub.subscribe('message');

        /*
         * Subscribe to new message!
         */
        this.sub.on('message',function(channel,messageStr) {
            if(channel !== 'message') return;
            console.log('------------------');
            console.log('Subscriber message triggered on Server => '+yellow.bold(Server.id));

            try {
                var { serverId, event, data, source, source_id } = JSON.parse(messageStr);
                if(serverId === Server.id) {
                    console.log(magenta.bold('Server id is the same... Skip message!'));
                    return;
                }
            }
            catch(E) {
                console.log(red.bold('Failed to parse message...'));
                console.error(E);
                return;
            }

            console.log(`eventName: ${cyan.bold(event)}`);
            console.log(`source: ${green.bold(source)}`);
            console.log(`source_id: ${green.bold(source_id)}`);

            // Switch en source value
            switch(source) {
                case 'Socket':
                    console.log('Socket source matched!');
                    if(Server.sockets.has(source_id) === true) {
                        new uVyper.Message(event,data).off().publish(Server.sockets.get(source_id));
                    }
                break;
                case 'Server': 
                    new uVyper.Message(event,data).off().publish(Server);
                break;
                case 'Room': 
                    console.log('Room source matched!');
                    if(Events.rooms.has(source_id) === true) {
                        new uVyper.Message(event,data).off().publish(Events.rooms.get(source_id));
                    }
                break;
                default:
                    console.log('Unknow source...');
                break;
            }
        });

        /* 
         * Catch all messages triggered by the WebSocket server!
         */
        Events.on('message',({event,data,source,source_id}) => {
            console.log('------------------');
            console.log('Events message triggered on Server => '+yellow.bold(Server.id));

            if('undefined' === typeof(source_id)) {
                source_id = Server.id;
            }
            console.log(`eventName: ${cyan.bold(event)}`);
            console.log(`source: ${green.bold(source)}`);
            console.log(`source_id: ${green.bold(source_id)}`);

            try {
                this.pub.publish('message',JSON.stringify({
                    serverId: Server.id,
                    event,
                    data,
                    source,
                    source_id 
                }));
            }
            catch(E) {
                this.emit('error',E);
            }
        });
    }

}

// Export Adapter class as default!
module.exports = Adapter;