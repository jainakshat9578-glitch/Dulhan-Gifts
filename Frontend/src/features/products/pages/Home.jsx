import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useProduct } from '../hook/useProduct'
import { PRODUCT_CATEGORIES } from '../product.constants'

const CATEGORY_DETAILS = {
  Cosmetics: { icon: '✳', tone: 'bg-rose-50 text-rose-800' },
  'Photo Frames': { icon: '▧', tone: 'bg-amber-50 text-amber-900' },
  'Home Decor': { icon: '⌂', tone: 'bg-orange-50 text-orange-900' },
  Stationery: { icon: '✎', tone: 'bg-sky-50 text-sky-800' },
  Undergarments: { icon: '♡', tone: 'bg-pink-50 text-pink-800' },
  Toys: { icon: '♧', tone: 'bg-lime-50 text-lime-800' },
  'Birthday Decor': { icon: '✦', tone: 'bg-violet-50 text-violet-800' },
  Gifts: { icon: '◇', tone: 'bg-amber-50 text-amber-900' },
  Food: { icon: '❋', tone: 'bg-emerald-50 text-emerald-800' },
}

function formatPrice(price) {
  const amount = Number(price?.amount)
  const currency = price?.currency || 'INR'
  if (!Number.isFinite(amount)) return 'Price unavailable'
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = product.images?.[0]?.url

  return (
    <Link to={`/product/${product._id}`} aria-label={`View ${product.title}`} className="group block overflow-hidden rounded-2xl border border-stone-200/80 bg-white text-left no-underline shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f1eee8]">
        {imageUrl && !imageFailed ? (
          <img
            className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
            src={imageUrl}
            alt={product.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="grid size-full place-items-center text-4xl text-amber-900/40" aria-label="Product image unavailable">◇</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-stone-700 shadow-sm">{product.category}</span>
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 min-h-12 font-serif text-xl font-normal leading-6 text-stone-900">{product.title}</h3>
        <p className="mt-3 text-lg font-semibold text-amber-900">{formatPrice(product.price)}</p>
        {product.description && <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">{product.description}</p>}
      </div>
    </Link>
  )
}

export default function Home() {
  const user = useSelector((state) => state.auth.user)
  const authLoading = useSelector((state) => state.auth.loading)
  const products = useSelector((state) => state.product.products)
  const loading = useSelector((state) => state.product.productsLoading)
  const error = useSelector((state) => state.product.productsError)
  const { handleGetAllProducts } = useProduct()
  const [selectedCategory, setSelectedCategory] = useState('All Products')

  useEffect(() => {
    handleGetAllProducts()
  }, [handleGetAllProducts])

  const filteredProducts = useMemo(() => (
    selectedCategory === 'All Products'
      ? products
      : products.filter((product) => product.category === selectedCategory)
  ), [products, selectedCategory])

  const exploreCollection = () => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <main className="min-h-screen bg-[#fbf9f5] font-sans text-stone-800">
      <header className="border-b border-stone-200/70 bg-[#fbf9f5]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight text-stone-900 no-underline sm:text-xl">
            <span className="grid size-10 place-items-center rounded-xl bg-stone-900 font-serif text-lg text-white">DG</span>
            Dulhan-Gifts
          </Link>
          <nav className="flex items-center gap-2 text-sm font-medium sm:gap-3" aria-label="Main navigation">
            <a className="hidden rounded-lg px-3 py-2 text-stone-600 no-underline hover:bg-white sm:inline-flex" href="#collection">Shop</a>
            {!authLoading && !user && <>
              <Link className="rounded-lg px-3 py-2 text-stone-700 no-underline hover:bg-white" to="/login">Sign in</Link>
              <Link className="rounded-lg bg-stone-900 px-4 py-2.5 text-white no-underline hover:bg-stone-800" to="/register">Join us</Link>
            </>}
            {!authLoading && user?.role === 'buyer' && <Link className="rounded-lg bg-stone-900 px-4 py-2.5 text-white no-underline hover:bg-stone-800" to="/" aria-label="Buyer account">{user.fullName || 'My account'}</Link>}
            {!authLoading && user?.role === 'seller' && <Link className="rounded-lg bg-stone-900 px-4 py-2.5 text-white no-underline hover:bg-stone-800" to="/seller/products" aria-label="Seller account">{user.fullName ? `${user.fullName} · Seller` : 'Seller account'}</Link>}
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-8 sm:py-16 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:py-20" aria-labelledby="hero-title">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[2px] text-amber-900/75">Everyday essentials, thoughtfully chosen</p>
          <h1 id="hero-title" className="font-serif text-5xl font-normal leading-[1.05] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">Little Things.<br /><span className="text-amber-900">Beautiful Memories.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">Discover thoughtful gifts, photo frames, cosmetics, home decor and everyday favourites chosen to bring a little joy to every day.</p>
          <button className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800" type="button" onClick={exploreCollection}>Explore Collection <span aria-hidden="true">↓</span></button>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-stone-500 sm:text-sm"><span>Curated with care</span><span>Something for everyone</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-2xl">
          <div className="absolute -inset-3 -rotate-2 rounded-[2rem] bg-[#eee6dc]" aria-hidden="true" />
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#efe4d6] via-[#e4d6c4] to-[#cbb8a0] shadow-xl">
            <img className="size-full object-cover" src="/dulhan-gifts-showcase.png" alt="A warm collection of stationery, cosmetics, a teddy bear, a photo frame, and home decor" onError={(event) => { event.currentTarget.style.display = 'none' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/45 via-transparent to-transparent" aria-hidden="true" />
            <p className="absolute bottom-5 left-5 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-medium tracking-wide text-white backdrop-blur-sm sm:bottom-7 sm:left-7 sm:text-sm">A little joy for every day</p>
          </div>
          <div className="absolute -bottom-4 right-2 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg sm:-right-4 sm:px-5"><p className="m-0 font-serif text-lg text-stone-900">Made for moments</p><p className="m-0 mt-0.5 text-xs text-stone-500">Big and small</p></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14" aria-labelledby="categories-title">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-[1.7px] text-amber-900/75">Find your favourites</p><h2 id="categories-title" className="font-serif text-3xl font-normal text-stone-900 sm:text-4xl">Shop by category</h2></div>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
          <div className="flex w-max min-w-full gap-3 sm:grid sm:w-auto sm:grid-cols-3 lg:grid-cols-5">
            <button className={`flex min-h-[88px] min-w-36 items-center gap-3 rounded-2xl border px-4 text-left transition sm:min-w-0 ${selectedCategory === 'All Products' ? 'border-stone-900 bg-stone-900 text-white shadow-sm' : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300'}`} type="button" aria-pressed={selectedCategory === 'All Products'} onClick={() => setSelectedCategory('All Products')}>
              <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-xl ${selectedCategory === 'All Products' ? 'bg-white/15 text-white' : 'bg-[#f5f2ed] text-amber-900'}`} aria-hidden="true">✧</span><span><span className="block text-sm font-semibold">All Products</span><span className={`mt-1 block text-xs ${selectedCategory === 'All Products' ? 'text-white/70' : 'text-stone-500'}`}>{products.length} items</span></span>
            </button>
            {PRODUCT_CATEGORIES.map((category) => {
              const active = selectedCategory === category
              const details = CATEGORY_DETAILS[category]
              const count = products.filter((product) => product.category === category).length
              return (
                <button key={category} className={`flex min-h-[88px] min-w-36 items-center gap-3 rounded-2xl border px-4 text-left transition sm:min-w-0 ${active ? 'border-amber-800 bg-amber-800 text-white shadow-sm' : 'border-stone-200 bg-white text-stone-700 hover:border-amber-300'}`} type="button" aria-pressed={active} onClick={() => setSelectedCategory(category)}>
                  <span className={`grid size-11 shrink-0 place-items-center rounded-xl text-xl ${active ? 'bg-white/15 text-white' : details.tone}`} aria-hidden="true">{details.icon}</span><span><span className="block text-sm font-semibold">{category}</span><span className={`mt-1 block text-xs ${active ? 'text-white/70' : 'text-stone-500'}`}>{count} {count === 1 ? 'item' : 'items'}</span></span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section id="collection" className="mx-auto max-w-7xl scroll-mt-6 px-4 pb-16 pt-8 sm:px-8 sm:pb-24" aria-labelledby="collection-title">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-[1.7px] text-amber-900/75">Thoughtful finds, just for you</p><h2 id="collection-title" className="font-serif text-3xl font-normal text-stone-900 sm:text-4xl">{selectedCategory === 'All Products' ? 'The collection' : selectedCategory}</h2></div>
          {!loading && !error && <p className="m-0 rounded-full bg-white px-4 py-2 text-sm text-stone-600 shadow-sm">{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}</p>}
        </div>

        {loading && <div className="rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center text-sm text-stone-600" role="status"><span className="mx-auto mb-4 block size-8 animate-spin rounded-full border-2 border-stone-200 border-t-amber-800" aria-hidden="true" />Finding lovely things for you…</div>}
        {!loading && error && <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center" role="alert"><h3 className="font-serif text-2xl font-normal text-stone-900">We couldn’t load the collection</h3><p className="mt-2 text-sm text-red-800">{error}</p><button className="mt-5 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800" type="button" onClick={handleGetAllProducts}>Try again</button></div>}
        {!loading && !error && products.length === 0 && <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center"><span className="text-3xl text-amber-900" aria-hidden="true">✧</span><h3 className="mt-4 font-serif text-2xl font-normal text-stone-900">Your collection is taking shape</h3><p className="mt-2 text-sm text-stone-600">New finds will be here soon. Please check back again.</p></div>}
        {!loading && !error && products.length > 0 && filteredProducts.length === 0 && <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center"><h3 className="font-serif text-2xl font-normal text-stone-900">Nothing in this category just yet</h3><p className="mt-2 text-sm text-stone-600">Explore the full collection to see all available products.</p><button className="mt-5 rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50" type="button" onClick={() => setSelectedCategory('All Products')}>View all products</button></div>}
        {!loading && !error && filteredProducts.length > 0 && <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filteredProducts.map((product) => <ProductCard key={product._id} product={product} />)}</div>}
      </section>

      <footer className="border-t border-stone-200/80 bg-white/70 px-4 py-8 text-center text-xs text-stone-500 sm:px-8"><p className="m-0">© 2026 Dulhan-Gifts · Thoughtful things, chosen with care.</p></footer>
    </main>
  )
}
