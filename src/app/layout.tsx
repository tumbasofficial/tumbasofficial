// @ts-ignore
import './globals.css'; 
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { CartProvider } from '../context/CartContext';

export const metadata = {
  title: 'Tarumaya Leather',
  description: 'Memuat Katalog Produk',
};

// TAMBAHKAN INI: Kunci utama agar browser HP mendeteksi skala layar dengan pas (tidak zooming keluar)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body style={{ 
        margin: 0, 
        padding: 0, 
        boxSizing: 'border-box', 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        backgroundColor: '#E8DCC8' // Menjaga warna dasar body agar seragam saat loading
      }}>
        {/* Membungkus seluruh aplikasi dengan CartProvider agar state keranjang aktif secara global */}
        <CartProvider>
          <Navbar />
          <main style={{ flex: 1, width: '100%' }}>
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}