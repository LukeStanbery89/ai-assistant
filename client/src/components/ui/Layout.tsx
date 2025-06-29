import { type ReactNode } from 'react';

interface LayoutProps {
    children: ReactNode;
}

function Layout({ children }: LayoutProps) {
    return (
        <div className="flex-1 bg-background-light dark:bg-background-dark transition-colors duration-200">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                {children}
            </div>
        </div>
    );
}

export default Layout;