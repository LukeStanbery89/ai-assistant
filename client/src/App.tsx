import { useEffect, useRef, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
    const [count, setCount] = useState(0);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Connect to the WebSocket server
        const ws = new WebSocket("ws://localhost:3000");
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected");
            ws.send(JSON.stringify({ type: "hello", payload: "Hello from client!" }));
        };

        ws.onmessage = (event) => {
            console.log("WebSocket message:", event.data);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
        };

        return () => {
            ws.close();
        };
    }, []);

    // Helper to send events
    const sendEvent = (type: string, payload: any = null) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, payload }));
        } else {
            console.warn("WebSocket not connected");
        }
    };

    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <button onClick={() => sendEvent("chat", "Hello from chat button!")}>
                    Send Chat Event
                </button>
                <button onClick={() => sendEvent("ping")}>
                    Send Ping Event
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    );
}

export default App;