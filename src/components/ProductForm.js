import React, { useState, useEffect } from "react";
import { collection, setDoc, getDocs, doc, serverTimestamp, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { v4 as uuidv4 } from 'uuid';
import { IoMdArrowDropdownCircle, IoMdArrowDropupCircle } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import '../styles/ProductForm.css';

const ProductForm = () => {
  const { id: productId } = useParams();  // Get productId from URL params
  const navigate = useNavigate();
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [productImages, setProductImages] = useState([]);
  const [productParameters, setProductParameters] = useState({});
  const [productRequirements, setProductRequirements] = useState({
    materials: [],
    lamination: [],
    orientation: [],
    printing_location: [],
    size: [],
    fold_type: [],
    document_type: [],
    bind_type: [],
    cover_material: [],
    lamination_cover: [],
    pages: [],
    paper_type: [],
    inner_page_print_type: [],
    color: [],
    quantity: [],
  });

  const [openSections, setOpenSections] = useState({
    materials: false,
    lamination: false,
    orientation: false,
    printing_location: false,
    size: false,
    fold_type: false,
    document_type: false,
    bind_type: false,
    cover_material: false,
    lamination_cover: false,
    pages: false,
    paper_type: false,
    inner_page_print_type: false,
    color: false,
    quantity: false,
  });

  const [overviews, setOverviews] = useState([{ title: "", text: "", image: null, preview: null }]);
  const [options, setOptions] = useState([{ title: "", text: "", image: null, preview: null }]);
  const [designs, setDesigns] = useState([{ title: "", text: "", image: null, preview: null }]);

  const [isProductRequirementsOpen, setIsProductRequirementsOpen] = useState(false);

  // New states for preview modals
  const [overviewPreviewImage, setOverviewPreviewImage] = useState(null);
  const [optionPreviewImage, setOptionPreviewImage] = useState(null);
  const [designPreviewImage, setDesignPreviewImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // Track current image index

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const categoryList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    const fetchProductParameters = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "productParameters"));
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          setProductParameters(doc.data());
        } else {
          console.error("No documents found in ProductParameters collection.");
        }
      } catch (error) {
        console.error("Error fetching product parameters: ", error);
      }
    };

    const loadProductData = async () => {
      if (productId) {
        const productDoc = await getDoc(doc(db, "productData", productId));
        if (productDoc.exists()) {
          const productData = productDoc.data();
          setProductName(productData.product_name);
          setPrice(productData.price);
          setSelectedCategoryId(productData.category_id);
          setSelectedCategoryName(productData.category_name || "");
          setDescription(productData.description);
          
          // Load existing product images
          const productImages = productData.product_images || [];
          setProductImages(productImages.map(imageUrl => ({
            preview: imageUrl,
            file: null // No file associated since it's already uploaded
          })));
          
          // Load existing Overviews images
          const loadedOverviews = productData.overviews || [];
          setOverviews(loadedOverviews.map(entry => ({
            ...entry,
            preview: entry.image,
            image: null, // No file associated since it's already uploaded
          })));
          
          // Load existing Options images
          const loadedOptions = productData.options || [];
          setOptions(loadedOptions.map(entry => ({
            ...entry,
            preview: entry.image,
            image: null, // No file associated since it's already uploaded
          })));
    
          // Load existing Designs images
          const loadedDesigns = productData.designs || [];
          setDesigns(loadedDesigns.map(entry => ({
            ...entry,
            preview: entry.image,
            image: null, // No file associated since it's already uploaded
          })));
    
          setProductRequirements(productData.product_requirements || {});
        }
      }
    };

    fetchCategories();
    fetchProductParameters();

    if (productId) {
      loadProductData();  // Load data if editing an existing product
    }
  }, [productId]);

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    const selectedCategory = categories.find(
      (category) => category.id === selectedCategoryId
    );
    setSelectedCategoryId(selectedCategoryId);
    setSelectedCategoryName(selectedCategory?.category_name || "");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newProductImages = [...productImages, ...files.map(file => ({ file, preview: URL.createObjectURL(file) }))];
    setProductImages(newProductImages);
  };

  const removeImageField = (index, type) => {
    if (type === 'productImages') {
      const newProductImages = productImages.filter((_, i) => i !== index);
      setProductImages(newProductImages);
    } else if (type === 'overviews') {
      const newOverviews = overviews.filter((_, i) => i !== index);
      setOverviews(newOverviews);
    } else if (type === 'options') {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    } else if ( type === 'designs') {
      const newDesigns = designs.filter((_, i) => i !== index);
      setDesigns(newDesigns);
    }
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;

    setProductRequirements((prev) => {
      let newValues = [];
      if (checked) {
        newValues = [...prev[field], value];
      } else {
        newValues = prev[field].filter((item) => item !== value);
      }

      if (value === "null") {
        newValues = checked ? [] : prev[field];
      } else {
        newValues = newValues.filter((item) => item !== "null");
      }
      return {
        ...prev,
        [field]: field === "quantity" ? newValues.map(Number) : newValues,
      };
    });
  };

  const handleDropdownToggle = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleOverviewChange = (index, field, value) => {
    const newOverviews = [...overviews];
    newOverviews[index][field] = value;
    setOverviews(newOverviews);
  };

  const handleOptionsChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleDesignsChange = (index, field, value) => {
    const newDesigns = [...designs];
    newDesigns[index][field] = value;
    setDesigns(newDesigns);
  };

  const addOverviewField = () => {
    setOverviews([...overviews, { title: "", text: "", image: null, preview: null }]);
  };

  const addOptionsField = () => {
    setOptions([...options, { title: "", text: "", image: null, preview: null }]);
  };

  const addDesignsField = () => {
    setDesigns([...designs, { title: "", text: "", image: null, preview: null }]);
  };

  const uploadImageAndGetUrl = async (file, path) => {
    if (file) {
      const uniqueFileName = `${uuidv4()}-${file.name}`;
      const imageRef = ref(storage, `${path}/${uniqueFileName}`);
      const uploadTask = await uploadBytesResumable(imageRef, file);
      const downloadUrl = await getDownloadURL(uploadTask.ref);
      return downloadUrl;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const imageUrls = await Promise.all(
        productImages.map(async (imageObj) => {
          if (imageObj.file) {
            const uniqueFileName = `${uuidv4()}-${imageObj.file.name}`;
            const imageRef = ref(
              storage,
              `${selectedCategoryName}/${productName}/${uniqueFileName}`
            );
            const uploadTask = await uploadBytesResumable(imageRef, imageObj.file);
            const downloadUrl = await getDownloadURL(uploadTask.ref);
            return downloadUrl;
          }
          return imageObj.preview; // Return existing image URL if no new file
        })
      ).then((urls) => urls.filter((url) => url !== null));
  
      const descriptionId = productName.toLowerCase().replace(/\s+/g, '-');
  
      const productData = {
        product_name: productName || '', // Ensure this is not undefined
        price: parseFloat(price) || 0,  // Ensure this is a number
        category_id: selectedCategoryId || '',
        description_id: descriptionId || '',
        product_images: imageUrls,
        product_requirements: productRequirements,
        overviews: await Promise.all(
          overviews.map(async (entry) => ({
            ...entry,
            image: entry.image
              ? await uploadImageAndGetUrl(
                  entry.image,
                  `${descriptionId}/overviews`
                )
              : entry.preview, // Move the image URL from preview to image field
          }))
        ),
        options: await Promise.all(
          options.map(async (entry) => ({
            ...entry,
            image: entry.image
              ? await uploadImageAndGetUrl(entry.image, `${descriptionId}/options`)
              : entry.preview, // Move the image URL from preview to image field
          }))
        ),
        designs: await Promise.all(
          designs.map(async (entry) => ({
            ...entry,
            image: entry.image
              ? await uploadImageAndGetUrl(entry.image, `${descriptionId}/designs`)
              : entry.preview, // Move the image URL from preview to image field
          }))
        ),
        description: description || '', // Ensure this is not undefined
      };
  
      if (productId) {
        await updateDoc(doc(db, "products", productId), {
          product_name: productData.product_name,
          price: productData.price,
          category_id: productData.category_id,
          description_id: productData.description_id,
          product_images: productData.product_images,
          description: productData.description,
        });
  
        await updateDoc(doc(db, "productData", productId), {
          ...productData,
          created_at: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, "products", descriptionId), {
          product_name: productData.product_name,
          price: productData.price,
          category_id: productData.category_id,
          description_id: productData.description_id,
          product_images: productData.product_images,
          description: productData.description,
        });
  
        await setDoc(doc(db, "productData", descriptionId), {
          ...productData,
          created_at: serverTimestamp(),
        });
      }
  
      alert("Product and all related data added/updated successfully!");
  
      navigate("/dashboard/product-list");
  
    } catch (e) {
      console.error("Error adding/updating product and description: ", e);
    }
  };

  const handlePreviewImage = (imageUrl, index, type) => {
    if (type === 'productImages') {
      setPreviewImage(imageUrl);
      setCurrentImageIndex(index);
    } else if (type === 'overviews') {
      setOverviewPreviewImage(imageUrl);
    } else if (type === 'options') {
      setOptionPreviewImage(imageUrl);
    } else if (type === 'designs') {
      setDesignPreviewImage(imageUrl);
    }
  };

  const handleNextImage = () => {
    if (previewImage) {
      const totalImages = productImages.length;
      if (currentImageIndex < totalImages - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
        setPreviewImage(productImages[currentImageIndex + 1].preview);
      }
    }
  };

  const handlePreviousImage = () => {
    if (previewImage && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      setPreviewImage(productImages[currentImageIndex - 1].preview);
    }
  };

  const renderCheckboxes = (field, label) => (
    <div className="dropdown-section">
      <button
        type="button"
        className="dropdown-button"
        onClick={() => handleDropdownToggle(field)}
      >
        {label}
      </button>
      {openSections[field] && (
        <div className="dropdown-content checkbox-group">
          {productParameters[field]?.map((item, index) => (
            <label key={index}>
              <input
                type="checkbox"
                value={item}
                checked={productRequirements[field].includes(item)}
                onChange={(e) => handleCheckboxChange(e, field)}
              />
              {item}
            </label>
          ))}
          <label>
            <input
              type="checkbox"
              value="null"
              checked={productRequirements[field].length === 0}
              onChange={(e) => handleCheckboxChange(e, field)}
            />
            No Data
          </label>
        </div>
      )}
    </div>
  );

  const renderImageTextFields = (entries, setEntries, handleChange, label, addField, type) => (
    <>
      <div className="section-title">{label}</div>
      {entries.map((entry, index) => (
        <div key={index} className="image-text-entry">
          <label>
            Title:
            <input
              type="text"
              value={entry.title}
              className="image-text-title-input"
              onChange={(e) => handleChange(index, "title", e.target.value)}
            />
          </label>
          <label>
            Text:
            <textarea
              value={entry.text}
              className="image-text-textarea"
              onChange={(e) => handleChange(index, "text", e.target.value)}
            />
          </label>
          <label>
            Image:
            <div
              className="image-drop-area"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  handleChange(index, "image", file);
                  const preview = URL.createObjectURL(file);
                  setEntries((prev) => {
                    const newEntries = [...prev];
                    newEntries[index].preview = preview;
                    return newEntries;
                  });
                }
              }}
            >
              <span>Click to upload or drag and drop image</span>
              <input
                id={`file-upload-${type}-${index}`}
                type="file"
                className="image-text-image-input"
                style={{ display: 'none' }}
                onClick={(e) => {
                  e.target.value = null; // Clear the previous file selection
                }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleChange(index, "image", file);
                    const preview = URL.createObjectURL(file);
                    setEntries((prev) => {
                      const newEntries = [...prev];
                      newEntries[index].preview = preview;
                      return newEntries;
                    });
                  }
                }}
              />
            </div>
          </label>
  
          {/* Display Preview Image Outside the Drop Area */}
          {entry.preview && (
            <div className="uploaded-images">
              <div className="image-container">
                <img
                  src={entry.preview}
                  alt="Preview"
                  className="image-preview"
                  onClick={() => handlePreviewImage(entry.preview, index, type)}
                />
                <div className="image-options">
                  {(entries.length > 1) && (
                    <button
                      onClick={() => removeImageField(index, type)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
  
          {/* Add Remove Button for Each Entry */}
          {(entries.length > 1) && (
            <button
              type="button"
              className="remove-button"
              onClick={() => removeImageField(index, type)}
            >
              Remove {label} Entry
            </button>
          )}
        </div>
      ))}
      <button type="button" className="add-more-button" onClick={addField}>
        Add More {label}
      </button>
    </>
  );  

  const renderProductImageFields = () => (
    <>
      <div className="section-title">Product Images</div>
      <div className="image-upload-container">
        <div
          className="upload-area"
          onClick={() => document.getElementById('file-upload').click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleImageChange(e);
          }}
        >
          <span>Click to upload or drag and drop images</span>
          <input
            id="file-upload"
            type="file"
            multiple
            className="form-control border-0"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
        </div>
        <div className="uploaded-images">
          {productImages.map((imageObj, index) => (
            <div key={index} className="image-area mt-4">
              <img
                id={`imageResult-${index}`}
                src={imageObj.preview} // Display the image preview URL
                alt=""
                className="img-fluid rounded shadow-sm mx-auto d-block"
                onClick={() => handlePreviewImage(imageObj.preview, index, 'productImages')} // Pass the type 'productImages'
              />
              <button onClick={() => removeImageField(index, 'productImages')} className="btn btn-danger mt-2">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* First Row */}
        <div className="row">
          <div className="product-info-section form-section">
            <div className="section-title">Product Information</div>
            {/* Product Information Fields */}
            <div className="form-group">
              <label>
                Product Name:
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                  className="product-info-input"
                />
              </label>
              <label>
                Price:
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="product-info-input"
                />
              </label>
              <label>
                Category:
                <select
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                  required
                  className="product-info-select"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Product Description:
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="product-info-textarea"
                />
              </label>
            </div>
          </div>

          <div className="product-images-section form-section">
            {renderProductImageFields()}
          </div>
        </div>

        {/* Second Row */}
        <div className="row">
          <div className="overviews-section form-section">
            {renderImageTextFields(overviews, setOverviews, handleOverviewChange, "Overviews", addOverviewField, 'overviews')}
          </div>

          <div className="options-section form-section">
            {renderImageTextFields(options, setOptions, handleOptionsChange, "Options", addOptionsField, 'options')}
          </div>
        </div>

        {/* Third Row */}
        <div className="row">
          <div className="design-section form-section">
            {renderImageTextFields(designs, setDesigns, handleDesignsChange, "Designs", addDesignsField, 'designs')}
          </div>
        </div>

        {/* Fourth Row */}
        <div className="row">
          <div className="requirements-section form-section">
            <div
              className="section-title dropdown-title"
              onClick={() => setIsProductRequirementsOpen(!isProductRequirementsOpen)}
            >
              Product Requirements
              {isProductRequirementsOpen ? (
                <IoMdArrowDropupCircle className="dropdown-arrow-icon" />
              ) : (
                <IoMdArrowDropdownCircle className="dropdown-arrow-icon" />
              )}
            </div>
            <div className={`requirements-content ${isProductRequirementsOpen ? 'show' : ''}`}>
              {Object.keys(productParameters).length > 0 && (
                <>
                  {renderCheckboxes("materials", "Materials")}
                  {renderCheckboxes("lamination", "Lamination")}
                  {renderCheckboxes("orientation", "Orientation")}
                  {renderCheckboxes("printing_location", "Printing Location")}
                  {renderCheckboxes("size", "Size")}
                  {renderCheckboxes("fold_type", "Fold Type")}
                  {renderCheckboxes("document_type", "Document Type")}
                  {renderCheckboxes("bind_type", "Bind Type")}
                  {renderCheckboxes("cover_material", "Cover Material")}
                  {renderCheckboxes("lamination_cover", "Lamination Cover")}
                  {renderCheckboxes("pages", "Pages")}
                  {renderCheckboxes("paper_type", "Paper Type")}
                  {renderCheckboxes("inner_page_print_type", "Inner Page Print Type")}
                  {renderCheckboxes("color", "Color")}
                  {renderCheckboxes("quantity", "Quantity")}
                </>
              )}
            </div>
          </div>
        </div>

        <button type="submit" className="submit-button">
          {productId ? 'Update Product' : 'Add Product'}
        </button>
      </form>

      {/* Preview modals */}
      {previewImage && (
        <div className="image-preview-modal" onClick={() => setPreviewImage(null)}>
          <div className="image-preview-content">
            <img src={previewImage} alt="Preview" className="image-preview-large" />
            {/* Left arrow for previous image */}
            {currentImageIndex > 0 && (
              <button className="prev-image-button" onClick={(e) => {
                e.stopPropagation(); // Prevent closing the modal when clicking the button
                handlePreviousImage();
              }}>
                &larr;
              </button>
            )}
            {/* Right arrow for next image */}
            {currentImageIndex < productImages.length - 1 && (
              <button className="next-image-button" onClick={(e) => {
                e.stopPropagation(); // Prevent closing the modal when clicking the button
                handleNextImage();
              }}>
                &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Overview preview modal */}
      {overviewPreviewImage && (
        <div className="image-preview-modal" onClick={() => setOverviewPreviewImage(null)}>
          <div className="image-preview-content">
            <img src={overviewPreviewImage} alt="Overview Preview" className="image-preview-large" />
          </div>
        </div>
      )}

      {/* Option preview modal */}
      {optionPreviewImage && (
        <div className="image-preview-modal" onClick={() => setOptionPreviewImage(null)}>
          <div className="image-preview-content">
            <img src={optionPreviewImage} alt="Option Preview" className="image-preview-large" />
          </div>
        </div>
      )}

      {/* Design preview modal */}
      {designPreviewImage && (
        <div className="image-preview-modal" onClick={() => setDesignPreviewImage(null)}>
          <div className="image-preview-content">
            <img src={designPreviewImage} alt="Design Preview" className="image-preview-large" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
