// src/routers/AppRouter.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Announcements from "../pages/Announcements";
import Home from "../pages/Home";
import About from "../pages/About";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={< Home/>}/>
        <Route path="/announcements" element= {<Announcements />} />
        <Route path="/about" element={<About />} />
        {/* 这里可以继续添加其他页面 */}
      </Routes>
    </Router>
  );
}

export default AppRouter;
