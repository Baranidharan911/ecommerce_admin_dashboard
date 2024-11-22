import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import '../styles/CategoryForm.css';

const CategoryForm = () => {
    const [category, setCategory] = useState({ name: '', description: '' });
    const [categories, setCategories] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [categoryId, setCategoryId] = useState(null); // State to hold categoryId

    useEffect(() => {
        const collectionRef = collection(db, 'categories');
        const unsubscribe = onSnapshot(collectionRef, snapshot => {
            let fetchedCategories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort categories alphabetically by name
            fetchedCategories = fetchedCategories.sort((a, b) => a.category_name.localeCompare(b.category_name));
            setCategories(fetchedCategories);
        }, err => {
            console.error('Failed to fetch categories:', err);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const storedCategoryId = localStorage.getItem('category_id');
        if (storedCategoryId) {
            setCategoryId(storedCategoryId);
            fetchCategoryData(storedCategoryId);
        }
    }, []);

    const fetchCategoryData = async (id) => {
        const docRef = doc(db, 'categories', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setCategory({
                name: docSnap.data().category_name,
                description: docSnap.data().description
            });
            setEditMode(true);
        } else {
            console.log("No such category!");
            setCategory({ name: '', description: '' });
            setEditMode(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategory(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const collectionRef = collection(db, 'categories');
        if (!editMode) {
            const docRef = doc(collectionRef);
            const newCategory = {
                category_id: docRef.id,
                category_name: category.name,
                description: category.description
            };
            await setDoc(docRef, newCategory).then(() => {
                console.log('Category added successfully!');
                setCategoryId(docRef.id); // Save the category ID in state
                localStorage.setItem('category_id', docRef.id); // Store category ID in local storage
                setCategory({ name: '', description: '' });
            }).catch(error => {
                console.error('Error adding category:', error);
            });
        } else {
            if (!categoryId) {
                console.error('Invalid category ID for updating');
                return;
            }
            const docRef = doc(db, 'categories', categoryId);
            await updateDoc(docRef, {
                category_name: category.name,
                description: category.description
            }).then(() => {
                console.log('Category updated successfully!');
                setCategory({ name: '', description: '' });
                setEditMode(false);
                localStorage.removeItem('category_id'); // Clear local storage after updating
            }).catch(error => {
                console.error('Error updating category:', error);
            });
        }
    };

    const handleEdit = (id) => {
        setCategoryId(id);
        localStorage.setItem('category_id', id); // Store category ID in local storage
        fetchCategoryData(id); // Fetch the category data for editing
    };

    const handleDelete = async (id) => {
        const docRef = doc(db, 'categories', id);
        await deleteDoc(docRef).then(() => {
            console.log('Document successfully deleted!');
            localStorage.removeItem('category_id'); // Clear local storage if the deleted category was stored
        }).catch(error => {
            console.error('Error removing document:', error);
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="form-container">
                <h3>{editMode ? 'Edit Category' : 'Add Category'}</h3>
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={category.name}
                    onChange={handleChange}
                    required
                />
                <label htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    name="description"
                    value={category.description}
                    onChange={handleChange}
                    required
                />
                <button type="submit">{editMode ? 'Update Category' : 'Add Category'}</button>
            </form>
            <div className="categories-list">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(category => (
                            <tr key={category.id}>
                                <td>{category.category_name}</td>
                                <td>{category.description}</td>
                                <td>
                                    <button onClick={() => handleEdit(category.id)}>Edit</button>
                                    <button onClick={() => handleDelete(category.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default CategoryForm;
