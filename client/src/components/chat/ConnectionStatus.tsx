import type { ConnectionStatus as ConnectionStatusType } from '../../services/ChatWebSocketService';

interface ConnectionStatusProps {
    status: ConnectionStatusType;
}

function ConnectionStatus({ status }: ConnectionStatusProps) {
    if (status.connected) {
        return (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connected</span>
            </div>
        );
    }

    if (status.connecting) {
        return (
            <div className="flex items-center space-x-2 text-yellow-600 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Connecting...</span>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>
                {status.error ? `Error: ${status.error}` : 'Disconnected'}
            </span>
        </div>
    );
}

export default ConnectionStatus;