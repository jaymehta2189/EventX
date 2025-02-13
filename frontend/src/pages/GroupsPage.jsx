"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { Users, Download, Mail, Phone, School, BookOpen, ChevronDown, ChevronUp } from "lucide-react"
import Navbar from "../components/Navbar"

const GroupsPage = () => {
  const { eventId } = useParams()
  const [eventGroups, setEventGroups] = useState([])
  const [eventDetails, setEventDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState({})

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/events/event/${eventId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        console.log(response.data.data.event)
        setEventDetails(response.data.data.event)
      } catch (error) {
        console.error("Error fetching event details:", error)
      }
    }
    const fetchEventGroups = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/events/event/${eventId}/groups`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        console.log(response.data.data)
        const groupsWithMembers = await Promise.all(
          response.data.data.map(async (group) => {
            const membersResponse = await axios.get(`http://localhost:4000/api/v1/groups/group/${group._id}/users`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            return { ...group, members: membersResponse.data.data }
          }),
        )
        setEventGroups(groupsWithMembers)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching event groups:", error)
        setLoading(false)
      }
    }
    fetchEventDetails()
    fetchEventGroups()
  }, [eventId])

  const toggleGroupExpansion = (groupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
  }
  const downloadPDF = () => {
    const doc = new jsPDF();
    let marginLeft = 14;
    let marginTop = 20;
    let pageHeight = doc.internal.pageSize.height;
    let currentY = marginTop;
  
    // Title for the PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(`Event ${eventDetails.name} conducted at ${eventDetails.location} on ${eventDetails.startDate}`, marginLeft, currentY);
    currentY += 10; // Space after title
  
    eventGroups.forEach((group, index) => {
      if (index > 0 && currentY + 10 > pageHeight - 20) {
        doc.addPage();
        currentY = marginTop; // Reset Y position for new page
      }
  
      // Group Name Styling
      doc.setFontSize(12);
      doc.setFont("helvetica");
      doc.setTextColor(40, 40, 40);
      doc.text(`Team ${group.name}`, marginLeft, currentY);
      currentY += 8; // Space after group name
  
      // Table Data
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
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 102, 204], // Blue header
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        alternateRowStyles: { fillColor: [240, 240, 240] }, // Light gray rows
        margin: { left: marginLeft },
      });
  
      currentY = doc.autoTable.previous.finalY + 12; // Space before next group
    });
  
    doc.save("event_groups.pdf");
  };
  
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Event Groups</h1>
            <button
              onClick={downloadPDF}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Download PDF
            </button>
          </div>
          <div className="space-y-6">
            {eventGroups.map((group) => (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleGroupExpansion(group._id)}
                >
                  <div className="flex items-center space-x-4">
                    <Users className="h-6 w-6 text-blue-500" />
                    <h2 className="text-xl font-semibold text-gray-800">{group.name}</h2>
                  </div>
                  {expandedGroups[group._id] ? (
                    <ChevronUp className="h-6 w-6 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-6 w-6 text-gray-500" />
                  )}
                </div>
                <AnimatePresence>
                  {expandedGroups[group._id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                    >
                      {group.members.map((member) => (
                        <div key={member._id} className="bg-white rounded-lg p-4 shadow">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {member.name[0].toUpperCase()}
                            </div>
                            <h3 className="font-semibold text-gray-800">{member.name}</h3>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              {member.email}
                            </div>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              {member.contactdetails}
                            </div>
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 mr-2" />
                              Semester {member.sem}
                            </div>
                            <div className="flex items-center">
                              <School className="h-4 w-4 mr-2" />
                              Roll: {member.rollno}
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default GroupsPage

