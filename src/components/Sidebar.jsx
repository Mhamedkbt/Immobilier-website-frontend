import React, { useEffect, useState } from "react";
import { getOrders } from "../api/ordersApi"; // Fixed path to one dot if in src/components

export default function Sidebar({
    activePage,
    setActivePage,
    sidebarOpen,
    setSidebarOpen,
    handleLogout,
}) {
    const [newOrdersCount, setNewOrdersCount] = useState(0);

    useEffect(() => {
        const checkNewOrders = async () => {
            try {
                const res = await getOrders();
                if (res.data && res.data.length > 0) {
                    // Get the ID of the last order the admin "saw" from browser storage
                    const lastSeenId = localStorage.getItem("lastSeenOrderId") || 0;
                    
                    // Count how many orders have an ID greater than what we last saw
                    // We only count them if they are also "Pending"
                    const newOrders = res.data.filter(order => 
                        order.id > parseInt(lastSeenId) && order.status === "Pending"
                    );
                    
                    setNewOrdersCount(newOrders.length);
                }
            } catch (error) {
                console.error("Failed to fetch orders for badge:", error);
            }
        };

        checkNewOrders();
        const interval = setInterval(checkNewOrders, 20000); // Check every 20s
        return () => clearInterval(interval);
    }, []);

    // Logic to "Clear" the badge when clicking Orders
    const handleOrdersClick = async (ordersList) => {
        try {
            const res = await getOrders(); // Get latest to find newest ID
            if (res.data && res.data.length > 0) {
                // Find the highest ID in the list
                const maxId = Math.max(...res.data.map(o => o.id));
                // Save it as "seen"
                localStorage.setItem("lastSeenOrderId", maxId.toString());
                setNewOrdersCount(0);
            }
        } catch (e) {
            setNewOrdersCount(0);
        }
    };

    const navigation = [
        { name: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
        { name: "Products", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
        { name: "Categories", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
        // { name: "Orders", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z", hasBadge: true },
        { name: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
    ];

    return (
        <>
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
            )}

            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:flex md:flex-col md:static md:inset-0`}>
                <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-800 border-b border-indigo-700">
                    <h1 className="text-2xl font-extrabold text-white">Admin Panel</h1>
                </div>

                <div className="flex-1 flex flex-col overflow-y-auto">
                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {navigation.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => {
                                    setActivePage(item.name.toLowerCase());
                                    setSidebarOpen(false);
                                    if(item.hasBadge) handleOrdersClick(); // Clear badge on click
                                }}
                                className={`${
                                    activePage === item.name.toLowerCase()
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                } group flex items-center px-4 py-2.5 text-base font-semibold rounded-xl w-full text-left transition relative`}
                            >
                                <svg className={`${activePage === item.name.toLowerCase() ? 'text-indigo-100' : 'text-gray-400 group-hover:text-gray-300'} mr-3 flex-shrink-0 h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                </svg>
                                <span className="flex-1">{item.name}</span>

                                {item.hasBadge && newOrdersCount > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white ring-2 ring-gray-900">
                                        {newOrdersCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                    
                    <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
                        <button onClick={handleLogout} className="flex-shrink-0 w-full group flex items-center px-4 py-2.5 text-base font-semibold rounded-xl text-red-400 bg-gray-800 hover:bg-red-700 hover:text-white transition">
                            <svg className="mr-3 flex-shrink-0 h-6 w-6 text-red-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}