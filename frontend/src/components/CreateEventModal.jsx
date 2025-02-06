// import { useState } from 'react';
// import { X, Calendar, MapPin, Upload, DollarSign, Users, School, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
// import { toast } from 'react-toastify';
// import axios from 'axios';
// import { motion, AnimatePresence } from 'framer-motion';

// const STEPS = {
//   BASIC_INFO: 0,
//   SCHEDULE: 1,
//   PARTICIPATION: 2,
//   AVATAR: 3
// };

// const CATEGORIES = ['technology', 'sports', 'education'];
// const BRANCHES = ['CE', 'IT', 'EC ', 'CH'];

// const stepVariants = {
//   enter: (direction) => ({
//     x: direction > 0 ? 1000 : -1000,
//     opacity: 0
//   }),
//   center: {
//     zIndex: 1,
//     x: 0,
//     opacity: 1
//   },
//   exit: (direction) => ({
//     zIndex: 0,
//     x: direction < 0 ? 1000 : -1000,
//     opacity: 0
//   })
// };

// export default function CreateEventModal({ isOpen, onClose }) {
//   const [step, setStep] = useState(STEPS.BASIC_INFO);
//   const [direction, setDirection] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [locations, setLocations] = useState([]);
//   const [formData, setFormData] = useState({
//     name: '',
//     category: '',
//     description: '',
//     startDate: '',
//     endDate: '',
//     location: '',
//     pricePool: '',
//     groupLimit: '',
//     userLimit: '',
//     girlMinLimit: '',
//     branchs: [],
//     avatar: null
//   });

//   const handleInputChange = (e) => {
//     const { name, value, type } = e.target;
//     if (type === 'select-multiple') {
//       const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
//       setFormData(prev => ({ ...prev, [name]: selectedOptions }));
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const fetchAvailableLocations = async () => {
//     if (!formData.startDate || !formData.endDate) return;

//     try {
//       setLoading(true);
//       const response = await axios.post('http://localhost:4000/api/v1/events/freelocation', {
//           startDate: formData.startDate,
//           endDate: formData.endDate
//       });
//       console.log("for location ",response.data.data);
//       const normalizedLocations = response.data.data.map((location) => ({
//         id: location, // Use the location string as the id
//         name: location // Use the location string as the name
//       }));
//       setLocations(normalizedLocations);
//     } catch (error) {
//       toast.error('Failed to fetch available locations');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData(prev => ({ ...prev, avatar: file }));
//     }
//   };

//   const handleSubmit = async () => {
//     try {
//       setLoading(true);
//       const formDataToSend = new FormData();
//       Object.entries(formData).forEach(([key, value]) => {
//         if (key === 'branchs') {
//           formDataToSend.append(key, JSON.stringify(value));
//         } else {
//           formDataToSend.append(key, value);
//         }
//       });

//       await axios.post('http://localhost:4000/api/v1/events/create', formDataToSend, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });

//       toast.success('Event created successfully!');
//       onClose();
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to create event');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const paginate = (newDirection) => {
//     setDirection(newDirection);
//     setStep(prev => prev + newDirection);
//   };

//   const renderStepContent = () => {
//     switch (step) {
//       case STEPS.BASIC_INFO:
//         return (
//           <motion.div
//             key="basic-info"
//             custom={direction}
//             variants={stepVariants}
//             initial="enter"
//             animate="center"
//             exit="exit"
//             transition={{
//               x: { type: "spring", stiffness: 300, damping: 30 },
//               opacity: { duration: 0.2 }
//             }}
//             className="space-y-6"
//           >
//             <div className="space-y-4">
//               <div className="relative">
//                 <Sparkles className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleInputChange}
//                   placeholder="Event Name"
//                   className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
//                 />
//               </div>
//               <div className="relative">
//                 <select
//                   name="category"
//                   value={formData.category}
//                   onChange={handleInputChange}
//                   className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
//                 >
//                   <option value="">Select Category</option>
//                   {CATEGORIES.map(category => (
//                     <option key={category} value={category.toLowerCase()}>{category}</option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   rows="4"
//                   className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
//                   placeholder="Event Description"
//                 />
//               </div>
//             </div>
//           </motion.div>
//         );

//       case STEPS.SCHEDULE:
//         return (
//           <motion.div
//             key="schedule"
//             custom={direction}
//             variants={stepVariants}
//             initial="enter"
//             animate="center"
//             exit="exit"
//             transition={{
//               x: { type: "spring", stiffness: 300, damping: 30 },
//               opacity: { duration: 0.2 }
//             }}
//             className="space-y-6"
//           >
//             <div className="grid grid-cols-2 gap-4">
//               <div className="relative">
//                 <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                 <input
//                   type="datetime-local"
//                   name="startDate"
//                   value={formData.startDate}
//                   onChange={handleInputChange}
//                   className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
//                 />
//               </div>
//               <div className="relative">
//                 <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                 <input
//                   type="datetime-local"
//                   name="endDate"
//                   value={formData.endDate}
//                   onChange={handleInputChange}
//                   onBlur={fetchAvailableLocations}
//                   className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
//                 />
//               </div>
//             </div>
//             <div className="relative">
//               <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <select
//                 name="location"
//                 value={formData.location}
//                 onChange={handleInputChange}
//                 className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
//                 disabled={loading || locations.length === 0}
//               >
//                 <option value="">Select Location</option>
//                 {locations.map(location => (
//                   <option key={location.id} value={location.id}>{location.name}</option>
//                 ))}
//               </select>
//               {loading && (
//                 <div className="mt-2 text-sm text-gray-500 flex items-center">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2" />
//                   Loading available locations...
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         );

