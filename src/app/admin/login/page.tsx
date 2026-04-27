'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, ArrowRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        toast.success('Welcome Back!');
        router.push('/admin');
        router.refresh();
      } else {
        toast.error('Galt Details! Try again.');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100vh', 
      backgroundColor: '#000', 
      overflow: 'hidden',
      fontFamily: 'sans-serif' 
    }}>
      
      {/* BACKGROUND IMAGE - Fixed/Absolute Layer */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 1 
      }}>
        <img 
          src="/imgs/auth-bg.png" 
          alt="Background" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover', 
            opacity: 0.75 
          }} 
        />
        {/* Darkened Overlay */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)' 
        }} />
      </div>

      {/* LOGIN CARD - Manually Centered with Absolute Positioning */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)', 
        zIndex: 10,
        width: '90%',
        maxWidth: '440px'
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: 'rgba(20, 20, 20, 0.85)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '35px',
            padding: '50px 40px',
            boxShadow: '0 50px 150px rgba(0,0,0,0.8)',
            borderTop: '5px solid #FFD700'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '25px' }}>
              <div style={{ backgroundColor: '#FFD700', padding: '8px', borderRadius: '8px', display: 'flex' }}>
                <ShieldCheck size={24} color="black" />
              </div>
              <span style={{ fontSize: '10px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '4px' }}>Control Portal</span>
            </div>
            
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: 'white', margin: 0, lineHeight: '1.1', letterSpacing: '-1px', textTransform: 'uppercase' }}>
              SHREE SAI <br/>
              <span style={{ color: '#FFD700' }}>BOREWELL & JCB</span>
            </h1>
            <p style={{ color: '#666', fontSize: '12px', marginTop: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px' }}>Operational Access Only</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: '2px', marginLeft: '5px' }}>Operator ID</label>
              <input
                name="username"
                type="text"
                required
                placeholder="Username"
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: '800', color: '#555', textTransform: 'uppercase', letterSpacing: '2px', marginLeft: '5px' }}>Access Key</label>
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#FFD700',
                color: 'black',
                fontWeight: '900',
                padding: '20px',
                borderRadius: '16px',
                border: 'none',
                marginTop: '15px',
                cursor: 'pointer',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                boxShadow: '0 15px 30px rgba(255, 215, 0, 0.2)'
              }}
            >
              {loading ? 'Validating...' : 'Authorize Login'}
            </button>
          </form>

          <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase' }}>SSL CORE v4.2</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
