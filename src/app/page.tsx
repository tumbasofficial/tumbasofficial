'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

// Paksa Next.js untuk selalu mengambil data paling segar (matikan cache pembekuan halaman)
export const dynamic = 'force-dynamic';

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

export default function HalamanUtama() {
  const [daftarProduk, setDaftarProduk] = useState<Produk[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fungsi untuk mengambil data produk terbaru
  const muatProdukToko = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Gagal mengambil data produk:", error.message);
    } else if (data) {
      setDaftarProduk(data as Produk[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Ambil data produk saat pertama kali halaman dibuka
    muatProdukToko();

    // 🔥 SOLUSI TOTAL ERROR 2769: Menggunakan type assertion 'as any' pada event string
    const kanalRealtime = supabase
      .channel('sinkron-stok-home')
      .on(
        'postgres_changes' as any,
        { event: '*', scheme: 'public', table: 'products' },
        () => {
          muatProdukToko(); // Ambil data ulang secara instan jika ada update dari admin
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(kanalRealtime);
    };
  }, []);
  return (
    <div style={{ background: '#E8DCC8', minHeight: '100vh', fontFamily: 'sans-serif', color: '#1F2A44', paddingBottom: '50px' }}>
      
      {/* BANNER UTAMA */}
      <div style={{ 
        background: '#1F2A44', 
        color: '#E8DCC8', 
        padding: '6vw 20px', 
        textAlign: 'center',
        marginBottom: '20px',
        borderBottom: '4px solid #C6A75E',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <span style={{ color: '#C6A75E', fontSize: '10px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
           Berbelanja jadi makin mudah 
        </span>
        
        <h1 style={{ 
          fontSize: 'clamp(20px, 5vw, 32px)', 
          margin: '0 0 10px 0', 
          fontWeight: 'bold', 
          color: '#FFF', 
          fontFamily: 'Cormorant Garamond', 
          letterSpacing: '0.5px', 
          lineHeight: '1.2',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center', // 👍 PERBAIKAN ERROR 2353: Sebelumnya hanya 'justify' yang bikin eror
          flexWrap: 'wrap'
        }}>
          <span style={{ color: '#C6A75E', marginRight: '15px' }}>
            <span style={{ fontSize: '1.1em', marginRight: '2px' }}>₸</span>UMBAS
          </span>

          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            ST
            <img 
              src="/logo-tumbas.png" 
              alt="O" 
              style={{
                height: '1.5em',
                width: '1.5em',
                objectFit: 'contain',
                margin: '0 2px',      
                verticalAlign: 'middle',
                display: 'inline-block'
              }} 
            />
            RE
          </span>
        </h1>
        <p style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', color: '#E8DCC8', opacity: 0.8, maxWidth: '600px', margin: '0 auto', lineHeight: '1.4' }}>
          Temukan produk yang sesuai dengan kebutuhanmu dengan cepat, mudah, dan pastinya banyak diskon setiap minggu.
        </p>
      </div>

      {/* KONTEN UTAMA KATALOG */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 10px' }}>
        
        {/* BAR JUDUL SEKSI REKOMENDASI */}
        <div style={{ 
          background: '#FFF', 
          padding: '12px 15px', 
          borderRadius: '8px', 
          marginBottom: '15px', 
          borderLeft: '5px solid #C6A75E',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '5px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#1F2A44', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
             Koleksi Produk Pilihan
          </h2>
          <span style={{ fontSize: '11px', color: '#666', fontWeight: '500' }}>
            {loading ? '...' : `${daftarProduk.length} Produk`}
          </span>
        </div>
        
        {/* GRID PRODUK OTOMATIS */}
        {loading ? (
          <div style={{ background: '#FFF', padding: '40px 20px', textAlign: 'center', borderRadius: '8px', color: '#1F2A44' }}>
             Memuat katalog produk...
          </div>
        ) : daftarProduk.length === 0 ? (
          <div style={{ background: '#FFF', padding: '40px 20px', textAlign: 'center', borderRadius: '8px', color: '#1F2A44', border: '1px solid #C6A75E', fontSize: '14px' }}>
             Produk sedang kosong
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', 
            gap: '12px' 
          }}>
            {daftarProduk.map((produk) => {
              const apakahStokHabis = produk.stock <= 0;

              // Isi Elemen Card Produk
              const KontenCard = (
                <div style={{ 
                  background: '#FFF',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  border: apakahStokHabis ? '1px solid #dc3545' : '1px solid rgba(198, 167, 94, 0.25)', 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  height: '100%',
                  position: 'relative',
                  opacity: apakahStokHabis ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}>
                  {/* FOTO PRODUK */}
                  <div style={{ 
                    width: '100%', 
                    aspectRatio: '1/1', 
                    backgroundColor: '#fcfaf7', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    position: 'relative' 
                  }}>
                    {produk.images && produk.images.length > 0 ? (
                      <img src={produk.images[0]} alt={produk.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#ccc', fontSize: '11px' }}>Tidak ada gambar</span>
                    )}

                    {/* LABEL KATEGORI MELAYANG MINI */}
                    <span style={{ 
                      position: 'absolute', 
                      top: '8px', 
                      left: '8px', 
                      background: apakahStokHabis ? '#dc3545' : '#1F2A44', 
                      color: '#E8DCC8', 
                      padding: '2px 6px', 
                      fontSize: '8px', 
                      fontWeight: 'bold',
                      borderRadius: '3px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {apakahStokHabis ? 'HABIS' : (produk.category || 'Umum')}
                    </span>
                  </div>
                  
                  {/* INFORMASI PRODUK */}
                  <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                    
                    <div>
                      <h3 style={{ 
                        margin: '0 0 6px 0', 
                        fontSize: '13px', 
                        fontWeight: '600', 
                        color: '#1F2A44',
                        lineHeight: '1.3',
                        height: '34px', 
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {produk.name}
                      </h3>

                      <p style={{ margin: '0 0 2px 0', fontSize: '9px', color: '#888', textTransform: 'uppercase' }}>
                        Harga
                      </p>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#C6A75E', display: 'block' }}>
                        <span style={{ fontSize: '11px', marginRight: '1px' }}>Rp</span>
                        {Number(produk.price).toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Pembatas dan Info Stok */}
                    <div style={{ borderTop: '1px solid #f5ede2', marginTop: '10px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: apakahStokHabis ? '#dc3545' : '#666', fontWeight: apakahStokHabis ? 'bold' : 'normal' }}>
                        {apakahStokHabis ? 'Kosong' : <>Stok: <strong>{produk.stock}</strong></>}
                      </span>
                      <span style={{ fontSize: '10px', color: apakahStokHabis ? '#999' : '#1F2A44', fontWeight: 'bold' }}>
                        {apakahStokHabis ? 'Produk habis' : 'Detail →'}
                      </span>
                    </div>

                  </div>
                </div>
              );

              if (apakahStokHabis) {
                return (
                  <div key={produk.id} style={{ cursor: 'not-allowed' }}>
                    {KontenCard}
                  </div>
                );
              }

              return (
                <Link href={`/produk/${produk.slug}`} key={produk.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {KontenCard}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}