//       case STEPS.PARTICIPATION:
//         return (
//           <motion.div
//             key="participation"
//             custom={direction}
//             variants={stepVariants}
//             initial="enter"
//             animate="center"
//             exit="exit"
//             transition={{
//               x: { type: "spring", stiffness: 300, damping: 30 },
//               opacity: { duration: 0.2 }
//             }}
//             className="space-y-6"
//           >
//             <div className="relative">
//               <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <input
//                 type="number"
//                 name="pricePool"
//                 value={formData.pricePool}
//                 onChange={handleInputChange}
//                 placeholder="Prize Pool Amount"
//                 className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="relative">
//                 <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                 <input
//                   type="number"
//                   name="groupLimit"
//                   value={formData.groupLimit}
//                   onChange={handleInputChange}
//                   placeholder="Max Groups"
//                   className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
//                 />
//               </div>
//               <div className="relative">
//                 <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                 <input
//                   type="number"
//                   name="userLimit"
//                   value={formData.userLimit}
//                   onChange={handleInputChange}
//                   placeholder="Users per Group"
//                   className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
//                 />
//               </div>
//             </div>
//             <div className="relative">
//               <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <input
//                 type="number"
//                 name="girlMinLimit"
//                 value={formData.girlMinLimit}
//                 onChange={handleInputChange}
//                 placeholder="Minimum Girls Required"
//                 className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
//               />
//             </div>
//             <div className="relative">
//               <School className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <select
//                 name="branchs"
//                 multiple
//                 value={formData.branchs}
//                 onChange={handleInputChange}
//                 className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 min-h-[120px]"
//               >
//                 {BRANCHES.map(branch => (
//                   <option key={branch} value={branch.toLowerCase()}>{branch}</option>
//                 ))}
//               </select>
//               <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple branches</p>
//             </div>
//           </motion.div>
//         );

//       case STEPS.AVATAR:
//         return (
//           <motion.div
//             key="avatar"
//             custom={direction}
//             variants={stepVariants}
//             initial="enter"
//             animate="center"
//             exit="exit"
//             transition={{
//               x: { type: "spring", stiffness: 300, damping: 30 },
//               opacity: { duration: 0.2 }
//             }}
//             className="space-y-6"
//           >
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-all duration-200 hover:border-blue-500">
//               <div className="text-center">
//                 <Upload className="mx-auto h-12 w-12 text-gray-400" />
//                 <div className="mt-4">
//                   <label htmlFor="file-upload" className="cursor-pointer">
//                     <span className="mt-2 block text-sm font-medium text-gray-700">
//                       Drop an image here, or click to select
//                     </span>
//                     <input
//                       id="file-upload"
//                       name="avatar"
//                       type="file"
//                       accept="image/*"
//                       onChange={handleFileChange}
//                       className="hidden"
//                     />
//                   </label>
//                 </div>
//               </div>
//               {formData.avatar && (
//                 <motion.div 
//                   initial={{ opacity: 0, scale: 0.8 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   className="mt-4"
//                 >
//                   <img
//                     src={URL.createObjectURL(formData.avatar)}
//                     alt="Preview"
//                     className="mx-auto h-32 w-32 object-cover rounded-lg shadow-lg"
//                   />
//                 </motion.div>
//               )}
//             </div>
//           </motion.div>
//         );

//       default:
//         return null;
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="flex min-h-screen items-center justify-center px-4 pt-16 pb-32">
//         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />
        
//         <motion.div 
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="relative bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl"
//         >
//           <button
//             onClick={onClose}
//             className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 transition-colors"
//           >
//             <X className="h-6 w-6" />
//           </button>

