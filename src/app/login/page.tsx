'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pill, Lock, UserCheck, ArrowRight, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [rut, setRut] = useState('12.345.678-9');
  const [contrasena, setContrasena] = useState('password123');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCargando(true);
    setMensaje(null);

    setTimeout(() => {
      setCargando(false);
      if (rut.trim() && contrasena.trim()) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('dosisalert_usuario', JSON.stringify({ nombre: 'Juan Pérez', rut: rut.trim() }));
        }
        router.push('/');
      } else {
        setMensaje('Por favor escribe tu RUT y tu contraseña.');
      }
    }, 400);
  };

  const handleEntradaDirecta = () => {
    setRut('12.345.678-9');
    setContrasena('password123');
    if (typeof window !== 'undefined') {
      localStorage.setItem('dosisalert_usuario', JSON.stringify({ nombre: 'Juan Pérez', rut: '12.345.678-9' }));
    }
    router.push('/');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Cabecera Amigable */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/30">
            <Pill className="w-9 h-9 -rotate-45" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Bienvenido a <span className="text-emerald-600">DosisAlert</span>
            </h1>
            <p className="text-slate-600 text-base mt-1">
              Tu pastillero y recordatorio de salud en casa
            </p>
          </div>
        </div>

        {/* Tarjeta de Formulario de Inicio de Sesión */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-slate-900">Ingresar a tu cuenta</h2>
            <p className="text-sm text-slate-500 mt-0.5">Escribe tus datos para ver tus medicamentos</p>
          </div>

          {mensaje && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-bold">
              {mensaje}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input RUT */}
            <div>
              <label htmlFor="rut" className="block text-sm font-bold text-slate-700 mb-1.5">
                Tu RUT
              </label>
              <div className="relative">
                <input
                  id="rut"
                  type="text"
                  required
                  placeholder="Ej: 12.345.678-9"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  className="w-full text-lg pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 placeholder:text-slate-400"
                />
                <UserCheck className="w-6 h-6 text-slate-400 absolute left-3.5 top-4" />
              </div>
            </div>

            {/* Input Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-bold text-slate-700">
                  Tu Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => alert('Para este prototipo puedes usar la contraseña de prueba precargada.')}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full text-lg pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 placeholder:text-slate-400"
                />
                <Lock className="w-6 h-6 text-slate-400 absolute left-3.5 top-4" />
              </div>
            </div>

            {/* Botón Grande: Iniciar Sesión */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-4.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {cargando ? (
                <span>Ingresando...</span>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Botón rápido para demo / adultos mayores */}
            <button
              type="button"
              onClick={handleEntradaDirecta}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm border border-emerald-200 transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Entrar directo con Juan Pérez (Prueba rápida)</span>
            </button>
          </form>

          {/* Enlace: Crear Cuenta Nueva */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              ¿No tienes una cuenta aún?{' '}
              <button
                type="button"
                onClick={() => alert('¡Bienvenido! En este prototipo ya tienes una cuenta creada a nombre de Juan Pérez con medicamentos listos.')}
                className="font-bold text-emerald-600 hover:underline"
              >
                Crear cuenta nueva
              </button>
            </p>
          </div>
        </div>

        {/* Mensaje de Confianza */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600" />
          <span>Tus datos y horarios están seguros contigo</span>
        </div>

      </div>
    </div>
  );
}
