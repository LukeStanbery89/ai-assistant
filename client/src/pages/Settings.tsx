import { useTheme } from "../contexts/ThemeContext";

function Settings() {
    const { isDark, setTheme } = useTheme();

    return (
        <div className="py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>
                
                <div className="space-y-6">
                    {/* Theme Settings */}
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</label>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setTheme("light")}
                                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                            !isDark
                                                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-300 dark:border-primary-600"
                                                : "bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-dark-600"
                                        }`}
                                    >
                                        ☀️ Light
                                    </button>
                                    <button
                                        onClick={() => setTheme("dark")}
                                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                            isDark
                                                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-2 border-primary-300 dark:border-primary-600"
                                                : "bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-dark-600"
                                        }`}
                                    >
                                        🌙 Dark
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder for future settings */}
                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversation</h2>
                        <p className="text-gray-600 dark:text-gray-400">Conversation settings will be available in future updates.</p>
                    </div>

                    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-700 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy & Data</h2>
                        <p className="text-gray-600 dark:text-gray-400">Privacy and data management settings will be available in future updates.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;