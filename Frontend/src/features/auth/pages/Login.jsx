import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hook/useAuth'
import ContinueWithGoogle from '../components/ContinueWithGoogle'

const categories = [
  { label: 'Cosmetics', icon: '✳' },
  { label: 'Stationery', icon: '✎' },
  { label: 'Toys', icon: '♡' },
  { label: 'Photo Frames', icon: '▧' },
  { label: 'Home Decor', icon: '⌂' },
]

const inputClassName = 'h-12 w-full rounded-lg border border-stone-200 bg-white px-4 text-sm text-stone-800 shadow-sm outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-amber-800 focus:ring-4 focus:ring-amber-800/10'
const labelClassName = 'text-sm font-medium text-stone-700'

export default function Login() {
  const { handleLogin } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')
    setIsSubmitting(true)

    try {
      await handleLogin({ email: form.email, password: form.password })
      navigate('/')
    } catch (error) {
      const responseData = error.response?.data
      const validationMessage = Array.isArray(responseData?.errors)
        ? responseData.errors.map(({ msg }) => msg).filter(Boolean).join(' ')
        : ''
      const responseMessage = responseData?.message
      const safeResponseMessage = responseMessage && !/logged in successfully/i.test(responseMessage)
        ? responseMessage
        : ''

      setSubmitError(validationMessage || safeResponseMessage || "We couldn't sign you in. Check your email and password, then try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-2 bg-white font-sans text-stone-800 max-[900px]:grid-cols-[0.9fr_1.1fr] max-[680px]:grid-cols-1">
      <section className="flex min-h-screen bg-[#f5f2ed] px-[clamp(36px,6.4vw,96px)] py-10 max-[900px]:px-[30px] max-[680px]:min-h-0 max-[680px]:px-6 max-[680px]:pt-6 max-[680px]:pb-5 max-[380px]:px-[18px]" aria-label="Dulhan-Gifts introduction">
        <div className="mx-auto flex w-full max-w-[560px] flex-col">
          <Link className="inline-flex w-fit items-center gap-3 text-[23px] font-semibold tracking-[-0.7px] text-stone-900 no-underline max-[680px]:text-xl" to="/" aria-label="Dulhan-Gifts home">
            <span className="grid size-10 place-items-center rounded-xl bg-stone-900 font-serif text-lg font-medium text-white" aria-hidden="true">DG</span>
            <span>Dulhan-Gifts</span>
          </Link>

          <div className="mt-[clamp(34px,5vh,58px)] mb-6 max-[680px]:mt-7 max-[680px]:mb-4">
            <p className="mb-3 text-[10px] font-semibold tracking-[1.7px] text-amber-900/75 uppercase">Everyday Essentials, Thoughtfully Chosen.</p>
            <h1 className="m-0 max-w-[440px] font-serif text-[clamp(34px,3.4vw,48px)] leading-[1.12] tracking-[-1.2px] font-normal text-stone-900 max-[680px]:text-[clamp(32px,7vw,42px)]">Little things,<br />chosen with care.</h1>
            <p className="mt-3 max-w-[360px] text-sm leading-6 text-stone-600">Find thoughtful favourites for your home, your desk, and everyone you love.</p>
          </div>

          <div className="relative min-h-[250px] max-h-[420px] flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-[#e9e1d6] via-[#d9cec0] to-[#c7b7a3] shadow-lg max-[680px]:min-h-[170px] max-[680px]:max-h-[260px] max-[680px]:flex-none">
            <img
              className="absolute inset-0 size-full object-cover object-[center_72%]"
              src="/dulhan-gifts-login.jpg"
              alt="Skincare products arranged on a wooden table beside books and a small vase with branches"
              loading="eager"
              onError={(event) => event.currentTarget.classList.add('hidden')}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/45 via-transparent to-transparent" aria-hidden="true" />
            <p className="absolute bottom-5 left-5 m-0 flex items-center gap-2 text-xs font-medium tracking-wide text-white drop-shadow">A little joy for every day</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 max-[900px]:gap-1.5 max-[680px]:mt-3.5" aria-label="Shop categories">
            {categories.map(({ label, icon }) => (
              <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-stone-300/80 bg-white/60 px-3 py-2 text-[11px] font-medium text-stone-600 max-[900px]:gap-1.5 max-[900px]:px-2.5 max-[900px]:py-1.5 max-[900px]:text-[10px]" key={label}>
                <span className="text-[13px] leading-none text-amber-900/75" aria-hidden="true">{icon}</span>{label}
              </span>
            ))}
          </div>
          <p className="mt-auto pt-6 text-[11px] tracking-wide text-stone-500 max-[680px]:hidden">A neighbourhood shop, with something for everyone.</p>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-[clamp(38px,7vw,108px)] py-16 max-[900px]:px-9 max-[680px]:min-h-0 max-[680px]:items-start max-[680px]:px-6 max-[680px]:pt-9 max-[680px]:pb-[76px] max-[380px]:px-[18px]" aria-labelledby="login-heading">
        <div className="my-auto w-full max-w-[410px] max-[680px]:max-w-[520px]">
          <div className="mb-8 max-[680px]:mb-6">
            <p className="mb-2 text-[10px] font-semibold tracking-[1.7px] text-amber-900/75 uppercase">Welcome back</p>
            <h2 className="m-0 font-serif text-[clamp(30px,2.8vw,38px)] leading-tight tracking-[-0.7px] font-normal text-stone-900 max-[680px]:text-[32px]" id="login-heading">Welcome Back</h2>
            <p className="mt-2.5 text-sm leading-6 text-stone-500">Sign in to continue to Dulhan-Gifts.</p>
          </div>

          <form className="flex flex-col gap-5 max-[680px]:gap-4" onSubmit={handleLoginSubmit} noValidate>
            <div className="flex flex-col gap-2">
              <label className={labelClassName} htmlFor="email">Email Address</label>
              <input
                className={inputClassName}
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={updateField}
                required
                aria-invalid={Boolean(submitError)}
                aria-describedby={submitError ? 'login-error' : undefined}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelClassName} htmlFor="password">Password</label>
              <div className="relative">
                <input
                  className={`${inputClassName} pr-16`}
                  id="password"
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={updateField}
                  required
                  aria-invalid={Boolean(submitError)}
                  aria-describedby={submitError ? 'login-error' : undefined}
                />
                <button
                  className="absolute inset-y-0 right-3 my-auto h-fit rounded px-1 py-2 text-xs font-semibold text-stone-500 hover:text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
                  type="button"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  aria-label={`${passwordVisible ? 'Hide' : 'Show'} password`}
                  aria-pressed={passwordVisible}
                >
                  {passwordVisible ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {submitError && <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800" id="login-error" role="alert">{submitError}</p>}

            <button className="mt-1 flex h-12 cursor-pointer items-center justify-center rounded-lg bg-stone-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:cursor-wait disabled:opacity-70" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <ContinueWithGoogle />

          <p className="mt-6 text-center text-sm text-stone-600">Don't have an account? <Link className="font-semibold text-stone-900 underline decoration-stone-300 underline-offset-4 hover:text-amber-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800" to="/register">Register</Link></p>
        </div>
        <p className="absolute right-5 bottom-5 left-5 m-0 text-center text-[10px] tracking-wide text-stone-400">© 2026 Dulhan-Gifts</p>
      </section>
    </main>
  )
}
