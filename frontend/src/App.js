import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import Signup from './components/signup';
import Login from './components/login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/home';
import CreatePostPage from './components/CreatePost';
import UpdatePost from './components/EditPage';

const App = () => (
    <Router> {/* Wrap everything inside Router */}
        <AuthProvider> {/* AuthProvider should be wrapped inside Router */}
            <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/createpost" element={<CreatePostPage />} />
                <Route path="/editpost/:postId" element={<UpdatePost />} />
                <Route path="/" element={<Home />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AuthProvider>
    </Router>
);

export default App;
