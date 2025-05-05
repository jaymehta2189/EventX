
import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';

function AuthRedirect() {
  const navigate = useNavigate();
  const { setAuthToken } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Set the token in both localStorage and cookie
      localStorage.setItem('token', token);
      Cookies.set('token', token, { 
        path: '/',
        secure: true,
        sameSite: 'None'
      });
      setAuthToken(token);
      toast.success('Google login successful!');
      navigate('/home', { replace: true });
    } else {
      navigate('/signin');
    }
  }, [token, navigate, setAuthToken]);

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