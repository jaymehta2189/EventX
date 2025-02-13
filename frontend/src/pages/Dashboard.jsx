
// import { useState, useEffect } from 'react';
// import {useParams} from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import { 
//   QrCode, 
//   Calendar, 
//   Users, 
//   Trophy,
//   Clock,
//   MapPin,
//   DollarSign,
//   UserCheck,
//   Sparkles,
//   GraduationCap,
//   X
// } from 'lucide-react';
// import Navbar from '../components/Navbar';

// export default function Dashboard() {
//   const {id}=useParams();
//   const [userDetails, setUserDetails] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [selectedQR, setSelectedQR] = useState(null);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {

//     const fetchData = async () => {
//       try {
//         const userResponse = await axios.get(`http://localhost:4000/api/v1/users/user/${id}`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         setUserDetails(userResponse.data.data);

//         const eventsResponse = await axios.get(`http://localhost:4000/api/v1/users/user/${id}/groups`, {
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

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const QRModal = ({ qrUrl, onClose }) => (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ scale: 0.5, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0.5, opacity: 0 }}
//         className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
//         onClick={e => e.stopPropagation()}
//       >
//         <div className="relative">
//           <h3 className="text-xl font-bold text-center mb-4">Event QR Code</h3>
//           <button
//             onClick={onClose}
//             className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>
//         <img src={qrUrl} alt="QR Code" className="w-full h-auto rounded-lg shadow-lg" />
//         <p className="text-sm text-gray-500 text-center mt-4">
//           Scan this QR code to verify your participation
//         </p>
//       </motion.div>
//     </motion.div>
//   );

//   const EventModal = ({ event, onClose }) => (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ scale: 0.5, opacity: 0, y: 100 }}
//         animate={{ scale: 1, opacity: 1, y: 0 }}
//         exit={{ scale: 0.5, opacity: 0, y: 100 }}
//         className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
//         onClick={e => e.stopPropagation()}
//       >
//         <div className="relative h-48">
//           <img
//             src={event.event.avatar}
//             alt={event.event.name}
//             className="w-full h-full object-cover"
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 p-1 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors"
//           >
//             <X className="h-6 w-6" />
//           </button>
//           <div className="absolute bottom-4 left-4 text-white">
//             <h2 className="text-2xl font-bold">{event.event.name}</h2>
//             <p className="text-white/80">Group: {event.name}</p>
//           </div>
//         </div>

//         <div className="p-6 space-y-6">
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <div className="flex items-center text-gray-600">
//                 <Calendar className="h-5 w-5 mr-2 text-blue-500" />
//                 <div>
//                   <p className="text-sm font-medium">Start Date</p>
//                   <p className="text-sm">{formatDate(event.event.startDate)}</p>
//                 </div>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center text-gray-600">
//                 <Clock className="h-5 w-5 mr-2 text-blue-500" />
//                 <div>
//                   <p className="text-sm font-medium">End Date</p>
//                   <p className="text-sm">{formatDate(event.event.endDate)}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <div className="flex items-center space-x-2 text-gray-600">
//               <MapPin className="h-5 w-5 text-blue-500" />
//               <span>{event.event.location}</span>
//             </div>
//             <div className="flex items-center space-x-2 text-gray-600">
//               <DollarSign className="h-5 w-5 text-green-500" />
//               <span>Prize Pool: ₹{event.event.pricePool.toLocaleString()}</span>
//             </div>
//             <div className="flex items-center space-x-2 text-gray-600">
//               <UserCheck className="h-5 w-5 text-purple-500" />
//               <span>Team Size: {event.event.userLimit} members</span>
//             </div>
//             <div className="flex items-center space-x-2 text-gray-600">
//               <GraduationCap className="h-5 w-5 text-orange-500" />
//               <span>Eligible Branches: {event.event.allowBranch.join(', ')}</span>
//             </div>
//           </div>

//           <div className="bg-gray-50 rounded-xl p-4">
//             <h3 className="font-medium text-gray-900 mb-2">Description</h3>
//             <p className="text-gray-600">{event.event.description}</p>
//           </div>

