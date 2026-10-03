import React, { useState, useRef, useEffect } from 'react';
import { Upload, Lock, ShieldCheck, Download, AlertTriangle, Eye, Sparkles, Image as ImageIcon, Sliders, RefreshCw, FileText, FileUp, File, X, Coffee, Search } from 'lucide-react';
import { calculateCapacity, embedMessage, generateDifferenceHeatmap, type FilePayloadInfo } from '../utils/stegoEngine';
import { createSyntheticCoverImage } from '../utils/sampleImages';

interface EmbedTabProps {
  onGoToExtract?: () => void;
}

export const EmbedTab: React.FC<EmbedTabProps> = ({ onGoToExtract }) => {
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [coverImageData, setCoverImageData] = useState<ImageData | null>(null);
  
  // Payload mode
  const [payloadType, setPayloadType] = useState<'text' | 'file'>('text');
  const [message, setMessage] = useState<string>('');
  const [secretFile, setSecretFile] = useState<FilePayloadInfo | null>(null);

  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [bitDepth, setBitDepth] = useState<number>(1);
  const [isJpegWarning, setIsJpegWarning] = useState<boolean>(false);

  // Embedding state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stegoResult, setStegoResult] = useState<{
    stegoDataUrl: string;
    stegoImageData: ImageData;
    heatmapDataUrl: string;
    usedBytes: number;
    capacityBytes: number;
    usagePercentage: number;
    crc32: number;
    payloadType: 'text' | 'file';
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showDiffHeatmap, setShowDiffHeatmap] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const secretFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize default synthetic sample image on load
  useEffect(() => {
    loadSampleCover();
  }, []);

  const loadSampleCover = () => {
    const { imageData, dataUrl } = createSyntheticCoverImage(450, 450);
    setCoverImageData(imageData);
    setImageDataUrl(dataUrl);
    setIsJpegWarning(false);
    setStegoResult(null);
    setErrorMsg('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    setIsJpegWarning(file.type === 'image/jpeg' || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg'));

    const reader = new FileReader();
    reader.onload = (evt) => {
      const src = evt.target?.result as string;
      setImageDataUrl(src);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, img.width, img.height);
        setCoverImageData(data);
        setStegoResult(null);
        setErrorMsg('');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleSecretFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const buffer = evt.target?.result as ArrayBuffer;
      setSecretFile({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        data: new Uint8Array(buffer),
      });
      setErrorMsg('');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Capacity calculations
  const maxCapacity = coverImageData
    ? calculateCapacity(coverImageData.width, coverImageData.height, bitDepth, password.trim().length > 0)
    : 0;

  let currentPayloadSize = 0;
  if (payloadType === 'text') {
    currentPayloadSize = new TextEncoder().encode(message).length;
  } else if (secretFile) {
    currentPayloadSize = 4 + new TextEncoder().encode(secretFile.name).length + new TextEncoder().encode(secretFile.mimeType).length + secretFile.data.length;
  }

  const capacityUsage = maxCapacity > 0 ? Math.min(100, (currentPayloadSize / maxCapacity) * 100) : 0;
  const isOverCapacity = currentPayloadSize > maxCapacity;

  const handleEmbed = async () => {
    if (!coverImageData) {
      setErrorMsg('Please select or load a cover image first.');
      return;
    }
    if (payloadType === 'text' && !message.trim()) {
      setErrorMsg('Please enter a secret message to embed.');
      return;
    }
    if (payloadType === 'file' && !secretFile) {
      setErrorMsg('Please select a secret file to embed.');
      return;
    }
    if (isOverCapacity) {
      setErrorMsg(`Payload exceeds image capacity! (${currentPayloadSize} B / ${maxCapacity} B max). Try increasing LSB bit depth.`);
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');

      const res = await embedMessage(coverImageData, {
        message: payloadType === 'text' ? message : undefined,
        file: payloadType === 'file' && secretFile ? secretFile : undefined,
        password: password.trim(),
        bitDepth,
      });

      // Generate Heatmap
      const diffData = generateDifferenceHeatmap(coverImageData, res.stegoImageData);
      const hCanvas = document.createElement('canvas');
      hCanvas.width = coverImageData.width;
      hCanvas.height = coverImageData.height;
      const hCtx = hCanvas.getContext('2d')!;
      hCtx.putImageData(diffData, 0, 0);
      const heatmapDataUrl = hCanvas.toDataURL('image/png');

      setStegoResult({
        stegoDataUrl: res.stegoDataUrl,
        stegoImageData: res.stegoImageData,
        heatmapDataUrl,
        usedBytes: res.usedBytes,
        capacityBytes: res.capacityBytes,
        usagePercentage: res.usagePercentage,
        crc32: res.crc32,
        payloadType: res.payloadType,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during embedding.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-amber-900/10 dark:border-stone-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white flex items-center gap-3">
              Steganography Data Embedding
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 flex items-center gap-2">
              <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Hide confidential messages or files inside pixel LSB matrix with optional AES-256 encryption.</span>
            </p>
          </div>
        </div>
        <button
          onClick={loadSampleCover}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold bg-stone-200/80 dark:bg-stone-900 hover:bg-stone-300 dark:hover:bg-stone-800 text-amber-700 dark:text-amber-400 border border-amber-900/10 dark:border-amber-500/30 transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Load Artisan Cover Image
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Cover Image & Settings */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* File Upload Box */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 flex items-center gap-2 font-mono">
                <ImageIcon className="w-4 h-4" /> 1. Select Cover Image
              </h2>
              {coverImageData && (
                <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                  {coverImageData.width} × {coverImageData.height} px
                </span>
              )}
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer border-2 border-dashed border-amber-500/30 hover:border-amber-500 rounded-2xl p-6 text-center transition-all bg-amber-50/50 dark:bg-stone-950/40 hover:bg-amber-100/50 dark:hover:bg-stone-900/60 overflow-hidden"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/webp, image/bmp, image/jpeg"
                onChange={handleFileChange}
                className="hidden"
              />

              {imageDataUrl ? (
                <div className="space-y-3">
                  <div className="relative mx-auto max-h-64 overflow-hidden rounded-xl border border-amber-900/10 dark:border-stone-800 shadow-2xl flex items-center justify-center bg-stone-950">
                    <img src={imageDataUrl} alt="Cover Preview" className="max-h-64 object-contain" />
                    <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3 py-1.5 rounded-xl bg-stone-900/90 text-xs text-amber-300 font-semibold border border-amber-500/40">
                        Click to change image
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                      Drag & Drop cover image, or <span className="text-amber-600 dark:text-amber-400 underline">Browse</span>
                    </p>
                    <p className="text-xs text-stone-500 mt-1 font-mono">PNG, WebP, BMP supported (Lossless recommended)</p>
                  </div>
                </div>
              )}
            </div>

            {/* JPEG Warning */}
            {isJpegWarning && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Lossy Format Notice (JPEG):</span> JPEG compression alters pixel values. Output will automatically be saved as <span className="font-bold underline">Lossless PNG</span> to preserve payload integrity!
                </div>
              </div>
            )}
          </div>

          {/* Steganography Parameters */}
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <h2 className="text-xs font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 flex items-center gap-2 font-mono">
              <Sliders className="w-4 h-4" /> 2. Configuration & Forensic Security
            </h2>

            {/* Bit Depth Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-stone-700 dark:text-stone-300">LSB Depth per RGB Channel</label>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{bitDepth} Bit{bitDepth > 1 ? 's' : ''} ({bitDepth * 3} bits/pixel)</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setBitDepth(d)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      bitDepth === d
                        ? 'bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500 shadow-md'
                        : 'bg-stone-100 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 border-amber-900/10 dark:border-stone-800 hover:border-amber-500/40'
                    }`}
                  >
                    {d} Bit{d > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-stone-500 font-mono">
                1 Bit = Highest stealth (visually imperceptible). 4 Bits = Maximum storage capacity.
              </p>
            </div>

            {/* AES Encryption Toggle & Password */}
            <div className="space-y-3 pt-2 border-t border-amber-900/10 dark:border-stone-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  AES-256 Payload Encryption
                </label>
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-medium">
                  {password ? 'PBKDF2 + AES-GCM' : 'Disabled'}
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret decryption password (optional)..."
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800 text-sm text-stone-900 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-amber-600 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Secret Payload & Embedding Trigger */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            
            {/* Header & Payload Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-900/10 dark:border-stone-800 pb-4">
              <h2 className="text-xs font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 flex items-center gap-2 font-mono">
                <Search className="w-4 h-4" /> 3. Secret Payload Input
              </h2>

              <div className="flex bg-stone-200/80 dark:bg-stone-950 p-1 rounded-xl border border-amber-900/10 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setPayloadType('text')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    payloadType === 'text'
                      ? 'bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" /> Text Message
                </button>
                <button
                  type="button"
                  onClick={() => setPayloadType('file')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    payloadType === 'file'
                      ? 'bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" /> File Attachment
                </button>
              </div>
            </div>

            {/* Capacity Usage Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
                <span>Storage Utilization ({currentPayloadSize} / {maxCapacity} Bytes)</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{capacityUsage.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-900 overflow-hidden border border-amber-900/10 dark:border-stone-800">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverCapacity
                      ? 'bg-rose-500'
                      : capacityUsage > 80
                      ? 'bg-amber-500'
                      : 'bg-amber-600 dark:bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, capacityUsage)}%` }}
                />
              </div>
            </div>

            {/* Mode 1: Text Message Input */}
            {payloadType === 'text' && (
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type or paste your secret message here (e.g. Confidential Investigation Notes, Passwords, API Keys)..."
                className="w-full p-4 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800 text-stone-900 dark:text-stone-200 text-sm placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-all resize-none font-mono"
              />
            )}

            {/* Mode 2: Secret File Attachment */}
            {payloadType === 'file' && (
              <div className="space-y-4">
                <input
                  ref={secretFileInputRef}
                  type="file"
                  onChange={handleSecretFileSelected}
                  className="hidden"
                />

                {secretFile ? (
                  <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-amber-500/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
                        <File className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-semibold text-stone-900 dark:text-white truncate">{secretFile.name}</div>
                        <div className="text-xs font-mono text-stone-500">
                          {(secretFile.data.length / 1024).toFixed(1)} KB — {secretFile.mimeType || 'Binary'}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSecretFile(null)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => secretFileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-500/30 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer bg-amber-50/50 dark:bg-stone-950/40 hover:bg-amber-100/50 dark:hover:bg-stone-900/60 transition-all space-y-2"
                  >
                    <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <FileUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
                        Select a Secret File to Embed (Documents, Images, PDFs, Audio, Zip)
                      </p>
                      <p className="text-xs text-stone-500 font-mono">Any binary file type up to cover capacity</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Embed Action Button */}
            <button
              onClick={handleEmbed}
              disabled={isProcessing || (payloadType === 'text' && !message.trim()) || (payloadType === 'file' && !secretFile) || isOverCapacity}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                isProcessing || (payloadType === 'text' && !message.trim()) || (payloadType === 'file' && !secretFile) || isOverCapacity
                  ? 'bg-stone-300 dark:bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25 active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  Embedding payload into pixel matrix...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Embed Secret Payload Now
                </>
              )}
            </button>
          </div>

          {/* Stego Result Display */}
          {stegoResult && (
            <div className="glass-panel-glow p-6 rounded-3xl space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  Stego Image Ready!
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  CRC32: 0x{stegoResult.crc32.toString(16).toUpperCase()}
                </span>
              </div>

              {/* Stego Image / Heatmap Toggle Preview */}
              <div className="relative mx-auto max-h-72 overflow-hidden rounded-2xl border border-amber-500/40 bg-stone-950 flex items-center justify-center p-2">
                <img
                  src={showDiffHeatmap ? stegoResult.heatmapDataUrl : stegoResult.stegoDataUrl}
                  alt="Stego Result"
                  className="max-h-64 object-contain rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowDiffHeatmap(!showDiffHeatmap)}
                  className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-stone-900/90 text-xs font-semibold text-amber-400 border border-amber-500/40 hover:bg-stone-900 flex items-center gap-1.5 shadow-lg"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showDiffHeatmap ? 'Show Normal Image' : 'Show Diff Heatmap'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800">
                  <div className="text-stone-500 text-[10px]">PAYLOAD TYPE</div>
                  <div className="text-amber-600 dark:text-amber-400 font-bold mt-0.5 uppercase">{stegoResult.payloadType}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800">
                  <div className="text-stone-500 text-[10px]">PAYLOAD SIZE</div>
                  <div className="text-amber-600 dark:text-amber-400 font-bold mt-0.5">{stegoResult.usedBytes} Bytes</div>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800 col-span-2 sm:col-span-1">
                  <div className="text-stone-500 text-[10px]">ENCRYPTION</div>
                  <div className="text-amber-600 dark:text-amber-400 font-bold mt-0.5">{password ? 'AES-256' : 'None'}</div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={stegoResult.stegoDataUrl}
                  download="stego_image.png"
                  className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
                >
                  <Download className="w-4 h-4" /> Download Stego PNG
                </a>
                {onGoToExtract && (
                  <button
                    onClick={onGoToExtract}
                    className="py-3 px-4 rounded-2xl bg-stone-200 dark:bg-stone-900 hover:bg-stone-300 dark:hover:bg-stone-800 text-amber-700 dark:text-amber-400 font-semibold text-xs border border-amber-500/30 flex items-center justify-center gap-2 transition-all"
                  >
                    Test Extraction Now →
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
