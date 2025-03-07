
// import { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import {
//   Users,
//   Download,
//   Mail,
//   Phone,
//   School,
//   BookOpen,
//   ChevronDown,
//   ChevronUp,
//   Calendar,
//   MapPin,
//   Trophy,
//   UserPlus,
//   Loader2,
//   FileDown,
//   User
// } from "lucide-react";
// import Navbar from "../components/Navbar";

// const GroupsPage = () => {
//   const { eventId } = useParams();
//   const [eventGroups, setEventGroups] = useState([]);
//   const [eventDetails, setEventDetails] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [expandedGroups, setExpandedGroups] = useState({});
//   const [downloadingPdf, setDownloadingPdf] = useState(false);

//   useEffect(() => {
//     const fetchEventDetails = async () => {
//       try {
//         const response = await axios.get(`http://localhost:4000/api/v1/events/event/${eventId}`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`, // Send Authorization token separately
//           },
//           withCredentials: true, // Ensures cookies are sent
//         });
//         setEventDetails(response.data.data.event);
//       } catch (error) {
//         console.error("Error fetching event details:", error);
//       }
//     };

//     const fetchEventGroups = async () => {
//       try {
//         const response = await axios.get(`http://localhost:4000/api/v1/events/event/${eventId}/groups`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`, // Send Authorization token separately
//           },
//           withCredentials: true, // Ensures cookies are sent
//         });
//         const groupsWithMembers = await Promise.all(
//           response.data.data.map(async (group) => {
//             const membersResponse = await axios.get(
//               `http://localhost:4000/api/v1/groups/group/${group._id}/users`,
//               {
//                 headers: {
//                   Authorization: `Bearer ${localStorage.getItem("token")}`, // Send Authorization token separately
//                 },
//                 withCredentials: true, // Ensures cookies are sent
//               });
//             return { ...group, members: membersResponse.data.data };
//           })
//         );
//         setEventGroups(groupsWithMembers);
//       } catch (error) {
//         console.error("Error fetching event groups:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEventDetails();
//     fetchEventGroups();
//   }, [eventId]);

