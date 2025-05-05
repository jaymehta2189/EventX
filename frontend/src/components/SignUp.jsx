import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
    
  });
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      console.log(formData.email);
      await axios.post(`${API_BASE_URL}/api/v1/users/sendOTP`, {
        email: formData.email
      });
      setOtpSent(true);
      toast.success('OTP sent successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/v1/users/signup`, formData);
      toast.success('Signup successful! Please login.');
      navigate('/signin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-96 transform transition-all hover:scale-105">
      
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              name="otp"
              placeholder="OTP"
              value={formData.otp}
              onChange={handleChange}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
            <button
              type="button"
              onClick={handleSendOTP}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
            >
              Send OTP
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-105"
          >
            Sign Up
          </button>
          
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/signin')}
            className="text-blue-500 cursor-pointer hover:underline font-semibold"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;