import type { ConnectionStatus as ConnectionStatusType } from '../../services/ChatWebSocketService';

interface ConnectionStatusProps {
    status: ConnectionStatusType;
}

function ConnectionStatus({ status }: ConnectionStatusProps) {
    if (status.connected) {
        return (
            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full shadow-sm"></div>
                <span>Connected</span>
            </div>
        );
    }

    if (status.connecting) {
        return (
            <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                <div className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full animate-pulse shadow-sm"></div>
                <span>Connecting...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm font-medium">
            <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full shadow-sm"></div>
            <span>
                {status.error ? `Error: ${status.error}` : 'Disconnected'}
            </span>
        </div>
    );
}

export default ConnectionStatus;