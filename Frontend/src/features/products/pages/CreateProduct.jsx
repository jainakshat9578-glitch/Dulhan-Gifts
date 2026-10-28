import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useProduct } from '../hook/useProduct'
import { MAX_PRODUCT_IMAGES, MAX_PRODUCT_IMAGE_SIZE, PRODUCT_CATEGORIES, PRODUCT_CURRENCIES, PRODUCT_IMAGE_TYPES } from '../product.constants'

const fieldClass = 'w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-amber-800 focus:ring-4 focus:ring-amber-800/10'
const labelClass = 'mb-2 block text-sm font-medium text-stone-700'

function getErrorMessage(error) {
  const data = error.response?.data
  const validation = Array.isArray(data?.errors) ? data.errors.map(({ msg }) => msg).filter(Boolean).join(' ') : ''
  return validation || data?.message || error.message || 'We could not save this product. Please try again.'
}

export default function CreateProduct() {
  const { handleCreateProduct, handleGetSellerProduct } = useProduct()
  const navigate = useNavigate()
  const fileInput = useRef(null)
  const [form, setForm] = useState({ title: '', description: '', category: '', priceAmount: '', priceCurrency: 'INR' })
  const [images, setImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const previews = useMemo(() => images.map((file) => ({ file, url: URL.createObjectURL(file) })), [images])
  useEffect(() => () => previews.forEach(({ url }) => URL.revokeObjectURL(url)), [previews])

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setError('')
    setSuccess('')
  }

  function addImages(event) {
    const selected = Array.from(event.target.files || [])
    event.target.value = ''
    setError('')
    setSuccess('')
    const next = [...images]
    for (const file of selected) {
      if (!PRODUCT_IMAGE_TYPES.includes(file.type)) { setError(`${file.name}: choose a JPEG, PNG, or WebP image.`); break }
      if (file.size > MAX_PRODUCT_IMAGE_SIZE) { setError(`${file.name}: each image must be 5 MB or smaller.`); break }
      if (next.length >= MAX_PRODUCT_IMAGES) { setError('You can add up to 7 images.'); break }
      next.push(file)
    }
    setImages(next)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!form.title.trim() || !form.description.trim() || !form.category || !form.priceAmount) { setError('Complete all product fields before submitting.'); return }
    if (!Number.isFinite(Number(form.priceAmount)) || Number(form.priceAmount) <= 0) { setError('Enter a price greater than zero.'); return }
    if (!images.length) { setError('Add at least one product image.'); return }
    setIsSubmitting(true)
    try {
      await handleCreateProduct({ ...form, images })
      setForm({ title: '', description: '', category: '', priceAmount: '', priceCurrency: 'INR' })
      setImages([])
      if (fileInput.current) fileInput.current.value = ''
      setSuccess('Product created successfully.')
      try {
        await handleGetSellerProduct()
      } catch {
        setError('The product was created, but your product list could not be refreshed. Open My products to try again.')
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f6f2] px-4 py-6 font-sans text-stone-800 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-3 text-xl font-semibold tracking-tight text-stone-900 no-underline"><span className="grid size-10 place-items-center rounded-xl bg-stone-900 font-serif text-lg text-white">DG</span>Dulhan-Gifts</Link>
          <nav className="flex gap-2 text-sm font-medium" aria-label="Seller navigation">
            <Link className="rounded-lg px-4 py-2.5 text-stone-600 hover:bg-white" to="/seller/products">My products</Link>
            <Link className="rounded-lg bg-stone-900 px-4 py-2.5 text-white" to="/seller/products/new">Add product</Link>
          </nav>
        </header>
        <section className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[1.7px] text-amber-900/75">Seller studio</p>
          <h1 className="font-serif text-4xl font-normal tracking-tight text-stone-900">Add a product</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">Share something thoughtfully chosen with your customers.</p>
        </section>
        <form onSubmit={handleSubmit} className="grid gap-6 rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm sm:p-8" noValidate>
          <div className="grid gap-5 md:grid-cols-2">
            <div><label className={labelClass} htmlFor="title">Product title</label><input className={fieldClass} id="title" name="title" maxLength={120} value={form.title} onChange={updateField} placeholder="e.g. Hand-painted keepsake frame" required /></div>
            <div><label className={labelClass} htmlFor="category">Category</label><select className={fieldClass} id="category" name="category" value={form.category} onChange={updateField} required><option value="">Choose a category</option>{PRODUCT_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></div>
          </div>
          <div><label className={labelClass} htmlFor="description">Description</label><textarea className={`${fieldClass} min-h-32 resize-y`} id="description" name="description" maxLength={2000} value={form.description} onChange={updateField} placeholder="Describe the details, materials, or occasion…" required /></div>
          <div className="grid gap-5 sm:grid-cols-[1fr_180px]">
            <div><label className={labelClass} htmlFor="priceAmount">Price</label><input className={fieldClass} id="priceAmount" name="priceAmount" type="number" min="0.01" step="0.01" inputMode="decimal" value={form.priceAmount} onChange={updateField} placeholder="0.00" required /></div>
            <div><label className={labelClass} htmlFor="priceCurrency">Currency</label><select className={fieldClass} id="priceCurrency" name="priceCurrency" value={form.priceCurrency} onChange={updateField}>{PRODUCT_CURRENCIES.map((currency) => <option key={currency} value={currency}>{currency}</option>)}</select></div>
          </div>
          <div>
            <label className={labelClass} htmlFor="images">Product images</label>
            <input ref={fileInput} className="block w-full rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-600 file:mr-4 file:rounded-lg file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-stone-700" id="images" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addImages} />
            <p className="mt-2 text-xs text-stone-500">JPEG, PNG, or WebP · up to 7 images · 5 MB maximum each</p>
            {previews.length > 0 && <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{previews.map(({ file, url }, index) => <li key={`${file.name}-${file.lastModified}-${index}`} className="relative overflow-hidden rounded-xl border border-stone-200 bg-stone-50"><img className="aspect-square w-full object-cover" src={url} alt={`Preview of ${file.name}`} /><button className="absolute right-2 top-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-stone-800 shadow hover:bg-white" type="button" onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))} aria-label={`Remove ${file.name}`}>Remove</button><p className="truncate px-2 py-1.5 text-xs text-stone-600">{file.name}</p></li>)}</ul>}
          </div>
          {error && <p className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800" role="alert">{error}</p>}
          {success && <p className="m-0 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-5 text-green-900" role="status">{success} <Link className="font-semibold underline underline-offset-2" to="/seller/products">View your products</Link></p>}
          <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
            <button className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50" type="button" onClick={() => navigate('/seller/products')}>Cancel</button>
            <button className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving product…' : 'Create product'}</button>
          </div>
        </form>
      </div>
    </main>
  )
}
