const Connection = require('./connection');

function createConnection(options) {
  // Hello
  return new Connection(options);
}

module.exports = {
  createConnection,
};
