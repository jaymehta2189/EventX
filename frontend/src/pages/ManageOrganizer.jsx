// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import { toast } from "react-toastify";
// import {
//   Search,
//   Users,
//   UserPlus,
//   Loader2,
//   AlertCircle,
//   CheckCircle,
//   School,
//   Mail,
//   Phone,
//   BookOpen,
//   Filter,
// } from "lucide-react";
// import Navbar from "../components/Navbar";

// export default function ManageOrganizer() {
//   const [searchId, setSearchId] = useState("");
//   const [selectedSemester, setSelectedSemester] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);

//   const handleSearch = async () => {
//     if (!searchId.trim()) {
//       toast.error("Please enter a student ID");
//       return;
//     }
  
//     setLoading(true);
//     try {
//       console.log("Searching for:", searchId);
      
//       const response = await axios.post(
//         `http://localhost:4000/api/v1/users/branch/user`,
//         { email: searchId },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           withCredentials: true,
//         }
//       );
  
//       console.log("Full API Response:", response.data);
//       console.log("User Data:", response.data.data[0]);
//       if (!response.data || !response.data.data) {
//         toast.error("No user data received");
//         setUsers([]);
//         return;
//       }
  
//       setUsers([response.data.data[0]]); // Assuming response.data.data is an object
//     } catch (error) {
//       console.error("API Error:", error.response?.data || error.message);
//       toast.error(error.response?.data?.message || "User not found");
//       setUsers([]);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const handleSemesterFilter = async () => {
//     if (!selectedSemester) {
//       toast.error("Please select a semester");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.get(
//         `http://localhost:4000/api/v1/users/semester/${selectedSemester}`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           withCredentials: true,
//         }
//       );
//       setUsers(response.data.data || []);
//     } catch (error) {
//       toast.error(error.response?.data?.message || "No users found");
//       setUsers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePromoteToOrganizer = async (userId) => {
//     try {
//       await axios.post(
//         `http://localhost:4000/api/v1/users/modified/user`,
//         {
//           userId: userId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           withCredentials: true,
//         }
//       );
//       toast.success("User promoted to organizer successfully!");
      
//       setUsers(users.map(user => 
//         user._id === userId ? { ...user, role: 'org' } : user
//       ));
      
