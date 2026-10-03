import React from 'react';
import { BookOpen, FileCheck, HardDrive, ShieldCheck, Cpu, FileText, Coffee, Search } from 'lucide-react';

export const DocsTab: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-amber-900/10 dark:border-stone-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white flex items-center gap-3">
              Steganography & Capacity Methodology
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-0.5 flex items-center gap-2">
              <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Technical specifications, capacity formulas, supported image formats, and cryptographic architecture.</span>
            </p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-2xl text-xs font-mono bg-stone-200/80 dark:bg-stone-900 text-amber-800 dark:text-amber-400 border border-amber-900/10 dark:border-amber-500/30">
          arithmatrix.tech Internship Deliverable
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Formats & Capacity Math */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Supported Image Formats */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h2 className="text-xs font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 flex items-center gap-2 font-mono">
              <FileCheck className="w-4 h-4" />
              Supported Formats & Compression Characteristics
            </h2>

            <div className="space-y-3 text-xs">
              
              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-emerald-500/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  PNG
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-stone-900 dark:text-slate-200 text-sm">PNG (Portable Network Graphics) — Recommended</div>
                  <p className="text-stone-600 dark:text-slate-400 leading-relaxed">
                    Uses lossless Deflate compression. Pixel RGB values remain 100% exact after saving and re-opening, preserving every LSB bit embedded.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-amber-500/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                  WEBP
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-stone-900 dark:text-slate-200 text-sm">WebP (Lossless Mode)</div>
                  <p className="text-stone-600 dark:text-slate-400 leading-relaxed">
                    Supported in lossless mode. WebP provides smaller file sizes while maintaining exact pixel bit preservation.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-amber-500/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                  BMP
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-stone-900 dark:text-slate-200 text-sm">BMP (Bitmap Uncompressed)</div>
                  <p className="text-stone-600 dark:text-slate-400 leading-relaxed">
                    Raw pixel array storing uncompressed 24-bit RGB values per pixel. Perfect for bit persistence.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-rose-500/30 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                  JPG
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-stone-900 dark:text-slate-200 text-sm">JPEG / JPG (Lossy — Converted)</div>
                  <p className="text-stone-600 dark:text-slate-400 leading-relaxed">
                    JPEG applies lossy Discrete Cosine Transform (DCT) quantization compression which slightly shifts RGB color values. STEGOCAFÉ automatically converts JPEG inputs to lossless PNG upon embedding.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Mathematical Capacity Formula */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h2 className="text-xs font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 flex items-center gap-2 font-mono">
              <HardDrive className="w-4 h-4" />
              Payload Capacity Limits & Formula
            </h2>

            <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800 space-y-3 font-mono text-xs">
              <div className="text-amber-700 dark:text-amber-400 font-bold text-sm">Capacity Calculation Formula:</div>
              <div className="p-3 rounded-xl bg-stone-200/80 dark:bg-stone-900 text-stone-900 dark:text-stone-200 border border-amber-500/30">
                Capacity (Bytes) = Math.floor((Width × Height × 3 × BitDepth) / 8) - HeaderOverhead
              </div>
              <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                <li><strong className="text-stone-900 dark:text-stone-200">Width × Height:</strong> Total image pixel count.</li>
                <li><strong className="text-stone-900 dark:text-stone-200">3 Channels:</strong> Red, Green, and Blue channels per pixel.</li>
                <li><strong className="text-stone-900 dark:text-stone-200">BitDepth:</strong> Number of LSB bits used per channel (1 to 4 bits).</li>
                <li><strong className="text-stone-900 dark:text-stone-200">HeaderOverhead:</strong> 13 Bytes (Unencrypted) or 41 Bytes (AES-256 Encrypted).</li>
              </ul>
            </div>

            {/* Reference Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-amber-900/10 dark:border-stone-800 text-amber-700 dark:text-amber-400">
                    <th className="py-2.5 px-3">Resolution</th>
                    <th className="py-2.5 px-3">Total Pixels</th>
                    <th className="py-2.5 px-3">1-Bit LSB Max</th>
                    <th className="py-2.5 px-3">4-Bit LSB Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-900/10 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                  <tr>
                    <td className="py-2 px-3">400 × 400</td>
                    <td className="py-2 px-3">160,000</td>
                    <td className="py-2 px-3 text-amber-600 dark:text-amber-400">59.9 KB</td>
                    <td className="py-2 px-3 text-amber-700 dark:text-amber-300">239.9 KB</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">800 × 800</td>
                    <td className="py-2 px-3">640,000</td>
                    <td className="py-2 px-3 text-amber-600 dark:text-amber-400">239.9 KB</td>
                    <td className="py-2 px-3 text-amber-700 dark:text-amber-300">959.9 KB</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">1920 × 1080 (FHD)</td>
                    <td className="py-2 px-3">2,073,600</td>
                    <td className="py-2 px-3 text-amber-600 dark:text-amber-400">777.5 KB</td>
                    <td className="py-2 px-3 text-amber-700 dark:text-amber-300">3.11 MB</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3">3840 × 2160 (4K)</td>
                    <td className="py-2 px-3">8,294,400</td>
                    <td className="py-2 px-3 text-amber-600 dark:text-amber-400">3.11 MB</td>
                    <td className="py-2 px-3 text-amber-700 dark:text-amber-300">12.44 MB</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Right Column: Security Protocol & Internship Summary */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h2 className="text-xs font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 flex items-center gap-2 font-mono">
              <ShieldCheck className="w-4 h-4" />
              Binary Protocol & Cryptography
            </h2>

            <div className="space-y-3 font-mono text-xs">
              
              <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800 space-y-1">
                <div className="text-amber-700 dark:text-amber-400 font-bold">1. Magic Header Signature</div>
                <div className="text-stone-600 dark:text-stone-400 text-[11px]">
                  4 Bytes: <span className="text-stone-900 dark:text-stone-200 font-bold">'STEG'</span> (0x53 0x54 0x45 0x47). Guarantees reliable detection of valid stego files.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800 space-y-1">
                <div className="text-amber-700 dark:text-amber-400 font-bold">2. AES-256-GCM Encryption</div>
                <div className="text-stone-600 dark:text-stone-400 text-[11px]">
                  Uses Web Crypto API with PBKDF2 key derivation (100,000 iterations SHA-256), 16-byte random salt, and 12-byte IV.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-amber-900/10 dark:border-stone-800 space-y-1">
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">3. CRC32 Checksum Validation</div>
                <div className="text-stone-600 dark:text-stone-400 text-[11px]">
                  32-bit CRC checksum stored in packet header to verify complete data integrity upon extraction.
                </div>
              </div>

            </div>
          </div>

          <div className="glass-panel-glow p-6 rounded-3xl space-y-4 border border-amber-500/30">
            <h2 className="text-xs font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 flex items-center gap-2 font-mono">
              <Cpu className="w-4 h-4" />
              Arithmatrix Internship Project Checklist
            </h2>

            <ul className="space-y-2 text-xs font-mono text-stone-700 dark:text-stone-300">
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Text & Binary File Embedding Utility</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Supported Formats & Capacity Limits Documented</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Example Cover / Stego Image Pair Included</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Interactive Live Extraction Proof Demonstration</span>
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>LSB Bit-Plane Decomposition & Noise Analysis</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};

