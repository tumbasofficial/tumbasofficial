'use client';

import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HalamanKeranjang() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [nomorWA, setNomorWA] = useState('6281234567890');

  // Ambil nomor WA aktif dari setingan admin di database Supabase
  useEffect(() => {
    async function dapatkanNomor() {
      const { data } = await supabase
        .from('toko_settings')
        .select('whatsapp_number')
        .eq('id', 'utama')
        .single();
      if (data?.whatsapp_number) setNomorWA(data.whatsapp_number);
    }
    dapatkanNomor();
  }, []);

  // Hitung total harga belanjaan
  const totalHarga = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Fungsi merakit pesan teks WA otomatis untuk banyak barang sekaligus
  const tanganiCheckout = () => {
    if (cart.length === 0) return;

    let susunanBarang = '';
    cart.forEach((item, index) => {
      susunanBarang += `${index + 1}. *${item.name}* (${item.quantity} pcs) -> Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
    });

    const teksPesan = encodeURIComponent(
      `Halo Tarumaya, saya ingin memesan barang-barang berikut:\n\n${susunanBarang}\n*Total Keseluruhan:* Rp ${totalHarga.toLocaleString('id-ID')}\n\nApakah semua pesanan ini siap untuk diproses?`
    );

    // Buka WhatsApp di tab baru menuju nomor admin Tarumaya
    window.open(`https://wa.me/${nomorWA}?text=${teksPesan}`, '_blank');
    
    // Opsional: kosongkan keranjang setelah klik checkout
    // clearCart();
  };

  return (
    <div style={{ background: '#E8DCC8', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif', color: '#1F2A44' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#FFF', padding: '30px', borderRadius: '16px', border: '1px solid rgba(198, 167, 94, 0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        
        <h1 style={{ fontSize: '26px', fontFamily: 'serif', marginBottom: '20px', borderBottom: '2px solid #f5ede2', paddingBottom: '10px' }}>
          🛒 Keranjang Belanja Anda
        </h1>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '20px' }}>Keranjang belanja Anda masih kosong nih.</p>
            <Link href="/produk" style={{ background: '#1F2A44', color: '#E8DCC8', padding: '10px 20px', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px' }}>
              🎒 Jelajahi Produk Tarumaya
            </Link>
          </div>
        ) : (
          <div>
            {/* Daftar Item di Keranjang */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#fcfaf7', padding: '15px', borderRadius: '10px', border: '1px solid #f3ece2', flexWrap: 'wrap' }}>
                  <img src={item.image} alt={item.name} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #eee' }} />
                  
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1F2A44' }}>{item.name}</h4>
                    <p style={{ margin: 0, color: '#C6A75E', fontWeight: 'bold', fontSize: '14px' }}>
                      Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Pengatur Jumlah Kuantitas */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                    <span style={{ fontWeight: 'bold', width: '25px', textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ccc', background: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                  </div>

                  {/* Tombol Hapus Satuan */}
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', marginLeft: '10px' }}>
                    ❌ Hapus
                  </button>
                </div>
              ))}
            </div>

            {/* Totalan dan Tombol Checkout */}
            <div style={{ marginTop: '30px', borderTop: '2px dashed #f5ede2', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <span style={{ fontSize: '14px', color: '#666' }}>Total Pembayaran:</span>
                <h2 style={{ color: '#C6A75E', margin: '4px 0 0 0', fontFamily: 'serif' }}>
                  Rp {totalHarga.toLocaleString('id-ID')}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={clearCart} style={{ background: '#fff', color: '#dc3545', border: '1px solid #dc3545', padding: '12px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                  🗑️ Kosongkan
                </button>
                
                <button onClick={tanganiCheckout} style={{ background: '#1F2A44', color: '#E8DCC8', border: '1px solid #1F2A44', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  💬 Pesan Sekarang via WA
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}