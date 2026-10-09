
import { useEffect, useMemo, useState } from 'react'
import {
  Activity, Bell, Check, ChevronDown, ChevronRight,
  LayoutDashboard, Menu, Moon, Package, Palette, Plus,
  Search, Settings, ShoppingBag, ShoppingCart, Sparkles,
  Store, Sun, Users, X, Zap,
} from 'lucide-react'
import { supabase } from './lib/supabase'

const initialProducts = [
  { id: 1, name: 'Everyday Sneakers', category: 'Footwear', price: 2499, stock: 24, emoji: '👟', bg: '#eee8df' },
  { id: 2, name: 'Ceramic Coffee Mug', category: 'Home', price: 599, stock: 8, emoji: '☕', bg: '#e5eee5' },
  { id: 3, name: 'Everyday Tote', category: 'Accessories', price: 899, stock: 42, emoji: '👜', bg: '#eee2f8' },
  { id: 4, name: 'Wireless Headphones', category: 'Electronics', price: 3299, stock: 5, emoji: '🎧', bg: '#e0e8f7' },
]

const themes = [
  {
    id: 'atelier',
    name: 'Atelier',
    desc: 'Clean & editorial',
    bg: '#F7F3EB',
    surface: '#FFFFFF',
    accent: '#343A83',
    text: '#282321',
    muted: '#766963',
    border: '#E5DDD2',
    buttonText: '#FFFFFF',
  },
  {
    id: 'playful',
    name: 'Playful',
    desc: 'Colorful & fun',
    bg: '#FFF0E8',
    surface: '#FFFFFF',
    accent: '#D94E79',
    text: '#38232D',
    muted: '#8B6474',
    border: '#F2C9D6',
    buttonText: '#FFFFFF',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    desc: 'Dark & premium',
    bg: '#20243A',
    surface: '#30334B',
    accent: '#B8A9FF',
    text: '#FFFFFF',
    muted: '#C5C8DC',
    border: '#484D6C',
    buttonText: '#20243A',
  },
  {
    id: 'botanical',
    name: 'Botanical',
    desc: 'Fresh & natural',
    bg: '#E7F1E6',
    surface: '#FFFFFF',
    accent: '#28634B',
    text: '#203D2F',
    muted: '#587665',
    border: '#C9DDC7',
    buttonText: '#FFFFFF',
  },
]

