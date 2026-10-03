# ☕ StegoCafé : Steganography Arithmatrix Platform

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.rs/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Security](https://img.shields.io/badge/Security-AES--256--PBKDF2-emerald?logo=shield&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
[![License](https://img.shields.io/badge/License-MIT-amber)](LICENSE)

> A minimalist, high-performance LSB (Least Significant Bit) steganography and digital forensics suite crafted with an artisan **Coffee / Café Vibe** design system. Embed secret text messages and binary file attachments inside digital images using multi-bit depth encoding, PBKDF2 + AES-256 encryption, and CRC32 payload checksum verification.

---

## ☕ Key Features

- 🔐 **Multi-Bit LSB Embedding Engine**: Choose between 1 to 4 LSBs per RGB channel (3–12 bits per pixel), balancing imperceptibility against maximum data storage capacity.
- 📁 **Binary File Attachment Embedding**: Hide non-text files (PDFs, Zip archives, images, audio, documents) inside cover images using custom binary packet serialization.
- 🛡️ **AES-256 Encryption & PBKDF2**: Secure confidential payloads with military-grade Web Crypto API encryption prior to pixel embedding.
- ✅ **CRC32 Integrity Verification**: Automatic payload integrity checksum generation and validation upon extraction to detect pixel tampering.
- 🔬 **8-Bit Plane & RGB Inspector**: Deconstruct images into individual bit planes ($2^0$ to $2^7$) across Red, Green, and Blue channels for deep forensic analysis.
- 🗺️ **Difference Heatmap & Pixel Magnifier**: Instant visual comparison between original cover images and stego images to verify zero visual degradation.
- 🎯 **Interactive Extraction Audit Proof**: Step-by-step verification pipeline demonstrating magic header detection, binary extraction, CRC32 checking, and decryption.
- 🌙 **Coffee / Café Design System**: Seamless Light (Velvet Oat Latte) and Dark (Warm Dark Roast Espresso) theme toggling with glassmorphism and steam rise animations.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Build Tooling** | [Vite 6](https://vitejs.dev/) with HMR |
| **Styling & Theme** | [Tailwind CSS v4](https://tailwindcss.com/), Glassmorphism, CSS Variables |
| **Iconography** | [Lucide React](https://lucide.dev/) + Custom SVG Icons |
| **Cryptography** | Web Crypto API (`crypto.subtle`), AES-GCM 256-bit, PBKDF2 |
| **Integrity & Canvas** | CRC32 bitwise calculation, HTML5 Canvas API, ImageData manipulation |

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have **Node.js** (v18 or higher) and **npm** installed on your system.

### 1. Installation
Navigate to the project root directory and install dependencies:

```bash
cd [Your File Location]
npm install
```

### 2. Development Server
Launch the Vite development server:

```bash
npm run dev
```

Open your browser and navigate to:
```text
http://localhost:5173
```

### 3. Production Build
Generate an optimized production build:

```bash
npm run build
```

To preview the built app locally:
```bash
npm run preview
```

---

## 💡 How Steganography Works

### Embedding Pipeline
1. **Payload Serialization**: Text or binary files are formatted into a structured binary packet containing magic signature (`ARITHMATRIX_STEGO_V1`), payload flags, file metadata (filename, mime-type), and raw bytes.
2. **CRC32 Computation**: A 32-bit Cyclic Redundancy Checksum is computed over the payload data.
3. **AES-256 Encryption** *(Optional)*: If a password is provided, PBKDF2 derives a 256-bit key with 100,000 iterations to encrypt the payload via AES-GCM.
4. **LSB Replacement**: The binary bitstream is injected into the Least Significant Bits of the cover image's RGB channels sequentially:
   $$\text{Pixel}_{\text{stego}} = (\text{Pixel}_{\text{cover}} \ \& \ \sim((1 \ll k) - 1)) \ | \ \text{Bits}_{\text{payload}}$$

---

## 🏢 Project Structure

```text
steganography-arithmatrix/
├── public/
│   └── favicon.svg              # App icon
├── src/
│   ├── components/
│   │   ├── BackgroundParticles.tsx # Floating coffee steam canvas
│   │   ├── BitInspectorTab.tsx     # 8-Bit plane visualizer
│   │   ├── DocsTab.tsx             # Mathematics & format docs
│   │   ├── EmbedTab.tsx            # Stego embedding interface
│   │   ├── ExtractTab.tsx          # Payload extraction interface
│   │   ├── Navbar.tsx              # Café branding & theme switcher
│   │   └── ProofDemoTab.tsx        # Audit proof & magnifier
│   ├── utils/
│   ├── crypto.ts                   # AES-256, PBKDF2 & CRC32 engine
│   ├── sampleImages.ts             # Procedural cover generator
│   └── stegoEngine.ts              # LSB bitwise encoder/decoder
│   ├── App.tsx                     # Main layout & developer footer
│   ├── index.css                   # Coffee theme system & animations
│   └── main.tsx                    # React entry point
├── package.json
├── README.md
└── vite.config.ts
```

---

## 👨‍💻 Developer & Internship Attribution

- **Project**: Arithmatrix Internship Project
- **Developer**: **Mohammed Zuoriki**
- **LinkedIn**: [mohammed-zuoriki-856133250](https://www.linkedin.com/in/mohammed-zuoriki-856133250/?isSelfProfile=true)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
