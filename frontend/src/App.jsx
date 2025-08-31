// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import Lobby from "./pages/Lobby";
import WaitingRoom from "./pages/WaitingRoom";
import TopicSelect from "./pages/TopicSelect";
import GameWrapper from './pages/GameWrapper';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import AuthHeader from './components/AuthHeader';
import { SocketProvider } from './realtime/SocketProvider';
import ToastHost from './components/ToastHost'; // <-- add

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!authChecked) return null;

  const PrivateRoute = ({ children }) => (!session ? <Navigate to="/" replace /> : children);

  const Layout = () => (
    <div>
      <AuthHeader />
      <Outlet />
    </div>
  );

  return (
    <Router>
      <SocketProvider>
        {/* Toasts visible on all routes */}
        <ToastHost />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={session ? <Navigate to="/user-home" replace /> : <Home />} />
            <Route path="/user-home" element={<PrivateRoute><UserHome /></PrivateRoute>} />
            <Route path="/lobby" element={<PrivateRoute><Lobby /></PrivateRoute>} />
            <Route path="/waiting/:code" element={<PrivateRoute><WaitingRoom /></PrivateRoute>} />
            <Route path="/game/:code" element={<PrivateRoute><GameWrapper /></PrivateRoute>} />
            <Route path="/topic-select/:code" element={<PrivateRoute><TopicSelect/></PrivateRoute>} />
          
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </SocketProvider>
    </Router>
  );
}

export default App;
