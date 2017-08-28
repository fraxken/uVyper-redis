// Require npm & node packages
const uVyper = require('uvyper');
const redis = require('redis');
const events = require('events');

/*
 * @interface IAdapterConstructor
 */
const IAdapterConstructor = {
    redisPort: 67188
};

/*
 * @class Adapter 
 * @extend events 
 * 
 * @property {redis.Client} sub
 * @property {redis.Client} pub
 * @property {String} serverId;
 */
class Adapter extends events {

    /*
     * @constructor
     */
    constructor(IOptions = {}) {
        super();
        IOptions = Object.assign(IOptions,{},IAdapterConstructor);
        console.log(IOptions);
        this.sub = redis.createClient();
        this.pub = redis.createClient();
        console.log('Adapter created...');
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

        console.log('Initialize Adapter for server id => '+Server.id);
        this.serverId = Server.id;

        // Subscribe to message channel
        this.sub.subscribe('message');

        /*
         * Subscribe to new message!
         */
        this.sub.on('message',function(channel,messageStr) {
            if(channel !== 'message') return;
            console.log('Subscriber message triggered');
            try {
                var { serverId, event, data, source } = JSON.parse(messageStr);
            }
            catch(E) {
                console.log('Failed to parse message...');
                console.error(E);
                return;
            }
            console.log(serverId);
            console.log(event);
            console.log(data);
            console.log(source);
        });

        /* 
         * Catch all messages triggered by the WebSocket server!
         */
        Events.on('message',({event,data,source}) => {
            console.log('message triggered!');

            // Convert source if needed...
            if(source instanceof uVyper.Server === true) {
                source = 'Server';
            }
            else if(source instanceof uVyper.Room === true) {
                source = 'Room';
            }
            console.log(event,source);

            try {
                this.pub.publish('message',JSON.stringify({
                    serverId: this.serverId,
                    event,
                    data,
                    source 
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