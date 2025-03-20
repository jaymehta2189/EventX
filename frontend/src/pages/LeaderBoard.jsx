import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Users, AlertCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const LeaderBoard = () => {
    const {id}= useParams();
  const [groups, setGroups] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await axios.get(`${API_BASE_URL}/api/v1/events/event/leaderboard/${id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Send Authorization token separately
            },
            withCredentials: true, // Ensures cookies are sent
          });
          console.log(response.data);
          console.log(response.data.data);
          console.log(response.data.data.groups);

        setGroups(response.data.data.groups);
      } catch (err) {
        setError('Failed to load leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [id]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const getPositionStyle = (index) => {
    switch (index) {
      case 0:
        return 'bg-yellow-100 border-yellow-400';
      case 1:
        return 'bg-gray-100 border-gray-400';
      case 2:
        return 'bg-orange-100 border-orange-400';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getMedalIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="text-yellow-500 h-8 w-8" />;
      case 1:
        return <Medal className="text-gray-500 h-8 w-8" />;
      case 2:
        return <Medal className="text-orange-500 h-8 w-8" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Leaderboard Rankings
            </h1>
            <p className="text-lg text-gray-600">
              Current standings and scores for all groups
            </p>
          </div>

          {groups === null ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Results Not Declared Yet
              </h2>
              <p className="text-gray-500">
                The competition results have not been finalized. Please check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group, index) => (
                <div
                  key={index}
                  className={`rounded-lg shadow-md border-2 p-6 transition-transform duration-200 hover:transform hover:scale-102 ${getPositionStyle(
                    index
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getMedalIcon(index) || (
                          <Users className="text-blue-500 h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-gray-900">
                          {group.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Rank #{index + 1}
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {group.score}
                      <span className="text-sm text-gray-500 ml-1">points</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderBoard;