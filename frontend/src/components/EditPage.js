import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../components/AuthContext';
import '../styles/updatepost.css'

const UpdatePost = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { postId } = useParams(); // Get postId from URL params
    const [postData, setPostData] = useState({
        title: '',
        content: '',
        tags: '',
        imageUrl: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch post data to pre-fill the form
    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`http://localhost:5000/posts/${postId}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setPostData({
                        title: data.title,
                        content: data.content,
                        tags: data.tags.join(', '), // Assuming tags are in an array
                        imageUrl: data.imageUrl,
                    });
                    setIsLoading(false);
                } else {
                    setError('Post not found');
                    setIsLoading(false);
                }
            } catch (error) {
                setError('Failed to fetch post');
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [postId, user.token]);

    // Handle form submission to update the post
    const handleSubmit = async (e) => {
        e.preventDefault();

        const { title, content, tags, imageUrl } = postData;

        try {
            const response = await fetch('http://localhost:5000/posts/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    postId,
                    title,
                    content,
                    tags,
                    imageUrl,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data); // Optional: log success message
                navigate('/dashboard'); // Redirect to dashboard after successful update
            } else {
                const data = await response.json();
                setError(data.message || 'Error updating post');
            }
        } catch (error) {
            setError('Error updating post');
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPostData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Render the update post page
    return (
        <div className="update-post">
            <header>
                <h2>Update Post</h2>
            </header>
            <main>
                {isLoading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <form onSubmit={handleSubmit} className="update-post-form">
                        <div>
                            <label htmlFor="title">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={postData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="content">Content</label>
                            <textarea
                                id="content"
                                name="content"
                                value={postData.content}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="tags">Tags</label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={postData.tags}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="imageUrl">Image URL</label>
                            <input
                                type="text"
                                id="imageUrl"
                                name="imageUrl"
                                value={postData.imageUrl}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit">Update Post</button>
                            <button type="button" onClick={() => navigate('/dashboard')}>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
};

export default UpdatePost;
