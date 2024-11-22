import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importing CSS for toast notifications
import '../styles/AuthForm.css'; // Your custom CSS

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      // Sign in the user with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the signed-in user is an admin by querying Firestore
      const adminRef = doc(db, 'admin', user.uid); // Ensure collection name is 'admins'
      const adminSnap = await getDoc(adminRef);

      if (adminSnap.exists()) {
        // If the user is an admin, navigate to the dashboard
        toast.success('Login successful! Redirecting...', {
          position: 'top-center',
        });
        navigate('/dashboard');
      } else {
        // If the user is not an admin, sign out and show an error
        setErrorMessage('You are not authorized as an admin.');
        await auth.signOut(); // Sign out the unauthorized user
        toast.error('You are not authorized as an admin.', {
          position: 'top-center',
        });
      }
    } catch (error) {
      // Handle login errors
      setErrorMessage('Login error');
      toast.error('Authentication failed. Please check your credentials.', {
        position: 'top-center',
      });
    }
  };

  return (
    <div className="container">
      {/* ToastContainer needs to be added once to handle all toast notifications */}
      <ToastContainer />
      <form className="auth-form" onSubmit={handleLogin}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Email" 
          required 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Password" 
          required 
        />
        <button type="submit">Login</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <p>
          Don't have an account? <Link to="/register" className="link">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