//           <div className="flex justify-end space-x-4">
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelectedQR(event.qrCode);
//               }}
//               className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//             >
//               <QrCode className="h-5 w-5 mr-2" />
//               View QR Code
//             </button>
//           </div>
//         </div>
//       </motion.div>
//     </motion.div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//         <Navbar />
//         <div className="flex items-center justify-center h-[calc(100vh-64px)]">
//           <div className="relative">
//             <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin" />
//             <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-blue-500" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//       <Navbar />
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
//           {/* User Profile Section */}
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             animate={{ opacity: 1, x: 0 }}
//             className="bg-white rounded-2xl shadow-xl p-8 h-fit backdrop-blur-sm bg-white/80"
//           >
//             <div className="flex flex-col items-center">
//               <motion.div
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ 
//                   type: "spring",
//                   stiffness: 260,
//                   damping: 20,
//                   delay: 0.2 
//                 }}
//                 className="relative"
//               >
//                 <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-20" />
//                 <img
//                   src={userDetails?.avatar || `https://ui-avatars.com/api/?name=${userDetails?.name}&background=3b82f6&color=fff`}
//                   alt="Profile"
//                   className="w-32 h-32 rounded-full border-4 border-white shadow-xl relative z-10"
//                 />
//               </motion.div>
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3 }}
//                 className="text-center mt-4"
//               >
//                 <h2 className="text-2xl font-bold text-gray-800">{userDetails?.name}</h2>
//                 <p className="text-blue-500 font-medium">{userDetails?.rollno}</p>
//               </motion.div>
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.4 }}
//                 className="mt-6 w-full space-y-4"
//               >
//                 <div className="bg-gray-50 rounded-lg p-3">
//                   <p className="text-sm text-gray-500">Gender</p>
//                   <p className="font-medium text-gray-900">{userDetails?.gender}</p>
//                 </div>
//                 <div className="bg-gray-50 rounded-lg p-3">
//                   <p className="text-sm text-gray-500">Semester</p>
//                   <p className="font-medium text-gray-900">{userDetails?.sem}</p>
//                 </div>
//               </motion.div>
//             </div>
//           </motion.div>

//           {/* Events List Section */}
//           <div className="md:col-span-3">
//             <motion.h2
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-3xl font-bold text-gray-800 mb-6"
//             >
//               My Events
//             </motion.h2>
//             <div className="grid grid-cols-1 gap-6">
//               {events.map((event, index) => (
//                 <motion.div
//                   key={event._id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                   className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
//                   onClick={() => setSelectedEvent(event)}
//                 >
//                   <div className="flex">
//                     <div className="w-1/4">
//                       <img
//                         src={event.event.avatar}
//                         alt={event.event.name}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                     <div className="w-3/4 p-6">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <h3 className="text-xl font-bold text-gray-800 mb-2">
//                             {event.event.name}
//                           </h3>
//                           <p className="text-gray-600">Group: {event.name}</p>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
//                             {event.event.category}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
//                         <div className="flex items-center">
//                           <Calendar className="h-4 w-4 mr-1 text-blue-500" />
//                           <span>{new Date(event.event.startDate).toLocaleDateString()}</span>
//                         </div>
//                         <div className="flex items-center">
//                           <MapPin className="h-4 w-4 mr-1 text-red-500" />
//                           <span>{event.event.location}</span>
//                         </div>
//                         <div className="flex items-center">
//                           <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
//                           <span>₹{event.event.pricePool.toLocaleString()}</span>
//                         </div>
//                       </div>
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
//         {selectedEvent && (
//           <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
















// import { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';
// import axios from 'axios';
// import { 
//   QrCode, 
//   Calendar, 
//   Users, 
//   Trophy,
//   Clock,
//   MapPin,
//   DollarSign,
//   UserCheck,
//   Sparkles,
//   GraduationCap,
//   X,
//   Download,
//   ChevronRight,
//   Star,
//   User,
//   Mail,
//   Phone,
//   School as SchoolIcon,
//   BookOpen
// } from 'lucide-react';
// import Navbar from '../components/Navbar';

// export default function Dashboard() {
//   const { id } = useParams();
//   const [userDetails, setUserDetails] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [createdEvents, setCreatedEvents] = useState([]);
//   const [selectedQR, setSelectedQR] = useState(null);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [selectedGroup, setSelectedGroup] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const userResponse = await axios.get(`http://localhost:4000/api/v1/users/user/${id}`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         setUserDetails(userResponse.data.data);

//         const eventsResponse = await axios.get(`http://localhost:4000/api/v1/users/user/${id}/groups`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         setEvents(eventsResponse.data.data);

