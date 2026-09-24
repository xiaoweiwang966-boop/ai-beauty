import { useState, useCallback, useEffect } from 'react';
import {
  Scan,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Fingerprint,
  BarChart3,
  Star,
  Sparkles,
  ChevronRight,
  Trash2,
  History,
  Info,
  Share2,
  Settings,
  HelpCircle,
  Camera,
} from 'lucide-react';
import WeChatShell, { type TabKey } from '@/components/WeChatShell';
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
import { saveScanHistory, fetchScanHistory, deleteScanHistory, type ScanHistoryItem } from '@/lib/scanHistory';
import type { ScanResult, AppState, FaceShape } from '@/types';
import { FACE_SHAPE_LABELS } from '@/types';

const FEATURES = [
  {
    icon: Fingerprint,
    title: '智能识别',
    subtitle: '128个面部关键点',
    gradient: 'from-sky-500 to-blue-600',
    glow: 'rgba(14,165,233,0.25)',
  },
  {
    icon: BarChart3,
    title: '多维评分',
    subtitle: '8项维度',
    gradient: 'from-teal-500 to-emerald-600',
    glow: 'rgba(20,184,166,0.25)',
  },
  {
    icon: Star,
    title: '明星撞脸',
    subtitle: '相似度匹配',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.25)',
  },
];

