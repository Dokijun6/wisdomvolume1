import { useState, useEffect, useRef } from 'react';
import { Shield, Eye, EyeOff, LockIcon } from 'lucide-react';

// Import your PDF directly - you'll need to add this file to your project
// This assumes you have a PDF file in the public folder named "document.pdf"
const pdfUrl = "/document.pdf";

export default function SecurePDFViewer() {
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [showControls, setShowControls] = useState(false); // Hide controls by default
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [message, setMessage] = useState('');
  const pdfContainerRef = useRef(null);

  // Anti-screenshot and save protection
  useEffect(() => {
    const preventContextMenu = (e) => e.preventDefault();
    const preventSave = (e) => {
      if ((e.key === 's' || e.key === 'S') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setMessage('Saving is disabled for security reasons');
        setTimeout(() => setMessage(''), 3000);
      }
      
      // Prevent print screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        setMessage('Screenshots are disabled for security reasons');
        setTimeout(() => setMessage(''), 3000);
      }
    };

    // Disable right-clicking
    document.addEventListener('contextmenu', preventContextMenu);
    // Disable keyboard shortcuts
    document.addEventListener('keydown', preventSave);
    
    // Clean up
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventSave);
    };
  }, []);

  // Watch for fullscreen changes
  useEffect(() => {
    const fullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', fullscreenChange);
    return () => document.removeEventListener('fullscreenchange', fullscreenChange);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      pdfContainerRef.current.requestFullscreen().catch(err => {
        setMessage(`Error attempting to enable fullscreen: ${err.message}`);
        setTimeout(() => setMessage(''), 3000);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Shield size={24} />
          <h1 className="text-xl font-bold">Secure Document Viewer</h1>
        </div>
        <div className="flex space-x-2">
          {/* Admin mode toggle - hidden in production */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center bg-blue-700 hover:bg-blue-800 p-2 rounded"
            >
              {showControls ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="ml-1">{showControls ? "Hide Controls" : "Admin Mode"}</span>
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="flex items-center bg-blue-700 hover:bg-blue-800 p-2 rounded"
          >
            <span>{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Admin Controls - only visible in development mode or when explicitly enabled */}
        {showControls && (
          <div className="bg-white p-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Watermark Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-end">
                <p className="text-sm text-gray-500">
                  Admin controls visible in development mode only
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PDF Container */}
        <div 
          ref={pdfContainerRef}
          className="flex-1 relative bg-gray-800 overflow-auto"
          style={{ 
            userSelect: 'none' // Prevent text selection
          }}
        >
          <div className="relative w-full h-full">
            <iframe
 
             src={pdfData}

              title="Secure PDF Document Viewer"

              className="w-full h-full"

              style={{ 
    
                pointerEvents: 'none' // Disable user interaction with PDF content
 
              }}

            />
            {/* Watermark layer */}
            <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
              <div className="text-6xl font-bold text-red-500 opacity-20 transform rotate-45">
                {watermarkText}
              </div>
            </div>
            {/* Anti-screenshot layer */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Ctext x=\'50%25\' y=\'50%25\' font-size=\'12\' text-anchor=\'middle\' dy=\'.3em\' fill=\'rgba(150,150,150,0.05)\'%3E" + watermarkText + "%3C/text%3E%3C/svg%3E")',
              }}
            ></div>
            {/* Security overlay */}
            <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-70 text-white px-3 py-2 rounded-full flex items-center text-sm">
              <LockIcon size={14} className="mr-1" />
              <span>Protected Document</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg">
          {message}
        </div>
      )}
    </div>
  );
}