import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase/config'; 
import '../styles/Header.css';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [adminProfile, setAdminProfile] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Fetch admin profile data from Firestore
    const fetchAdminProfile = async (uid) => {
      const adminRef = doc(db, 'admin', uid); // Assuming the profile data is in the 'admin' collection
      const adminDoc = await getDoc(adminRef);
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        setAdminProfile(adminData);
      }
    };

    // Listen for auth state changes to fetch admin info
    const unsubscribe = onAuthStateChanged(auth, (currentAdmin) => {
      if (currentAdmin) {
        fetchAdminProfile(currentAdmin.uid);
      } else {
        setAdminProfile(null);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const notificationsRef = collection(db, 'notifications');
      const notificationsQuery = query(notificationsRef, orderBy('time', 'desc'));

      const unsubscribe = onSnapshot(notificationsQuery, async (snapshot) => {
        if (!snapshot.empty) {
          const notificationsData = await Promise.all(
            snapshot.docs.map(async (notificationDoc) => {
              const notification = notificationDoc.data();
              const userRef = doc(db, 'users', notification.user_id);
              const userDoc = await getDoc(userRef);
              const userName = userDoc.exists() ? userDoc.data().firstName : 'Unknown User';
              return {
                id: notificationDoc.id,
                ...notification,
                user_name: userName,
              };
            })
          );
          setNotifications(notificationsData);
        } else {
          console.log("No notifications found.");
        }
      });

      return () => unsubscribe();
    };

    fetchNotifications();
  }, []);

  const toggleNotificationDropdown = async () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfileDropdownOpen(false);

    if (!isNotificationOpen) {
      // Update the status of notifications to "Viewed"
      await Promise.all(
        notifications.map(async (notification) => {
          if (notification.status === 'New') {
            const notificationRef = doc(db, 'notifications', notification.id);
            await updateDoc(notificationRef, { status: 'Viewed' });
          }
        })
      );
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsNotificationOpen(false);
  };

  const handleViewAllNotifications = () => {
    setNotifications([]);
    setIsNotificationOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/dashboard/profile');
    setIsProfileDropdownOpen(false);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Firebase sign out
      setIsProfileDropdownOpen(false); // Close profile dropdown
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <button
          className={`menu ${isSidebarOpen ? 'opened' : ''}`}
          onClick={toggleSidebar}
          aria-label="Main Menu"
          aria-expanded={isSidebarOpen}
        >
          <svg width="40" height="40" viewBox="0 0 100 100">
            <path
              className="line line1"
              d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"
            />
            <path className="line line2" d="M 20,50 H 80" />
            <path
              className="line line3"
              d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"
            />
          </svg>
        </button>
        <div className="logo">
          <img id="logo" src={logo} alt="Logo" />
        </div>
        <div className="header-right">
          <Badge
            badgeContent={notifications.filter(notification => notification.status === 'New').length}
            color="error"
            className="notification-icon"
            onClick={toggleNotificationDropdown}
          >
            <NotificationsIcon />
          </Badge>
          {isNotificationOpen && (
            <div className="dropdown notification-dropdown">
              <div className="dropdown-header">
                <h4>Notifications ({notifications.length})</h4>
                <button className="view-all" onClick={handleViewAllNotifications}>View All</button>
              </div>
              <div className="dropdown-content">
                {notifications.map((notification) => (
                  <div key={notification.id} className="dropdown-item">
                    <div className="dropdown-item-content">
                      <div className="dropdown-item-text">
                        <p>{`Order #${notification.order_id} by ${notification.user_name} has been placed.`}</p>
                        <small>{new Date(notification.time.seconds * 1000).toLocaleTimeString()}</small>
                      </div>
                      {notification.status && (
                        <span className={`status-badge ${notification.status === 'New' ? 'new' : 'viewed'}`}>
                          {notification.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Avatar
            alt={adminProfile ? adminProfile.firstName : 'Admin Avatar'}
            src={adminProfile && adminProfile.profilePicture ? adminProfile.profilePicture : '/admin-avatar.jpg'} // Firestore profilePicture field
            className="avatar"
            onClick={toggleProfileDropdown}
          />
          {isProfileDropdownOpen && (
            <div className="dropdown profile-dropdown">
              <div className="profile-dropdown-header">
                <h4>Profile Options</h4>
              </div>
              <ul className="profile-dropdown-content">
                <li className="profile-dropdown-item" onClick={handleProfileClick}>
                  <FaUser className="profile-dropdown-icon" /> My Profile
                </li>
                <li className="profile-dropdown-item" onClick={handleLogout}>
                  <FaSignOutAlt className="profile-dropdown-icon" /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
