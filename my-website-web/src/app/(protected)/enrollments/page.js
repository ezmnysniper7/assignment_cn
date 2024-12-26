'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Import jwt-decode

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]); // For admins to assign students
  const [courses, setCourses] = useState([]); // For admins to assign courses
  const [formData, setFormData] = useState({ student_id: '', course_id: '', grade: '' });
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // State to hold user role and ID
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  const baseURL = process.env.NEXT_PUBLIC_API_URL; // from .env.local

  // Decode token and set user role and ID
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role); // 'admin', 'teacher', 'student'
        setUserId(decoded.userId); // User's unique ID

        if (decoded.role === 'admin') {
          fetchStudents();
          fetchCourses();
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        alert('Invalid token. Please log in again.');
      }
    } else {
      alert('No token found. Please log in.');
      // Optionally, redirect to login page
    }
  }, []);

  // Fetch enrollments on first render
  useEffect(() => {
    fetchEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  // Fetch all enrollments
  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${baseURL}/api/enrollments`, config);
      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      alert('Failed to fetch enrollments.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch students (admin only)
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${baseURL}/api/students`, config);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Failed to fetch students.');
    }
  };

  // Fetch courses (admin only)
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${baseURL}/api/courses`, config);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to fetch courses.');
    }
  };

  // Handle input changes in the form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create or Update enrollment (depending on editId)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Basic Validation
    if (!formData.student_id || !formData.course_id) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      if (editId) {
        // Update existing enrollment => PUT /api/enrollments/:id
        await axios.put(`${baseURL}/api/enrollments/${editId}`, { grade: formData.grade }, config);
        alert('Enrollment updated successfully.');
      } else {
        // Create new enrollment => POST /api/enrollments
        await axios.post(`${baseURL}/api/enrollments`, formData, config);
        alert('Enrollment added successfully.');
      }
      // Reset form
      setFormData({ student_id: '', course_id: '', grade: '' });
      setEditId(null);
      fetchEnrollments(); // Refresh the list
    } catch (error) {
      console.error('Error saving enrollment:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Failed to save enrollment.');
      }
    }
  };

  // Populate form with existing enrollment's data + setEditId
  const handleEdit = (enrollment) => {
    setEditId(enrollment.id);
    setFormData({
      student_id: enrollment.student_id || '',
      course_id: enrollment.course_id || '',
      grade: enrollment.grade || '',
    });
  };

  // Delete an enrollment
  const handleDelete = async (enrollmentId) => {
    if (!confirm('Are you sure you want to delete this enrollment?')) return;
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`${baseURL}/api/enrollments/${enrollmentId}`, config);
      alert('Enrollment deleted successfully.');
      fetchEnrollments();
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      alert('Failed to delete enrollment.');
    }
  };

  // Cancel edit (reset form + editId)
  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ student_id: '', course_id: '', grade: '' });
  };

  return (
    <div className="enrollments-container">
      <div className="enrollments-header">
        <h1 className="enrollments-title">Manage Enrollments</h1>
      </div>

      {/* CREATE / EDIT FORM */}
      {(userRole === 'admin' || userRole === 'teacher') && (
        <form onSubmit={handleSubmit} className="enrollment-form">
          {userRole === 'admin' && (
            <>
              <div className="form-group">
                <label htmlFor="student_id">
                  Student<span className="required">*</span>
                </label>
                <select
                  name="student_id"
                  id="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Student --</option>
                  {students.map((student) => (
                    <option key={student.student_id} value={student.student_id}>
                      {student.name} ({student.major})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="course_id">
                  Course<span className="required">*</span>
                </label>
                <select
                  name="course_id"
                  id="course_id"
                  value={formData.course_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.department})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {userRole === 'teacher' && (
            <>
              {/* Teachers can only assign grades, not create enrollments */}
              <div className="form-group">
                <label htmlFor="student_id">
                  Student<span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="student_id"
                  id="student_id"
                  value={userId} // Teachers can only assign grades to students in their courses
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="course_id">
                  Course<span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="course_id"
                  id="course_id"
                  value={userId} // Should be the teacher's own course, but needs to be handled accordingly
                  readOnly
                />
              </div>
            </>
          )}

          {/* Grade Field - Only Admins and Teachers can assign grades */}
          {editId && (
            <div className="form-group">
              <label htmlFor="grade">Grade</label>
              <input
                type="text"
                name="grade"
                id="grade"
                placeholder="Enter Grade"
                value={formData.grade}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editId ? 'Update Enrollment' : 'Add Enrollment'}
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
      )}

      {/* LOADING INDICATOR */}
      {isLoading && <p className="loader">Loading enrollments...</p>}

      {/* ENROLLMENTS TABLE */}
      <table className="enrollments-table">
        <thead>
          <tr>
            <th>Enrollment ID</th>
            <th>Student Name</th>
            <th>Course Name</th>
            <th>Grade</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrollments.length > 0 ? (
            enrollments.map((enrollment) => (
              <tr key={enrollment.id}>
                <td>{enrollment.id}</td>
                <td>{enrollment.studentName}</td>
                <td>{enrollment.courseName}</td>
                <td>{enrollment.grade || 'N/A'}</td>
                <td>
                  {(userRole === 'admin' || userRole === 'teacher') && (
                    <div className="action-buttons">
                      {/* Teachers can only update grades */}
                      {(userRole === 'admin' || (userRole === 'teacher')) && (
                        <button
                          className="action-btn edit"
                          onClick={() => handleEdit(enrollment)}
                        >
                          {enrollment.grade ? 'Update Grade' : 'Assign Grade'}
                        </button>
                      )}
                      {userRole === 'admin' && (
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(enrollment.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="no-data">
                No enrollments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
