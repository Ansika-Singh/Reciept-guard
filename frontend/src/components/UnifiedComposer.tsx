import React, { useState, useRef, useEffect } from 'react';
import { 
  Paperclip, 
  ArrowUp, 
  Mic, 
  MicOff, 
  X, 
  FileText, 
  ShieldCheck, 
  Plus, 
  Maximize2,
  Package,
  RotateCcw,
  Shield,
  UploadCloud
} from 'lucide-react';

interface UnifiedComposerProps {
  onFileUpload: (file: File) => void;
  onSendMessage?: (message: string) => void;
  isProcessing: boolean;
  onQuickOrderCheck?: (orderId: string) => void;
  shopperId?: string;
  currentReceiptId?: string | null;
  theme?: 'light' | 'dark';
  showQuickChips?: boolean;
}

interface AttachedFilePreview {
  id: string;
  file: File;
  previewUrl?: string;
  fileType: 'image' | 'pdf' | 'text' | 'other';
  sizeFormatted: string;
}

export const UnifiedComposer: React.FC<UnifiedComposerProps> = ({
  onFileUpload,
  onSendMessage,
  isProcessing,
  onQuickOrderCheck,
  theme = 'light',
  showQuickChips = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFilePreview[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [previewModalName, setPreviewModalName] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const MAX_ATTACHMENTS = 3;
  const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp,.heic,.heif,.txt,application/pdf,image/*,text/plain';

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Detect file type
  const detectFileType = (file: File): 'image' | 'pdf' | 'text' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) return 'pdf';
    if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) return 'text';
    return 'other';
  };

  // Add files to attachments
  const handleAddFiles = (filesList: FileList | File[]) => {
    const filesArray = Array.from(filesList);
    if (filesArray.length === 0) return;

    const availableSlots = MAX_ATTACHMENTS - attachedFiles.length;
    if (availableSlots <= 0) return;

    const newAttachments: AttachedFilePreview[] = filesArray.slice(0, availableSlots).map((file) => {
      const type = detectFileType(file);
      let previewUrl: string | undefined = undefined;
      if (type === 'image') {
        previewUrl = URL.createObjectURL(file);
      }
      return {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl,
        fileType: type,
        sizeFormatted: formatFileSize(file.size),
      };
    });

    setAttachedFiles((prev) => [...prev, ...newAttachments]);
    setIsExpanded(true);
  };

  // Remove attachment and revoke object URL
  const handleRemoveAttachment = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAttachedFiles((prev) => {
      const filtered = prev.filter((item) => {
        if (item.id === id && item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
        return item.id !== id;
      });
      return filtered;
    });
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      attachedFiles.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [attachedFiles]);

  // Click outside to collapse if empty
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (composerRef.current && !composerRef.current.contains(e.target as Node)) {
        if (inputText.trim() === '' && attachedFiles.length === 0) {
          setIsExpanded(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputText, attachedFiles]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Handle Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  // Speech recognition handler
  const handleToggleVoice = () => {
    setVoiceError(null);
    const windowObj = window as any;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Voice input is not supported in this browser.');
      setTimeout(() => setVoiceError(null), 3500);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setIsExpanded(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceError('Could not recognize voice. Please try again or type.');
        setTimeout(() => setVoiceError(null), 3500);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceError('Speech recognition could not be initialized.');
      setTimeout(() => setVoiceError(null), 3500);
    }
  };

  // Submit action
  const handleSubmit = () => {
    if (isProcessing) return;

    // Case 1: Attachment uploaded -> upload real receipt file to backend
    if (attachedFiles.length > 0) {
      const primaryFile = attachedFiles[0].file;
      onFileUpload(primaryFile);
      setAttachedFiles([]);
      setInputText('');
      setIsExpanded(false);
      return;
    }

    // Case 2: Query submitted
    const query = inputText.trim();
    if (!query) return;

    // Check for order lookup pattern
    const orderMatch = query.match(/(?:check\s+order|order\s+status|order)\s+([a-zA-Z0-9_-]+)/i);
    if (orderMatch && orderMatch[1] && onQuickOrderCheck) {
      onQuickOrderCheck(orderMatch[1].toUpperCase());
    } else if (onSendMessage) {
      onSendMessage(query);
    }

    setInputText('');
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = inputText.trim().length > 0 || attachedFiles.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      
      {/* Voice feedback toast */}
      {voiceError && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center animate-in fade-in slide-in-from-top-2 duration-200">
          {voiceError}
        </div>
      )}

      {/* Main Composer Container */}
      <div
        ref={composerRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!isExpanded) {
            setIsExpanded(true);
            setTimeout(() => textareaRef.current?.focus(), 50);
          }
        }}
        className={`relative transition-all duration-300 ease-out border overflow-hidden ${
          theme === 'light'
            ? isExpanded
              ? 'rounded-3xl bg-white border-slate-200/90 p-4 ring-2 ring-indigo-500/20 shadow-2xl shadow-slate-300/60 text-slate-900'
              : 'rounded-full bg-white hover:bg-white border-slate-200/90 hover:border-slate-300 px-5 py-3.5 shadow-xl shadow-slate-200/80 text-slate-900 cursor-pointer'
            : isExpanded
              ? 'rounded-3xl bg-slate-900/90 border-slate-700/80 p-4 ring-1 ring-indigo-500/30 text-slate-100 shadow-2xl backdrop-blur-xl'
              : 'rounded-full bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700 px-5 py-3.5 shadow-2xl text-slate-100 cursor-pointer'
        } ${isDragging ? (theme === 'light' ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' : 'border-indigo-500 bg-indigo-500/10 scale-[1.01]') : ''}`}
      >
        
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
          accept={ACCEPTED_EXTENSIONS}
          multiple
          className="hidden"
        />

        {/* Attachment Strip (Shown when expanded or has files) */}
        {attachedFiles.length > 0 && (
          <div className={`flex flex-wrap items-center gap-2 pb-3 mb-2 border-b ${
            theme === 'light' ? 'border-slate-100' : 'border-slate-800/80'
          }`}>
            {attachedFiles.map((item) => (
              <div
                key={item.id}
                className={`group relative flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-xl border text-xs transition ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-200/90 text-slate-800'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200'
                }`}
              >
                {item.fileType === 'image' && item.previewUrl ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewModalUrl(item.previewUrl || null);
                      setPreviewModalName(item.file.name);
                    }}
                    className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-200 cursor-pointer flex-shrink-0"
                    title="Click to zoom"
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Maximize2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                ) : item.fileType === 'pdf' ? (
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                )}

                <div className="flex flex-col min-w-0 max-w-[140px]">
                  <span className={`text-[11px] font-medium truncate ${
                    theme === 'light' ? 'text-slate-800' : 'text-slate-200'
                  }`}>
                    {item.file.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {item.sizeFormatted}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleRemoveAttachment(item.id, e)}
                  className={`p-1 rounded-full transition ${
                    theme === 'light'
                      ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/70'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {attachedFiles.length < MAX_ATTACHMENTS && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-dashed text-xs transition ${
                  theme === 'light'
                    ? 'border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-400 bg-slate-50'
                    : 'border-slate-700 text-slate-400 hover:text-indigo-300 hover:border-indigo-500/40'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add file</span>
              </button>
            )}
          </div>
        )}

        {/* Input Field Row */}
        <div className="flex items-center space-x-3">
          
          {/* Expanded Textarea vs Collapsed Input */}
          {isExpanded ? (
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a purchase or upload a receipt..."
              className={`flex-1 bg-transparent text-sm focus:outline-none resize-none leading-relaxed ${
                theme === 'light'
                  ? 'text-slate-900 placeholder-slate-400'
                  : 'text-slate-100 placeholder-slate-500'
              }`}
            />
          ) : (
            <div className={`flex-1 flex items-center text-sm select-none ${
              theme === 'light' ? 'text-slate-400' : 'text-slate-400'
            }`}>
              <span>Ask about a purchase or upload a receipt...</span>
            </div>
          )}

          {/* Collapsed Right Actions (Microphone button like reference) */}
          {!isExpanded && (
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className={`p-2 rounded-full transition ${
                  theme === 'light'
                    ? 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
                }`}
                title="Attach Receipt (PDF, Image, TXT)"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVoice();
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/30'
                    : theme === 'light'
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-950 text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
                title="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Expanded Bottom Toolbar */}
        {isExpanded && (
          <div className={`flex items-center justify-between pt-3 mt-2 border-t ${
            theme === 'light' ? 'border-slate-100' : 'border-slate-800/80'
          }`}>
            
            {/* Left: Engine & Security Badge */}
            <div className="flex items-center space-x-2 text-xs">
              <div className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                theme === 'light'
                  ? 'bg-slate-50 border border-slate-200 text-slate-600'
                  : 'bg-slate-950 border border-slate-800 text-slate-300'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Rupertrace Engine</span>
              </div>
            </div>

            {/* Right: Add Attachment + Mic / Send Buttons */}
            <div className="flex items-center space-x-2">
              
              {/* Add Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachedFiles.length >= MAX_ATTACHMENTS}
                className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition disabled:opacity-40 ${
                  theme === 'light'
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Attach receipt file"
              >
                <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Attach</span>
              </button>

              {/* Microphone Action */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2 rounded-xl transition ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : theme === 'light'
                      ? 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700'
                      : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
                title="Voice input"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Dynamic Send / Upload Action Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!hasContent || isProcessing}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  hasContent && !isProcessing
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 scale-100 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                }`}
                title={attachedFiles.length > 0 ? 'Upload & Extract Receipt' : 'Send Question'}
              >
                {attachedFiles.length > 0 ? (
                  <UploadCloud className="w-4 h-4" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
              </button>

            </div>
          </div>
        )}

      </div>

      {/* Quick Action Chips (Only shown when showQuickChips is true) */}
      {showQuickChips && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition shadow-2xs cursor-pointer ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-900'
                : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
            <span>Upload Receipt</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputText('Can I still return my winter jacket? What is the deadline?');
              setIsExpanded(true);
              setTimeout(() => textareaRef.current?.focus(), 50);
            }}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition shadow-2xs cursor-pointer ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-900'
                : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Check Return Policy</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInputText('Which purchased items have active warranty protection?');
              setIsExpanded(true);
              setTimeout(() => textareaRef.current?.focus(), 50);
            }}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition shadow-2xs cursor-pointer ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-900'
                : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Check Warranty</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onQuickOrderCheck) {
                onQuickOrderCheck('ORD-1001');
              } else {
                setInputText('Check order ORD-1001');
                setIsExpanded(true);
              }
            }}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition shadow-2xs cursor-pointer ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-900'
                : 'bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-amber-600" />
            <span>Check Order ORD-1001</span>
          </button>
        </div>
      )}

      {/* Attachment Zoom Modal */}
      {previewModalUrl && (
        <div 
          onClick={() => setPreviewModalUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[85vh] bg-white border border-slate-200/90 rounded-2xl p-4 overflow-hidden flex flex-col items-center shadow-2xl"
          >
            <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-800 truncate">{previewModalName}</span>
              <button
                onClick={() => setPreviewModalUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewModalUrl}
              alt="Attachment Preview"
              className="max-h-[70vh] max-w-full object-contain rounded-lg border border-slate-200"
            />
          </div>
        </div>
      )}

    </div>
  );
};
