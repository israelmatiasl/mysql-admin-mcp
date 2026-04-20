type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

function write(level: LogLevel, message: string, meta?: unknown): void {
    const payload =
        meta === undefined ? '' : ` ${safeJson(meta)}`;

    process.stderr.write(
        `[${new Date().toISOString()}] [${level}] ${message}${payload}\n`
    );
}

function safeJson(value: unknown): string {
    try {
        return JSON.stringify(value);
    } catch {
        return '[unserializable-meta]';
    }
}

export function logInfo(message: string, meta?: unknown): void {
    write('INFO', message, meta);
}

export function logWarn(message: string, meta?: unknown): void {
    write('WARN', message, meta);
}

export function logError(message: string, meta?: unknown): void {
    write('ERROR', message, meta);
}

export function logDebug(message: string, meta?: unknown): void {
    write('DEBUG', message, meta);
}