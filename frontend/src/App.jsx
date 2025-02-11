// import { useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import SignUp from './components/SignUp';
// import SignIn from './components/SignIn';
// import Home from './pages/Home';
// import About from './pages/About';
// import CreateEvent from './pages/CreateEvent';
// import Events from './pages/Events';
// import EventDetails from './pages/EventDetails';
// import EventRegistration from './pages/EventRegistration';
// import EditProfile from './pages/EditProfile';
// import PrivateRoute from './components/PrivateRoute';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Dashboard from './pages/Dashboard';

// function App() {
//   useEffect(() => {
//     // Check for token in cookies (for Google auth)
//     const token = Cookies.get('token');
//     if (token) {
//       // Store token in localStorage and set axios header
//       localStorage.setItem('token', token);
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
//       // Remove the cookie after processing
//       Cookies.remove('token');
      
//       // Show success message
//       toast.success('Google login successful!');
//     } else {
//       // Check for existing token in localStorage
//       const existingToken = localStorage.getItem('token');
//       if (existingToken) {
//         axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
//       }
//     }
//   }, []);

//   return (
//     <Router>
//       <ToastContainer
//         autoClose={1000}
//       />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/home" element={<Home />} />
//         <Route path="/signup" element={<SignUp />} />
//         <Route path="/signin" element={<SignIn />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/edit-profile" element={<EditProfile />} />
//         <Route 
//           path="/events" 
//           element={
//             <PrivateRoute>
//               <Events />
//             </PrivateRoute>
//           } 
//         />
//         <Route 
//           path="/events/:id" 
//           element={
//             <PrivateRoute>
//               <EventDetails />
//             </PrivateRoute>
//           } 
//         />
//         <Route 
//           path="/events/:id/register" 
//           element={
//             <PrivateRoute>
//               <EventRegistration />
//             </PrivateRoute>
//           } 
//         />
//         <Route 
//         path="/create-event"
//         element={
//         <PrivateRoute>
//           <CreateEvent />
//         </PrivateRoute>
//       } 
//       />
//       <Route 
//         path="/dashboard/:id"
//         element={
//         <PrivateRoute>
//           <Dashboard />
//         </PrivateRoute>
//       } 
//       />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

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
import Dashboard from './pages/Dashboard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer autoClose={1000} />
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
