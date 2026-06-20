import React, { useEffect, useState } from 'react';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { Review } from './types';

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', text: '', rating: 5 });

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.text) return;
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to submit");
      const data = await res.json();
      setReviews([...reviews, data.review]);
      toast.success("Review submitted!");
      setFormData({ name: '', text: '', rating: 5 });
    } catch (e: any) {
      toast.error(e.message || "Failed to submit review");
    }
  };

  return (
    <div className="w-full pt-16 pb-32 bg-[#0B1120] min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">Verified Customer Reviews</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {loading ? (
             <p className="text-center col-span-2 text-slate-500">Loading reviews...</p>
          ) : reviews.length === 0 ? (
             <p className="text-center col-span-2 text-slate-500">No reviews yet. Be the first!</p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="glass p-6 rounded-2xl shadow-sm">
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-current text-yellow-400' : 'text-slate-700'}`} />
                  ))}
                </div>
                <p className="text-slate-300 italic mb-4">"{r.text}"</p>
                <div className="text-sm font-medium text-white">- {r.name}</div>
              </div>
            ))
          )}
        </div>

        <div className="glass p-8 rounded-2xl max-w-2xl mx-auto shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl font-semibold mb-6 text-white text-center relative z-10">Submit a Review</h2>
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                   <button type="button" key={star} onClick={() => setFormData({...formData, rating: star})}>
                     <Star className={`h-6 w-6 transition-colors ${star <= formData.rating ? 'fill-current text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-slate-700 hover:text-yellow-500'}`} />
                   </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Your Name</label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Jane Doe" required className="bg-white/5 border-white/10 text-white placeholder:text-slate-600" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-1 block">Testimonial</label>
              <textarea 
                className="flex w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-white min-h-[100px]"
                value={formData.text} 
                onChange={e => setFormData({...formData, text: e.target.value})} 
                placeholder="How did Joni Baba AI help you?" 
                required 
              />
            </div>
            <Button type="submit" className="w-full active-tab border border-transparent font-bold">Submit Review</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
