import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../components/AuthContext';
import '../styles/dashboard.css'; 
import { FiMoreVertical } from 'react-icons/fi'; // For three dots icon

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [menuOpen, setMenuOpen] = useState(null); // Tracks which menu is open

    useEffect(() => {
        if (!user) {
            console.error("User is not authenticated. Redirecting to login.");
            navigate('/login'); // Redirect to login if user is not authenticated
            return;
        }

        const fetchPosts = async () => {
            try {
                const response = await fetch(`http://localhost:5000/posts?author=${user.username}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setPosts(data);
                } else {
                    console.error(`Failed to fetch posts. Status: ${response.status}`);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        fetchPosts();
    }, [user, navigate]);

    const handleEdit = (postId) => {
        navigate(`/editpost/${postId}`); // Navigate to edit page with post ID
    };

    const handleDelete = async (postId) => {
        try {
            const response = await fetch(`http://localhost:5000/posts/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ postId }), // Send postId in the body
            });
    
            if (response.ok) {
                setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
            } else {
                console.error(`Failed to delete post. Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };    

    const toggleMenu = (postId) => {
        setMenuOpen((prev) => (prev === postId ? null : postId)); // Toggle menu for the specific post
    };    

    if (!user) {
        return <p>Loading...</p>; // Show a loading or fallback UI while user data is fetched
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <h1 className="welcome-username">Welcome {user.username}</h1>
                <div className="header-buttons">
                    <button onClick={() => navigate('/createpost')} className="create-post-btn">+</button>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </div>
            </header>
            <main className="posts-container">
                <h2>Your Posts</h2>
                {posts.length > 0 ? (
                    <div className="post-feed">
                        {posts.map((post) => (
                            <div className="post-card" key={post._id}>
                                <h3>{post.title}</h3>
                                <p>{post.content}</p>
                                <div className="post-tags">
                                    <strong>Tags:</strong> {post.tags.join(', ')}
                                </div>
                                <div className="post-image-container">
                                    <img src={post.imageUrl} alt={post.title} className="post-image" />
                                </div>
                                <p className="post-date"><small>Created At: {new Date(post.createdAt).toLocaleString()}</small></p>
                                
                                {/* Three dots menu */}
                                <div className="menu-container" data-active={menuOpen === post._id ? 'true' : 'false'}>
                                    <FiMoreVertical className="menu-icon" onClick={() => toggleMenu(post._id)} />
                                    {menuOpen === post._id && (
                                    <div className="dropdown-menu">
                                        <button onClick={() => handleEdit(post._id)}>Edit</button>
                                        <button onClick={() => handleDelete(post._id)}>Delete</button>
                                    </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No posts found. Click the "+" button to create a new post.</p>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
