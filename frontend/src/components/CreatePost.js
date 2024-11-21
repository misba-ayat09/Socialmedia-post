import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../components/AuthContext';
import '../styles/createpost.css'; // Import the CSS file

const CreatePostPage = () => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: '',
        imageUrl: '',
    });

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`, // Assuming the user's token is in the AuthContext
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Post Created Successfully!');
                navigate('/dashboard'); // Redirect to the dashboard
            } else {
                console.error('Failed to create post');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="create-post-page">
            <div className="create-post-container">
                <form onSubmit={handleSubmit} className="create-post-form">
                    <h1 className="create-post-title">Create a New Post</h1>
                    <div className="create-post-formGroup">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="create-post-formGroup">
                        <label>Content</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="create-post-formGroup">
                        <label>Tags (comma-separated)</label>
                        <input
                            type="text"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="create-post-formGroup">
                        <label>Image URL</label>
                        <input
                            type="text"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" className="create-post-submitButton">
                        Create Post
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatePostPage;
