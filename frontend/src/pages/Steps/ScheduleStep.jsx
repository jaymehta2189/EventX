import React, { useState, useEffect } from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const ScheduleStep = ({ formData, setFormData }) => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      if (formData.startDate && formData.endDate) {
        setIsLoading(true);
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/events/freelocation`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              startDate: formData.startDate,
              endDate: formData.endDate,
            }),
          });

          if (!response.ok) throw new Error('Failed to fetch locations');

          const data = await response.json();
          setLocations(data);

          if (data.length === 0) {
            toast.info('No locations available for the selected dates');
          }
        } catch (error) {
          toast.error('Error fetching locations');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLocations();
  }, [formData.startDate, formData.endDate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date
            </div>
          </label>
          <input
            type="datetime-local"
            id="startDate"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              End Date
            </div>
          </label>
          <input
            type="datetime-local"
            id="endDate"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location
          </div>
        </label>
        <select
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          disabled={isLoading || !formData.startDate || !formData.endDate}
          required
        >
          <option value="">
            {isLoading 
              ? 'Loading locations...' 
              : !formData.startDate || !formData.endDate 
                ? 'Select dates first'
                : 'Select a location'
            }
          </option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ScheduleStep;