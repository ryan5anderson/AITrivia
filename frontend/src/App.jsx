import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GameWrapper from './pages/GameWrapper';
import TopicSelect from './pages/TopicSelect';
import Game from './pages/Game';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/lobby" element={<GameWrapper />} />
                <Route path="/topic-select" element={<TopicSelect />} />
                <Route path="/game" element={<Game />} />
            </Routes>
        </Router>
    );
}

export default App;
