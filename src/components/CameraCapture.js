import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import ResultModal from "./ResultModal";
import { installation_issues } from "./installationIssues";

export default function CameraCapture({ onCaptureComplete }) {
   const [modalData, setModalData] = useState(null);
   const webcamRef = useRef(null);
   const [facingMode, setFacingMode] = useState("environment");
   const [isLoading, setIsLoading] = useState(false);

   const capture = async () => {
      const imageSrc = webcamRef.current.getScreenshot();

      if (!imageSrc) {
         console.log("Failed to capture image");
         return;
      }

      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], "scan.jpg", { type: "image/jpeg" });

      try {
         setIsLoading(true);
         console.log(isLoading);

         const formData = new FormData();
         formData.append("file", file);

         const resnetResponse = await fetch("https://ftuscannerwebapp-gxabbbbcdfcke6d8.westeurope-01.azurewebsites.net/resnet50?return_image=false", {
            method: "POST",
            body: formData,
         });
         const resnetData = await resnetResponse.json();
         const classification = resnetData.prediction;

         const fusedResponse = await fetch("https://ftuscannerwebapp-gxabbbbcdfcke6d8.westeurope-01.azurewebsites.net/fused?return_image=true", {
            method: "POST",
            body: formData,
         });
         const fusedBlob = await fusedResponse.blob();
         const fusedImageURL = URL.createObjectURL(fusedBlob);

         const resultResponse = await fetch("https://ftuscannerwebapp-gxabbbbcdfcke6d8.westeurope-01.azurewebsites.net/result", {
            method: "POST",
            body: formData,
         });
         const resultData = await resultResponse.json();
         const object = resultData.object || "Unknown";

         console.log("ResNet Prediction:", classification);
         console.log("Fused Image URL:", fusedImageURL);
         console.log("Detected Object:", resultData.object);

         setModalData({
            type: resnetData.prediction,
            imageUrl: fusedImageURL,
            message: installation_issues[object],
            object,
         });
      } catch (err) {
         console.error("Photo analysis failed:", err);
         alert("Something went wrong. Please try again.");
      } finally {
         setIsLoading(false);
      }
   };

   const toggleCamera = () => {
      setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
   };

   return (
      <div className="relative max-w-4xl mx-auto text-center mt-6">
         <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-lg w-full"
            videoConstraints={{ facingMode }}
         />
         <div className="overlay absolute inset-0 pointer-events-none">
            <div className="scan-text absolute top-[10%] w-full text-white font-bold text-lg">
               Scan
            </div>
            <div className="scan-frame absolute top-1/2 left-1/2 w-[60%] h-[50%] transform -translate-x-1/2 -translate-y-1/2 border-4 border-green-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
         </div>
         <div className="flex justify-center gap-4 mt-4">
            <button className="bg-green-600 text-white px-6 py-2 rounded" onClick={capture}>
               📸 Scan
            </button>
            <button className="bg-gray-600 text-white px-6 py-2 rounded" onClick={toggleCamera}>
               🔁 Flip
            </button>
         </div>

         <ResultModal modalData={modalData} onClose={() => setModalData(null)} />

         {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium">Processing...</p>
               </div>
            </div>
         )}
      </div>
   );
}
