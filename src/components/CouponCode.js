import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import for navigation
import { db } from '../firebase/config'; 
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore'; 
import '../styles/CouponCode.css';

// Function to generate a random coupon code
const generateRandomCode = (length, type) => {
  let characters = '';
  if (type === 'numeric') {
    characters = '0123456789';
  } else {
    // Default to alphanumeric
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  }
  
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; length > i; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const CouponCode = () => {
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    id: null,
    code: generateRandomCode(8, 'string'), 
    discountType: 'percentage',
    discountValue: '',
    minPurchaseAmount: '',
    startDate: '',
    expiryDate: '',
    usageLimit: '',
    status: 'active',
    couponType: 'string',
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoupons = async () => {
      const querySnapshot = await getDocs(collection(db, 'coupons'));
      const couponList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCoupons(couponList);
    };

    fetchCoupons();
  }, []);

  const handleCouponClick = (couponId) => {
    navigate(`/dashboard/coupons/${couponId}`); // Adjusted to use the correct route
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'couponType') {
      setNewCoupon({
        ...newCoupon,
        [name]: value,
        code: generateRandomCode(8, value),
      });
    } else {
      setNewCoupon({
        ...newCoupon,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newCoupon.id) {
        const couponRef = doc(db, 'coupons', newCoupon.id);
        await updateDoc(couponRef, newCoupon);
    } else {
        const docRef = await addDoc(collection(db, 'coupons'), newCoupon);
        const newCouponWithId = { ...newCoupon, id: docRef.id };
        await updateDoc(doc(db, 'coupons', docRef.id), newCouponWithId);
    }
    
    setNewCoupon({
        id: null,
        code: generateRandomCode(8, 'string'),
        discountType: 'percentage',
        discountValue: '',
        minPurchaseAmount: '',
        startDate: '',
        expiryDate: '',
        usageLimit: '',
        status: 'active',
        couponType: 'string',
    });

    const querySnapshot = await getDocs(collection(db, 'coupons'));
    const couponList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCoupons(couponList);
  };

  const handleEdit = (coupon) => {
    setNewCoupon({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchaseAmount: coupon.minPurchaseAmount,
      startDate: coupon.startDate,
      expiryDate: coupon.expiryDate,
      usageLimit: coupon.usageLimit,
      status: coupon.status,
      couponType: coupon.couponType,
    });
  };

  const handleDelete = async (couponId) => {
    await deleteDoc(doc(db, 'coupons', couponId));
    setCoupons(coupons.filter((coupon) => coupon.id !== couponId));
  };

  const toggleStatus = async (couponId, currentStatus) => {
    const couponRef = doc(db, 'coupons', couponId);
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await updateDoc(couponRef, { status: newStatus });
    setCoupons((prevCoupons) =>
      prevCoupons.map((coupon) =>
        coupon.id === couponId ? { ...coupon, status: newStatus } : coupon
      )
    );
  };

  return (
    <div className="coupon-code-container unique-coupon-code-container">
      <header className="unique-coupon-header">
        <h1 className="unique-coupon-title">Coupons</h1>
      </header>

      <div className="coupon-form unique-coupon-form">
        <div className="form-row unique-form-row">
          {/* Coupon Type and Coupon Code */}
          <label className="unique-form-label">Coupon</label>
          <div className="coupon-input-group combined-input">
            <select name="couponType" value={newCoupon.couponType} onChange={handleChange} className="combined-select">
              <option value="string">🔤</option>
              <option value="numeric">🔢</option>
            </select>
            <input type="text" name="code" value={newCoupon.code} readOnly className="combined-input-field" />
          </div>
          
          <label className="unique-form-label">Start Time</label>
          <input type="date" name="startDate" value={newCoupon.startDate} onChange={handleChange} className="unique-form-input" />
          
          <label className="unique-form-label">End Time</label>
          <input type="date" name="expiryDate" value={newCoupon.expiryDate} onChange={handleChange} className="unique-form-input" />
          
          {/* Discount Type and Discount Value */}
          <label className="unique-form-label">Discount</label>
          <div className="discount-input-group combined-input">
            <select name="discountType" value={newCoupon.discountType} onChange={handleChange} className="combined-select">
              <option value="percentage">%</option>
              <option value="fixed">₹</option>
            </select>
            <input type="text" name="discountValue" value={newCoupon.discountValue} placeholder="Discount Value" onChange={handleChange} className="combined-input-field" />
          </div>
        </div>
        <button onClick={handleSubmit} className="create-coupon-btn unique-create-coupon-btn">
          {newCoupon.id ? 'Update Coupon' : 'Create Coupon'}
        </button>
      </div>

      <div className="coupon-list unique-coupon-list">
        <table className="unique-coupon-table">
          <thead className="unique-coupon-thead">
            <tr>
              <th className="unique-coupon-th">Coupon Code</th>
              <th className="unique-coupon-th">Start Date</th>
              <th className="unique-coupon-th">Status</th>
              <th className="unique-coupon-th">End Date</th>
              <th className="unique-coupon-th">Discount</th>
              <th className="unique-coupon-th">Actions</th>
            </tr>
          </thead>
          <tbody className="unique-coupon-tbody">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="unique-coupon-tr" onClick={() => handleCouponClick(coupon.id)}>
                <td className="unique-coupon-td">{coupon.code}</td>
                <td className="unique-coupon-td">{coupon.startDate}</td>
                <td className="unique-coupon-td">
                  <button
                    className={`status-toggle-btn unique-status-toggle-btn ${coupon.status}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(coupon.id, coupon.status);
                    }}
                  >
                    {coupon.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="unique-coupon-td">{coupon.expiryDate}</td>
                <td className="unique-coupon-td">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                </td>
                <td className="unique-coupon-td">
                  <button className="edit-btn unique-edit-btn" onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(coupon);
                  }}>Edit</button>
                  <button className="delete-btn unique-delete-btn" onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(coupon.id);
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponCode;
