'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import jwt_decode from 'jwt-decode';

export default function ProfilesPage() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    age: '',
    major: '',
  });
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        console.log('Decoded Token:', decoded);
        setUserId(decoded.userId); // Adjust 'id' based on your token payload
      } catch (error) {
        console.error('Invalid token:', error);
        alert('Invalid token. Please log in again.');
        router.push('/login'); // Redirect to login if token is invalid
      }
    } else {
      alert('No token found. Please log in.');
      router.push('/login'); // Redirect to login if no token
    }
  }, []);

  // Fetch profile once userId is set
  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
  
      // Use the logged-in user's ID
      const response = await axios.get(`${baseURL}/api/students/${userId}`, config);
      setFormData({
        username: response.data.username,
        name: response.data.name,
        age: response.data.age || '',
        major: response.data.major || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Failed to fetch profile information.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${baseURL}/api/students/${userId}`, formData, config);
      alert('Profile updated successfully.');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">My Profile</h1>

      {isLoading && <p className="loader">Loading...</p>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="major">Major</label>
          <input
            type="text"
            id="major"
            name="major"
            value={formData.major}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}