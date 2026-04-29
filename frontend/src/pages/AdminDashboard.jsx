import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const statusColors = {
  Open: "bg-blue-100 text-blue-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Resolved: "bg-green-100 text-green-700",
};

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);

  const fetchAll = async () => {
    try {
      const { data } = await api.get("/tickets/all");
      setTickets(data);
    } catch {
      // silent
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tickets/${id}`, { status });
      fetchAll();
    } catch {
      // silent
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-lg text-gray-800">Admin Panel</h1>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Logout</button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="font-semibold text-gray-700 mb-4">All Tickets ({tickets.length})</h2>
        {tickets.length === 0 ? (
          <p className="text-sm text-gray-400">No tickets found.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t._id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{t.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      By {t.createdBy?.name} ({t.createdBy?.email}) · {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[t.status]}`}>
                      {t.status}
                    </span>
                    <select
                      value={t.status}
                      onChange={(e) => updateStatus(t._id, e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}