import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { useProduct } from '../hook/useProduct'

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

function ErrorState({ message, status, onRetry }) {
  const notFound = status === 404
  return (
    <section className="mx-auto w-full max-w-xl rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm" role="alert">
      <p className="text-xs font-semibold uppercase tracking-[1.6px] text-amber-900">{notFound ? 'Product unavailable' : 'Seller studio'}</p>
      <h1 className="mt-4 font-serif text-3xl text-stone-900">{notFound ? 'Product not found' : 'Unable to load product'}</h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">{notFound ? 'This product may have been removed or may not belong to your seller account.' : message || 'Please check your connection and try again.'}</p>
      {!notFound && <button type="button" onClick={onRetry} className="mt-7 rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800">Try again</button>}
      <div><Link to="/seller/products" className="mt-4 inline-flex rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800 no-underline hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800">Back to My products</Link></div>
    </section>
  )
}

export default function SellerProductDetails() {
  const { productId } = useParams()
  const { handleGetSellerProductById, handleProductVariant } = useProduct()
  const product = useSelector((state) => state.product.selectedProduct)
  const selectedProductId = useSelector((state) => state.product.selectedProductId)
  const loading = useSelector((state) => state.product.productDetailsLoading)
  const error = useSelector((state) => state.product.productDetailsError)
  const errorStatus = useSelector((state) => state.product.productDetailsStatus)
  const [imageView, setImageView] = useState({ productId: null, active: null, failed: [] })
  const [selectedVariant, setSelectedVariant] = useState({ productId: null, key: null })
  const [stock, setStock] = useState('0')
  const [price, setPrice] = useState('')
  const [attributes, setAttributes] = useState([{ key: '', value: '' }])
  const [files, setFiles] = useState([])
  const [isDraggingFiles, setIsDraggingFiles] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')

  useEffect(() => {
    handleGetSellerProductById(productId)
  }, [productId, handleGetSellerProductById])

  const currentProduct = selectedProductId === productId ? product : null
  const imageUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files])
  useEffect(() => () => imageUrls.forEach((url) => URL.revokeObjectURL(url)), [imageUrls])

  const variants = Array.isArray(currentProduct?.variants) ? currentProduct.variants : []
  const variantKey = (variant, index) => String(variant?._id || `variant-${index}`)
  const currentVariant = variants.find((variant, index) => variantKey(variant, index) === (selectedVariant.productId === productId ? selectedVariant.key : null)) || variants[0] || null
  const currentVariantIndex = currentVariant ? variants.indexOf(currentVariant) : -1
  const currentVariantKey = currentVariant ? variantKey(currentVariant, currentVariantIndex) : null
  const variantImages = Array.isArray(currentVariant?.images)
    ? currentVariant.images.filter((image) => typeof image?.url === 'string' && image.url.trim())
    : []
  const productImages = Array.isArray(currentProduct?.images)
    ? currentProduct.images.filter((image) => typeof image?.url === 'string' && image.url.trim())
    : []
  const galleryImages = variantImages.length ? variantImages : productImages
  const galleryKey = `${productId}:${currentVariantKey || 'base'}`
  const failedImages = imageView.productId === galleryKey ? imageView.failed : []
  const activeImage = imageView.productId === galleryKey ? imageView.active : null
  const availableImages = galleryImages.filter((image) => !failedImages.includes(image.url))
  const mainImage = availableImages.find((image) => image.url === activeImage)?.url || availableImages[0]?.url || null
  const activeImageIndex = Math.max(availableImages.findIndex((image) => image.url === mainImage), 0)

  function showImage(index) {
    if (!availableImages.length) return
    setImageView({ productId: galleryKey, active: availableImages[(index + availableImages.length) % availableImages.length].url, failed: failedImages })
  }

  function failImage(url) {
    setImageView((previous) => {
      const failed = previous.productId === galleryKey ? previous.failed : []
      return { productId: galleryKey, active: previous.productId === galleryKey ? previous.active : null, failed: failed.includes(url) ? failed : [...failed, url] }
    })
  }

  function addFiles(event) {
    addSelectedFiles(Array.from(event.target.files || []))
    event.target.value = ''
  }

  function addSelectedFiles(chosen) {
    setSubmitError('')
    setSubmitSuccess('')
    const validFiles = chosen.filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    if (validFiles.length !== chosen.length) setSubmitError('Choose JPEG, PNG or WebP images only.')
    const remaining = 7 - files.length
    if (validFiles.length > remaining) setSubmitError('You can add up to 7 images. Remove an image to choose another.')
    setFiles((previous) => [...previous, ...validFiles.slice(0, Math.max(remaining, 0))])
  }

  function updateAttribute(index, field, value) {
    setAttributes((previous) => previous.map((attribute, row) => row === index ? { ...attribute, [field]: value } : attribute))
  }

  async function submitVariant(event) {
    event.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')
    if (!/^(0|[1-9]\d*)$/.test(stock)) {
      setSubmitError('Enter a non-negative whole number for stock.')
      return
    }
    if (price.trim() && (!Number.isFinite(Number(price)) || Number(price) <= 0)) {
      setSubmitError('Enter a price greater than zero, or leave it blank to use the product price.')
      return
    }

    const attributeObject = {}
    for (const attribute of attributes) {
      const key = attribute.key.trim()
      const value = attribute.value.trim()
      if (Boolean(key) !== Boolean(value)) {
        setSubmitError('Complete both the name and value for each attribute, or remove the empty row.')
        return
      }
      if (key) attributeObject[key] = value
    }

    setIsSubmitting(true)
    try {
      const response = await handleProductVariant(productId, {
        stock: Number(stock),
        price: price.trim() ? Number(price) : '',
        attributes: attributeObject,
        images: files.map((file) => ({ file })),
      })
      if (response?.success !== true) throw new Error(response?.message || 'The variant could not be added.')
      const refreshedProduct = await handleGetSellerProductById(productId)
      const refreshedVariants = Array.isArray(refreshedProduct?.variants) ? refreshedProduct.variants : []
      const newVariant = refreshedVariants[refreshedVariants.length - 1]
      if (newVariant) setSelectedVariant({ productId, key: String(newVariant._id || `variant-${refreshedVariants.length - 1}`) })
      setSubmitSuccess('Variant added successfully.')
      setStock('0')
      setPrice('')
      setAttributes([{ key: '', value: '' }])
      setFiles([])
    } catch (requestError) {
      setSubmitError(requestError.response?.data?.message || requestError.message || 'The variant could not be added. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f4] font-sans text-stone-800">
      <header className="border-b border-stone-200/80 bg-[#faf8f4]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <Link to="/" className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight text-stone-900 no-underline sm:text-xl"><span className="grid size-10 place-items-center rounded-xl bg-stone-900 font-serif text-lg text-white">DG</span>Dulhan-Gifts</Link>
          <nav className="flex gap-2 text-sm font-medium" aria-label="Seller navigation"><Link to="/seller/products" className="rounded-lg px-3 py-2 text-stone-700 no-underline hover:bg-white">My products</Link><Link to="/seller/products/new" className="rounded-lg bg-amber-800 px-3 py-2 text-white no-underline hover:bg-amber-900">Add product</Link></nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1360px] px-4 py-7 sm:px-8 sm:py-10">
        {loading && <div className="grid animate-pulse gap-6 lg:grid-cols-2" role="status" aria-label="Loading product details"><div className="h-[min(55vh,440px)] min-h-[300px] rounded-3xl bg-stone-200" /><div className="h-80 rounded-3xl border border-stone-200 bg-white" /><span className="sr-only">Loading product details…</span></div>}
        {!loading && error && <ErrorState status={errorStatus} message={error} onRetry={() => handleGetSellerProductById(productId)} />}
        {!loading && !error && currentProduct && <>
          <div className="mb-7"><Link to="/seller/products" className="text-sm font-medium text-amber-900 no-underline hover:underline">← My products</Link><p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-[1.7px] text-amber-900/75">Seller studio</p><h1 className="font-serif text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl">Product details</h1></div>

          <section className="grid min-w-0 items-start gap-6 sm:gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10" aria-labelledby="product-title">
            <div className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-4 lg:grid-cols-[76px_minmax(0,1fr)]">
              {availableImages.length > 1 && <div className="flex max-h-[min(60vh,460px)] flex-col gap-3 overflow-y-auto py-1 pr-1" role="group" aria-label="Choose product image">{availableImages.map((image, index) => <button key={`${image.url}-${index}`} type="button" onClick={() => setImageView({ productId: galleryKey, active: image.url, failed: failedImages })} aria-label={`Show product image ${index + 1}`} aria-pressed={image.url === mainImage} className={`aspect-square w-full shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 ${image.url === mainImage ? 'border-amber-800' : 'border-stone-200 hover:border-amber-500'}`}><img src={image.url} alt="" className="size-full object-contain" onError={() => failImage(image.url)} /></button>)}</div>}
              <div className="relative flex h-[min(55vh,440px)] min-h-[300px] min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
                {mainImage ? <img key={mainImage} src={mainImage} alt={currentProduct.title || 'Product image'} className="block size-full object-contain object-center" onError={() => failImage(mainImage)} /> : <div className="flex flex-col items-center gap-3 text-center text-stone-500" role="img" aria-label="Product image unavailable"><span className="font-serif text-5xl text-amber-900/50">DG</span><p className="text-sm">Product image unavailable</p></div>}
                {availableImages.length > 1 && mainImage && <><button type="button" onClick={() => showImage(activeImageIndex - 1)} aria-label="Previous product image" className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-stone-200 bg-white/95 text-2xl shadow-sm hover:bg-white">‹</button><button type="button" onClick={() => showImage(activeImageIndex + 1)} aria-label="Next product image" className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-stone-200 bg-white/95 text-2xl shadow-sm hover:bg-white">›</button><span className="absolute bottom-3 right-3 rounded-full bg-stone-900/75 px-3 py-1 text-xs text-white">{activeImageIndex + 1} / {availableImages.length}</span></>}
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8 lg:p-9">
              <span className="inline-flex rounded-full bg-[#f5f0e8] px-3 py-1.5 text-xs font-semibold text-amber-950">{currentProduct.category || 'Uncategorised'}</span>
              <h2 id="product-title" className="mt-5 break-words font-serif text-3xl font-medium leading-tight tracking-tight text-stone-900 sm:text-4xl">{currentProduct.title || 'Untitled product'}</h2>
              {!currentVariant && <p className="mt-5 text-2xl font-semibold tracking-tight text-amber-900 sm:text-3xl">{formatPrice(currentProduct.price)}</p>}
              <div className="my-6 border-t border-stone-200" /><h3 className="text-xs font-semibold uppercase tracking-[1.7px] text-stone-500">Product details</h3>
              <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-stone-600 sm:text-base">{currentProduct.description?.trim() || 'No description is available for this product yet.'}</p>
            </div>
          </section>

          <section className="mt-7" aria-labelledby="variants-heading">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-[11px] font-semibold uppercase tracking-[1.6px] text-amber-900/75">Product options</p><h2 id="variants-heading" className="mt-1 font-serif text-2xl text-stone-900">More options</h2></div>
              <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600">{variants.length} {variants.length === 1 ? 'variant' : 'variants'}</span>
            </div>
            {variants.length ? <div className="-mx-1 overflow-x-auto px-1 pb-2" role="group" aria-label="Select a product variant"><ul className="flex w-max min-w-full list-none gap-3 p-0">{variants.map((variant, index) => {
              const key = variantKey(variant, index)
              const isSelected = key === currentVariantKey
              const attributes = Object.entries(variant.attributes || {})
              const shortName = attributes.map(([, value]) => String(value)).join(' / ') || `Option ${index + 1}`
              const thumbnail = Array.isArray(variant.images) ? variant.images.find((image) => typeof image?.url === 'string' && image.url.trim())?.url : null
              return <li key={key} className="w-[84px] shrink-0 sm:w-[96px]"><button type="button" onClick={() => { setSelectedVariant({ productId, key }); setImageView({ productId: `${productId}:${key}`, active: null, failed: [] }) }} aria-pressed={isSelected} aria-label={`Select variant ${shortName}`} className={`group block w-full rounded-xl border-2 p-1.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 ${isSelected ? 'border-stone-900 bg-white shadow-sm' : 'border-stone-200 bg-white hover:border-amber-700'}`}><span className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-lg bg-[#f7f5f1]"><span className="font-serif text-lg text-amber-900/50" aria-hidden="true">DG</span>{thumbnail && <img src={thumbnail} alt="" className="absolute inset-0 size-full bg-[#f7f5f1] object-contain p-1" onError={(event) => { event.currentTarget.style.display = 'none' }} />}</span><span className={`mt-1.5 block truncate text-center text-xs font-semibold ${isSelected ? 'text-stone-900' : 'text-stone-600'}`}>{shortName}</span></button></li>
            })}</ul></div> : <p className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-4 text-sm text-stone-600">No variants yet. The base product images and price are shown above.</p>}
            {currentVariant && <div className="mt-3 rounded-xl border border-stone-200 bg-white px-4 py-3"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xl font-semibold tracking-tight text-amber-900">{formatPrice(currentVariant.price || currentProduct.price)}</p><span className="rounded-full bg-[#f5f0e8] px-3 py-1.5 text-xs font-semibold text-amber-950">Stock: {Number.isFinite(Number(currentVariant.stock)) ? currentVariant.stock : 0}</span></div>{Object.entries(currentVariant.attributes || {}).length > 0 && <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 border-t border-stone-100 pt-2 text-xs">{Object.entries(currentVariant.attributes || {}).map(([key, value]) => <div key={key} className="flex gap-1"><dt className="font-semibold text-stone-700">{key}:</dt><dd className="text-stone-600">{String(value)}</dd></div>)}</dl>}</div>}
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm" aria-labelledby="add-variant-heading">
            <div className="border-b border-stone-100 px-5 py-4 sm:px-6"><p className="text-[11px] font-semibold uppercase tracking-[1.6px] text-amber-900/75">Inventory management</p><h2 id="add-variant-heading" className="mt-1 font-serif text-2xl text-stone-900">Add a variant</h2><p className="mt-1 text-sm text-stone-600">Create another option for this product.</p></div>
            <form onSubmit={submitVariant} className="divide-y divide-stone-100">
              <section className="px-5 py-5 sm:px-6" aria-labelledby="pricing-heading"><div className="mb-4"><h3 id="pricing-heading" className="text-sm font-semibold text-stone-800">Pricing and inventory</h3><p className="mt-1 text-xs text-stone-500">Keep the parent price or set a price for this option.</p></div><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="variant-price" className="mb-1.5 block text-xs font-semibold text-stone-700">Variant price <span className="font-normal text-stone-500">(optional)</span></label><input id="variant-price" type="number" min="0.01" step="0.01" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} placeholder={formatPrice(currentProduct.price)} disabled={isSubmitting} className="min-h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-amber-800 focus:ring-2 focus:ring-amber-800/10 disabled:bg-stone-50" /><p className="mt-1.5 text-xs text-stone-500">Default: parent product price <span className="font-semibold text-stone-700">{formatPrice(currentProduct.price)}</span></p></div><div><label htmlFor="variant-stock" className="mb-1.5 block text-xs font-semibold text-stone-700">Stock quantity</label><input id="variant-stock" type="number" min="0" step="1" inputMode="numeric" required value={stock} onChange={(event) => setStock(event.target.value)} disabled={isSubmitting} className="min-h-10 w-full rounded-lg border border-stone-300 px-3 text-sm outline-none transition focus:border-amber-800 focus:ring-2 focus:ring-amber-800/10 disabled:bg-stone-50" /></div></div></section>

              <section className="px-5 py-5 sm:px-6" aria-labelledby="attributes-heading"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 id="attributes-heading" className="text-sm font-semibold text-stone-800">Variant attributes</h3><p className="mt-1 text-xs text-stone-500">Add details such as color, size or flavour.</p></div><button type="button" onClick={() => setAttributes((previous) => [...previous, { key: '', value: '' }])} disabled={isSubmitting} className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-amber-700 hover:text-amber-900 disabled:opacity-50">＋ Add attribute</button></div><div className="space-y-2">{attributes.map((attribute, index) => <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-2" key={index}><label className="sr-only" htmlFor={`attribute-key-${index}`}>Attribute name {index + 1}</label><input id={`attribute-key-${index}`} value={attribute.key} onChange={(event) => updateAttribute(index, 'key', event.target.value)} placeholder="Color" disabled={isSubmitting} className="min-h-10 min-w-0 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-amber-800 focus:ring-2 focus:ring-amber-800/10 disabled:bg-stone-50" /><label className="sr-only" htmlFor={`attribute-value-${index}`}>Attribute value {index + 1}</label><input id={`attribute-value-${index}`} value={attribute.value} onChange={(event) => updateAttribute(index, 'value', event.target.value)} placeholder="Black" disabled={isSubmitting} className="min-h-10 min-w-0 rounded-lg border border-stone-300 px-3 text-sm outline-none focus:border-amber-800 focus:ring-2 focus:ring-amber-800/10 disabled:bg-stone-50" />{attributes.length > 1 && <button type="button" onClick={() => setAttributes((previous) => previous.filter((_, row) => row !== index))} disabled={isSubmitting} aria-label={`Remove attribute ${index + 1}`} className="rounded-lg px-2 py-2 text-xs font-medium text-stone-500 hover:bg-stone-100 hover:text-stone-900 disabled:opacity-50">Remove</button>}</div>)}</div></section>

              <section className="px-5 py-5 sm:px-6" aria-labelledby="variant-images-heading"><div className="mb-3"><h3 id="variant-images-heading" className="text-sm font-semibold text-stone-800">Variant images</h3><p className="mt-1 text-xs text-stone-500">Add up to 7 images in JPEG, PNG or WebP format.</p></div><label htmlFor="variant-images" onDragEnter={(event) => { event.preventDefault(); setIsDraggingFiles(true) }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setIsDraggingFiles(false) }} onDrop={(event) => { event.preventDefault(); setIsDraggingFiles(false); addSelectedFiles(Array.from(event.dataTransfer.files || [])) }} className={`flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-4 text-center transition ${isDraggingFiles ? 'border-amber-700 bg-amber-50' : 'border-stone-300 bg-[#fbfaf8] hover:border-amber-700 hover:bg-amber-50/40'} ${isSubmitting || files.length >= 7 ? 'pointer-events-none opacity-60' : ''}`}><span className="grid size-9 place-items-center rounded-lg bg-white text-lg text-amber-900 shadow-sm" aria-hidden="true">↑</span><span className="mt-2 text-sm font-semibold text-stone-800">Drop images here or <span className="text-amber-900 underline">browse files</span></span><span className="mt-1 text-xs text-stone-500">{files.length} of 7 selected</span><input id="variant-images" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addFiles} disabled={isSubmitting || files.length >= 7} className="sr-only" /></label>{imageUrls.length > 0 && <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7" aria-label="Selected image previews">{imageUrls.map((url, index) => <li key={`${url}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-stone-200 bg-[#fbfaf8]"><img src={url} alt={`Selected variant image ${index + 1}`} className="size-full object-contain p-1" /><button type="button" onClick={() => setFiles((previous) => previous.filter((_, fileIndex) => fileIndex !== index))} disabled={isSubmitting} aria-label={`Remove selected image ${index + 1}`} className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-stone-900/85 text-xs text-white hover:bg-stone-900">×</button></li>)}</ul>}</section>

              <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">{submitError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{submitError}</p>}{submitSuccess && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">{submitSuccess}</p>}<button type="submit" disabled={isSubmitting} className="flex min-h-11 w-full items-center justify-center rounded-lg bg-amber-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 disabled:cursor-not-allowed disabled:bg-stone-400 sm:ml-auto sm:w-auto">{isSubmitting ? 'Adding variant…' : 'Add variant'}</button></div>
            </form>
          </section>
        </>}
        {!loading && !error && !currentProduct && <ErrorState message="We could not find usable details for this product." onRetry={() => handleGetSellerProductById(productId)} />}
      </div>
    </main>
  )
}