export default function App() {
  const [tab, setTab] = useState<TabKey>('home');
  const [state, setState] = useState<AppState>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [showMesh, setShowMesh] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  useEffect(() => {
    if (tab === 'report') {
      fetchScanHistory().then(setHistory);
    }
  }, [tab]);

  const handleImageSelected = useCallback(
    (url: string, img: HTMLImageElement) => {
      if (!url) {
        setImageUrl(null);
        setImageElement(null);
        setResult(null);
        setState('idle');
        return;
      }
      setImageUrl(url);
      setImageElement(img);
      setResult(null);
      setState('idle');
    },
    []
  );

  const handleScan = useCallback(async (
    selectedImageElement: HTMLImageElement | null = imageElement,
    selectedImageUrl: string | null = imageUrl
  ) => {
    if (!selectedImageElement) return;

    setState('loading');
    setErrorMsg('');

    try {
      const detection = await detectFace(selectedImageElement);
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
      const w = selectedImageElement.naturalWidth;
      const h = selectedImageElement.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas context not available');
      ctx.drawImage(selectedImageElement, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);

      const skin = analyzeSkin(imageData, detection.landmarks, w, h);
      const recommendations = getRecommendations(shapeResult.shape, skin);

      const scanResult: ScanResult = {
        analysis,
        skin,
        recommendations,
        imageUrl: selectedImageUrl ?? '',
      };
      setResult(scanResult);
      setState('done');

      // Save to history
      saveScanHistory({
        image_url: selectedImageUrl ?? '',
        overall_score: analysis.overallScore,
        skin_score: skin.overallScore,
        face_shape: shapeResult.shape,
        face_shape_label: FACE_SHAPE_LABELS[shapeResult.shape as FaceShape],
        summary: `颜值评分 ${analysis.overallScore} · 脸型${FACE_SHAPE_LABELS[shapeResult.shape as FaceShape]} · 皮肤${skin.overallScore}分`,
      });
    } catch (err) {
      setState('error');
      setErrorMsg(
        err instanceof Error ? err.message : '分析过程中出现错误，请重试'
      );
    }
  }, [imageElement, imageUrl]);

  const handleCameraImageSelected = useCallback(
    (url: string, img: HTMLImageElement) => {
      handleImageSelected(url, img);
      void handleScan(img, url);
    },
    [handleImageSelected, handleScan]
  );

  const handleReset = useCallback(() => {
    setImageUrl(null);
    setImageElement(null);
    setResult(null);
    setState('idle');
    setErrorMsg('');
  }, []);

  const handleDeleteHistory = useCallback(async (id: string) => {
    await deleteScanHistory(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const navTitle =
    tab === 'home'
      ? result && state === 'done'
        ? '分析报告'
        : 'AI 颜值测试'
      : tab === 'report'
      ? '历史报告'
      : '我的';

  return (
    <WeChatShell
      activeTab={tab}
      onTabChange={(t) => {
        setTab(t);
        if (t === 'home' && !result) {
          handleReset();
        }
      }}
      navTitle={navTitle}
      showBack={!!(result && state === 'done' && tab === 'home')}
      onBack={handleReset}
    >
      {/* ===== HOME TAB ===== */}
      {tab === 'home' && (
        <div key="home" className="animate-slideIn px-4 pb-6 pt-2">
          {/* Loading state */}
          {state === 'loading' && (
            <div className="flex flex-col items-center gap-5 py-16">
              <RadarScan size={140} />
              <div className="text-center">
                <h3 className="text-base font-medium text-slate-100">AI分析中...</h3>
                <p className="text-xs text-slate-400 mt-1">正在检测面部关键点</p>
              </div>
              <div className="w-full max-w-[240px] space-y-1.5">
                {['加载AI模型', '检测面部关键点', '计算黄金比例', '分析皮肤状况', '生成推荐'].map(
                  (step, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-slate-400 animate-fadeInUp"
                      style={{ animationDelay: `${i * 300}ms` }}
                    >
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      {step}
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Error state */}
          {state === 'error' && (
            <div className="py-16 flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-sm text-red-300 text-center px-8">{errorMsg}</p>
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm transition-colors"
              >
                重新上传
              </button>
            </div>
          )}

          {/* Result state */}
          {result && state === 'done' && (
            <div className="space-y-3 pt-2">
              {/* Score summary banner */}
              <div className="wx-card p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">综合颜值评分</div>
                  <div className="text-3xl font-black gradient-text">
                    {result.analysis.overallScore}
                    <span className="text-sm text-slate-500 font-normal">/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 mb-0.5">皮肤评分</div>
                  <div className="text-xl font-bold text-teal-400">
                    {result.skin.overallScore}
                    <span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                </div>
              </div>

              {/* Landmark image */}
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-sm font-medium text-slate-200">面部关键点</h3>
                  <button
                    onClick={() => setShowMesh(!showMesh)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 text-[11px] transition-colors active:scale-95"
                  >
                    {showMesh ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showMesh ? '隐藏' : '显示'}网格
                  </button>
                </div>
                <LandmarkCanvas
                  imageUrl={result.imageUrl}
                  landmarks={result.analysis.landmarks}
                  showMesh={showMesh}
                />
                <p className="text-[10px] text-slate-500 mt-1.5 text-center">
                  已检测 {result.analysis.landmarks.length} 个面部关键点
                </p>
              </div>

              <FaceShapeCard
                shape={result.analysis.faceShape}
                description={result.analysis.faceShapeDescription}
                analysis={result.analysis}
              />

              <RatioMetrics
                metrics={result.analysis.metrics}
                overallScore={result.analysis.overallScore}
              />

              <SkinAnalysisCard skin={result.skin} />

              <RecommendationsCard recommendations={result.recommendations} />

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  再测一次
                </button>
                <button
                  onClick={() => setTab('report')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <History className="w-4 h-4" />
                  历史记录
                </button>
              </div>

              <p className="text-center text-[10px] text-slate-600 py-2">
                分析基于MediaPipe Face Mesh，结果仅供参考
              </p>
            </div>
          )}

          {/* Idle / Upload state */}
          {!result && state !== 'loading' && state !== 'error' && (
            <div className="pt-2">
              {/* Hero */}
              <div className="flex flex-col items-center text-center pt-4 pb-5 animate-fadeIn">
                <div className="relative mb-4 float-y">
                  <RadarScan size={160} />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500/20 to-teal-500/20 backdrop-blur-sm flex items-center justify-center border border-sky-400/20">
                      <Sparkles className="w-5 h-5 text-sky-300/60" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                    <Scan className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-base font-bold text-slate-300">FaceAI</span>
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-2">
                  <span className="gradient-text">AI 颜值测试</span>
                </h2>
                <p className="text-xs text-slate-400 max-w-[260px] leading-relaxed">
                  上传正脸照片，AI检测面部关键点，8维度分析面部特征
                </p>
              </div>

              {/* Feature cards — horizontal scroll mini-program style */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {FEATURES.map((f, i) => (
                  <div
                    key={i}
                    className="glass-card rounded-2xl p-2.5 sm:p-4 animate-fadeInUp min-w-0"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-2`}
                        style={{ boxShadow: `0 4px 16px ${f.glow}` }}
                      >
                        <f.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-100">{f.title}</h3>
                      <p className="text-[10px] text-sky-400/80 font-medium mt-0.5">{f.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload */}
              <div className="animate-fadeInUp" style={{ animationDelay: '300ms' }}>
                <ScanUpload
                  onImageSelected={handleImageSelected}
                  onCameraImageSelected={handleCameraImageSelected}
                  imageUrl={imageUrl}
                  disabled={state === 'loading'}
                />

                {imageUrl && (
                  <div className="mt-4">
                    <button
                      onClick={handleScan}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 text-white font-medium text-base transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-sky-500/30 flex items-center justify-center gap-2"
                    >
                      <Scan className="w-5 h-5" />
                      开始AI分析
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== REPORT TAB ===== */}
      {tab === 'report' && (
        <div key="report" className="animate-slideIn px-4 pb-6 pt-2">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center">
                <History className="w-8 h-8 text-slate-600" />
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-1">暂无历史记录</p>
                <p className="text-xs text-slate-600">完成首次扫描后这里会显示记录</p>
              </div>
              <button
                onClick={() => setTab('home')}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm transition-colors"
              >
                去扫描
              </button>
            </div>
          ) : (
            <>
              <div className="text-xs text-slate-500 mb-3 px-1">
                共 {history.length} 条记录
              </div>
              <div className="space-y-2.5">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="wx-card p-3.5 flex items-center gap-3 wx-card-tap"
                  >
                    {/* Score circle */}
                    <div className="relative w-14 h-14 rounded-full bg-slate-900/60 flex items-center justify-center shrink-0">
                      <div
                        className="absolute inset-0 rounded-full border-2"
                        style={{
                          borderColor:
                            item.overall_score >= 80
                              ? '#22c55e'
                              : item.overall_score >= 60
                              ? '#f59e0b'
                              : '#ef4444',
                        }}
                      />
                      <div className="text-center">
                        <div className="text-base font-bold text-slate-100">
                          {item.overall_score}
                        </div>
                        <div className="text-[8px] text-slate-500">评分</div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs font-medium text-slate-200">
                          {item.face_shape_label}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          皮肤 {item.skin_score}分
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.summary}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {new Date(item.created_at).toLocaleString('zh-CN', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteHistory(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== PROFILE TAB ===== */}
      {tab === 'profile' && (
        <div key="profile" className="animate-slideIn px-4 pb-6 pt-2">
          {/* User header */}
          <div className="wx-card p-5 mb-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">FaceAI 用户</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                共 {history.length} 次扫描记录
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="wx-card p-3 text-center">
              <div className="text-xl font-bold text-sky-400">
                {history.length > 0
                  ? Math.round(
                      history.reduce((s, h) => s + h.overall_score, 0) / history.length
                    )
                  : '--'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">平均颜值</div>
            </div>
            <div className="wx-card p-3 text-center">
              <div className="text-xl font-bold text-teal-400">
                {history.length > 0
                  ? Math.max(...history.map((h) => h.overall_score))
                  : '--'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">最高评分</div>
            </div>
            <div className="wx-card p-3 text-center">
              <div className="text-xl font-bold text-amber-400">
                {history.length > 0
                  ? Math.round(
                      history.reduce((s, h) => s + h.skin_score, 0) / history.length
                    )
                  : '--'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">平均肤质</div>
            </div>
          </div>

          {/* Menu list — WeChat style */}
          <div className="wx-card overflow-hidden mb-4">
            {[
              { icon: History, label: '扫描历史', color: 'text-sky-400' },
              { icon: Share2, label: '分享给好友', color: 'text-teal-400' },
              { icon: Info, label: '关于FaceAI', color: 'text-amber-400' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  if (item.label === '扫描历史') setTab('report');
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-700/30 last:border-0 hover:bg-slate-700/20 transition-colors active:scale-[0.99] text-left"
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="flex-1 text-sm text-slate-200">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            ))}
          </div>

          <div className="wx-card overflow-hidden mb-4">
            {[
              { icon: Settings, label: '设置', color: 'text-slate-400' },
              { icon: HelpCircle, label: '帮助与反馈', color: 'text-slate-400' },
            ].map((item, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-700/30 last:border-0 hover:bg-slate-700/20 transition-colors active:scale-[0.99] text-left"
              >
                <item.icon className="w-5 h-5 text-slate-400" />
                <span className="flex-1 text-sm text-slate-200">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            ))}
          </div>

          <p className="text-center text-[10px] text-slate-600 py-3">
            FaceAI v1.0 · 基于 MediaPipe Face Mesh
          </p>
        </div>
      )}
    </WeChatShell>
  );
}
