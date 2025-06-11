import React from "react";

export default function NoFtuModal({ onClose }) {
   return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
         <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full relative text-center">
            <button
               onClick={onClose}
               className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold">
               ×
            </button>

            <div className="text-4xl mb-3">🤖</div>

            <h2 className="text-lg font-semibold text-gray-800 mb-2">
               No FTU Identified
            </h2>

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
