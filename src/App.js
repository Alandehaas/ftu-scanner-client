import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import logo from "./assets/logo.png";
import sampleVideo from "./assets/Development of FTU.mp4";
import importantPdf from "./assets/Important file document.pdf";
import PhotoManager from "./PhotoManager";

function Scanner() {
   const fileInputRef = useRef(null);
   const photoInputRef = useRef(null);
   const [modalData, setModalData] = useState(null); // { imageUrl, message, object }
   const [correctPhotos, setCorrectPhotos] = useState([]);
   const [incorrectPhotos, setIncorrectPhotos] = useState([]);
   const webcamRef = useRef(null);
   const [facingMode, setFacingMode] = useState("environment");
   const [isLoading, setIsLoading] = useState(false);

   const readFileAsDataURL = (file) =>
      new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = () => resolve(reader.result);
         reader.onerror = reject;
         reader.readAsDataURL(file);
      });

   const capture = async () => {
      setIsLoading(true); // 👈 Start loading
      const imageSrc = webcamRef.current.getScreenshot();

      if (!imageSrc) {
         console.log("Failed to capture image");
         return;
      }

      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const file = new File([blob], "scan.jpg", { type: "image/jpeg" });

      try {
         // Step 1: Send to /resnet50
         const formData = new FormData();
         formData.append("file", file);

         // Send to /resnet50
         const resnetResponse = await fetch("http://127.0.0.1:8000/resnet50?return_image=false", {
            method: "POST",
            body: formData,
         });

         const resnetData = await resnetResponse.json();
         console.log("Prediction result:", resnetData);

         const fusedResponse = await fetch("http://127.0.0.1:8000/fused?return_image=true", {
            method: "POST",
            body: formData, // Reuse the same image
         });

         const fusedBlob = await fusedResponse.blob();
         const fusedImageURL = URL.createObjectURL(fusedBlob);

         // Step 3: Get explanation from /result — now with formData
         const resultResponse = await fetch("http://127.0.0.1:8000/result", {
            method: "POST",
            body: formData,
         });

         if (!resultResponse.ok) {
            throw new Error(`result failed: ${await resultResponse.text()}`);
         }

         const resultData = await resultResponse.json();

         // Step 4: Show both — image + message
         const message = resultData.message || "No message provided.";
         const object = resultData.object || "None";

         const uploadedImageUrl = await readFileAsDataURL(file);

         setIncorrectPhotos((prev) => [...prev, uploadedImageUrl]);

         setModalData({
            type: resnetData.prediction,
            imageUrl: fusedImageURL,
            message,
            object,
         });
      } catch (err) {
         console.error("Error during photo analysis:", err);
         alert("Something went wrong. Please try again.");
      } finally {
         setIsLoading(false); // 👈 End loading
      }
   };

   const toggleCamera = () => {
      setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
   };

   return (
      <div className="scanner-container relative max-w-4xl mx-auto text-center mt-6">
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
         {modalData && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
               <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
                  <button
                     onClick={() => setModalData(null)}
                     className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold">
                     ×
                  </button>

                  {modalData.type === "correct" ? (
                     <>
                        <h2 className="text-xl font-semibold text-green-600 mb-4">
                           ✅ Correct Installation
                        </h2>
                        <p className="text-sm text-gray-700 mb-1">
                           <strong>Detected Object:</strong> {modalData.object}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">{modalData.message}</p>
                        <img
                           src={modalData.imageUrl}
                           alt="Fused Analysis"
                           className="w-full max-h-96 object-contain rounded border"
                        />
                     </>
                  ) : (
                     <>
                        <h2 className="text-xl font-semibold text-red-600 mb-2">
                           🚫 Incorrect Installation
                        </h2>
                        <p className="text-sm text-gray-700 mb-1">
                           <strong>Detected Object:</strong> {modalData.object}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">{modalData.message}</p>
                        <img
                           src={modalData.imageUrl}
                           alt="Fused Analysis"
                           className="w-full max-h-96 object-contain rounded border"
                        />
                     </>
                  )}
               </div>
            </div>
         )}
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

