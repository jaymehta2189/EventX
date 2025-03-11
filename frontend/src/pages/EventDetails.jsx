
// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import {
//   Calendar,
//   Clock,
//   MapPin,
//   Users,
//   Copy,
//   Loader2,
//   Tag,
//   Trophy,
//   UserPlus,
//   UserCheck,
//   AlertCircle,
//   School
// } from 'lucide-react';
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';

// function EventDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [event, setEvent] = useState(null);
//   const [existingGroup, setExistingGroup] = useState(null);
//   const [teamCode, setTeamCode] = useState('');
//   const [newTeamName, setNewTeamName] = useState('');
//   const [joiningTeam, setJoiningTeam] = useState(false);
//   const [creatingTeam, setCreatingTeam] = useState(false);

//   useEffect(() => {
//     const fetchEventDetails = async () => {
//       try {
//         const response = await axios.get(`http://localhost:4000/api/v1/events/event/${id}`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`, // Send Authorization token separately
//           },
//           withCredentials: true, // Ensures cookies are sent
//         });
//         setEvent(response.data.data.event);
//         console.log(response.data.data.existGroup)
//         setExistingGroup(response.data.data.existGroup);
//       } catch (error) {
//         console.error('Error fetching event details:', error);
//         toast.error('Failed to load event details');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEventDetails();
//   }, [id]);

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     toast.success('Team code copied to clipboard!');
//   };

//   const handleJoinTeam = async () => {
//     if (!teamCode.trim()) {
//       toast.error('Please enter a team code');
//       return;
//     }

//     try {
//       setJoiningTeam(true);
//       const response = await axios.post(`http://localhost:4000/api/v1/groups/group/join`, {
//         code: teamCode,
//         event: id
//       });
//       setExistingGroup(response.data.data);
//       toast.success('Successfully joined the team!');
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to join team');
//     } finally {
//       setJoiningTeam(false);
//     }
//   };

//   const handleCreateTeam = async () => {
//     if (!newTeamName.trim()) {
//       toast.error('Please enter a team name');
//       return;
//     }

//     try {
//       setCreatingTeam(true);
//       const response = await axios.post(`http://localhost:4000/api/v1/groups/group`, {
//         name: newTeamName,
//         event: id
//       });
//       setExistingGroup(response.data.data);
//       toast.success('Team created successfully!');
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to create team');
//     } finally {
//       setCreatingTeam(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//         <Navbar />
//         <div className="flex items-center justify-center h-[calc(100vh-64px)]">
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//           >
//             <Loader2 className="w-12 h-12 text-blue-500" />
//           </motion.div>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   if (!event) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//         <Navbar />
//         <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-4">
//           <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
//           <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
//           <button
//             onClick={() => navigate('/events')}
//             className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
//           >
//             Back to Events
//           </button>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//       <Navbar />
//       <div className="container mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Event Details Section */}
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden"
//           >
//             <div className="relative h-64 md:h-96">
//               <img
//                 src={event.avatar || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
//                 alt={event.name}
//                 className="w-full h-full object-cover"
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//               <div className="absolute bottom-6 left-6 right-6">
//                 <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.name}</h1>
//                 <div className="flex items-center space-x-4">
//                   <span className="px-3 py-1 bg-blue-500/80 backdrop-blur-sm text-white rounded-full text-sm">
//                     {event.category}
//                   </span>
//                   <span className="flex items-center text-white/90">
//                     <Trophy className="w-4 h-4 mr-1" />
//                     ₹ {event.pricePool.toLocaleString()}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="p-6 space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.2 }}
//                   className="space-y-4"
//                 >
//                   <div className="flex items-start space-x-3">
//                     <Calendar className="w-5 h-5 text-blue-500 mt-1" />
//                     <div>
//                       <h3 className="font-semibold text-gray-800">Date</h3>
//                       <p className="text-gray-600">{`From
//                         ${new Date(event.startDate).toLocaleDateString('en-US', {
//                         weekday: 'long',
//                         year: 'numeric',
//                         month: 'long',
//                         day: 'numeric'
//                       })} `}
//                       </p>
//                       {`To 
//                           ${new Date(event.endDate).toLocaleDateString('en-US', {
//                         weekday: 'long',
//                         year: 'numeric',
//                         month: 'long',
//                         day: 'numeric'
//                       })}                         `}
//                     </div>
//                   </div>

