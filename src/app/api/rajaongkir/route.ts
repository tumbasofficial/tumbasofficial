import { NextResponse } from 'next/server';

// API Key Shipping Cost RajaOngkir Milikmu
const RAJAONGKIR_API_KEY = 'ax306suP97eecad59726cadbMS2r40ZA';
const BASE_URL = 'https://api.rajaongkir.com/starter';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint'); // 'city' atau 'province'

  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'GET',
      headers: { 'key': RAJAONGKIR_API_KEY }
    });
    const data = await res.json();
    return NextResponse.json(data.rajaongkir.results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destination, weight, courier } = body;

    // Catatan Starter Plan: Asal pengiriman (origin) dikunci ke 1 ID Kota/Kabupaten.
    // Kode '256' di bawah ini adalah ID untuk Kota Malang. 
    // Jika lokasi fisik tokomu berbeda, kamu bisa mengubah angka '256' ini nanti.
    const res = await fetch(`${BASE_URL}/cost`, {
      method: 'POST',
      headers: {
        'key': RAJAONGKIR_API_KEY,
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        origin: '256', 
        destination: destination,
        weight: weight.toString(),
        courier: courier
      })
    });

    const data = await res.json();
    return NextResponse.json(data.rajaongkir.results[0].costs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}