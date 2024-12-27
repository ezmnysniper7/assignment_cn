// src/app/components/NavBar.jsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jwt_decode from 'jwt-decode';
import styles from './NavBar.module.css';

export default function NavBar() {
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setRole(decoded.role);
      } catch (error) {
        console.error('Invalid token decode:', error);
        router.push('/');
      }
    } else {
      // If no token, redirect to login
      router.push('/');
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('token');
    router.push('/');
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <Link href="/main">SchoolSystem</Link>
      </div>

      <ul className={styles.menu}>
        {/* Common link for all roles */}
        <li>
          <Link href="/main">Home</Link>
        </li>

        {/* Admin-only links */}
        {role === 'admin' && (
          <>
            <li><Link href="/students">Manage Students</Link></li>
            <li><Link href="/teachers">Manage Teachers</Link></li>
            <li><Link href="/courses">Manage Courses</Link></li>
            <li><Link href="/enrollments">Manage Enrollments</Link></li>
          </>
        )}

        {/* Teacher-only links */}
        {role === 'teacher' && (
          <>
            <li><Link href="/courses">My Courses</Link></li>
            <li><Link href="/enrollments">Grades / Enrollments</Link></li>
          </>
        )}

        {/* Student-only links */}
        {role === 'student' && (
          <>
            <li><Link href="/enrollments">My Enrollments</Link></li>
            <li><Link href="/profiles">Manage Profile</Link></li>
          </>
        )}
      </ul>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}
