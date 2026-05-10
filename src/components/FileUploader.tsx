import React, { useState, useRef } from 'react';
import { Upload, File, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useToast } from './Toast';

interface FileUploaderProps {
  onUploadSuccess?: (url: string, name: string) => void;
  className?: string;
}

export default function FileUploader({ onUploadSuccess, className }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(10);

    try {
      // 1. Get presigned URL from our API
      const response = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type
        })
      });

      if (!response.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, fileUrl, simulated } = await response.json();

      setProgress(30);

      if (simulated) {
        // Just simulate a timer
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProgress(100);
        showToast("Simulation: File uploaded logically (AWS keys missing).", "info");
      } else {
        // 2. Upload directly to S3
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type }
        });

        if (!uploadResponse.ok) throw new Error('Failed to upload to S3');
        setProgress(100);
      }

      onUploadSuccess?.(fileUrl, file.name);
      showToast("Mission intelligence successfully archived.", "success");
      setFile(null);
    } catch (error: any) {
      console.error('Upload failure:', error);
      showToast(`Archive failure: ${error.message}`, "error");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className={cn("glass-card p-6 border-dashed border-2 border-white/10 relative group transition-all hover:border-sky-500/30", className)}>
      <input 
        type="file" 
        className="hidden" 
        onChange={handleFileSelect} 
        ref={fileInputRef}
      />
      
      {!file ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-4 py-8 cursor-pointer"
        >
          <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
            <Upload size={32} />
          </div>
          <div className="text-center">
            <p className="font-bold text-white uppercase tracking-tighter">Initialize Link</p>
            <p className="text-xs text-slate-500 font-mono mt-1">Select or drag mission document</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center text-sky-400">
              <File size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate text-sm">{file.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="p-2 hover:bg-white/10 rounded-lg text-slate-500 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative">
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-sky-400" size={24} />
                  <p className="text-[10px] font-mono text-sky-400 uppercase animate-pulse">Archiving...</p>
                </div>
              </div>
            )}
            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full py-4 bg-sky-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-sky-600 transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? "Transmitting..." : "Execute Archive"}
              {!isUploading && <Check size={18} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
