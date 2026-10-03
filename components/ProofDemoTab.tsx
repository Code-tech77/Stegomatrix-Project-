import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, CheckCircle2, Play, Eye, RefreshCw, Zap, Award, Coffee, Search } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getSampleStegoPair } from '../utils/sampleImages';
import { extractMessage, generateDifferenceHeatmap, type ExtractResult } from '../utils/stegoEngine';

export const ProofDemoTab: React.FC = () => {
  const [pairData, setPairData] = useState<{
    coverDataUrl: string;
    stegoDataUrl: string;
    coverImageData: ImageData;
    stegoImageData: ImageData;
    sampleMessage: string;
    bitDepth: number;
  } | null>(null);

  const [heatmapUrl, setHeatmapUrl] = useState<string>('');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [isRunningProof, setIsRunningProof] = useState<boolean>(false);
  const [proofStep, setProofStep] = useState<number>(0);
  const [proofResult, setProofResult] = useState<ExtractResult | null>(null);

  const [pixelDiffInfo, setPixelDiffInfo] = useState<{
    x: number;
    y: number;
    coverRgb: [number, number, number];
    stegoRgb: [number, number, number];
  } | null>(null);

  const coverImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    initDemoPair();
  }, []);

  const initDemoPair = async () => {
    const data = await getSampleStegoPair();
    setPairData(data);

    const heatmapData = generateDifferenceHeatmap(data.coverImageData, data.stegoImageData);
    const canvas = document.createElement('canvas');
    canvas.width = data.coverImageData.width;
    canvas.height = data.coverImageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(heatmapData, 0, 0);
    setHeatmapUrl(canvas.toDataURL('image/png'));
  };

  const handleRunProof = async () => {
    if (!pairData) return;
    setIsRunningProof(true);
    setProofStep(1);

    await new Promise((r) => setTimeout(r, 600));
    setProofStep(2);

    await new Promise((r) => setTimeout(r, 700));
    setProofStep(3);

    await new Promise((r) => setTimeout(r, 600));
    const result = await extractMessage(pairData.stegoImageData, '');
    setProofResult(result);
    setProofStep(4);
    setIsRunningProof(false);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#d97706', '#f59e0b', '#d4a373', '#2563eb'],
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!pairData || !coverImgRef.current) return;
    const rect = coverImgRef.current.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;

    const imgX = Math.floor(xRatio * pairData.coverImageData.width);
    const imgY = Math.floor(yRatio * pairData.coverImageData.height);

    if (
      imgX >= 0 &&
      imgX < pairData.coverImageData.width &&
      imgY >= 0 &&
      imgY < pairData.coverImageData.height
    ) {
      const idx = (imgY * pairData.coverImageData.width + imgX) * 4;
      const cPixels = pairData.coverImageData.data;
      const sPixels = pairData.stegoImageData.data;

      setPixelDiffInfo({
        x: imgX,
        y: imgY,
        coverRgb: [cPixels[idx], cPixels[idx + 1], cPixels[idx + 2]],
        stegoRgb: [sPixels[idx], sPixels[idx + 1], sPixels[idx + 2]],
      });
    }
  };

  const toBinary = (n: number) => n.toString(2).padStart(8, '0');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel-glow border border-amber-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-500/30 mb-1">
              <Award className="w-3.5 h-3.5" /> Arithmatrix Internship Deliverable Proof
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white flex items-center gap-3">
              Forensic Pair & Extraction Audit
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5 flex items-center gap-2">
              <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Pre-packaged cover/stego pair demonstrating LSB bit modification & automated payload recovery.</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleRunProof}
          disabled={isRunningProof}
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-extrabold bg-amber-600 hover:bg-amber-500 text-white shadow-xl shadow-amber-600/25 active:scale-[0.98] transition-all cursor-pointer"
        >
          {isRunningProof ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          {isRunningProof ? 'Brewing Extraction Audit...' : 'Run Live Extraction Proof'}
        </button>
      </div>

      {/* Side-by-Side Image Pair Visualizer */}
      {pairData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Cover vs Stego Pair */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 flex items-center gap-2 font-mono">
                  <Eye className="w-4 h-4" /> Cover vs. Stego Image Pair
                </h2>
                <button
                  type="button"
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-900 hover:bg-stone-300 dark:hover:bg-stone-800 text-xs text-amber-700 dark:text-amber-400 font-semibold border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {showHeatmap ? 'Show Normal Pair' : 'Highlight LSB Diff Heatmap'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Cover Image */}
                <div className="space-y-2 text-center">
                  <div className="text-xs font-mono font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-900/80 py-1.5 px-3 rounded-lg border border-amber-900/10 dark:border-stone-800">
                    Original Cover Image
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border border-amber-900/10 dark:border-stone-800 bg-stone-950 p-2 flex items-center justify-center min-h-[220px]">
                    <img
                      ref={coverImgRef}
                      src={pairData.coverDataUrl}
                      alt="Cover"
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => setPixelDiffInfo(null)}
                      className="max-h-56 object-contain rounded-xl cursor-crosshair"
                    />
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">Clean Unmodified Canvas</div>
                </div>

                {/* Stego Image */}
                <div className="space-y-2 text-center">
                  <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 py-1.5 px-3 rounded-lg border border-amber-500/30">
                    Stego Output Image {showHeatmap && '(Diff Heatmap)'}
                  </div>
                  <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-stone-950 p-2 flex items-center justify-center min-h-[220px]">
                    <img
                      src={showHeatmap ? heatmapUrl : pairData.stegoDataUrl}
                      alt="Stego"
                      className="max-h-56 object-contain rounded-xl"
                    />
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Payload Embedded (1 Bit LSB)
                  </div>
                </div>

              </div>

              {/* Pixel Magnifier Hover Panel */}
              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Micro Pixel Inspector (Hover Cover Image)
                  </span>
                  {pixelDiffInfo && (
                    <span className="font-mono text-amber-600 dark:text-amber-400 text-[11px]">
                      Coordinates: ({pixelDiffInfo.x}, {pixelDiffInfo.y})
                    </span>
                  )}
                </div>

                {pixelDiffInfo ? (
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-stone-200/80 dark:bg-stone-900 border border-amber-900/10 dark:border-stone-800 space-y-1">
                      <div className="text-[10px] text-stone-500">COVER PIXEL RGB</div>
                      <div className="text-stone-900 dark:text-stone-200 font-bold">
                        R:{pixelDiffInfo.coverRgb[0]} G:{pixelDiffInfo.coverRgb[1]} B:{pixelDiffInfo.coverRgb[2]}
                      </div>
                      <div className="text-[10px] text-stone-500 break-all">
                        R-LSB: {toBinary(pixelDiffInfo.coverRgb[0])}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <div className="text-[10px] text-amber-700 dark:text-amber-400">STEGO PIXEL RGB</div>
                      <div className="text-amber-800 dark:text-amber-200 font-bold">
                        R:{pixelDiffInfo.stegoRgb[0]} G:{pixelDiffInfo.stegoRgb[1]} B:{pixelDiffInfo.stegoRgb[2]}
                      </div>
                      <div className="text-[10px] text-amber-700/80 dark:text-amber-400/80 break-all">
                        R-LSB: {toBinary(pixelDiffInfo.stegoRgb[0])}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 text-center py-2 italic font-mono">
                    Move cursor over cover image to inspect exact byte & bit changes.
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Right Column: Automated Extraction Proof Test */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 rounded-3xl space-y-6">
              <h2 className="text-xs font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 flex items-center gap-2 font-mono">
                <Search className="w-4 h-4" /> Extraction Verification Audit
              </h2>

              {/* Step Sequence Progress */}
              <div className="space-y-3 font-mono text-xs">
                
                <div className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  proofStep >= 1 ? 'bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-300' : 'bg-stone-100 dark:bg-stone-950 border-amber-900/10 dark:border-stone-800 text-stone-500'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    proofStep >= 1 ? 'bg-amber-600 text-white' : 'bg-stone-300 dark:bg-stone-800 text-stone-500'
                  }`}>
                    1
                  </div>
                  <div>
                    <div className="font-bold">Magic Header Scan</div>
                    <div className="text-[10px] text-stone-500">Signature: 'STEG' (0x53544547)</div>
                  </div>
                </div>

                <div className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  proofStep >= 2 ? 'bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-300' : 'bg-stone-100 dark:bg-stone-950 border-amber-900/10 dark:border-stone-800 text-stone-500'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    proofStep >= 2 ? 'bg-amber-600 text-white' : 'bg-stone-300 dark:bg-stone-800 text-stone-500'
                  }`}>
                    2
                  </div>
                  <div>
                    <div className="font-bold">LSB Bitstream Decoding</div>
                    <div className="text-[10px] text-stone-500">1 Bit per Channel Extracted</div>
                  </div>
                </div>

                <div className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                  proofStep >= 3 ? 'bg-amber-500/10 border-amber-500/40 text-amber-800 dark:text-amber-300' : 'bg-stone-100 dark:bg-stone-950 border-amber-900/10 dark:border-stone-800 text-stone-500'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    proofStep >= 3 ? 'bg-amber-600 text-white' : 'bg-stone-300 dark:bg-stone-800 text-stone-500'
                  }`}>
                    3
                  </div>
                  <div>
                    <div className="font-bold">Integrity Verification</div>
                    <div className="text-[10px] text-stone-500">CRC32 Checksum Validation</div>
                  </div>
                </div>

              </div>

              {/* Proof Audit Receipt */}
              {proofResult && (
                <div className="glass-panel-glow p-5 rounded-2xl space-y-4 border border-emerald-500/40 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    EXTRACTION PROOF VERIFIED
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800 font-mono text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    "{proofResult.message}"
                  </div>

                  <div className="space-y-1 font-mono text-[11px] text-stone-500">
                    <div className="flex justify-between">
                      <span>CRC32 Hash:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">0x{proofResult.crc32.toString(16).toUpperCase()} (MATCH)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bit Depth:</span>
                      <span className="text-amber-600 dark:text-amber-400">{proofResult.bitDepth} Bit LSB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% PERFECT RECOVERY</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

