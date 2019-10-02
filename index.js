const Connection = require('./connection')
const DataApi = require('./DataApiClient')

function createConnection({
    host, // Resource
    port,
    user,
    flags,
    password, // SecretArn
    database, // Database
    timezone,
    typeCast,
    bigNumberStrings,
    supportBigNumbers,
}) {
    //TODO: Pass DataApi Viable parameters
    return new Connection({
        host, password, database
    })
}

module.exports = {
    createConnection
}