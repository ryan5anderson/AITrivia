import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import GameWrapper from './pages/GameWrapper';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game" element={<GameWrapper />} />
            </Routes>
        </Router>
    );
}

export default App;
