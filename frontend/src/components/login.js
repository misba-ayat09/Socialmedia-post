import React, { useState, useContext } from 'react';
import AuthContext from '../components/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/login.css'

const Login = () => {
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted", formData);

        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log(data);

            if (response.ok && data.token) {
                login({userId:data.userId, token:data.token, username:data.username});
                // console.log("fetched user",{ token, userId, username })
                alert("You're logged in!!!");
                navigate('/dashboard');
            } else {
                setMessage(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setMessage('An error occurred. Please try again.');
        }
    };
    

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
            <h2>Login</h2>
                <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    onChange={handleChange} 
                    required 
                    className="form-input" 
                />
                <input 
                    type="password" 
                    name="password" 
                    placeholder="Password" 
                    onChange={handleChange} 
                    required 
                    className="form-input" 
                />
                <button type="submit" className="login-button">Login</button>
                <p className="signup-link">
                New user? <Link to="/signup">Signup</Link>
            </p>
            </form>
            {message && <p className="error-message">{message}</p>}
            
        </div>
    );
};

export default Login;
