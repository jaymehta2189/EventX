import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

function Home() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchEvents = async () => {
  //     try {
  //       const response = await axios.get('http://localhost:4000/api/v1/events');
  //       setEvents(response.data.data?.slice(0, 3) || []); // Only show first 3 events, handle null data
  //     } catch (error) {
  //       console.error('Error fetching events:', error.message);
  //     }
  //   };
  //   fetchEvents();
  // }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Event background"
            className="w-full h-full object-cover opacity-50"
          />
        </div>
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">Discover Amazing Events Near You</h1>
            <p className="text-xl mb-8">Join thousands of people who trust EventHub for discovering and managing their events.</p>
            <button
              onClick={() => navigate('/events')}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Explore Events
            </button>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      {/* <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Featured Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105">
                <img
                  src={event.avatar || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                  alt={event.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{event.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-semibold">
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => navigate(`/events/${event._id}`)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/events')}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              View All Events
            </button>
          </div>
        </div>
      </div> */}

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Why Choose EventX?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Get instant notifications about event changes and updates.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Driven</h3>
              <p className="text-gray-600">Connect with like-minded people at events you love.</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
              <p className="text-gray-600">Your data and transactions are always protected.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Home;