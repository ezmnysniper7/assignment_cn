// src/app/(protected)/main/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jwt_decode from 'jwt-decode';
import styles from './main.module.css';

export default function MainPage() {
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    try {
      const decoded = jwt_decode(token);
      if (!decoded.role) throw new Error('No role in token');
      setRole(decoded.role);
    } catch (err) {
      console.error('Invalid token:', err);
      router.push('/');
    }
  }, [router]);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>School Dashboard</h1>
      <p className={styles.subtitle}>
        Welcome, <strong>{role.toUpperCase()}</strong> user!
      </p>

      <div className={styles.cardGrid}>
        {/* Admin-Specific Cards */}
        {role === 'admin' && (
          <>
            <div className={styles.card} onClick={() => router.push('/students')}>
              <h3>Manage Students</h3>
              <p>Create, update, or delete student records</p>
            </div>
            <div className={styles.card} onClick={() => router.push('/teachers')}>
              <h3>Manage Teachers</h3>
              <p>Assign or remove teaching staff</p>
            </div>
            <div className={styles.card} onClick={() => router.push('/courses')}>
              <h3>Manage Courses</h3>
              <p>Add new courses, assign teachers, etc.</p>
            </div>
            <div className={styles.card} onClick={() => router.push('/enrollments')}>
              <h3>Manage Enrollments</h3>
              <p>Add new enrollments, assign enrollments, etc.</p>
            </div>
          </>
        )}

        {/* Teacher-Specific Cards */}
        {role === 'teacher' && (
          <>
            <div className={styles.card} onClick={() => router.push('/courses')}>
              <h3>My Courses</h3>
              <p>View or update the courses you teach</p>
            </div>
            <div className={styles.card} onClick={() => router.push('/enrollments')}>
              <h3>Grades & Enrollments</h3>
              <p>Manage student enrollments, record grades</p>
            </div>
          </>
        )}

        {/* Student-Specific Cards */}
        {role === 'student' && (
          <>
            <div className={styles.card} onClick={() => router.push('/enrollments')}>
              <h3>My Enrollments</h3>
              <p>View or drop your enrolled courses</p>
            </div>
            <div className={styles.card} onClick={() => router.push('/profiles')}>
              <h3>My Profile</h3>
              <p>View or edit your student info</p>
            </div>
          </>
        )}

        {/* Everyone sees a "Help" or "Support" card, for example */}
        <div className={styles.card}>
          <h3>Help & Support</h3>
          <p>Need assistance? Contact support desk</p>
        </div>
      </div>
    </div>
  );
}
