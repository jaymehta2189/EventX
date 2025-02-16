
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import AuthRedirect from './components/AuthRedirect';
import Home from './pages/Home';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import About from './pages/About';
import EditProfile from './pages/EditProfile';
import PrivateRoute from './components/PrivateRoute';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import EventRegistration from './pages/EventRegistration';
import CreateEvent from './pages/CreateEvent';
import GroupsPage from './pages/GroupsPage';
import Dashboard from './pages/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          {/* Dedicated route to handle token processing */}
          <Route path="/auth/redirect" element={<AuthRedirect />} />
          
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/about" element={<About />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          
          <Route 
            path="/events" 
            element={
              <PrivateRoute>
                <Events />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/groups/:eventId" 
            element={
              <PrivateRoute>
                <GroupsPage />
              </PrivateRoute>
            }
          />
          <Route 
            path="/events/:id" 
            element={
              <PrivateRoute>
                <EventDetails />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/events/:id/register" 
            element={
              <PrivateRoute>
                <EventRegistration />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/create-event"
            element={
              <PrivateRoute>
                <CreateEvent />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard/:id"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider> 
  );
}

export default App;