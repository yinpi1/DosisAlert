'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pill, Lock, UserCheck, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [rut, setRut] = useState('12.345.678-9');
  const [contrasena, setContrasena] = useState('password123');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    // Validación simulada para el MVP con datos por defecto
    setTimeout(() => {
      setCargando(false);
      if (rut.trim() && contrasena.trim()) {
        router.push('/');
      } else {
        setMensaje('Por favor ingrese su RUT y Contraseña.');
      }
    }, 600);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full space-y-6">
        
        {/* Cabecera del Login */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-600/30">
            <Pill className="w-9 h-9 -rotate-45" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Dosis<span className="text-emerald-600">Alert</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Farmacia Personal Digital y Control de Tomas</p>
          </div>
        </div>

        {/* Tarjeta de Formulario de Inicio de Sesión */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Iniciar Sesión</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ingresa tus credenciales de paciente</p>
          </div>

          {mensaje && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              {mensaje}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Input RUT */}
            <div>
              <label htmlFor="rut" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                RUT del Paciente *
              </label>
              <div className="relative">
                <input
                  id="rut"
                  type="text"
                  required
                  placeholder="Ej: 12.345.678-9"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  className="w-full text-base pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 placeholder:text-slate-400"
                />
                <UserCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Con puntos y guión</span>
            </div>

            {/* Input Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contraseña *
                </label>
                {/* Enlace: Olvidaste tu contraseña */}
                <a
                  href="#recuperar"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Función de recuperación: Se enviará un correo de restablecimiento a tu dirección registrada.');
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  className="w-full text-base pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 placeholder:text-slate-400"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Botón Grande: Iniciar Sesión */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {cargando ? (
                <span>Validando credenciales...</span>
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Enlace: Crear Cuenta Nueva */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-600">
              ¿No tienes una cuenta aún?{' '}
              <a
                href="#registro"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Registro de nuevo paciente: En este MVP puedes usar el usuario de demostración precargado.');
                }}
                className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Crear cuenta nueva
              </a>
            </p>
          </div>
        </div>

        {/* Seguridad y Privacidad */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Acceso seguro protegido para datos clínicos de salud</span>
        </div>

      </div>
    </div>
  );
}
