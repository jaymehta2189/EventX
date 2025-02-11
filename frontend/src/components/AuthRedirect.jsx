import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

function AuthRedirect() {
  const navigate = useNavigate();
  const { setAuthToken } = useContext(AuthContext);

  useEffect(() => {
    // Try to get the token from the cookie
    const token = Cookies.get('token');
    if (token) {
      // Store token in localStorage and update axios headers
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Update our global auth state
      setAuthToken(token);
      // Remove the token cookie so it isn’t processed again
      Cookies.remove('token');
      // Optionally, show a success message
      toast.success('Google login successful!');
      // Redirect to the home page (or wherever)
      navigate('/home');
    } else {
      // If no token is found, redirect to sign in
      navigate('/signin');
    }
  }, [navigate, setAuthToken]);

  return <div>Processing authentication...</div>;
}

export default AuthRedirect;
