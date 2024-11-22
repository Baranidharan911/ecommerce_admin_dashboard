import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';  // Update the import path as per your project structure
import '../styles/NavBarForm.css';  // Update the import path as per your project structure

const NavBarForm = () => {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState(
        Array(7).fill().map(() => ({ text: '', categories: [''] }))
    );

    useEffect(() => {
        const fetchCategories = async () => {
            const categoriesCollection = collection(db, 'categories');
            const categorySnapshot = await getDocs(categoriesCollection);
            const categoryList = categorySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(categoryList);
        };

        const fetchHashTags = async () => {
            const hashTagsCollection = collection(db, 'hashTags');
            const hashTagsSnapshot = await getDocs(hashTagsCollection);
            const updatedFormData = Array(7).fill().map(() => ({ text: '', categories: [''] }));

            hashTagsSnapshot.docs.forEach((doc) => {
                const data = doc.data();
                const index = parseInt(data.hash_tag_id.split('_')[1]) - 1;
                if (index >= 0 && index < 7) {
                    updatedFormData[index] = {
                        text: data.tag_name || '',
                        categories: data.category_ids || [''],
                    };
                }
            });

            setFormData(updatedFormData);
        };

        fetchCategories();
        fetchHashTags();
    }, []);

    const handleInputChange = (index, event) => {
        const updatedFormData = [...formData];
        updatedFormData[index].text = event.target.value;
        setFormData(updatedFormData);
    };

    const handleSelectChange = (fieldIndex, selectIndex, event) => {
        const updatedFormData = [...formData];
        updatedFormData[fieldIndex].categories[selectIndex] = event.target.value;
        setFormData(updatedFormData);
    };

    const handleAddMoreSelect = (fieldIndex) => {
        const updatedFormData = [...formData];
        updatedFormData[fieldIndex] = {
            ...updatedFormData[fieldIndex],
            categories: [...updatedFormData[fieldIndex].categories, '']
        };
        setFormData(updatedFormData);
    };

    const handleRemoveSelect = async (fieldIndex, selectIndex) => {
        const updatedFormData = [...formData];
        const categoryToRemove = updatedFormData[fieldIndex].categories[selectIndex];

        if (updatedFormData[fieldIndex].categories.length > 1) {
            updatedFormData[fieldIndex].categories.splice(selectIndex, 1);
            setFormData(updatedFormData);

            const tagDocRef = doc(db, "hashTags", `tag_${fieldIndex + 1}`);
            const tagDoc = await getDoc(tagDocRef);

            if (tagDoc.exists()) {
                const existingCategories = tagDoc.data().category_ids;
                const updatedCategories = existingCategories.filter(cat => cat !== categoryToRemove);

                await updateDoc(tagDocRef, {
                    category_ids: updatedCategories
                });
            }
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            for (const [index, field] of formData.entries()) {
                const newTag = {
                    hash_tag_id: `tag_${index + 1}`,
                    tag_name: field.text,
                    category_ids: field.categories,
                    created_at: serverTimestamp(),
                };

                const tagDocRef = doc(db, "hashTags", newTag.hash_tag_id);
                const tagDoc = await getDoc(tagDocRef);

                if (tagDoc.exists()) {
                    await updateDoc(tagDocRef, newTag);
                } else {
                    await setDoc(tagDocRef, newTag);
                }
            }

            console.log('HashTags successfully added/updated in Firestore.');

        } catch (error) {
            console.error("Error adding/updating hashTags: ", error);
        }
    };

    return (
        <form className="navbar-form-container" onSubmit={handleSubmit}>
            <h1>Add NavBar Tags</h1>
            {formData.map((field, fieldIndex) => (
                <div className="navbar-form-field" key={fieldIndex}>
                    <h2>Tag Name</h2>
                    <input
                        type="text"
                        value={field.text}
                        onChange={(event) => handleInputChange(fieldIndex, event)}
                        placeholder={`Tag ${fieldIndex + 1}`}
                        className="navbar-form-input"
                    />
                    <h3>Select Categories</h3>
                    {field.categories.map((category, selectIndex) => (
                        <div key={selectIndex} className="navbar-form-select-group">
                            <select
                                value={category}
                                onChange={(event) => handleSelectChange(fieldIndex, selectIndex, event)}
                                className="navbar-form-select"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => handleRemoveSelect(fieldIndex, selectIndex)}
                                className="navbar-form-remove-button"
                                disabled={field.categories.length === 1}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => handleAddMoreSelect(fieldIndex)}
                        className="navbar-form-add-more-button"
                    >
                        Add More
                    </button>
                </div>
            ))}
            <button type="submit" className="navbar-form-submit-button">
                Update
            </button>
        </form>
    );
};

export default NavBarForm;
