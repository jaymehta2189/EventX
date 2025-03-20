
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

function Navbar() {
  const navigate = useNavigate();
  const { authToken, logout } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (authToken) {
      try {
        const userData = JSON.parse(atob(authToken.split('.')[1]));
        setUser(userData);
      } catch (error) {
        console.error('Error parsing token:', error);
        logout();
      }
    } else {
      setUser(null);
    }
  }, [authToken, logout]);

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/v1/users/logout`, null, {
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        withCredentials: true
      });

      logout();
      toast.success('Logged out successfully');
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error.message);
      toast.error('Error logging out');
      logout();
      navigate('/signin');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div 
          className="text-white font-bold text-xl cursor-pointer" 
          onClick={() => navigate('/')}
        >
          EventX
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => navigate('/')} 
            className="text-white hover:text-blue-200 transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => navigate('/about')} 
            className="text-white hover:text-blue-200 transition-colors"
          >
            About Us
          </button>
          <button 
            onClick={() => navigate('/events')} 
            className="text-white hover:text-blue-200 transition-colors"
          >
            Events
          </button>
          {user?.role === 'org' && (
            <button 
              onClick={() => navigate('/create-event')} 
              className="text-white hover:text-blue-200 transition-colors"
            >
              Create Event
            </button>
          )}
          {user?.role === 'staff' && (
            <button 
              onClick={() => navigate('/manage-organizers')} 
              className="text-white hover:text-blue-200 transition-colors"
            >
              Manage Organizers
            </button>
          )}

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-10">
                  <div 
                    className="px-4 py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate(`/dashboard/${user._id}`);
                    }}
                  >
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate(`/edit-profile/${user._id}`);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Edit Profile
                  </button>
                  {user.role === 'org' && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate(`/scan-qr/${user._id}`);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Scan QR
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => navigate('/signin')} 
              className="text-white hover:text-blue-200 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;