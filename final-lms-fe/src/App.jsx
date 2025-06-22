import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { Box } from "@mui/material";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Catalog from "./pages/Catalog/Catalog";
import AdminPanel from "./pages/Admin/AdminPanel";
import InstructorPanel from "./pages/Instructor/InstructorPanel";
import StudentPanel from "./pages/Student/StudentPanel";
import OAuthCallback from "./pages/Auth/OAuthCallback";

function App() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/adminPanel" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPanel /></ProtectedRoute>} />
        <Route path="/instructorPanel" element={<ProtectedRoute allowedRoles={["teacher"]}><InstructorPanel /></ProtectedRoute>} />
        <Route path="/studentPanel" element={<ProtectedRoute allowedRoles={["student"]}><StudentPanel /></ProtectedRoute>} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
      </Routes>
    </Box>
  );
}

export default App;