function ScanPage({ onExit }) {
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
         <Scanner />
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

function OperationsPage({ onNavigateToScan }) {
   const fileInputRef = useRef(null);
   const photoInputRef = useRef(null);
   const [modalData, setModalData] = useState(null); // { imageUrl, message, object }
   const [correctPhotos, setCorrectPhotos] = useState([]);
   const [incorrectPhotos, setIncorrectPhotos] = useState([]);
   const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true); // 👈 Start loading

      const file = e.target.files[0];
      if (!file) {
         console.log("No photo selected");
         return;
      }

      console.log("Uploaded photo:", file.name);

      try {
         // Step 1: Send to /resnet50
         const formData = new FormData();
         formData.append("file", file);

         // Send to /resnet50
         const resnetResponse = await fetch("http://127.0.0.1:8000/resnet50?return_image=false", {
            method: "POST",
            body: formData,
         });

         const resnetData = await resnetResponse.json();
         console.log("Prediction result:", resnetData);

         const fusedResponse = await fetch("http://127.0.0.1:8000/fused?return_image=true", {
            method: "POST",
            body: formData, // Reuse the same image
         });

         const fusedBlob = await fusedResponse.blob();
         const fusedImageURL = URL.createObjectURL(fusedBlob);

         // Step 3: Get explanation from /result — now with formData
         const resultResponse = await fetch("http://127.0.0.1:8000/result", {
            method: "POST",
            body: formData,
         });

         if (!resultResponse.ok) {
            throw new Error(`result failed: ${await resultResponse.text()}`);
         }

         const resultData = await resultResponse.json();

         // Step 4: Show both — image + message
         const message = resultData.message || "No message provided.";
         const object = resultData.object || "None";

         const uploadedImageUrl = await readFileAsDataURL(file);

         setIncorrectPhotos((prev) => [...prev, uploadedImageUrl]);

         setModalData({
            type: resnetData.prediction,
            imageUrl: fusedImageURL,
            message,
            object,
         });
      } catch (err) {
         console.error("Error during photo analysis:", err);
         alert("Something went wrong. Please try again.");
      } finally {
         setIsLoading(false); // 👈 End loading
      }
   };

   //   const handlePhotoUpload = (e) => {
   //     const file = e.target.files[0];
   //     if (file) console.log("Uploaded photo:", file.name);

   //     // call api: http://127.0.0.1:5000/resnet50?return_image=false with body: { "image": file }
   //     // this return: a json with {"prediction": "correct"} or {"prediction": "incorrect"} as the value
   //     // if correct good, else call api: http://http://127.0.0.1:5000/fused?return_image=true
   //     // this returns a image. visualize it in a modal or something
   //     // and also show a message together with the image from the api: http://127.0.0.1:5000/result
   //     // this returns a json with {
   // //     "message": "The FTU must not be installed directly beside an energy box. Leave sufficient space for other home installations such as breakers, meters, or distribution boards.",
   // //     "object": "energy box"}

   //   };

   const [showVideo, setShowVideo] = useState(false);
   const [showPdf, setShowPdf] = useState(false);
   const [showPhotoManager, setShowPhotoManager] = useState(false);
   const [photoType, setPhotoType] = useState("correct");

   return (
      <>
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Operations</h1>
            <div className="flex items-center gap-4">
               <input
                  type="text"
                  placeholder="Search"
                  className="border rounded-full px-6 py-2 shadow-sm focus:outline-none"
               />

               <div className="flex items-center gap-2">
                  <span className="text-sm">
                     Hello,
                     <br />
                     User Name
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
            <button
               onClick={() => fileInputRef.current.click()}
               className="flex-1 p-6 bg-blue-100 hover:bg-blue-200 rounded-xl flex items-center justify-center gap-3 text-lg font-medium shadow">
               📎 Attach File
            </button>
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

         <h2 className="text-lg font-semibold mb-2">Your Folders</h2>
         <div className="grid grid-cols-4 gap-4 mb-6">
            {[
               "Monthly Report Docs",
               "Important File",
               "Uploaded photos",
               "Uploaded files",
               "Correct Photos",
               "Incorrect Photos",
               "Audio File",
               "Square Dashboard",
            ].map((folder, index) => (
               <div
                  key={index}
                  className="border rounded-lg py-3 px-4 text-sm font-medium text-gray-700 bg-gray-100 shadow-sm hover:shadow-md flex items-center gap-2">
                  📁 {folder}
               </div>
            ))}
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

         {/* Video section */}
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

         {/* PDF viewer section */}
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

         {modalData && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
               <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
                  <button
                     onClick={() => setModalData(null)}
                     className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold">
                     ×
                  </button>

                  {modalData.type === "correct" ? (
                     <>
                        <h2 className="text-xl font-semibold text-green-600 mb-4">
                           ✅ Correct Installation
                        </h2>
                        <p className="text-sm text-gray-700 mb-1">
                           <strong>Detected Object:</strong> {modalData.object}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">{modalData.message}</p>
                        <img
                           src={modalData.imageUrl}
                           alt="Fused Analysis"
                           className="w-full max-h-96 object-contain rounded border"
                        />
                     </>
                  ) : (
                     <>
                        <h2 className="text-xl font-semibold text-red-600 mb-2">
                           🚫 Incorrect Installation
                        </h2>
                        <p className="text-sm text-gray-700 mb-1">
                           <strong>Detected Object:</strong> {modalData.object}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">{modalData.message}</p>
                        <img
                           src={modalData.imageUrl}
                           alt="Fused Analysis"
                           className="w-full max-h-96 object-contain rounded border"
                        />
                     </>
                  )}
                  {isLoading && (
                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                           <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-green-500 mx-auto mb-4" />
                           <p className="text-gray-700 font-medium">Processing...</p>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         )}
      </>
   );
}

