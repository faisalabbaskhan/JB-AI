import React, { useState } from 'react';
import { Button } from './components/Button';
import { Check } from 'lucide-react';
import { useStore } from './store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function PricingPage() {
  const { user, updatePlan, openAuthModal } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      desc: 'Perfect to try out the AI tools.',
      features: ['10 credits daily', 'Standard quality', 'Normal processing speed'],
      buttonText: user?.plan === 'Free' ? 'Current Plan' : 'Get Started',
      action: () => {}
    },
    {
      name: 'Pro',
      price: '$19',
      period: '/month',
      desc: 'For professional creators.',
      features: ['Unlimited credits', 'HD quality', 'Fast processing speed', 'Commercial use'],
      buttonText: user?.plan === 'Pro' ? 'Current Plan' : 'Upgrade to Pro',
      action: async () => await handleUpgrade('Pro')
    },
    {
      name: 'Business',
      price: '$49',
      period: '/month',
      desc: 'For teams and high-volume needs.',
      features: ['Everything in Pro', 'Unlimited Ultra HD', 'API Access', 'Dedicated Support'],
      buttonText: user?.plan === 'Business' ? 'Current Plan' : 'Upgrade to Business',
      action: async () => await handleUpgrade('Business')
    }
  ];

  const handleUpgrade = async (plan: string) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (user.plan === plan) return;

    setLoading(plan);
    try {
      const res = await fetch('/api/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, plan })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updatePlan(data.user.plan);
      toast.success(`Successfully upgraded to ${plan} plan!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to upgrade");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="w-full pt-20 pb-32 bg-[#0B1120] min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Simple, transparent pricing</h1>
          <p className="mt-4 text-lg text-slate-400">Choose the perfect plan for your creative needs.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative flex flex-col p-8 rounded-3xl ${plan.name === 'Pro' ? 'bg-indigo-900/20 border border-indigo-500 shadow-xl shadow-indigo-500/20' : 'glass border border-white/10'} `}>
              {plan.name === 'Pro' && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-lg">Most Popular</span>
                </div>
              )}
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-2 text-sm text-slate-400 min-h-[40px]">{plan.desc}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-white">{plan.price}</span>
                <span className="text-sm font-medium text-slate-500">{plan.period}</span>
              </div>
              
              <ul className="mt-8 space-y-4 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex gap-3 text-sm text-slate-300 items-center">
                    <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`mt-8 w-full ${plan.name === 'Pro' ? 'shadow-lg shadow-indigo-500/20 font-bold active-tab' : ''}`}
                variant={plan.name === 'Pro' ? 'primary' : 'outline'}
                disabled={user?.plan === plan.name}
                isLoading={loading === plan.name}
                onClick={plan.action}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
