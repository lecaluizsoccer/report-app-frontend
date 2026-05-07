import { useEffect, useState } from "react";
import ReportForm from "./ReportForm";
import ReportList from "./ReportList";
import ReportMap from "./ReportMap";
import AdminPanel from "./AdminPanel";

function App() {
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("report");

  const fetchReports = async () => {
    try {
      const res = await fetch("http://localhost:3000/reports");
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const tabs = [
    { id: "report", label: "📝 Report" },
    { id: "view",   label: "🗺️ View"   },
    { id: "admin",  label: "⚙️ Admin"  },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start">
      <div className="w-full max-w-lg mx-auto px-6 py-8">

        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            🏙️ Community Reporter
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Report issues in your neighborhood
          </p>
        </header>

        {/* Tabs */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6 bg-white shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium transition
                ${activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "report" && (
          <ReportForm
            onReportAdded={() => {
              fetchReports();
              setActiveTab("view");
            }}
          />
        )}

        {activeTab === "view" && (
          <div className="flex flex-col gap-6">
            <ReportMap reports={reports} />
            <ReportList reports={reports} />
          </div>
        )}

        {activeTab === "admin" && (
          <AdminPanel reports={reports} onRefresh={fetchReports} />
        )}

      </div>
    </div>
  );
}

export default App;
