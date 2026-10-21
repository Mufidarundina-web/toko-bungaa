// Database Produk Lokal (Tanpa Server)
const initialProducts = [
  { id: 1, name: "Buket Mawar Merah Premium", category: "Buket", price: 150000, inStock: true, image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=400&q=80" },
  { id: 2, name: "Lily Putih Elegan", category: "Buket", price: 180000, inStock: true, image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=400&q=80" },
  { id: 3, name: "Bloom Box Tulungagung Rose", category: "Kotak", price: 220000, inStock: true, image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=400&q=80" },
  { id: 4, name: "Papan Ucapan Selamat & Sukses", category: "Papan", price: 500000, inStock: true, image: "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=400&q=80" },
  { id: 5, name: "Buket Baby Breath & Sunflower", category: "Buket", price: 135000, inStock: false, image: "https://images.unsplash.com/photo-1591886960571-74d43a9d4166?auto=format&fit=crop&w=400&q=80" }
];

const ADMIN_PHONE = "6281234567890"; // Ganti dengan nomor WhatsApp Toko
let products = JSON.parse(localStorage.getItem('florist_products')) || initialProducts;
let cart = JSON.parse(localStorage.getItem('florist_cart')) || [];
let currentCategory = 'all';

function saveProducts() {
  localStorage.setItem('florist_products', JSON.stringify(products));
}

function saveCart() {
  localStorage.setItem('florist_cart', JSON.stringify(cart));
}

function formatRupiah(number) {
  return 'Rp ' + number.toLocaleString('id-ID');
}

// Render Katalog Produk
function renderCatalog() {
  const grid = document.getElementById('productGrid');
  const search = document.getElementById('searchInput').value.toLowerCase();
  grid.innerHTML = '';

  const filtered = products.filter(p => {
    const matchCat = currentCategory === 'all' || p.category === currentCategory;
    const matchSearch = p.name.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400 text-sm">Produk tidak ditemukan</div>`;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = "bg-white rounded-2xl overflow-hidden border border-rose-100 shadow-sm hover:shadow-md transition flex flex-col justify-between";
    card.innerHTML = `
      <div>
        <div class="relative h-36 md:h-48 overflow-hidden bg-slate-100">
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover">
          ${!p.inStock ? '<span class="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-1 rounded">Stok Habis</span>' : ''}
        </div>
        <div class="p-3">
          <span class="text-[10px] font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">${p.category}</span>
          <h3 class="font-bold text-slate-800 text-xs md:text-sm mt-1 line-clamp-2">${p.name}</h3>
          <p class="text-rose-600 font-bold text-xs md:text-sm mt-2">${formatRupiah(p.price)}</p>
        </div>
      </div>
      <div class="p-3 pt-0">
        <button onclick="addToCart(${p.id})" ${!p.inStock ? 'disabled' : ''} 
          class="w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition ${p.inStock ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}">
          <i class="fa-solid fa-plus text-[10px]"></i> Tambah
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Filter Kategori
function filterCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.remove('bg-rose-500', 'text-white', 'border-rose-500');
    btn.classList.add('bg-white', 'text-slate-600', 'border-rose-200');
  });
  event.target.classList.add('bg-rose-500', 'text-white', 'border-rose-500');
  renderCatalog();
}

// Manajemen Keranjang
function addToCart(id) {
  const prod = products.find(p => p.id === id);
  if (!prod || !prod.inStock) return;

  const item = cart.find(c => c.id === id);
  if (item) {
    item.qty++;
  } else {
    cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
  }

  saveCart();
  updateCartUI();
}

function updateCartQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(c => c.id !== id);
    }
  }
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const container = document.getElementById('cartItems');
  const badge = document.getElementById('cartBadge');
  const totalElem = document.getElementById('cartTotal');
  const floatTotal = document.getElementById('floatingTotal');

  const totalQty = cart.reduce((acc, c) => acc + c.qty, 0);
  const totalPrice = cart.reduce((acc, c) => acc + (c.price * c.qty), 0);

  if (totalQty > 0) {
    badge.innerText = totalQty;
    badge.classList.remove('hidden');
    badge.classList.add('flex');
  } else {
    badge.classList.add('hidden');
  }

  totalElem.innerText = formatRupiah(totalPrice);
  floatTotal.innerText = formatRupiah(totalPrice);

  if (cart.length === 0) {
    container.innerHTML = `<p class="text-center text-slate-400 text-xs py-8">Keranjang Anda masih kosong</p>`;
    return;
  }

  container.innerHTML = '';
  cart.forEach(c => {
    const div = document.createElement('div');
    div.className = "pt-3 flex justify-between items-center";
    div.innerHTML = `
      <div>
        <p class="font-bold text-xs text-slate-800">${c.name}</p>
        <p class="text-[10px] text-slate-500">${formatRupiah(c.price)} x ${c.qty}</p>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="updateCartQty(${c.id}, -1)" class="w-6 h-6 rounded bg-slate-100 text-slate-600 text-xs font-bold">-</button>
        <span class="text-xs font-bold">${c.qty}</span>
        <button onclick="updateCartQty(${c.id}, 1)" class="w-6 h-6 rounded bg-rose-100 text-rose-600 text-xs font-bold">+</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function openCart() {
  document.getElementById('cartModal').classList.remove('hidden');
}

function closeCart() {
  document.getElementById('cartModal').classList.add('hidden');
}

// Kirim WhatsApp
function sendToWhatsApp() {
  const name = document.getElementById('custName').value.trim();
  const note = document.getElementById('cardMessage').value.trim();

  if (!name) {
    alert("Silakan isi Nama Pemesan terlebih dahulu!");
    return;
  }
  if (cart.length === 0) {
    alert("Keranjang Anda masih kosong!");
    return;
  }

  let msg = ` Halo BloomJoy Florist, saya ingin memesan:\n\n`;
  msg += `*Nama Pemesan:* ${name}\n`;
  if (note) msg += `*Pesan Kartu:* "${note}"\n`;
  msg += `\n*Daftar Pesanan:*\n`;

  let total = 0;
  cart.forEach((c, i) => {
    const sub = c.price * c.qty;
    total += sub;
    msg += `${i + 1}. ${c.name} (${c.qty}x) = ${formatRupiah(sub)}\n`;
  });

  msg += `\n*Total Bayar:* ${formatRupiah(total)}\n\nMohon diproses pesanan saya. Terima kasih!`;

  window.open(`https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
}

// Panel Pengelola Stok (Admin Sederhana)
function toggleAdminModal() {
  const modal = document.getElementById('adminModal');
  modal.classList.toggle('hidden');
  if (!modal.classList.contains('hidden')) {
    renderAdminList();
  }
}

function renderAdminList() {
  const list = document.getElementById('adminList');
  list.innerHTML = '';
  products.forEach(p => {
    const item = document.createElement('div');
    item.className = "py-2 flex justify-between items-center text-xs";
    item.innerHTML = `
      <div>
        <p class="font-bold text-slate-800">${p.name}</p>
        <p class="text-slate-500">${formatRupiah(p.price)}</p>
      </div>
      <button onclick="toggleStock(${p.id})" class="px-3 py-1 rounded font-bold ${p.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
        ${p.inStock ? 'Tersedia' : 'Habis'}
      </button>
    `;
    list.appendChild(item);
  });
}

function toggleStock(id) {
  const p = products.find(prod => prod.id === id);
  if (p) {
    p.inStock = !p.inStock;
    saveProducts();
    renderAdminList();
    renderCatalog();
  }
}

// Inisialisasi awal
document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  updateCartUI();
});
