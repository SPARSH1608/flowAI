import { AsyncLocalStorage } from "async_hooks";

interface LoggerContext {
    onLog: (message: string) => void;
}

export const loggerContext = new AsyncLocalStorage<LoggerContext>();

export function setupGlobalLogger() {
    const originalConsoleLog = console.log;

    console.log = function (...args: any[]) {
        const context = loggerContext.getStore();

        if (context) {
            
            const message = args.map(arg =>
                typeof arg === 'string' ? arg : JSON.stringify(arg)
            ).join(' ');

            context.onLog(message);
        }

        
        originalConsoleLog.apply(console, args);
    };
}
