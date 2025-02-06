// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import { QrCode, Calendar, Users, Trophy } from 'lucide-react';
// import Navbar from '../components/Navbar';

// export default function Dashboard() {
//   const [userDetails, setUserDetails] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [selectedQR, setSelectedQR] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch user details
//         const userResponse = await axios.post('http://localhost:4000/api/v1/users/userinfo',{
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         console.log("userResponse", userResponse);
//         setUserDetails(userResponse.data.data);

//         // Fetch user's events
//         const eventsResponse = await axios.post('http://localhost:4000/api/v1/users/joinedgroups', {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         setEvents(eventsResponse.data.data);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const QRModal = ({ qrUrl, onClose }) => (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ scale: 0.5 }}
//         animate={{ scale: 1 }}
//         exit={{ scale: 0.5 }}
//         className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
//         onClick={e => e.stopPropagation()}
//       >
//         <img src={qrUrl} alt="QR Code" className="w-full h-auto" />
//         <button
//           onClick={onClose}
//           className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
//         >
//           Close
//         </button>
//       </motion.div>
//     </motion.div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="flex items-center justify-center h-[calc(100vh-64px)]">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           {/* User Profile Section */}
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             animate={{ opacity: 1, x: 0 }}
//             className="bg-white rounded-xl shadow-lg p-6 h-fit"
//           >
//             <div className="flex flex-col items-center">
//               <motion.img
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ delay: 0.2 }}
//                 src={userDetails?.avatar || `https://ui-avatars.com/api/?name=${userDetails?.name}`}
//                 alt="Profile"
//                 className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg"
//               />
//               <motion.h2
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.3 }}
//                 className="mt-4 text-xl font-bold text-gray-800"
//               >
//                 {userDetails?.name}
//               </motion.h2>
//               <div className="mt-4 w-full space-y-3">
//                 <div className="flex items-center justify-between text-gray-600">
//                   <span>Gender:</span>
//                   <span className="font-medium">{userDetails?.gender}</span>
//                 </div>
//                 <div className="flex items-center justify-between text-gray-600">
//                   <span>Roll No:</span>
//                   <span className="font-medium">{userDetails?.rollno}</span>
//                 </div>
//                 <div className="flex items-center justify-between text-gray-600">
//                   <span>Semester:</span>
//                   <span className="font-medium">{userDetails?.sem}</span>
//                 </div>
//               </div>
//             </div>
//           </motion.div>

//           {/* Events List Section */}
//           <div className="md:col-span-3">
//             <motion.h2
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-2xl font-bold text-gray-800 mb-6"
//             >
//               My Events
//             </motion.h2>
//             <div className="space-y-4">
//               {events.map((event, index) => (
//                 <motion.div
//                   key={event._id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                   className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-[1.02] transition-transform"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center space-x-4">
//                       <div className="bg-blue-100 p-3 rounded-lg">
//                         <Trophy className="h-6 w-6 text-blue-500" />
//                       </div>
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-800">
//                           {event.event.name}
//                         </h3>
//                         <p className="text-gray-600">Group: {event.name}</p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => setSelectedQR(event.qrCode)}
//                       className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
//                     >
//                       <QrCode className="h-6 w-6" />
//                     </button>
//                   </div>
//                   <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
//                     <div className="flex items-center">
//                       <Users className="h-4 w-4 mr-1" />
//                       <span>Score: {event.score}</span>
//                     </div>
//                     <div className="flex items-center">
//                       <Calendar className="h-4 w-4 mr-1" />
//                       <span>
//                         Time Limit: {new Date(event.timeLimit).toLocaleDateString()}
//                       </span>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       <AnimatePresence>
//         {selectedQR && (
//           <QRModal qrUrl={selectedQR} onClose={() => setSelectedQR(null)} />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }



import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  QrCode, 
  Calendar, 
  Users, 
  Trophy,
  Clock,
  MapPin,
  DollarSign,
  UserCheck,
  Sparkles,
  GraduationCap,
  X
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [userDetails, setUserDetails] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get('http://localhost:4000/api/v1/users/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUserDetails(userResponse.data.data);

        const eventsResponse = await axios.post('http://localhost:4000/api/v1/users/joinedgroups', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEvents(eventsResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const QRModal = ({ qrUrl, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
          <h3 className="text-xl font-bold text-center mb-4">Event QR Code</h3>
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <img src={qrUrl} alt="QR Code" className="w-full h-auto rounded-lg shadow-lg" />
        <p className="text-sm text-gray-500 text-center mt-4">
          Scan this QR code to verify your participation
        </p>
      </motion.div>
    </motion.div>
  );

  const EventModal = ({ event, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 100 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.5, opacity: 0, y: 100 }}
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-48">
          <img
            src={event.event.avatar}
            alt={event.event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-bold">{event.event.name}</h2>
            <p className="text-white/80">Group: {event.name}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm">{formatDate(event.event.startDate)}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm">{formatDate(event.event.endDate)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-5 w-5 text-blue-500" />
              <span>{event.event.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span>Prize Pool: ₹{event.event.pricePool.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <UserCheck className="h-5 w-5 text-purple-500" />
              <span>Team Size: {event.event.userLimit} members</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <GraduationCap className="h-5 w-5 text-orange-500" />
              <span>Eligible Branches: {event.event.allowBranch.join(', ')}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{event.event.description}</p>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedQR(event.qrCode);
              }}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <QrCode className="h-5 w-5 mr-2" />
              View QR Code
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* User Profile Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 h-fit backdrop-blur-sm bg-white/80"
          >
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2 
                }}
                className="relative"
              >
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-20" />
                <img
                  src={userDetails?.avatar || `https://ui-avatars.com/api/?name=${userDetails?.name}&background=3b82f6&color=fff`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl relative z-10"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mt-4"
              >
                <h2 className="text-2xl font-bold text-gray-800">{userDetails?.name}</h2>
                <p className="text-blue-500 font-medium">{userDetails?.rollno}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 w-full space-y-4"
              >
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium text-gray-900">{userDetails?.gender}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Semester</p>
                  <p className="font-medium text-gray-900">{userDetails?.sem}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Events List Section */}
          <div className="md:col-span-3">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-800 mb-6"
            >
              My Events
            </motion.h2>
            <div className="grid grid-cols-1 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex">
                    <div className="w-1/4">
                      <img
                        src={event.event.avatar}
                        alt={event.event.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-3/4 p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {event.event.name}
                          </h3>
                          <p className="text-gray-600">Group: {event.name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                            {event.event.category}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                          <span>{new Date(event.event.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-red-500" />
                          <span>{event.event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                          <span>₹{event.event.pricePool.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedQR && (
          <QRModal qrUrl={selectedQR} onClose={() => setSelectedQR(null)} />
        )}
        {selectedEvent && (
          <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}