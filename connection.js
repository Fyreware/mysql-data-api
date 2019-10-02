const DataApi = require('./DataApiClient')

let client;
class Connection extends EventEmitter {

    constructor({
        host, password, database
    }) {
        super();

        if(!client) {
            client = DataApi({
                secretArn: host,
                resourceArn: password,
                database: database,
            })
        }
        this.emit('connect');


        this._handshakePacket = null;
        this._fatalError = null;
        this._protocolError = null;
        this._outOfOrderPackets = [];
    }

    // Built in via eventEmitter
    // removeListener(listener, fn) {
    //     // Do nothing
    // }

    // Built in Via EventEmitter
    // on(listener, fn) {
    //     // Do nothing
    // }

    // Built in via eventEmitter
    // once(listener, fn) {
    //     // Do nothing
    // }

    end(callback) {
        callback();
    }

    query(sql, values, cb) {
        let options = {}
        if (typeof sql === 'object') {
            // query(options, cb)
            options = sql;
            if (typeof values === 'function') {
                cb = values;
            } else if (values !== undefined) {
                options.values = values;
            }
        } else if (typeof values === 'function') {
            // query(sql, cb)
            cb = values;
            options.sql = sql;
            options.values = undefined;
        } else {
            // query(sql, values, cb)
            options.sql = sql;
            options.values = values;
        }
        
        try {
            let results = await client.query({
                sql, 
                parameters: values
            })
            cb(null, results);
        }
        catch(error) {
            this.emit('error', error);
            cb(error);
        }
    }

    execute(sql, values, cb) {
        let options = {};
        if (typeof sql === 'object') {
            // execute(options, cb)
            options = sql;
            if (typeof values === 'function') {
                cb = values;
            } else {
                options.values = options.values || values;
            }
        } else if (typeof values === 'function') {
            // execute(sql, cb)
            cb = values;
            options.sql = sql;
            options.values = undefined;
        } else {
            // execute(sql, values, cb)
            options.sql = sql;
            options.values = values;
        }

        try {
            let results = await client.query({
                sql, 
                parameters: values
            })
            cb(null, results);
        }
        catch(error) {
            this.emit('error', error);
            cb(error);
        }
    }
}

module.exports = Connection;