//         if (userResponse.data.data.role === 'org') {
//           const createdEventsResponse = await axios.get(`http://localhost:4000/api/v1/events/org/${id}`, {
//             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//           });
//           setCreatedEvents(createdEventsResponse.data.data || []);
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id]);

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const downloadGroupDetails = (group) => {
//     // Implementation for downloading group details as PDF
//     console.log('Downloading group details:', group);
//   };

//   const QRModal = ({ qrUrl, onClose }) => (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ scale: 0.5, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0.5, opacity: 0 }}
//         className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
//         onClick={e => e.stopPropagation()}
//       >
//         <div className="relative">
//           <h3 className="text-xl font-bold text-center mb-4">Event QR Code</h3>
//           <button
//             onClick={onClose}
//             className="absolute -top-2 -right-2 p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>
//         <img src={qrUrl} alt="QR Code" className="w-full h-auto rounded-lg shadow-lg" />
//         <p className="text-sm text-gray-500 text-center mt-4">
//           Scan this QR code to verify your participation
//         </p>
//       </motion.div>
//     </motion.div>
//   );

//   const GroupDetailsModal = ({ group, onClose }) => (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
//       onClick={onClose}
//     >
//       <motion.div
//         initial={{ scale: 0.5, opacity: 0, y: 50 }}
//         animate={{ scale: 1, opacity: 1, y: 0 }}
//         exit={{ scale: 0.5, opacity: 0, y: 50 }}
//         className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
//         onClick={e => e.stopPropagation()}
//       >
//         <div className="relative mb-6">
//           <h3 className="text-2xl font-bold">Group Details: {group.name}</h3>
//           <button
//             onClick={onClose}
//             className="absolute -top-2 -right-2 p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         <div className="space-y-6">
//           {group.members.map((member, index) => (
//             <motion.div
//               key={member.id}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
//             >
//               <div className="flex items-center space-x-4">
//                 <div className="flex-shrink-0">
//                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
//                     {member.name[0].toUpperCase()}
//                   </div>
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-lg font-semibold text-gray-900 truncate">{member.name}</p>
//                   <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
//                     <div className="flex items-center">
//                       <Mail className="h-4 w-4 mr-1" />
//                       {member.email}
//                     </div>
//                     <div className="flex items-center">
//                       <Phone className="h-4 w-4 mr-1" />
//                       {member.contactdetails}
//                     </div>
//                     <div className="flex items-center">
//                       <BookOpen className="h-4 w-4 mr-1" />
//                       Semester {member.sem}
//                     </div>
//                     <div className="flex items-center">
//                       <SchoolIcon className="h-4 w-4 mr-1" />
//                       Roll: {member.rollno}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>

//         <div className="mt-6 flex justify-end">
//           <button
//             onClick={() => downloadGroupDetails(group)}
//             className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//           >
//             <Download className="h-5 w-5 mr-2" />
//             Download Details
//           </button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//         <Navbar />
//         <div className="flex items-center justify-center h-[calc(100vh-64px)]">
//           <div className="relative">
//             <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin" />
//             <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-blue-500" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//       <Navbar />
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* User Profile Card */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
//         >
//           <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
//             <div className="absolute inset-0 bg-black/20" />
//             <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
//               <div className="flex items-center space-x-4">
//                 <motion.div
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ type: "spring", stiffness: 260, damping: 20 }}
//                   className="relative"
//                 >
//                   <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden">
//                     <img
//                       src={userDetails?.avatar || `https://ui-avatars.com/api/?name=${userDetails?.name}&background=3b82f6&color=fff`}
//                       alt="Profile"
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 </motion.div>
//                 <div>
//                   <h1 className="text-3xl font-bold">{userDetails?.name}</h1>
//                   <div className="flex items-center mt-2 space-x-4">
//                     <span className="flex items-center">
//                       <User className="h-4 w-4 mr-1" />
//                       {userDetails?.role}
//                     </span>
//                     <span className="flex items-center">
//                       <SchoolIcon className="h-4 w-4 mr-1" />
//                       {userDetails?.rollno}
//                     </span>
//                     <span className="flex items-center">
//                       <Star className="h-4 w-4 mr-1" />
//                       Semester {userDetails?.sem}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </motion.div>