//   const toggleGroupExpansion = (groupId) => {
//     setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
//   };

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString("en-US", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const downloadPDF = async () => {
//     setDownloadingPdf(true);
//     try {
//       const doc = new jsPDF();
//       let marginLeft = 14;
//       let marginTop = 20;
//       let pageHeight = doc.internal.pageSize.height;
//       let currentY = marginTop;

//       // Title and Event Details
//       doc.setFont("helvetica", "bold");
//       doc.setFontSize(16);
//       doc.setTextColor(44, 62, 80);
//       doc.text(eventDetails.name, marginLeft, currentY);
//       currentY += 10;

//       doc.setFontSize(12);
//       doc.setTextColor(52, 73, 94);
//       doc.text(`Location: ${eventDetails.location}`, marginLeft, currentY);
//       currentY += 7;
//       doc.text(`Date: ${formatDate(eventDetails.startDate)}`, marginLeft, currentY);
//       currentY += 15;

//       eventGroups.forEach((group, index) => {
//         if (currentY + 40 > pageHeight) {
//           doc.addPage();
//           currentY = marginTop;
//         }

//         doc.setFontSize(14);
//         doc.setFont("helvetica", "bold");
//         doc.setTextColor(41, 128, 185);
//         doc.text(`Team ${group.name}`, marginLeft, currentY);
//         currentY += 10;

//         const tableData = group.members.map((member) => [
//           member.name,
//           member.email,
//           member.contactdetails,
//           member.sem,
//           member.rollno,
//         ]);

//         doc.autoTable({
//           startY: currentY,
//           head: [["Name", "Email", "Contact", "Semester", "Roll No"]],
//           body: tableData,
//           theme: "grid",
//           styles: {
//             fontSize: 10,
//             cellPadding: 3,
//           },
//           headStyles: {
//             fillColor: [41, 128, 185],
//             textColor: 255,
//             fontStyle: "bold",
//           },
//           alternateRowStyles: {
//             fillColor: [241, 245, 249],
//           },
//           margin: { left: marginLeft },
//         });

//         currentY = doc.autoTable.previous.finalY + 15;
//       });

//       doc.save(`${eventDetails.name}_groups.pdf`);
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//     } finally {
//       setDownloadingPdf(false);
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
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//       <Navbar />
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         {/* Event Details Card */}
//         <div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
//         >
//           <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
//             <div className="absolute inset-0 bg-black/20" />
//             <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
//               <h1 className="text-3xl font-bold mb-2">{eventDetails.name}</h1>
//               <div className="flex flex-wrap gap-4">
//                 <div className="flex items-center">
//                   <Calendar className="h-5 w-5 mr-2" />
//                   {formatDate(eventDetails.startDate)}
//                 </div>
//                 <div className="flex items-center">
//                   <MapPin className="h-5 w-5 mr-2" />
//                   {eventDetails.location}
//                 </div>
//                 <div className="flex items-center">
//                   <Trophy className="h-5 w-5 mr-2" />
//                   Prize Pool: ₹{eventDetails.pricePool?.toLocaleString()}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Groups Section */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6"
//         >
//           <div className="flex justify-between items-center mb-8">
//             <div className="flex items-center space-x-3">
//               <UserPlus className="h-6 w-6 text-blue-500" />
//               <h2 className="text-2xl font-bold text-gray-800">Registered Teams</h2>
//               <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
//                 {eventGroups.length} Teams
//               </span>
//             </div>
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={downloadPDF}
//               disabled={downloadingPdf}
//               className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-70"
//             >
//               {downloadingPdf ? (
//                 <>
//                   <Loader2 className="h-5 w-5 mr-2 animate-spin" />
//                   Generating PDF...
//                 </>
//               ) : (
//                 <>
//                   <FileDown className="h-5 w-5 mr-2" />
//                   Download Report
//                 </>
//               )}
//             </motion.button>
//           </div>

//           <div className="space-y-4">
//             {eventGroups.map((group) => (
//               <motion.div
//                 key={group._id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
//               >
//                 <div
//                   onClick={() => toggleGroupExpansion(group._id)}
//                   className="flex items-center justify-between p-6 cursor-pointer"
//                 >
//                   <div className="flex items-center space-x-4">
//                     <motion.div
//                       initial={false}
//                       animate={{
//                         rotate: expandedGroups[group._id] ? 90 : 0,
//                       }}
//                       className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
//                     >
//                       <Users className="h-5 w-5 text-blue-500" />
//                     </motion.div>
//                     <div>
//                       <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-500 transition-colors">
//                         {group.name}
//                       </h3>
//                       <p className="text-sm text-gray-500">{group.members.length} Members</p>
//                     </div>
//                   </div>
//                   <motion.div
//                     initial={false}
//                     animate={{ rotate: expandedGroups[group._id] ? 180 : 0 }}
//                   >
//                     <ChevronDown className="h-5 w-5 text-gray-400" />
//                   </motion.div>
//                 </div>

//                 <AnimatePresence>
//                   {expandedGroups[group._id] && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       transition={{ duration: 0.2 }}
//                       className="px-6 pb-6"
//                     >
//                       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                         {group.members.map((member, index) => (
//                           <motion.div
//                             key={member._id}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: index * 0.1 }}
//                             className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all duration-300"
//                           >
//                             <div className="flex items-center space-x-3 mb-3">
//                               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
//                                 {member.name[0].toUpperCase()}
//                               </div>
//                               <div>
//                                 <h4 className="font-semibold text-gray-800">{member.name}</h4>
//                                 <p className="text-sm text-gray-500">Member</p>
//                               </div>
//                             </div>
//                             <div className="space-y-2 text-sm text-gray-600">
//                               <div className="flex items-center space-x-2">
//                                 <Mail className="h-4 w-4 text-blue-500" />
//                                 <span>{member.email}</span>
//                               </div>
//                               <div className="flex items-center space-x-2">
//                                 <Phone className="h-4 w-4 text-green-500" />
//                                 <span>{member.contactdetails}</span>
//                               </div>
//                               <div className="flex items-center space-x-2">
//                                 <BookOpen className="h-4 w-4 text-purple-500" />
//                                 <span>Semester {member.sem}</span>
//                               </div>
//                               <div className="flex items-center space-x-2">
//                                 <School className="h-4 w-4 text-orange-500" />
//                                 <span>Roll: {member.rollno}</span>
//                               </div>
//                             </div>
//                           </motion.div>
//                         ))}
//                       </div>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default GroupsPage;


import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Users,
  Download,
  Mail,
  Phone,
  School,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Trophy,
  UserPlus,
  Loader2,
  FileDown,
  User,
  Award,
  Save,
  X,
  Star
} from "lucide-react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

const GroupsPage = () => {
  const { eventId } = useParams();
  const [eventGroups, setEventGroups] = useState([]);
  const [eventDetails, setEventDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [isAssigningScores, setIsAssigningScores] = useState(false);
  const [groupScores, setGroupScores] = useState({});
  const [updatingScores, setUpdatingScores] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/events/event/${eventId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send Authorization token separately
          },
          withCredentials: true, // Ensures cookies are sent
        });
        setEventDetails(response.data.data.event);
      } catch (error) {
        console.error("Error fetching event details:", error);
      }
    };

    const fetchEventGroups = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/events/event/${eventId}/groups`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send Authorization token separately
          },
          withCredentials: true, // Ensures cookies are sent
        });
        const groupsWithMembers = await Promise.all(
          response.data.data.map(async (group) => {
            const membersResponse = await axios.get(
              `http://localhost:4000/api/v1/groups/group/${group._id}/users`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`, // Send Authorization token separately
                },
                withCredentials: true, // Ensures cookies are sent
              });
            return { ...group, members: membersResponse.data.data };
          })
        );
        
        // Initialize scores object with existing scores
        const initialScores = {};
        groupsWithMembers.forEach(group => {
          initialScores[group._id] = group.score || '';
        });
        setGroupScores(initialScores);
        
        setEventGroups(groupsWithMembers);
      } catch (error) {
        console.error("Error fetching event groups:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
    fetchEventGroups();
  }, [eventId]);

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleScoreChange = (groupId, score) => {
    setGroupScores(prev => ({
      ...prev,
      [groupId]: score
    }));
  };

  const updateScores = async () => {
    try {
      setUpdatingScores(true);
      
      // Format the data as required by the API
      const groupScore = {};
      Object.entries(groupScores).forEach(([groupId, score]) => {
        if (score !== '') {
          groupScore[groupId] = Number(score);
        }
      });
      
      await axios.post(
        `http://localhost:4000/api/v1/groups/score`, 
        { groupScore },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      
      toast.success("Scores updated successfully!");
      
      // Update the local state to reflect the changes
      setEventGroups(prev => 
        prev.map(group => ({
          ...group,
          score: groupScores[group._id] || group.score
        }))
      );
      
      setIsAssigningScores(false);
    } catch (error) {
      console.error("Error updating scores:", error);
      toast.error("Failed to update scores. Please try again.");
    } finally {
      setUpdatingScores(false);
    }
  };

  const downloadPDF = async () => {
    setDownloadingPdf(true);
    try {
      const doc = new jsPDF();
      let marginLeft = 14;
      let marginTop = 20;
      let pageHeight = doc.internal.pageSize.height;
      let currentY = marginTop;

      // Title and Event Details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text(eventDetails.name, marginLeft, currentY);
      currentY += 10;

      doc.setFontSize(12);
      doc.setTextColor(52, 73, 94);
      doc.text(`Location: ${eventDetails.location}`, marginLeft, currentY);
      currentY += 7;
      doc.text(`Date: ${formatDate(eventDetails.startDate)}`, marginLeft, currentY);
      currentY += 15;

      eventGroups.forEach((group, index) => {
        if (currentY + 40 > pageHeight) {
          doc.addPage();
          currentY = marginTop;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(41, 128, 185);
        doc.text(`Team ${group.name}`, marginLeft, currentY);
        
        // Add score if available
        if (group.score !== undefined && group.score !== null) {
          doc.setTextColor(46, 204, 113);
          doc.text(`Score: ${group.score}`, marginLeft + 100, currentY);
        }
        
        currentY += 10;

        const tableData = group.members.map((member) => [
          member.name,
          member.email,
          member.contactdetails,
          member.sem,
          member.rollno,
        ]);

        doc.autoTable({
          startY: currentY,
          head: [["Name", "Email", "Contact", "Semester", "Roll No"]],
          body: tableData,
          theme: "grid",
          styles: {
            fontSize: 10,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [241, 245, 249],
          },
          margin: { left: marginLeft },
        });

        currentY = doc.autoTable.previous.finalY + 15;
      });

      doc.save(`${eventDetails.name}_groups.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloadingPdf(false);
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Event Details Card */}
        <div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{eventDetails.name}</h1>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {formatDate(eventDetails.startDate)}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {eventDetails.location}
                </div>
                <div className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Prize Pool: ₹{eventDetails.pricePool?.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Groups Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <UserPlus className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-800">Registered Teams</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                {eventGroups.length} Teams
              </span>
            </div>
            <div className="flex space-x-3">
              {isAssigningScores ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={updateScores}
                  disabled={updatingScores}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-70"
                >
                  {updatingScores ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Updating Scores...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Scores
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAssigningScores(true)}
                  className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all"
                >
                  <Award className="h-5 w-5 mr-2" />
                  Assign Scores
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={downloadPDF}
                disabled={downloadingPdf}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-70"
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="h-5 w-5 mr-2" />
                    Download Report
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {isAssigningScores && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100"
            >
              <div className="flex items-start">
                <div className="p-2 bg-indigo-100 rounded-full mr-3">
                  <Award className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-medium text-indigo-800">Score Assignment Mode</h3>
                  <p className="text-sm text-indigo-600 mt-1">
                    Enter scores for each team and click "Save Scores" when you're done.
                  </p>
                </div>
                <button 
                  onClick={() => setIsAssigningScores(false)}
                  className="ml-auto p-1 text-indigo-500 hover:text-indigo-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            {eventGroups.map((group) => (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div
                  onClick={() => toggleGroupExpansion(group._id)}
                  className="flex items-center justify-between p-6 cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <motion.div
                      initial={false}
                      animate={{
                        rotate: expandedGroups[group._id] ? 90 : 0,
                      }}
                      className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"
                    >
                      <Users className="h-5 w-5 text-blue-500" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-500 transition-colors">
                        {group.name}
                      </h3>
                      <div className="flex items-center space-x-3">
                        <p className="text-sm text-gray-500">{group.members.length} Members</p>
                        {group.score !== undefined && group.score !== null && !isAssigningScores && (
                          <div className="flex items-center text-sm text-green-600">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            Score: {group.score}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {isAssigningScores && (
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={groupScores[group._id]}
                          onChange={(e) => handleScoreChange(group._id, e.target.value)}
                          onWheel={(e) => e.target.blur()}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="Score"
                        />
                      </div>
                    )}
                    
                    <motion.div
                      initial={false}
                      animate={{ rotate: expandedGroups[group._id] ? 180 : 0 }}
                    >
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedGroups[group._id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-6 pb-6"
                    >
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {group.members.map((member, index) => (
                          <motion.div
                            key={member._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {member.name[0].toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{member.name}</h4>
                                <p className="text-sm text-gray-500">Member</p>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-blue-500" />
                                <span>{member.email}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-green-500" />
                                <span>{member.contactdetails}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <BookOpen className="h-4 w-4 text-purple-500" />
                                <span>Semester {member.sem}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <School className="h-4 w-4 text-orange-500" />
                                <span>Roll: {member.rollno}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GroupsPage;