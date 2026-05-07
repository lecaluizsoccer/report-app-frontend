import { useState } from "react";

const STATUS_LABELS = {
  open: { label: "Open", color: "bg-red-100 text-red-600" },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-600" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-600" },
};

const categoryEmoji = {
  pothole: "🕳️",
  trash: "🗑️",
  lighting: "💡",
  other: "🚧",
};

export default function AdminPanel({ reports, onRefresh }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("https://report-app-backend-wnop.onrender.com/reports/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        setLoggedIn(true);
      } else {
        setLoginError("Invalid username or password.");
      }
    } catch {
      setLoginError("Could not connect to server.");
    }
  };

  const handleStatusChange = async (id, status) => {
    setLoadingId(id);
    try {
      await fetch(`https://report-app-backend-wnop.onrender.com/reports/reports/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onRefresh();
    } catch (err) {
      alert("Failed to update status");
    }
    setLoadingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this report?")) return;
    setLoadingId(id);
    try {
      await fetch(`https://report-app-backend-wnop.onrender.com/reports/reports/${id}`, { method: "DELETE" });
      onRefresh();
    } catch {
      alert("Failed to delete report");
    }
    setLoadingId(null);
  };

  // Login screen
  if (!loggedIn) {
    return (
      <div style={{backgroundColor:"white", borderRadius:"12px", boxShadow:"0 1px 3px rgba(0,0,0,0.1)", width:"100%", padding:"32px"}}>
        <h2 style={{fontSize:"18px", fontWeight:600, marginBottom:"6px", color:"#1f2937"}}>🔐 Admin Login</h2>
        <p style={{fontSize:"14px", color:"#9ca3af", marginBottom:"28px"}}>Enter your credentials to continue.</p>

        <form onSubmit={handleLogin} style={{display:"flex", flexDirection:"column", gap:"20px"}}>
          <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
            <label style={{fontSize:"14px", fontWeight:500, color:"#4b5563"}}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              style={{width:"100%", border:"1px solid #d1d5db", padding:"12px", borderRadius:"8px", fontSize:"14px", color:"#374151", outline:"none", boxSizing:"border-box"}}
            />
          </div>

          <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
            <label style={{fontSize:"14px", fontWeight:500, color:"#4b5563"}}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{width:"100%", border:"1px solid #d1d5db", padding:"12px", borderRadius:"8px", fontSize:"14px", color:"#374151", outline:"none", boxSizing:"border-box"}}
            />
          </div>

          {loginError && (
            <p style={{fontSize:"14px", color:"#ef4444"}}>{loginError}</p>
          )}

          <button
            type="submit"
            style={{width:"100%", backgroundColor:"#2563eb", color:"white", padding:"12px", borderRadius:"8px", fontSize:"14px", fontWeight:500, border:"none", cursor:"pointer"}}
          >
            Login
          </button>
        </form>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          ⚙️ Admin Panel
        </h2>
        <button
          onClick={() => setLoggedIn(false)}
          className="text-xs text-gray-400 hover:text-gray-600 transition"
        >
          Logout
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white p-5 rounded-xl shadow-md text-center">
          <p className="text-gray-400 text-sm py-6">No reports yet.</p>
        </div>
      ) : (
        reports.map((r) => (
          <div
            key={r._id}
            className="bg-white p-4 rounded-xl shadow-md flex flex-col gap-3"
          >
            {/* Photo */}
            {r.imageUrl && (
              <img
                src={r.imageUrl}
                alt="Report"
                className="w-full rounded-lg object-cover max-h-40"
              />
            )}

            {/* Top row */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-gray-800 capitalize">
                  {categoryEmoji[r.category] || "📍"} {r.category}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_LABELS[r.status]?.color || "bg-gray-100 text-gray-500"}`}>
                {STATUS_LABELS[r.status]?.label || r.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600">{r.description}</p>

            {/* Location */}
            {r.location && (
              <p className="text-xs text-gray-400">
                📍 {r.location.lat.toFixed(3)}, {r.location.lng.toFixed(3)}
              </p>
            )}

            {/* Status selector */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500">Change status</label>
              <select
                value={r.status || "open"}
                disabled={loadingId === r._id}
                onChange={(e) => handleStatusChange(r._id, e.target.value)}
                className="w-full border border-gray-200 p-2 rounded-lg text-sm
                           bg-white text-gray-700 focus:outline-none focus:ring-2
                           focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Delete */}
            <button
              onClick={() => handleDelete(r._id)}
              disabled={loadingId === r._id}
              className="w-full border border-red-200 text-red-500 py-2 rounded-lg
                         text-sm font-medium hover:bg-red-50 transition
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingId === r._id ? "Processing..." : "🗑️ Delete Report"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}