//         {/* Events Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Events Joined Section */}
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ delay: 0.2 }}
//             className="space-y-6"
//           >
//             <h2 className="text-2xl font-bold text-gray-800 flex items-center">
//               <Trophy className="h-6 w-6 mr-2 text-blue-500" />
//               Events Joined
//             </h2>
//             <div className="space-y-4">
//               {events.map((event, index) => (
//                 <motion.div
//                   key={event._id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                   className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
//                   onClick={() => setSelectedEvent(event)}
//                 >
//                   <div className="flex">
//                     <div className="w-1/3">
//                       <img
//                         src={event.event.avatar}
//                         alt={event.event.name}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                     <div className="w-2/3 p-4">
//                       <h3 className="text-xl font-bold text-gray-800 mb-2">{event.event.name}</h3>
//                       <div className="space-y-2 text-sm text-gray-600">
//                         <div className="flex items-center">
//                           <Users className="h-4 w-4 mr-2 text-blue-500" />
//                           Team: {event.name}
//                         </div>
//                         <div className="flex items-center">
//                           <Calendar className="h-4 w-4 mr-2 text-green-500" />
//                           {formatDate(event.event.startDate)}
//                         </div>
//                         <div className="flex items-center">
//                           <MapPin className="h-4 w-4 mr-2 text-red-500" />
//                           {event.event.location}
//                         </div>
//                       </div>
//                       <div className="mt-4 flex justify-end">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setSelectedQR(event.qrCode);
//                           }}
//                           className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
//                         >
//                           <QrCode className="h-4 w-4 mr-1" />
//                           Show QR
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </motion.div>
//               ))}
//             </div>
//           </motion.div>

//           {/* Events Created Section (for organizers) */}
//           {userDetails?.role === 'org' && (
//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: 0.3 }}
//               className="space-y-6"
//             >
//               <h2 className="text-2xl font-bold text-gray-800 flex items-center">
//                 <Sparkles className="h-6 w-6 mr-2 text-purple-500" />
//                 Events Created
//               </h2>
//               <div className="space-y-4">
//                 {createdEvents.map((event, index) => (
//                   <motion.div
//                     key={event._id}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.1 }}
//                     className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
//                   >
//                     <div className="p-6">
//                       <h3 className="text-xl font-bold text-gray-800 mb-4">{event.name}</h3>
//                       <div className="grid grid-cols-2 gap-4 mb-4">
//                         <div className="flex items-center text-gray-600">
//                           <Calendar className="h-4 w-4 mr-2 text-blue-500" />
//                           {formatDate(event.startDate)}
//                         </div>
//                         <div className="flex items-center text-gray-600">
//                           <MapPin className="h-4 w-4 mr-2 text-red-500" />
//                           {event.location}
//                         </div>
//                         <div className="flex items-center text-gray-600">
//                           <Users className="h-4 w-4 mr-2 text-green-500" />
//                           {event.groups?.length || 0} Groups
//                         </div>
//                         <div className="flex items-center text-gray-600">
//                           <DollarSign className="h-4 w-4 mr-2 text-yellow-500" />
//                           ₹{event.pricePool.toLocaleString()}
//                         </div>
//                       </div>
//                       <div className="space-y-2">
//                         {event.groups?.map((group) => (
//                           <motion.button
//                             key={group._id}
//                             whileHover={{ x: 5 }}
//                             onClick={() => setSelectedGroup(group)}
//                             className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
//                           >
//                             <div className="flex items-center">
//                               <UserCheck className="h-5 w-5 text-blue-500 mr-2" />
//                               <span className="font-medium">{group.name}</span>
//                               <span className="ml-2 text-sm text-gray-500">
//                                 ({group.members.length} members)
//                               </span>
//                             </div>
//                             <ChevronRight className="h-5 w-5 text-gray-400" />
//                           </motion.button>
//                         ))}
//                       </div>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </motion.div>
//           )}
//         </div>
//       </div>

//       <AnimatePresence>
//         {selectedQR && (
//           <QRModal qrUrl={selectedQR} onClose={() => setSelectedQR(null)} />
//         )}
//         {selectedGroup && (
//           <GroupDetailsModal group={selectedGroup} onClose={() => setSelectedGroup(null)} />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }















