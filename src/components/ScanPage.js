import React from "react";
import CameraCapture from "./CameraCapture";

export default function ScanPage({ onExit }) {
   return (
      <div>
         <button
            onClick={onExit}
            className="absolute top-4 right-4 text-white text-2xl font-bold bg-green-600 rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-700"
            aria-label="Close scan">
            ×
         </button>

         <h2 className="text-lg font-semibold mb-4">Scan Camera</h2>

         <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
            <strong>FTU Installation Requirements:</strong>
            <p>
               For the FTU (100 x 100 x 30 mm), there must be at least{" "}
               <span className="font-semibold">350 x 140 x 100 mm</span> (H x W x D) of free space
               for placing the FTU and ONT.
            </p>
         </div>

         <CameraCapture />

         <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold mb-2">FTU Placement Guidelines</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
               <li>Ensure min. 350 x 140 x 100 mm free space.</li>
               <li>FTU must be horizontal and screwed in.</li>
               <li>Not above or within 10 cm of heating.</li>
               <li>Use machine-readable code (1–8 characters).</li>
               <li>Code must be on the base plate, not cover.</li>
            </ul>
         </div>
      </div>
   );
}
