import { useEffect, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import './App.css';
import type { WebSocketEventPayload } from "../../shared/types";

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
    const sendEvent = (type: string, payload: WebSocketEventPayload = null) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, payload }));
        } else {
            console.warn("WebSocket not connected");
        }
    };

    return (
        <Router>
            <nav style={{ marginBottom: '2rem' }}>
                <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
                <Link to="/about">About</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
            </Routes>
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
        </Router>
    );
}

export default App;