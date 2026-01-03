// src/pages/Contact.jsx
import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';



export default function Contact() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 md:px-8 py-16 lg:py-24">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
                            Get In <span className="font-medium">Touch</span>
                        </h1>
                        <div className="w-20 h-1 bg-indigo-200 mx-auto"></div>
                        <p className="mt-6 text-lg text-gray-700 max-w-2xl mx-auto">
                            We'd love to hear from you! Send us a message, and we'll respond within 24 hours.
                        </p>
                    </div>

                    {/* Contact Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Information */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden p-8 md:p-12">
                            <h2 className="text-2xl font-medium text-gray-900 mb-8">Contact Information</h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-1">Email</h3>
                                        <p className="text-gray-600">support@ecomm.com</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-1">Phone</h3>
                                        <p className="text-gray-600">+212612345678</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                                        <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 mb-1">Address</h3>
                                        <p className="text-gray-600">123 Commerce St, Mrorocco</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Business Hours */}
                            {/* <div className="mt-10 pt-10 border-t border-gray-100">
                                <h3 className="font-medium text-gray-900 mb-4">Business Hours</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Monday - Friday:</span>
                                        <span className="text-gray-900">9am - 5pm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Saturday:</span>
                                        <span className="text-gray-900">10am - 4pm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sunday:</span>
                                        <span className="text-gray-900">Closed</span>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                        
                        {/* Contact Form */}
                        {/* <div className="bg-white rounded-xl shadow-sm overflow-hidden p-8 md:p-12">
                            <h2 className="text-2xl font-medium text-gray-900 mb-8">Send us a Message</h2>
                            
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                        <input 
                                            type="text" 
                                            id="name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                                        <input 
                                            type="email" 
                                            id="email"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                    <input 
                                        type="text" 
                                        id="subject"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
                                        placeholder="How can we help?"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                                    <textarea 
                                        id="message"
                                        rows="5" 
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none" 
                                        placeholder="Tell us more about your inquiry..."
                                    ></textarea>
                                </div>
                                
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="privacy"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                                        I agree to the privacy policy and terms of service
                                    </label>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="w-full bg-indigo-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Send Message
                                </button>
                            </form>
                        </div> */}
                    </div>
                    
                    {/* Additional Information */}
                    {/* <div className="mt-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                            <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">Frequently Asked Questions</h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Can't find the answer you're looking for? Check out our FAQ section for quick answers to common questions.
                        </p>
                        <button className="inline-flex items-center px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            View FAQ
                            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div> */}
                </div>
            </main>
            <Footer />
        </div>
    );
}