/**
 * ReceiptPreview component
 * Renders the receipt image with visual hash info and dimension details
 */
export default function ReceiptPreview({ src, imageHash, dimensions, alt = 'Receipt snapshot' }) {
  if (!src) {
    return (
      <div className="card p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center h-80 bg-gray-50/50">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 mb-2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <p className="text-sm font-medium text-gray-500">No image snapshot attached</p>
        <p className="text-xs text-muted mt-1">Manual entry mode or image was skipped</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden border border-gray-200 flex flex-col">
      <div className="bg-gray-100 px-3 py-2 border-b border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <span className="font-medium flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
          </svg>
          Snapshot Preview
        </span>
        {dimensions && (
          <span className="text-[11px] text-muted">
            {dimensions.width}×{dimensions.height}px
          </span>
        )}
      </div>

      <div className="relative bg-gray-900/5 flex items-center justify-center p-3 max-h-[500px] overflow-auto">
        <img
          src={src}
          alt={alt}
          className="max-h-[460px] w-auto max-w-full rounded shadow-sm object-contain bg-white"
        />
      </div>

      {imageHash && (
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[11px] text-muted">
          <span>Perceptual aHash:</span>
          <code className="bg-gray-200/70 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-700">
            {imageHash.substring(0, 16)}…
          </code>
        </div>
      )}
    </div>
  );
}