//       setShowConfirmModal(false);
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to promote user");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//       <Navbar />
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Header Section */}
//         <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
//           <div className="flex items-center space-x-4 mb-6">
//             <Users className="h-8 w-8 text-blue-500" />
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">
//                 Manage Organizers
//               </h1>
//               <p className="text-gray-600">
//                 Search for users or filter by semester to manage organizer roles
//               </p>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Search by ID */}
//             <div className="space-y-4">
//               <h2 className="text-lg font-semibold text-gray-700 flex items-center">
//                 <Search className="w-5 h-5 mr-2" />
//                 Search by Student ID
//               </h2>
//               <div className="flex space-x-4">
//                 <input
//                   type="text"
//                   value={searchId}
//                   onChange={(e) => setSearchId(e.target.value)}
//                   placeholder="Enter student ID"
//                   className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//                 <button
//                   onClick={handleSearch}
//                   disabled={loading}
//                   className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
//                 >
//                   {loading ? (
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                   ) : (
//                     "Search"
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Filter by Semester */}
//             <div className="space-y-4">
//               <h2 className="text-lg font-semibold text-gray-700 flex items-center">
//                 <Filter className="w-5 h-5 mr-2" />
//                 Filter by Semester
//               </h2>
//               <div className="flex space-x-4">
//                 <select
//                   value={selectedSemester}
//                   onChange={(e) => setSelectedSemester(e.target.value)}
//                   className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Select Semester</option>
//                   {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
//                     <option key={`semester-${sem}`} value={sem}>
//                       Semester {sem}
//                     </option>
//                   ))}
//                 </select>
//                 <button
//                   onClick={handleSemesterFilter}
//                   disabled={loading}
//                   className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-purple-300"
//                 >
//                   {loading ? (
//                     <Loader2 className="w-5 h-5 animate-spin" />
//                   ) : (
//                     "Filter"
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Results Section */}
//         <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
//           <AnimatePresence mode="wait">
//             {loading ? (
//               <motion.div
//                 key="loading"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="flex flex-col items-center justify-center py-12"
//               >
//                 <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
//                 <p className="text-gray-600">Loading users...</p>
//               </motion.div>
//             ) : users.length === 0 ? (
//               <motion.div
//                 key="no-results"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="flex flex-col items-center justify-center py-12"
//               >
//                 <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-700 mb-2">
//                   No users found
//                 </h3>
//                 <p className="text-gray-500">
//                   Try searching with a different ID or semester
//                 </p>
//               </motion.div>
//             ) : (
//               <motion.div
//                 key="results"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 className="grid gap-6"
//               >
//                 {users.map((user) => (
//                   <motion.div
//                     key={user._id}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6"
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex items-start space-x-4">
//                         <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
//                           {user.name?.[0]}
//                         </div>
//                         <div>
//                           <h3 className="text-lg font-semibold text-gray-800 mb-1">
//                             {user.name}
//                           </h3>
//                           <div className="grid grid-cols-2 gap-x-8 gap-y-2">
//                             <div className="flex items-center text-gray-600">
//                               <Mail className="w-4 h-4 mr-2 text-blue-500" />
//                               {user.email}
//                             </div>
//                             <div className="flex items-center text-gray-600">
//                               <Phone className="w-4 h-4 mr-2 text-green-500" />
//                               {user.contactdetails}
//                             </div>
//                             <div className="flex items-center text-gray-600">
//                               <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
//                               Semester {user.sem}
//                             </div>
//                             <div className="flex items-center text-gray-600">
//                               <School className="w-4 h-4 mr-2 text-orange-500" />
//                               Roll: {user.rollno}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                       {user.role === "org" ? (
//                         <div className="flex items-center text-green-500">
//                           <CheckCircle className="w-5 h-5 mr-2" />
//                           Organizer
//                         </div>
//                       ) : (
//                         <button
//                           onClick={() => {
//                             setSelectedUser(user);
//                             setShowConfirmModal(true);
//                           }}
//                           className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//                         >
//                           <UserPlus className="w-4 h-4 mr-2" />
//                           Promote to Organizer
//                         </button>
//                       )}
//                     </div>
//                   </motion.div>
//                 ))}
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {/* Confirmation Modal */}
//         <AnimatePresence>
//           {showConfirmModal && selectedUser && (
//             <motion.div
//               key="modal"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
//               onClick={() => setShowConfirmModal(false)}
//             >
//               <motion.div
//                 initial={{ scale: 0.9, opacity: 0 }}
//                 animate={{ scale: 1, opacity: 1 }}
//                 exit={{ scale: 0.9, opacity: 0 }}
//                 className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div className="text-center mb-6">
//                   <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
//                     <UserPlus className="w-8 h-8 text-blue-500" />
//                   </div>
//                   <h3 className="text-xl font-bold text-gray-800 mb-2">
//                     Confirm Promotion
//                   </h3>
//                   <p className="text-gray-600">
//                     Are you sure you want to promote{" "}
//                     <span className="font-semibold">{selectedUser.name}</span> to
//                     an organizer?
//                   </p>
//                 </div>
//                 <div className="flex justify-end space-x-4">
//                   <button
//                     onClick={() => setShowConfirmModal(false)}
//                     className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={() => handlePromoteToOrganizer(selectedUser._id)}
//                     className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//                   >
//                     Confirm Promotion
//                   </button>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Search,
  Users,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle,
  School,
  Mail,
  Phone,
  BookOpen,
  Filter,
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function ManageOrganizer() {
  const [searchId, setSearchId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      toast.error("Please enter a student ID");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:4000/api/v1/users/branch/user`,
        { email: searchId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      
      // Ensure we're handling the response data correctly
      const userData = response.data.data;
      setUsers(Array.isArray(userData) ? userData : [userData]);
    } catch (error) {
      toast.error(error.response?.data?.message || "User not found");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterFilter = async () => {
    if (!selectedSemester) {
      toast.error("Please select a semester");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:4000/api/v1/users/semester/${selectedSemester}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      setUsers(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "No users found");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToOrganizer = async (userId) => {
    try {
      await axios.post(
        `http://localhost:4000/api/v1/users/modified/user`,
        {
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      toast.success("User promoted to organizer successfully!");
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: 'org' } : user
      ));
      
      setShowConfirmModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to promote user");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Manage Organizers
              </h1>
              <p className="text-gray-600">
                Search for users or filter by semester to manage organizer roles
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search by ID */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Search by Student ID
              </h2>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter student ID"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </div>

            {/* Filter by Semester */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filter by Semester
              </h2>
              <div className="flex space-x-4">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Semester</option>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                    <option key={`semester-${sem}`} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSemesterFilter}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-purple-300"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Filter"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading users...</p>
              </motion.div>
            ) : users.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No users found
                </h3>
                <p className="text-gray-500">
                  Try searching with a different ID or semester
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6"
              >
                {users.map((user) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          {user.name?.[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {user.name}
                          </h3>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            <div className="flex items-center text-gray-600">
                              <Mail className="w-4 h-4 mr-2 text-blue-500" />
                              {user.email}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Phone className="w-4 h-4 mr-2 text-green-500" />
                              {user.contactdetails}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <BookOpen className="w-4 h-4 mr-2 text-purple-500" />
                              Semester {user.sem}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <School className="w-4 h-4 mr-2 text-orange-500" />
                              Roll: {user.rollno}
                            </div>
                          </div>
                        </div>
                      </div>
                      {user.role === "org" && (
                        <div className="flex items-center text-green-500">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Organizer
                        </div>
                      )}
                      {user.role !== "org" && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowConfirmModal(true);
                          }}
                          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Promote to Organizer
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirmModal && selectedUser && (
            <motion.div
              key="modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowConfirmModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Confirm Promotion
                  </h3>
                  <p className="text-gray-600">
                    Are you sure you want to promote{" "}
                    <span className="font-semibold">{selectedUser.name}</span> to
                    an organizer?
                  </p>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handlePromoteToOrganizer(selectedUser._id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Confirm Promotion
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}