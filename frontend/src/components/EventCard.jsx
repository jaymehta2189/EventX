function EventCard({ event }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105">
      <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4">{event.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-blue-600 font-semibold">{event.date}</span>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
export default EventCard;