//                   <div className="flex items-start space-x-3">
//                     <Clock className="w-5 h-5 text-blue-500 mt-1" />
//                     <div>
//                       <h3 className="font-semibold text-gray-800">Time</h3>
//                       <p className="text-gray-600">
//                         {new Date(event.startDate).toLocaleTimeString('en-US', {
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })} - {new Date(event.endDate).toLocaleTimeString('en-US', {
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-start space-x-3">
//                     <MapPin className="w-5 h-5 text-blue-500 mt-1" />
//                     <div>
//                       <h3 className="font-semibold text-gray-800">Location</h3>
//                       <p className="text-gray-600">{event.location}</p>
//                     </div>
//                   </div>
//                 </motion.div>

//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.3 }}
//                   className="space-y-4"
//                 >
//                   <div className="flex items-start space-x-3">
//                     <Users className="w-5 h-5 text-blue-500 mt-1" />
//                     <div>
//                       <h3 className="font-semibold text-gray-800">Team Size</h3>
//                       <p className="text-gray-600">{event.userLimit} members per team</p>
//                       {event.girlMinLimit > 0 && (
//                         <p className="text-sm text-pink-600">
//                           Minimum {event.girlMinLimit} female participant(s) required
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex items-start space-x-3">
//                     <School className="w-5 h-5 text-blue-500 mt-1" />
//                     <div>
//                       <h3 className="font-semibold text-gray-800">Eligible Branches</h3>
//                       <div className="flex flex-wrap gap-2 mt-1">
//                         {event.allowBranch.map((branch) => (
//                           <span
//                             key={branch}
//                             className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-sm"
//                           >
//                             {branch}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               </div>

//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4 }}
//                 className="bg-gray-50 rounded-xl p-6"
//               >
//                 <h3 className="font-semibold text-gray-800 mb-3">Description</h3>
//                 <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
//               </motion.div>
//             </div>
//           </motion.div>

//           {/* Team Management Section */}
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             className="bg-white rounded-2xl shadow-xl p-6 h-fit"
//           >
//             {existingGroup ? (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="space-y-6"
//               >
//                 <div className="text-center">
//                   <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
//                     <UserCheck className="w-8 h-8 text-green-500" />
//                   </div>
//                   <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Team</h2>
//                   <p className="text-gray-600">{existingGroup.name}</p>
//                 </div>

//                 <div className="bg-gray-50 rounded-xl p-4">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm font-medium text-gray-500">Team Code </span>
//                     <button
//                       onClick={() => copyToClipboard(existingGroup.code)}
//                       className="text-blue-500 hover:text-blue-600 transition-colors"
//                     >
//                       <Copy className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <p className="text-lg font-mono text-center bg-white rounded-lg py-2 border border-gray-200">
//                     {existingGroup.code}
//                   </p>
//                 </div>

//                 <div>
//                   <h3 className="text-sm font-medium text-gray-500 mb-3">Team Members</h3>
//                   <div className="space-y-2">
//                     {existingGroup.usersName.map((user, index) => (
//                       <motion.div
//                         key={index}
//                         initial={{ opacity: 0, x: -20 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: index * 0.1 }}
//                         className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300"
//                       >
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center space-x-3">
//                             <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white font-medium">
//                               {user.charAt(0).toUpperCase()}
//                             </div>
//                             <div>
//                               <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
//                                 {user}
//                               </p>
//                             </div>
//                           </div>
//                           <div className="w-2 h-2 rounded-full bg-green-500" />
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>
//               </motion.div>
//             ) : (
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.95 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 className="space-y-8"
//               >
//                 <div className="text-center">
//                   <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
//                     <UserPlus className="w-8 h-8 text-blue-500" />
//                   </div>
//                   <h2 className="text-2xl font-bold text-gray-800 mb-2">Join Event</h2>
//                   <p className="text-gray-600">Join an existing team or create a new one</p>
//                 </div>

//                 <div className="space-y-6">
//                   <div className="space-y-4">
//                     <h3 className="font-medium text-gray-800">Join Existing Team</h3>
//                     <div className="space-y-3">
//                       <input
//                         type="text"
//                         value={teamCode}
//                         onChange={(e) => setTeamCode(e.target.value)}
//                         placeholder="Enter team code"
//                         className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                       />
//                       <button
//                         onClick={handleJoinTeam}
//                         disabled={joiningTeam}
//                         className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
//                       >
//                         {joiningTeam ? (
//                           <span className="flex items-center justify-center">
//                             <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                             Joining...
//                           </span>
//                         ) : (
//                           'Join Team'
//                         )}
//                       </button>
//                     </div>
//                   </div>

//                   <div className="relative">
//                     <div className="absolute inset-0 flex items-center">
//                       <div className="w-full border-t border-gray-300" />
//                     </div>
//                     <div className="relative flex justify-center text-sm">
//                       <span className="px-2 bg-white text-gray-500">OR</span>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <h3 className="font-medium text-gray-800">Create New Team</h3>
//                     <div className="space-y-3">
//                       <input
//                         type="text"
//                         value={newTeamName}
//                         onChange={(e) => setNewTeamName(e.target.value)}
//                         placeholder="Enter team name"
//                         className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
//                       />
//                       <button
//                         onClick={handleCreateTeam}
//                         disabled={creatingTeam}
//                         className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300"
//                       >
//                         {creatingTeam ? (
//                           <span className="flex items-center justify-center">
//                             <Loader2 className="w-5 h-5 animate-spin mr-2" />
//                             Creating...
//                           </span>
//                         ) : (
//                           'Create Team'
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </motion.div>
//             )}
//           </motion.div>
//         </div>
//       </div>
//       <Footer />
//     </div>
//   );
// }

// export default EventDetails;



import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Copy,
  Loader2,
  Tag,
  Trophy,
  UserPlus,
  UserCheck,
  AlertCircle,
  School,
  CheckCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
// import { set } from '../../../backend/src/routes/user.route';
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [existingGroup, setExistingGroup] = useState(null);
  const [teamCode, setTeamCode] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [verifyingTeam, setVerifyingTeam] = useState(false);
  const [verification, setVerification] = useState(false);
  
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/events/event/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send Authorization token separately
          },
          withCredentials: true, // Ensures cookies are sent
        });
        setEvent(response.data.data.event);
        console.log(response.data.data.existGroup)
        setExistingGroup(response.data.data.existGroup);
        // if(response.data.data.existGroup.isReadyForVerification==="ready"){
        //   setVerification(true);
        // }
      } catch (error) {
        console.error('Error fetching event details:', error);
        toast.error('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetails();
  }, [id,verification]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Team code copied to clipboard!');
  };

  const handleJoinTeam = async () => {
    if (!teamCode.trim()) {
      toast.error('Please enter a team code');
      return;
    }

    try {
      setJoiningTeam(true);
      const response = await axios.post(`${API_BASE_URL}/api/v1/groups/group/join`, {
        code: teamCode,
        event: id
      });
      setExistingGroup(response.data.data);
      toast.success('Successfully joined the team!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join team');
    } finally {
      setJoiningTeam(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error('Please enter a team name');
      return;
    }

    try {
      setCreatingTeam(true);
      const response = await axios.post(`${API_BASE_URL}/api/v1/groups/group`, {
        name: newTeamName,
        event: id
      });
      setExistingGroup(response.data.data);
      toast.success('Team created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    } finally {
      setCreatingTeam(false);
    }
  };
  
  const handleVerifyTeam = async () => {
    if (!existingGroup || !existingGroup._id) {
      toast.error('Team information is missing');
      return;
    }

    try {
      setVerifyingTeam(true);
      const response = await axios.post(`${API_BASE_URL}/api/v1/groups/verifyGroup`, {
        group: existingGroup._id,
        event: id
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });
      setVerification(true);
      // Update the existing group with the latest data if returned
      if (response.data.data) {
        setExistingGroup(response.data.data);
        // setVerification(false);
      }
      
      toast.success('Team verification submitted successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify team');
    } finally {
      setVerifyingTeam(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-blue-500" />
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-4">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/events')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Events
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="relative h-64 md:h-96">
              <img
                src={event.avatar || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                alt={event.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.name}</h1>
                <div className="flex items-center space-x-4">
                  <span className="px-3 py-1 bg-blue-500/80 backdrop-blur-sm text-white rounded-full text-sm">
                    {event.category}
                  </span>
                  <span className="flex items-center text-white/90">
                    <Trophy className="w-4 h-4 mr-1" />
                    ₹ {event.pricePool.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Date</h3>
                      <p className="text-gray-600">{`From
                        ${new Date(event.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })} `}
                      </p>
                      {`To 
                          ${new Date(event.endDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}                         `}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Time</h3>
                      <p className="text-gray-600">
                        {new Date(event.startDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(event.endDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Location</h3>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-start space-x-3">
                    <Users className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Team Size</h3>
                      <p className="text-gray-600">{event.userLimit} members per team</p>
                      {event.girlMinLimit > 0 && (
                        <p className="text-sm text-pink-600">
                          Minimum {event.girlMinLimit} female participant(s) required
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <School className="w-5 h-5 text-blue-500 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-800">Eligible Branches</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {event.allowBranch.map((branch) => (
                          <span
                            key={branch}
                            className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-sm"
                          >
                            {branch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <h3 className="font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Team Management Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 h-fit"
          >
            {existingGroup ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <UserCheck className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Team</h2>
                  <p className="text-gray-600">{existingGroup.name}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Team Code </span>
                    <button
                      onClick={() => copyToClipboard(existingGroup.code)}
                      className="text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-lg font-mono text-center bg-white rounded-lg py-2 border border-gray-200">
                    {existingGroup.code}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Team Members</h3>
                  <div className="space-y-2">
                    {existingGroup.usersName.map((user, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white font-medium">
                              {user.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                                {user}
                              </p>
                            </div>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Verify Team Button - Only show when isReadyForVerification is "ready" */}
                { existingGroup.isReadyForVerification==='ready'  && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <button
                      onClick={handleVerifyTeam}
                      disabled={verifyingTeam}
                      className="w-full bg-green-500 text-white py-3 rounded-lg flex items-center justify-center hover:bg-green-600 transition-colors disabled:bg-green-300"
                    >
                      {verifyingTeam ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Verifying...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Verify Team
                        </span>
                      )}
                    </button>
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Your team is ready for verification. Click the button above to proceed.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <UserPlus className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Join Event</h2>
                  <p className="text-gray-600">Join an existing team or create a new one</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">Join Existing Team</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={teamCode}
                        onChange={(e) => setTeamCode(e.target.value)}
                        placeholder="Enter team code"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <button
                        onClick={handleJoinTeam}
                        disabled={joiningTeam}
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                      >
                        {joiningTeam ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Joining...
                          </span>
                        ) : (
                          'Join Team'
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-800">Create New Team</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Enter team name"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <button
                        onClick={handleCreateTeam}
                        disabled={creatingTeam}
                        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300"
                      >
                        {creatingTeam ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Creating...
                          </span>
                        ) : (
                          'Create Team'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default EventDetails;