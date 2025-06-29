import { type ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </div>
    );
}

export default Layout;