//           <div className="mb-8">
//             <div className="flex items-center justify-between">
//               <h2 className="text-2xl font-bold text-gray-900">Create Event</h2>
//               <div className="flex items-center space-x-2">
//                 {Array.from({ length: 4 }).map((_, index) => (
//                   <motion.div
//                     key={index}
//                     initial={false}
//                     animate={{
//                       scale: index === step ? 1.2 : 1,
//                       backgroundColor: index <= step ? '#3B82F6' : '#E5E7EB'
//                     }}
//                     className="h-2 w-12 rounded-full transition-all duration-200"
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>

//           <AnimatePresence initial={false} custom={direction} mode="wait">
//             {renderStepContent()}
//           </AnimatePresence>

//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="flex justify-between mt-8"
//           >
//             <button
//               type="button"
//               onClick={() => paginate(-1)}
//               disabled={step === 0}
//               className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
//                 step === 0
//                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               <ChevronLeft className="h-5 w-5 mr-1" />
//               Back
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 if (step === STEPS.AVATAR) {
//                   handleSubmit();
//                 } else {
//                   paginate(1);
//                 }
//               }}
//               disabled={loading}
//               className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:bg-blue-300"
//             >
//               {loading ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
//                   Loading...
//                 </>
//               ) : step === STEPS.AVATAR ? (
//                 <>
//                   Create Event
//                   <Sparkles className="h-5 w-5 ml-1" />
//                 </>
//               ) : (
//                 <>
//                   Next
//                   <ChevronRight className="h-5 w-5 ml-1" />
//                 </>
//               )}
//             </button>
//           </motion.div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  X,
  Calendar,
  MapPin,
  Upload,
  DollarSign,
  Users,
  School,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Trophy,
  Clock,
  Building,
  UserPlus,
  Image as ImageIcon,
  CheckCircle
} from 'lucide-react';

const STEPS = {
  BASIC_INFO: 0,
  SCHEDULE: 1,
  PARTICIPATION: 2,
  AVATAR: 3
};

const CATEGORIES = ['technology', 'sports', 'education'];
const BRANCHES = ['CE', 'IT', 'EC', 'CH'];

const stepVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9
  })
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const inputClasses = "w-full px-6 py-4 pl-12 rounded-xl border-2 bg-white/50 backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 shadow-sm hover:shadow-md";

