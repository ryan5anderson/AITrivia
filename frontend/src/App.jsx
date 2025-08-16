import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GameWrapper from './pages/GameWrapper';
import TopicSelect from './pages/TopicSelect';
import Game from './pages/Game';
import UserHome from './pages/UserHome';
import Lobby from "./pages/Lobby";
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import AuthHeader from './components/AuthHeader';

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

    if (!authChecked) {
        return null;
    }

    const PrivateRoute = ({ children }) => {
        if (!session) {
            return <Navigate to="/" replace />;
        }
        return children;
    };

    const Layout = () => (
        <div>
            <AuthHeader />
            <Outlet />
        </div>
    );

    return (
        <Router>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={session ? <Navigate to="/user-home" replace /> : <Home />} />
                    <Route path="/user-home" element={<PrivateRoute><UserHome /></PrivateRoute>} />
                    <Route path="/lobby" element={<PrivateRoute><GameWrapper /></PrivateRoute>} />
                    <Route path="/topic-select" element={<PrivateRoute><TopicSelect /></PrivateRoute>} />
                    <Route path="/lobby" element={<Lobby/>} />
                    <Route path="/game" element={<PrivateRoute><Game /></PrivateRoute>} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </Router>
    );
}

export default App;