// ----- New components you gave me: -----

function Statistics() {
   const [year, setYear] = useState(2025);

   const initialData = {
      2025: {
         Jan: { good: 20, bad: 5 },
         Feb: { good: 98, bad: 2 },
         Mar: { good: 84, bad: 12 },
         Apr: { good: 90, bad: 20 },
         May: { good: 0, bad: 0 },
         Jun: { good: 0, bad: 0 },
         Jul: { good: 0, bad: 0 },
         Aug: { good: 0, bad: 0 },
         Sep: { good: 0, bad: 0 },
         Oct: { good: 0, bad: 0 },
         Nov: { good: 0, bad: 0 },
         Dec: { good: 0, bad: 0 },
      },
   };

   const [data, setData] = useState(initialData);

   const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
   ];

   const getYearData = (year) => {
      if (!data[year]) {
         // If no data for this year, create empty good/bad values
         const emptyYearData = {};
         months.forEach((month) => {
            emptyYearData[month] = { good: 0, bad: 0 };
         });
         setData((prev) => ({ ...prev, [year]: emptyYearData }));
         return emptyYearData;
      }
      // Fill in missing months with zero values
      const filledData = { ...data[year] };
      months.forEach((month) => {
         if (!filledData[month]) {
            filledData[month] = { good: 0, bad: 0 };
         }
      });
      return filledData;
   };

   const currentYearData = getYearData(year);

   return (
      <div className="p-6 h-full text-gray-900 flex flex-col items-center">
         <h1 className="text-3xl font-bold mb-2">Statistics</h1>

         <div className="flex items-center space-x-4 mb-4">
            <button
               onClick={() => setYear((prev) => prev - 1)}
               className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
               ◀ Prev
            </button>
            <span className="text-lg font-semibold">{year}</span>
            <button
               onClick={() => setYear((prev) => prev + 1)}
               className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
               Next ▶
            </button>
         </div>

         <div className="w-full max-w-5xl flex justify-center items-end h-80 space-x-3 mb-4">
            {months.map((month) => (
               <div key={month} className="flex flex-col items-center">
                  <div className="flex flex-col justify-end h-56 w-8 space-y-1 relative">
                     <div
                        className="bg-green-500 w-8 rounded-t"
                        style={{ height: `${currentYearData[month].good * 2}px` }}
                        title={`Good: ${currentYearData[month].good}`}></div>
                     <div
                        className="bg-red-500 w-8 rounded-b"
                        style={{ height: `${currentYearData[month].bad * 2}px` }}
                        title={`Bad: ${currentYearData[month].bad}`}></div>
                  </div>
                  <span className="mt-1 text-sm">{month}</span>
               </div>
            ))}
         </div>

         <div className="text-sm text-gray-600 flex gap-6 mt-2">
            <div className="flex items-center gap-2">
               <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
               Good Installations
            </div>
            <div className="flex items-center gap-2">
               <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
               Bad Installations
            </div>
         </div>
      </div>
   );
}

