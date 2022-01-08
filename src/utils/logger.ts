import winston from 'winston'
import path from 'path'

const logFilename = path.join(__dirname, '../../logs/combined.log')

export default winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: logFilename }),
  ],
})
