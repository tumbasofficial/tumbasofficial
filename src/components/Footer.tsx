'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false); // Pengaman Hydration

  useEffect(() => {
    setMounted(true); // Tandai browser sudah siap

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Jika browser belum siap, render footer polosan dulu agar server tidak crash
  if (!mounted) {
    return (
      <footer style={{ background: '#1F2A44', padding: '30px 20px', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#FFF' }}>TUMBAS STORE</p>
      </footer>
    );
  }

  return (
    <footer style={{ 
      background: '#1F2A44', 
      borderTop: '2px solid #C6A75E', 
      padding: isMobile ? '30px 20px' : '40px 40px', 
      fontFamily: 'sans-serif',
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        textAlign: isMobile ? 'center' : 'left', 
        gap: isMobile ? '20px' : '30px'
      }}>
        
        {/* Sisi Kiri: Hak Cipta */}
        <div>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#FFF', letterSpacing: '2px' }}>
            TUM<span style={{ color: '#C6A75E' }}>BAS</span> STORE
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#E8DCC8', opacity: 0.6 }}>
            © {new Date().getFullYear()} Tumbas Store. All Rights Reserved.
          </p>
        </div>
        
        {/* Sisi Kanan: Menu */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: isMobile ? '12px' : '25px', 
          alignItems: 'center',
          fontSize: '12px' 
        }}>
          <span style={{ color: '#E8DCC8', opacity: 0.8 }}>Syarat & Ketentuan</span>
          <span style={{ color: '#E8DCC8', opacity: 0.8 }}>Mitra Pengrajin</span>
          
          <Link href="/admin" style={{
            color: '#C6A75E', 
            opacity: 0.5,     
            textDecoration: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            System Management
          </Link>
        </div>

      </div>
    </footer>
  );
}