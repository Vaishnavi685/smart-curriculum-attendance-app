import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '../firebase'; // Correct path to firebase.js
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [userRole, setUserRole] = useState(null); // 'student', 'teacher', or 'error'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // onAuthStateChanged is the best way to listen for login/logout
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, now let's get their role from Firestore.
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            // We found the user's role, let's set it!
            setUserRole(userDoc.data().role);
          } else {
            // This is a critical error. The user is authenticated but has no role document.
            console.error("User document not found in Firestore for UID:", user.uid);
            setUserRole('error');
          }
        } catch (err) {
            console.error("Error fetching user document:", err);
            setUserRole('error');
        }
      } else {
        // User is signed out. Redirect them to the login page.
        navigate('/');
      }
      // We are done loading, whether we succeeded or failed.
      setLoading(false);
    });

    // Cleanup the listener when the component is unmounted
    return () => unsubscribe();
  }, [navigate]);

  // While we're checking for the user and their role, show a loading screen.
  if (loading) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2>Loading...</h2>
        </div>
    );
  }

  // After loading, render the correct dashboard based on the role.
  switch (userRole) {
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      // This will show if the role is 'error' or not found.
      return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>An Error Occurred</h1>
          <p>We couldn't find your user role. Please make sure you have signed up correctly.</p>
          <button onClick={() => auth.signOut()}>Sign Out and Try Again</button>
        </div>
      );
  }
}

