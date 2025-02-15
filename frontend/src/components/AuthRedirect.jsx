import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

function AuthRedirect() {
  const navigate = useNavigate();
  const { setAuthToken } = useContext(AuthContext);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      setAuthToken(token); // This will trigger the AuthContext useEffect to handle localStorage and axios
      toast.success('Google login successful!');
      navigate('/home');
    } else {
      navigate('/signin');
    }
  }, [navigate, setAuthToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}

export default AuthRedirect;