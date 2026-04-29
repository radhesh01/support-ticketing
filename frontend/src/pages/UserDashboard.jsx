import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const statusColors = {
  Open: "bg-blue-100 text-blue-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Resolved: "bg-green-100 text-green-700",
};

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/tickets");
      setTickets(data);
    } catch {
      // silent
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/tickets", form);
      setForm({ title: "", description: "" });
      setSuccess("Ticket created! Confirmation email sent.");
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-lg text-gray-800">Support Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Hi, {user?.name}</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Create Ticket */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-700 mb-4">New Ticket</h2>
          {success && <p className="text-green-600 text-sm mb-3">{success}</p>}
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Describe your issue..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        </div>

        {/* Ticket List */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-3">My Tickets</h2>
          {tickets.length === 0 ? (
            <p className="text-sm text-gray-400">No tickets yet.</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t._id} className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">{t.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[t.status]}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}