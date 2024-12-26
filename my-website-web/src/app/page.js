// src/app/page.js (server component by default)
import { redirect } from 'next/navigation';

export default function HomeRedirect() {
  // Immediately redirect to /login
  redirect('/login');
  // Return null (won’t actually render)
  return null;
}
