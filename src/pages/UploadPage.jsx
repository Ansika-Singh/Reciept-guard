import { useState } from 'react';
import UploadZone from '../components/UploadZone.jsx';
import { extractReceiptUnified } from '../lib/aiExtractor.js';
import {
  getAiProvider,
  setAiProvider,
  getCustomApiKey,
  setCustomApiKey,
  getGroqApiKey,
  setGroqApiKey,
} from '../lib/storage.js';

/**
 * UploadPage component
 * Handles receipt capture, image preprocessing, and multi-provider AI extraction:
 * - Local In-Browser Engine (Zero-Key, 100% Offline)
 * - Groq Vision API (Llama-3.2 Vision)
 * - Google Gemini Vision API (Gemini Flash)
 * - Graceful fallback to manual entry mode
 */
export default function UploadPage({ onExtracted, onDirectManualEntry }) {
  const [provider, setProviderState] = useState(getAiProvider());
  const [isReading, setIsReading] = useState(false);
  const [readingStep, setReadingStep] = useState('');
  const [geminiKeyInput, setGeminiKeyInput] = useState(getCustomApiKey());
  const [groqKeyInput, setGroqKeyInput] = useState(getGroqApiKey());
  const [showConfig, setShowConfig] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleProviderChange = (newProvider) => {
    setProviderState(newProvider);
    setAiProvider(newProvider);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setCustomApiKey(geminiKeyInput);
    setGroqApiKey(groqKeyInput);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const handleImageProcessed = async (processed) => {
    setIsReading(true);
    setReadingStep('Pre-processing image and generating 64-bit perceptual hash…');

    setTimeout(async () => {
      const providerLabel =
        provider === 'local'
          ? 'Local In-Browser Engine'
          : provider === 'groq'
          ? 'Groq Llama-3.2 Vision API'
          : 'Google Gemini Vision API';

      setReadingStep(`Extracting receipt details with ${providerLabel}…`);

      try {
        const extracted = await extractReceiptUnified(processed, {
          provider,
          file: processed.file,
        });

        setIsReading(false);

        // Hand over to review screen with extracted data
        onExtracted({
          ...extracted,
          thumbnail: processed.thumbnail,
          fullImage: processed.dataUrl,
          imageHash: processed.imageHash,
          dimensions: processed.dimensions,
          sourceMode: 'ai_extracted',
          activeEngine: provider,
        });
      } catch (err) {
        console.warn(`Extraction with ${provider} encountered issue:`, err.message);

        // If cloud provider failed, attempt automatic local engine fallback first!
        if (provider !== 'local') {
          try {
            setReadingStep('Cloud API returned error, applying Local In-Browser Engine fallback…');
            const fallbackExtracted = await extractReceiptUnified(processed, { provider: 'local' });
            setIsReading(false);
            onExtracted({
              ...fallbackExtracted,
              thumbnail: processed.thumbnail,
              fullImage: processed.dataUrl,
              imageHash: processed.imageHash,
              dimensions: processed.dimensions,
              sourceMode: 'ai_extracted',
              activeEngine: 'local_fallback',
            });
            return;
          } catch (innerErr) {
            console.error('Local fallback failed:', innerErr);
          }
        }

        setIsReading(false);

        // Fallback banner info
        let fallbackReason = 'Extraction encountered an error or network was offline.';
        if (err.message.includes('MISSING')) {
          fallbackReason = 'API key was not supplied. Switched to manual entry mode.';
        } else {
          fallbackReason = err.message;
        }

        // Automatic fallback to review screen in manual entry mode with image preserved
        onExtracted({
          merchant: '',
          date: new Date().toISOString().split('T')[0],
          total: 0,
          currency: 'INR',
          tax: { total: 0, breakdown: [] },
          items: [],
          suggestedCategory: 'Other',
          thumbnail: processed.thumbnail,
          fullImage: processed.dataUrl,
          imageHash: processed.imageHash,
          dimensions: processed.dimensions,
          sourceMode: 'manual_fallback',
          fallbackReason,
        });
      }
    }, 350);
  };

  const handleStartManualBlank = () => {
    onExtracted({
      merchant: '',
      date: new Date().toISOString().split('T')[0],
      total: 0,
      currency: 'INR',
      tax: { total: 0, breakdown: [] },
      items: [],
      suggestedCategory: 'Food',
      thumbnail: null,
      fullImage: null,
      imageHash: null,
      sourceMode: 'manual_direct',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full gradient-primary text-white flex items-center justify-center font-bold text-sm shadow-md">1</div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">Upload</span>
        </div>
        <div className="flex-1 h-px bg-border mx-4"></div>
        <div className="flex items-center gap-2 opacity-50">
          <div className="w-8 h-8 rounded-full bg-surface border border-border text-muted flex items-center justify-center font-bold text-sm">2</div>
          <span className="text-sm font-bold text-muted hidden sm:inline">Extract</span>
        </div>
        <div className="flex-1 h-px bg-border mx-4"></div>
        <div className="flex items-center gap-2 opacity-50">
          <div className="w-8 h-8 rounded-full bg-surface border border-border text-muted flex items-center justify-center font-bold text-sm">3</div>
          <span className="text-sm font-bold text-muted hidden sm:inline">Review</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Add Expense Receipt
          </h2>
          <p className="text-sm text-muted mt-1">
            Capture or drop your receipt. AI will extract structured details instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Manual Entry Button */}
          <button
            type="button"
            onClick={handleStartManualBlank}
            className="px-4 py-2.5 bg-surface border border-border hover:bg-primary-50 hover:border-primary-100 text-primary text-sm font-bold rounded-button transition-all cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Manual Entry
          </button>
        </div>
      </div>

      {/* AI Engine Segmented Control */}
      <div className="bg-surface border border-border p-1 rounded-xl inline-flex w-full sm:w-auto shadow-sm">
        <button 
          onClick={() => { handleProviderChange('local'); setShowConfig(false); }}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${provider === 'local' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-gray-900 dark:hover:text-white'}`}
        >
          Local Engine
        </button>
        <button 
          onClick={() => { handleProviderChange('groq'); setShowConfig(true); }}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${provider === 'groq' ? 'bg-orange-500 text-white shadow-md' : 'text-muted hover:text-gray-900 dark:hover:text-white'}`}
        >
          Groq AI
        </button>
        <button 
          onClick={() => { handleProviderChange('gemini'); setShowConfig(true); }}
          className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${provider === 'gemini' ? 'bg-blue-600 text-white shadow-md' : 'text-muted hover:text-gray-900 dark:hover:text-white'}`}
        >
          Gemini AI
        </button>
      </div>

      {/* API Key Config (Only show if cloud provider is active) */}
      {showConfig && provider !== 'local' && (
        <div className="card p-5 border-l-4 border-l-primary bg-surface/50 space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">API Configuration</h3>
              <p className="text-xs text-muted">Required for cloud extraction</p>
            </div>
            <button
              onClick={() => setShowConfig(false)}
              className="text-xs text-muted hover:text-gray-900 dark:hover:text-white"
            >
              &times; Close
            </button>
          </div>
            <form onSubmit={handleSaveSettings} className="space-y-3 pt-2">
              {provider === 'groq' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Groq API Key (gsk_...)
                  </label>
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={groqKeyInput}
                    onChange={(e) => setGroqKeyInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-50"
                  />
                  <p className="text-[11px] text-muted mt-1">
                    Get a free instant key from <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-primary underline">console.groq.com</a> or set <code>VITE_GROQ_API_KEY</code>.
                  </p>
                </div>
              )}

              {provider === 'gemini' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Gemini API Key (AIzaSy...)
                  </label>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-50"
                  />
                  <p className="text-[11px] text-muted mt-1">
                    From Google AI Studio or set <code>VITE_GEMINI_API_KEY</code>.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-button hover:opacity-90 transition-smooth cursor-pointer"
                >
                  Save API Key
                </button>
                {savedNotification && (
                  <span className="text-xs text-success font-semibold">Saved successfully!</span>
                )}
              </div>
            </form>
        </div>
      )}

      {/* Loading State Overlay */}
      {isReading ? (
        <div className="card p-12 text-center border border-primary/20 bg-white/90 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mx-auto mb-4 animate-bounce">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12h5" />
              <path d="M17 12h5" />
              <path d="M12 2v5" />
              <path d="M12 17v5" />
              <path d="M4.93 4.93l3.54 3.54" />
              <path d="M15.54 15.54l3.54 3.54" />
              <path d="M4.93 19.07l3.54-3.54" />
              <path d="M15.54 8.46l3.54-3.54" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">Reading receipt...</h3>
          <p className="text-sm text-primary font-medium mb-6">{readingStep}</p>

          {/* Skeleton placeholders */}
          <div className="max-w-md mx-auto space-y-3">
            <div className="h-4 skeleton rounded-full w-3/4 mx-auto" />
            <div className="h-4 skeleton rounded-full w-1/2 mx-auto" />
            <div className="h-4 skeleton rounded-full w-2/3 mx-auto" />
          </div>
        </div>
      ) : (
        /* Upload Area */
        <UploadZone onImageProcessed={handleImageProcessed} isProcessing={isReading} />
      )}
    </div>
  );
}
