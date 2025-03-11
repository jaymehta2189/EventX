import React from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import CreateEventModal from "../components/CreateEventModal"
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export default function CreateEvent() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main content with background image */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background with parallax effect */}
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "linear" }}
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          className="absolute inset-0 -z-10"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm" />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <CreateEventModal isOpen={true} onClose={() => navigate("/events")} />
        </div>
      </main>

      <Footer />
    </div>
  )
}





// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';
// import CreateEventModal from '../components/CreateEventModal';

// export default function CreateEvent() {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen flex flex-col">
//       {/* Background with parallax effect */}
//       <div className="fixed inset-0 z-0">
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm" />
//         <motion.div
//           initial={{ scale: 1.1 }}
//           animate={{ scale: 1 }}
//           transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
//           style={{
//             backgroundImage: `url('https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&q=80')`,
//             backgroundSize: 'cover',
//             backgroundPosition: 'center',
//           }}
//           className="absolute inset-0 -z-10"
//         />
//       </div>

//       {/* Content */}
//       <div className="relative z-10 flex-1 flex flex-col">
//         <Navbar />
//         <CreateEventModal isOpen={true} onClose={() => navigate('/events')} />
//         <Footer />
//       </div>
//     </div>
//   );
// }