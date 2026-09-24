import { useState, useCallback } from 'react';
import { Scan, AlertCircle, Eye, EyeOff, RefreshCw, Loader2 } from 'lucide-react';
import ScanUpload from '@/components/ScanUpload';
import LandmarkCanvas from '@/components/LandmarkCanvas';
import RatioMetrics from '@/components/RatioMetrics';
import FaceShapeCard from '@/components/FaceShapeCard';
import SkinAnalysisCard from '@/components/SkinAnalysisCard';
import RecommendationsCard from '@/components/RecommendationsCard';
import { detectFace } from '@/lib/faceDetection';
import { computeRatios } from '@/lib/goldenRatio';
import { classifyFaceShape } from '@/lib/faceShape';
import { analyzeSkin } from '@/lib/skinAnalysis';
import { getRecommendations } from '@/lib/recommendations';
import type { ScanResult, AppState } from '@/types';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [showMesh, setShowMesh] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleImageSelected = useCallback(
    (url: string, img: HTMLImageElement) => {
      setImageUrl(url);
      setImageElement(img);
      setResult(null);
      setState('idle');
    },
    []
  );

  const handleScan = useCallback(async () => {
    if (!imageElement) return;

    setState('loading');
    setErrorMsg('');

    try {
      // Step 1: Detect face landmarks
      const detection = await detectFace(imageElement);

      if (!detection) {
        setState('error');
        setErrorMsg('未检测到面部，请上传一张清晰的正脸照片');
        return;
      }

      // Step 2: Compute golden ratio metrics
      const ratioResult = computeRatios(detection.landmarks);

      // Step 3: Classify face shape
      const shapeResult = classifyFaceShape(detection.landmarks);

      const analysis = {
        landmarks: detection.landmarks,
        metrics: ratioResult.metrics,
        overallScore: ratioResult.overallScore,
        faceShape: shapeResult.shape,
        faceShapeDescription: shapeResult.description,
        faceWidth: ratioResult.faceWidth,
        faceLength: ratioResult.faceLength,
        eyeDistance: ratioResult.eyeDistance,
        jawWidth: ratioResult.jawWidth,
        foreheadHeight: ratioResult.foreheadHeight,
      };

      // Step 4: Skin analysis — draw image to canvas to get pixel data
      const canvas = document.createElement('canvas');
      const w = imageElement.naturalWidth;
      const h = imageElement.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas context not available');
      ctx.drawImage(imageElement, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);

      const skin = analyzeSkin(imageData, detection.landmarks, w, h);

      // Step 5: Generate recommendations
      const recommendations = getRecommendations(shapeResult.shape, skin);

      // Step 6: Store result
      setResult({
        analysis,
        skin,
        recommendations,
        imageUrl: imageUrl ?? '',
      });
      setState('done');
    } catch (err) {
      setState('error');
      setErrorMsg(
        err instanceof Error ? err.message : '分析过程中出现错误，请重试'
      );
    }
  }, [imageElement, imageUrl]);

  const handleReset = useCallback(() => {
    setImageUrl(null);
    setImageElement(null);
    setResult(null);
    setState('idle');
    setErrorMsg('');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-slate-950/70 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
              <Scan className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">面部扫描分析</h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                AI驱动 · 468关键点 · 黄金比例 · 皮肤检测
              </p>
            </div>
          </div>
          {(imageUrl || result) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              重新扫描
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Idle / Upload state */}
        {!result && state !== 'loading' && (
          <div className="max-w-2xl mx-auto pt-4 sm:pt-8">
            <ScanUpload onImageSelected={handleImageSelected} disabled={state === 'loading'} />

          {imageUrl && state !== 'loading' && (
            <div className="mt-6 text-center">
              <button
                onClick={handleScan}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-medium text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-sky-500/30"
              >
                <Scan className="w-5 h-5" />
                开始AI分析
              </button>
            </div>
          )}

          {state === 'error' && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 animate-fadeInUp">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-300">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Feature highlights */}
          {!imageUrl && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: '🎯', title: '468个关键点', desc: 'MediaPipe Face Mesh 精准定位' },
                { icon: '📐', title: '黄金比例', desc: '8项面部比例与1.618对比分析' },
                { icon: '✨', title: '皮肤检测', desc: '像素级肤色、色斑、毛孔分析' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 text-center hover:border-slate-600 transition-colors"
                >
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <h4 className="text-sm font-medium text-slate-200">{f.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          )}
          </div>
        )}

        {/* Loading state */}
        {state === 'loading' && (
          <div className="max-w-2xl mx-auto pt-8 flex flex-col items-center gap-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-500 border-r-teal-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Scan className="w-8 h-8 text-sky-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-100">AI分析中...</h3>
              <p className="text-sm text-slate-400 mt-1">正在检测面部关键点并计算比例</p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              {['加载AI模型', '检测468个面部关键点', '计算黄金比例', '分析皮肤状况', '生成推荐'].map(
                (step, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-slate-400 animate-fadeInUp"
                    style={{ animationDelay: `${i * 300}ms` }}
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    {step}
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {result && state === 'done' && (
          <div className="space-y-6 animate-fadeInUp">
            {/* Image + Landmark overlay */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-slate-100">面部关键点检测</h3>
                  <button
                    onClick={() => setShowMesh(!showMesh)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    {showMesh ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showMesh ? '隐藏网格' : '显示网格'}
                  </button>
                </div>
                <LandmarkCanvas
                  imageUrl={result.imageUrl}
                  landmarks={result.analysis.landmarks}
                  showMesh={showMesh}
                />
                <p className="text-xs text-slate-500 mt-2 text-center">
                  已检测 {result.analysis.landmarks.length} 个面部关键点
                </p>
              </div>

              <div className="space-y-4">
                <FaceShapeCard
                  shape={result.analysis.faceShape}
                  description={result.analysis.faceShapeDescription}
                  analysis={result.analysis}
                />
                <RatioMetrics
                  metrics={result.analysis.metrics}
                  overallScore={result.analysis.overallScore}
                />
              </div>
            </div>

            {/* Skin + Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkinAnalysisCard skin={result.skin} />
              <RecommendationsCard recommendations={result.recommendations} />
            </div>

            <p className="text-center text-xs text-slate-600 py-4">
              本分析基于MediaPipe Face Mesh和图像处理算法，结果仅供参考。如有皮肤问题请咨询专业医生。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
