import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/Button';
import { useStore } from './store';
import { Music2, Loader2, Play, Pause, Download } from 'lucide-react';
import { toast } from 'sonner';

export function MusicGenPage() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("clip");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
      } else {
        audioRef.current.src = audioUrl;
      }
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleGenerate = async () => {
    if (!prompt) {
       toast.error("Please provide a prompt");
       return;
    }

    setLoading(true);
    setAudioUrl(null);
    setLyrics("");
    try {
      const res = await fetch("/api/ai/music", {
        method: "POST", headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.audioBase64) {
         const binary = atob(data.audioBase64);
         const bytes = new Uint8Array(binary.length);
         for (let i = 0; i < binary.length; i++) {
           bytes[i] = binary.charCodeAt(i);
         }
         const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
         const url = URL.createObjectURL(blob);
         setAudioUrl(url);
         setLyrics(data.lyrics || "");
      }
    } catch(err: any) {
      toast.error(err.message || "Failed to generate music");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="mx-auto max-w-4xl opacity-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center mb-2 text-white">
            <Music2 className="w-8 h-8 mr-3 text-yellow-400" />
            Generate Music
          </h1>
          <p className="text-slate-400">Powered by Google Lyria 3 Music Generation.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
             <div className="p-6 rounded-2xl glass border border-white/10 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
                 <textarea
                   value={prompt}
                   onChange={e => setPrompt(e.target.value)}
                   className="w-full bg-slate-800/80 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 h-32 resize-none"
                   placeholder="Describe the track you want to generate (e.g. 'Epic cinematic orchestral piece with rising tempo')..."
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Output length</label>
                 <div className="flex gap-2">
                   {[{ id: 'clip', label: 'Lyria Clip (30s)' }, { id: 'pro', label: 'Lyria Pro (Full)' }].map(m => (
                     <button
                       key={m.id}
                       onClick={() => setType(m.id)}
                       className={`px-4 py-2 rounded-lg text-sm font-medium transition ${type === m.id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                     >
                       {m.label}
                     </button>
                   ))}
                 </div>
               </div>

               <Button className="w-full mt-4 active-tab font-bold" size="lg" onClick={handleGenerate} isLoading={loading}>
                 {loading ? "Composing Track..." : "Generate Music"}
               </Button>
             </div>
          </div>

          <div className="h-[400px] lg:h-[500px] rounded-2xl glass border border-white/10 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black/50">
             {loading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
                 <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                 <p className="text-slate-300 font-medium">Composing your track...</p>
                 <p className="text-slate-500 text-sm mt-2 text-center max-w-xs">Lyria is generating audio and extracting lyrics.</p>
               </div>
             )}

             {audioUrl ? (
               <div className="w-full h-full flex flex-col data-card">
                  <div className="flex-1 overflow-y-auto mb-4 bg-white/5 rounded-xl p-4">
                     {lyrics ? (
                       <pre className="whitespace-pre-wrap text-sm text-slate-300 font-sans">{lyrics}</pre>
                     ) : (
                       <div className="h-full flex items-center justify-center text-slate-500 italic">No lyrics provided for this track.</div>
                     )}
                  </div>
                  
                  <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl shadow-inner border border-white/5">
                     <button onClick={togglePlay} className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white hover:bg-indigo-600 transition shadow-lg shadow-indigo-500/20">
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
                     </button>
                     <div className="flex-1 mx-4">
                        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                           {isPlaying && <div className="h-full bg-indigo-500 animate-[pulse_2s_ease-in-out_infinite] origin-left" style={{ width: '100%' }}></div>}
                        </div>
                     </div>
                     <a href={audioUrl} download="lyria-track.wav" className="p-2 text-slate-400 hover:text-white transition">
                        <Download className="h-5 w-5" />
                     </a>
                  </div>
               </div>
             ) : (
                !loading && <div className="text-slate-500 flex flex-col items-center">
                  <Music2 className="w-16 h-16 mb-4 opacity-20" />
                  <p>Your generated audio will appear here</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
