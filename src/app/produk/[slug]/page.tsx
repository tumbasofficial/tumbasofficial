'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { notFound } from 'next/navigation';
import { useCart } from '../../../context/CartContext';
import Link from 'next/link';

interface Produk {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  images: string[];
}

export default function HalamanDetailProduk({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const { addToCart } = useCart();
  
  const [produk, setProduk] = useState<Produk | null>(null);
  const [nomorWA, setNomorWA] = useState<string>('6281234567890');
  const [loading, setLoading] = useState<boolean>(true);
  
  // State menampung catatan pembeli
  const [catatan, setCatatan] = useState<string>('');

  // Pengaman Deteksi HP & Hydration Error
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true); // Browser sudah siap

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Ambil Data Produk & WhatsApp Toko
  useEffect(() => {
    async function ambilData() {
      setLoading(true);
      const [resProduk, resSetting] = await Promise.all([
        supabase.from('products').select('*').eq('slug', params.slug).single(),
        supabase.from('toko_settings').select('whatsapp_number').eq('id', 'utama').single()
      ]);

      if (!resProduk.error && resProduk.data) {
        setProduk(resProduk.data as Produk);
      }
      if (!resSetting.error && resSetting.data?.whatsapp_number) {
        setNomorWA(resSetting.data.whatsapp_number);
      }
      setLoading(false);
    }
    ambilData();
  }, [params.slug]);

  // Cegah blank dengan tampilan memuat
  if (!mounted || loading) {
    return (
      <div style={{ background: '#E8DCC8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#1F2A44' }}>
        <p style={{ fontWeight: '500' }}>Memuat detail produk...</p>
      </div>
    );
  }

  if (!produk) {
    notFound();
  }

  const tanganiTambahKeranjang = () => {
    if (produk.stock <= 0) {
      alert('⚠️ Maaf, produk ini sedang habis sehingga tidak bisa dimasukkan ke keranjang.');
      return;
    }
    
    addToCart({
      id: produk.id,
      name: produk.name,
      slug: produk.slug,
      price: produk.price,
      category: produk.category,
      image: produk.images && produk.images.length > 0 ? produk.images[0] : 'https://via.placeholder.com/300',
      stock: produk.stock,
      notes: catatan
    });
    alert('🛒 Produk berhasil ditambahkan ke keranjang belanja Anda!');
  };

  const tanganiBeliLangsung = () => {
    if (produk.stock <= 0) {
      alert('⚠️ Maaf, produk ini sedang habis.');
      return;
    }

    // Menyusun teks Catatan Pembeli tanpa format bold (*)
    const teksCatatan = catatan.trim() !== '' ? `\nCatatan Pembeli: ${catatan}` : '';
    const teksPengiriman = '\nPengiriman: (ketik metode pengirimanmu ya)';
    
    const teksWhatsApp = encodeURIComponent(
      `Halo TUMBAS STORE, saya ingin beli langsung produk ini:\n\nNama: ${produk.name}\nKategori: ${produk.category}\nHarga: Rp ${Number(produk.price).toLocaleString('id-ID')}${teksPengiriman}${teksCatatan}\n\nApakah siap kirim hari ini?`
    );
    window.open(`https://wa.me/${nomorWA}?text=${teksWhatsApp}`, '_blank');
  };

  return (
    <div style={{ 
      background: '#E8DCC8', 
      minHeight: '100vh', 
      padding: isMobile ? '20px 10px' : '40px 20px', 
      fontFamily: 'sans-serif', 
      color: '#1F2A44' 
    }}>
      <div style={{ 
        maxWidth: '950px', 
        margin: '10px auto', 
        background: '#FFF', 
        padding: isMobile ? '20px' : '35px', 
        borderRadius: '16px', 
        border: '1px solid rgba(198, 167, 94, 0.25)', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)' 
      }}>
        
        {/* Tombol Kembali */}
        <div style={{ marginBottom: '25px' }}>
          <Link href="/produk" style={{ textDecoration: 'none', color: '#1F2A44', fontSize: '14px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            ⬅ Kembali ke Katalog
          </Link>
        </div>

        {/* Layout Detail */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: isMobile ? '25px' : '40px' 
        }}>
          
          {/* Gambar Produk */}
          <div style={{ 
            flex: '1', 
            width: '100%',
            aspectRatio: '1/1',
            backgroundColor: '#fcfaf7', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: '12px', 
            overflow: 'hidden', 
            border: '1px solid #f3ece2',
            alignSelf: 'flex-start'
          }}>
            {produk.images && produk.images.length > 0 ? (
              <img src={produk.images[0]} alt={produk.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: '#ccc', fontSize: '14px' }}>Tidak ada gambar</span>
            )}
          </div>

          {/* Informasi Produk */}
          <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column' }}>
            
            <span style={{ color: '#C6A75E', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              {produk.category || 'Umum'}
            </span>
            
            <h1 style={{ margin: '10px 0 6px 0', fontSize: isMobile ? '22px' : '28px', color: '#1F2A44', fontWeight: 'bold', fontFamily: 'serif', lineHeight: '1.3' }}>
              {produk.name}
            </h1>
            
            <h2 style={{ color: '#C6A75E', margin: '0 0 12px 0', fontSize: '24px', fontWeight: 'bold' }}>
              <span style={{ fontSize: '16px', marginRight: '2px', fontWeight: '600' }}>Rp</span>
              {Number(produk.price).toLocaleString('id-ID')}
            </h2>
            
            <p style={{ fontSize: '13px', color: produk.stock > 0 ? '#137333' : '#c5221f', fontWeight: 'bold', margin: '0 0 15px 0', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {produk.stock > 0 ? `🟢 Stok Tersedia: ${produk.stock} pcs` : '🔴 Stok produk ini sedang habis'}
            </p>
            
            <div style={{ borderTop: '1px solid #f5ede2', margin: '5px 0 15px 0' }}></div>
            
            <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1F2A44' }}>
              Deskripsi Produk
            </h3>
            <p style={{ lineHeight: '1.6', color: '#555', margin: '0 0 20px 0', fontSize: '13px', whiteSpace: 'pre-line' }}>
              {produk.description || 'Tidak ada deskripsi tertulis untuk produk ini.'}
            </p>
            
            <div style={{ borderTop: '1px solid #f5ede2', margin: '5px 0 15px 0' }}></div>

            {/* Catatan untuk Penjual */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="catatan-pembeli" style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#1F2A44', marginBottom: '6px' }}>
                Catatan untuk Penjual
              </label>
              <textarea
                id="catatan-pembeli"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tulis instruksi khusus di sini (misal: warna cadangan, ukuran, request packing rapi...)"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(198, 167, 94, 0.4)',
                  fontSize: '12px',
                  fontFamily: 'sans-serif',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                  color: '#1F2A44',
                  background: '#FFF'
                }}
              />
            </div>

            {/* Tombol Aksi */}
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              
              <button 
                onClick={tanganiBeliLangsung}
                disabled={produk.stock <= 0}
                style={{ 
                  flex: '1',
                  textAlign: 'center', 
                  background: produk.stock > 0 ? '#C6A75E' : '#ccc', 
                  color: '#FFF', 
                  padding: isMobile ? '12px 6px' : '14px', 
                  border: 'none',
                  borderRadius: '8px', 
                  fontSize: isMobile ? '11px' : '13px', 
                  fontWeight: 'bold', 
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  cursor: produk.stock > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: produk.stock > 0 ? '0 4px 12px rgba(198, 167, 94, 0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                ⚡ Beli Langsung
              </button>

              <button 
                onClick={tanganiTambahKeranjang}
                disabled={produk.stock <= 0}
                style={{ 
                  flex: '1',
                  textAlign: 'center', 
                  background: produk.stock > 0 ? '#1F2A44' : '#ccc', 
                  color: produk.stock > 0 ? '#E8DCC8' : '#666', 
                  padding: isMobile ? '12px 6px' : '14px', 
                  border: 'none',
                  borderRadius: '8px', 
                  fontSize: isMobile ? '11px' : '13px', 
                  fontWeight: 'bold', 
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  cursor: produk.stock > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: produk.stock > 0 ? '0 4px 15px rgba(31, 42, 68, 0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                🛒 + Keranjang
              </button>

            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Link href="/keranjang" style={{ color: '#C6A75E', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                Lihat Isi Keranjang Saya ➡️
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}