import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  X,
  Download,
  ChevronRight,
  Star,
  User,
  Mail,
  Phone,
  School as SchoolIcon,
  BookOpen,
  Layers,
  UserPlus
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [events, setEvents] = useState([]);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventGroups, setSelectedEventGroups] = useState(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState(null);
  const [activeTab, setActiveTab] = useState('joined');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get(`http://localhost:4000/api/v1/users/user/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUserDetails(userResponse.data.data);

        const eventsResponse = await axios.get(`http://localhost:4000/api/v1/users/user/${id}/groups`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setEvents(eventsResponse.data.data);

        if (userResponse.data.data.role === 'org') {
          const createdEventsResponse = await axios.get(`http://localhost:4000/api/v1/events/org/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setCreatedEvents(createdEventsResponse.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchEventGroups = async (eventId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/v1/events/event/${eventId}/groups`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedEventGroups({ eventId, groups: response.data.data });
    } catch (error) {
      console.error('Error fetching event groups:', error);
    }
  };

  const fetchGroupMembers = async (groupId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/v1/groups/group/${groupId}/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedGroupMembers(response.data.data);
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

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
        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="relative"
                >
                  <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden">
                    <img
                      src={userDetails?.avatar || `https://ui-avatars.com/api/?name=${userDetails?.name}&background=3b82f6&color=fff`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold">{userDetails?.name}</h1>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {userDetails?.role}
                    </span>
                    <span className="flex items-center">
                      <SchoolIcon className="h-4 w-4 mr-1" />
                      {userDetails?.rollno}
                    </span>
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Semester {userDetails?.sem}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-1">
            <div className="flex space-x-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('joined')}
                className={`flex items-center px-6 py-3 rounded-lg transition-all ${
                  activeTab === 'joined'
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Trophy className="h-5 w-5 mr-2" />
                Events Joined
              </motion.button>
              {userDetails?.role === 'org' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('created')}
                  className={`flex items-center px-6 py-3 rounded-lg transition-all ${
                    activeTab === 'created'
                      ? 'bg-purple-500 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Events Created
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'joined' ? (
            <motion.div
              key="joined"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {events.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48">
                    <img
                      src={event.event.avatar || 'https://via.placeholder.com/400x200'}
                      alt={event.event.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-2">{event.event.name}</h3>
                      <div className="flex items-center text-white/80">
                        <Users className="h-4 w-4 mr-2" />
                        Team: {event.name}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        {formatDate(event.event.startDate)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-red-500" />
                        {event.event.location}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setSelectedQR(event.qrCode)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <QrCode className="h-4 w-4 mr-2" />
                        Show QR
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="created"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {createdEvents.map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48">
                    <img
                      src={event.avatar || 'https://via.placeholder.com/400x200'}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                      <div className="flex items-center text-white/80">
                        <Users className="h-4 w-4 mr-2" />
                        {event.groups?.length || 0} Groups Registered
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        {formatDate(event.startDate)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-red-500" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                        ₹{event.pricePool.toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => fetchEventGroups(event._id)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      View Groups
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <AnimatePresence>
          {/* QR Code Modal */}
          {selectedQR && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setSelectedQR(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="relative mb-4">
                  <h3 className="text-xl font-bold text-center">Event QR Code</h3>
                  <button
                    onClick={() => setSelectedQR(null)}
                    className="absolute -top-2 -right-2 p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <img src={selectedQR} alt="QR Code" className="w-full rounded-lg shadow-lg" />
              </motion.div>
            </motion.div>
          )}

          {/* Event Groups Modal */}
          {selectedEventGroups && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setSelectedEventGroups(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="relative mb-6">
                  <h3 className="text-2xl font-bold">Registered Groups</h3>
                  <button
                    onClick={() => setSelectedEventGroups(null)}
                    className="absolute -top-2 -right-2 p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  {selectedEventGroups.groups.map((group) => (
                    <motion.button
                      key={group._id}
                      whileHover={{ x: 5 }}
                      onClick={() => fetchGroupMembers(group._id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center">
                        <UserPlus className="h-5 w-5 text-purple-500 mr-3" />
                        <div className="text-left">
                          <p className="font-semibold text-gray-800">{group.name}</p>
                          {/* <p className="text-sm text-gray-500">{group.members?.length || 0} members</p> */}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Group Members Modal */}
          {selectedGroupMembers && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setSelectedGroupMembers(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-3xl w-full mx-4 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="relative mb-6">
                  <h3 className="text-2xl font-bold">Group Members</h3>
                  <button
                    onClick={() => setSelectedGroupMembers(null)}
                    className="absolute -top-2 -right-2 p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedGroupMembers.map((member, index) => (
                    <motion.div
                      key={member._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          {member.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{member.name}</p>
                          <div className="mt-1 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {member.email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {member.contactdetails}
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-1" />
                              Semester {member.sem}
                            </div>
                            <div className="flex items-center">
                              <SchoolIcon className="h-4 w-4 mr-1" />
                              Roll: {member.rollno}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}