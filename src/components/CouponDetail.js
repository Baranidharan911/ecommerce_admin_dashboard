import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/CouponDetail.css';

const CouponDetail = () => {
  const { couponId } = useParams();
  const [coupon, setCoupon] = useState(null);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchCouponDetails = async () => {
      setLoading(true);
      try {
        const couponRef = doc(db, 'coupons', couponId);
        const couponSnap = await getDoc(couponRef);

        if (couponSnap.exists()) {
          setCoupon(couponSnap.data());
        } else {
          console.log('No such coupon!');
        }

        // Fetch usage details and user data
        const q = query(collection(db, 'coupon_usage'), where('coupon_code', '==', couponSnap.data().code));
        const usageSnapshot = await getDocs(q);
        const usageData = await Promise.all(
          usageSnapshot.docs.map(async (usageDoc) => {
            const usageItem = usageDoc.data();
            // Fetch user data from the 'users' collection
            const userRef = doc(db, 'users', usageItem.user_id);
            const userSnap = await getDoc(userRef);
            const userName = userSnap.exists() ? userSnap.data().firstName : 'Unknown User';

            return {
              id: usageDoc.id, // use `usageDoc` here instead of `doc`
              user_id: usageItem.user_id,
              user_name: userName,
              used_on: usageItem.used_on,
            };
          })
        );
        setUsage(usageData);
      } catch (error) {
        console.error('Error fetching coupon details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCouponDetails();
  }, [couponId]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    setUsage(usage.slice().sort((a, b) => (sortOrder === 'asc' ? a.used_on.seconds - b.used_on.seconds : b.used_on.seconds - a.used_on.seconds)));
  };

  const filteredUsage = usage.filter((use) =>
    use.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    use.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!coupon) {
    return <p>Coupon not found.</p>;
  }

  return (
    <div className="coupon-detail-container">
      <div className="coupon-detail-card">
        <h1>Coupon Code: {coupon.code}</h1>
        <div className="coupon-summary">
          <p>Discount: {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</p>
          <p>Status: <span className={coupon.status === 'active' ? 'active-status' : 'inactive-status'}>{coupon.status}</span></p>
          <p>Start Date: {coupon.startDate}</p>
          <p>End Date: {coupon.expiryDate}</p>
        </div>
      </div>

      <div className="usage-details">
        <h2>Usage Details</h2>
        <div className="search-sort">
          <input
            type="text"
            placeholder="Search by user name or ID..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button onClick={handleSortChange} className="sort-button">
            Sort by Date {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {filteredUsage.length > 0 ? (
          <table className="usage-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>User Name</th>
                <th>Used On</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsage.map((use) => (
                <tr key={use.id}>
                  <td>{use.user_id}</td>
                  <td>{use.user_name}</td>
                  <td>{new Date(use.used_on.seconds * 1000).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No usage data available for this coupon.</p>
        )}
      </div>
    </div>
  );
};

export default CouponDetail;
