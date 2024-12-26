'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]); // To populate teacher dropdown
  const [formData, setFormData] = useState({ name: '', teacher_id: '' });
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const baseURL = process.env.NEXT_PUBLIC_API_URL; // from .env.local

  // Fetch courses and teachers on first render
  useEffect(() => {
    fetchCourses();
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch all courses
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${baseURL}/api/courses`, config);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to fetch courses.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all teachers for the dropdown
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

  // Create or Update course (depending on editId)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Basic Validation
    if (!formData.name || !formData.teacher_id) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      if (editId) {
        // Update existing course => PUT /api/courses/:id
        await axios.put(`${baseURL}/api/courses/${editId}`, formData, config);
        alert('Course updated successfully.');
      } else {
        // Create new course => POST /api/courses
        await axios.post(`${baseURL}/api/courses`, formData, config);
        alert('Course added successfully.');
      }
      // Reset form
      setFormData({ name: '', teacher_id: '' });
      setEditId(null);
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error('Error saving course:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to save course.');
      }
    }
  };

  // Populate form with existing course's data + setEditId
  const handleEdit = (course) => {
    setEditId(course.id);
    setFormData({
      name: course.name || '',
      teacher_id: course.teacher_id || '',
    });
  };

  // Delete a course
  const handleDelete = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      // DELETE /api/courses/:id
      await axios.delete(`${baseURL}/api/courses/${courseId}`, config);
      alert('Course deleted successfully.');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course.');
    }
  };

  // Cancel edit (reset form + editId)
  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ name: '', teacher_id: '' });
  };

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h1 className="courses-title">Manage Courses</h1>
      </div>

      {/* CREATE / EDIT FORM */}
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-group">
          <label htmlFor="name">Course Name<span className="required">*</span></label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Course Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="teacher_id">Assigned Teacher<span className="required">*</span></label>
          <select
            name="teacher_id"
            id="teacher_id"
            value={formData.teacher_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Teacher --</option>
            {teachers.map((teacher) => (
              <option key={teacher.teacher_id} value={teacher.teacher_id}>
                {teacher.name} ({teacher.department})
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            {editId ? 'Update Course' : 'Add Course'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="cancel-btn"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* LOADING INDICATOR */}
      {isLoading && <p className="loader">Loading courses...</p>}

      {/* COURSES TABLE */}
      <table className="courses-table">
        <thead>
          <tr>
            <th>Course ID</th>
            <th>Name</th>
            <th>Assigned Teacher</th>
            <th>Department</th>
            <th>Title</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.length > 0 ? (
            courses.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.name}</td>
                <td>{course.name_of_teacher}</td>
                <td>{course.department}</td>
                <td>{course.title}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(course)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(course.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">
                No courses found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
