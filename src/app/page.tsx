import { Metadata } from "next";
import Link from "next/link";
import { DollarSign, BarChart3, PieChart, ShieldCheck, Download, Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Money Tracker 🤑 — El control de tus gastos",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f9f9] text-[#416781] font-sans flex flex-col selection:bg-[#fecaca] selection:text-[#f2440f]">
      {/* Premium Navbar */}
      <header className="sticky top-0 bg-[#f5f9f9]/80 backdrop-blur-md z-50 border-b border-[#416781]/5 px-6 py-4 max-w-5xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl select-none">🤑</span>
          <span className="font-extrabold text-lg tracking-tight text-[#416781]">
            Money Tracker
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-xs font-extrabold uppercase tracking-wider text-[#5c84a0] hover:text-[#416781] transition px-4 py-2"
          >
            Ingresar
          </Link>
          <Link
            href="/auth/register"
            className="bg-[#416781] hover:bg-[#416781]/90 text-white text-xs font-extrabold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-sm hover:shadow transition"
          >
            Registrarse
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-6 py-12 md:py-24 text-center items-center justify-center relative overflow-hidden">
        {/* Subtle mesh background shapes */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#fecaca]/30 blur-[100px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-72 h-72 rounded-full bg-[#5c84a0]/15 blur-[120px] pointer-events-none -z-10" />

        <div className="text-4xl select-none mb-6 animate-bounce duration-1000">🤑</div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#416781] leading-tight max-w-3xl">
          El control de tus gastos, <br />
          <span className="text-[#f2440f] inline-block mt-2">en un solo lugar.</span>
        </h1>
        <p className="mt-6 text-sm md:text-base text-[#5c84a0] max-w-xl font-medium leading-relaxed">
          Una herramienta simple, rápida y potente para registrar tus gastos diarios de forma visual. Observá tus finanzas de forma mensual y anual sin complicaciones y tomá mejores decisiones financieras.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-10 w-full justify-center">
          <Link
            href="/auth/register"
            className="w-full sm:w-auto bg-[#f2440f] hover:bg-[#f2440f]/95 text-white font-extrabold text-sm px-10 py-4 rounded-full shadow-md hover:shadow-lg transition duration-200 uppercase tracking-wider inline-flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Empezar Gratis
          </Link>
          <Link
            href="/gastos"
            className="w-full sm:w-auto border-2 border-[#5c84a0]/35 hover:border-[#5c84a0]/50 text-[#5c84a0] font-extrabold text-sm px-10 py-3.5 rounded-full bg-transparent hover:bg-white transition duration-200 uppercase tracking-wider inline-flex items-center justify-center"
          >
            Ver mis gastos
          </Link>
        </div>

        {/* Core Features Showcase Grid */}
        <section className="mt-20 md:mt-32 w-full">
          <h2 className="text-[11px] uppercase tracking-widest font-extrabold text-[#5c84a0] mb-8">
            ¿Por qué usar Money Tracker?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-[28px] border border-[#416781]/5 shadow-sm hover:shadow-md transition duration-300 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#416781]/5 flex items-center justify-center text-[#416781]">
                <PieChart size={20} />
              </div>
              <h3 className="font-extrabold text-base text-[#416781]">Análisis Mensual Visual</h3>
              <p className="text-xs text-[#5c84a0] font-medium leading-relaxed">
                Observá la distribución de tus gastos de forma instantánea mediante un gráfico horizontal por colores y emojis basado en tus categorías.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-[28px] border border-[#416781]/5 shadow-sm hover:shadow-md transition duration-300 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#f2440f]/5 flex items-center justify-center text-[#f2440f]">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-extrabold text-base text-[#416781]">Evolución Anual</h3>
              <p className="text-xs text-[#5c84a0] font-medium leading-relaxed">
                Visualizá el progreso de tus gastos mes a mes durante el año con gráficos de barras verticales que animan tu evolución de forma elegante.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-[28px] border border-[#416781]/5 shadow-sm hover:shadow-md transition duration-300 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#fbbf24]/5 flex items-center justify-center text-[#fbbf24]">
                <Plus size={20} className="stroke-[3]" />
              </div>
              <h3 className="font-extrabold text-base text-[#416781]">Categorías a tu Medida</h3>
              <p className="text-xs text-[#5c84a0] font-medium leading-relaxed">
                Además de las categorías globales por defecto, creá tus propias píldoras personalizadas asignándoles emojis y colores en caliente.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-[28px] border border-[#416781]/5 shadow-sm hover:shadow-md transition duration-300 flex flex-col gap-4 md:col-span-3 md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex flex-col gap-3 max-w-xl">
                <div className="w-10 h-10 rounded-2xl bg-green-500/5 flex items-center justify-center text-green-600">
                  <Download size={20} />
                </div>
                <h3 className="font-extrabold text-base text-[#416781]">Exportación Directa a CSV</h3>
                <p className="text-xs text-[#5c84a0] font-medium leading-relaxed">
                  Tus datos son siempre tuyos. Descargá todo tu historial de gastos ingresados en un formato estructurado de CSV compatible con Excel o Google Sheets con un solo clic.
                </p>
              </div>
              <Link
                href="/auth/register"
                className="bg-[#416781] hover:bg-[#416781]/90 text-white font-extrabold text-xs py-3.5 px-8 rounded-full uppercase tracking-wider shadow hover:shadow-md transition inline-flex items-center justify-center whitespace-nowrap self-start md:self-auto"
              >
                Comenzar ahora
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Premium minimalist Footer */}
      <footer className="border-t border-[#416781]/5 py-8 text-center text-[10px] font-bold text-[#5c84a0] uppercase tracking-wider max-w-5xl w-full mx-auto px-6">
        <span>© {new Date().getFullYear()} Money Tracker. El control de tus gastos, en un solo lugar.</span>
      </footer>
    </div>
  );
}
