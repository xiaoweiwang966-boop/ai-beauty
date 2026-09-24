import { useState, useCallback } from 'react';
import {
  Scan,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  Fingerprint,
  BarChart3,
  Star,
  Sparkles,
} from 'lucide-react';
import RadarScan from '@/components/RadarScan';
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

const FEATURES = [
  {
    icon: Fingerprint,
    title: '智能识别',
    subtitle: '128个面部关键点',
    description: 'AI精准定位面部128个关键点，构建完整面部拓扑结构',
    gradient: 'from-sky-500 to-blue-600',
    glow: 'rgba(14,165,233,0.25)',
  },
  {
    icon: BarChart3,
    title: '多维评分',
    subtitle: '8项维度',
    description: '从面部比例、对称性、皮肤状态等8个维度综合评分',
    gradient: 'from-teal-500 to-emerald-600',
    glow: 'rgba(20,184,166,0.25)',
  },
  {
    icon: Star,
    title: '明星撞脸',
    subtitle: '相似度匹配',
    description: '将你的面部特征与明星数据库比对，找到最相似的明星',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.25)',
  },
];

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
      const detection = await detectFace(imageElement);

      if (!detection) {
        setState('error');
        setErrorMsg('未检测到面部，请上传一张清晰的正脸照片');
        return;
      }

      const ratioResult = computeRatios(detection.landmarks);
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
      const recommendations = getRecommendations(shapeResult.shape, skin);

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
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'radial-gradient(ellipse at top, #0d1525 0%, #0a0f1e 50%, #080c18 100%)' }}>
      {/* Background decorative orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -right-20 w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.06) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)' }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0a0f1e]/80 border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Scan className="w-5 h-5 text-white" />
              <div className="absolute -inset-0.5 rounded-xl border border-sky-400/30" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 tracking-wide">FaceAI</h1>
              <p className="text-[10px] text-slate-500 hidden sm:block tracking-widest uppercase">
                AI Face Analysis
              </p>
            </div>
          </div>
          {(imageUrl || result) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-sm transition-all hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              重新扫描
            </button>
          )}
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* ===== Homepage / Idle state ===== */}
        {!result && state !== 'loading' && (
          <div className="flex flex-col items-center">
            {/* Hero section */}
            <div className="flex flex-col items-center text-center pt-6 sm:pt-10 pb-8 animate-fadeIn">
              {/* Radar scan animation */}
              <div className="relative mb-6 float-y">
                <RadarScan size={200} />
                {/* Face icon overlay in center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500/20 to-teal-500/20 backdrop-blur-sm flex items-center justify-center border border-sky-400/20">
                    <Sparkles className="w-6 h-6 text-sky-300/60" />
                  </div>
                </div>
              </div>

              {/* Logo + Title */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                  <Scan className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-300 tracking-wide">FaceAI</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                <span className="gradient-text">AI 颜值测试</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-md leading-relaxed">
                上传一张正脸照片，AI将检测面部关键点，从8个维度分析你的面部特征，
                并给出专业建议
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mb-8 px-0">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl p-5 animate-fadeInUp"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-3 relative`}
                      style={{ boxShadow: `0 4px 20px ${f.glow}` }}
                    >
                      <f.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mb-0.5">{f.title}</h3>
                    <p className="text-xs text-sky-400/80 font-medium mb-2">{f.subtitle}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload area */}
            <div className="w-full max-w-2xl animate-fadeInUp" style={{ animationDelay: '400ms' }}>
              <ScanUpload onImageSelected={handleImageSelected} disabled={state === 'loading'} />

              {imageUrl && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleScan}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-medium text-lg transition-all hover:scale-105 hover:shadow-xl hover:shadow-sky-500/30"
                  >
                    <Scan className="w-5 h-5" />
                    开始AI分析
                  </button>
                </div>
              )}

              {state === 'error' && (
                <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 animate-fadeInUp">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{errorMsg}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== Loading state ===== */}
        {state === 'loading' && (
          <div className="max-w-2xl mx-auto pt-8 flex flex-col items-center gap-6">
            <div className="relative">
              <RadarScan size={160} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-100">AI分析中...</h3>
              <p className="text-sm text-slate-400 mt-1">正在检测面部关键点并计算比例</p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              {['加载AI模型', '检测面部关键点', '计算黄金比例', '分析皮肤状况', '生成推荐'].map(
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

        {/* ===== Results ===== */}
        {result && state === 'done' && (
          <div className="space-y-6 animate-fadeInUp">
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
