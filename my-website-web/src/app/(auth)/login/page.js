'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { username, password }
      );
      const { token } = response.data;
      localStorage.setItem('token', token);
      router.push('/main');
    } catch (error) {
      alert('Login failed');
      console.error('Login error:', error);
    }
  }

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.title}>Portal Login</h2>
      <form onSubmit={handleLogin} className={styles.loginForm}>
        <label className={styles.label}>
          Username
          <input
            className={styles.input}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className={styles.btnLogin} type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
