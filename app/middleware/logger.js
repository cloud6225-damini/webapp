const winston = require('winston');
const path = require('path');

const logFile = '/var/log/webapp.log';
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${level.toUpperCase()}] ${timestamp} - ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: logFile }),
    new winston.transports.Console()
  ]
});

module.exports = logger;