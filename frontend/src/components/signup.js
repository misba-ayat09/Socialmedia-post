import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/signup.css'

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const naviagte = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                throw new Error('Failed to register');
            }
            const data = await response.json();
            setMessage(data.message);
            naviagte('/login')
        } catch (error) {
            setMessage(error.message);
        }
    };

    return (
        <div className='container'>
            
            <form onSubmit={handleSubmit} className='form-container'>
            <h2>Signup</h2>
                <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Signup</button>
            <p>
                Already a user? <Link to="/login">Login</Link>
            </p>
            </form>
            {message && <p>{message}</p>}
            
        </div>
    );
};

export default Signup;
