import fs from 'fs';

interface Logger {
    logRequest(method: string, endpoint: string, statusCode: number, responseTime: number): void;
    logError(endpoint: string, errorMessage: string): void;
    logDatabaseQuery(query: string, executionTime: number): void;
}

function createSystemLogger(logFile: string = 'system.log'): Logger {
    function log(level: string, message: string): void {
        const timestamp: string = new Date().toISOString(); 
        const logMessage: string = `${timestamp} - ${level} - ${message}\n`;
        
       
        console.log(logMessage.trim()); 
        fs.appendFileSync(logFile, logMessage); 
    }

    return {
        logRequest: function(method: string, endpoint: string, statusCode: number, responseTime: number): void {
            log('INFO', 
                `REQUEST: ${method} ${endpoint} - Status: ${statusCode} - Time: ${responseTime}ms`
            );
        },

        logError: function(endpoint: string, errorMessage: string): void {
            log('ERROR',
                `ERROR: ${endpoint} - ${errorMessage}`
            );
        },

        logDatabaseQuery: function(query: string, executionTime: number): void {
            log('INFO',
                `DB_QUERY: ${query} - Execution Time: ${executionTime}ms`
            );
        }
    };
}

export default createSystemLogger;