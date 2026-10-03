import React, { useState, useEffect, useRef } from 'react';
import { Eye, Upload, Sliders, Layers, Info, Image as ImageIcon, Coffee, Search } from 'lucide-react';
import { extractBitPlane } from '../utils/stegoEngine';
import { createSyntheticCoverImage } from '../utils/sampleImages';

export const BitInspectorTab: React.FC = () => {
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [sourceImageData, setSourceImageData] = useState<ImageData | null>(null);
  const [channel, setChannel] = useState<'red' | 'green' | 'blue' | 'gray'>('red');
  const [bitIndex, setBitIndex] = useState<number>(0);
  const [bitPlaneUrl, setBitPlaneUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSample();
  }, []);

  useEffect(() => {
    if (sourceImageData) {
      updateBitPlane();
    }
  }, [sourceImageData, channel, bitIndex]);

  const loadSample = () => {
    const { imageData, dataUrl } = createSyntheticCoverImage(400, 400);
    setSourceImageData(imageData);
    setImageDataUrl(dataUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setSourceImageData(data);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const updateBitPlane = () => {
    if (!sourceImageData) return;
    const bitPlaneData = extractBitPlane(sourceImageData, channel, bitIndex);
    const canvas = document.createElement('canvas');
    canvas.width = sourceImageData.width;
    canvas.height = sourceImageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(bitPlaneData, 0, 0);
    setBitPlaneUrl(canvas.toDataURL('image/png'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-amber-900/10 dark:border-stone-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white flex items-center gap-3">
              Bit-Plane Forensic Degustation
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5 flex items-center gap-2">
              <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Decompose RGB pixels into 8 binary bit planes to analyze noise entropy & payload insertion.</span>
            </p>
          </div>
        </div>
        <button
          onClick={loadSample}
          className="px-4 py-2.5 rounded-2xl text-xs font-semibold bg-stone-200/80 dark:bg-stone-900 hover:bg-stone-300 dark:hover:bg-stone-800 text-amber-700 dark:text-amber-400 border border-amber-900/10 dark:border-amber-500/30 transition-all shadow-sm"
        >
          Load Artisan Sample
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image Controls & Bit Plane Selector */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <h2 className="text-xs font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 flex items-center gap-2 font-mono">
              <ImageIcon className="w-4 h-4" /> 1. Input Image
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer border-2 border-dashed border-amber-500/30 hover:border-amber-500 rounded-2xl p-4 text-center transition-all bg-amber-50/50 dark:bg-stone-950/40 hover:bg-amber-100/50 dark:hover:bg-stone-900/60 overflow-hidden"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/webp, image/bmp"
                onChange={handleFileChange}
                className="hidden"
              />

              {imageDataUrl ? (
                <div className="relative mx-auto max-h-48 overflow-hidden rounded-xl border border-amber-900/10 dark:border-stone-800 shadow-2xl flex items-center justify-center bg-stone-950">
                  <img src={imageDataUrl} alt="Source" className="max-h-48 object-contain" />
                </div>
              ) : (
                <div className="py-6 space-y-2 text-amber-600 dark:text-amber-400">
                  <Upload className="w-6 h-6 mx-auto" />
                  <p className="text-xs text-stone-700 dark:text-stone-300 font-medium">Click to upload image for bit plane analysis</p>
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <h2 className="text-xs font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 flex items-center gap-2 font-mono">
              <Sliders className="w-4 h-4" /> 2. Channel & Bit Selection
            </h2>

            {/* Channel Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Color Channel</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'red', label: 'Red' },
                  { id: 'green', label: 'Green' },
                  { id: 'blue', label: 'Blue' },
                  { id: 'gray', label: 'Gray' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setChannel(c.id as any)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      channel === c.id
                        ? 'bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500 shadow-md'
                        : 'bg-stone-100 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 border-amber-900/10 dark:border-stone-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bit Index Selector */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Bit Plane Position</label>
                <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                  Bit {bitIndex} ({bitIndex === 0 ? 'LSB - Stego Payload' : bitIndex === 7 ? 'MSB - Structural Contour' : `Bit ${bitIndex}`})
                </span>
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBitIndex(b)}
                    className={`py-2 rounded-xl text-xs font-bold font-mono border transition-all ${
                      bitIndex === b
                        ? b === 0
                          ? 'bg-amber-600 text-white dark:bg-amber-500/30 dark:text-amber-300 border-amber-500 shadow-md'
                          : 'bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 border-amber-500 shadow-md'
                        : 'bg-stone-100 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 border-amber-900/10 dark:border-stone-800'
                    }`}
                  >
                    B{b}
                  </button>
                ))}
              </div>
            </div>

            {/* Information Alert */}
            <div className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800 text-stone-600 dark:text-stone-400 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-stone-900 dark:text-stone-200 font-bold">Bit 0 (LSB)</span> contains high-frequency noise which is ideal for steganography because human visual perception cannot discern subtle 1-bit fluctuations.
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Bit Plane Visualizer Canvas */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel-glow p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Bit Plane {bitIndex} ({channel.toUpperCase()} Channel)
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-950 text-stone-600 dark:text-stone-400 border border-amber-900/10 dark:border-stone-800">
                {bitIndex === 0 ? 'Least Significant Bit' : bitIndex === 7 ? 'Most Significant Bit' : `Bit Level ${bitIndex}`}
              </span>
            </div>

            <div className="relative mx-auto max-h-[420px] overflow-hidden rounded-2xl border border-amber-500/40 bg-stone-950 flex items-center justify-center p-3">
              {bitPlaneUrl ? (
                <img src={bitPlaneUrl} alt="Bit Plane" className="max-h-[380px] object-contain rounded-xl" />
              ) : (
                <div className="py-20 text-stone-500 text-xs">Generating bit plane view...</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800">
                <div className="text-stone-500 text-[10px]">BIT SIGNIFICANCE</div>
                <div className="text-amber-700 dark:text-amber-300 font-bold mt-0.5">
                  Weight: {Math.pow(2, bitIndex)} (0x{Math.pow(2, bitIndex).toString(16).padStart(2, '0')})
                </div>
              </div>
              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800">
                <div className="text-stone-500 text-[10px]">STEGO USABILITY</div>
                <div className={`font-bold mt-0.5 ${bitIndex <= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {bitIndex === 0 ? 'Optimal (Invisible)' : bitIndex <= 2 ? 'Acceptable' : 'High Distortion'}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