// --------- Login Component ---------
function Login({ onLogin }) {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [rememberMe, setRememberMe] = useState(false);
   const [error, setError] = useState("");
   const [showReset, setShowReset] = useState(false);
   const [resetEmail, setResetEmail] = useState("");
   const [resetMessage, setResetMessage] = useState("");

   const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

   const handleSubmit = (e) => {
      e.preventDefault();
      if (!validateEmail(email)) {
         setError("Please enter a valid email address");
         return;
      }
      if (password.length === 0) {
         setError("Please enter your password");
         return;
      }
      setError("");
      onLogin();
   };

   const handleResetSubmit = (e) => {
      e.preventDefault();
      if (!validateEmail(resetEmail)) {
         setResetMessage("Please enter a valid email address");
         return;
      }
      // For demo: just show a confirmation message
      setResetMessage(
         `If an account exists for ${resetEmail}, you will receive a password reset email shortly.`
      );
   };

   return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
         {!showReset ? (
            <form
               onSubmit={handleSubmit}
               className="bg-white p-8 rounded shadow-md w-full max-w-md">
               <img src={logo} alt="Logo" className="mx-auto mb-6 w-24" />
               <h2 className="text-3xl font-semibold mb-6 text-center">Log In</h2>

               {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

               <div className="mb-5">
                  <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">
                     Email:
                  </label>
                  <input
                     id="email"
                     type="email"
                     placeholder="you@example.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                     required
                  />
               </div>

               <div className="mb-5">
                  <label htmlFor="password" className="block mb-2 text-gray-700 font-medium">
                     Password:
                  </label>
                  <input
                     id="password"
                     type="password"
                     placeholder="Enter your password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                     required
                  />
               </div>

               <div className="flex items-center justify-between mb-6">
                  <label className="inline-flex items-center text-gray-700">
                     <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="form-checkbox h-5 w-5 text-green-600"
                     />
                     <span className="ml-2">Remember me</span>
                  </label>
                  <button
                     type="button"
                     onClick={() => {
                        setShowReset(true);
                        setResetMessage("");
                        setResetEmail("");
                     }}
                     className="text-green-600 hover:underline text-sm focus:outline-none">
                     Forgot password?
                  </button>
               </div>

               <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition font-semibold">
                  Log In
               </button>
            </form>
         ) : (
            <form
               onSubmit={handleResetSubmit}
               className="bg-white p-8 rounded shadow-md w-full max-w-md">
               <h2 className="text-2xl font-semibold mb-6 text-center text-green-700">
                  Reset Password
               </h2>

               <p className="mb-4 text-center text-gray-700">
                  Enter your email address below and we’ll send you instructions to reset your
                  password.
               </p>

               <input
                  type="email"
                  placeholder="you@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
               />

               {resetMessage && <p className="mb-4 text-center text-green-600">{resetMessage}</p>}

               <div className="flex justify-between">
                  <button
                     type="button"
                     onClick={() => setShowReset(false)}
                     className="px-4 py-2 border rounded hover:bg-gray-100 transition">
                     Back to Login
                  </button>

                  <button
                     type="submit"
                     className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
                     Send Reset Link
                  </button>
               </div>
            </form>
         )}
      </div>
   );
}

