const DataApi = require('data-api-client');
const { EventEmitter } = require('events');

let client;
class Connection extends EventEmitter {
  constructor({
    host, // Resource
    password, // SecretArn
    database, // Database
  }) {
    super();

    if (!client) {
      client = DataApi({
        resourceArn: host,
        secretArn: password,
        database,
      });
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
    if (eventName === 'connect') {
      fn();
    }
  }

  once(eventName, fn) {
    super.once(eventName, fn);

    /**
     * Since we are using DataAPI the connection is made by AWS
     *  So when a new the eventName connect is sent we can just emit connect
     */
    if (eventName === 'connect') {
      this.emit('connect');
    }
  }

  end(callback) {
    callback();
  }

  query(sql, values, cb) {
    return this.execute(sql, values, cb);
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
      newParameters,
    } = this.transformValues(options.sql, options.values);

    // If query parameters are empty we want to just pass
    //  the sql with no parameters
    const query = { sql: copySql };
    if (newParameters) query.parameters = newParameters;
    if (this.transactionId) query.transactionId = this.transactionId;

    switch (query.sql) {
      case 'START TRANSACTION;':
        client.beginTransaction()
          .then(({ transactionId }) => {
            this.transactionId = transactionId;
            cb();
          })
          .catch((error) => {
            this.emit('error', error);
            cb(error);
          });
        break;
      case 'COMMIT;':
        client.commitTransaction({ transactionId: this.transactionId })
          .then(() => {
            delete this.transactionId;
            cb();
          })
          .catch((error) => {
            this.emit('error', error);
            cb(error);
          });
        break;
      case 'ROLLBACK;':
        client.rollbackTransaction({ transactionId: this.transactionId })
          .then(() => {
            delete this.transactionId;
            cb();
          })
          .catch((error) => {
            this.emit('error', error);
            cb(error);
          });
        break;
      default: 
        client.query(query)
          .then((results) => {
            // If result.records doesn't exist we want to just pass
            //  results as an array, since sql expects an array in the cb
            if (results.records) {
              // Is select query
              cb(null, results.records);
            } else {
              // Is insert query
              cb(null, results);
            }
          })
          .catch((error) => {
            this.emit('error', error);
            cb(error);
          });
    }

    return this;
  }

  transformValues(sql, parametersArray) {
    // console.log(sql, parametersArray);
    if (!parametersArray) return { copySql: sql, newParameters: parametersArray };


    let copySql = `${sql}`;
    const newParameters = {};
    parametersArray.forEach((param, index) => {
      copySql = copySql.replace('?', `:value${index}`);
      newParameters[`value${index}`] = param;
    });

    return { copySql, newParameters };
  }
}

module.exports = Connection;
