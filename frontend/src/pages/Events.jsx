
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Search,
  MapPin,
  Calendar,
  Tag,
  Filter,
  Loader2,
  X,
  ChevronRight,
} from 'lucide-react';

import Navbar from '../components/Navbar';

const CATEGORIES = ['technology', 'sports', 'education'];
const LOCATIONS = ['MMH','Seminar Hall','Center foyer','Canteen','Narayan Bhavan'];

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getCategoryColor = (category) => {
  const colors = {
    technology: 'bg-blue-100 text-blue-600',
    sports: 'bg-green-100 text-green-600',
    education: 'bg-purple-100 text-purple-600',
  };
  return colors[category] || 'bg-gray-100 text-gray-600';
};

function Events() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:4000/api/v1/events');
        setEvents(response.data.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = searchTerm === '' || 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === '' || event.category === selectedCategory;
      const matchesLocation = selectedLocation === '' || event.location === selectedLocation;
      const matchesDate = selectedDate === '' || 
        new Date(event.startDate).toISOString().split('T')[0] === selectedDate;

      return matchesSearch && matchesCategory && matchesLocation && matchesDate;
    });
  }, [events, searchTerm, selectedCategory, selectedLocation, selectedDate]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedDate('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
     

        {/* Search and Filters Section */}
        <div
          
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none w-full md:w-48 pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="appearance-none w-full md:w-48 pl-10 pr-8 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">All Locations</option>
                {LOCATIONS.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full md:w-48 pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory || selectedLocation || selectedDate) && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
              >
                <X className="h-5 w-5 mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="col-span-full flex flex-col items-center justify-center py-12"
              >
                <Filter className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </motion.div>
            ) : (
              filteredEvents.map((event) => (
                <motion.div
                  key={event._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300"
                  onClick={() => navigate(`/events/${event._id}`)}
                >
                  <div className="relative h-48">
                    <img
                      src={event.avatar || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(event.category)}`}>
                        {event.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{event.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button className="flex items-center text-blue-500 hover:text-blue-600 transition-colors">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Events;