const DataApi = require('data-api-client')
const { EventEmitter } = require('events');

let client;
class Connection extends EventEmitter {

    constructor({
        host, password, database
    }) {
        super();

        if(!client) {
            client = DataApi({
                resourceArn: host,
                secretArn: password,
                database: database,
            })
        }
        
        /** 
         * These values are necessary for Connection-Manager for Sequelize 
         *  We do nothing with these values, but without them Sequelize will error out
         * */
        this._fatalError = null;
        this._closing = null;
        this._protocolError = null;
        this.stream = { destroyed: null };
    }

    on(eventName, fn) {
        super.on(eventName, fn);

        /**
         * Since we are using DataAPI the connection is made by AWS
         *  So when a new the eventName connect is sent we can just run the fn 
         */
        if(eventName === 'connect') {
            fn();
        }
    }

    once(eventName, fn) {
        super.once(eventName, fn);

        /**
         * Since we are using DataAPI the connection is made by AWS
         *  So when a new the eventName connect is sent we can just emit connect 
         */
        if(eventName === 'connect') {
            this.emit('connect');
        }
    }

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

        const { 
            copySql, 
            newParameters
        } = this.transformValues(options.sql, options.values)

        client.query({
            sql: copySql,
            parameters: newParameters
        })
        .then(results => {
            cb(null, results.records);
        })
        .catch(error => {
            this.emit('error', error);
            cb(error);
        })

        return this;
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

        const { 
            copySql, 
            newParameters
        } = this.transformValues(options.sql, options.values)

        client.query({
            sql: copySql,
            parameters: newParameters
        })
        .then(results => {
            cb(null, results);
        })
        .catch(error => {
            this.emit('error', error);
            cb(error);
        })

        return this;
    }

    transformValues(sql, parametersArray) {
        if(!parametersArray) return { copySql: sql, newParameters: parametersArray}

        let copySql = `${sql}`;
        let newParameters = {};
        parametersArray.forEach((param, index) => {
            copySql = copySql.replace("?", `:value${index}`);
            newParameters[`value${index}`] = param
        })

        return { copySql, newParameters };
    }
}

module.exports = Connection;