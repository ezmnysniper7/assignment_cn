'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    department: '', 
    email: '', 
    title: '', 
    username: '', 
    password: '' 
  });
  const [editId, setEditId] = useState(null);

  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch teachers on first render
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Load teachers from API
  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${baseURL}/api/teachers`, config);

      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      alert('Failed to fetch teachers.');
    }
  };

  // Handle input changes in the form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create or Update teacher (depending on editId)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      // Prepare data to send
      let dataToSend = { ...formData };

      if (editId) {
        // If in edit mode, remove fields that are empty to keep current values
        if (!dataToSend.username) delete dataToSend.username;
        if (!dataToSend.password) delete dataToSend.password;
        if (!dataToSend.name) delete dataToSend.name;
        if (!dataToSend.department) delete dataToSend.department;
        if (!dataToSend.email) delete dataToSend.email;
        if (!dataToSend.title) delete dataToSend.title;

        // Update existing teacher => PUT /api/teachers/:id
        await axios.put(`${baseURL}/api/teachers/${editId}`, dataToSend, config);
        alert('Teacher updated successfully.');
      } else {
        // Basic Validation for creation
        if (!formData.name || !formData.department || !formData.email || !formData.username || !formData.password) {
          alert('Please fill in all required fields.');
          return;
        }

        // Create new teacher => POST /api/teachers
        await axios.post(`${baseURL}/api/teachers`, dataToSend, config);
        alert('Teacher added successfully.');
      }

      // Reset form
      setFormData({ name: '', department: '', email: '', title: '', username: '', password: '' });
      setEditId(null);
      fetchTeachers(); // Refresh the list
    } catch (error) {
      console.error('Error saving teacher:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to save teacher.');
      }
    }
  };

  // Populate form with existing teacher's data + setEditId
  const handleEdit = (teacher) => {
    setEditId(teacher.teacher_id);
    setFormData({
      name: teacher.name || '',
      department: teacher.department || '',
      email: teacher.email || '',
      title: teacher.title || '',
      username: teacher.username || '',
      password: '',
    });
  };

  // Delete a teacher
  const handleDelete = async (teacherId) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      // DELETE /api/teachers/:id
      await axios.delete(`${baseURL}/api/teachers/${teacherId}`, config);
      alert('Teacher deleted successfully.');
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      alert('Failed to delete teacher.');
    }
  };

  // Cancel edit (reset form + editId)
  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ name: '', department: '', email: '', title: '', username: '', password: '' });
  };

  return (
    <div className="teachers-container">
      <div className="teachers-header">
        <h1 className="teachers-title">Manage Teachers</h1>
      </div>

      {/* CREATE / EDIT FORM */}
      <form onSubmit={handleSubmit} className="teacher-form">
        <input
          type="text"
          name="name"
          placeholder="Teacher Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
        />
        <input
          type="text"
          name="username"
          placeholder={editId ? 'Username (leave blank to keep current)' : 'Username'}
          value={formData.username}
          onChange={handleChange}
          {...(editId ? {} : { required: true })}
        />
        <input
          type="password"
          name="password"
          placeholder={editId ? 'New Password (leave blank to keep current)' : 'Password'}
          value={formData.password}
          onChange={handleChange}
          {...(editId ? {} : { required: true })}
        />

        <button type="submit">
          {editId ? 'Update Teacher' : 'Add Teacher'}
        </button>

        {editId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            style={{ background: '#bdc3c7' }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* TEACHERS TABLE */}
      <table className="teachers-table">
        <thead>
          <tr>
            <th>Teacher ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Department</th>
            <th>Email</th>
            <th>Title</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length > 0 ? (
            teachers.map((teacher) => (
              <tr key={teacher.teacher_id}>
                <td>{teacher.teacher_id}</td>
                <td>{teacher.username}</td>
                <td>{teacher.name}</td>
                <td>{teacher.department}</td>
                <td>{teacher.email}</td>
                <td>{teacher.title}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(teacher)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(teacher.teacher_id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>
                No teachers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
