import React, { useState, useEffect } from 'react';
import '../styles/Transaction.css';
import { FaTimesCircle, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState('latest');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const transactionsData = await Promise.all(
        ordersSnapshot.docs.map(async (orderDoc) => {
          const orderData = orderDoc.data();

          // Fetch customer details using user_id
          const customerDocRef = doc(db, 'users', orderData.user_id);
          const customerDoc = await getDoc(customerDocRef);
          const customerData = customerDoc.exists() ? customerDoc.data() : null;

          // Fetch shipping address details using shipping_address_id
          let shippingAddress = 'No Address Provided';
          if (orderData.shipping_address_id) {
            const addressDocRef = doc(db, 'addresses', orderData.shipping_address_id);
            const addressDoc = await getDoc(addressDocRef);
            if (addressDoc.exists()) {
              const addressData = addressDoc.data();
              shippingAddress = `${addressData.addressLine1}, ${addressData.addressLine2 ? addressData.addressLine2 + ', ' : ''}${addressData.city}, ${addressData.state}, ${addressData.zipCode}, ${addressData.countryCode}`;
            }
          }

          // Format the transaction object
          return {
            id: orderDoc.id,
            customer: customerData ? customerData.firstName : 'Unknown',
            date: orderData.created_at.toDate().toLocaleDateString(),
            total: `₹${orderData.total_amount}`,
            method: orderData.payment_method || 'Unknown',
            status: orderData.status || 'Pending',
            items: orderData.products || [],
            address: shippingAddress,
            trackingNumber: orderData.cart_id || 'No Tracking Number',
          };
        })
      );

      setTransactions(transactionsData);
    };

    fetchTransactions();
  }, []);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    return (
      (statusFilter === 'All' || transaction.status === statusFilter) &&
      (transaction.id.includes(searchTerm) || transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (dateFilter === 'latest') {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  });

  const paginatedTransactions = sortedTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredTransactions.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleClosePopup = () => {
    setSelectedTransaction(null);
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <FaHourglassHalf className="status-icon pending" />;
      case 'Confirmed':
        return <FaCheckCircle className="status-icon confirmed" />;
      case 'Cancelled':
        return <FaTimesCircle className="status-icon canceled" />;
      default:
        return null;
    }
  };

  return (
    <div className="transaction-container">
      <h2>Transaction</h2>
      <div className="transaction-filters">
        <div className="search-container-transaction">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="transaction-search"
          />
          {searchTerm && (
            <FaTimesCircle
              className="clear-search-transaction"
              onClick={handleClearSearch}
            />
          )}
        </div>
        <select value={statusFilter} onChange={handleStatusFilterChange} className="transaction-status-filter">
          <option value="All">Status: All</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select value={dateFilter} onChange={handleDateFilterChange} className="transaction-date-filter">
          <option value="latest">Filter by date range: Latest</option>
          <option value="oldest">Filter by date range: Oldest</option>
        </select>
      </div>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Method</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedTransactions.map((transaction, index) => (
            <tr key={index}>
              <td>{transaction.id}</td>
              <td>{transaction.customer}</td>
              <td>{transaction.date}</td>
              <td>{transaction.total}</td>
              <td>{transaction.method}</td>
              <td className={`status ${transaction.status.toLowerCase()}`}>
                {transaction.status}
              </td>
              <td>
                <button className="view-details" onClick={() => handleViewDetails(transaction)}>
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="transaction-footer">
        <div className="items-per-page">
          Showing
          <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={40}>40</option>
            <option value={50}>50</option>
          </select>
          of {filteredTransactions.length}
        </div>
        <div className="pagination">
          {pageNumbers.length > 1 &&
            pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={number === currentPage ? 'active' : ''}
              >
                {number}
              </button>
            ))}
        </div>
      </div>

      {selectedTransaction && (
        <div className="transaction-popup-overlay" onClick={handleClosePopup}>
          <div className="transaction-popup" onClick={(e) => e.stopPropagation()}>
            <div className="transaction-details-content">
              <div className="transaction-details-text">
                <h3>Transaction Details</h3>
                <p><strong>ID:</strong> {selectedTransaction.id}</p>
                <p><strong>Customer:</strong> {selectedTransaction.customer}</p>
                <p><strong>Date:</strong> {selectedTransaction.date}</p>
                <p><strong>Total:</strong> {selectedTransaction.total}</p>
                <p><strong>Method:</strong> {selectedTransaction.method}</p>
                <p><strong>Status:</strong> <span className={`status ${selectedTransaction.status.toLowerCase()}`}>{selectedTransaction.status}</span></p>
                <p><strong>Shipping Address:</strong> {selectedTransaction.address}</p>
                <p><strong>Tracking Number:</strong> {selectedTransaction.trackingNumber}</p>
                <h4>Purchased Products:</h4>
                <ul>
                  {selectedTransaction.items.map((item, index) => (
                    <li key={index}>
                      {item.product_name} - {item.quantity} x ₹{item.price}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="transaction-details-icon">
                {renderStatusIcon(selectedTransaction.status)}
              </div>
            </div>
            <button className="close-popup" onClick={handleClosePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transaction;
