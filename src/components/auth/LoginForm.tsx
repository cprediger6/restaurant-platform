// src/components/auth/LoginForm.tsx

'use client'

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { 
  Loader2, 
  Mail, 
  Lock, 
  AlertCircle, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  // Estados del formulario
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [touched, setTouched] = useState({ email: false, password: false })

  // Auto-focus en el primer campo
  useEffect(() => {
    const timer = setTimeout(() => {
      const emailInput = document.getElementById("email")
      if (emailInput) emailInput.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // ============================================================
  // VALIDACIONES
  // ============================================================

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError("El correo electrónico es requerido")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError("Ingresa un correo electrónico válido")
      return false
    }
    setEmailError(null)
    return true
  }

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("La contraseña es requerida")
      return false
    }
    if (value.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres")
      return false
    }
    setPasswordError(null)
    return true
  }

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (touched.email) validateEmail(value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (touched.password) validatePassword(value)
  }

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }))
    if (field === 'email') validateEmail(email)
    if (field === 'password') validatePassword(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validar todo antes de enviar
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    setTouched({ email: true, password: true })

    if (!isEmailValid || !isPasswordValid) {
      return
    }

    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl,
        ...(rememberMe && { remember: "true" }),
      })

      if (result?.error) {
        // Manejar errores específicos de NextAuth
        if (result.error === "CredentialsSignin") {
          setError("Credenciales incorrectas. Verifica tu email y contraseña.")
        } else if (result.error === "AccessDenied") {
          setError("Acceso denegado. Contacta al administrador.")
        } else {
          setError(result.error || "Error al iniciar sesión. Intenta nuevamente.")
        }
        setIsLoading(false)
        return
      }

      // ✅ Login exitoso
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      console.error("Error de login:", err)
      setError("Ocurrió un error inesperado. Intenta nuevamente.")
      setIsLoading(false)
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="w-full max-w-5xl">
      <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-2xl lg:grid-cols-2">
        
        {/* ============================= */}
        {/* PANEL IZQUIERDO - BRANDING */}
        {/* ============================= */}
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-10 xl:p-12">
          {/* Decoraciones */}
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-black/10" />
          <div className="absolute right-10 bottom-10 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
              <Building2 className="h-7 w-7 text-white" />
            </div>

            <h2 className="mt-8 max-w-sm text-4xl font-bold leading-tight tracking-tight text-white">
              Gestiona tu restaurante desde un solo lugar
            </h2>

            <p className="mt-5 max-w-sm text-base leading-7 text-blue-100">
              Controla mesas, pedidos, inventario y más con nuestra plataforma integral.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span>Acceso seguro y protegido</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span>Gestión centralizada de tu negocio</span>
            </div>
          </div>
        </div>

        {/* ============================= */}
        {/* PANEL DERECHO - FORMULARIO */}
        {/* ============================= */}
        <div className="bg-white p-7 sm:p-10 lg:p-12">
          {/* Header */}
          <div className="mb-8">
            {/* Mobile logo */}
            <div className="mb-6 flex lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="h-6 w-6" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              Plataforma empresarial
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
              Bienvenido de nuevo
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          {/* ============================= */}
          {/* ERROR GENERAL */}
          {/* ============================= */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">No fue posible iniciar sesión</p>
                <p className="mt-1 leading-5 text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* ============================= */}
          {/* FORMULARIO */}
          {/* ============================= */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                Correo electrónico
              </label>
              <div className="relative group">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email')}
                  disabled={isLoading}
                  placeholder="usuario@empresa.com"
                  autoComplete="email"
                  className={`h-12 w-full pl-12 pr-4 transition-all ${
                    touched.email && emailError
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : touched.email && !emailError && email
                      ? 'border-green-500 focus-visible:ring-green-500'
                      : ''
                  }`}
                />
                {touched.email && !emailError && email && (
                  <CheckCircle2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500" />
                )}
              </div>
              {touched.email && emailError && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  onClick={() => {
                    // Aquí puedes agregar lógica de "olvidé mi contraseña"
                    console.log('Recuperar contraseña')
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="relative group">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  disabled={isLoading}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`h-12 w-full pl-12 pr-12 transition-all ${
                    touched.password && passwordError
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : touched.password && !passwordError && password
                      ? 'border-green-500 focus-visible:ring-green-500'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {touched.password && passwordError && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                Recordarme
              </label>
              <span className="text-xs text-slate-400">
                Sesión segura
              </span>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-12 w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/25 transition-all duration-200 hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al sistema</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </Button>

            {/* Credenciales de prueba */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              <p className="font-medium text-slate-700 mb-1.5">🔑 Credenciales de prueba</p>
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <span className="text-slate-400">Admin:</span>
                  <br />
                  <span className="font-mono text-slate-600">admin@restaurant.com</span>
                  <br />
                  <span className="font-mono text-slate-600">admin123</span>
                </div>
                <div>
                  <span className="text-slate-400">Mesero:</span>
                  <br />
                  <span className="font-mono text-slate-600">waiter@restaurant.com</span>
                  <br />
                  <span className="font-mono text-slate-600">waiter123</span>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Acceso protegido y seguro</span>
              <span className="w-px h-4 bg-slate-200" />
              <span>v2.0.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <p className="mt-6 text-center text-xs text-slate-500">
        Restaurant Platform · Sistema de gestión empresarial
      </p>
    </div>
  )
}

// ============================================================
// WRAPPER CON SUSPENSE
// ============================================================

export default function LoginForm() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Cargando...</p>
        </div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  )
}