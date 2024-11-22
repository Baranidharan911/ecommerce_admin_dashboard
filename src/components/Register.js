import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import '../styles/AuthForm.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  // const [lastName, setLastName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      // Register the admin with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store the admin data in Firestore collection 'admins'
      await setDoc(doc(db, 'admins', user.uid), {
        email: user.email,
        firstName: firstName, // Storing first name
        // lastName: lastName,   
        createdAt: new Date().toISOString(),
        role: 'admin', // Future role can be updated here
        profilePicture: '' // Can leave this empty or handle profile picture upload later
      });

      console.log('Admin registered successfully');
      navigate('/login'); // Redirect to login after successful registration
    } catch (error) {
      // Handle registration errors
      setErrorMessage('Registration error: ' + error.message);
    }
  };

  return (
    <div className="container">
      <form className="auth-form" onSubmit={handleRegister}>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Name"
          required
        />
        {/* <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Last Name"
          required
        /> */}
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
        <button type="submit">Register</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <p>
          Already have an account? <Link to="/login" className="link">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
