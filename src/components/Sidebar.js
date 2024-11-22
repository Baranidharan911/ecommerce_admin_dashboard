import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import CouponIcon from '@mui/icons-material/ConfirmationNumber';
import CategoryIcon from '@mui/icons-material/Category';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ListIcon from '@mui/icons-material/List';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SettingsIcon from '@mui/icons-material/Settings';
import LabelIcon from '@mui/icons-material/Label'; // Icon for NavBarForm

const Sidebar = ({ isOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav>
        <ul>
          <li className="menu-title">MAIN MENU</li>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            >
              <DashboardIcon />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/order-management"
              className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            >
              <ShoppingCartIcon />
              Order Management
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/customers"
              className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            >
              <PeopleIcon />
              Customers
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/coupon-code"
              className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            >
              <CouponIcon />
              Coupon Code
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/category"
              className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            >
              <CategoryIcon />
              Categories
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/transaction"
              className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            >
              <ReceiptIcon />
              Transaction
            </NavLink>
          </li>

          <li className="menu-title">PRODUCTS</li>
          <li>
            <NavLink
              to="/dashboard/add-products"  
              className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            >
              <AddBoxIcon />
              Add Products
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/product-list"
              className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            >
              <ListIcon />
              Product List
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/product-parameters"
              className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            >
              <SettingsIcon />
              Product Parameters
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/navbar-tags"
              className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            >
              <LabelIcon />
              NavBar Tags
            </NavLink>
          </li>

          <li className="menu-title">ADMIN</li>
          <li>
            <NavLink
              to="/dashboard/manage-admins"
              className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            >
              <AdminPanelSettingsIcon />
              Manage Admins
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/admin-roles"
              className={({ isActive }) => (isActive ? 'menu-item active' : 'menu-item')}
            >
              <AssignmentIndIcon />
              Admin Roles
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
