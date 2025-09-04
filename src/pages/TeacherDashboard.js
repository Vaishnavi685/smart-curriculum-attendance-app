import React, { useState, useEffect } from 'react';
// FIX: Changed the import to a named export { QRCodeSVG }
import { QRCodeSVG } from 'qrcode.react';
import { collection, doc, setDoc, serverTimestamp, onSnapshot, query, where, getDocs, writeBatch } from 'firebase/firestore';
// Corrected path to go up one directory
import { db, auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function TeacherDashboard() {
  const [activeSession, setActiveSession] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const navigate = useNavigate();

  // Effect to check for an already active session when the component loads
  useEffect(() => {
    // Ensure currentUser is available before querying
    if (auth.currentUser) {
      const q = query(collection(db, 'live_sessions'), where('teacherId', '==', auth.currentUser.uid), where('isActive', '==', true));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const sessionDoc = snapshot.docs[0];
          setActiveSession({ sessionId: sessionDoc.id, ...sessionDoc.data() });
        } else {
          setActiveSession(null);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Effect to fetch the list of students who have marked attendance for the active session
  useEffect(() => {
    if (activeSession) {
      const q = query(collection(db, 'attendance'), where('sessionId', '==', activeSession.sessionId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAttendanceList(students);
      });
      return () => unsubscribe();
    } else {
      setAttendanceList([]); // Clear the list when there's no active session
    }
  }, [activeSession]);


  const handleSession = async () => {
    if (activeSession) {
      // End the current session
      const sessionRef = doc(db, 'live_sessions', activeSession.sessionId);
      await setDoc(sessionRef, { isActive: false }, { merge: true });
      setActiveSession(null);
    } else {
      // Before starting a new session, ensure no other sessions are active
      const q = query(collection(db, "live_sessions"), where("isActive", "==", true));
      const existingSessions = await getDocs(q);
      const batch = writeBatch(db);
      existingSessions.forEach(doc => {
          batch.update(doc.ref, { isActive: false });
      });
      await batch.commit();

      // Start a new session
      const newSessionRef = doc(collection(db, 'live_sessions'));
      const sessionData = {
        sessionId: newSessionRef.id,
        teacherId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        isActive: true,
      };
      await setDoc(newSessionRef, sessionData);
      setActiveSession(sessionData);
    }
  };

  const handleLogout = async () => {
    if (activeSession) {
      await handleSession(); // End session on logout
    }
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="logo">ScheduPlan ✅</div>
        <ul className="menu">
          <li onClick={handleLogout}>🚪 Logout</li>
        </ul>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <h2>Teacher Dashboard</h2>
          <span>{auth.currentUser?.email}</span>
        </header>
        <div className="cards">
          <div className="card">
            <h3>Attendance Session</h3>
            <button onClick={handleSession} className="btn-primary" style={{marginTop: 20, width: 'auto', padding: '12px 30px'}}>
              {activeSession ? 'End Session' : 'Start New Session'}
            </button>

            {activeSession && (
              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <h4>Session is live. Students can now scan this code.</h4>
                <div style={{ padding: '16px', background: 'white', display: 'inline-block', marginTop: '10px', borderRadius: '8px' }}>
                    {/* FIX: Changed component to QRCodeSVG */}
                    <QRCodeSVG value={activeSession.sessionId} size={200} />
                </div>
              </div>
            )}
          </div>
          {activeSession && (
            <div className="card">
              <h3>Attendance List ({attendanceList.length})</h3>
              {attendanceList.length > 0 ? (
                <ul style={{listStyle: 'none', padding: 0, textAlign: 'left'}}>
                  {attendanceList.map(student => (
                    <li key={student.id} style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>
                      {student.studentEmail}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No students have checked in yet.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

