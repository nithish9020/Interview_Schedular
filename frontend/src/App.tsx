// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register"; // if you made this earlier

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}