const money = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export default function App() {
  const [page, setPage] = useState('Overview')
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState('atelier')
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [revenue, setRevenue] = useState(0)
  const [showProductForm, setShowProductForm] = useState(false)
  const [productName, setProductName] = useState('')
  const [productCategory, setProductCategory] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [productStock, setProductStock] = useState('')
  const [productDescription, setProductDescription] = useState('')
  const [storeName, setStoreName] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem('launchStoreSetup') || 'null'
      )
      return (
        localStorage.getItem('launchDatabaseStoreName') ||
        saved?.storeName ||
        'Sunday Studio'
      )
    } catch {
      return localStorage.getItem('launchDatabaseStoreName') || 'Sunday Studio'
    }
  })
  const [notice, setNotice] = useState('')
  const [editingName, setEditingName] = useState(false)

  const chosenTheme = themes.find((item) => item.id === theme) || themes[0]

    useEffect(() => {
    let active = true

    async function loadDashboardData() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user || !active) {
        if (active) {
          setProducts([])
          setOrders([])
          setRevenue(0)
        }
        return
      }

      const { data: store, error: storeError } = await supabase
        .from('stores')
        .select('id, name')
        .eq('owner_id', user.id)
        .limit(1)
        .maybeSingle()

      if (storeError || !store || !active) {
        if (active) {
          setProducts([])
          setOrders([])
          setRevenue(0)
          setNotice('No store found for this account.')
        }
        return
      }

      if (active && store.name) {
        setStoreName(store.name)
      }

      const [
        { data: productRows, error: productsError },
        { data: orderRows, error: ordersError },
      ] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('store_id', store.id),
        supabase
          .from('orders')
          .select('*')
          .eq('store_id', store.id),
      ])

      if (!active) return

      if (productsError) {
        console.error('Products load failed:', productsError.message)
        setProducts([])
      } else {
        setProducts(
          (productRows || []).map((product) => ({
            ...product,
            stock: Number(product.stock ?? product.stock_quantity ?? 0),
            price: Number(product.price ?? 0),
          })),
        )
      }

      if (ordersError) {
        console.error('Orders load failed:', ordersError.message)
        setOrders([])
        setRevenue(0)
      } else {
        const loadedOrders = orderRows || []
        setOrders(loadedOrders)
        setRevenue(
          loadedOrders.reduce(
            (total, order) =>
              total + Number(order.total_amount ?? order.total ?? order.amount ?? 0),
            0,
          ),
        )
      }
    }

    loadDashboardData()

    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(
    () =>
      products.filter((product) =>
        `${product.name} ${product.category}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [products, query],
  )

  function notify(message) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2400)
  }

  function go(name) {
  setPage(name)
  setMenuOpen(false)
}

async function addProduct() {
  try {
    const { data: { user }, error: authError } =
      await supabase.auth.getUser()

    if (authError || !user) {
      notify('Please log in first')
      return
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .maybeSingle()

    if (storeError || !store) {
      notify('No store found for this account')
      return
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        store_id: store.id,
        name: 'New Sample Product',
        category: 'General',
        price: 1299,
        stock_quantity: 10,
        description: 'Sample product',
      })
      .select()
      .single()

    if (error) {
      console.error('Product insert failed:', error)
      notify('Could not add product: ' + error.message)
        return
    }

    setProducts((current) => [
      ...current,
      {
        ...product,
        stock: Number(product.stock_quantity ?? 0),
        price: Number(product.price ?? 0),
        emoji: '✨',
        bg: '#F6D0B9',
      },
    ])

    notify('Product saved successfully')
  } catch (error) {
    console.error(error)
    notify('Something went wrong while adding the product')
  }
}

async function saveProduct(e) {
  e.preventDefault()

  const name = productName.trim()
  const price = Number(productPrice)
  const stock = Number(productStock)

  if (
    !name ||
    productPrice === '' ||
    productStock === '' ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    notify('Enter a valid name, price, and stock quantity')
    return
  }

  const { data: { user }, error: authError } =
    await supabase.auth.getUser()

  if (authError || !user) {
    notify('Please log in first')
    return
  }

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()

  if (storeError || !store) {
    notify('No store found for this account')
    return
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      store_id: store.id,
      name,
      category: productCategory.trim() || 'General',
      price,
      stock_quantity: stock,
      description: productDescription.trim() || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Save product failed:', error)
    notify('Could not save product: ' + error.message)
    return
  }

  setProducts((current) => [
    ...current,
    {
      ...product,
      stock: Number(product.stock_quantity ?? 0),
      price: Number(product.price ?? 0),
      emoji: '✨',
      bg: '#F6D0B9',
    },
  ])

  setProductName('')
  setProductCategory('')
  setProductPrice('')
  setProductStock('')
  setProductDescription('')
  setShowProductForm(false)
  notify('Product saved successfully')
}
  const nav = [
    {
      heading: 'WORKSPACE',
      items: [
        ['Overview', LayoutDashboard],
        ['Products', Package],
        ['Orders', ShoppingBag],
        ['Customers', Users],
      ],
    },
    {
      heading: 'YOUR STORE',
      items: [
        ['Storefront', Store],
        ['Themes', Palette],
        ['Analytics', Activity],
      ],
    },
  ]

  return (
    <div
      className={dark ? 'dark min-h-screen' : 'min-h-screen'}
      style={{ background: 'var(--canvas)', color: 'var(--ink)' }}
    >
      {menuOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[250px] flex-col border-r transition-transform md:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="flex h-[76px] items-center justify-between border-b px-5"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => go('Overview')}
            className="flex items-center gap-3 text-left"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-white"
              style={{ background: 'linear-gradient(135deg,#E3342F,#E96827)' }}
            >
              <Zap size={21} fill="currentColor" />
            </span>
            <span>
              <span className="block text-lg font-extrabold tracking-tight">
                launch<span style={{ color: 'var(--cobalt)' }}>store</span>
              </span>
              <span
                className="block text-[10px] font-bold tracking-[.17em]"
                style={{ color: 'var(--muted)' }}
              >
                COMMERCE STUDIO
              </span>
            </span>
          </button>
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="mx-4 mt-5 rounded-2xl border p-3"
          style={{ background: 'var(--surface-soft)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
              style={{ background: 'var(--mint)' }}
            >
              ✳️
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{storeName}</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>
                My workspace
              </p>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-7">
          {nav.map((group) => (
            <div key={group.heading}>
              <p
                className="mb-3 px-3 text-[10px] font-bold tracking-[.16em]"
                style={{ color: 'var(--muted)' }}
              >
                {group.heading}
              </p>
              <div className="space-y-1">
                {group.items.map(([label, Icon]) => (
                  <button
                    key={label}
                    onClick={() => go(label)}
                    className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition hover:brightness-95"
                    style={{
                      background: page === label ? 'var(--surface-soft)' : 'transparent',
                      color: page === label ? 'var(--cobalt)' : 'var(--ink)',
                    }}
                  >
                    <Icon size={18} />
                    <span className="flex-1 text-left">{label}</span>
                    {label === 'Orders' && (
                      <span
                        className="rounded-lg px-2 py-1 text-[10px]"
                        style={{ background: 'var(--surface-soft)' }}
                      >
                        8
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => notify('Settings will be connected next')}
            className="flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm"
            style={{ color: 'var(--muted)' }}
          >
            <Settings size={17} /> Settings
          </button>
          <div className="mt-3 flex items-center gap-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: 'var(--lilac)', color: 'var(--cobalt)' }}
            >
              A
            </div>
            <div>
              <p className="text-sm font-semibold">Store owner</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Store Owner</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-h-screen md:pl-[250px]">
        <header
          className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b px-4 backdrop-blur-xl sm:px-6 lg:px-9"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-xl border p-2 md:hidden"
              style={{ borderColor: 'var(--border)' }}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-xs" style={{ color: 'var(--muted)' }}>
                Workspace / {page}
              </p>
              <h1 className="truncate text-base font-bold">{page}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold sm:flex"
              style={{ background: 'var(--mint)', color: '#28543A' }}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Demo mode
            <span
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold sm:flex"
              style={{ background: 'var(--mint)', color: '#28543A' }}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              {localStorage.getItem("launchDatabaseStoreName")
                ? "Connected to Supabase"
                : "Demo mode"}
            </span>

            </span>
            <button
              onClick={() => setDark(!dark)}
              className="rounded-xl border p-2.5"
              style={{ borderColor: 'var(--border)' }}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => notify('You are all caught up')}
              className="rounded-xl border p-2.5"
              style={{ borderColor: 'var(--border)' }}
              aria-label="Notifications"
            >
              <Bell size={18} />
            </button>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl font-bold"
              style={{ background: 'var(--lilac)', color: 'var(--cobalt)' }}
            >
              A
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] space-y-7 p-4 sm:p-6 lg:p-9">
          {page === 'Overview' && (
            <>
              <section
                className="relative overflow-hidden rounded-[28px] p-6 sm:p-9 lg:p-11"
                style={{
                  background: 'linear-gradient(115deg,#FBE5D8 0%,#F6D0B9 55%,#F4D5A9 100%)',
                  color: '#282321',
                }}
              >
                <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/60 blur-3xl" />
                <div className="relative grid gap-8 lg:grid-cols-[1.5fr_.7fr] lg:items-center">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-2 text-xs font-bold">
                      <Sparkles size={14} /> A LITTLE MAGIC FOR YOUR BUSINESS
                    </span>
                    <h2 className="mt-5 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[46px]">
                      Big ideas deserve a <span style={{ color: '#B92320' }}>beautiful</span> store.
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-[#5F514C] sm:text-base">
                      Your products, your personality, your corner of the internet.
                      Build something wonderful — without writing code.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <button
                        onClick={() => go('Storefront')}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-lg transition hover:brightness-90"
                        style={{ background: '#E3342F' }}
                      >
                        <Store size={17} /> Preview my store <ChevronRight size={16} />
                      </button>
                      <button
                        onClick={() => go('Themes')}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white bg-white/85 px-5 text-sm font-bold text-[#282321]"
                      >
                        <Palette size={17} /> Find my style
                      </button>
                    </div>
                  </div>
                  <div className="hidden justify-center lg:flex">
                    <div className="w-full max-w-[270px] rotate-2 rounded-[26px] border border-white bg-white/75 p-3 shadow-xl">
                      <div className="rounded-[19px] bg-[#FFFCF8] p-4">
                        <div className="flex items-center justify-between text-sm font-bold">
                          {storeName}<ShoppingBag size={17} />
                        </div>
                        <div
                          className="my-4 flex h-32 items-center justify-center rounded-2xl text-6xl"
                          style={{ background: 'linear-gradient(135deg,#F6D0B9,#E96827)' }}
                        >
                          🪴
                        </div>
                        <p className="text-xs text-[#766963]">YOUR NEXT FAVOURITE THING</p>
                        <p className="mt-1 text-lg font-bold">Made for your everyday.</p>
                        <div className="mt-4 flex gap-2">
                          <div className="h-2 w-2/3 rounded-full bg-[#F6D0B9]" />
                          <div className="h-2 w-1/3 rounded-full bg-[#E96827]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
          ['Revenue', money(revenue), 'From orders', '💜'],
          ['Orders', String(orders.length), 'Total orders', '📦'],
          ['Products', String(products.length), 'In catalogue', '🎨'],
          ['Low stock', String(products.filter((p) => p.stock < 10).length), 'Needs attention', '🌱'],
                ].map(([label, value, change, emoji]) => (
                  <article
                    key={label}
                    className="rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-lg"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
                        style={{ background: 'var(--surface-soft)' }}
                      >
                        {emoji}
                      </span>
                      <span
                        className="rounded-full px-2 py-1 text-[11px] font-bold"
                        style={{ background: 'var(--mint)', color: '#28543A' }}
                      >
                        {change}
                      </span>
                    </div>
                    <p className="mt-5 text-sm" style={{ color: 'var(--muted)' }}>{label}</p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight">{value}</p>
                  </article>
                ))}
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
                <div className="rounded-2xl border p-5 sm:p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold">Your store at a glance ✨</h3>
                      <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>Illustrative activity · Last 7 days</p>
                    </div>
                    <button onClick={() => go('Analytics')} className="text-sm font-semibold" style={{ color: 'var(--cobalt)' }}>
                      View analytics →
                    </button>
                  </div>
                  <div className="mt-7 flex h-40 items-end gap-2 sm:gap-4">
                    {[38, 55, 44, 72, 60, 84, 69, 93, 73, 100, 80, 90].map((n, i) => (
                      <div key={i} className="flex h-full flex-1 items-end">
                        <div
                          className="w-full rounded-t-lg transition hover:opacity-70"
                          style={{
                            height: `${n}%`,
                            background: i === 9 ? '#E96827' : `hsl(${13 + i * 2} 70% ${92 - i * 2}%)`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between text-[11px]" style={{ color: 'var(--muted)' }}>
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>

                <div className="rounded-2xl border p-5 sm:p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <h3 className="font-bold">Inventory pulse 📦</h3>
                  <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>Sample products and stock</p>
                  <div className="mt-5 space-y-4">
                    {products.slice(0, 4).map((p) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl" style={{ background: p.bg }}>
                          {p.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{p.name}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>{p.stock} units available</p>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: p.stock < 10 ? '#C52B27' : '#34734B' }}>
                          {p.stock < 10 ? 'Low stock' : 'Healthy'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => go('Products')}
                    className="mt-5 min-h-10 w-full rounded-xl border text-sm font-semibold"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    Manage products →
                  </button>
                </div>
              </section>
            </>
          )}

          {page === 'Products' && (
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">Your products</h2>
                  <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                    Product management · Selected accent: {chosenTheme.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowProductForm((open) => !open)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-white"
                  style={{ background: chosenTheme.accent }}
                >
                  <Plus size={17} /> Add Product
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-xl border px-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <Search size={18} style={{ color: 'var(--muted)' }} />
                <input
                  aria-label="Search products"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products or categories…"
                  className="min-h-12 w-full bg-transparent text-sm outline-none"
                />
                {query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}
              </div>
{showProductForm && (
  <form
    onSubmit={saveProduct}
    className="grid gap-3 rounded-2xl border p-5 sm:grid-cols-2"
    style={{
      background: 'var(--surface)',
      borderColor: 'var(--border)',
    }}
  >
    <h3 className="text-lg font-bold sm:col-span-2">
      Add a new product
    </h3>

    <input
      required
      value={productName}
      onChange={(e) => setProductName(e.target.value)}
      placeholder="Product name"
      className="rounded-xl border p-3"
    />

    <input
      value={productCategory}
      onChange={(e) => setProductCategory(e.target.value)}
      placeholder="Category"
      className="rounded-xl border p-3"
    />

    <input
      required
      type="number"
      min="0"
      step="0.01"
      value={productPrice}
      onChange={(e) => setProductPrice(e.target.value)}
      placeholder="Price (₹)"
      className="rounded-xl border p-3"
    />

    <input
      required
      type="number"
      min="0"
      step="1"
      value={productStock}
      onChange={(e) => setProductStock(e.target.value)}
      placeholder="Stock quantity"
      className="rounded-xl border p-3"
    />

    <textarea
      value={productDescription}
      onChange={(e) => setProductDescription(e.target.value)}
      placeholder="Description (optional)"
      rows={3}
      className="rounded-xl border p-3 sm:col-span-2"
    />

    <div className="flex gap-3 sm:col-span-2">
      <button
        type="submit"
        className="rounded-xl px-5 py-3 font-bold text-white"
        style={{ background: chosenTheme.accent }}
      >
        Save Product
      </button>

      <button
        type="button"
        onClick={() => setShowProductForm(false)}
        className="rounded-xl border px-5 py-3"
        style={{ borderColor: 'var(--border)' }}
      >
        Cancel
      </button>
    </div>
  </form>
)}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => (
                  <article
                    key={p.id}
                    className="overflow-hidden rounded-2xl border-2"
                    style={{
                      background: 'var(--surface)',
                      borderColor: chosenTheme.border,
                      borderTop: `4px solid ${chosenTheme.accent}`,
                    }}
                  >
                    <div className="flex h-36 items-center justify-center text-6xl sm:h-44" style={{ background: p.bg }}>
                      {p.emoji}
                    </div>
                    <div className="space-y-3 p-4">
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>{p.category}</p>
                      <h3 className="font-bold">{p.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold">{money(p.price)}</span>
                        <span className="text-xs font-semibold" style={{ color: p.stock < 10 ? '#C52B27' : '#34734B' }}>
                          {p.stock} in stock
                        </span>
                      </div>
                      <div className="flex gap-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                        <button
                          onClick={() => setProducts((old) => old.map((x) => x.id === p.id ? { ...x, stock: Math.max(0, x.stock - 1) } : x))}
                          className="min-h-10 flex-1 rounded-lg border text-sm"
                          style={{ borderColor: chosenTheme.border }}
                        >
                          − Stock
                        </button>
                        <button
                          onClick={() => setProducts((old) => old.map((x) => x.id === p.id ? { ...x, stock: x.stock + 1 } : x))}
                          className="min-h-10 flex-1 rounded-lg border text-sm"
                          style={{ borderColor: chosenTheme.border }}
                        >
                          + Stock
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-full rounded-2xl border border-dashed p-10 text-center" style={{ borderColor: 'var(--border)' }}>
                    <Package size={30} className="mx-auto" />
                    <p className="mt-3 font-bold">No products found</p>
                    <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>Try another search.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {page === 'Themes' && (
            <section className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold">Find your store's personality 🎨</h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                  Choose a theme for your customer-facing storefront. The dashboard keeps its Ember Atelier style.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id)
                      notify(`${t.name} storefront theme selected`)
                    }}
                    className="overflow-hidden rounded-2xl border-2 text-left transition hover:-translate-y-1 hover:shadow-lg"
                    style={{
                      background: 'var(--surface)',
                      borderColor: theme === t.id ? '#E3342F' : 'var(--border)',
                    }}
                  >
                    <div className="p-4" style={{ background: t.bg, color: t.accent }}>
                      <div className="flex items-center justify-between text-sm font-bold">
                        {storeName}<ShoppingBag size={16} />
                      </div>
                      <div className="mt-5 grid grid-cols-3 gap-2">
                        {['👟', '☕', '👜'].map((emoji, i) => (
                          <div key={i} className="flex h-20 items-center justify-center rounded-xl text-2xl" style={{ background: '#ffffffaa' }}>
                            {emoji}
                          </div>
                        ))}
                      </div>
                      <p className="mt-4 text-xl font-extrabold">Little things, lovely days.</p>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-bold">{t.name}</p>
                        <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{t.desc}</p>
                      </div>
                      {theme === t.id ? <Check size={20} style={{ color: '#E3342F' }} /> : <ChevronRight size={18} />}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => go('Storefront')}
                className="min-h-11 rounded-xl px-5 text-sm font-bold text-white"
                style={{ background: '#E3342F' }}
              >
                Preview selected theme →
              </button>
            </section>
          )}

          {page === 'Storefront' && (
            <section className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-extrabold">Your storefront</h2>
                  <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                    Your customer-facing preview · {chosenTheme.name} theme
                  </p>
                </div>
                <span className="rounded-full px-3 py-2 text-xs font-bold" style={{ background: 'var(--surface-soft)', color: 'var(--ink)' }}>
                  Preview mode
                </span>
              </div>

              <div
                className="overflow-hidden rounded-2xl border"
                style={{ borderColor: chosenTheme.border, background: chosenTheme.bg, color: chosenTheme.text }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5" style={{ borderColor: chosenTheme.border }}>
                  <div>
                    {editingName ? (
                      <form
                        className="flex flex-wrap gap-2"
                        onSubmit={(e) => {
                          e.preventDefault()
                          setEditingName(false)
                          notify('Store name updated')
                        }}
                      >
                        <input
                          aria-label="Store name"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className="w-44 rounded-lg border px-2 py-1 text-sm text-slate-900"
                        />
                        <button className="rounded-lg px-3 py-1 text-xs font-bold text-white" style={{ background: chosenTheme.accent }}>
                          Save
                        </button>
                      </form>
                    ) : (
                      <button onClick={() => setEditingName(true)} className="text-left text-lg font-extrabold">
                        {storeName} ✎
                      </button>
                    )}
                    <p className="mt-1 text-xs" style={{ color: chosenTheme.muted }}>
                      Thoughtful finds for everyday living.
                    </p>
                  </div>
                  <span className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold" style={{ borderColor: chosenTheme.border }}>
                    <ShoppingCart size={16} /> Cart ({cart.length})
                  </span>
                </div>

                <div className="p-4 sm:p-7">
                  <div className="rounded-2xl p-6 sm:p-9" style={{ background: chosenTheme.surface }}>
                    <p className="text-xs font-bold tracking-[.15em]" style={{ color: chosenTheme.muted }}>
                      A LITTLE SOMETHING SPECIAL
                    </p>
                    <h3 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
                      Everyday essentials. Extra-special feeling.
                    </h3>
                    <p className="mt-3 max-w-lg text-sm leading-6" style={{ color: chosenTheme.muted }}>
                      Discover thoughtful pieces to make your everyday brighter.
                    </p>
                  </div>

                  <h3 className="mb-4 mt-7 text-lg font-extrabold">Picked just for you</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((p) => (
                      <article
                        key={p.id}
                        className="overflow-hidden rounded-2xl border"
                        style={{
                          background: chosenTheme.surface,
                          color: chosenTheme.text,
                          borderColor: chosenTheme.border,
                        }}
                      >
                        <div className="flex h-36 items-center justify-center text-6xl sm:h-44" style={{ background: p.bg }}>
                          {p.emoji}
                        </div>
                        <div className="p-4">
                          <p className="text-xs" style={{ color: chosenTheme.muted }}>{p.category}</p>
                          <h4 className="mt-1 font-bold">{p.name}</h4>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span className="font-extrabold">{money(p.price)}</span>
                            <button
                              disabled={p.stock === 0}
                              onClick={() => {
                                setCart((current) => [...current, p.id])
                                notify('Added to cart!')
                              }}
                              className="min-h-10 rounded-xl px-3 text-xs font-bold disabled:opacity-50"
                              style={{ background: chosenTheme.accent, color: chosenTheme.buttonText }}
                            >
                              {p.stock === 0 ? 'Sold out' : 'Add to bag +'}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <h3 className="font-bold">Your demo cart · {cart.length} item(s)</h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                  Simulated checkout only. No real order or payment is created.
                </p>
                {cart.length > 0 && (
                  <>
                    <p className="mt-3 text-lg font-extrabold">
                      {money(cart.reduce((sum, id) => sum + (products.find((p) => p.id === id)?.price || 0), 0))}
                    </p>
                    <button
                      onClick={() => {
                        setCart([])
                        notify('Demo checkout complete!')
                      }}
                      className="mt-3 min-h-11 rounded-xl px-5 text-sm font-bold text-white"
                      style={{ background: '#E3342F' }}
                    >
                      Simulate checkout
                    </button>
                  </>
                )}
              </div>
            </section>
          )}

          {['Orders', 'Customers', 'Analytics'].includes(page) && (
            <section className="rounded-2xl border p-6 sm:p-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'var(--surface-soft)', color: 'var(--cobalt)' }}>
                {page === 'Orders' ? <ShoppingBag /> : page === 'Customers' ? <Users /> : <Activity />}
              </div>
              <h2 className="mt-4 text-xl font-extrabold">{page}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: 'var(--muted)' }}>
                This section is a prototype placeholder. Real {page.toLowerCase()} data will be connected through the backend.
              </p>
              <button onClick={() => go('Storefront')} className="mt-5 min-h-11 rounded-xl px-4 text-sm font-bold text-white" style={{ background: '#E3342F' }}>
                Explore storefront
              </button>
            </section>
          )}
        </main>

        <footer className="flex flex-wrap justify-between gap-2 border-t px-5 py-4 text-xs sm:px-8" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          <span>© 2026 LaunchStore · Made for big ideas ✳</span>
          <span>Prototype · Sample data only</span>
        </footer>
      </div>

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-[60] mx-auto flex max-w-sm items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-xl sm:left-auto sm:right-6"
          style={{ background: '#282321' }}
        >
          <Check size={18} style={{ color: '#D9E8D8' }} />
          <span className="flex-1">{notice}</span>
          <button aria-label="Dismiss notification" onClick={() => setNotice('')}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
