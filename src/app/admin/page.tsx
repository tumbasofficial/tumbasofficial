'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Produk {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export default function HalamanAdmin() {
  // State Keamanan Password
  const [inputPassword, setInputPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');

  // State Form Input Produk
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  
  // State BARU: Manajemen Nomor WhatsApp
  const [whatsapp, setWhatsapp] = useState('');
  const [loadingWA, setLoadingWA] = useState(false);

  // State Manajemen Data
  const [daftarProduk, setDaftarProduk] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHapus, setLoadingHapus] = useState<string | null>(null);
  const [loadingUpdateStok, setLoadingUpdateStok] = useState<string | null>(null);
  const [pesan, setPesan] = useState({ tipe: '', teks: '' });

  // Ambil data produk & nomor WA dari database jika login sukses
  const muatDataAwal = async () => {
    // Ambil Produk
    const { data: dataProduk } = await supabase
      .from('products')
      .select('id, name, price, stock, category')
      .order('created_at', { ascending: false });
    if (dataProduk) setDaftarProduk(dataProduk as Produk[]);

    // Ambil Pengaturan WhatsApp
    const { data: dataWA } = await supabase
      .from('toko_settings')
      .select('whatsapp_number')
      .eq('id', 'utama')
      .single();
    if (dataWA) setWhatsapp(dataWA.whatsapp_number);
  };

  useEffect(() => {
    if (isLoggedIn) {
      muatDataAwal();
    }
  }, [isLoggedIn]);

  // Fungsi Simpan Nomor WA Baru
  const handleUpdateWA = async (e: React.FormEvent) => {
    e.preventDefault();
   setLoadingWA(true);
    setPesan({ tipe: '', teks: '' });

    try {
      const { error } = await supabase
        .from('toko_settings')
        .upsert({ id: 'utama', whatsapp_number: whatsapp });

      if (error) throw error;
      setPesan({ tipe: 'sukses', teks: '✅ Nomor WhatsApp Transaksi Berhasil Diperbarui!' });
    } catch (err: any) {
      setPesan({ tipe: 'error', teks: `Gagal menyimpan nomor: ${err.message}` });
    } finally {
      setLoadingWA(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === 'tarumaya123') {
      setIsLoggedIn(true);
      setErrorLogin('');
    } else {
      setErrorLogin('❌ Password salah! Akses ditolak.');
    }
  };

  const buatSlug = (teks: string) => {
    return teks.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  };

  const handleProsesGambar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const pembacaFile = new FileReader();
    pembacaFile.readAsDataURL(file);
    pembacaFile.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const dimensiMaksimal = 800;
        let ukuranBaru = Math.min(img.width, img.height);
        canvas.width = dimensiMaksimal;
        canvas.height = dimensiMaksimal;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const sX = (img.width - ukuranBaru) / 2;
          const sY = (img.height - ukuranBaru) / 2;
          ctx.drawImage(img, sX, sY, ukuranBaru, ukuranBaru, 0, 0, dimensiMaksimal, dimensiMaksimal);
          setImageBase64(canvas.toDataURL('image/jpeg', 0.7));
        }
      };
    };
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPesan({ tipe: '', teks: '' });

    if (!name || !price || !stock) {
      setPesan({ tipe: 'error', teks: 'Nama, Harga, dan Stok wajib diisi!' });
      setLoading(false);
      return;
    }

    const slug = buatSlug(name);
    const fotoFinal = imageBase64 ? [imageBase64] : ['https://via.placeholder.com/300'];
    const kategoriFinal = category.trim() === '' ? 'Umum' : category;

    try {
      const { error } = await supabase
        .from('products')
        .insert([{ name, slug, price: Number(price), stock: Number(stock), category: kategoriFinal, description: description || null, images: fotoFinal }]);

      if (error) throw error;
      setPesan({ tipe: 'sukses', teks: '🎉 Produk baru berhasil ditambahkan ke katalog!' });
      setName(''); setPrice(''); setStock(''); setCategory(''); setDescription(''); setImageBase64('');
      muatDataAwal();
    } catch (err: any) {
      setPesan({ tipe: 'error', teks: `Gagal upload: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // 🛠️ FUNGSI BARU: Mengubah stok produk secara langsung di database Supabase
  const handleUbahStokSecaraLangsung = async (id: string, stokBaru: number) => {
    if (stokBaru < 0) return; // Mencegah isi angka minus
    setLoadingUpdateStok(id);
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock: stokBaru })
        .eq('id', id);

      if (error) throw error;
      
      // Update state lokal agar tampilan langsung berubah tanpa reload layar penuh
      setDaftarProduk((prev) =>
        prev.map((p) => (p.id === id ? { ...p, stock: stokBaru } : p))
      );
    } catch (err: any) {
      console.error('Gagal memperbarui stok:', err.message);
      alert('⚠️ Gagal memperbarui jumlah stok, silakan coba lagi.');
    } finally {
      setLoadingUpdateStok(null);
    }
  };

  const handleHapusProduk = async (id: string, namaBarang: string) => {
    const konfirmasi = window.confirm(`Apakah Anda yakin ingin menghapus produk "${namaBarang}"?`);
    if (!konfirmasi) return;
    setLoadingHapus(id);
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setPesan({ tipe: 'sukses', teks: `🗑️ Produk "${namaBarang}" sukses dihapus.` });
      muatDataAwal();
    } catch (err: any) {
      setPesan({ tipe: 'error', teks: `Gagal menghapus: ${err.message}` });
    } finally {
      setLoadingHapus(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '100px 20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
        <h2>🔐 Area Terbatas Admin</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Masukkan password khusus owner Tarumaya</p>
        {errorLogin && <p style={{ color: 'red', fontWeight: 'bold', fontSize: '14px' }}>{errorLogin}</p>}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} placeholder="Masukkan Password..." style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px', textAlign: 'center' }} />
          <button type="submit" style={{ background: 'black', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Masuk System</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', fontFamily: 'sans-serif', maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Dashboard Admin Tarumaya</h1>
        <button onClick={() => setIsLoggedIn(false)} style={{ background: '#eee', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🔒 Keluar (Logout)</button>
      </div>
      
      <p style={{ color: '#666', marginBottom: '30px' }}>Kelola Katalog & Stok Dagangan Anda</p>

      {pesan.teks && (
        <div style={{ padding: '12px', borderRadius: '6px', marginBottom: '25px', fontWeight: 'bold', textAlign: 'center', backgroundColor: pesan.tipe === 'sukses' ? '#e6f4ea' : '#fce8e6', color: pesan.tipe === 'sukses' ? '#137333' : '#c5221f', border: `1px solid ${pesan.tipe === 'sukses' ? '#b7e1cd' : '#fad2cf'}` }}>
          {pesan.teks}
        </div>
      )}

      {/* PANEL KHUSUS PENGATURAN NOMOR WHATSAPP */}
      <form onSubmit={handleUpdateWA} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#eef4f8', padding: '20px', borderRadius: '12px', border: '1px solid #d0e0ec', marginBottom: '30px' }}>
        <h4 style={{ margin: 0, color: '#1F2A44' }}>📞 Pengaturan Kontak Transaksi WhatsApp</h4>
        <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>Gunakan kode negara di awal nomor (Contoh: <strong>628123456789</strong> tanpa tanda + atau spasi)</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="628xxxxxxxx" style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }} />
          <button type="submit" disabled={loadingWA} style={{ background: '#1F2A44', color: '#E8DCC8', padding: '10px 20px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loadingWA ? 'Menyimpan...' : 'Simpan Nomor'}
          </button>
        </div>
      </form>

      {/* FORM UPLOAD */}
      <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#f9f9f9', padding: '30px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '50px' }}>
        <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>➕ Tambah Katalog Baru</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Nama Produk *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Tas" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Harga (Rp) *</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="450000" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Jumlah Stok *</label>
            <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="5" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Kategori Produk</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ketik nama kategori bebas..." style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Foto Produk</label>
          <input type="file" accept="image/*" onChange={handleProsesGambar} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', background: 'white' }} />
          {imageBase64 && (
            <div style={{ marginTop: '10px' }}>
              <img src={imageBase64} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd' }} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Deskripsi</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Spesifikasi bahan..." style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }} />
        </div>
        <button type="submit" disabled={loading} style={{ background: 'black', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px' }}>
          {loading ? 'Menyimpan...' : '🚀 Upload Produk'}
        </button>
      </form>

      {/* TABEL MANAJEMEN DATA */}
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: '12px', padding: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>📦 Daftar Semua Stok Barang Aktif</h3>
        {daftarProduk.length === 0 ? (
          <p style={{ color: '#999', fontStyle: 'italic', textAlign: 'center' }}>Belum ada produk.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px 10px' }}>Nama Produk</th>
                  <th style={{ padding: '12px 10px' }}>Kategori</th>
                  <th style={{ padding: '12px 10px' }}>Harga</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', width: '160px' }}>Ubah Stok</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {daftarProduk.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee', background: item.stock === 0 ? '#fff5f5' : 'transparent' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>
                      {item.name}
                      {item.stock === 0 && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#c5221f', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'normal' }}>HABIS</span>}
                    </td>
                    <td style={{ padding: '12px 10px' }}>{item.category}</td>
                    <td style={{ padding: '12px 10px' }}>Rp {item.price.toLocaleString('id-ID')}</td>
                    
                    {/* 🛠️ BARU: KOLOM KONTROL PENGUBAH STOK REAL-TIME */}
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <button 
                          onClick={() => handleUbahStokSecaraLangsung(item.id, item.stock - 1)}
                          disabled={item.stock <= 0 || loadingUpdateStok === item.id}
                          style={{ width: '24px', height: '24px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', border: '1px solid #ccc', borderRadius: '4px', cursor: item.stock <= 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          value={item.stock} 
                          disabled={loadingUpdateStok === item.id}
                          onChange={(e) => handleUbahStokSecaraLangsung(item.id, Number(e.target.value))}
                          style={{ width: '45px', textAlign: 'center', padding: '3px 0', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px' }} 
                        />
                        <button 
                          onClick={() => handleUbahStokSecaraLangsung(item.id, item.stock + 1)}
                          disabled={loadingUpdateStok === item.id}
                          style={{ width: '24px', height: '24px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eee', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <button onClick={() => handleHapusProduk(item.id, item.name)} disabled={loadingHapus === item.id} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                        {loadingHapus === item.id ? 'Menghapus...' : '❌ Hapus'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}