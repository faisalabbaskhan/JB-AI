import React, { useState, useRef, useEffect } from 'react';
import { Button } from './components/Button';
import { MessageSquare, Send, Bot, User, Map, Search, Brain, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'model';
  content: string;
  thoughts?: string;
}

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Options
  const [modelConfig, setModelConfig] = useState('gemini-3.1-flash-preview');
  const [enableThinking, setEnableThinking] = useState(false);
  const [enableMaps, setEnableMaps] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Build previous messages to pass to interactions API? Wait, the interactions API `previous_interaction_id` is the preferred way to chain, but we aren't storing interaction IDs in state here just yet. For simplicity, we can pass all previous context as part of the `input` String if it's text, or let's just make it single-turn visually chained. Let's merge history into the input string so it has context.
      
      let contextStr = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      contextStr += `\nuser: ${userMsg}\n`;

      const res = await fetch("/api/ai/chat", {
        method: "POST", headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           inputs: contextStr,
           modelConfig,
           enableThinking,
           enableMaps,
           enableSearch
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'model', content: data.text, thoughts: data.thoughts }]);

    } catch(err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B1120]">
      {/* Header */}
      <div className="p-4 sm:px-8 border-b border-white/10 glass bg-white/5 flex items-center justify-between shrink-0 z-10">
         <div className="flex items-center">
            <MessageSquare className="w-6 h-6 text-blue-500 mr-3" />
            <h1 className="text-xl font-bold text-white">Gemini Chatbot</h1>
         </div>
         <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <select 
               value={modelConfig} 
               onChange={e => setModelConfig(e.target.value)}
               className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
               <option value="gemini-3.1-flash-preview">Gemini 3.1 Flash (General)</option>
               <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex)</option>
               <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
            </select>
            
            <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-white/10 hidden sm:flex">
               <button onClick={() => setEnableSearch(!enableSearch)} className={`p-1.5 rounded-md transition ${enableSearch ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`} title="Google Search Grounding">
                  <Search className="w-4 h-4" />
               </button>
               <button onClick={() => setEnableMaps(!enableMaps)} className={`p-1.5 rounded-md transition ${enableMaps ? 'bg-green-500/20 text-green-400' : 'text-slate-500 hover:text-slate-300'}`} title="Google Maps Grounding">
                  <Map className="w-4 h-4" />
               </button>
               <button onClick={() => setEnableThinking(!enableThinking)} className={`p-1.5 rounded-md transition ${enableThinking ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`} title="High Thinking Mode">
                  <Brain className="w-4 h-4" />
               </button>
            </div>
         </div>
      </div>

      {/* Mobile Tools Config */}
      <div className="sm:hidden flex items-center justify-around p-2 border-b border-white/10 bg-slate-900/50 shrink-0">
         <button onClick={() => setEnableSearch(!enableSearch)} className={`flex items-center gap-1 p-2 rounded-md transition text-xs font-medium ${enableSearch ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500'}`}>
            <Search className="w-3 h-3" /> Search
         </button>
         <button onClick={() => setEnableMaps(!enableMaps)} className={`flex items-center gap-1 p-2 rounded-md transition text-xs font-medium ${enableMaps ? 'bg-green-500/20 text-green-400' : 'text-slate-500'}`}>
            <Map className="w-3 h-3" /> Maps
         </button>
         <button onClick={() => setEnableThinking(!enableThinking)} className={`flex items-center gap-1 p-2 rounded-md transition text-xs font-medium ${enableThinking ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500'}`}>
            <Brain className="w-3 h-3" /> Thinking
         </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
         <div className="w-full max-w-3xl flex flex-col space-y-6">
            {messages.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 my-20">
                  <Bot className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg mb-2">How can I help you today?</p>
                  <p className="text-sm opacity-60 text-center max-w-sm">Use the tools above to enable live search grounding, maps integration, or high thinking mode.</p>
               </div>
            )}
            
            {messages.map((msg, i) => (
               <div key={i} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                     <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-500 ml-3' : 'bg-blue-600 mr-3'}`}>
                        {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                     </div>
                     <div className="flex flex-col">
                        {msg.thoughts && (
                           <div className="mb-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                             <div className="flex items-center text-purple-400 text-xs font-bold mb-1 uppercase tracking-wider">
                                <Brain className="w-3 h-3 mr-1" /> Agent Thoughts
                             </div>
                             <pre className="text-sm text-purple-300/80 whitespace-pre-wrap font-sans">{msg.thoughts}</pre>
                           </div>
                        )}
                        <div className={`p-4 rounded-2xl text-sm sm:text-base shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-sm'}`}>
                           <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
            
            {loading && (
               <div className="flex w-full justify-start">
                  <div className="flex">
                     <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 mr-3">
                        <Bot className="w-4 h-4 text-white" />
                     </div>
                     <div className="bg-slate-800 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex items-center shadow-sm">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                     </div>
                  </div>
               </div>
            )}
            <div ref={endOfMessagesRef} />
         </div>
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-slate-900 border-t border-white/10 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
         <div className="mx-auto max-w-3xl relative flex items-center">
            <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
               placeholder="Type a message..."
               className="w-full bg-black/40 border border-white/10 rounded-full py-4 pl-6 pr-14 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-inner"
            />
            <button 
               onClick={handleSend}
               disabled={!input.trim() || loading}
               className="absolute right-2 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white disabled:opacity-50 disabled:bg-slate-700 transition shadow-md"
            >
               <Send className="w-4 h-4 ml-0.5" />
            </button>
         </div>
      </div>
    </div>
  );
}
