'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ name: '', age: '', major: '', username: '', password: '' });
  // If `editId` is null => creating new, otherwise => editing student with that student_id
  const [editId, setEditId] = useState(null);

  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch students on first render
  useEffect(() => {
    fetchStudents();
  }, []);

  // Load students from API
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${baseURL}/api/students`, config);

      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Handle input changes in the form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create or Update student (depending on editId)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      let dataToSend = { ...formData };
      if (editId) {
        if (!dataToSend.username) delete dataToSend.username;
        if (!dataToSend.password) delete dataToSend.password;
        // Update existing student => PUT /api/students/:student_id
        await axios.put(`${baseURL}/api/students/${editId}`, formData, config);
      } else {
        // Create new student => POST /api/students
        await axios.post(`${baseURL}/api/students`, formData, config);
      }
      // Reset form
      setFormData({ name: '', age: '', major: '', username: '', password: '' });
      setEditId(null);
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  // Populate form with existing student's data + setEditId
  const handleEdit = (student) => {
    // We assume the back-end returns: student.student_id, student.name, student.age, student.major
    setEditId(student.student_id);
    setFormData({
      name: student.name || '',
      age: student.age || '',
      major: student.major || '',
      username: student.username || '',
      password: '',
    });
  };

  // Delete a student
  const handleDelete = async (studentId) => {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      // DELETE /api/students/:student_id
      await axios.delete(`${baseURL}/api/students/${studentId}`, config);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  // Cancel edit (reset form + editId)
  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ name: '', age: '', major: '', username: '', password: '' });
  };

  return (
    <div className="students-container">
      <div className="students-header">
        <h1 className="students-title">Manage Students</h1>
      </div>

      {/* CREATE / EDIT FORM */}
      <form onSubmit={handleSubmit} className="student-form">
        <input
          type="text"
          name="name"
          placeholder="Student Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="major"
          placeholder="Major"
          value={formData.major}
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
          {editId ? 'Update Student' : 'Add Student'}
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

      {/* STUDENTS TABLE */}
      <table className="students-table">
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Major</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.student_id}>
              <td>{s.student_id}</td>
              <td>{s.name}</td>
              <td>{s.age}</td>
              <td>{s.major}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEdit(s)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleDelete(s.student_id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
