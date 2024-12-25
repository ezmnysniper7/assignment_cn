// src/app/students/page.js
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Call our API (running on localhost:5000)
    axios.get('http://localhost:5000/api/students')
      .then(response => {
        setStudents(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      <h1>Students</h1>
      <ul>
        {students.map((s) => (
          <li key={s.id}>
            {s.name} (Age: {s.age})
          </li>
        ))}
      </ul>
    </div>
  );
}
