import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function EventRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [userLimit, setUserLimit] = useState(0);
  const [formData, setFormData] = useState({
    teamName: '',
    leaderEmail: '',
    memberEmails: []
  });

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/events/view/${id}`);
        setEventName(response.data.data.name);
        setUserLimit(response.data.data.userLimit);
        // Initialize memberEmails array with empty strings based on userLimit
        setFormData(prev => ({
          ...prev,
          memberEmails: Array(response.data.data.userLimit - 1).fill('')
        }));
      } catch (error) {
        console.error('Error fetching event details:', error);
        toast.error('Error fetching event details');
      }
    };
    fetchEventDetails();
  }, [id]);

  const handleChange = (e) => {
    if (e.target.name === 'memberEmail') {
      const index = parseInt(e.target.dataset.index);
      const newMemberEmails = [...formData.memberEmails];
      newMemberEmails[index] = e.target.value;
      setFormData({ ...formData, memberEmails: newMemberEmails });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty email addresses
    const filteredMemberEmails = formData.memberEmails.filter(email => email !== '');

    // Prepare data in the required format
    const registrationData = {
      name: formData.teamName,
      event: id,
      groupLeader: formData.leaderEmail,
      validMemberEmail: filteredMemberEmails
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:4000/api/v1/groups/create`, registrationData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Registration successful!');
      navigate('/events');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="relative h-48">
              <img
                src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80"
                alt="Event Registration"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
              <h1 className="absolute bottom-4 left-6 text-3xl font-bold text-white">
                Team Registration for {eventName}
              </h1>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team Leader's Email
                  </label>
                  <input
                    type="email"
                    name="leaderEmail"
                    value={formData.leaderEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Dynamically generate member email fields based on userLimit */}
                {formData.memberEmails.map((email, index) => (
                  <div key={index}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team Member {index + 1} Email
                    </label>
                    <input
                      type="email"
                      name="memberEmail"
                      data-index={index}
                      value={email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                      required={index === 0} // Make at least one member email required
                    />
                    {index > 0 && (
                      <p className="mt-1 text-sm text-gray-500">Optional</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(`/events/${id}`)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Register Team
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default EventRegistration;