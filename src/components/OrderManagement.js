import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getDocs, collection, query, where, updateDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '../styles/OrderManagement.css';

const OrderManagement = () => {
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [orders, setOrders] = useState([]);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [startDate, endDate] = dateRange;

    useEffect(() => {
        const fetchOrders = async () => {
            let ordersQuery = collection(db, 'orders');

            if (statusFilter !== 'All') {
                ordersQuery = query(ordersQuery, where('status', '==', statusFilter));
            }

            if (searchTerm) {
                ordersQuery = query(ordersQuery, where('order_id', '==', searchTerm));
            }

            if (startDate && endDate) {
                ordersQuery = query(ordersQuery, where('created_at', '>=', startDate), where('created_at', '<=', endDate));
            }

            const ordersSnapshot = await getDocs(ordersQuery);
            const ordersData = await Promise.all(
                ordersSnapshot.docs.map(async (orderDoc) => {
                    const orderData = orderDoc.data();

                    // Fetch customer details using user_id
                    const customerDocRef = doc(db, 'users', orderData.user_id);
                    const customerDoc = await getDoc(customerDocRef);
                    const customerData = customerDoc.exists() ? customerDoc.data() : null;

                    // Fetch product details using product_specification_id for each product
                    const productsArray = Array.isArray(orderData.products) ? orderData.products : [];
                    const products = await Promise.all(
                        productsArray.map(async (product) => {
                            if (product.product_id) {
                                const productDocRef = doc(db, 'products', product.product_id);
                                const productDoc = await getDoc(productDocRef);
                                const productData = productDoc.exists() ? productDoc.data() : {};

                                // Handle discount calculation
                                const discountType = orderData.discount_type || 'fixed'; // Ensure a default value
                                let discountAmount = 0;

                                if (discountType === 'percentage') {
                                    const discountPercentage = parseFloat(orderData.discount_percentage) || 0;
                                    discountAmount = (productData.price || 0) * (discountPercentage / 100);
                                } else if (discountType === 'fixed') {
                                    discountAmount = parseFloat(orderData.discount_amount) || 0;
                                }

                                const finalPrice = (productData.price || 0) - discountAmount;

                                return {
                                    ...product,
                                    product_name: productData.product_name || 'N/A',
                                    price: productData.price || 0,
                                    discount: discountAmount,
                                    discount_type: discountType,
                                    final_price: finalPrice,
                                };
                            } else {
                                return {
                                    ...product,
                                    product_name: 'N/A',
                                    price: 0,
                                    discount: 0,
                                    discount_type: 'percentage',
                                    final_price: 0,
                                };
                            }
                        })
                    );

                    return {
                        id: orderDoc.id,
                        ...orderData,
                        products,
                        customer: customerData,
                    };
                })
            );

            setOrders(ordersData);
        };

        fetchOrders();
    }, [statusFilter, searchTerm, dateRange]);

    const handleExpandOrder = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        const orderDocRef = doc(db, "orders", orderId);
        await updateDoc(orderDocRef, { status: newStatus });
        setOrders((prevOrders) =>
            prevOrders.map((order) => (order.id === orderId ? {
                ...order,
                status: newStatus 
            } : order))
        );
    };

    const handleDeleteOrder = async (orderId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this order?");
        if (confirmDelete) {
            await deleteDoc(doc(db, "orders", orderId));
            setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
        }
    };

    const handleDateRangeChange = (dates) => {
        const [start, end] = dates;
        setDateRange([start, end]);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    return (
        <div className="order-management">
            <div className="filters">
                <button onClick={() => setStatusFilter('All')} className="all-products-button">
                    All Products
                </button>
                {['Pending', 'Confirmed', 'Processing', 'Picked', 'Shipped', 'Delivered', 'Cancelled'].map(
                    (status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={statusFilter === status ? 'active' : ''}
                        >
                            {status}
                        </button>
                    )
                )}
            </div>
            <div className="search-and-filter">
                <div className="order-search-container">
                    <input
                        type="text"
                        placeholder="Search by order ID"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        value={searchTerm}
                        className="search-input"
                    />
                    {searchTerm && (
                        <FontAwesomeIcon 
                            icon={faTimes} 
                            className="order-clear-search-icon" 
                            onClick={clearSearch} 
                            title="Clear search"
                        />
                    )}
                </div>
                <DatePicker
                    selected={startDate}
                    onChange={handleDateRangeChange}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    isClearable
                    placeholderText="Filter by date range"
                    className="filter-button"
                />
            </div>
            <table className="order-table">
                <thead>
                    <tr>
                        <th>ORDER ID</th>
                        <th>CREATED</th>
                        <th>CUSTOMER</th>
                        <th>TOTAL</th>
                        <th>PROFIT</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <React.Fragment key={order.id}>
                                <tr className="order-row">
                                    <td>{order.order_id}</td>
                                    <td>{order.created_at.toDate().toLocaleDateString()}</td>
                                    <td>
                                        {order.customer ? (
                                            <>
                                                <div>{order.customer.firstName}</div>
                                            </>
                                        ) : (
                                            'Customer Not Found'
                                        )}
                                    </td>
                                    <td>₹{order.final_amount}</td>
                                    <td>₹{order.profit || 'N/A'}</td>
                                    <td>
                                        <select
                                            className={`status-dropdown ${order.status.toLowerCase()}`}
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Confirmed">Confirmed</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Picked">Picked</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button className="expand-button" onClick={() => handleExpandOrder(order.id)}>
                                            {expandedOrderId === order.id ? '▲' : '▼'}
                                        </button>
                                        <button 
                                            className="delete-button" 
                                            onClick={() => handleDeleteOrder(order.id)}
                                            style={{ marginLeft: '10px', color: 'red' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                                {expandedOrderId === order.id && (
                                    <tr className="expanded-order">
                                        <td colSpan="7">
                                            <table className="expanded-order-details">
                                                <thead>
                                                    <tr>
                                                        <th>SKU</th>
                                                        <th>Name</th>
                                                        <th>Price</th>
                                                        <th>Quantity</th>
                                                        <th>Discount</th>
                                                        <th>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.products.map((product) => {
                                                        const price = product.final_price || 0;
                                                        const quantity = product.quantity || 1;
                                                        const total = price * quantity;
                                                        return (
                                                            <tr key={product.product_specification_id}>
                                                                <td>{product.product_id || 'N/A'}</td>
                                                                <td>{product.product_name || 'N/A'}</td>
                                                                <td>₹{price.toFixed(2)}</td>
                                                                <td>{quantity}</td>
                                                                <td>
                                                                    {product.discount_type === 'percentage'
                                                                        ? `${parseFloat(order.discount_percentage) || 0}%`
                                                                        : `₹${product.discount}`}
                                                                </td>
                                                                <td>₹{total.toFixed(2)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No orders found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OrderManagement;
