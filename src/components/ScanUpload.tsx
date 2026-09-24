import { useRef, useState, useCallback } from 'react';
import { Camera, Upload, Image as ImageIcon, X } from 'lucide-react';

type Props = {
  onImageSelected: (imageUrl: string, imageElement: HTMLImageElement) => void;
  disabled?: boolean;
};

export default function ScanUpload({ onImageSelected, disabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setPreview(url);
        onImageSelected(url, img);
      };
      img.src = url;
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      {!preview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ${
            dragOver
              ? 'border-sky-400 bg-sky-500/10 scale-[1.02]'
              : 'border-slate-600 bg-slate-800/40 hover:border-sky-500 hover:bg-slate-800/60'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-sky-500/20 pulse-ring" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                <Camera className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-100">面部扫描分析</h3>
              <p className="text-sm text-slate-400 mt-1">
                上传一张清晰的正脸照片，AI将检测468个面部关键点
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={() => cameraRef.current?.click()}
                disabled={disabled}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-4 h-4" />
                拍照
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={disabled}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-all hover:scale-105 disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                上传照片
              </button>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden bg-slate-800/60 border border-slate-700">
          <img
            src={preview}
            alt="预览"
            className="w-full max-h-[400px] object-contain"
          />
          <button
            onClick={() => {
              setPreview(null);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="p-3 bg-slate-800/80 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <ImageIcon className="w-3 h-3" />
              照片已加载，点击下方按钮开始分析
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
