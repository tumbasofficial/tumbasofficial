'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  // Masukkan default state aman tanpa menyentuh window langsung saat inisialisasi
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  
  const context = useCart();
  const jumlahKeranjang = context ? context.getCartCount() : 0;

  useEffect(() => {
    // Tandai bahwa komponen sudah terpasang sempurna di browser (Client-side)
    setMounted(true);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize(); // Jalankan deteksi ukuran pertama kali
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Jika belum fully mounted di browser, tampilkan versi dasar dulu untuk mencegah Hydration Error
  if (!mounted) {
    return (
      <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: '#FFF', borderBottom: '1px solid rgba(198, 167, 94, 0.25)' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
          <span style={{ fontWeight: '800', color: '#1F2A44', fontFamily: 'serif', letterSpacing: '6px' }}>TUMBAS</span>
        </nav>
      </header>
    );
  }

  return (
    <header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      backdropFilter: 'blur(12px)',
      background: 'rgba(255, 255, 255, 0.85)',
      borderBottom: '1px solid rgba(198, 167, 94, 0.25)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.02)'
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isMobile ? '15px 12px' : '20px 40px', // Jauh lebih presisi di HP lebar sempit
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: 'sans-serif'
      }}>
        
        {/* --- LOGO IDENTITAS TARUMAYA --- */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px' }}>
          <span style={{
            fontFamily: 'serif',
            fontSize: isMobile ? '14px' : '20px', 
            fontWeight: 'bold',
            color: '#FFF',
            background: '#1F2A44',
            width: isMobile ? '24px' : '32px',
            height: isMobile ? '24px' : '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: '1px solid #C6A75E',
          }}>
            ₸
          </span>
          
          <span style={{ 
            fontSize: isMobile ? '13px' : '22px', 
            fontWeight: '800', 
            fontFamily: '"Playfair Display", "Georgia", serif', 
            letterSpacing: isMobile ? '2px' : '6px', 
            background: 'linear-gradient(135deg, #C6A75E 0%, #E8DCC8 50%, #9A7B1C 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            UMBAS
          </span>
        </Link>

        {/* Menu Navigasi Jauh Lebih Rapat & Minimalis jika di HP */}
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '8px' : '30px', 
          alignItems: 'center' 
        }}>
          <Link href="/" style={{ color: '#1F2A44', textDecoration: 'none', fontSize: isMobile ? '11px' : '13px', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: '600' }}>
            Home
          </Link>
          <Link href="/produk" style={{ color: '#1F2A44', textDecoration: 'none', fontSize: isMobile ? '11px' : '13px', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: '600' }}>
            Produk
          </Link>
          <Link href="/tentang" style={{ color: '#1F2A44', textDecoration: 'none', fontSize: isMobile ? '11px' : '13px', letterSpacing: '0.5px', textTransform: 'uppercase', fontWeight: '600' }}>
            Tentang
          </Link>

          {/* Tombol Keranjang Mini */}
          <Link href="/keranjang" style={{ 
            color: '#1F2A44', 
            textDecoration: 'none', 
            fontSize: isMobile ? '11px' : '13px', 
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(31, 42, 68, 0.05)',
            padding: isMobile ? '4px 6px' : '6px 14px', 
            borderRadius: '20px',
            border: '1px solid rgba(31, 42, 68, 0.1)'
          }}>
            🛒 {!isMobile && 'Cart'} 
            {jumlahKeranjang > 0 && (
              <span style={{
                background: '#dc3545',
                color: '#FFF',
                fontSize: '10px',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {jumlahKeranjang}
              </span>
            )}
          </Link>
        </div>
        
      </nav>
    </header>
  );
}