function Settings({ onLogout }) {
   const [notificationsEnabled, setNotificationsEnabled] = useState(true);

   return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md h-full flex flex-col justify-between">
         <div>
            {/* Your existing settings content */}
            <div className="flex flex-col items-center space-y-4 mb-8">
               <div className="w-28 h-28 rounded-full bg-green-500 flex items-center justify-center text-white text-4xl font-bold shadow-md">
                  U
               </div>
               <h2 className="text-xl font-semibold text-gray-900">User Name</h2>
               <p className="text-gray-600">user.email@example.com</p>
            </div>

            <div className="space-y-6">
               <button
                  onClick={() => alert("Redirecting to Help & Support...")}
                  className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow-md transition">
                  Help & Support
               </button>

               <div className="flex items-center justify-between border rounded-md p-4">
                  <div>
                     <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                     <p className="text-gray-500 text-sm">Enable or disable app notifications.</p>
                  </div>
                  <label className="inline-flex relative items-center cursor-pointer">
                     <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                        className="sr-only peer"
                     />
                     <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition"></div>
                     <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md peer-checked:translate-x-5 transition"></div>
                  </label>
               </div>

               <div className="border rounded-md p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">About the App</h3>
                  <p className="text-gray-600 text-sm">
                     This app helps you manage operations and track installation statistics with
                     ease and efficiency. Version 1.0.0.
                  </p>
               </div>
            </div>
         </div>

         <button
            onClick={onLogout}
            className="w-full py-3 px-6 mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition">
            Log Out
         </button>
      </div>
   );
}

// ------------ Main App -------------

export default function App() {
   const [page, setPage] = useState("operations"); // or "settings", "statistics", "scan" etc.
   const [isLoggedIn, setIsLoggedIn] = useState(false);

   // When user logs in
   const handleLogin = () => {
      setIsLoggedIn(true);
      setPage("operations");
   };

   // When user logs out
   const handleLogout = () => {
      setIsLoggedIn(false);
      setPage("login");
   };

   if (!isLoggedIn) {
      // Show Login screen first
      return <Login onLogin={handleLogin} />;
   }

   // Logged in — show app UI
   return (
      <div className="flex min-h-screen bg-gray-100">
         {/* Sidebar */}
         <aside className="w-64 bg-white shadow-md p-6">
            <img src={logo} alt="Logo" className="mb-6 w-32 mx-auto" />
            <nav className="flex flex-col gap-4">
               <button
                  onClick={() => setPage("operations")}
                  className={`text-left px-3 py-2 rounded ${
                     page === "operations" ? "bg-green-600 text-white" : "hover:bg-green-100"
                  }`}>
                  📂 Operations
               </button>
               <button
                  onClick={() => setPage("statistics")}
                  className={`text-left px-3 py-2 rounded ${
                     page === "statistics" ? "bg-green-600 text-white" : "hover:bg-green-100"
                  }`}>
                  📊 Statistics
               </button>
               <button
                  onClick={() => setPage("settings")}
                  className={`text-left px-3 py-2 rounded ${
                     page === "settings" ? "bg-green-600 text-white" : "hover:bg-green-100"
                  }`}>
                  ⚙ Settings
               </button>
            </nav>
         </aside>

         {/* Main Content */}
         <main className="flex-grow p-6 overflow-auto">
            {page === "operations" && <OperationsPage onNavigateToScan={() => setPage("scan")} />}
            {page === "scan" && <ScanPage onExit={() => setPage("operations")} />}
            {page === "statistics" && <Statistics />}
            {page === "settings" && <Settings onLogout={handleLogout} />}
         </main>
      </div>
   );
}
