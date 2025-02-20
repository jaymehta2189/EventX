import { useState, useEffect } from 'react';
import { useNavigate, useLocation,useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

function EditProfile() {
  const navigate = useNavigate();
  // const location = useLocation();
   const { id } = useParams()
 
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    sem: '',
    rollno: '',
    contactdetails: ''
  });

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/users/user/${id}`);

        console.log(response.data);
        setFormData(prevData => ({
          ...prevData,
          name: response.data.data.name
        }));
      } catch (error) {
        toast.error('Error fetching user data');
      }
    };
    if (id) {
      fetchUserName();
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:4000/api/v1/users/profile/${id}`, formData);
     
        // const token = response.data.data;
        // console.log("update profile token", token);
        // localStorage.setItem('token', token);
        // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        toast.success('Updated successfully!');
        console.log("update profile", response.data);
        navigate('/home');
      }
       catch (error) {
        toast.error(error.response?.data?.message || 'Login failed');
      }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
              <h2 className="text-3xl font-bold text-white">
                {id ? 'Complete Your Profile' : 'Edit Profile'}
              </h2>
              <p className="text-blue-100 mt-2">
                {id 
                  ? 'Welcome! Please provide some additional information to complete your profile.'
                  : 'Update your profile information below.'}
              </p>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Name Field (Disabled) */}
              <div>
                <label className="inline-flex items-center text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Role Selection */}
              {/* <div>
                <label className="inline-flex items-center text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="user">User</option>
                  <option value="org">Organization</option>
                  <option value="admin">Admin</option>
                  <option value="hod">HOD</option>
                </select>
              </div> */}

              {/* Gender Selection */}
              <div>
                <label className="inline-flex items-center text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Semester Selection */}
              <div>
                <label className="inline-flex items-center text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Semester
                </label>
                <select
                  name="sem"
                  value={formData.sem}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              {/* Roll Number */}
              <div>
                <label className="inline-flex items-center text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  Roll Number
                </label>
                <input
                  type="text"
                  name="rollno"
                  value={formData.rollno}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Enter your roll number"
                />
              </div>

              {/* Contact Details */}
              <div>
                <label className="inline-flex items-center text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contact Details
                </label>
                <input
                  type="tel"
                  name="contactdetails"
                  value={formData.contactdetails}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Enter your contact number"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {id ? 'Complete Profile' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;