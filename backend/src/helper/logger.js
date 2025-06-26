import fs from 'fs';
import path from 'path';

export const logError = (error) => {
  const timestamp = new Date().toISOString();

  let errorMessage;
  if (error instanceof Error) {
    errorMessage = error.stack || error.message;
  } else if (typeof error === 'object') {
    errorMessage = JSON.stringify(error, null, 2);
  } else {
    errorMessage = String(error);
  }

  const logEntry = `[${timestamp}] [ERROR] ${errorMessage}\n`;

  try {
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, 'group-errors.log');
    fs.appendFileSync(logFile, logEntry);
  } catch (err) {
    // Fallback to console if writing to file fails
    console.error('Failed to write to log file:', err);
    console.error(logEntry);
  }
};
