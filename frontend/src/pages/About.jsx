import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

function About() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">About EventX</h1>
          
          <div className="mb-8">
            <img 
              src="https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Event Management" 
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          </div>

          <div className="space-y-6 text-gray-600">
            <p>
              EventX is your premier destination for event management solutions. We specialize in creating, organizing, and managing events that leave lasting impressions.
            </p>

            <h2 className="text-2xl font-bold text-gray-800">Our Services</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-600 mb-2">Event Planning</h3>
                <p>Comprehensive event planning services from concept to execution.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-bold text-purple-600 mb-2">Venue Management</h3>
                <p>Access to premium venues and complete venue management services.</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold text-green-600 mb-2">Technical Support</h3>
                <p>Full technical support for both virtual and physical events.</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-bold text-red-600 mb-2">Marketing & Promotion</h3>
                <p>Strategic marketing and promotion to ensure event success.</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800">Why Choose Us?</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Experienced team of event professionals</li>
              <li>Customized solutions for every event</li>
              <li>State-of-the-art event management platform</li>
              <li>24/7 customer support</li>
              <li>Competitive pricing</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default About;