export default function CreateEventModal({ isOpen, onClose }) {
  const [step, setStep] = useState(STEPS.BASIC_INFO);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    pricePool: '',
    groupLimit: '',
    userLimit: '',
    girlMinLimit: '',
    branchs: [],
    avatar: null
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'select-multiple') {
      const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
      setFormData(prev => ({ ...prev, [name]: selectedOptions }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const fetchAvailableLocations = async () => {
    if (!formData.startDate || !formData.endDate) return;

    try {
      console.log(formData.startDate, formData.endDate);
      setLoading(true);
      const response = await axios.post('http://localhost:4000/api/v1/events/event/location', {
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      const normalizedLocations = response.data.data.map(location => ({
        id: location,
        name: location
      }));
      setLocations(normalizedLocations);
    } catch (error) {
      toast.error('Failed to fetch available locations');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'branchs') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value);
        }
      });

      await axios.post('http://localhost:4000/api/v1/events/event', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Event created successfully!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setStep(prev => prev + newDirection);
  };

  const getStepIcon = (stepNumber) => {
    switch (stepNumber) {
      case STEPS.BASIC_INFO:
        return <Trophy className="w-6 h-6" />;
      case STEPS.SCHEDULE:
        return <Clock className="w-6 h-6" />;
      case STEPS.PARTICIPATION:
        return <UserPlus className="w-6 h-6" />;
      case STEPS.AVATAR:
        return <ImageIcon className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const getStepTitle = (stepNumber) => {
    switch (stepNumber) {
      case STEPS.BASIC_INFO:
        return "Event Details";
      case STEPS.SCHEDULE:
        return "Schedule & Location";
      case STEPS.PARTICIPATION:
        return "Participation Rules";
      case STEPS.AVATAR:
        return "Event Image";
      default:
        return "";
    }
  };

  const renderStepContent = () => {
    const steps = {
      [STEPS.BASIC_INFO]: (
        <motion.div
          key="basic-info"
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-6"
        >
          <div className="space-y-6">
            <motion.div variants={fadeInUp} className="relative">
              <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Event Name"
                className={inputClasses}
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={inputClasses}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category.toLowerCase()}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className={`${inputClasses} pl-6`}
                placeholder="Event Description"
              />
            </motion.div>
          </div>
        </motion.div>
      ),

      [STEPS.SCHEDULE]: (
        <motion.div
          key="schedule"
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-6">
            <motion.div variants={fadeInUp} className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={inputClasses}
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                onBlur={fetchAvailableLocations}
                className={inputClasses}
              />
            </motion.div>
          </div>

          <motion.div variants={fadeInUp} className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
            <select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={inputClasses}
              disabled={loading || locations.length === 0}
            >
              <option value="">Select Location</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-indigo-600 flex items-center"
              >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2" />
                Fetching available locations...
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      ),

      [STEPS.PARTICIPATION]: (
        <motion.div
          key="participation"
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-6"
        >
          <motion.div variants={fadeInUp} className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
            <input
              type="number"
              name="pricePool"
              value={formData.pricePool}
              onChange={handleInputChange}
              placeholder="Prize Pool Amount"
              className={inputClasses}
            />
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            <motion.div variants={fadeInUp} className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
              <input
                type="number"
                name="groupLimit"
                value={formData.groupLimit}
                onChange={handleInputChange}
                placeholder="Max Groups"
                className={inputClasses}
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
              <input
                type="number"
                name="userLimit"
                value={formData.userLimit}
                onChange={handleInputChange}
                placeholder="Users per Group"
                className={inputClasses}
              />
            </motion.div>
          </div>

          <motion.div variants={fadeInUp} className="relative">
            <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
            <input
              type="number"
              name="girlMinLimit"
              value={formData.girlMinLimit}
              onChange={handleInputChange}
              placeholder="Minimum Girls Required"
              className={inputClasses}
            />
          </motion.div>

          <motion.div variants={fadeInUp} className="relative">
            <School className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
            <select
              name="branchs"
              multiple
              value={formData.branchs}
              onChange={handleInputChange}
              className={`${inputClasses} min-h-[120px]`}
            >
              {BRANCHES.map(branch => (
                <option key={branch} value={branch.toLowerCase()}>{branch}</option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple branches</p>
          </motion.div>
        </motion.div>
      ),

      [STEPS.AVATAR]: (
        <motion.div
          key="avatar"
          custom={direction}
          variants={stepVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-6"
        >
          <motion.div
            variants={fadeInUp}
            className="relative border-2 border-dashed border-indigo-200 rounded-xl p-10 transition-all duration-300 hover:border-indigo-500 group"
          >
            <input
              type="file"
              id="avatar"
              name="avatar"
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <label
              htmlFor="avatar"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              {formData.avatar ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <img
                    src={URL.createObjectURL(formData.avatar)}
                    alt="Preview"
                    className="w-64 h-64 object-cover rounded-xl shadow-lg"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <CheckCircle className="w-8 h-8 text-green-500 bg-white rounded-full" />
                  </motion.div>
                </motion.div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-16 w-16 text-indigo-500 group-hover:scale-110 transition-transform duration-300" />
                  <p className="mt-4 text-lg font-medium text-gray-700">
                    Drop your event image here, or click to browse
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              )}
            </label>
          </motion.div>
        </motion.div>
      )
    };

    return steps[step];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-16 pb-32">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white/90 backdrop-blur-md rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-white/20"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>

          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Event</h2>
              <p className="text-gray-500">Fill in the details to create your event</p>
            </motion.div>

            <div className="mt-8 flex justify-center space-x-4">
              {[0, 1, 2, 3].map((index) => (
                <motion.div
                  key={index}
                  className={`flex items-center ${index !== 3 ? 'flex-1' : ''}`}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: index <= step ? 'rgb(79, 70, 229)' : 'rgb(229, 231, 235)',
                      scale: index === step ? 1.1 : 1,
                    }}
                    className="relative rounded-full w-10 h-10 flex items-center justify-center"
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        color: index <= step ? 'white' : 'rgb(107, 114, 128)',
                      }}
                    >
                      {getStepIcon(index)}
                    </motion.div>
                  </motion.div>
                  {index !== 3 && (
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor: index < step ? 'rgb(79, 70, 229)' : 'rgb(229, 231, 235)',
                      }}
                      className="h-1 flex-1"
                    />
                  )}
                </motion.div>
              ))}
            </div>

            <motion.p
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-4 font-medium text-gray-600"
            >
              {getStepTitle(step)}
            </motion.p>
          </div>

          <div className="relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-between mt-12 pt-6 border-t border-gray-100"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => paginate(-1)}
              disabled={step === 0}
              className={`flex items-center px-6 py-3 rounded-xl transition-all duration-200 ${
                step === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                if (step === STEPS.AVATAR) {
                  handleSubmit();
                } else {
                  paginate(1);
                }
              }}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : step === STEPS.AVATAR ? (
                <>
                  Create Event
                  <Sparkles className="h-5 w-5 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-5 w-5 ml-2" />
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}