import React, { useState, useRef } from 'react';
import { Button } from './components/Button';
import { Upload, Download, RefreshCw, X, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';
import { useStore } from './store';
import { toast } from 'sonner';

export function AiToolPage({ toolId, title, requireImage = true }: { toolId: string, title: string, requireImage?: boolean }) {
  const { user, updateCredits } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  // UI state for specific tools (e.g. upscaler factors, generation options)
  const [upscaleLevel, setUpscaleLevel] = useState('4x');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [quality, setQuality] = useState('fast');

  const handleProcess = async () => {
    if (requireImage && !file) {
      toast.error('Please upload an image first.');
      return;
    }
    if (!requireImage && !prompt) {
      toast.error('Please enter a prompt.');
      return;
    }

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('userId', user!.id);
    formData.append('tool', toolId);
    if (file) formData.append('image', file);
    if (prompt) formData.append('prompt', prompt);
    if (toolId === 'generator') {
      formData.append('aspectRatio', aspectRatio);
      formData.append('quality', quality);
      if (quality === 'pro') formData.append('imageSize', imageSize);
    }

    try {
      const res = await fetch('/api/ai/process', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setResult(data.image);
      updateCredits(data.credits);
      toast.success('Successfully processed!');
    } catch (e: any) {
      toast.error(e.message || 'Processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `jbai_${toolId}_result.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-slate-400 text-sm mt-1">Powered by Joni Baba AI Enterprise Models</p>
        </div>
        <div className="flex space-x-2">
           <div className="glass px-4 py-2 rounded-xl text-xs font-medium flex items-center space-x-2 text-white">
             <span>Advanced Model v4.2</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Controls Sidebar */}
        <div className="space-y-6 lg:col-span-1 order-2 lg:order-1">
          <div className="glass p-6 rounded-2xl flex flex-col space-y-4">
            <div className="flex items-center gap-2 mb-2 text-white font-medium">
              <SlidersHorizontal className="w-5 h-5" /> Generation Settings
            </div>

            {requireImage && (
              <div className="mb-4">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <Button variant="outline" className="w-full flex gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4" /> {file ? 'Change Image' : 'Upload Image'}
                </Button>
              </div>
            )}

            {(toolId === 'generator' || toolId === 'object-remover') && (
              <div className="mb-4 flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Prompt</span>
                <textarea 
                  className="bg-slate-800/50 border border-white/10 rounded-lg text-sm text-white p-3 resize-none focus:ring-0 placeholder:text-slate-600 h-24 scrollbar-hide"
                  placeholder={toolId === 'generator' ? "Describe the image you want to generate..." : "What object do you want to remove?"}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
              </div>
            )}

            {toolId === 'generator' && (
              <div className="mb-4 space-y-4">
                 <div className="flex flex-col w-full">
                  <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Quality</span>
                  <div className="flex gap-2">
                    {[{id: 'fast', label: 'Flash (Fast)'}, {id: 'pro', label: 'Pro (Studio)'}].map(q => (
                       <button 
                         key={q.id} 
                         onClick={() => setQuality(q.id)}
                         className={`flex-1 py-1.5 rounded border text-xs font-medium transition-colors ${quality === q.id ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                       >
                         {q.label}
                       </button>
                    ))}
                  </div>
                 </div>

                 <div className="flex flex-col w-full">
                  <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Ratio</span>
                  <div className="flex flex-wrap gap-1 w-full">
                    {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(ratio => (
                      <button 
                        key={ratio} 
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-2 py-1 rounded border text-[10px] flex items-center justify-center transition-colors ${aspectRatio === ratio ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                 </div>

                 {quality === 'pro' && (
                   <div className="flex flex-col w-full">
                    <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Size</span>
                    <div className="flex gap-2 w-full">
                      {['1K', '2K', '4K'].map(s => (
                        <button 
                          key={s} 
                          onClick={() => setImageSize(s)}
                          className={`flex-1 rounded border text-xs py-1 transition-colors ${imageSize === s ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                   </div>
                 )}
              </div>
            )}

            {toolId === 'upscaler' && (
              <div className="mb-4 flex flex-col w-full">
                <span className="text-[10px] text-slate-500 uppercase font-bold mb-1">Upscale Factor</span>
                <div className="grid grid-cols-3 gap-1 w-full">
                  {['2x', '4x', '8x'].map(level => (
                     <button 
                     key={level} 
                     onClick={() => setUpscaleLevel(level)}
                     className={`h-8 rounded border text-[10px] flex items-center justify-center transition-colors ${upscaleLevel === level ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                   >
                     {level}
                   </button>
                  ))}
                </div>
              </div>
            )}

            <Button 
              className="w-full mt-2" 
              onClick={handleProcess} 
              isLoading={loading}
              disabled={(requireImage && !file) || (!requireImage && !prompt)}
            >
              {loading ? 'Processing...' : 'Generate Result'}
            </Button>
          </div>
        </div>

        {/* Viewport */}
        <div className="lg:col-span-2 order-1 lg:order-2 space-y-6 flex flex-col min-h-[400px]">
          {(!requireImage && !result && !loading) && (
             <div className="flex-1 glass bg-transparent rounded-2xl flex flex-col items-center justify-center text-slate-500 min-h-[300px]">
               <ImageIcon className="w-12 h-12 mb-4 text-slate-600" />
               <p className="text-sm font-medium">Generated image will appear here</p>
             </div>
          )}

          {(!file && !result && requireImage) && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-slate-800/40 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-white/5 transition-colors min-h-[300px]"
            >
              <Upload className="w-12 h-12 mb-4 text-slate-600" />
              <p className="text-sm font-medium">Drag & drop or click to upload</p>
            </div>
          )}

          {(file || result || loading) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {requireImage && (
                <div className="glass bg-transparent rounded-2xl overflow-hidden relative aspect-square flex items-center justify-center min-h-[300px]">
                  {file ? (
                    <img src={previewUrl!} alt="Original" className="max-w-full max-h-full object-contain" />
                  ) : null}
                  <div className="absolute top-4 left-4 bg-black/60 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-md">Original</div>
                </div>
              )}
              
              <div className={`glass bg-transparent rounded-2xl overflow-hidden relative aspect-square flex items-center justify-center min-h-[300px] ${!requireImage ? 'md:col-span-2' : ''}`}>
                {loading ? (
                  <div className="flex flex-col items-center text-indigo-500">
                    <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                    <p className="font-medium animate-pulse text-sm">Running AI Models...</p>
                  </div>
                ) : result ? (
                  <>
                    <img src={result} alt="Result" className="max-w-full max-h-full object-contain" />
                     <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded backdrop-blur-md">Result</div>
                    <div className="absolute bottom-4 right-4 flex gap-2">
                       <Button size="sm" onClick={handleDownload}>
                         <Download className="w-4 h-4 mr-2" /> Download
                       </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500 text-sm">Waiting for generation...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
