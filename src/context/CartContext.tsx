'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  quantity: number;
  notes?: string; // <-- TAMBAHKAN BARIS INI DENGAN TANDA TANYA (?) AGAR OPSIONAL
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Ambil data keranjang dari localStorage saat web pertama kali dimuat
  useEffect(() => {
    const savedCart = localStorage.getItem('tarumaya_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Gagal memuat data keranjang', e);
      }
    }
  }, []);

  // Simpan data ke localStorage setiap kali ada perubahan di keranjang
  useEffect(() => {
    localStorage.setItem('tarumaya_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        // Jika barang sudah ada, tambah jumlahnya (maksimal sesuai stok)
        if (existingItem.quantity < product.stock) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        alert('⚠️ Jumlah belanja sudah mencapai batas stok yang tersedia!');
        return prevCart;
      }
      // Jika barang baru, masukkan ke keranjang dengan quantity = 1
      return [...prevCart, { ...product, quantity: 1 }];
    });
    alert(`🎉 "${product.name}" berhasil dimasukkan ke keranjang!`);
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) return;
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === id) {
          if (qty <= item.stock) return { ...item, quantity: qty };
          alert('⚠️ Stok tidak mencukupi!');
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const getCartCount = () => cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart harus digunakan di dalam CartProvider');
  return context;
}