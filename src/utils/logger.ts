import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export const logError = (error: Error) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
};

export const logInfo = (message: string, meta?: any) => {
  logger.info({
    message,
    ...meta,
    timestamp: new Date().toISOString()
  });
};

export default logger; 