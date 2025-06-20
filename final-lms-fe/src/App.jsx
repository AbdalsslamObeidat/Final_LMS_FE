import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Catalog from './pages/Catalog/Catalog';
import Player from './pages/Player/Player';
import AdminPanel from './pages/Admin/AdminPanel';
import InstructorPanel from './pages/Instructor/InstructorPanel';
import { PrivateRoute } from './utils/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/player/:courseId" element={<Player />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute roles={["admin"]}>
            <AdminPanel />
          </PrivateRoute>
        }
      />
      <Route
        path="/instructor"
        element={
          <PrivateRoute roles={["instructor"]}>
            <InstructorPanel />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;