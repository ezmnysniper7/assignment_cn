// src/app/layout.js
import '../globals.css';
import NavBar from './components/NavBar';

export const metadata = {
  title: 'My Course Management',
  description: 'Next.js 13 with roles demo',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
