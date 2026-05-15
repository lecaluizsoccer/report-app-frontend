import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default marker icons broken by Vite's asset handling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const categoryEmoji = {
  buraco: "🕳️",
  lixo: "🗑️",
  iluminação: "💡",
  outro: "🚧",
};

// Inner component that adjusts the map view to fit all markers
function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15);
    } else {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);

  return null;
}

export default function ReportMap({ reports }) {
  const withLocation = reports.filter((r) => r.location?.lat && r.location?.lng);
  const points = withLocation.map((r) => ({ lat: r.location.lat, lng: r.location.lng }));

  // Default center: São Paulo
  const defaultCenter = [-23.5505, -46.6333];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden w-full">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">🗺️ Mapa do relatório</h2>
        {withLocation.length === 0 ? (
          <p className="text-sm text-gray-400 mt-1">
            Ainda não há dados de localização — habilite a localização ao enviar um relatório.
          </p>
        ) : (
          <p className="text-sm text-gray-400 mt-1">
            {withLocation.length} relatório{withLocation.length !== 1 ? "s" : ""} no mapa
          </p>
        )}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "320px", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds points={points} />

        {withLocation.map((r) => (
          <Marker
            key={r._id}
            position={[r.location.lat, r.location.lng]}
          >
            <Popup>
              <div style={{ minWidth: "140px" }}>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>
                  {categoryEmoji[r.category] || "📍"}{" "}
                  <span style={{ textTransform: "capitalize" }}>{r.category}</span>
                </p>
                <p style={{ fontSize: 13, color: "#4b5563", margin: 0 }}>
                  {r.description}
                </p>
                <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
