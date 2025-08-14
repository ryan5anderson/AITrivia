import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function AuthHeader() {
    const [session, setSession] = useState(null);
    const navigate = useNavigate();

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
            <div style={{ fontWeight: 'bold' }}>AI Trivia</div>
            <button
                onClick={handleSignOut}
                style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer'
                }}
            >
                Sign Out
            </button>
        </div>
    );
}

export default AuthHeader;


