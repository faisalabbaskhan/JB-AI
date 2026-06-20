import React, { useState } from 'react';
import { Button } from './components/Button';
import { FileSearch, Upload, Loader2, FileAudio, Video, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export function MediaAnalysisPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
       toast.error("Please provide a media file");
       return;
    }

    setLoading(true);
    setResult(null);
    try {
      const isAudio = selectedFile.type.startsWith('audio/');
      const formData = new FormData();
      formData.append("prompt", prompt || (isAudio ? "Transcribe this audio" : "Analyze this media file."));
      formData.append("media", selectedFile);
      formData.append("asAudio", String(isAudio));

      const res = await fetch("/api/ai/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data.result);
    } catch(err: any) {
      toast.error(err.message || "Failed to analyze media");
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (!selectedFile || !previewUrl) return null;
    if (selectedFile.type.startsWith('image/')) {
       return <img src={previewUrl} className="w-full h-48 object-cover rounded-xl" alt="Preview" />;
    } else if (selectedFile.type.startsWith('video/')) {
       return <video src={previewUrl} className="w-full h-48 object-cover rounded-xl" controls />;
    } else if (selectedFile.type.startsWith('audio/')) {
       return (
         <div className="w-full h-48 rounded-xl bg-slate-800/80 flex flex-col items-center justify-center p-4">
            <FileAudio className="w-12 h-12 text-indigo-400 mb-4" />
            <audio src={previewUrl} controls className="w-full" />
         </div>
       );
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
      <div className="mx-auto max-w-4xl opacity-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center mb-2 text-white">
            <FileSearch className="w-8 h-8 mr-3 text-orange-500" />
            Analyze Media
          </h1>
          <p className="text-slate-400">Transcribe audio, analyze video, and understand images.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
             <div className="p-6 rounded-2xl glass border border-white/10 text-center">
               <label className="block text-sm font-medium text-slate-300 mb-4 text-left">Media File</label>
               {previewUrl ? (
                 <div className="relative group mb-4">
                   {renderPreview()}
                   <button onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="absolute m-2 top-0 right-0 bg-black/50 p-2 rounded-lg text-white hover:bg-black/80">Clear</button>
                 </div>
               ) : (
                 <div className="border-2 border-dashed border-white/10 rounded-xl p-8 hover:bg-white/5 transition flex flex-col items-center justify-center h-48 cursor-pointer relative">
                   <Upload className="h-8 w-8 text-slate-400 mb-2" />
                   <span className="text-slate-400 text-sm">Upload Image, Video, or Audio</span>
                   <input type="file" accept="image/*,video/*,audio/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                 </div>
               )}
             </div>

             <div className="p-6 rounded-2xl glass border border-white/10 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Instructions (Optional)</label>
                 <textarea
                   value={prompt}
                   onChange={e => setPrompt(e.target.value)}
                   className="w-full bg-slate-800/80 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 h-24 resize-none"
                   placeholder="e.g., 'Transcribe this meeting', or 'What is happening in this video?'"
                 />
               </div>

               <Button className="w-full active-tab font-bold" size="lg" onClick={handleAnalyze} isLoading={loading}>
                 Analyze File
               </Button>
             </div>
          </div>

          <div className="h-[400px] lg:h-[600px] rounded-2xl glass border border-white/10 flex flex-col p-6 relative overflow-hidden bg-black/50">
             {loading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-10">
                 <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                 <p className="text-slate-300 font-medium">Analyzing media...</p>
               </div>
             )}

             {result ? (
               <div className="w-full h-full flex flex-col">
                  <h3 className="text-lg font-medium text-white mb-4">Results</h3>
                  <div className="flex-1 overflow-y-auto bg-slate-800/50 rounded-xl p-4 border border-white/5">
                     <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap">
                        {result}
                     </div>
                  </div>
               </div>
             ) : (
                !loading && <div className="text-slate-500 flex flex-col items-center justify-center h-full">
                  <div className="flex gap-4 opacity-30 mb-4">
                     <ImageIcon className="w-8 h-8" />
                     <Video className="w-8 h-8" />
                     <FileAudio className="w-8 h-8" />
                  </div>
                  <p>Analysis and transcription will appear here</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
