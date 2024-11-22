import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './components/DashboardOverview';
import OrderManagement from './components/OrderManagement';
import Customers from './components/Customers';
import CustomerDetail from './components/CustomerDetail';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import Category from './components/CategoryForm';
import Transaction from './components/Transaction';
import ProductParametersForm from './components/ProductParametersForm';
import Login from './components/Login';
import Register from './components/Register';
import MyProfile from './components/Myprofile';
import CouponCode from './components/CouponCode'; 
import NavBarForm from './components/NavBarForm';
import CouponDetail from './components/CouponDetail'; // Import CouponDetail
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {!user ? (
          // Show login/register when not authenticated
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate replace to="/login" />} />
          </Routes>
        ) : (
          // Show dashboard and other protected routes when authenticated
          <>
            <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
              <Sidebar isOpen={isSidebarOpen} />
              <div className="overview-container">
                <Routes>
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardOverview />} />
                    <Route path="order-management" element={<OrderManagement />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="customers/:id" element={<CustomerDetail />} />
                    <Route path="add-products" element={<ProductForm />} />
                    <Route path="edit-product/:id" element={<ProductForm />} />
                    <Route path="product-list" element={<ProductList />} />
                    <Route path="category" element={<Category />} />
                    <Route path="transaction" element={<Transaction />} />
                    <Route path="product-parameters" element={<ProductParametersForm />} />
                    <Route path="profile" element={<MyProfile />} />
                    <Route path="navbar-tags" element={<NavBarForm />} />
                    <Route path="coupons/:couponId" element={<CouponDetail />} /> {/* Updated: relative nested route */}
                    <Route path="coupon-code" element={<CouponCode />} />
                  </Route>
                  <Route path="*" element={<Navigate replace to="/dashboard" />} />
                </Routes>
              </div>
            </div>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
