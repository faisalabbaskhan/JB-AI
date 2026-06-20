import React from 'react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="w-full py-6 bg-transparent flex justify-center items-center border-t border-white/5">
      <Button variant="ghost" className="text-xs font-semibold tracking-widest uppercase text-slate-500 hover:text-cyan-400" onClick={() => navigate('/reviews')}>
        Reviews
      </Button>
    </footer>
  );
}
