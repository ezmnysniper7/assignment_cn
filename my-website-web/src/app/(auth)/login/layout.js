// src/app/(auth)/layout.js
import styles from './layout.module.css';

export const metadata = {
  title: 'University Login',
  description: 'Login page for the University portal',
};

export default function AuthLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className={styles.authLayout}>
          {/* Left side with background/logo */}
          <div className={styles.authLeft}>
            <div className={styles.brandContainer}>
              {/* Example brand/logo text or an actual <img> for your university */}
              <h1 className={styles.brandTitle}>Anhui University</h1>
              <p className={styles.brandSubtitle}>Empowering Education</p>
            </div>
          </div>
          
          {/* Right side for the login form (children) */}
          <div className={styles.authRight}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
