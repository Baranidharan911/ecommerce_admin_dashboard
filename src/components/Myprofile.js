import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Myprofile.css';
import { FaUserCircle } from 'react-icons/fa';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import imageCompression from 'browser-image-compression'; // Image compression library

const MyProfile = () => {
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();

  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    profilePicture: '',
  });
  const [uploading, setUploading] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [user, setUser] = useState(null);

  // Fetch admin profile data from Firestore when the user is authenticated
  useEffect(() => {
    const fetchProfileData = async (uid) => {
      if (uid) {
        try {
          const adminDocRef = doc(db, 'admin', uid);
          const adminDoc = await getDoc(adminDocRef);

          if (adminDoc.exists()) {
            const data = adminDoc.data();
            setFormData({
              firstName: data.firstName || '',
              email: data.email || '',
              profilePicture: data.profilePicture || '',
            });
          } else {
            console.log('No admin document found!');
          }
        } catch (error) {
          console.error('Error fetching admin profile data:', error);
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProfileData(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      // Check if the file size exceeds the limit (10MB in bytes)
      const maxSizeInMB = 10;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        toast.error(`File size exceeds the ${maxSizeInMB}MB limit. Please upload a smaller file.`);
        return;
      }

      // Compress the image
      const options = {
        maxSizeMB: 1, // Compress the image to 1MB max
        maxWidthOrHeight: 800, // Max width or height
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        setProfilePictureFile(compressedFile); // Set the compressed file

        // Show preview of the image before saving
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            profilePicture: reader.result, // Show the image preview
          }));
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        toast.error('Error compressing the image.');
      }
    }
  };

  const deletePreviousProfilePicture = async () => {
    if (formData.profilePicture && !profilePictureFile) {
      const oldProfilePicRef = ref(storage, formData.profilePicture);

      try {
        await deleteObject(oldProfilePicRef);
        console.log('Previous profile picture deleted successfully.');

        const adminDocRef = doc(db, 'admin', user.uid);
        await updateDoc(adminDocRef, { profilePicture: '' });
        console.log('Previous profile picture URL removed from Firestore.');
      } catch (error) {
        console.error('Error deleting previous profile picture:', error);
      }
    }
  };

  const uploadProfilePictureToStorage = async () => {
    if (!profilePictureFile) return;

    const storageRef = ref(storage, `profilePictures/${user.uid}/${profilePictureFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, profilePictureFile);

    setUploading(true);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Error uploading file:', error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFormData((prev) => ({
              ...prev,
              profilePicture: downloadURL,
            }));
            setUploading(false);
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (profilePictureFile) {
        await deletePreviousProfilePicture();
        await uploadProfilePictureToStorage();
      }

      if (user) {
        const adminDocRef = doc(db, 'admin', user.uid);
        await setDoc(
          adminDocRef,
          {
            firstName: formData.firstName,
            email: formData.email,
            profilePicture: formData.profilePicture,
          },
          { merge: true }
        );

        toast.success('Profile updated successfully!', {
          position: "top-right",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Profile update failed.');
    }
  };

  return (
    <div className="myprofile-container">
      <ToastContainer />
      <div className="myprofile-header">
        {formData.profilePicture ? (
          <img src={formData.profilePicture} alt="Profile" className="myprofile-picture" />
        ) : (
          <FaUserCircle className="myprofile-icon" />
        )}
        <h2>Admin Profile</h2>
      </div>
      <form className="myprofile-form" onSubmit={handleSubmit}>
        <div className="myprofile-form-group">
          <label htmlFor="firstName" className="myprofile-label">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="myprofile-input"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div className="myprofile-form-group">
          <label htmlFor="email" className="myprofile-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className="myprofile-input"
            value={formData.email}
            onChange={handleChange}
            disabled
          />
        </div>

        <div className="myprofile-form-group">
          <label htmlFor="profilePicture" className="myprofile-label">Profile Picture</label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            className="myprofile-input"
            onChange={handleProfilePictureChange}
          />
        </div>

        <button type="submit" className="myprofile-save-button" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default MyProfile;
