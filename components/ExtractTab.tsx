import React, { useState, useRef } from 'react';
import { Unlock, Upload, ShieldCheck, Copy, Check, AlertTriangle, Key, Sparkles, Image as ImageIcon, RefreshCw, Download, File, FileText, FileSpreadsheet } from 'lucide-react';
import { extractMessage, type ExtractResult } from '../utils/stegoEngine';
import { getSampleStegoPair } from '../utils/sampleImages';

export const ExtractTab: React.FC = () => {
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [stegoImageData, setStegoImageData] = useState<ImageData | null>(null);
  const [password, setPassword] = useState<string>('');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractResult, setExtractResult] = useState<ExtractResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
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
        setStegoImageData(data);
        setExtractResult(null);
        setErrorMsg('');
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const loadSampleStego = async () => {
    try {
      setIsProcessing(true);
      setErrorMsg('');
      const pair = await getSampleStegoPair();
      setImageDataUrl(pair.stegoDataUrl);
      setStegoImageData(pair.stegoImageData);
      setPassword('');

      // Auto extract sample
      const res = await extractMessage(pair.stegoImageData, '');
      setExtractResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to extract sample image payload.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtract = async () => {
    if (!stegoImageData) {
      setErrorMsg('Please select or upload a stego image first.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg('');
      const res = await extractMessage(stegoImageData, password.trim());
      setExtractResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to extract text/file. Make sure the image contains a valid payload and password is correct.');
      setExtractResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (extractResult?.message) {
      navigator.clipboard.writeText(extractResult.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Unlock className="w-7 h-7 text-cyan-400" />
            Extract Payload from Image
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Detect magic headers, decode LSB streams, and decrypt hidden text messages or attached files.
          </p>
        </div>
        <button
          onClick={loadSampleStego}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Load Sample Stego Image & Test
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Image & Password */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-wide uppercase text-cyan-400 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Select Stego Image
              </h2>
              {stegoImageData && (
                <span className="text-xs font-mono text-slate-400">
                  {stegoImageData.width} × {stegoImageData.height} px
                </span>
              )}
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer border-2 border-dashed border-cyan-500/30 hover:border-cyan-400 rounded-2xl p-6 text-center transition-all bg-slate-950/40 hover:bg-slate-900/60 overflow-hidden"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/webp, image/bmp"
                onChange={handleFileChange}
                className="hidden"
              />

              {imageDataUrl ? (
                <div className="relative mx-auto max-h-64 overflow-hidden rounded-xl border border-slate-700/80 shadow-2xl flex items-center justify-center bg-slate-950">
                  <img src={imageDataUrl} alt="Stego Input" className="max-h-64 object-contain" />
                  <div className="absolute inset-0 bg-cyan-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-xs text-cyan-300 font-semibold border border-cyan-500/40">
                      Click to choose another image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      Drag & Drop stego image here, or <span className="text-cyan-400 underline">Browse</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PNG, WebP, or BMP files containing embedded data</p>
                  </div>
                </div>
              )}
            </div>

            {/* Password input */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                Decryption Password (If Payload Encrypted)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password if payload is AES encrypted..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Extract Action Button */}
            <button
              onClick={handleExtract}
              disabled={isProcessing || !stegoImageData}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
                isProcessing || !stegoImageData
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 text-white hover:opacity-95 shadow-cyan-500/25 active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  Scanning LSB stream & verifying magic bytes...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Extract Secret Payload
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Decoded Payload Results */}
        <div className="lg:col-span-6 space-y-6">
          {extractResult ? (
            <div className="glass-panel-glow p-6 rounded-3xl space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5" />
                  Payload Extracted Successfully!
                </div>
                {extractResult.payloadType === 'text' && (
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-semibold border border-cyan-500/30 flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                )}
              </div>

              {/* Message Display Area */}
              {extractResult.payloadType === 'text' ? (
                <div className="relative p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    DECODED SECRET MESSAGE CONTENT
                  </div>
                  <div className="text-sm font-mono text-cyan-200 whitespace-pre-wrap break-words leading-relaxed max-h-60 overflow-y-auto pr-2">
                    {extractResult.message}
                  </div>
                </div>
              ) : (
                /* File Attachment Display Area */
                extractResult.fileInfo && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-4">
                    <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <File className="w-3.5 h-3.5" /> EXTRACTED SECRET FILE ATTACHMENT
                    </div>

                    <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                          <FileSpreadsheet className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-semibold text-white truncate">{extractResult.fileInfo.name}</div>
                          <div className="text-xs font-mono text-slate-400">
                            {(extractResult.fileInfo.sizeBytes / 1024).toFixed(1)} KB — {extractResult.fileInfo.mimeType}
                          </div>
                        </div>
                      </div>

                      <a
                        href={extractResult.fileInfo.dataUrl}
                        download={extractResult.fileInfo.name}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 shrink-0 transition-all"
                      >
                        <Download className="w-4 h-4" /> Download File
                      </a>
                    </div>

                    {/* Image Preview if embedded file is an image */}
                    {extractResult.fileInfo.mimeType.startsWith('image/') && (
                      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-2 text-center">
                        <div className="text-[10px] font-mono text-slate-500 mb-1">FILE PREVIEW</div>
                        <img
                          src={extractResult.fileInfo.dataUrl}
                          alt="Extracted file preview"
                          className="max-h-48 mx-auto rounded-lg object-contain"
                        />
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Verification Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">INTEGRITY</div>
                  <div className="text-emerald-400 font-bold mt-0.5 flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> CRC32 Valid
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">DETECTED LSB</div>
                  <div className="text-purple-300 font-bold mt-0.5">{extractResult.bitDepth} Bit Depth</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-slate-500 text-[10px]">ENCRYPTION</div>
                  <div className="text-pink-300 font-bold mt-0.5">
                    {extractResult.isEncrypted ? 'AES-256 Validated' : 'None'}
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500 font-mono">
                Extracted at: {extractResult.timestamp}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl text-center space-y-4 border border-slate-800/80 my-auto flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                <Unlock className="w-7 h-7 text-slate-600" />
              </div>
              <div className="max-w-xs space-y-1">
                <h3 className="text-base font-semibold text-slate-300">No Payload Extracted Yet</h3>
                <p className="text-xs text-slate-500">
                  Upload an image containing embedded steganography data or click "Load Sample Stego Image".
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
