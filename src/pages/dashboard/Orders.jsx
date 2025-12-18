import React, { useState, useEffect } from "react";
import { getOrders, updateOrderStatus, deleteOrderById } from "../../api/ordersApi";
import API_URL from "../../config/api"; 


export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [deleteOrderId, setDeleteOrderId] = useState(null);
    const [statusFilter, setStatusFilter] = useState("");
    const [searchName, setSearchName] = useState("");
    const [sortRange, setSortRange] = useState("all");
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // NOTE: Consider adding loading state here
                const res = await getOrders();
                setOrders(res.data);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            }
        };
        fetchOrders();
    }, []);

    const calculateOrderTotal = (order) =>
        order.products?.reduce((sum, p) => sum + p.price * p.quantity, 0) || 0;

    const changeStatus = async (id, newStatus) => {
        try {
            setUpdatingId(id);
            await updateOrderStatus(id, newStatus);
            setOrders((prev) =>
                prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
            );
        } catch (error) {
            console.error("Failed to update order status:", error);
            alert("Failed to update order status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteOrder = async () => {
        try {
            await deleteOrderById(deleteOrderId);
            setOrders((prev) => prev.filter((o) => o.id !== deleteOrderId));
            setDeleteOrderId(null);
        } catch (error) {
            console.error("Failed to delete order:", error);
            alert("Failed to delete order.");
        }
    };

    const now = new Date();

    const filteredOrders =
        orders
            ?.filter((o) => (statusFilter ? o.status === statusFilter : true))
            ?.filter((o) =>
                searchName.trim()
                    ? o.customerName?.toLowerCase().includes(searchName.toLowerCase())
                    : true
            )
            ?.filter((o) => {
                const orderDate = new Date(o.date);
                const timeDiff = now.getTime() - orderDate.getTime();

                if (sortRange === "day") return timeDiff <= 24 * 60 * 60 * 1000;
                if (sortRange === "week") return timeDiff <= 7 * 24 * 60 * 60 * 1000;
                if (sortRange === "month") return timeDiff <= 30 * 24 * 60 * 60 * 1000;
                return true;
            })
            ?.sort((a, b) => new Date(b.date) - new Date(a.date)) || [];

    const statusColors = {
        Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
        Confirmed: "bg-blue-100 text-blue-800 border-blue-300",
        Delivered: "bg-green-100 text-green-800 border-green-300",
        Cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    
    // Status Icons for better visual distinction
    const statusIcons = {
        Pending: "fas fa-clock",
        Confirmed: "fas fa-check-circle",
        Delivered: "fas fa-truck",
        Cancelled: "fas fa-times-circle",
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                🛍️ Orders Management
            </h1>

            {/* FILTERS CARD */}
            <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                    <input
    type="text"
    placeholder="Search by customer name..."
    value={searchName}
    onChange={(e) => setSearchName(e.target.value)}
    // Added text-gray-900, placeholder-gray-500, and bg-white
    className="border-2 border-gray-200 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 shadow-sm w-full transition text-gray-900 placeholder-gray-500 bg-white"
                    />
                    </div>

                    <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        // Removed 'appearance-none' to show the arrow, added 'bg-white' and 'text-gray-900'
        className="border-2 border-gray-200 px-4 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 shadow-sm w-full transition cursor-pointer text-gray-900 bg-white"
    >
        <option value="">All Status</option>
        {Object.keys(statusColors).map((status) => (
            <option key={status} value={status}>
                {status}
            </option>
        ))}
    </select>

    <select
        value={sortRange}
        onChange={(e) => setSortRange(e.target.value)}
        // Removed 'appearance-none' to show the arrow, added 'bg-white' and 'text-gray-900'
        className="border-2 border-gray-200 px-4 pr-10 py-2.5 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 shadow-sm w-full transition cursor-pointer text-gray-900 bg-white"
    >
        <option value="all">All time</option>
        <option value="day">Last 24h</option>
        <option value="week">Last 7 days</option>
        <option value="month">Last 30 days</option>
    </select>
                </div>
            </div>
            
            <p className="text-sm font-medium text-gray-600 mb-4">
            Existing Orders ({filteredOrders.length})
            </p>

            {/* ORDERS LIST */}
            <div className="space-y-6">
                {filteredOrders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4 mb-4">
                            
                            {/* CUSTOMER INFO */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-gray-800">
                  Order #{order.id}
                </h2>

                <p className="font-semibold">{order.customerName}</p>

                <p className="text-sm text-gray-500">
                  📧 Email: {order.customerEmail}
                </p>

                <p className="text-sm text-gray-500">
                  📞 Phone: {order.customerPhone}
                </p>

                <p className="text-sm text-gray-500">
                  🏙️ City: {order.city || "Not specified"}
                </p>

                <p className="text-sm text-gray-500">
                  📍 Address: {order.customerAddress}
                </p>

              </div>

                            {/* Status & Total */}
                            <div className="flex flex-col gap-3 items-start md:items-end w-full md:w-auto">
                                <span
                                    className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statusColors[order.status]}`}
                                >
                                     <i className={`${statusIcons[order.status]} mr-1`}></i> {order.status}
                                </span>
                                
                                <div className="text-right">
    <p className="text-sm text-gray-500">Placed on:</p>
    <p className="text-xs font-medium text-gray-700">
        {order.date ? (
            new Date(new Date(order.date).getTime() + 1 * 60 * 60 * 1000) // +1 hour
                .toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })
        ) : "No date"}
    </p>
</div>


                                <div className="flex gap-2">
                                    <select
                                        value={order.status}
                                        onChange={(e) => changeStatus(order.id, e.target.value)}
                                        className="border-2 border-indigo-200 bg-indigo-50 text-indigo-800 p-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer transition"
                                        disabled={updatingId === order.id}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>

                                    <button
                                        onClick={() => setDeleteOrderId(order.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg text-sm transition"
                                    > Delete &nbsp;
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* PRODUCTS & TOTAL */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="lg:col-span-2">
                                <p className="font-semibold text-gray-700 mb-2">
                                    Items ordered ({order.products?.length || 0})
                                </p>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {order.products?.map((p, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-center bg-gray-100 px-4 py-2 rounded-lg text-sm border-l-4 border-indigo-400"
                                        >
                                            <span className="text-gray-700 font-medium">
                                                {p.name}
                                                <span className="text-gray-500 ml-2"> (x{p.quantity})</span>
                                            </span>
                                            <span className="font-bold text-gray-800">{p.price * p.quantity} DH</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l pt-4 lg:pl-4 flex flex-col justify-center">
                                <p className="text-lg font-medium text-gray-600 mb-2">Order Grand Total:</p>
                                <div className="text-3xl font-extrabold text-green-600">
                                    {calculateOrderTotal(order)} DH
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl shadow">
                        <i className="fas fa-box-open text-4xl text-gray-400 mb-3"></i>
                        <p className="text-gray-500 font-medium">
                            No orders found.
                        </p>
                    </div>
                )}
            </div>

            {/* DELETE MODAL (Modernized) */}
            {deleteOrderId && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-4 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-xs md:max-w-sm text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Confirm Deletion</h2>
                        <p className="text-gray-600 mb-5">
                            Are you sure you want to delete Order #{deleteOrderId}? This cannot be reversed.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteOrderId(null)}
                                className="flex-1 px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteOrder}
                                className="flex-1 px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold transition"
                            >
                                <i className="fas fa-trash-alt mr-1"></i> Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}