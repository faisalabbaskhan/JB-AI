import React from 'react';
import { Button } from './components/Button';
import { Code, Key } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from './store';

export function ApiPage() {
  const { user, openAuthModal } = useStore();

  const handleGenKey = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (user.plan !== 'Business') {
      toast.error('API access requires the Business plan.');
      return;
    }
    toast.success('New API Key Generated: sk_jbai_' + Math.random().toString(36).substring(2, 15));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const exampleJs = `const response = await fetch('https://api.jbai.com/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tool: 'generator',
    prompt: 'A futuristic city'
  })
});
const data = await response.json();`;

  const examplePy = `import requests

url = "https://api.jbai.com/v1/generate"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "tool": "generator",
    "prompt": "A futuristic city"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`;

  const examplePhp = `$ch = curl_init('https://api.jbai.com/v1/generate');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer YOUR_API_KEY',
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'tool' => 'generator',
    'prompt' => 'A futuristic city'
]));

$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);`;

  return (
    <div className="w-full pt-16 pb-32 bg-[#0B1120] min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-4xl font-bold text-white mb-6">API Documentation</h1>
        <p className="text-lg text-slate-400 mb-12">Integrate Joni Baba AI's state-of-the-art models directly into your applications.</p>
        
        <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8 mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-indigo-400" /> API Keys
              </h2>
              <p className="text-slate-400 text-sm mt-1">Generate a key to authenticate your requests. Requires Business plan.</p>
            </div>
            <Button onClick={handleGenKey} className="active-tab">Generate API Key</Button>
          </div>
        </div>

        <div className="space-y-12">
          <section>
            <h3 className="text-2xl font-semibold text-white mb-4">Authentication</h3>
            <p className="text-slate-400 mb-4">Pass your API key using the Bearer token scheme in the Authorization header.</p>
            <div className="p-4 bg-slate-900 border border-white/10 rounded-xl overflow-x-auto text-sm text-green-400 font-mono shadow-inner shadow-black/50">
              Authorization: Bearer YOUR_API_KEY
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-semibold text-white mb-4">Endpoints</h3>
            <div className="border border-white/10 rounded-xl overflow-hidden glass">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 font-medium text-slate-300">Method</th>
                    <th className="px-6 py-3 font-medium text-slate-300">Endpoint</th>
                    <th className="px-6 py-3 font-medium text-slate-300">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="px-6 py-4 font-mono text-indigo-400 font-bold drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">POST</td>
                    <td className="px-6 py-4 font-mono text-slate-300">/v1/generate</td>
                    <td className="px-6 py-4 text-slate-400">Generates images from text.</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-mono text-indigo-400 font-bold drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]">POST</td>
                    <td className="px-6 py-4 font-mono text-slate-300">/v1/edit</td>
                    <td className="px-6 py-4 text-slate-400">Edits images (enhance, upscale, etc).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-semibold text-white mb-4">Code Examples</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <h4 className="font-medium text-slate-300">JavaScript / Node.js</h4>
                  <Button variant="ghost" size="sm" onClick={() => copyCode(exampleJs)}>Copy</Button>
                </div>
                <div className="p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-900 border border-white/10 rounded-xl overflow-x-auto text-sm text-slate-300 font-mono whitespace-pre shadow-inner shadow-black/50">{exampleJs}</div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <h4 className="font-medium text-slate-300">Python</h4>
                  <Button variant="ghost" size="sm" onClick={() => copyCode(examplePy)}>Copy</Button>
                </div>
                <div className="p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-900 border border-white/10 rounded-xl overflow-x-auto text-sm text-slate-300 font-mono whitespace-pre shadow-inner shadow-black/50">{examplePy}</div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <h4 className="font-medium text-slate-300">PHP</h4>
                  <Button variant="ghost" size="sm" onClick={() => copyCode(examplePhp)}>Copy</Button>
                </div>
                <div className="p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-900 border border-white/10 rounded-xl overflow-x-auto text-sm text-slate-300 font-mono whitespace-pre shadow-inner shadow-black/50">{examplePhp}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
