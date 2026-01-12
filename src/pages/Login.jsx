import React, { useState } from "react";
// Assuming these paths are correct for your project
import Navbar from '../components/Navbar.jsx'; 
import Footer from '../components/Footer.jsx';
import API_URL from "../config/api";
import WhatsAppButton from "../components/WhatsAppButton.jsx";



// NOTE: Font Awesome (fas) icons are still used for the eye and spinner.
// Ensure you have Font Awesome included in your main index.html file.

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); 
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Function to toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                let msg = "Login failed";
                try {
                    msg = await response.text();
                    if (!msg) msg = "Invalid credentials or login failed.";
                } catch (readError) {
                    // Ignore if reading text fails
                }
                throw new Error(msg);
            }

            const token = await response.text();
            localStorage.setItem("token", token);

            // Successful login
            window.location.href = "/dashboard";
        } catch (err) {
            setError(err.message || "An unknown error occurred during login.");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white"> 
            
            <Navbar /> 

            {/* Main content area centers the form */}
            <main className="flex-grow flex items-center justify-center bg-gray-50 p-4 md:p-8">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-8 sm:p-10 rounded-xl shadow-xl w-full max-w-sm mb-10 mt-10" 
                    // Added mb-12 for margin bottom separation from the footer area
                >
                    {/* Header: Clean, bold, with clear subheading */}
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-2 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="text-center text-gray-500 mb-8">Login to your account.</p>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-300 text-red-600 px-4 py-3 rounded-lg relative mb-4" role="alert">
                            <span className="block sm:inline font-medium">{error}</span>
                        </div>
                    )}

                    {/* Username Field */}
                    <div className="mb-5">
                        <label htmlFor="username" className="block mb-1 text-sm font-semibold text-gray-700">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>

                    {/* Password Field with Toggle */}
                    <div className="mb-6">
                        <label htmlFor="password" className="block mb-1 text-sm font-semibold text-gray-700">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"} 
                                className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            {/* Eye Toggle Button */}
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition p-1"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-lg`}></i>
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md shadow-indigo-300/50 disabled:bg-indigo-400 flex items-center justify-center text-lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-3"></i> Loading...
                            </>
                        ) : (
                            "Login"
                        )}
                    </button>
                    
                    
                </form>
            </main>

            <Footer />
            <WhatsAppButton />
        </div>
    );
}