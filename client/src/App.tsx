import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/ui/Layout';
import Navigation from './components/ui/Navigation';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import { ThemeProvider } from './contexts/ThemeContext';

const routes = [
    { path: '/chat', label: 'Chat' },
    { path: '/settings', label: 'Settings' },
];

function App() {
    return (
        <ThemeProvider>
            <Router>
                <div className="h-screen bg-background-light dark:bg-background-dark flex flex-col transition-colors duration-200">
                    <Navigation routes={routes} />
                    <div className="flex-1 flex flex-col min-h-0">
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
        </ThemeProvider>
    );
}

export default App;