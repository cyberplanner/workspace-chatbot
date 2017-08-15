/**
 * Single place for setting up logging levels.
 */
let winston = require('winston');

let logger = new winston.Logger({
    level: 'debug',
    transports: [
        new (winston.transports.Console)()
    ]
});

module.exports = logger;
