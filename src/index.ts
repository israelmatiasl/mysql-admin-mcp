import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { logError, logInfo } from './utils/logger.js';

async function main() {
    const server = createServer();
    const transport = new StdioServerTransport();

    await server.connect(transport);
    logInfo('MySQL Admin MCP server running on stdio');

    process.on('SIGINT', async () => {
        logInfo('SIGINT received. Closing MCP server...');
        await server.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        logInfo('SIGTERM received. Closing MCP server...');
        await server.close();
        process.exit(0);
    });

    process.stdin.on('close', async () => {
        logInfo('stdin closed. Closing MCP server...');
        await server.close();
        process.exit(0);
    });
}

main().catch((error) => {
    logError('Fatal startup error', {
        message: error instanceof Error ? error.message : 'Unknown error'
    });
    process.exit(1);
});