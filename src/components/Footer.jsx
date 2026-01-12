// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 pt-12 pb-8 border-t border-gray-800">
            <div className="container mx-auto px-4 md:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">

                    {/* Column 1: Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-3 uppercase text-sm tracking-wider">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                            <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                            <li><Link to="/careers" className="hover:text-white transition">Careers</Link></li>
                        </ul>
                    </div>

                    {/* Column 2: Legal */}
                    <div>
                        <h4 className="text-white font-semibold mb-3 uppercase text-sm tracking-wider">Legal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                            <li><Link to="/shipping" className="hover:text-white transition">Shipping Policy</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Newsletter & Social */}
                    <div className="col-span-2 md:col-span-2">
                        <h4 className="text-white font-semibold mb-3 uppercase text-sm tracking-wider">Stay Connected</h4>
                        {/* <p className="text-sm mb-4">Join our newsletter for 10% off your first order.</p> */}
                        
                        {/* Subscription Form Placeholder
                        <form className="flex mb-6">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="p-3 w-full rounded-l-lg text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 border-none"
                            />
                            <button 
                                type="submit"
                                className="bg-indigo-600 text-white p-3 rounded-r-lg hover:bg-indigo-700 transition font-medium"
                            >
                                Sign Up
                            </button>
                        </form> */}

                        {/* Social Icons */}
                        <div className="flex gap-4 text-xl">
                            <a href="#" className="hover:text-indigo-400 transition"><i className="fa-brands fa-instagram"></i></a>
                            <a href="#" className="hover:text-indigo-400 transition"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="hover:text-indigo-400 transition"><i className="fa-brands fa-twitter"></i></a>
                            <a href="#" className="hover:text-indigo-400 transition"><i className="fa-brands fa-pinterest"></i></a>
                        </div>
                    </div>
                </div>
                
                <hr className="border-gray-800 my-8" />
                
                <div className="text-center">
                    <p className="text-xs tracking-wider uppercase text-gray-500">&copy; {new Date().getFullYear()} IMMO. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};