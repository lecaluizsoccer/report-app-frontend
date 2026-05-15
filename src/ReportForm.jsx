import { useState } from "react";

const CLOUDINARY_CLOUD_NAME = "dfzromxxx";
const CLOUDINARY_UPLOAD_PRESET = "image_cloud";

export default function ReportForm({ onReportAdded }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => alert("Location permission denied")
    );
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      if (image) {
        setUploadProgress("Uploading photo...");
        imageUrl = await uploadToCloudinary(image);
      }

      setUploadProgress("Salvando relatório...");

      const reportData = { category, description, location, imageUrl };

      const res = await fetch("https://report-app-backend-wnop.onrender.com/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      await res.json();
      alert("Relatório salvo!");
      onReportAdded && onReportAdded();

      // reset
      setCategory("");
      setDescription("");
      setLocation(null);
      setImage(null);
      setPreview(null);
      setUploadProgress("");
    } catch (err) {
      console.error(err);
      alert("EErro ao salvar o relatório: " + err.message);
    }

    setLoading(false);
    setUploadProgress("");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-full">
      <h2 className="text-lg font-semibold mb-6 text-gray-800">
        Informar um problema
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Photo */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">
            Foto (opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4
                       file:rounded-lg file:border-0 file:text-sm file:font-medium
                       file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-1 rounded-lg w-full object-cover max-h-48"
            />
          )}
        </div>

        {/* Location */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">Localização</label>
          <button
            type="button"
            onClick={getLocation}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700
                       py-3 rounded-lg text-sm font-medium transition"
          >
            {location
              ? `📍 ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`
              : "📍 Habilitar localização"}
          </button>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">Categoria</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg text-sm
                       bg-white text-gray-700 focus:outline-none focus:ring-2
                       focus:ring-blue-500"
            required
          >
            <option value="">Selecione a categoria</option>
            <option value="pothole">🕳️ Buraco</option>
            <option value="trash">🗑️ Lixo</option>
            <option value="lighting">💡 iluminação</option>
            <option value="other">🚧 outro</option>
          </select>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">Descrição</label>
          <textarea
            placeholder="Descreva o problema..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 p-3 rounded-lg text-sm
                       text-gray-700 resize-none focus:outline-none focus:ring-2
                       focus:ring-blue-500"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm
                     font-medium hover:bg-blue-700 active:bg-blue-800
                     disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? uploadProgress || "Submitting..." : "Enviar Relatório"}
        </button>

      </form>
    </div>
  );
}
