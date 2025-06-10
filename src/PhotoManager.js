import React from "react";

export default function PhotoManager({ photoType, photos }) {
  return (
    <div className="bg-white p-4 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4 capitalize">
        {photoType === "correct" ? "✅ Correct" : "🚫 Incorrect"} Photos
      </h2>

      {photos.length === 0 ? (
        <p className="text-gray-500">No photos uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((url, idx) => (
            <div key={idx} className="rounded overflow-hidden border">
              <img
                src={url}
                alt={`${photoType}-${idx}`}
                className="w-full h-40 object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
