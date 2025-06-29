import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/ui/Layout';
import Navigation from './components/ui/Navigation';
import Chat from './pages/Chat';
import Settings from './pages/Settings';

const routes = [
    { path: '/chat', label: 'Chat' },
    { path: '/settings', label: 'Settings' },
];

function App() {
    return (
        <Router>
            <div className="h-screen bg-gray-50 flex flex-col">
                <Navigation routes={routes} />
                <div className="flex-1 overflow-hidden">
                    <Routes>
                        <Route path="/" element={<Navigate to="/chat" replace />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/settings" element={
                            <Layout>
                                <Settings />
                            </Layout>
                        } />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;