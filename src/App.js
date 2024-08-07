import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import Register from "./pages/Register";
import useAuthCheck from "./hooks/useAuthCheck";
import PrivetRoutes from "./routes/PrivetRoutes";
import PublicRoutes from "./routes/PublicRoutes";

function App() {
  const authChecked = useAuthCheck();

  return !authChecked ? (
    <div>Checking authentication</div>
  ) : (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoutes>
              <Login />
            </PublicRoutes>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoutes>
              <Register />
            </PublicRoutes>
          }
        />
        <Route
          path="/inbox"
          element={
            <PrivetRoutes>
              <Conversation />
            </PrivetRoutes>
          }
        />
        <Route
          path="/inbox/:id"
          element={
            <PrivetRoutes>
              <Inbox />
            </PrivetRoutes>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
