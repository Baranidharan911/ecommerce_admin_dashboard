import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/CustomerDetail.css';

const CustomerDetail = () => {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        const fetchCustomer = async () => {
            const customerDoc = doc(db, 'users', id);
            const customerSnapshot = await getDoc(customerDoc);
            if (customerSnapshot.exists()) {
                setCustomer(customerSnapshot.data());
                await fetchOrders(customerSnapshot.id);
                await fetchAddresses(customerSnapshot.id);
            } else {
                console.error('No such customer found!');
            }
        };

        const fetchOrders = async (userId) => {
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, where('user_id', '==', userId));
            const ordersSnapshot = await getDocs(q);

            const fetchedOrders = [];

            for (const orderDoc of ordersSnapshot.docs) {
                const orderData = orderDoc.data();
                const cartProducts = await fetchCartProducts(orderData.products);
                fetchedOrders.push({
                    id: orderDoc.id,
                    ...orderData,
                    products: cartProducts,
                });
            }

            setOrders(fetchedOrders);
        };

        const fetchAddresses = async (userId) => {
            const addressesRef = collection(db, 'addresses');
            const q = query(addressesRef, where('user_id', '==', userId));
            const addressSnapshot = await getDocs(q);

            const addressList = addressSnapshot.docs.map(doc => doc.data());
            setAddresses(addressList);
        };

        const fetchCartProducts = async (productsArray) => {
            const cartProducts = await Promise.all(
                productsArray.map(async (product) => {
                    const productSpecDocRef = doc(db, 'productSpecifications', product.product_specification_id);
                    const productSpecDoc = await getDoc(productSpecDocRef);
                    
                    if (productSpecDoc.exists()) {
                        const productSpecData = productSpecDoc.data();
                        
                        const productDocRef = doc(db, 'products', productSpecData.product_id);
                        const productDoc = await getDoc(productDocRef);
                        
                        return {
                            ...product,
                            product_name: productDoc.exists() ? productDoc.data().product_name : 'No Name',
                            quantity: productSpecData.quantity || 1,
                        };
                    } else {
                        return { ...product, product_name: 'No Name', quantity: 1 };
                    }
                })
            );
            return cartProducts;
        };

        fetchCustomer();
    }, [id]);

    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'No Date';
        const date = timestamp.toDate();
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    return (
        <div className="customer-detail-page">
            {customer ? (
                <>
                    <div className="customer-header">
                        <div className="customer-info">
                            <div className="customer-avatar">
                                <i className="fas fa-user-circle"></i>
                            </div>
                            <div>
                                <div className="customer-name">{customer.firstName || 'No Name'}</div>
                                <div className="customer-email">{customer.email || 'No Email'}</div>
                            </div>
                        </div>
                        <div className="customer-stats">
                            <div>
                                <h4>PERSONAL INFORMATION</h4>
                                <p>Contact Number: {customer.phoneNumber || 'No Phone'}</p>
                                <p>Gender: {customer.gender || 'No Gender'}</p>
                                <p>Date of Birth: {customer.dob ? formatDate(customer.dob) : 'No DOB'}</p>
                                <p>Member Since: {customer.memberSince ? formatDate(customer.memberSince) : 'No Membership Date'}</p>
                            </div>
                            <div>
                                <h4>SHIPPING ADDRESS</h4>
                                {addresses.length > 0 ? (
                                    addresses.map((address, index) => (
                                        <p key={index}>
                                            {address.addressLine1}, {address.addressLine2}, {address.city}, {address.state}, {address.zipCode}
                                        </p>
                                    ))
                                ) : (
                                    <p>No Address</p>
                                )}
                                <h4>ORDER SUMMARY</h4>
                                <p>Total Orders: {orders.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="orders-section">
                        <h3>All Orders</h3>
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>ORDER ID</th>
                                    <th>CREATED</th>
                                    <th>TOTAL</th>
                                    <th>PAYMENT</th>
                                    <th>STATUS</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <React.Fragment key={order.id}>
                                        <tr>
                                            <td>{order.id}</td>
                                            <td>{order.created_at ? formatDate(order.created_at) : 'No Date'}</td>
                                            <td>{order.total_amount || 'No Total'}</td>
                                            <td>{order.payment_method || 'No Payment'}</td>
                                            <td className={`status-${order.status ? order.status.toLowerCase() : ''}`}>{order.status || 'No Status'}</td>
                                            <td>
                                                <button
                                                    className="toggle-button"
                                                    onClick={() => toggleOrderDetails(order.id)}
                                                >
                                                    {expandedOrder === order.id ? '▲' : '▼'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedOrder === order.id && (
                                            <tr>
                                                <td colSpan="6">
                                                    <table className="product-details-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Product ID</th>
                                                                <th>Name</th>
                                                                <th>Price</th>
                                                                <th>QTY</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {order.products.map((product, index) => (
                                                                <tr key={index}>
                                                                    <td>{product.product_specification_id}</td>
                                                                    <td>{product.product_name || 'No Name'}</td>
                                                                    <td>{product.price}</td>
                                                                    <td>{product.quantity}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div>Customer not found</div>
            )}
        </div>
    );
};

export default CustomerDetail;
