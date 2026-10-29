
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { useProduct } from '../hook/useProduct'

function formatPrice(price) {
  const amount = Number(price?.amount)
  const currency = price?.currency

  if (!Number.isFinite(amount) || !currency) {
    return 'Price unavailable'
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

function LoadingState() {
  return (
    <div
      className="grid w-full animate-pulse items-start gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10"
      role="status"
      aria-label="Loading product details"
    >
      <div className="h-[min(55vh,440px)] min-h-[300px] rounded-2xl bg-stone-200 sm:rounded-3xl" />

      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:rounded-3xl sm:p-8">
        <div className="h-5 w-24 rounded bg-stone-200" />
        <div className="mt-6 h-9 w-4/5 rounded bg-stone-200" />
        <div className="mt-5 h-7 w-36 rounded bg-stone-200" />
        <div className="my-6 h-px bg-stone-200" />
        <div className="h-4 w-32 rounded bg-stone-200" />
        <div className="mt-4 h-4 rounded bg-stone-200" />
        <div className="mt-3 h-4 w-4/5 rounded bg-stone-200" />
      </div>

      <span className="sr-only">Loading product details…</span>
    </div>
  )
}

function ProductError({ status, message, onRetry }) {
  const notFound = status === 404

  return (
    <section
      className="mx-auto w-full max-w-xl rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm"
      role="alert"
    >
      <p className="text-xs font-semibold uppercase tracking-[1.6px] text-amber-900">
        {notFound ? 'Product unavailable' : 'Unable to load product'}
      </p>

      <h1 className="mt-4 font-serif text-3xl text-stone-900">
        {notFound ? 'Product not found' : 'Something went wrong'}
      </h1>

      <p className="mt-3 text-sm leading-6 text-stone-600">
        {notFound
          ? 'This product may have been removed or the link may have changed.'
          : message || 'Please check your connection and try again.'}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {!notFound && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
          >
            Try again
          </button>
        )}

        <Link
          to="/"
          className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800 no-underline transition hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
        >
          Back to Home
        </Link>
      </div>
    </section>
  )
}

export default function ProductDetails() {
  const { productId } = useParams()
  const { handleGetProductById } = useProduct()

  const product = useSelector(
    (state) => state.product.selectedProduct
  )
  const selectedProductId = useSelector(
    (state) => state.product.selectedProductId
  )
  const loading = useSelector(
    (state) => state.product.productDetailsLoading
  )
  const error = useSelector(
    (state) => state.product.productDetailsError
  )
  const errorStatus = useSelector(
    (state) => state.product.productDetailsStatus
  )

  const [activeImage, setActiveImage] = useState(null)
  const [failedImages, setFailedImages] = useState([])

  useEffect(() => {
    setActiveImage(null)
    setFailedImages([])
    handleGetProductById(productId)
  }, [productId, handleGetProductById])

  const currentProduct =
    selectedProductId === productId ? product : null

  const images = Array.isArray(currentProduct?.images)
    ? currentProduct.images.filter(
        (image) =>
          typeof image?.url === 'string' &&
          image.url.trim().length > 0
      )
    : []

  const availableImages = images.filter(
    (image) => !failedImages.includes(image.url)
  )

  const mainImage =
    availableImages.find((image) => image.url === activeImage)?.url ||
    availableImages[0]?.url ||
    null

  const activeImageIndex = Math.max(
    availableImages.findIndex((image) => image.url === mainImage),
    0
  )

  function showImage(index) {
    if (!availableImages.length) return

    const nextIndex =
      (index + availableImages.length) % availableImages.length

    setActiveImage(availableImages[nextIndex].url)
  }

  function handleImageError(url) {
    setFailedImages((previous) =>
      previous.includes(url) ? previous : [...previous, url]
    )
  }

  return (
    <main className="min-h-screen bg-[#faf8f4] text-stone-800">
      {/* Store header */}
      <header className="border-b border-stone-200/80 bg-[#faf8f4]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-lg font-semibold tracking-tight text-stone-900 no-underline sm:text-xl"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-stone-900 font-serif text-lg text-white">
              DG
            </span>
            Dulhan-Gifts
          </Link>

          <Link
            to="/#collection"
            className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 no-underline transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
          >
            Continue shopping
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto flex min-h-[calc(100svh-65px)] w-full max-w-[1360px] items-center px-4 py-7 sm:px-8 sm:py-10">
        {loading && <LoadingState />}

        {!loading && error && (
          <ProductError
            status={errorStatus}
            message={error}
            onRetry={() => handleGetProductById(productId)}
          />
        )}

        {!loading && !error && currentProduct && (
          <section
            className="grid w-full min-w-0 items-center gap-6 sm:gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10"
            aria-labelledby="product-title"
          >
            {/* Gallery: vertical thumbnails + fixed main image */}
            <div className="grid min-w-0 grid-cols-[56px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[72px_minmax(0,1fr)] sm:gap-4 lg:grid-cols-[76px_minmax(0,1fr)]">
              {/* Vertical thumbnails */}
              {availableImages.length > 1 && (
                <div
                  className="flex max-h-[min(60vh,460px)] flex-col gap-3 overflow-x-hidden overflow-y-auto py-1 pr-1"
                  role="group"
                  aria-label="Choose product image"
                >
                  {availableImages.map((image, index) => {
                    const isActive = image.url === mainImage

                    return (
                      <button
                        key={`${image.url}-${index}`}
                        type="button"
                        onClick={() => setActiveImage(image.url)}
                        aria-label={`Show product image ${index + 1}`}
                        aria-pressed={isActive}
                        className={`aspect-square w-full shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 ${
                          isActive
                            ? 'border-amber-800 shadow-sm'
                            : 'border-stone-200 hover:border-amber-500'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt=""
                          className="h-full w-full object-contain"
                          onError={() => handleImageError(image.url)}
                        />
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Stable main image frame */}
              <div className="relative flex h-[min(55vh,440px)] min-h-[300px] min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-5">
                {mainImage ? (
                  <img
                    key={mainImage}
                    src={mainImage}
                    alt={currentProduct.title || 'Product image'}
                    className="block h-full w-full object-contain object-center"
                    onError={() => handleImageError(mainImage)}
                  />
                ) : (
                  <div
                    className="flex flex-col items-center gap-3 text-center text-stone-500"
                    role="img"
                    aria-label="Product image unavailable"
                  >
                    <span className="font-serif text-5xl text-amber-900/50">
                      DG
                    </span>
                    <p className="text-sm">
                      Product image unavailable
                    </p>
                  </div>
                )}

                {availableImages.length > 1 && mainImage && (
                  <>
                    <button
                      type="button"
                      onClick={() => showImage(activeImageIndex - 1)}
                      aria-label="Previous product image"
                      className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-stone-200 bg-white/95 text-2xl text-stone-800 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 sm:left-3 sm:size-10"
                    >
                      <span aria-hidden="true">‹</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => showImage(activeImageIndex + 1)}
                      aria-label="Next product image"
                      className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-stone-200 bg-white/95 text-2xl text-stone-800 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 sm:right-3 sm:size-10"
                    >
                      <span aria-hidden="true">›</span>
                    </button>

                    <span className="absolute bottom-3 right-3 rounded-full bg-stone-900/75 px-3 py-1 text-xs font-medium text-white">
                      {activeImageIndex + 1} / {availableImages.length}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Product information */}
            <div className="min-w-0 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8 lg:p-9">
              <span className="inline-flex rounded-full bg-[#f5f0e8] px-3 py-1.5 text-xs font-semibold text-amber-950">
                {currentProduct.category || 'Uncategorised'}
              </span>

              <h1
                id="product-title"
                className="mt-5 break-words font-serif text-3xl font-medium leading-tight tracking-tight text-stone-900 sm:text-4xl"
              >
                {currentProduct.title || 'Untitled product'}
              </h1>

              <p className="mt-5 text-2xl font-semibold tracking-tight text-amber-900 sm:text-3xl">
                {formatPrice(currentProduct.price)}
              </p>

              <div className="my-6 border-t border-stone-200" />

              <h2 className="text-xs font-semibold uppercase tracking-[1.7px] text-stone-500">
                Product details
              </h2>

              <p className="mt-3 whitespace-pre-line break-words text-sm leading-7 text-stone-600 sm:text-base">
                {currentProduct.description?.trim() ||
                  'No description is available for this product yet.'}
              </p>

              <div className="mt-8 border-t border-stone-100 pt-6">
                <button
                  type="button"
                  disabled
                  aria-describedby="cart-note"
                  className="flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-stone-300 px-6 py-3 text-sm font-semibold text-stone-600"
                >
                  Add to Cart
                </button>

                <p
                  id="cart-note"
                  className="mt-3 text-center text-xs text-stone-500"
                >
                  Cart functionality coming soon.
                </p>
              </div>
            </div>
          </section>
        )}

        {!loading && !error && !currentProduct && (
          <section
            className="mx-auto w-full max-w-xl rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center shadow-sm"
            role="alert"
          >
            <h1 className="font-serif text-3xl text-stone-900">
              Product details unavailable
            </h1>

            <p className="mt-3 text-sm leading-6 text-stone-600">
              We could not find usable details for this product.
            </p>

            <div className="mt-7 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => handleGetProductById(productId)}
                className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700"
              >
                Try again
              </button>

              <Link
                to="/"
                className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-800 no-underline hover:bg-stone-50"
              >
                Back to Home
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
 