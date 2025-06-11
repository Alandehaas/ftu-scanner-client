import React from "react";

export default function ResultModal({ modalData, onClose }) {
   if (!modalData) return null;

   const isUnknown = modalData.object === "Unknown";

   const isCorrect = modalData.type === "correct";
   const isBulletList = Array.isArray(modalData.message);

   if (isUnknown) {
      return (
         <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative text-center">
               <button
                  onClick={onClose}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold">
                  ×
               </button>

               <div className="text-4xl mb-3">🤖</div>

               <h2 className="text-lg font-semibold text-gray-800 mb-2">No FTU Identified</h2>

               <p className="text-sm text-gray-600 mb-4">
                  We couldn't identify any FTU or related components in the image.
                  <br />
                  Please try uploading a clearer photo.
               </p>

               <button
                  onClick={onClose}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Close
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
         <div className="bg-white rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] relative flex flex-col">
            <button
               onClick={onClose}
               className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold z-10">
               ×
            </button>

            <div className="p-6 overflow-y-auto flex-1">
               <h2
                  className={`text-xl font-semibold mb-4 ${
                     isCorrect ? "text-green-600" : "text-red-600"
                  }`}>
                  {isCorrect ? "✅ Correct Installation" : "🚫 Incorrect Installation"}
               </h2>

               <p className="text-sm text-gray-700 mb-1">
                  <strong>Detected Object Responsible for {modalData.type} installation:</strong>{" "}
                  {modalData.object?.object ?? modalData.object ?? "Unknown"}
               </p>

               {modalData.type === "correct" && (
                  <p className="text-sm text-gray-500 italic mb-4">
                     Below are the details of when it is incorrectly installed.
                  </p>
               )}

               {isBulletList ? (
                  <ul className="text-sm text-gray-600 mb-4 list-disc list-inside space-y-1">
                     {modalData.message.map((item, index) => (
                        <li key={index}>{item.replace(/^- /, "")}</li>
                     ))}
                  </ul>
               ) : (
                  <p className="text-sm text-gray-600 mb-4">{modalData.message}</p>
               )}

               <img
                  src={modalData.imageUrl}
                  alt="Fused Analysis"
                  className="w-full max-h-96 object-contain rounded border"
               />
            </div>
         </div>
      </div>
   );
}
