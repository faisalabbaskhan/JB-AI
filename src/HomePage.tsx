import React from 'react';
import { Button } from './components/Button';
import { Sparkles, ArrowRight, Wand2, Image as ImageIcon, Sparkles as SparklesIcon, Zap, Scissors, RefreshCcw, Video, Film, Headphones, Music2, MessageSquare, FileSearch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from './store';

export function HomePage() {
  const navigate = useNavigate();
  const { user, openAuthModal } = useStore();

  const handleStart = () => {
    if (user) navigate('/dashboard');
    else openAuthModal('signup');
  };

  const tools = [
    {
      id: "generator",
      title: "AI Image Generator",
      desc: "Generate stunning art from text prompts, with size & aspect ratio control.",
      icon: <ImageIcon className="h-6 w-6 text-cyan-500" />,
      features: ["Realistic", "Cinematic", "1K/2K/4K", "Pro Mode"]
    },
    {
      id: "video-gen",
      title: "Generate Video from Text",
      desc: "Create amazing videos using the Veo 3 Video AI.",
      icon: <Film className="h-6 w-6 text-pink-500" />,
      features: ["1080p Resolution", "Aspect Ratios", "Photorealistic"]
    },
    {
      id: "video-animate",
      title: "Animate Image to Video",
      desc: "Upload a photo and bring it to life using Veo 3.",
      icon: <Video className="h-6 w-6 text-red-500" />,
      features: ["Starting Image", "Lifelike Motion", "Seamless"]
    },
    {
      id: "music-gen",
      title: "Generate Music",
      desc: "Create cinematic audio tracks and songs.",
      icon: <Music2 className="h-6 w-6 text-yellow-400" />,
      features: ["Lyria Clip", "Lyria Pro", "High Fidelity Audio"]
    },
    {
      id: "chat",
      title: "Gemini Chatbot",
      desc: "Chat with an advanced model using Thinking, Search & Maps Grounding.",
      icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
      features: ["Maps Grounding", "Search Grounding", "High Thinking", "Fast output"]
    },
    {
      id: "voice-chat",
      title: "Live Voice Chat",
      desc: "Have a real-time voice conversation with the Gemini Live API.",
      icon: <Headphones className="h-6 w-6 text-emerald-500" />,
      features: ["Real-time", "Low-latency", "Natural voices"]
    },
    {
      id: "analyze-media",
      title: "Analyze Media & Transcribe",
      desc: "Analyze video, images, or transcribe audio instantly.",
      icon: <FileSearch className="h-6 w-6 text-orange-500" />,
      features: ["Audio Transcription", "Video analysis", "Image understanding"]
    },
    {
      id: "background-remover",
      title: "AI Background Remover",
      desc: "Remove backgrounds with pixel-perfect precision.",
      icon: <Scissors className="h-6 w-6 text-indigo-500" />,
      features: ["Drag and drop", "PNG export", "Transparent background", "HD quality"]
    },
    {
      id: "enhancer",
      title: "AI Image Enhancer",
      desc: "Recover details, fix noise, and correct colors instantly.",
      icon: <Wand2 className="h-6 w-6 text-purple-500" />,
      features: ["Detail recovery", "Noise removal", "Color correction", "Sharpening"]
    },
    {
      id: "upscaler",
      title: "AI Upscaler",
      desc: "Upscale images by 2x, 4x, or 8x without quality loss.",
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      features: ["Maintain details", "Recover texture", "2x/4x/8x scale"]
    },
    {
      id: "object-remover",
      title: "AI Object Remover",
      desc: "Erase unwanted objects from any photo seamlessly.",
      icon: <SparklesIcon className="h-6 w-6 text-green-500" />,
      features: ["Brush tool", "Background reconstruction", "HD Output"]
    },
    {
      id: "restoration",
      title: "AI Photo Restoration",
      desc: "Bring old, damaged, or blurry photos back to life.",
      icon: <RefreshCcw className="h-6 w-6 text-rose-500" />,
      features: ["Old photos", "Damaged photos", "Blurry photos"]
    }
  ];

  return (
    <div className="w-full flex flex-col pt-16 bg-[#0B1120] relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-tight text-white sm:text-7xl">
              <span className="block text-indigo-400">Joni Baba AI</span>
              Create. Enhance. Transform.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-400">
              Remove backgrounds, enhance images, generate AI art, restore photos, upscale quality, and create professional visuals in seconds.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Button size="lg" className="rounded-full shadow-xl shadow-indigo-500/20 active-tab font-bold" onClick={handleStart}>
                Start Creating <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="secondary" className="rounded-full font-bold" onClick={() => navigate('/dashboard/generator')}>
                Try Free
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-24 bg-[#0F172A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">State-of-the-Art AI Tools</h2>
            <p className="mt-4 text-lg text-slate-400">Everything you need to create perfect visuals.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col overflow-hidden rounded-2xl glass transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div className="p-8 flex-1">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                    {tool.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-white">{tool.title}</h3>
                  <p className="mb-6 text-slate-400 text-sm">{tool.desc}</p>
                  <ul className="mb-6 space-y-2">
                    {tool.features.map(f => (
                      <li key={f} className="flex items-center text-sm text-slate-300">
                        <div className="mr-2 h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-white/5 bg-white/5 p-6">
                  <Button className="w-full" variant="outline" onClick={() => navigate(`/dashboard/${tool.id}`)}>
                    Open Tool
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
