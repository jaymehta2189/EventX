// "use client"

// import { useState, useEffect } from "react"
// import { useParams } from "react-router-dom"
// import { motion, AnimatePresence } from "framer-motion"
// import axios from "axios"
// import jsPDF from "jspdf"
// import "jspdf-autotable"
// import { Users, Download, Mail, Phone, School, BookOpen, ChevronDown, ChevronUp } from "lucide-react"
// import Navbar from "../components/Navbar"

// const GroupsPage = () => {
//   const { eventId } = useParams()
//   const [eventGroups, setEventGroups] = useState([])
//   const [eventDetails, setEventDetails] = useState({})
//   const [loading, setLoading] = useState(true)
//   const [expandedGroups, setExpandedGroups] = useState({})

//   useEffect(() => {
//     const fetchEventDetails = async () => {
//       try {
//         const response = await axios.get(`http://localhost:4000/api/v1/events/event/${eventId}`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         })
//         console.log(response.data.data.event)
//         setEventDetails(response.data.data.event)
//       } catch (error) {
//         console.error("Error fetching event details:", error)
//       }
//     }
//     const fetchEventGroups = async () => {
//       try {
//         const response = await axios.get(`http://localhost:4000/api/v1/events/event/${eventId}/groups`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         })
//         console.log(response.data.data)
//         const groupsWithMembers = await Promise.all(
//           response.data.data.map(async (group) => {
//             const membersResponse = await axios.get(`http://localhost:4000/api/v1/groups/group/${group._id}/users`, {
//               headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//             })
//             return { ...group, members: membersResponse.data.data }
//           }),
//         )
//         setEventGroups(groupsWithMembers)
//         setLoading(false)
//       } catch (error) {
//         console.error("Error fetching event groups:", error)
//         setLoading(false)
//       }
//     }
//     fetchEventDetails()
//     fetchEventGroups()
//   }, [eventId])

//   const toggleGroupExpansion = (groupId) => {
//     setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
//   }
//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     let marginLeft = 14;
//     let marginTop = 20;
//     let pageHeight = doc.internal.pageSize.height;
//     let currentY = marginTop;
  
//     // Title for the PDF
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(15);
//     doc.text(`Event ${eventDetails.name} conducted at ${eventDetails.location} on ${eventDetails.startDate}`, marginLeft, currentY);
//     currentY += 10; // Space after title
  
//     eventGroups.forEach((group, index) => {
//       if (index > 0 && currentY + 10 > pageHeight - 20) {
//         doc.addPage();
//         currentY = marginTop; // Reset Y position for new page
//       }
  
//       // Group Name Styling
//       doc.setFontSize(12);
//       doc.setFont("helvetica");
//       doc.setTextColor(40, 40, 40);
//       doc.text(`Team ${group.name}`, marginLeft, currentY);
//       currentY += 8; // Space after group name
  
//       // Table Data
//       const tableData = group.members.map((member) => [
//         member.name,
//         member.email,
//         member.contactdetails,
//         member.sem,
//         member.rollno,
//       ]);
  
//       doc.autoTable({
//         startY: currentY,
//         head: [["Name", "Email", "Contact", "Semester", "Roll No"]],
//         body: tableData,
//         styles: {
//           fontSize: 10,
//           cellPadding: 3,
//         },
//         headStyles: {
//           fillColor: [0, 102, 204], // Blue header
//           textColor: [255, 255, 255],
//           fontStyle: "bold",
//         },
//         alternateRowStyles: { fillColor: [240, 240, 240] }, // Light gray rows
//         margin: { left: marginLeft },
//       });
  
//       currentY = doc.autoTable.previous.finalY + 12; // Space before next group
//     });
  
//     doc.save("event_groups.pdf");
//   };
  
  
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//         <Navbar />
//         <div className="flex items-center justify-center h-[calc(100vh-64px)]">
//           <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//       <Navbar />
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 p-6"
//         >
//           <div className="flex justify-between items-center mb-6">
//             <h1 className="text-3xl font-bold text-gray-800">Event Groups</h1>
//             <button
//               onClick={downloadPDF}
//               className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//             >
//               <Download className="h-5 w-5 mr-2" />
//               Download PDF
//             </button>
//           </div>
//           <div className="space-y-6">
//             {eventGroups.map((group) => (
//               <motion.div
//                 key={group._id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300"
//               >
//                 <div
//                   className="flex items-center justify-between cursor-pointer"
//                   onClick={() => toggleGroupExpansion(group._id)}
//                 >
//                   <div className="flex items-center space-x-4">
//                     <Users className="h-6 w-6 text-blue-500" />
//                     <h2 className="text-xl font-semibold text-gray-800">{group.name}</h2>
//                   </div>
//                   {expandedGroups[group._id] ? (
//                     <ChevronUp className="h-6 w-6 text-gray-500" />
//                   ) : (
//                     <ChevronDown className="h-6 w-6 text-gray-500" />
//                   )}
//                 </div>
//                 <AnimatePresence>
//                   {expandedGroups[group._id] && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: "auto" }}
//                       exit={{ opacity: 0, height: 0 }}
//                       className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
//                     >
//                       {group.members.map((member) => (
//                         <div key={member._id} className="bg-white rounded-lg p-4 shadow">
//                           <div className="flex items-center space-x-3 mb-2">
//                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
//                               {member.name[0].toUpperCase()}
//                             </div>
//                             <h3 className="font-semibold text-gray-800">{member.name}</h3>
//                           </div>
//                           <div className="space-y-1 text-sm text-gray-600">
//                             <div className="flex items-center">
//                               <Mail className="h-4 w-4 mr-2" />
//                               {member.email}
//                             </div>
//                             <div className="flex items-center">
//                               <Phone className="h-4 w-4 mr-2" />
//                               {member.contactdetails}
//                             </div>
//                             <div className="flex items-center">
//                               <BookOpen className="h-4 w-4 mr-2" />
//                               Semester {member.sem}
//                             </div>
//                             <div className="flex items-center">
//                               <School className="h-4 w-4 mr-2" />
//                               Roll: {member.rollno}
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </motion.div>
//                   )}
//                 </AnimatePresence>
//               </motion.div>
//             ))}
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   )
// }

// export default GroupsPage

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
  User
} from "lucide-react";
import Navbar from "../components/Navbar";

const GroupsPage = () => {
  const { eventId } = useParams();
  const [eventGroups, setEventGroups] = useState([]);
  const [eventDetails, setEventDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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
                      <p className="text-sm text-gray-500">{group.members.length} Members</p>
                    </div>
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ rotate: expandedGroups[group._id] ? 180 : 0 }}
                  >
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </motion.div>
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