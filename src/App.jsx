import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Help from './pages/Help'

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/help" element={<Help />} />
        </Routes>
    )
}
