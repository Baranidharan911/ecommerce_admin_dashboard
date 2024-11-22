import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FaEdit } from 'react-icons/fa';
import { MdOutlineDiscount, MdCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import '../styles/ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState('');
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
  const [isDiscountPopupOpen, setIsDiscountPopupOpen] = useState(false);
  const [isRemoveDiscountPopupOpen, setIsRemoveDiscountPopupOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productToDiscount, setProductToDiscount] = useState(null);
  const [discountValue, setDiscountValue] = useState('');
  const navigate = useNavigate();

  const iconColors = {
    delete: '#ff6347',
    edit: '#1e90ff',
    discount: '#28a745',
  };

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = await Promise.all(
        querySnapshot.docs.map(async (productDoc) => {
          const productData = productDoc.data();
          const productDetailsDoc = await getDoc(doc(db, 'productData', productDoc.id));
          const productImages = productDetailsDoc.exists() ? productDetailsDoc.data().product_images : [];
          return {
            id: productDoc.id,
            ...productData,
            price: parseFloat(productData.price) || 0,
            originalPrice: parseFloat(productData.originalPrice) || parseFloat(productData.price) || 0,
            product_images: productImages,
            status: 'published',
          };
        })
      );
      setProducts(productsData);
      setLoading(false);
    };

    const fetchCategories = async () => {
      const categorySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = {};
      categorySnapshot.forEach((doc) => {
        categoriesData[doc.id] = doc.data().category_name;
      });
      setCategories(categoriesData);
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'products', productToDelete.id));
      await deleteDoc(doc(db, 'productData', productToDelete.id));
      setProducts(products.filter(product => product.id !== productToDelete.id));
      closeDeletePopup();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleApplyDiscount = async () => {
    if (!productToDiscount || !discountValue) return;
    const discountedPrice = productToDiscount.originalPrice - (productToDiscount.originalPrice * (discountValue / 100));
    try {
      // Update in 'products' collection
      await updateDoc(doc(db, 'products', productToDiscount.id), {
        price: discountedPrice,
        discount: discountValue,
      });

      // Update in 'productData' collection
      await updateDoc(doc(db, 'productData', productToDiscount.id), {
        price: discountedPrice,
        discount: discountValue,
      });

      setProducts(products.map(product => product.id === productToDiscount.id 
        ? { ...product, price: discountedPrice, discount: discountValue } 
        : product
      ));
      closeDiscountPopup();
    } catch (error) {
      console.error('Error applying discount:', error);
    }
  };

  const handleRemoveDiscount = async () => {
    if (!productToDiscount) return;
    try {
      // Update in 'products' collection
      await updateDoc(doc(db, 'products', productToDiscount.id), {
        price: productToDiscount.originalPrice,
        discount: 0,
      });

      // Update in 'productData' collection
      await updateDoc(doc(db, 'productData', productToDiscount.id), {
        price: productToDiscount.originalPrice,
        discount: 0,
      });

      setProducts(products.map(product => product.id === productToDiscount.id 
        ? { ...product, price: productToDiscount.originalPrice, discount: 0 } 
        : product
      ));
      closeRemoveDiscountPopup();
    } catch (error) {
      console.error('Error removing discount:', error);
    }
  };

  const openDeletePopup = (product) => {
    setProductToDelete(product);
    setIsDeletePopupOpen(true);
  };

  const openDiscountPopup = (product) => {
    setProductToDiscount(product);
    setDiscountValue(product.discount || '');
    setIsDiscountPopupOpen(true);
  };

  const openRemoveDiscountPopup = (product) => {
    setProductToDiscount(product);
    setIsRemoveDiscountPopupOpen(true);
  };

  const closeDeletePopup = () => {
    setIsDeletePopupOpen(false);
    setProductToDelete(null);
  };

  const closeDiscountPopup = () => {
    setIsDiscountPopupOpen(false);
    setProductToDiscount(null);
  };

  const closeRemoveDiscountPopup = () => {
    setIsRemoveDiscountPopupOpen(false);
    setProductToDiscount(null);
  };

  const handleEdit = (productId) => {
    navigate(`/dashboard/edit-product/${productId}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleSortChange = (e) => {
    setSortCriteria(e.target.value);
  };

  const filteredAndSortedProducts = () => {
    let filteredProducts = products.filter(product =>
      product.product_name.toLowerCase().includes(searchTerm)
    );

    if (sortCriteria === 'priceLowToHigh') {
      filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortCriteria === 'priceHighToLow') {
      filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
    }

    return filteredProducts;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <l-ring size="60" color="coral"></l-ring>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <h2 className="list-title">Product List</h2>

      <div className="search-filter-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            id="productSearchInput"
            className="product-search-input"
          />
          {searchTerm && (
            <FontAwesomeIcon 
              icon={faTimes} 
              className="clear-search-icon" 
              onClick={clearSearch} 
              title="Clear search"
            />
          )}
        </div>
        <select value={sortCriteria} onChange={handleSortChange} className="status-select">
          <option value="">Sort by</option>
          <option value="priceLowToHigh">Price: Low to High</option>
          <option value="priceHighToLow">Price: High to Low</option>
        </select>
      </div>

      <table className="product-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            <th>Status</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAndSortedProducts().map(product => (
            <tr key={product.id} className="clickable-row">
              <td>
                <div className="product-name">
                  <img 
                    src={product.product_images?.[0] || '/path/to/default-image.png'} 
                    alt={product.product_name} 
                    className="product-image" 
                  />
                  {product.product_name}
                </div>
              </td>
              <td>{categories[product.category_id] || 'Unknown Category'}</td>
              <td>{product.status === 'published' ? 'Published' : 'Unknown'}</td>
              <td>
                ₹{parseFloat(product.price).toFixed(2)}
                {product.discount > 0 && (
                  <>
                    <span className="original-price"> ₹{parseFloat(product.originalPrice).toFixed(2)}</span>
                    <MdCancel 
                      className="remove-discount-icon" 
                      title="Remove Discount" 
                      onClick={() => openRemoveDiscountPopup(product)} 
                    />
                  </>
                )}
              </td>
              <td>
                <button 
                  className="icon-button"
                  onClick={() => openDeletePopup(product)}
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faTrash} style={{ color: iconColors.delete }} />
                </button>
                <button 
                  className="icon-button"
                  onClick={() => handleEdit(product.id)}
                  title="Edit"
                >
                  <FaEdit style={{ color: iconColors.edit }} />
                </button>
                <button 
                  className="icon-button"
                  onClick={() => openDiscountPopup(product)}
                  title="Apply Discount"
                >
                  <MdOutlineDiscount style={{ color: iconColors.discount }} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isDeletePopupOpen && (
        <div className="delete-popup-overlay">
          <div className="delete-popup">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {productToDelete?.product_name}?</p>
            <div className="modal-actions">
              <button className="action-button delete-button" onClick={handleDelete}>Delete</button>
              <button className="action-button cancel-button" onClick={closeDeletePopup}>Cancel</button>
            </div>
            <button className="close-popup" onClick={closeDeletePopup}>Close</button>
          </div>
        </div>
      )}

      {isDiscountPopupOpen && (
        <div className="discount-popup-overlay">
          <div className="discount-popup">
            <h3>Apply Discount</h3>
            <p>Enter discount percentage:</p>
            <input 
              type="number" 
              min="0" 
              max="100" 
              step="1" 
              value={discountValue} 
              onChange={(e) => setDiscountValue(e.target.value)} 
            />
            <div className="modal-actions">
              <button className="action-button save-button" onClick={handleApplyDiscount}>Apply</button>
              <button className="action-button cancel-button" onClick={closeDiscountPopup}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isRemoveDiscountPopupOpen && (
        <div className="remove-discount-popup-overlay">
          <div className="remove-discount-popup">
            <h3>Remove Discount</h3>
            <p>Are you sure you want to remove the discount for {productToDiscount?.product_name}?</p>
            <div className="modal-actions">
              <button className="action-button delete-button" onClick={handleRemoveDiscount}>Remove</button>
              <button className="action-button cancel-button" onClick={closeRemoveDiscountPopup}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
