const STATUS_LABELS = {
  open: { label: "Open", color: "bg-red-100 text-red-600" },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-600" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-600" },
};

export default function ReportList({ reports }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md w-full">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        📋 Relatórios
      </h2>

      {reports.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">
          Nenhum relatório ainda. Seja o primeiro a reportar um problema!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((r) => (
            <div
              key={r._id}
              className="p-4 border border-gray-100 rounded-lg bg-gray-50"
            >
              {/* Photo */}
              {r.imageUrl && (
                <img
                  src={r.imageUrl}
                  alt="Report"
                  className="w-full rounded-lg object-cover max-h-48 mb-3"
                />
              )}

              {/* Top row: category + date */}
              <div className="flex justify-between items-center text-sm mb-1">
                <span className="font-semibold capitalize text-gray-800">
                  {r.category}
                </span>
                <span className="text-gray-400 text-xs">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">
                {r.description}
              </p>

              {/* Bottom row: location + status */}
              <div className="flex justify-between items-center mt-2">
                {r.location ? (
                  <p className="text-xs text-gray-400">
                    📍 {r.location.lat.toFixed(3)}, {r.location.lng.toFixed(3)}
                  </p>
                ) : <span />}

                <span className={`text-xs font-medium px-2 py-1 rounded-full
                  ${STATUS_LABELS[r.status]?.color || "bg-gray-100 text-gray-500"}`}>
                  {STATUS_LABELS[r.status]?.label || "Open"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
