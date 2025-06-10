import React, { useRef, useState } from "react";
import sampleVideo from "../assets/Development of FTU.mp4";
import importantPdf from "../assets/Important file document.pdf";
import PhotoManager from "../PhotoManager";
import ResultModal from "./ResultModal";
import { installation_issues } from "./installationIssues";

export default function OperationsPage({ onNavigateToScan }) {
   const fileInputRef = useRef(null);
   const photoInputRef = useRef(null);

   const [modalData, setModalData] = useState(null);
   const [correctPhotos, setCorrectPhotos] = useState([]);
   const [incorrectPhotos, setIncorrectPhotos] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

   const [showVideo, setShowVideo] = useState(false);
   const [showPdf, setShowPdf] = useState(false);
   const [showPhotoManager, setShowPhotoManager] = useState(false);
   const [photoType, setPhotoType] = useState("correct");

   const readFileAsDataURL = (file) =>
      new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => resolve(reader.result);
         reader.onerror = reject;
         reader.readAsDataURL(file);
      });

   const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file) console.log("Attached file:", file.name);
   };

   const handlePhotoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

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

         const uploadedImageUrl = await readFileAsDataURL(file);

         if (classification === "correct") {
            setCorrectPhotos((prev) => [...prev, uploadedImageUrl]);
         } else {
            setIncorrectPhotos((prev) => [...prev, uploadedImageUrl]);
         }

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

   return (
      <div>
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Operations</h1>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <span className="text-sm">
                     Hello
                     <br />
                     User
                  </span>
                  <span className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                     <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-7 h-7 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                     </svg>
                  </span>
               </div>
            </div>
         </div>

         <div className="flex gap-4 mb-6">
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />

            <button
               onClick={() => photoInputRef.current.click()}
               className="flex-1 p-6 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center gap-3 text-lg font-medium shadow">
               📷 Choose Photo
            </button>
            <input
               type="file"
               ref={photoInputRef}
               accept="image/*"
               className="hidden"
               onChange={handlePhotoUpload}
            />

            <button
               onClick={onNavigateToScan}
               className="flex-1 p-6 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center gap-3 text-lg font-medium shadow">
               📠 Scan
            </button>
         </div>

         <h2 className="text-lg font-semibold mb-2">Your Files</h2>
         <div className="grid grid-cols-4 gap-4">
            {[
               {
                  icon: "📄",
                  name: "Important File Docs",
                  onClick: () => setShowPdf(true),
               },
               {
                  icon: "🎥",
                  name: "Video",
                  onClick: () => setShowVideo(true),
               },
               {
                  icon: "🖼",
                  name: "Correct Photos",
                  onClick: () => {
                     setShowPhotoManager(true);
                     setPhotoType("correct");
                  },
               },
               {
                  icon: "🚫",
                  name: "Incorrect Photos",
                  onClick: () => {
                     setShowPhotoManager(true);
                     setPhotoType("incorrect");
                  },
               },
            ].map((file, index) => (
               <div
                  key={index}
                  onClick={file.onClick}
                  className="cursor-pointer border rounded-lg py-6 px-4 text-sm font-medium text-gray-700 bg-white shadow-sm hover:shadow-md flex flex-col items-center">
                  <div className="text-2xl mb-2">{file.icon}</div>
                  {file.name}
               </div>
            ))}
         </div>

         {/* Modals */}
         {showVideo && (
            <div className="mt-6">
               <video controls width="100%" className="rounded shadow-md">
                  <source src={sampleVideo} type="video/mp4" />
                  Your browser does not support the video tag.
               </video>
               <button
                  onClick={() => setShowVideo(false)}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded">
                  Close Video
               </button>
            </div>
         )}

         {showPdf && (
            <div className="mt-6">
               <iframe
                  src={importantPdf}
                  width="100%"
                  height="600px"
                  className="border rounded shadow-md"
                  title="Important File Document"
               />
               <button
                  onClick={() => setShowPdf(false)}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded">
                  Close PDF
               </button>
            </div>
         )}

         {showPhotoManager && (
            <div>
               <PhotoManager
                  photoType={photoType}
                  photos={photoType === "correct" ? correctPhotos : incorrectPhotos}
               />
               <button
                  onClick={() => setShowPhotoManager(false)}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded">
                  Close Photo Manager
               </button>
            </div>
         )}

         <ResultModal modalData={modalData} onClose={() => setModalData(null)} />

         {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
               <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500 mx-auto mb-4" />
                  <p className="text-gray-700 font-medium">Processing...</p>
               </div>
            </div>
         )}
      </div>
   );
}
