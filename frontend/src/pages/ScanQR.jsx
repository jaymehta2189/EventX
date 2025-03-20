
// import { useEffect, useState } from "react";
// import { Html5QrcodeScanner } from "html5-qrcode";
// import { useNavigate,useParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import { motion, AnimatePresence } from "framer-motion";
// import axios from "axios";
// import {
//   QrCode,
//   Camera,
//   CheckCircle,
//   XCircle,
//   RefreshCw,
//   Loader2
// } from "lucide-react";
// import Navbar from "../components/Navbar";

// const ScanQR = () => {
//     const {id}= useParams();
//   const navigate = useNavigate();
//   const [scanning, setScanning] = useState(true);
//   const [scanResult, setScanResult] = useState(null);
//   const [error, setError] = useState(null);
//   const [processing, setProcessing] = useState(false);
//   useEffect(() => {
//     if (!scanning) return; // Prevent unnecessary scanner reinitialization

//     const scanner = new Html5QrcodeScanner(
//       "reader",
//       {
//         fps: 10,
//         qrbox: { width: 300, height: 300 },
//         aspectRatio: 1.0,
//         showTorchButtonIfSupported: true,
//         showZoomSliderIfSupported: true,
//         defaultZoomValueIfSupported: 2,
//       },
//       false
//     );

//     const processQRCode = async (decodedText) => {
//       if (processing) return; // Prevent multiple scans while processing
//       setProcessing(true);
//       setScanning(false); // Stop scanning immediately

//       try {
//         console.log("Scanned QR Code:", decodedText);
        
//         // Stop scanner before making the request
//         scanner.clear();

//         const response = await axios.get(`${decodedText}/${id}`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//           withCredentials: true,
//         });

//         console.log("Response Data:", response.data);
//         toast.success(response.data.message || "Attendance marked successfully!");

//         // Redirect to home after 2 seconds
//         setTimeout(() =>{}, 2000);
        
//       } catch (error) {
//         console.error("Error processing QR code:", error);
//         toast.error(error.response?.data?.message || "Failed to process QR code");
//         setScanning(true); // Allow scanning again in case of an error
//       } finally {
//         setProcessing(false);
//       }
//     };

//     scanner.render(processQRCode, (errorMessage) => {
//       console.error("QR Scan Error:", errorMessage);
//     });

//     return () => {
//       scanner.clear(); // Cleanup scanner on unmount
//     };
//   }, [navigate, scanning, processing]);


//   const handleReset = () => {
//     setScanResult(null);
//     setError(null);
//     setScanning(true);
//     window.location.reload(); // Reload to reinitialize scanner
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//       <Navbar />
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-2xl shadow-xl overflow-hidden"
//         >
//           {/* Header */}
//           <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
//             <div className="flex items-center space-x-4">
//               <div className="p-3 bg-white/20 rounded-lg">
//                 <QrCode className="w-8 h-8" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold">QR Code Scanner</h1>
//                 <p className="text-blue-100">Scan QR codes to mark attendance</p>
//               </div>
//             </div>
//           </div>

//           {/* Scanner Container */}
//           <div className="p-6">
//             <AnimatePresence mode="wait">
//               {scanning && !scanResult && (
//                 <motion.div
//                   key="scanner"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   className="relative"
//                 >
//                   <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none rounded-2xl" />
//                   <div className="mb-6 flex items-center justify-center space-x-2 text-gray-600">
//                     <Camera className="w-5 h-5" />
//                     <span>Position the QR code within the frame</span>
//                   </div>
//                   <div 
//                     id="reader" 
//                     className="overflow-hidden rounded-2xl border-2 border-blue-500/20"
//                   />
//                 </motion.div>
//               )}

//               {processing && (
//                 <motion.div
//                   key="processing"
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                   className="flex flex-col items-center justify-center py-12"
//                 >
//                   <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
//                   <p className="text-gray-600">Processing QR code...</p>
//                 </motion.div>
//               )}

//               {scanResult && (
//                 <motion.div
//                   key="result"
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   className="text-center py-8"
//                 >
//                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <CheckCircle className="w-8 h-8 text-green-500" />
//                   </div>
//                   <h3 className="text-xl font-semibold text-gray-800 mb-2">
//                     Scan Successful!
//                   </h3>
//                   <p className="text-gray-600 mb-6">{scanResult.message}</p>
//                   <button
//                     onClick={handleReset}
//                     className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//                   >
//                     <RefreshCw className="w-5 h-5" />
//                     <span>Scan Another Code</span>
//                   </button>
//                 </motion.div>
//               )}

//               {error && !scanning && (
//                 <motion.div
//                   key="error"
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   className="text-center py-8"
//                 >
//                   <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <XCircle className="w-8 h-8 text-red-500" />
//                   </div>
//                   <h3 className="text-xl font-semibold text-gray-800 mb-2">
//                     Scan Failed
//                   </h3>
//                   <p className="text-gray-600 mb-6">{error}</p>
//                   <button
//                     onClick={handleReset}
//                     className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//                   >
//                     <RefreshCw className="w-5 h-5" />
//                     <span>Try Again</span>
//                   </button>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default ScanQR;

import { useEffect, useState, useCallback, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2
} from "lucide-react";
import Navbar from "../components/Navbar";

const ScanQR = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef(null);

  const processQRCode = useCallback(async (decodedText) => {
    if (processing) return;
    
    setProcessing(true);
    setScanning(false);

    try {
      // Stop the scanner immediately
      if (scannerRef.current) {
        scannerRef.current.pause();
      }

      const response = await axios.get(`${decodedText}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      });

      setScanResult({
        success: true,
        message: response.data.message || "Attendance marked successfully!"
      });
      
      toast.success(response.data.message || "Attendance marked successfully!");
      
      // Clear scanner after successful scan
      if (scannerRef.current) {
        scannerRef.current.clear();
      }

    } catch (error) {
      console.error("Error processing QR code:", error);
      setError(error.response?.data?.message || "Failed to process QR code");
      toast.error(error.response?.data?.message || "Failed to process QR code");
      setScanning(true);
    } finally {
      setProcessing(false);
    }
  }, [id, processing]);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(processQRCode, (errorMessage) => {
      console.error("QR Scan Error:", errorMessage);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [scanning, processQRCode]);

  const handleReset = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setScanResult(null);
    setError(null);
    setScanning(true);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">QR Code Scanner</h1>
                <p className="text-blue-100">Scan QR codes to mark attendance</p>
              </div>
            </div>
          </div>

          {/* Scanner Container */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {scanning && !scanResult && !processing && (
                <motion.div
                  key="scanner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none rounded-2xl" />
                  <div className="mb-6 flex items-center justify-center space-x-2 text-gray-600">
                    <Camera className="w-5 h-5" />
                    <span>Position the QR code within the frame</span>
                  </div>
                  <div 
                    id="reader" 
                    className="overflow-hidden rounded-2xl border-2 border-blue-500/20"
                  />
                </motion.div>
              )}

              {processing && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                  <p className="text-gray-600">Processing QR code...</p>
                </motion.div>
              )}

              {scanResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Scan Successful!
                  </h3>
                  <p className="text-gray-600 mb-6">{scanResult.message}</p>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Scan Another Code</span>
                  </button>
                </motion.div>
              )}

              {error && !scanning && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Scan Failed
                  </h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center space-x-2 mx-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Try Again</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScanQR;