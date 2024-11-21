import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
    const [author, setAuthor] = useState('');
    const [tags, setTags] = useState('');
    const [posts, setPosts] = useState([]);
    const [isSearching, setIsSearching] = useState(false); // Track if the search is ongoing
    const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsSearching(true); // Start the search process
        setHasSearched(true); // Mark that a search has been performed
        try {
            const response = await fetch(
                `http://localhost:5000/posts?author=${author}&tags=${tags}`
            );
            const data = await response.json();
            if (response.ok) {
                setPosts(data);
            } else {
                alert(data.message || 'Error fetching posts');
                setPosts([]);
            }
        } catch (err) {
            console.error('Error searching posts:', err);
            setPosts([]);
        }
        setIsSearching(false); // Stop the search process
    };

    return (
        <div>
            <header className="header">
                <h1 className="title">FlowPost</h1>
                <div>
                    <Link to="/signup" className="button">
                        Sign Up
                    </Link>
                    <Link to="/login" className="button">
                        Log In
                    </Link>
                </div>
            </header>

            <div className="main-content">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Filter by Author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="search-input"
                    />
                    <input
                        type="text"
                        placeholder="Filter by Tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="button">
                        Filter
                    </button>
                </form>

                <div className="results">
                    {isSearching ? ( // Show a loading indicator while searching
                        <p>Loading...</p>
                    ) : hasSearched && posts.length === 0 ? ( // Show "No posts found" only after a search
                        <p>No posts found</p>
                    ) : (
                        posts.map((post) => (
                            <div key={post._id} className="post-container">
                                <img
                                    src={post.imageUrl}
                                    alt={`${post.title} image`}
                                    className="post-image"
                                />
                                <div className="post-details">
                                    <h2>{post.title}</h2>
                                    <p>{post.content}</p>
                                    <p>
                                        <strong>Tags:</strong> {post.tags.join(', ')}
                                    </p>
                                    <p>
                                        <strong>Author:</strong> {post.authorUsername}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
