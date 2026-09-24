import { useRef, useCallback } from 'react';
import { Camera, ImagePlus, X } from 'lucide-react';

type Props = {
  onImageSelected: (imageUrl: string, imageElement: HTMLImageElement) => void;
  onCameraImageSelected?: (imageUrl: string, imageElement: HTMLImageElement) => void;
  imageUrl: string | null;
  disabled?: boolean;
};

export default function ScanUpload({ onImageSelected, onCameraImageSelected, imageUrl, disabled }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        onImageSelected(url, img);
        if (onCameraImageSelected) onCameraImageSelected(url, img);
      };
      img.src = url;
    },
    [onCameraImageSelected, onImageSelected]
  );

  if (imageUrl) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-slate-800/60 border border-slate-700/50">
        <img
          src={imageUrl}
          alt="预览"
          className="w-full max-h-[280px] object-contain"
        />
        <button
          onClick={() => onImageSelected('', new Image())}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 transition-colors hover:bg-black/80"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-2xl border-2 border-dashed border-sky-500/30 bg-sky-500/[0.04] p-6 text-center">
        <div className="relative inline-block mb-3">
          <div className="absolute inset-0 rounded-2xl bg-sky-500/20 pulse-ring" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>
        <p className="text-sm text-slate-300 mb-1">上传正脸照片开始分析</p>
        <p className="text-xs text-slate-500 mb-4">支持拍照或从相册选择</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => cameraRef.current?.click()}
            disabled={disabled}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            拍照
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={disabled}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-white text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            <ImagePlus className="w-4 h-4" />
            相册
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
  );
}
