import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { filterSellerProducts, useProduct } from '../hook/useProduct'
import { PRODUCT_CATEGORIES } from '../product.constants'

const PRODUCT_FILTERS = ['All Products', ...PRODUCT_CATEGORIES]

function getErrorMessage(error) {
  const data = error.response?.data
  return data?.message || error.message || 'We could not load your products. Please try again.'
}

function formatPrice(price) {
  const amount = Number(price?.amount)
  if (!Number.isFinite(amount)) return 'Price unavailable'
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: price.currency || 'INR' }).format(amount) }
  catch { return `${price.currency || 'INR'} ${amount.toFixed(2)}` }
}

export default function SellerProducts() {
  const { handleGetSellerProduct } = useProduct()
  const products = useSelector((state) => state.product.sellerProducts)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All Products')
  const filteredProducts = useMemo(() => filterSellerProducts(products, selectedCategory), [products, selectedCategory])

  useEffect(() => {
    let active = true
    handleGetSellerProduct().catch((requestError) => { if (active) setError(getErrorMessage(requestError)) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [handleGetSellerProduct])

  return (
    <main className="min-h-screen bg-[#f8f6f2] px-4 py-6 font-sans text-stone-800 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-3 text-xl font-semibold tracking-tight text-stone-900 no-underline"><span className="grid size-10 place-items-center rounded-xl bg-stone-900 font-serif text-lg text-white">DG</span>Dulhan-Gifts</Link>
          <nav className="flex gap-2 text-sm font-medium" aria-label="Seller navigation"><Link className="rounded-lg bg-stone-900 px-4 py-2.5 text-white" to="/seller/products">My products</Link><Link className="rounded-lg bg-amber-800 px-4 py-2.5 text-white hover:bg-amber-900" to="/seller/products/new">Add product</Link></nav>
        </header>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-[1.7px] text-amber-900/75">Seller studio</p><h1 className="font-serif text-4xl font-normal tracking-tight text-stone-900">My products</h1><p className="mt-2 text-sm text-stone-600">Manage the products you have shared with your customers.</p></div>
          {!loading && !error && <p className="rounded-full bg-white px-4 py-2 text-sm text-stone-600 shadow-sm">{products.length} {products.length === 1 ? 'product' : 'products'}</p>}
        </div>
        {!loading && !error && <section className="mb-6" aria-label="Filter products by category">
          <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <div className="flex w-max min-w-full gap-2" role="tablist" aria-label="Product categories">
              {PRODUCT_FILTERS.map((category) => {
                const active = selectedCategory === category
                const count = filterSellerProducts(products, category).length
                return <button key={category} id={`category-tab-${PRODUCT_FILTERS.indexOf(category)}`} className={`inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 ${active ? 'border-stone-900 bg-stone-900 text-white shadow-sm' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900'}`} type="button" role="tab" aria-selected={active} onClick={() => setSelectedCategory(category)}>
                  {category}<span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-500'}`}>{count}</span>
                </button>
              })}
            </div>
          </div>
          <p className="mt-2 text-xs text-stone-500" aria-live="polite">Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}{selectedCategory !== 'All Products' ? ` in ${selectedCategory}` : ''}</p>
        </section>}
        {loading && <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center text-sm text-stone-600" role="status">Loading your products…</div>}
        {!loading && error && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800" role="alert"><p>{error}</p><button className="mt-3 rounded-lg bg-white px-4 py-2 font-semibold text-red-900" type="button" onClick={() => { setError(''); setLoading(true); handleGetSellerProduct().catch((requestError) => setError(getErrorMessage(requestError))).finally(() => setLoading(false)) }}>Try again</button></div>}
        {!loading && !error && products.length === 0 && selectedCategory === 'All Products' && <section className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f5f2ed] text-2xl text-amber-900" aria-hidden="true">＋</div><h2 className="mt-5 font-serif text-2xl font-normal text-stone-900">Your product shelf is empty</h2><p className="mt-2 text-sm text-stone-600">Add your first product to get started.</p><Link className="mt-6 inline-flex rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white no-underline hover:bg-stone-800" to="/seller/products/new">Add your first product</Link></section>}
        {!loading && !error && selectedCategory !== 'All Products' && filteredProducts.length === 0 && <section className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#f5f2ed] text-2xl text-amber-900" aria-hidden="true">⌕</div><h2 className="mt-5 font-serif text-2xl font-normal text-stone-900">No {selectedCategory} products yet</h2><p className="mt-2 text-sm text-stone-600">Products you add in this category will appear here.</p><button className="mt-6 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800" type="button" onClick={() => setSelectedCategory('All Products')}>View all products</button></section>}
        {!loading && !error && filteredProducts.length > 0 && <ul className="grid list-none gap-5 p-0 sm:grid-cols-2 xl:grid-cols-3">{filteredProducts.map((product) => <li key={product._id} className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm"><div className="aspect-[4/3] bg-stone-100">{product.images?.[0]?.url ? <img className="size-full object-cover" src={product.images[0].url} alt={product.title} loading="lazy" /> : <div className="grid size-full place-items-center text-sm text-stone-500">No image available</div>}</div><div className="p-5"><div className="flex items-start justify-between gap-3"><h2 className="font-serif text-xl font-normal leading-snug text-stone-900">{product.title}</h2><span className="shrink-0 rounded-full bg-[#f5f2ed] px-3 py-1 text-xs font-medium text-stone-700">{product.category}</span></div><p className="mt-3 text-lg font-semibold text-amber-900">{formatPrice(product.price)}</p>{product.description && <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-6 text-stone-600">{product.description}</p>}</div></li>)}</ul>}
      </div>
    </main>
  )
}
