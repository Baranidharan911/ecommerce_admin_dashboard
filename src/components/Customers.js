import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from '../firebase/config';
import '../styles/Customers.css';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [editingCustomerId, setEditingCustomerId] = useState(null);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newProfilePic, setNewProfilePic] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const storage = getStorage();

    useEffect(() => {
        const fetchCustomers = async () => {
            const customersCollection = collection(db, 'users');
            const customerSnapshot = await getDocs(customersCollection);
            const customerList = customerSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.firstName || 'Unknown',
                    email: data.email || 'No email',
                    phone: data.phoneNumber || 'No phone',
                    profilePic: data.profilePic || '',
                    created: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown',
                    isLocked: data.isLocked || false,
                };
            });
            setCustomers(customerList);
            setFilteredCustomers(customerList);
        };

        fetchCustomers();
    }, []);

    useEffect(() => {
        const filtered = customers.filter(customer =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCustomers(filtered);
    }, [searchTerm, customers]);

    const handleEdit = (customer) => {
        if (!customer.isLocked) {
            setEditingCustomerId(customer.id);
            setNewName(customer.name);
            setNewPhone(customer.phone);
        }
    };

    const handleSave = async (customerId) => {
        setIsUploading(true);
        let profilePicUrl = null;
        if (newProfilePic) {
            const profilePicRef = ref(storage, `profilePics/${customerId}`);
            await uploadBytes(profilePicRef, newProfilePic);
            profilePicUrl = await getDownloadURL(profilePicRef);
        }

        const customerDoc = doc(db, 'users', customerId);
        await updateDoc(customerDoc, { 
            firstName: newName, 
            phoneNumber: newPhone, 
            ...(profilePicUrl && { profilePic: profilePicUrl })
        });

        setCustomers(customers.map(customer => 
            customer.id === customerId 
            ? { ...customer, name: newName, phone: newPhone, ...(profilePicUrl && { profilePic: profilePicUrl }) }
            : customer
        ));
        setEditingCustomerId(null);
        setIsUploading(false);
    };

    const handleLockToggle = async (customerId, isLocked) => {
        const customerDoc = doc(db, 'users', customerId);
        await updateDoc(customerDoc, { isLocked: !isLocked });
        setCustomers(customers.map(customer => 
            customer.id === customerId ? { ...customer, isLocked: !isLocked } : customer
        ));
    };

    const handleDelete = async (customerId) => {
        if (window.confirm("Are you sure you want to delete this customer?")) {
            await deleteDoc(doc(db, 'users', customerId));
            setCustomers(customers.filter(customer => customer.id !== customerId));
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    return (
        <div className="customers-page">
            <div className="page-header">
                <h1>Customers</h1>
                <div className="search-container-customers">
                    <input 
                        type="text" 
                        placeholder="Search by name or phone..." 
                        className="search-input-customers"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <span className="clear-search-customers" onClick={handleClearSearch}>
                            &times;
                        </span>
                    )}
                </div>
            </div>
            <table className="customers-table">
                <thead>
                    <tr>
                        <th>NAME</th>
                        <th>PHONE NUMBER</th>
                        <th>CREATED</th>
                        <th>ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCustomers.map((customer) => (
                        <tr key={customer.id}>
                            <td>
                                {editingCustomerId === customer.id ? (
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                    />
                                ) : (
                                    <Link to={`/dashboard/customers/${customer.id}`} className="customer-link">
                                        <div className="customer-info">
                                            <div className="customer-avatar">
                                                {customer.profilePic ? (
                                                    <img src={customer.profilePic} alt="Profile" className="profile-pic" />
                                                ) : (
                                                    <i className="fas fa-user-circle"></i>
                                                )}
                                            </div>
                                            <div>
                                                <div className="customer-name">{customer.name}</div>
                                                <div className="customer-email">{customer.email}</div>
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </td>
                            <td>
                                {editingCustomerId === customer.id ? (
                                    <input
                                        type="text"
                                        value={newPhone}
                                        onChange={(e) => setNewPhone(e.target.value)}
                                    />
                                ) : (
                                    customer.phone
                                )}
                            </td>
                            <td>{customer.created}</td>
                            <td>
                                <div className="actions">
                                    {editingCustomerId === customer.id ? (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setNewProfilePic(e.target.files[0])}
                                            />
                                            <button onClick={() => handleSave(customer.id)} disabled={isUploading}>
                                                {isUploading ? 'Saving...' : 'Save'}
                                            </button>
                                            <button onClick={() => setEditingCustomerId(null)}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <i 
                                                className={`fas fa-edit ${customer.isLocked ? 'disabled' : ''}`} 
                                                onClick={() => handleEdit(customer)} 
                                                style={{ cursor: customer.isLocked ? 'not-allowed' : 'pointer', opacity: customer.isLocked ? 0.5 : 1 }}
                                            ></i>
                                            <i 
                                                className={`fas fa-${customer.isLocked ? 'lock' : 'unlock'}`} 
                                                onClick={() => handleLockToggle(customer.id, customer.isLocked)} 
                                                style={{ cursor: 'pointer', marginLeft: '10px' }}
                                            ></i>
                                            <i 
                                                className="fas fa-trash" 
                                                onClick={() => handleDelete(customer.id)} 
                                                style={{ cursor: 'pointer', marginLeft: '10px' }}
                                            ></i>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                <span>Showing {filteredCustomers.length} customers</span>
            </div>
        </div>
    );
};

export default Customers;
