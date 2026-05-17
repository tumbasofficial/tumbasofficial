'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
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

export default function HalamanProduk() {
  const [semuaProduk, setSemuaProduk] = useState<Produk[]>([]);
  const [produkDifilter, setProdukDifilter] = useState<Produk[]>([]);
  const [kategoriAktif, setKategoriAktif] = useState<string>('Semua');
  const [loading, setLoading] = useState<boolean>(true);
  const [daftarKategori, setDaftarKategori] = useState<string[]>(['Semua']);

  useEffect(() => {
    async function ambilData() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const listProduk = data as Produk[];
        setSemuaProduk(listProduk);
        setProdukDifilter(listProduk);

        const kategoriUnik = Array.from(
          new Set(listProduk.map((p) => p.category || 'Umum'))
        );
        
        setDaftarKategori(['Semua', ...kategoriUnik]);
      }
      setLoading(false);
    }
    ambilData();
  }, []);

  const tanganiFilter = (kategori: string) => {
    setKategoriAktif(kategori);
    if (kategori === 'Semua') {
      setProdukDifilter(semuaProduk);
    } else {
      const hasilSaring = semuaProduk.filter((p) => (p.category || 'Umum') === kategori);
      setProdukDifilter(hasilSaring);
    }
  };

  return (
    <div style={{ 
      background: '#E8DCC8', 
      minHeight: '100vh', 
      padding: 'clamp(20px, 5vw, 40px) 10px', // Padding mengecil otomatis di layar HP
      fontFamily: 'sans-serif', 
      color: '#1F2A44' 
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Judul Halaman Adaptif */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: 'clamp(22px, 6vw, 32px)', // Tulisan mengecil di HP, membesar di desktop
            margin: '0 0 10px 0', 
            color: '#1F2A44', 
            fontWeight: 'bold', 
            fontFamily: 'serif', 
            letterSpacing: '0.5px' 
          }}>
            Koleksi Produk Tarumaya
          </h1>
          <div style={{ width: '40px', height: '2px', background: '#C6A75E', margin: '0 auto 12px auto' }}></div>
          <p style={{ color: '#555', margin: 0, fontSize: 'clamp(12px, 3.5vw, 14px)', padding: '0 10px' }}>
            Silakan pilih kategori produk kerajinan kulit asli yang Anda cari
          </p>
        </div>

        {/* Tombol Filter Pill (Bisa digeser menyamping jika menu kategori terlalu panjang di HP) */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '8px', 
          flexWrap: 'wrap', 
          marginBottom: '30px',
          padding: '0 5px'
        }}>
          {daftarKategori.map((kategori) => (
            <button
              key={kategori}
              onClick={() => tanganiFilter(kategori)}
              style={{
                padding: '8px 16px', // Ukuran tombol dibuat lebih pas genggaman tangan di HP
                borderRadius: '30px',
                border: kategoriAktif === kategori ? '1px solid #1F2A44' : '1px solid rgba(31, 42, 68, 0.2)',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: kategoriAktif === kategori ? '0 4px 12px rgba(31, 42, 68, 0.15)' : 'none',
                background: kategoriAktif === kategori ? '#1F2A44' : '#FFF',
                color: kategoriAktif === kategori ? '#E8DCC8' : '#1F2A44',
              }}
            >
              {kategori}
            </button>
          ))}
        </div>

        {/* AREA GRID DAFTAR PRODUK (Otomatis 2 Kolom di HP) */}
        {loading ? (
          <div style={{ background: '#FFF', padding: '40px', textAlign: 'center', borderRadius: '12px' }}>
            <p style={{ margin: 0, color: '#666', fontWeight: '500', fontSize: '14px' }}>Memuat katalog produk Tarumaya...</p>
          </div>
        ) : produkDifilter.length === 0 ? (
          <div style={{ background: '#FFF', padding: '40px 15px', textAlign: 'center', borderRadius: '12px', border: '1px solid rgba(198, 167, 94, 0.3)' }}>
            <p style={{ margin: 0, color: '#1F2A44', fontStyle: 'italic', fontSize: '14px' }}>
              Maaf, produk untuk kategori "{kategoriAktif}" saat ini sedang kosong.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            // Menggunakan ambang batas 145px agar pas membentuk 2 kolom berdampingan di HP
            gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))', 
            gap: '12px' // Jarak antar kartu dirapatkan agar seimbang di layar kecil
          }}>
            {produkDifilter.map((produk) => (
              <div 
                key={produk.id} 
                style={{ 
                  background: '#FFF',
                  border: '1px solid rgba(198, 167, 94, 0.25)', 
                  padding: '10px', // Padding dalam kartu diperkecil sedikit agar konten tidak sesak
                  borderRadius: '10px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                }}
              >
                {/* Frame Foto Produk Kotak Fleksibel */}
                <div style={{ 
                  width: '100%', 
                  aspectRatio: '1/1', // Memaksa rasio foto selalu kotak proporsional di HP maupun Laptop
                  backgroundColor: '#fcfaf7', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  border: '1px solid #f3ece2'
                }}>
                  {produk.images && produk.images.length > 0 ? (
                    <img src={produk.images[0]} alt={produk.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#ccc', fontSize: '11px' }}>Tidak ada gambar</span>
                  )}
                </div>
                
                {/* Informasi Kartu Produk */}
                <span style={{ fontSize: '9px', color: '#C6A75E', marginTop: '10px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {produk.category || 'Umum'}
                </span>
                
                <h3 style={{ 
                  margin: '4px 0 10px 0', 
                  fontSize: '13px', // Font dikecilkan agar teks nama produk tidak memakan banyak baris
                  fontWeight: '600',
                  color: '#1F2A44',
                  lineHeight: '1.3',
                  height: '34px', // Membatasi tinggi nama produk maksimal 2 baris
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {produk.name}
                </h3>
                
                {/* Label & Nilai Rupiah */}
                <div style={{ borderTop: '1px solid #f5ede2', paddingTop: '8px', marginTop: 'auto' }}>
                  <span style={{ display: 'block', fontSize: '9px', color: '#888', textTransform: 'uppercase', marginBottom: '1px' }}>Harga</span>
                  <p style={{ fontWeight: 'bold', margin: '0 0 10px 0', color: '#C6A75E', fontSize: '14px' }}>
                    <span style={{ fontSize: '11px', marginRight: '1px' }}>Rp</span>{Number(produk.price).toLocaleString('id-ID')}
                  </p>
                </div>
                
                {/* Link Tombol Aksi Premium */}
                <Link 
                  href={`/produk/${produk.slug}`} 
                  style={{ 
                    display: 'block', 
                    textAlign: 'center', 
                    background: '#1F2A44', 
                    color: '#E8DCC8', 
                    padding: '10px 5px', 
                    textDecoration: 'none', 
                    borderRadius: '6px', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    border: '1px solid #1F2A44',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Lihat Detail
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}