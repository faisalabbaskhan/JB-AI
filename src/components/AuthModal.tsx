import React, { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { useStore } from '../store';
import { toast } from 'sonner';

export function AuthModal() {
  const { loginParams, closeAuthModal, openAuthModal, setUser } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const isLogin = loginParams.type === 'login';
  const isForgot = loginParams.type === 'forgot';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(s => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isForgot) {
        // Mock email reset
        await new Promise(r => setTimeout(r, 1000));
        toast.success("Password reset instructions sent to your email.");
        openAuthModal('login');
      } else {
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Authentication failed");
        }
        
        setUser(data.user);
        if (!isLogin && !isForgot) {
          toast.success("Account created! Please check your email to verify your account.");
        } else {
          toast.success(`Successfully ${isLogin ? 'logged in' : 'signed up'}!`);
        }
        closeAuthModal();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const title = isForgot ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account";

  return (
    <Modal isOpen={loginParams.open} onClose={closeAuthModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && !isForgot && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300">Name</label>
            <Input name="name" required placeholder="John Doe" value={formData.name} onChange={handleChange} />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Email</label>
          <Input name="email" type="email" required placeholder="you@example.com" value={formData.email} onChange={handleChange} />
        </div>
        {!isForgot && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">Password</label>
              {isLogin && (
                <button type="button" onClick={() => openAuthModal('forgot')} className="text-xs text-indigo-400 hover:underline">
                  Forgot?
                </button>
              )}
            </div>
            <Input name="password" type="password" required placeholder="••••••••" value={formData.password} onChange={handleChange} />
          </div>
        )}

        <Button type="submit" className="w-full mt-6 active-tab font-bold" isLoading={loading}>
          {isForgot ? "Send Reset Link" : isLogin ? "Sign In" : "Sign Up"}
        </Button>

        <div className="text-center text-sm text-slate-400 mt-4">
          {isForgot ? (
             <button type="button" onClick={() => openAuthModal('login')} className="text-indigo-400 hover:underline font-medium">Back to Login</button>
          ) : isLogin ? (
            <>Don't have an account? <button type="button" onClick={() => openAuthModal('signup')} className="text-indigo-400 hover:underline font-medium">Sign up</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => openAuthModal('login')} className="text-indigo-400 hover:underline font-medium">Sign in</button></>
          )}
        </div>
      </form>
    </Modal>
  );
}
