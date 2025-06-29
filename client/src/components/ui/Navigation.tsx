import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
    routes: Array<{
        path: string;
        label: string;
    }>;
}

function Navigation({ routes }: NavigationProps) {
    const location = useLocation();

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex space-x-8">
                        <Link to="/" className="text-xl font-semibold text-gray-900">
                            AI Assistant
                        </Link>
                    </div>
                    <div className="flex space-x-4">
                        {routes.map((route) => (
                            <Link
                                key={route.path}
                                to={route.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    location.pathname === route.path
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;