// src/app/(protected)/enrollments/page.js
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode'; // Correct import without braces
import { useRouter } from 'next/navigation';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]); // For admins
  const [courses, setCourses] = useState([]); // For admins and teachers
  const [formData, setFormData] = useState({ student_id: '', course_id: '', grade: '' });
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  const router = useRouter();
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  // Decode token and set user role and ID
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setUserRole(decoded.role); // 'admin', 'teacher', 'student'
        setUserId(decoded.userId); // User's unique ID

        if (decoded.role === 'admin') {
          fetchStudents();
          fetchCourses();
        } else if (decoded.role === 'teacher') {
          fetchCourses(); // Fetch only courses taught by this teacher
        } else if (decoded.role === 'student') {
          fetchCourses(); // Fetch all available courses for enrollment
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        alert('Invalid token. Please log in again.');
        router.push('/');
      }
    } else {
      alert('No token found. Please log in.');
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Fetch enrollments when userRole is set
  useEffect(() => {
    if (userRole) {
      fetchEnrollments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  // Fetch functions
  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);

      const config = { headers: { Authorization: `Bearer ${token}` } };
      console.log('Config:', config);

      console.log('Sending request to:', `${baseURL}/api/enrollments`);
      const response = await axios.get(`${baseURL}/api/enrollments`, config);
  
      console.log('Response received:', response);
  

      setEnrollments(response.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      alert('Failed to fetch enrollments.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      let url = `${baseURL}/api/courses`;
      if (userRole === 'teacher') {
        // Assuming you have an endpoint to get courses by teacher
        url = `${baseURL}/api/teachers/${userId}/courses`;
      }
      const response = await axios.get(url, config);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to fetch courses.');
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Basic Validation
    if (userRole === 'admin' && (!formData.student_id || !formData.course_id)) {
      alert('Please fill in all required fields.');
      return;
    }
    if (userRole === 'student' && !formData.course_id) {
      alert('Please select a course to enroll.');
      return;
    }
    if (userRole === 'teacher' && !formData.grade) {
      alert('Please enter a grade.');
      return;
    }

    try {
      if (editId) {
        // Update enrollment => PUT /api/enrollments/:id
        await axios.put(`${baseURL}/api/enrollments/${editId}`, { grade: formData.grade }, config);
        alert('Enrollment updated successfully.');
      } else {
        // Create new enrollment => POST /api/enrollments
        if (userRole === 'admin') {
          await axios.post(`${baseURL}/api/enrollments`, formData, config);
          alert('Enrollment added successfully.');
        } else if (userRole === 'student') {
          await axios.post(`${baseURL}/api/enrollments`, { courseId: formData.course_id }, config);
          alert('Enrollment successful.');
        }
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

  // Populate form for editing
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

  // Cancel edit
  const handleCancelEdit = () => {
    setEditId(null);
    setFormData({ student_id: '', course_id: '', grade: '' });
  };

  // Conditional rendering of forms based on role
  const renderForm = () => {
    if (userRole === 'admin') {
      return (
        <form onSubmit={handleSubmit} className="enrollment-form">
          {/* <h2 className="enrollments-title">Assign Student to Course</h2>
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
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editId ? 'Update Enrollment' : 'Add Enrollment'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="submit-btn cancel-btn"
              >
                Cancel
              </button>
            )}
          </div> */}
        </form>
      );
    } else if (userRole === 'teacher') {
      return (
        <form onSubmit={handleSubmit} className="enrollment-form">
          <h2 className="enrollments-title">Assign Grades</h2>
          <div className="form-group">
            <label htmlFor="grade">
              Grade<span className="required">*</span>
            </label>
            <input
              type="text"
              name="grade"
              id="grade"
              placeholder="Enter Grade"
              value={formData.grade}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editId ? 'Update Grade' : 'Assign Grade'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="submit-btn cancel-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      );
    } else if (userRole === 'student') {
      return (
        <form onSubmit={handleSubmit} className="enrollment-form">
          <h2 className="enrollments-title">Enroll in Course</h2>
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
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              Enroll
            </button>
          </div>
        </form>
      );
    }
  };

  // Render Enrollments Table based on role
  const renderEnrollmentsTable = () => {
    return (
      <table className="enrollments-table">
        <thead>
          <tr>
            <th>Enrollment ID</th>
            {userRole !== 'student' && <th>Student Name</th>}
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
                {userRole !== 'student' && <td>{enrollment.studentName}</td>}
                <td>{enrollment.courseName}</td>
                <td>{enrollment.grade || '--'}</td>
                <td>
                  {(userRole === 'admin' || userRole === 'teacher') && (
                    <div className="action-buttons">
                      {/* Teachers can only update grades */}
                      {(userRole === 'teacher') && (
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
              <td colSpan={userRole !== 'student' ? '5' : '4'} className="noData">
                No enrollments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div className="enrollments-container">
      <h1 className="enrollments-title">Manage Enrollments</h1>
      {/* Render Form */}
      {renderForm()}

      {/* Loading Indicator */}
      {isLoading && <p className="loader">Loading enrollments...</p>}

      {/* Render Enrollments Table */}
      {renderEnrollmentsTable()}
    </div>
  );
}
