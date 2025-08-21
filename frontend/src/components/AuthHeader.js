import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaUserCircle } from 'react-icons/fa';

function AuthHeader() {
    const [session, setSession] = useState(null);
    const navigate = useNavigate();
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
        });
        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const togglePopup = () => {
        setShowPopup(!showPopup);
    };

    if (!session) {
        return null;
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #eee',
            marginBottom: '1rem'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ fontWeight: 'bold' }}>AI Trivia</div>
                <div onClick={togglePopup} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: 'auto', position: 'absolute', right: '10px' }}>
                    <FaUserCircle size={30} />
                </div>
                {showPopup && (
                    <div style={{ position: 'absolute', top: '50px', right: '10px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px', padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        <p>Name: {session.user.name}</p>
                        <p>Email: {session.user.email}</p>
                        <p>Wins: {session.user.wins}</p>
                        <p>Games Played: {session.user.gamesPlayed}</p>
                        <button onClick={handleSignOut} style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#f8f9fa', cursor: 'pointer' }}>Sign Out</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AuthHeader;


