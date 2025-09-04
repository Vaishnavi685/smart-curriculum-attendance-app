import React, { useState, useEffect } from 'react';
// Added all necessary firestore imports
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
// FIX: Corrected path to go up one directory to find firebase.js
import { db, auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
// FIX: Using the new, compatible scanner library we installed
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function StudentDashboard() {
  const [liveSession, setLiveSession] = useState(null);
  const [scanMessage, setScanMessage] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  // This useEffect listens for active sessions from the teacher
  useEffect(() => {
    const q = query(collection(db, "live_sessions"), where("isActive", "==", true));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const sessionDoc = querySnapshot.docs[0];
        setLiveSession({ id: sessionDoc.id, ...sessionDoc.data() });
      } else {
        setLiveSession(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // This useEffect creates and cleans up the QR scanner when needed
  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader", // The ID of the div to render the scanner in
        { qrbox: { width: 250, height: 250 }, fps: 5 },
        false // verbose = false
      );

      const onScanSuccess = (decodedText) => {
        scanner.clear();
        setShowScanner(false);
        handleScan(decodedText);
      };

      const onScanError = (errorMessage) => {
        // This function is called frequently, so it's best to keep it empty
      };

      scanner.render(onScanSuccess, onScanError);

      // Cleanup function to stop the scanner when the component unmounts or scanner is closed
      return () => {
        // Checking if scanner.clear is available and is a function before calling
        if (scanner && typeof scanner.clear === 'function') {
          scanner.clear().catch(error => {
            console.error("Failed to clear html5-qrcode-scanner.", error);
          });
        }
      };
    }
  }, [showScanner]);

  // This function is called after a successful scan
  const handleScan = async (sessionId) => {
    if (sessionId) {
      setScanMessage('Processing...');
      try {
        const attendanceRef = doc(db, `attendance/${sessionId}_${auth.currentUser.uid}`);
        await setDoc(attendanceRef, {
          sessionId: sessionId,
          studentId: auth.currentUser.uid,
          studentEmail: auth.currentUser.email,
          timestamp: serverTimestamp(),
          status: 'Present'
        });
        setScanMessage('✅ Attendance Marked Successfully!');
      } catch (error) {
        console.error("Error marking attendance: ", error);
        setScanMessage('❌ Error: Could not mark attendance.');
      }
    }
  };

  const handleLogout = async () => {
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
          <h2>Student Dashboard</h2>
          <span>{auth.currentUser?.email}</span>
        </header>
        <div className="cards">
          <div className="card">
            <h3>Live Attendance</h3>
            {liveSession ? (
              <div>
                <h4>A session is active!</h4>
                <p>The teacher has started a session. Click below to scan.</p>
                <button onClick={() => { setShowScanner(true); setScanMessage(''); }} className="btn-primary" style={{ marginTop: 20 }}>
                  Scan Attendance Code
                </button>
              </div>
            ) : (
              <p>No active attendance session right now.</p>
            )}
            {scanMessage && <h4 style={{ marginTop: 20 }}>{scanMessage}</h4>}
          </div>
          {showScanner && (
            <div className="card">
              <h3>Scan QR Code</h3>
              <div id="qr-reader" style={{ width: '100%' }}></div>
              <button onClick={() => setShowScanner(false)} style={{ marginTop: 20 }}>Cancel</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

