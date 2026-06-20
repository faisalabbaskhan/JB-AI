import React, { useState } from 'react';
import { Button } from './components/Button';
import { useStore } from './store';
import { Video, Film, Upload, Loader2, Download } from 'lucide-react';
import { toast } from 'sonner';

export function VideoGenPage({ animateMode = false }: { animateMode?: boolean }) {
  const { user } = useStore();
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleGenerate = async () => {
    if (!prompt && !selectedFile) {
       toast.error("Please provide a prompt or image");
       return;
    }

    setLoading(true);
    setVideoUrl(null);
    try {
      const formData = new FormData();
      formData.append("userId", user?.id || "");
      formData.append("prompt", prompt);
      formData.append("aspectRatio", aspectRatio);
      if (selectedFile) formData.append("image", selectedFile);

      const res = await fetch("/api/ai/video-generate", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const opName = data.operationName;
      
      // Poll
      const poll = async () => {
         const pollRes = await fetch("/api/ai/video-status", {
            method: "POST", headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: opName })
         });
         const pollData = await pollRes.json();
         if (!pollRes.ok) throw new Error(pollData.error);

         if (pollData.done) {
            // Initiate download/fetch of video blob
            const dnRes = await fetch("/api/ai/video-download", {
                method: "POST", headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ operationName: opName })
            });
            if (!dnRes.ok) throw new Error("Failed to download video");
            
            const blob = await dnRes.blob();
            setVideoUrl(URL.createObjectURL(blob));
            setLoading(false);
         } else {
            setTimeout(poll, 5000);
         }
      };

      poll();
    } catch(err: any) {
      toast.error(err.message || "Failed to generate video");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="mx-auto max-w-4xl opacity-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center mb-2 text-white">
            {animateMode ? <Video className="w-8 h-8 mr-3 text-red-500" /> : <Film className="w-8 h-8 mr-3 text-pink-500" />}
            {animateMode ? "Animate Image to Video" : "Generate Video from Text"}
          </h1>
          <p className="text-slate-400">Powered by Google Veo 3 Video AI.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
             {animateMode && (
                <div className="p-6 rounded-2xl glass border border-white/10 text-center">
                  <label className="block text-sm font-medium text-slate-300 mb-4 text-left">Starting Image (Optional for Text, Required for Animate)</label>
                  {previewUrl ? (
                    <div className="relative group rounded-xl overflow-hidden mb-4">
                      <img src={previewUrl} className="w-full h-48 object-cover" alt="Preview" />
                      <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="absolute m-2 top-0 right-0 bg-black/50 p-2 rounded-lg text-white hover:bg-black/80">Clear</button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 hover:bg-white/5 transition flex flex-col items-center justify-center h-48 cursor-pointer relative">
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-slate-400 text-sm">Click to upload image</span>
                      <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  )}
                </div>
             )}

             <div className="p-6 rounded-2xl glass border border-white/10 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
                 <textarea
                   value={prompt}
                   onChange={e => setPrompt(e.target.value)}
                   className="w-full bg-slate-800/80 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 h-32 resize-none"
                   placeholder="Describe what you want to see..."
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
                 <div className="flex gap-2">
                   {['16:9', '9:16'].map(ar => (
                     <button
                       key={ar}
                       onClick={() => setAspectRatio(ar)}
                       className={`px-4 py-2 rounded-lg text-sm font-medium transition ${aspectRatio === ar ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                     >
                       {ar}
                     </button>
                   ))}
                 </div>
               </div>

               <Button className="w-full mt-4 active-tab font-bold" size="lg" onClick={handleGenerate} isLoading={loading}>
                 {loading ? "Generating Video (This takes a few minutes)..." : "Generate Video"}
               </Button>
             </div>
          </div>

          <div className="h-[400px] lg:h-[600px] rounded-2xl glass border border-white/10 flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black/50">
             {loading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
                 <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                 <p className="text-slate-300 font-medium">Generating your video...</p>
                 <p className="text-slate-500 text-sm mt-2 text-center max-w-xs">Veo is processing your request. Please wait, this normally takes a few minutes.</p>
               </div>
             )}

             {videoUrl ? (
               <div className="w-full h-full flex flex-col overflow-hidden relative">
                   <video src={videoUrl} controls className="w-full h-full object-contain rounded-xl" autoPlay loop playsInline />
                   <a href={videoUrl} download="veo-video.mp4" className="absolute top-4 right-4 bg-black/50 p-2 rounded-xl text-white hover:bg-black/80 flex items-center transition">
                      <Download className="w-5 h-5" />
                   </a>
               </div>
             ) : (
                !loading && <div className="text-slate-500 flex flex-col items-center">
                  <Film className="w-16 h-16 mb-4 opacity-20" />
                  <p>Your generated video will appear here</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
