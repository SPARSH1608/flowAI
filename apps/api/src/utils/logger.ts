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
            // We are inside an execution context, format and send to the stream
            const message = args.map(arg =>
                typeof arg === 'string' ? arg : JSON.stringify(arg)
            ).join(' ');

            context.onLog(message);
        }

        // Always call the original so it still appears in the terminal
        originalConsoleLog.apply(console, args);
    };
}
