const Connection = require('./connection')

function createConnection({
    host, // Resource
    password, // SecretArn
    database, // Database
}) {
    return new Connection({ host, password, database })
}

module.exports = {
    createConnection
}