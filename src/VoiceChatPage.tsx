import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Headphones, Loader2, Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';

export function VoiceChatPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef(0);

  // PCM encoding helper
  const pcmToBase64 = (channelData: Float32Array) => {
    const pcm = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
       const s = Math.max(-1, Math.min(1, channelData[i]));
       pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const buffer = new ArrayBuffer(pcm.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < pcm.length; i++) {
       view.setInt16(i * 2, pcm[i], true); // little-endian
    }
    
    // Quick base64 encode for ArrayBuffer
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const playAudioChunk = (ctx: AudioContext, base64Audio: string) => {
     try {
         const binaryString = window.atob(base64Audio);
         const bytes = new Uint8Array(binaryString.length);
         for (let i = 0; i < binaryString.length; i++) {
             bytes[i] = binaryString.charCodeAt(i);
         }
         
         const audioData = new Int16Array(bytes.buffer);
         const buffer = ctx.createBuffer(1, audioData.length, 24000); // 24kHz output
         const channelData = buffer.getChannelData(0);
         for (let i = 0; i < audioData.length; i++) {
             channelData[i] = audioData[i] / 32768.0;
         }

         const source = ctx.createBufferSource();
         source.buffer = buffer;
         source.connect(ctx.destination);
         
         if (nextStartTimeRef.current < ctx.currentTime) {
             nextStartTimeRef.current = ctx.currentTime;
         }
         source.start(nextStartTimeRef.current);
         nextStartTimeRef.current += buffer.duration;
         
         // Visualizer hook could go here if we tracked playback
     } catch (err) {
         console.error("Audio playback error", err);
     }
  };

  const connect = async () => {
     setIsConnecting(true);
     try {
       const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
       const wsUrl = `${protocol}//${window.location.host}/live`;
       const ws = new WebSocket(wsUrl);
       wsRef.current = ws;

       const inputAudioCtx = new window.AudioContext({ sampleRate: 16000 });
       inputAudioCtxRef.current = inputAudioCtx;
       const outputAudioCtx = new window.AudioContext({ sampleRate: 24000 });
       outputAudioCtxRef.current = outputAudioCtx;

       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
       mediaStreamRef.current = stream;

       const source = inputAudioCtx.createMediaStreamSource(stream);
       const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
       processorRef.current = processor;

       source.connect(processor);
       processor.connect(inputAudioCtx.destination);

       processor.onaudioprocess = (e) => {
         // calculate mic volume level for visualizer
         const inputData = e.inputBuffer.getChannelData(0);
         let sum = 0;
         for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
         const rms = Math.sqrt(sum / inputData.length);
         setAudioLevel(Math.min(100, Math.max(0, rms * 500)));

         if (!isMuted && ws.readyState === WebSocket.OPEN) {
            const base64 = pcmToBase64(inputData);
            ws.send(JSON.stringify({ audio: base64 }));
         }
       };

       ws.onopen = () => {
         setIsConnected(true);
         setIsConnecting(false);
         toast.success("Connected to Gemini Live");
       };

       ws.onmessage = (event) => {
         const msg = JSON.parse(event.data);
         if (msg.audio) {
            playAudioChunk(outputAudioCtx, msg.audio);
         }
         if (msg.interrupted) {
            nextStartTimeRef.current = outputAudioCtx.currentTime;
         }
       };

       ws.onclose = () => {
         disconnect();
         toast("Disconnected from voice chat");
       };

     } catch(err: any) {
        toast.error("Failed to start voice chat: " + err.message);
        setIsConnecting(false);
        disconnect();
     }
  };

  const disconnect = useCallback(() => {
     if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
     }
     if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
     }
     if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
     }
     if (inputAudioCtxRef.current) {
        inputAudioCtxRef.current.close();
        inputAudioCtxRef.current = null;
     }
     if (outputAudioCtxRef.current) {
        outputAudioCtxRef.current.close();
        outputAudioCtxRef.current = null;
     }
     setIsConnected(false);
     setIsConnecting(false);
  }, []);

  useEffect(() => {
     return () => disconnect();
  }, [disconnect]);

  const toggleMute = () => {
     setIsMuted(!isMuted);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="mx-auto max-w-2xl text-center opacity-100 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-bold flex items-center justify-center mb-4 text-white">
            <Headphones className="w-10 h-10 mr-4 text-emerald-500" />
            Live Voice Chat
          </h1>
          <p className="text-xl text-slate-400">Have a real-time conversation directly with Gemini.</p>
        </div>

        <div className="p-12 rounded-3xl glass border border-white/10 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden bg-gradient-to-b from-slate-900/50 to-emerald-900/10">
           
           {!isConnected && !isConnecting && (
              <div className="flex flex-col items-center relative z-10">
                 <div className="w-32 h-32 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
                    <Mic className="w-12 h-12 text-emerald-400" />
                 </div>
                 <button onClick={connect} className="bg-emerald-500 text-white rounded-full px-8 py-4 text-lg font-bold shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:scale-105">
                    Start Conversation
                 </button>
              </div>
           )}

           {isConnecting && (
              <div className="flex flex-col items-center relative z-10">
                 <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mb-6" />
                 <p className="text-emerald-400 font-medium text-lg">Connecting via WebSocket...</p>
              </div>
           )}

           {isConnected && (
              <div className="flex flex-col items-center w-full relative z-10">
                 {/* Visualizer Ring */}
                 <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
                    <div 
                       className="absolute inset-0 rounded-full bg-emerald-500/20 mix-blend-screen transition-transform duration-75"
                       style={{ transform: `scale(${1 + (audioLevel / 100) * 0.5})` }}
                    />
                    <div 
                       className="absolute inset-4 rounded-full bg-emerald-500/40 mix-blend-screen transition-transform duration-75"
                       style={{ transform: `scale(${1 + (audioLevel / 100) * 0.8})` }}
                    />
                    <div className="relative z-10 w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                       <Headphones className="w-10 h-10 text-white" />
                    </div>
                 </div>

                 <div className="text-emerald-400 font-medium text-lg tracking-widest uppercase mb-12 animate-pulse">
                    Session Active
                 </div>
                 
                 <div className="flex items-center gap-6">
                    <button 
                       onClick={toggleMute} 
                       className={`w-16 h-16 rounded-full flex items-center justify-center transition shadow-lg ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700'}`}
                    >
                       {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    
                    <button onClick={disconnect} className="bg-red-500 text-white rounded-full px-8 py-4 font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition">
                       End Call
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
