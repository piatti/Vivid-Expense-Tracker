"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowLeft,
  Calendar,
  DollarSign,
  ArrowUpDown,
  Tag,
} from "lucide-react";
import {
  saveExpense,
  deleteExpense,
  createCustomCategory,
  deleteCustomCategory,
} from "@/app/actions/money-tracker";

// Types matching the backend
interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isDefault: boolean;
  userId: string | null;
}

interface Expense {
  id: string;
  title: string;
  value: number;
  date: number; // TS timestamp
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  categoryColor: string;
}

interface MoneyTrackerClientProps {
  initialCategories: Category[];
  initialExpenses: Expense[];
  user: any;
}

const EMOJI_SUGGESTIONS = ["💰", "🎉", "🏠", "🍕", "🎬", "🧴", "🐶", "✈️", "🎮", "💡", "🛠️", "🩹", "🚗", "👕", "❤️", "🎒"];

export default function MoneyTrackerClient({
  initialCategories,
  initialExpenses,
  user,
}: MoneyTrackerClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  // Active view filters
  const [currentView, setCurrentView] = useState<"monthly" | "yearly">("monthly");
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"date" | "value" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isNewCatModalOpen, setIsNewCatModalOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Form states
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseValue, setExpenseValue] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // New Category form states
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState(EMOJI_SUGGESTIONS[0]);

  // Sync props to state if they change on server revalidation
  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    setExpenses(initialExpenses);
  }, [initialExpenses]);

  // Local helper functions
  const changeMonth = (delta: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setViewDate(newDate);
  };

  const changeYear = (delta: number) => {
    const newDate = new Date(viewDate);
    newDate.setFullYear(newDate.getFullYear() + delta);
    setViewDate(newDate);
  };

  // Filter expenses based on active view and date
  const filteredExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    if (currentView === "monthly") {
      return (
        d.getMonth() === viewDate.getMonth() &&
        d.getFullYear() === viewDate.getFullYear()
      );
    } else {
      return d.getFullYear() === viewDate.getFullYear();
    }
  });

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.value, 0);

  // Calculate totals by category
  const totalsByCategory = filteredExpenses.reduce(
    (acc, e) => {
      acc[e.categoryId] = (acc[e.categoryId] || 0) + e.value;
      return acc;
    },
    {} as Record<string, number>
  );

  const sortedCategoryBreakdown = Object.entries(totalsByCategory)
    .map(([catId, val]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        id: catId,
        name: cat?.name || "otra",
        emoji: cat?.emoji || "📁",
        color: cat?.color || "#5c84a0",
        value: val,
      };
    })
    .sort((a, b) => b.value - a.value);

  // Form actions
  const handleOpenAdd = () => {
    setEditingExpenseId(null);
    setExpenseTitle("");
    setExpenseValue("");
    // Default to first category if available
    setSelectedCategoryId(categories[0]?.id || "");
    setIsExpenseModalOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setExpenseTitle(expense.title);
    setExpenseValue(expense.value.toString());
    setSelectedCategoryId(expense.categoryId);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseValue || !selectedCategoryId) return;

    const res = await saveExpense({
      id: editingExpenseId || undefined,
      title: expenseTitle,
      rawValue: expenseValue,
      categoryId: selectedCategoryId,
      date: editingExpenseId
        ? expenses.find((e) => e.id === editingExpenseId)?.date
        : viewDate.getTime(),
    });

    if (res.success) {
      // Re-fetch or update state optimistically
      // Since Server Action calls revalidatePath, Next.js refreshes server props.
      // For instant response, let's close the modal
      setIsExpenseModalOpen(false);
      // Wait a tiny bit and window refresh to reload Server Component props
      window.location.reload();
    } else {
      alert(res.error || "Ocurrió un error al guardar.");
    }
  };

  const handleDeleteExpense = async () => {
    if (!editingExpenseId) return;
    const res = await deleteExpense(editingExpenseId);
    if (res.success) {
      setIsConfirmDeleteOpen(false);
      setIsExpenseModalOpen(false);
      window.location.reload();
    } else {
      alert(res.error || "No se pudo borrar el gasto.");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const res = await createCustomCategory({
      name: newCatName,
      emoji: newCatEmoji,
    });

    if (res.success && res.category) {
      setCategories((prev) => [...prev, res.category as Category]);
      setSelectedCategoryId(res.category.id);
      setIsNewCatModalOpen(false);
      setNewCatName("");
    } else {
      alert(res.error || "No se pudo crear la categoría.");
    }
  };

  const handleDeleteCategory = async (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que quieres eliminar esta categoría y todos sus gastos asociados?")) {
      const res = await deleteCustomCategory(catId);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== catId));
        setExpenses((prev) => prev.filter((e) => e.categoryId !== catId));
        if (selectedCategoryId === catId) {
          setSelectedCategoryId(categories[0]?.id || "");
        }
        if (selectedCategoryDetail === catId) {
          setSelectedCategoryDetail(null);
        }
      }
    }
  };

  const exportToCsv = () => {
    if (expenses.length === 0) return;
    let csv = "Concepto,Importe,Categoria,Fecha\n";
    expenses.forEach((e) => {
      csv += `"${e.title || ""}",${e.value},"${e.categoryName}",${new Date(
        e.date
      ).toLocaleDateString("es-AR")}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gastos_${new Date().getFullYear()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Yearly evolve details
  const renderYearlyChart = () => {
    const months = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    const monthTotals = Array(12).fill(0);

    expenses
      .filter((e) => new Date(e.date).getFullYear() === viewDate.getFullYear())
      .forEach((e) => {
        monthTotals[new Date(e.date).getMonth()] += e.value;
      });

    const max = Math.max(...monthTotals, 1);

    return (
      <div className="flex items-end gap-2 h-40 pb-6 mt-4 w-full justify-between">
        {monthTotals.map((val, i) => {
          const h = (val / max) * 100;
          const opacity = 0.2 + (h / 100) * 0.8;
          return (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ opacity, backgroundColor: "#416781" }}
                className="w-full rounded-t-md relative group cursor-pointer min-h-[4px]"
              >
                {/* Tooltip on hover */}
                {val > 0 && (
                  <div className="absolute -top-10 left-50 -translate-x-1/2 bg-[#416781] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-250 z-50 pointer-events-none whitespace-nowrap">
                    ${val.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                  </div>
                )}
              </motion.div>
              <span className="text-[10px] font-extrabold text-[#5c84a0] uppercase mt-2">
                {months[i]}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Sort detailed expenses
  const getSortedDetailExpenses = () => {
    if (!selectedCategoryDetail) return [];
    const catExpenses = filteredExpenses.filter((e) => e.categoryId === selectedCategoryDetail);

    return [...catExpenses].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "title") {
        return sortOrder === "asc"
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }

      return sortOrder === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  };

  const sortedDetailExpenses = getSortedDetailExpenses();
  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryDetail);
  const detailTotalAmount = sortedDetailExpenses.reduce((sum, e) => sum + e.value, 0);

  return (
    <div className="w-full max-w-lg mx-auto min-h-screen px-4 py-8 flex flex-col font-sans text-[#416781] bg-[#f5f9f9]">
      <AnimatePresence mode="wait">
        {selectedCategoryDetail === null ? (
          // MAIN DASHBOARD VIEW
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col w-full"
          >
            {/* Top Navigation Tab System */}
            <div className="flex justify-center gap-1 my-4 bg-[#416781]/5 p-1 rounded-full w-fit mx-auto relative">
              {(["monthly", "yearly"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setCurrentView(tab);
                    setSelectedCategoryDetail(null);
                  }}
                  className={`relative z-10 px-6 py-2 rounded-full text-xs font-extrabold uppercase tracking-wide transition-colors duration-300 ${
                    currentView === tab ? "text-[#416781]" : "text-[#5c84a0] opacity-70"
                  }`}
                >
                  {currentView === tab && (
                    <motion.div
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      className="absolute inset-0 bg-white rounded-full shadow-sm"
                    />
                  )}
                  <span className="relative z-20">
                    {tab === "monthly" ? "Mensual" : "Anual"}
                  </span>
                </button>
              ))}
            </div>

            {/* Hero Section */}
            <header className="py-6 text-center">
              <div className="text-base font-semibold text-[#5c84a0] capitalize flex items-center justify-center gap-4 mb-1">
                <button
                  onClick={() => (currentView === "monthly" ? changeMonth(-1) : changeYear(-1))}
                  className="p-1 text-[#5c84a0] hover:text-[#416781] transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="min-w-[120px] inline-block font-extrabold">
                  {currentView === "monthly"
                    ? viewDate.toLocaleString("es-AR", { month: "long" })
                    : viewDate.getFullYear()}
                </span>
                <button
                  onClick={() => (currentView === "monthly" ? changeMonth(1) : changeYear(1))}
                  className="p-1 text-[#5c84a0] hover:text-[#416781] transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <motion.div
                key={totalAmount}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl font-extrabold tracking-tight text-[#416781] my-3"
              >
                ${totalAmount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </motion.div>

              {currentView === "monthly" && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleOpenAdd}
                  className="btn bg-[#f2440f] text-white font-extrabold text-sm px-8 py-3 rounded-full shadow-md hover:shadow-lg transition duration-200 mt-2 inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  Nuevo Gasto
                </motion.button>
              )}
            </header>

            {/* Visual Chart Breakdown */}
            {currentView === "monthly" && (
              <section className="mb-6 bg-white p-5 rounded-[28px] border border-[#416781]/5 shadow-sm">
                <h2 className="text-[11px] uppercase tracking-widest font-extrabold text-[#5c84a0] mb-3">
                  Análisis mensual
                </h2>
                {totalAmount > 0 ? (
                  <div>
                    <div className="h-10 w-full bg-[#f5f9f9] rounded-xl flex overflow-hidden border border-[#416781]/5 shadow-inner">
                      {sortedCategoryBreakdown.map((cat) => {
                        const percentage = (cat.value / totalAmount) * 100;
                        return (
                          <motion.div
                            key={cat.id}
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            style={{ backgroundColor: cat.color }}
                            className="h-full flex items-center justify-center relative overflow-hidden group cursor-pointer"
                          >
                            {percentage > 8 && (
                              <span className="text-[15px] select-none">{cat.emoji}</span>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-3 gap-y-2 mt-4">
                      {sortedCategoryBreakdown.map((cat) => (
                        <div key={cat.id} className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#5c84a0]">
                          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cat.color }} />
                          <span className="capitalize">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-[#5c84a0] font-semibold opacity-60">
                    Sin gastos este mes para analizar
                  </div>
                )}
              </section>
            )}

            {/* Yearly Chart Evolve */}
            {currentView === "yearly" && (
              <section className="mb-6 bg-white p-5 rounded-[28px] border border-[#416781]/5 shadow-sm">
                <h2 className="text-[11px] uppercase tracking-widest font-extrabold text-[#5c84a0] mb-2">
                  Evolución mensual
                </h2>
                {renderYearlyChart()}
              </section>
            )}

            {/* Categories Breakdown List */}
            <section className="flex-1 flex flex-col mb-8">
              <h2 className="text-[11px] uppercase tracking-widest font-extrabold text-[#5c84a0] mb-3 px-1">
                Distribución por categoría
              </h2>
              {sortedCategoryBreakdown.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {sortedCategoryBreakdown.map((cat) => (
                    <motion.div
                      key={cat.id}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => currentView === "monthly" && setSelectedCategoryDetail(cat.id)}
                      className={`bg-white p-4.5 rounded-[18px] flex justify-between items-center border border-[#416781]/5 hover:border-[#416781]/15 transition-all shadow-sm ${
                        currentView === "monthly" ? "cursor-pointer" : "pointer-events-none"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.emoji}</span>
                        <div className="flex flex-col">
                          <span className="font-bold text-[#416781] text-sm capitalize">{cat.name}</span>
                          {currentView === "yearly" && (
                            <span className="text-[9px] font-bold text-[#5c84a0] uppercase tracking-wider">
                              {((cat.value / totalAmount) * 100).toFixed(0)}% del año
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-extrabold text-sm text-[#416781]">
                        ${cat.value.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-[28px] border border-[#416781]/5 shadow-sm text-xs text-[#5c84a0] font-bold opacity-60">
                  Sin gastos registrados aún
                </div>
              )}
            </section>

            {/* CSV Export Button */}
            <button
              onClick={exportToCsv}
              disabled={expenses.length === 0}
              className="w-full flex items-center justify-center gap-2 border-2 border-[#5c84a0]/30 hover:border-[#5c84a0]/50 text-[#5c84a0] font-extrabold text-xs py-3 rounded-full uppercase tracking-wider transition duration-200 mb-8 bg-transparent disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download size={14} />
              Exportar a CSV
            </button>
          </motion.div>
        ) : (
          // DETAILED CATEGORY VIEW
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col w-full"
          >
            {/* Navigation back */}
            <button
              onClick={() => setSelectedCategoryDetail(null)}
              className="flex items-center gap-1.5 font-extrabold text-xs text-[#f2440f] uppercase tracking-wider mb-6 w-fit bg-transparent border-none py-2"
            >
              <ArrowLeft size={14} />
              Volver
            </button>

            {/* Header */}
            <header className="flex flex-col items-start mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{selectedCategoryObj?.emoji || "📁"}</span>
                <h1 className="text-[11px] uppercase tracking-widest font-extrabold text-[#5c84a0] capitalize">
                  {selectedCategoryObj?.name}
                </h1>
              </div>
              <p className="text-4xl font-extrabold text-[#416781]">
                ${detailTotalAmount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </header>

            {/* Sorting panel */}
            <div className="flex justify-between items-center bg-[#416781]/5 px-4 py-2.5 rounded-full mb-4">
              <span className="text-[10px] font-extrabold text-[#5c84a0] uppercase tracking-wider flex items-center gap-1">
                <ArrowUpDown size={12} />
                Ordenar por
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as any)}
                  className="bg-transparent border-none text-[11px] font-extrabold text-[#416781] outline-none cursor-pointer capitalize"
                >
                  <option value="date">Fecha</option>
                  <option value="value">Monto</option>
                  <option value="title">Concepto</option>
                </select>
                <button
                  onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
                  className="text-[10px] font-extrabold text-[#f2440f] bg-white px-2 py-0.5 rounded shadow-sm border border-black/5"
                >
                  {sortOrder === "asc" ? "Asc" : "Desc"}
                </button>
              </div>
            </div>

            {/* Detailed Expenses List */}
            <div className="flex-1 flex flex-col gap-2.5 mb-8">
              {sortedDetailExpenses.length > 0 ? (
                sortedDetailExpenses.map((exp) => (
                  <motion.div
                    key={exp.id}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleOpenEdit(exp)}
                    className="bg-white p-4.5 rounded-[18px] flex justify-between items-center border border-[#416781]/5 hover:border-[#416781]/15 transition-all shadow-sm cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-sm text-[#416781]">{exp.title}</div>
                      <div className="text-[10px] font-bold text-[#5c84a0] mt-1">
                        {new Date(exp.date).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="font-extrabold text-sm text-[#f2440f]">
                      ${exp.value.toLocaleString("es-AR")}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16 bg-white rounded-[28px] border border-[#416781]/5 shadow-sm text-xs text-[#5c84a0] font-bold opacity-60">
                  Sin gastos registrados en esta categoría
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DYNAMIC BOTTOM SHEET DIALOG / SHEET (Nuevo/Editar Gasto) */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <>
            {/* Dark blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpenseModalOpen(false)}
              className="fixed inset-0 bg-[#416781]/40 backdrop-blur-md z-40"
            />
            {/* Sheet Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-[28px] p-6 shadow-2xl z-50 flex flex-col gap-4 border-t border-[#416781]/10"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-extrabold text-[#416781]">
                  {editingExpenseId ? "Editar Gasto" : "Nuevo Gasto"}
                </h3>
                {editingExpenseId && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    className="p-2 text-[#f2440f] hover:bg-[#f2440f]/5 rounded-xl transition"
                    aria-label="Eliminar gasto"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveExpense} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="expenseTitle" className="text-[10px] font-extrabold text-[#5c84a0] uppercase tracking-wider">
                    Concepto
                  </label>
                  <input
                    type="text"
                    id="expenseTitle"
                    placeholder="Concepto (ej. Supermercado)"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    className="w-full bg-[#f5f9f9] border-2 border-transparent focus:border-[#416781]/25 px-4 py-3 rounded-2xl outline-none font-bold text-sm text-[#416781] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="expenseValue" className="text-[10px] font-extrabold text-[#5c84a0] uppercase tracking-wider">
                    Importe ($)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 font-bold text-[#5c84a0]">$</span>
                    <input
                      type="text"
                      id="expenseValue"
                      placeholder="0.00 (soporta formulas ej: 1500+300)"
                      value={expenseValue}
                      onChange={(e) => setExpenseValue(e.target.value)}
                      className="w-full bg-[#f5f9f9] border-2 border-transparent focus:border-[#416781]/25 pl-8 pr-4 py-3 rounded-2xl outline-none font-bold text-sm text-[#416781] transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Category Pills Selector */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#5c84a0] uppercase tracking-wider mb-1">
                    Categoría
                  </span>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`p-2.5 rounded-xl border-2 text-center transition flex flex-col items-center gap-0.5 relative group ${
                          selectedCategoryId === cat.id
                            ? "border-[#416781] bg-white shadow-sm"
                            : "border-transparent bg-[#f5f9f9] hover:bg-[#f5f9f9]/80"
                        }`}
                      >
                        {/* Delete customized categories pill button */}
                        {!cat.isDefault && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCategory(cat.id, e)}
                            className="absolute -top-1 right-1 bg-[#f2440f] text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow z-20 border border-white"
                          >
                            ×
                          </button>
                        )}
                        <span className="text-lg">{cat.emoji}</span>
                        <span className="text-[9px] font-extrabold capitalize text-[#5c84a0] truncate max-w-full">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                    {/* Add Custom Cat Pill */}
                    <button
                      type="button"
                      onClick={() => setIsNewCatModalOpen(true)}
                      className="p-2.5 rounded-xl border-2 border-dashed border-[#5c84a0]/30 hover:border-[#5c84a0]/50 text-center transition flex flex-col items-center justify-center gap-0.5"
                    >
                      <Plus size={18} className="text-[#5c84a0]" />
                      <span className="text-[9px] font-extrabold text-[#5c84a0] uppercase tracking-wider">
                        Nueva
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="submit"
                    className="w-full bg-[#f2440f] text-white font-extrabold py-3.5 rounded-full text-xs uppercase tracking-wider shadow hover:shadow-md transition"
                  >
                    {editingExpenseId ? "Actualizar" : "Guardar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="w-full border-2 border-[#5c84a0]/25 text-[#5c84a0] font-extrabold py-3.5 rounded-full text-xs uppercase tracking-wider bg-transparent hover:bg-[#f5f9f9] transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* NEW CUSTOM CATEGORY MODAL (Slide up nested) */}
      <AnimatePresence>
        {isNewCatModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewCatModalOpen(false)}
              className="fixed inset-0 bg-[#416781]/40 backdrop-blur-md z-[60]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-white rounded-t-[28px] p-6 shadow-2xl z-[70] border-t border-[#416781]/10 flex flex-col gap-4"
            >
              <h3 className="text-base font-extrabold text-[#416781]">Nueva Categoría</h3>
              <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newCatEmoji}
                    readOnly
                    className="w-14 bg-[#f5f9f9] text-center text-xl font-bold rounded-2xl border-none outline-none py-3"
                  />
                  <input
                    type="text"
                    placeholder="Nombre (ej. Mascotas)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 bg-[#f5f9f9] border-2 border-transparent focus:border-[#416781]/25 px-4 py-3 rounded-2xl outline-none font-bold text-sm text-[#416781] transition-all"
                    required
                  />
                </div>

                {/* Emojis selection grid */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-extrabold text-[#5c84a0] uppercase tracking-wider mb-0.5">
                    Sugerencias de Emoji
                  </span>
                  <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto pr-1">
                    {EMOJI_SUGGESTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewCatEmoji(emoji)}
                        className={`text-xl p-2 rounded-xl transition ${
                          newCatEmoji === emoji
                            ? "bg-[#416781]/15 scale-105 shadow-sm"
                            : "bg-[#f5f9f9] hover:bg-[#f5f9f9]/80"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#f2440f] text-white font-extrabold py-3 rounded-full text-xs uppercase tracking-wider shadow hover:shadow-md transition"
                  >
                    Añadir
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewCatModalOpen(false)}
                    className="w-full border-2 border-[#5c84a0]/25 text-[#5c84a0] font-extrabold py-3 rounded-full text-xs uppercase tracking-wider bg-transparent hover:bg-[#f5f9f9] transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CONFIRM DELETE DIALOG (Custom Dialog) */}
      <AnimatePresence>
        {isConfirmDeleteOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-50%" }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-40px)] max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl z-[110] border border-black/5 text-center flex flex-col gap-4"
            >
              <p className="font-semibold text-sm text-[#416781] leading-relaxed px-2">
                ¿Estás seguro de que querés eliminar este gasto?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDeleteExpense}
                  className="flex-1 bg-[#f2440f] text-white font-extrabold py-3 rounded-full text-xs uppercase tracking-wider shadow"
                >
                  Sí, borrar
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(false)}
                  className="flex-1 border-2 border-[#5c84a0]/25 text-[#5c84a0] font-extrabold py-3 rounded-full text-xs uppercase tracking-wider bg-transparent hover:bg-[#f5f9f9]"
                >
                  No
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
