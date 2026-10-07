import { useState, useRef } from 'react';
import { resizeImage, createThumbnail, computePerceptualHash } from '../lib/imageProcessing.js';
import { UploadCloud, Camera, CheckCircle2, AlertTriangle, Coffee, Laptop } from 'lucide-react';

/**
 * UploadZone component
 * Supports drag-and-drop, standard file picker, mobile camera capture, and 1-click test receipt presets.
 */
export default function UploadZone({ onImageProcessed, isProcessing = false }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.name.endsWith('.svg')) {
      setErrorMessage('Please upload a valid image file (JPEG, PNG, WebP, or SVG).');
      return;
    }
    setErrorMessage('');

    try {
      // 1. Downscale large images on canvas (max ~1600px)
      const resized = await resizeImage(file, 1600, 'image/jpeg', 0.85);

      // 2. Generate ~200px JPEG thumbnail for lightweight localStorage persistence
      const thumbnail = await createThumbnail(resized.dataUrl);

      // 3. Compute 64-bit Average Perceptual Hash (aHash) for visual duplicate matching
      const imageHash = await computePerceptualHash(resized.dataUrl);

      onImageProcessed({
        file,
        dataUrl: resized.dataUrl,
        base64Data: resized.base64Data,
        mimeType: resized.mimeType,
        thumbnail,
        imageHash,
        dimensions: { width: resized.width, height: resized.height },
      });
    } catch (err) {
      console.error('Error processing image:', err);
      setErrorMessage('Failed to process image: ' + err.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Helper to load sample test receipts from public folder
  const handleLoadSample = async (samplePath) => {
    try {
      setErrorMessage('');
      const response = await fetch(samplePath);
      if (!response.ok) throw new Error('Could not fetch sample receipt');
      const blob = await response.blob();
      const file = new File([blob], samplePath.split('/').pop(), { type: blob.type || 'image/svg+xml' });
      processFile(file);
    } catch (err) {
      setErrorMessage('Failed to load sample: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Drop Zone Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative overflow-hidden rounded-[24px] p-10 md:p-14 text-center border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragOver
            ? 'border-primary bg-primary-50/80 scale-[1.01] shadow-lg'
            : 'border-primary-100 hover:border-primary-light bg-surface hover:bg-primary-50/30'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label="Upload receipt area. Drag and drop receipt or click to browse"
      >
        {isDragOver && (
           <div className="absolute inset-0 bg-gradient-to-r from-primary-light/10 to-accent/10 pointer-events-none"></div>
        )}

        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${isDragOver ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-primary-50 text-primary'}`}>
          <UploadCloud size={40} className={isDragOver ? 'animate-bounce' : ''} />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Drop your receipt snapshot here
        </h3>
        <p className="text-sm text-muted mb-8 max-w-md mx-auto">
          High-res photos will automatically be downscaled and hashed for AI-assisted analysis
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 gradient-primary text-white text-sm font-bold rounded-button hover:opacity-90 transition-all cursor-pointer flex items-center gap-2 shadow-md"
          >
            <UploadCloud size={18} />
            Choose File
          </button>

          {/* Mobile Camera Capture */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="px-6 py-3 bg-surface text-primary border border-border text-sm font-bold rounded-button hover:bg-primary-50 transition-all cursor-pointer flex items-center gap-2"
          >
            <Camera size={18} />
            Camera Capture
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {/* Mobile camera input with capture="environment" */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {errorMessage}
        </div>
      )}

      {/* Quick Test Sample Presets Card for Judges & Hackathon Demo */}
      <div className="card p-6 border-0 shadow-sm bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white tracking-wide">
            <CheckCircle2 size={16} className="text-primary-light" />
            CYRUS Hackathon Quick-Test
          </div>
          <span className="text-[11px] font-semibold text-primary px-2 py-1 bg-primary-50 rounded-full">1-Click Load</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Preset 1 */}
          <button
            type="button"
            onClick={() => handleLoadSample('/sample-receipts/starbucks_420.svg')}
            className="p-4 bg-surface border border-border hover:border-amber-400 hover:shadow-md rounded-2xl text-left transition-all cursor-pointer group flex flex-col"
          >
            <div className="flex items-center justify-between mb-2 w-full">
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Coffee size={14} />
              </div>
              <span className="text-sm font-black text-amber-700">₹420</span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">Starbucks Coffee</span>
            <p className="text-[11px] text-muted leading-tight mt-auto">
              Food &middot; Triggers <span className="font-semibold text-amber-700 dark:text-amber-500">Duplicate</span> alert
            </p>
          </button>

          {/* Preset 2 */}
          <button
            type="button"
            onClick={() => handleLoadSample('/sample-receipts/croma_electronics_8499.svg')}
            className="p-4 bg-surface border border-border hover:border-red-400 hover:shadow-md rounded-2xl text-left transition-all cursor-pointer group flex flex-col"
          >
            <div className="flex items-center justify-between mb-2 w-full">
              <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                <Laptop size={14} />
              </div>
              <span className="text-sm font-black text-red-700">₹8,499</span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">Croma Megastore</span>
            <p className="text-[11px] text-muted leading-tight mt-auto">
              Electronics &middot; Triggers <span className="font-semibold text-red-700 dark:text-red-500">Unusual Expense</span> alert
            </p>
          </button>

          {/* Preset 3 */}
          <button
            type="button"
            onClick={() => handleLoadSample('/sample-receipts/amazon_gst_2499.svg')}
            className="p-4 bg-surface border border-border hover:border-emerald-400 hover:shadow-md rounded-2xl text-left transition-all cursor-pointer group flex flex-col"
          >
            <div className="flex items-center justify-between mb-2 w-full">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Laptop size={14} />
              </div>
              <span className="text-sm font-black text-emerald-700">₹2,499</span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">Amazon India</span>
            <p className="text-[11px] text-muted leading-tight mt-auto">
              Electronics &middot; Normal range with 18% IGST
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
