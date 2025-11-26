"use client";
import { useState } from 'react';
import { Search, Download, Music, AlertCircle, CheckCircle, Twitter, ArrowRight, Loader2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await fetch('/api/resolve', {
        method: 'POST',
        body: JSON.stringify({ url }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("System error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (mediaUrl, filename, index) => {
    setDownloading(index);
    try {
      // PERBAIKAN: Fetch dengan header yang lebih compatible
      const response = await fetch(mediaUrl, {
        method: 'GET',
        headers: {
          'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8'
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      
      // VALIDASI: Pastikan blob bukan corrupt
      if (blob.size < 1000) {
        throw new Error('File too small, might be corrupted');
      }

      // PERBAIKAN: Buat Blob baru dengan type yang eksplisit
      const videoBlob = new Blob([blob], { type: 'video/mp4' });
      const blobUrl = window.URL.createObjectURL(videoBlob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.setAttribute('type', 'video/mp4'); // Eksplisit set type
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 100);
      
    } catch (err) {
      console.error("Download error:", err);
      // Fallback: Buka di tab baru (user bisa download manual)
      window.open(mediaUrl, '_blank');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#fbfbff] text-[#040f16] font-sans selection:bg-[#01baef] selection:text-white">
      
      {/* --- NAVBAR (Minimalist) --- */}
      <nav className="w-full max-w-3xl mx-auto p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[#040f16] text-white p-1.5 rounded">
            <Music className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Do Re Mi.</h1>
        </div>
        <a href="https://github.com/yuridazani" target="_blank" className="text-sm font-medium hover:text-[#b80c09] transition-colors">
          GitHub
        </a>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="grow flex flex-col items-center pt-20 px-6 max-w-2xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6 px-3 py-1 border border-[#040f16] rounded-full text-xs font-bold uppercase tracking-wider bg-white">
            v1.1 • Compatible Downloads
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tight leading-[1.1]">
            Grab the <span className="text-[#b80c09] underline decoration-4 decoration-[#01baef]">Melody</span>.
          </h2>
          <p className="text-[#0b4f6c] text-lg font-medium">
            Paste a link. Get the video. Pure quality.
          </p>
        </div>

        {/* Search Box (Clean & Bold) */}
        <form onSubmit={handleSearch} className="w-full relative mb-12 group">
          <div className="absolute inset-0 bg-[#040f16] rounded-xl translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
          <div className="relative flex items-center bg-white border-2 border-[#040f16] rounded-xl overflow-hidden">
            <div className="pl-4 text-[#040f16]">
              <Twitter className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="https://x.com/username/status/..." 
              className="w-full p-4 outline-none text-lg placeholder:text-gray-400 bg-transparent font-medium"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-[#01baef] hover:bg-[#009ecb] text-white px-6 py-4 font-bold border-l-2 border-[#040f16] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Get"}
            </button>
          </div>
        </form>

        {/* Info Banner (Mobile Compatibility) */}
        <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 mb-8 flex items-start gap-2 text-sm">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-blue-800">
            <strong>Tip:</strong> Jika video tidak bisa dibuka, gunakan <strong>VLC Player</strong> atau <strong>MX Player</strong> di Android.
          </p>
        </div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full bg-[#b80c09]/10 border border-[#b80c09] text-[#b80c09] p-4 rounded-lg flex items-center gap-3 mb-8 font-medium"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Card (Canvas Style) */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full mb-20"
            >
              <div className="bg-white border-2 border-[#040f16] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#040f16]">
                
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6 border-b-2 border-dashed border-gray-200 pb-4">
                  <div className="w-10 h-10 bg-[#0b4f6c] rounded-full flex items-center justify-center text-white">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-lg truncate">{result.author}</h3>
                    <p className="text-sm text-gray-500 truncate">@{result.username}</p>
                  </div>
                </div>

                {/* Content Text */}
                <p className="text-sm text-[#040f16] mb-6 leading-relaxed">
                  {result.text}
                </p>

                {/* Media Grid */}
                <div className="space-y-4">
                  {result.data.map((media, idx) => (
                    <div key={idx} className="border-2 border-[#040f16] rounded-xl overflow-hidden bg-black relative">
                      {/* Video/Image */}
                      <div className="aspect-video flex items-center justify-center bg-gray-100">
                        {media.type === 'video' ? (
                          <video controls poster={media.thumbnail} className="w-full h-full object-contain bg-black" preload="metadata">
                            <source src={media.url} type="video/mp4" />
                            Your browser doesn't support video playback.
                          </video>
                        ) : (
                          <img src={media.url} alt="Media" className="w-full h-full object-cover" />
                        )}
                      </div>

                      {/* Download Bar */}
                      <div className="bg-white border-t-2 border-[#040f16] p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-[#01baef]/20 text-[#0b4f6c] text-xs font-bold uppercase rounded">
                            {media.type === 'video' ? 'MP4 Compatible' : 'Image'}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDownload(media.url, media.filename, idx)}
                          disabled={downloading === idx}
                          className="flex items-center gap-2 text-sm font-bold text-[#040f16] hover:text-[#b80c09] transition-colors disabled:opacity-50"
                        >
                          {downloading === idx ? (
                            <>Saving... <Loader2 className="w-4 h-4 animate-spin"/></>
                          ) : (
                            <>Download <Download className="w-4 h-4" /></>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-200">
        © {new Date().getFullYear()} Do Re Mi. Simple. Fast. Compatible.
      </footer>
    </main>
  );
}
