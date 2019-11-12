const Connection = require('./connection');

function createConnection(options) {
  return new Connection(options);
}

module.exports = {
  createConnection,
};


