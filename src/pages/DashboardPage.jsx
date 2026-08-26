import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchDashboardResumen,
  fetchExistencias,
  fetchSubalmacenes,
  fetchVales,
  fetchPedidosVivos,
  fetchSeguimientoDocumental,
  fetchSanAntonioOrdenes,
  fetchProductoFotoBlobUrl,
  fetchHistorialVentas,
  fetchHistorialVentasMetadata,
  exportarHistorialVentas,
  guardarSnapshotValorInventario,
  fetchHistorialValorInventario,
} from '../utils/api';
import {
  Package,
  ClipboardList,
  ShoppingCart,
  FileText,
  LogOut,
  Search,
  RefreshCw,
  AlertCircle,
  Users,
  Filter,
  Calendar,
  Inbox,
  TrendingUp,
  DollarSign,
  Boxes,
  BarChart3,
  PieChart as PieChartIcon,
  Gauge,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Warehouse,
  Camera,
  X,
  Eye,
  Layers,
  FileSpreadsheet,
  History,
  Calculator,
  Activity,
  Shield,
} from 'lucide-react';

const TABS = [
  { id: 'resumen', label: 'Resumen', icon: TrendingUp },
  { id: 'existencias', label: 'Existencias', icon: Package },
  { id: 'vales', label: 'Material en vales', icon: ClipboardList },
  { id: 'pedidos', label: 'Pedidos abiertos', icon: ShoppingCart },
  { id: 'ventas', label: 'Historial de ventas', icon: History },
  { id: 'san-antonio', label: 'San Antonio', icon: FileText },
  { id: 'valor-inventario', label: 'Valor de inventario', icon: Activity },
];

const COLORS = {
  red: '#C41E3A',
  blue: '#1E3A8A',
  blueLight: '#3B82F6',
  amber: '#F59E0B',
  emerald: '#10B981',
  violet: '#8B5CF6',
  gray: '#6B7280',
  dark: '#1F2937',
};

const PALETTE = [
  COLORS.red,
  COLORS.blue,
  COLORS.blueLight,
  COLORS.emerald,
  COLORS.violet,
  COLORS.amber,
  COLORS.gray,
  COLORS.dark,
];

const RESPONSABLES = [
  {
    id: '',
    label: 'Todos',
    shortLabel: 'Todos',
    color: 'gray',
    activeBg: 'bg-gray-800',
    text: 'text-gray-600',
    hover: 'hover:bg-gray-50',
    border: 'border-gray-200',
  },
  {
    id: 'joan',
    label: 'Vales con Joan',
    shortLabel: 'Joan',
    color: 'blue',
    activeBg: 'bg-p3-blue',
    text: 'text-blue-600',
    hover: 'hover:bg-blue-50',
    border: 'border-blue-200',
  },
  {
    id: 'abelardo',
    label: 'Vales con Abelardo',
    shortLabel: 'Abelardo',
    color: 'emerald',
    activeBg: 'bg-emerald-600',
    text: 'text-emerald-600',
    hover: 'hover:bg-emerald-50',
    border: 'border-emerald-200',
  },
  {
    id: 'aaron',
    label: 'Vales con Aaron',
    shortLabel: 'Aaron',
    activeBg: 'bg-violet-600',
    color: 'violet',
    text: 'text-violet-600',
    hover: 'hover:bg-violet-50',
    border: 'border-violet-200',
  },
  {
    id: 'otros',
    label: 'Otros vales',
    shortLabel: 'Otros',
    color: 'amber',
    activeBg: 'bg-amber-500',
    text: 'text-amber-600',
    hover: 'hover:bg-amber-50',
    border: 'border-amber-200',
  },
];

function classifyResponsable(name) {
  const n = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (n.includes('joan')) return 'joan';
  if (n.includes('abelardo')) return 'abelardo';
  if (n.includes('aaron')) return 'aaron';
  return 'otros';
}

function colorHexForResponsable(id) {
  switch (id) {
    case 'joan':
      return COLORS.blue;
    case 'abelardo':
      return COLORS.emerald;
    case 'aaron':
      return COLORS.violet;
    default:
      return COLORS.amber;
  }
}

function DebouncedInput({ value, onChange, delay = 600, className = '', ...props }) {
  const inputRef = useRef(null);
  const syncedValueRef = useRef(value);
  const timeoutRef = useRef(null);

  // Sincroniza cambios externos sin setState en un effect.
  useEffect(() => {
    if (value !== syncedValueRef.current) {
      syncedValueRef.current = value;
      if (inputRef.current) inputRef.current.value = value;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      syncedValueRef.current = newValue;
      onChange(newValue);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return <input ref={inputRef} {...props} defaultValue={value} onChange={handleChange} className={className} />;
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = 'Buscar...',
  emptyMessage = 'Sin coincidencias',
  className = '',
  id,
  allowFreeText = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value ? String(value) : '');
  const [coords, setCoords] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const itemsRef = useRef([]);

  const openDropdown = () => {
    setQuery(value ? String(value) : '');
    setHighlightedIndex(-1);
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
    }
    setOpen(true);
  };

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setCoords(null);
    setHighlightedIndex(-1);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  useEffect(() => {
    function handleScroll() {
      if (open) closeDropdown();
    }
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [closeDropdown, open]);

  useEffect(() => {
    if (!open) return;
    function handleResize() {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  useEffect(() => {
    if (highlightedIndex >= 0 && itemsRef.current[highlightedIndex]) {
      itemsRef.current[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 100);
    return options.filter((opt) => String(opt).toLowerCase().includes(q)).slice(0, 100);
  }, [options, query]);

  const handleSelect = (opt) => {
    onChange(opt);
    setQuery(String(opt));
    setOpen(false);
    setCoords(null);
    setHighlightedIndex(-1);
  };

  const confirmFreeText = () => {
    if (allowFreeText) {
      onChange(query.trim());
    }
    closeDropdown();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        openDropdown();
        setHighlightedIndex(filtered.length > 0 ? 0 : -1);
      } else {
        setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (open) {
        setHighlightedIndex((prev) => Math.max(prev - 1, -1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        handleSelect(filtered[highlightedIndex]);
      } else if (allowFreeText && query.trim()) {
        confirmFreeText();
      } else {
        closeDropdown();
      }
    } else if (e.key === 'Tab') {
      if (open && highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        handleSelect(filtered[highlightedIndex]);
      } else if (allowFreeText) {
        confirmFreeText();
      } else {
        closeDropdown();
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef} id={id}>
      <input
        ref={inputRef}
        type="text"
        value={open ? query : value ? String(value) : ''}
        onChange={(e) => {
          const val = e.target.value;
          setQuery(val);
          setHighlightedIndex(-1);
          if (!open) openDropdown();
          if (allowFreeText) {
            onChange(val);
          } else if (!val) {
            onChange('');
          }
        }}
        onFocus={() => {
          openDropdown();
          inputRef.current?.select();
        }}
        onBlur={() => {
          // No cerrar inmediatamente para permitir clics en las opciones.
          // El cierre por click outside ya está manejado.
        }}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red pr-8"
        autoComplete="off"
        onKeyDown={handleKeyDown}
      />
      <button
        type="button"
        onClick={() => {
          if (open) {
            closeDropdown();
          } else {
            openDropdown();
            inputRef.current?.focus();
          }
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
        tabIndex={-1}
      >
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && coords && (
        <div
          className="fixed z-[100] mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              {allowFreeText ? 'Presiona Enter o Tab para usar este texto' : emptyMessage}
            </div>
          ) : (
            filtered.map((opt, idx) => (
              <button
                key={String(opt)}
                ref={(el) => { itemsRef.current[idx] = el; }}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(opt);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 ${
                  String(opt) === String(value) ? 'bg-red-50 text-p3-red font-medium' : 'text-gray-700'
                } ${idx === highlightedIndex ? 'bg-red-100' : ''}`}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MultiSearchableSelect({
  values = [],
  onChange,
  options,
  placeholder = 'Buscar...',
  emptyMessage = 'Sin coincidencias',
  className = '',
  id,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const itemsRef = useRef([]);

  const normalizedValues = useMemo(
    () => new Set(values.map((v) => String(v).trim()).filter(Boolean)),
    [values]
  );

  const openDropdown = () => {
    setQuery('');
    setHighlightedIndex(-1);
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
    }
    setOpen(true);
  };

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setCoords(null);
    setHighlightedIndex(-1);
    setQuery('');
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        closeDropdown();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  useEffect(() => {
    function handleScroll() {
      if (open) closeDropdown();
    }
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', handleScroll, { capture: true });
  }, [closeDropdown, open]);

  useEffect(() => {
    if (!open) return;
    function handleResize() {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setCoords({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [open]);

  useEffect(() => {
    if (highlightedIndex >= 0 && itemsRef.current[highlightedIndex]) {
      itemsRef.current[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = options;
    if (q) {
      base = options.filter((opt) => String(opt).toLowerCase().includes(q));
    }
    // Mostrar primero los no seleccionados para facilitar la selección
    return base
      .filter((opt) => !normalizedValues.has(String(opt).trim()))
      .slice(0, 100);
  }, [options, query, normalizedValues]);

  const selectedList = useMemo(
    () => values.map((v) => String(v).trim()).filter(Boolean),
    [values]
  );

  const toggleOption = (opt) => {
    const str = String(opt).trim();
    if (normalizedValues.has(str)) {
      onChange(values.filter((v) => String(v).trim() !== str));
    } else {
      onChange([...values, str]);
    }
    setQuery('');
    inputRef.current?.focus();
  };

  const removeValue = (str) => {
    onChange(values.filter((v) => String(v).trim() !== str));
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        openDropdown();
        setHighlightedIndex(filtered.length > 0 ? 0 : -1);
      } else {
        setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (open) {
        setHighlightedIndex((prev) => Math.max(prev - 1, -1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        toggleOption(filtered[highlightedIndex]);
      } else {
        closeDropdown();
      }
    } else if (e.key === 'Tab') {
      closeDropdown();
    } else if (e.key === 'Escape') {
      closeDropdown();
      inputRef.current?.blur();
    } else if (e.key === 'Backspace' && !query && selectedList.length > 0) {
      removeValue(selectedList[selectedList.length - 1]);
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef} id={id}>
      <div
        className="w-full min-h-[2.75rem] px-3 py-2 bg-white border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-p3-red focus-within:border-p3-red transition-shadow flex flex-wrap items-center gap-1.5 cursor-text"
        onClick={() => {
          openDropdown();
          inputRef.current?.focus();
        }}
      >
        {selectedList.map((val) => (
          <span
            key={val}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-p3-red text-xs font-medium rounded-lg border border-red-100"
          >
            {val}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeValue(val);
              }}
              className="hover:text-red-700 focus:outline-none"
              aria-label={`Quitar ${val}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(-1);
            if (!open) openDropdown();
          }}
          onFocus={() => {
            openDropdown();
          }}
          placeholder={selectedList.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[4rem] outline-none text-sm text-gray-700 bg-transparent"
          autoComplete="off"
          onKeyDown={handleKeyDown}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          if (open) {
            closeDropdown();
          } else {
            openDropdown();
            inputRef.current?.focus();
          }
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
        tabIndex={-1}
      >
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && coords && (
        <div
          className="fixed z-[100] mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">{emptyMessage}</div>
          ) : (
            filtered.map((opt, idx) => (
              <button
                key={String(opt)}
                ref={(el) => { itemsRef.current[idx] = el; }}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  toggleOption(opt);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-gray-700 ${
                  idx === highlightedIndex ? 'bg-red-100' : ''
                }`}
              >
                {opt}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message = 'Sin datos', icon = Inbox }) {
  const IconComponent = icon;
  return (
    <div className="bg-gray-50 rounded-2xl p-10 text-center border border-dashed border-gray-200">
      <div className="mx-auto w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-3">
        <IconComponent className="text-gray-400" size={28} />
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
      <p className="text-xs text-gray-400 mt-1">No se encontraron registros para mostrar.</p>
    </div>
  );
}

function Tooltip({ tooltip }) {
  if (!tooltip) return null;
  return (
    <div
      style={{ left: tooltip.x + 12, top: tooltip.y - 12 }}
      className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 pointer-events-none shadow-lg max-w-xs"
    >
      {tooltip.content}
    </div>
  );
}

function PieChart({ data, valueFormatter = (v) => v, setTooltip, onItemClick }) {
  const total = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  if (total <= 0) {
    return <EmptyState message="Sin datos para gráfica" icon={PieChartIcon} />;
  }

  const radius = 42;
  const cx = 50;
  const cy = 50;
  let start = -Math.PI / 2;

  const slices = data.map((d) => {
    const value = Number(d.value) || 0;
    const frac = value / total;
    const angle = frac * 2 * Math.PI;
    const end = start + angle;
    const largeArc = angle > Math.PI ? 1 : 0;
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    start = end;
    return { ...d, value, frac, path };
  });

  return (
    <svg viewBox="0 0 100 100" className="w-full h-auto min-h-[16rem] sm:min-h-[18rem] max-h-80 mx-auto">
      {slices.map((slice, idx) => (
        <path
          key={idx}
          d={slice.path}
          fill={slice.color}
          stroke="#fff"
          strokeWidth="1"
          className="transition-opacity duration-200 hover:opacity-80 cursor-pointer"
          onMouseEnter={(e) =>
            setTooltip({
              content: `${slice.label}: ${valueFormatter(slice.value)} (${(slice.frac * 100).toFixed(1)}%)`,
              x: e.clientX,
              y: e.clientY,
            })
          }
          onMouseMove={(e) =>
            setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
          }
          onMouseLeave={() => setTooltip(null)}
          onClick={() => onItemClick?.(slice)}
        />
      ))}
      <circle cx={cx} cy={cy} r={22} fill="white" />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-[6px] fill-gray-700 font-bold"
      >
        {valueFormatter(total)}
      </text>
    </svg>
  );
}

function HorizontalBarChart({ data, valueFormatter = (v) => v, setTooltip, onItemClick }) {
  if (!data || data.length === 0) {
    return <EmptyState message="Sin datos para gráfica" icon={BarChart3} />;
  }

  const values = data.map((d) => Number(d.value) || 0);
  const max = Math.max(...values, 1);
  const labelW = 240;
  const plotW = 360;
  const barH = 32;
  const gap = 18;
  const height = data.length * (barH + gap) + gap;
  const width = labelW + plotW + 80;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-h-[16rem] sm:min-h-[20rem] max-h-[28rem]">
      {data.map((d, i) => {
        const y = gap + i * (barH + gap);
        const w = ((Number(d.value) || 0) / max) * plotW;
        const label = d.label.length > 40 ? `${d.label.slice(0, 40)}...` : d.label;
        return (
          <g key={i}>
            <text
              x={labelW - 10}
              y={y + barH / 2 + 4}
              textAnchor="end"
              className="text-base fill-gray-600"
            >
              {label}
            </text>
            <rect
              x={labelW}
              y={y}
              width={Math.max(w, 2)}
              height={barH}
              rx={5}
              fill={d.color}
              className="transition-all duration-200 hover:opacity-80 cursor-pointer"
              onMouseEnter={(e) =>
                setTooltip({
                  content: `${d.label}: ${valueFormatter(d.value)}`,
                  x: e.clientX,
                  y: e.clientY,
                })
              }
              onMouseMove={(e) =>
                setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
              }
              onMouseLeave={() => setTooltip(null)}
              onClick={() => onItemClick?.(d)}
            />
            <text
              x={labelW + Math.max(w, 2) + 6}
              y={y + barH / 2 + 4}
              className="text-sm fill-gray-600"
            >
              {valueFormatter(d.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function VerticalBarChart({ data, valueFormatter = (v) => v, setTooltip, onItemClick }) {
  if (!data || data.length === 0) {
    return <EmptyState message="Sin datos para gráfica" icon={BarChart3} />;
  }

  const values = data.map((d) => Number(d.value) || 0);
  const max = Math.max(...values, 1);
  const margin = { top: 20, right: 20, bottom: 100, left: 50 };
  const plotW = 320;
  const plotH = 180;
  const width = plotW + margin.left + margin.right;
  const height = plotH + margin.top + margin.bottom;
  const step = plotW / data.length;
  const barW = step * 0.5;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-h-[16rem] sm:min-h-[18rem] max-h-80">
      <line
        x1={margin.left}
        y1={margin.top + plotH}
        x2={margin.left + plotW}
        y2={margin.top + plotH}
        stroke="#e5e7eb"
        strokeWidth="1"
      />
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={margin.top + plotH}
        stroke="#e5e7eb"
        strokeWidth="1"
      />
      {data.map((d, i) => {
        const h = ((Number(d.value) || 0) / max) * plotH;
        const x = margin.left + i * step + (step - barW) / 2;
        const y = margin.top + plotH - h;
        const label = d.label.length > 10 ? `${d.label.slice(0, 10)}...` : d.label;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={4}
              fill={d.color}
              className="transition-all duration-200 hover:opacity-80 cursor-pointer"
              onMouseEnter={(e) =>
                setTooltip({
                  content: `${d.label}: ${valueFormatter(d.value)}`,
                  x: e.clientX,
                  y: e.clientY,
                })
              }
              onMouseMove={(e) =>
                setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
              }
              onMouseLeave={() => setTooltip(null)}
              onClick={() => onItemClick?.(d)}
            />
            <text
              x={x + barW / 2}
              y={margin.top + plotH + 18}
              textAnchor="start"
              transform={`rotate(45, ${x + barW / 2}, ${margin.top + plotH + 18})`}
              className="text-xs fill-gray-600"
            >
              {label}
            </text>
            <text
              x={x + barW / 2}
              y={y - 6}
              textAnchor="middle"
              className="text-[10px] fill-gray-500"
            >
              {valueFormatter(d.value)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function GaugeChart({ percent, setTooltip }) {
  const p = Math.min(100, Math.max(0, percent));
  const cx = 100;
  const cy = 100;
  const r = 70;
  const start = { x: cx + r * Math.cos(Math.PI), y: cy - r * Math.sin(Math.PI) };
  const endRight = { x: cx + r * Math.cos(0), y: cy - r * Math.sin(0) };
  const endValue = {
    x: cx + r * Math.cos(Math.PI * (1 - p / 100)),
    y: cy - r * Math.sin(Math.PI * (1 - p / 100)),
  };

  const bgPath = `M ${start.x} ${start.y} A ${r} ${r} 0 0 0 ${endRight.x} ${endRight.y}`;
  const fgPath = `M ${start.x} ${start.y} A ${r} ${r} 0 0 0 ${endValue.x} ${endValue.y}`;

  return (
    <svg viewBox="0 0 200 110" className="w-full h-auto min-h-[12rem] sm:min-h-[14rem] max-h-56">
      <path d={bgPath} fill="none" stroke="#e5e7eb" strokeWidth="18" strokeLinecap="round" />
      <path
        d={fgPath}
        fill="none"
        stroke={COLORS.red}
        strokeWidth="18"
        strokeLinecap="round"
        className="transition-all duration-500 cursor-pointer"
        onMouseEnter={(e) =>
          setTooltip({
            content: `${p.toFixed(1)}% del inventario total está en vales`,
            x: e.clientX,
            y: e.clientY,
          })
        }
        onMouseMove={(e) =>
          setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
        }
        onMouseLeave={() => setTooltip(null)}
      />
      <text x={cx} y={cy + 8} textAnchor="middle" className="text-2xl fill-gray-800 font-bold">
        {p.toFixed(1)}%
      </text>
    </svg>
  );
}

function LineChart({ series, valueFormatter = (v) => v, setTooltip }) {
  if (!series || series.length === 0 || series.every((s) => !s.values || s.values.length === 0)) {
    return <EmptyState message="Sin datos para gráfica" icon={BarChart3} />;
  }

  const margin = { top: 20, right: 30, bottom: 70, left: 80 };
  const plotW = 800;
  const plotH = 350;
  const width = plotW + margin.left + margin.right;
  const height = plotH + margin.top + margin.bottom;

  const allDates = [...new Set(series.flatMap((s) => s.values.map((v) => v.fecha)))].sort();
  const allValues = series.flatMap((s) => s.values.map((v) => v.value));
  const minValue = Math.min(...allValues, 0);
  const maxValue = Math.max(...allValues, 1);
  const valueRange = maxValue - minValue || 1;

  const getX = (index) => margin.left + (index / Math.max(allDates.length - 1, 1)) * plotW;
  const getY = (value) => margin.top + plotH - ((value - minValue) / valueRange) * plotH;

  const seriesWithPaths = series.map((s) => {
    const points = s.values.map((v) => {
      const idx = allDates.indexOf(v.fecha);
      return { x: getX(idx), y: getY(v.value), fecha: v.fecha, value: v.value };
    });
    const path =
      points.length > 0 ? `M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')}` : '';
    return { ...s, points, path };
  });

  const formatAxisDate = (dateStr) => {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
  };

  const ticks = 5;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-h-[20rem] max-h-[32rem]">
      {[...Array(ticks)].map((_, i) => {
        const tick = i / (ticks - 1);
        const y = margin.top + plotH - tick * plotH;
        const value = minValue + tick * valueRange;
        return (
          <g key={i}>
            <line
              x1={margin.left}
              y1={y}
              x2={margin.left + plotW}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
            <text
              x={margin.left - 10}
              y={y + 4}
              textAnchor="end"
              className="text-xs fill-gray-500"
            >
              {valueFormatter(value)}
            </text>
          </g>
        );
      })}

      {seriesWithPaths.map((s, idx) => (
        <g key={idx}>
          <path
            d={s.path}
            fill="none"
            stroke={s.color}
            strokeWidth={s.isTotal ? 3 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
          {s.points.map((p, pidx) => (
            <circle
              key={pidx}
              cx={p.x}
              cy={p.y}
              r={s.isTotal ? 4 : 3}
              fill={s.color}
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer"
              onMouseEnter={(e) =>
                setTooltip({
                  content: `${s.label}\n${formatAxisDate(p.fecha)}: ${valueFormatter(p.value)}`,
                  x: e.clientX,
                  y: e.clientY,
                })
              }
              onMouseMove={(e) =>
                setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null))
              }
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </g>
      ))}

      {allDates.map((date, i) => {
        const x = getX(i);
        return (
          <g key={date}>
            <line
              x1={x}
              y1={margin.top + plotH}
              x2={x}
              y2={margin.top + plotH + 5}
              stroke="#9ca3af"
              strokeWidth="1"
            />
            <text
              x={x}
              y={margin.top + plotH + 20}
              textAnchor="start"
              className="text-xs fill-gray-500"
              transform={`rotate(-45, ${x}, ${margin.top + plotH + 20})`}
            >
              {formatAxisDate(date)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ChartLegend({ items, valueFormatter = (v) => v }) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mt-4 max-w-full">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 max-w-full"
        >
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="font-medium break-words max-w-[12rem]">{item.label}</span>
          <span className="text-gray-900 font-semibold shrink-0">{valueFormatter(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

function DataTable({ columns, rows, emptyMessage = 'Sin datos', emptyIcon = Inbox, onRowClick, onRowDoubleClick, selectedRow }) {
  const [sort, setSort] = useState({ key: null, dir: 'asc' });

  const defaultFormatNumber = (value) => {
    if (value == null) return '—';
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return new Intl.NumberFormat('es-MX').format(num);
  };

  const sortedRows = useMemo(() => {
    if (!sort.key) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col || !col.sortable) return rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.accessor ? col.accessor(a) : a[col.key];
      const bv = col.accessor ? col.accessor(b) : b[col.key];
      const an = Number(av);
      const bn = Number(bv);
      if (!Number.isNaN(an) && !Number.isNaN(bn) && av !== '' && bv !== '') {
        return (an - bn) * dir;
      }
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir;
    });
  }, [rows, sort, columns]);

  const totals = useMemo(() => {
    return columns.map((col) => {
      if (!col.total) return null;
      return sortedRows.reduce((sum, row) => {
        const v = col.accessor ? col.accessor(row) : row[col.key];
        const n = Number(v);
        return sum + (Number.isNaN(n) ? 0 : n);
      }, 0);
    });
  }, [sortedRows, columns]);

  const hasTotals = totals.some((t) => t !== null);
  const firstTotalIdx = totals.findIndex((t) => t !== null);

  const handleHeaderClick = (col) => {
    if (!col.sortable) return;
    setSort((prev) => {
      if (prev.key !== col.key) return { key: col.key, dir: 'asc' };
      return { key: col.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
    });
  };

  if (!rows || rows.length === 0) {
    return <EmptyState message={emptyMessage} icon={emptyIcon} />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-md w-full">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wide text-xs">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleHeaderClick(col)}
                className={`px-3 lg:px-4 py-3 text-left select-none ${
                  col.sortable
                    ? 'cursor-pointer hover:bg-gray-100 hover:text-p3-red transition-colors'
                    : ''
                }`}
              >
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  {col.label}
                  {col.sortable && (
                    <span className="text-gray-400">
                      {sort.key === col.key ? (
                        sort.dir === 'asc' ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedRows.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              onDoubleClick={() => onRowDoubleClick?.(row)}
              className={`transition-colors ${
                onRowClick || onRowDoubleClick ? 'cursor-pointer' : ''
              } ${
                selectedRow && selectedRow.codigo === row.codigo
                  ? 'bg-red-50 hover:bg-red-100'
                  : 'hover:bg-gray-50/70'
              }`}
            >
              {columns.map((col) => {
                const raw = col.accessor ? col.accessor(row) : row[col.key];
                const display = col.format ? col.format(raw, row) : (raw ?? '—');
                return (
                  <td
                    key={col.key}
                    title={col.wrap ? String(raw ?? '') : undefined}
                    className={`px-3 lg:px-4 py-2.5 text-gray-700 align-top ${
                      col.wrap
                        ? 'break-words max-w-lg'
                        : 'whitespace-nowrap'
                    }`}
                  >
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        {hasTotals && (
          <tfoot className="bg-gray-50 font-semibold text-gray-800">
            <tr>
              {columns.map((col, idx) => {
                const total = totals[idx];
                if (total === null) {
                  return <td key={col.key} className="px-3 lg:px-4 py-2.5"></td>;
                }
                return (
                  <td
                    key={col.key}
                    className={`px-3 lg:px-4 py-2.5 ${col.wrap ? 'break-words max-w-lg' : 'whitespace-nowrap'}`}
                  >
                    {idx === firstTotalIdx && (
                      <span className="text-gray-500 text-xs uppercase mr-2">Total</span>
                    )}
                    {col.format ? col.format(total, {}) : defaultFormatNumber(total)}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function KpiCard({ label, value, icon, color = 'bg-p3-blue', subtext = '' }) {
  const IconComponent = icon;
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex items-center gap-4 hover:shadow-lg transition-shadow min-h-[120px] h-full">
      <div
        className={`${color} text-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm shrink-0`}
      >
        <IconComponent size={28} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 font-medium leading-tight line-clamp-2 min-h-[2.5em]">
          {label}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value ?? 0}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ title, count, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
      {Icon && <Icon className="text-p3-red" size={24} />}
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      {count !== undefined && (
        <span className="ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          {count} registros
        </span>
      )}
    </div>
  );
}

function useProductoFoto(codigo) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);
      setUrl(null);
      try {
        objectUrl = await fetchProductoFotoBlobUrl(codigo);
        if (!cancelled) {
          if (objectUrl) {
            setUrl(objectUrl);
          } else {
            setError(true);
          }
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [codigo]);

  return { url, loading, error };
}

function ProductoFoto({ codigo, onExpand }) {
  const { url, loading, error } = useProductoFoto(codigo);

  if (error) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-200">
        <div className="mx-auto w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-3">
          <Camera className="text-gray-400" size={28} />
        </div>
        <p className="text-gray-500 font-medium text-sm">Sin foto disponible</p>
        <p className="text-xs text-gray-400 mt-1">{codigo}</p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onExpand}
      disabled={loading || !url}
      className="w-full group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-p3-red focus:ring-offset-2 disabled:opacity-70"
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-p3-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {url && (
        <>
          <img
            src={url}
            alt={`Foto de ${codigo}`}
            className="w-full h-64 object-contain bg-white transition-transform duration-300 group-hover:scale-105"
          />
          <span className="absolute bottom-2 right-2 bg-gray-900/70 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Ampliar
          </span>
        </>
      )}
    </button>
  );
}

function ImageLightbox({ codigo, descripcion, onClose }) {
  const { url, loading, error } = useProductoFoto(codigo);
  const [scale, setScale] = useState(1);

  const toggleZoom = (e) => {
    e.stopPropagation();
    setScale((s) => (s >= 2.5 ? 1 : 2.5));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-white/90 hover:text-white p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        aria-label="Cerrar"
      >
        <X size={24} />
      </button>

      <button
        type="button"
        onClick={toggleZoom}
        className="absolute top-4 right-16 text-white/90 hover:text-white px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium z-10"
      >
        {scale >= 2.5 ? 'Restablecer' : 'Ampliar'}
      </button>

      <div
        className="max-w-[95vw] max-h-[95vh] flex flex-col items-center overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        )}
        {error && (
          <div className="bg-gray-800 rounded-2xl p-12 text-center">
            <Camera className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-white font-medium">No se pudo cargar la imagen</p>
            <p className="text-gray-400 text-sm mt-1">{codigo}</p>
          </div>
        )}
        {url && (
          <img
            src={url}
            alt={`Foto ampliada de ${codigo}`}
            onClick={toggleZoom}
            className="max-w-none max-h-[85vh] object-contain rounded-lg shadow-2xl cursor-zoom-in transition-transform duration-300"
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}
          />
        )}
        <div className="mt-6 text-center">
          <p className="text-white font-semibold">{codigo}</p>
          {descripcion && <p className="text-white/70 text-sm">{descripcion}</p>}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('resumen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  // Data states
  const [resumen, setResumen] = useState(null);
  const [existencias, setExistencias] = useState([]);
  const [subalmacenes, setSubalmacenes] = useState([]);
  const [vales, setVales] = useState([]);
  const [allVales, setAllVales] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [sanAntonio, setSanAntonio] = useState(null);
  const [sanAntonioOcSeleccionada, setSanAntonioOcSeleccionada] = useState(null);
  const [sanAntonioBusquedaOc, setSanAntonioBusquedaOc] = useState('');
  const [sanAntonioBusquedaMaterialOc, setSanAntonioBusquedaMaterialOc] = useState('');
  const [sanAntonioBusquedaPartida, setSanAntonioBusquedaPartida] = useState('');
  const [sanAntonioEstadoPartida, setSanAntonioEstadoPartida] = useState('');

  // Historial de ventas
  const [historialVentas, setHistorialVentas] = useState([]);
  const [historialSearch, setHistorialSearch] = useState('');
  const [historialCliente, setHistorialCliente] = useState([]);
  const [historialCodigo, setHistorialCodigo] = useState([]);
  const [historialMoneda, setHistorialMoneda] = useState('');
  const [historialFechaDesde, setHistorialFechaDesde] = useState('');
  const [historialFechaHasta, setHistorialFechaHasta] = useState('');
  const [historialLoading, setHistorialLoading] = useState(false);
  const [historialClientesOptions, setHistorialClientesOptions] = useState([]);
  const [historialCodigosOptions, setHistorialCodigosOptions] = useState([]);
  const [historialOffset, setHistorialOffset] = useState(0);
  const [historialTotal, setHistorialTotal] = useState(0);
  const [historialTotales, setHistorialTotales] = useState({ MXN: 0, USD: 0 });

  // Historial de valor del inventario
  const [historialValor, setHistorialValor] = useState([]);
  const [historialValorLoading, setHistorialValorLoading] = useState(false);

  // Refs para evitar doble carga inicial en efectos con debounce
  const initialLoadDone = useRef({ existencias: false, historial: false });
  const [historialValorDesde, setHistorialValorDesde] = useState('');
  const [historialValorHasta, setHistorialValorHasta] = useState('');
  const [historialValorVisibleSeries, setHistorialValorVisibleSeries] = useState({});

  // Existencias selected product + lightbox
  const [existenciasSelected, setExistenciasSelected] = useState(null);
  const [fotoLightboxOpen, setFotoLightboxOpen] = useState(false);

  // Filters
  const EXISTENCIAS_PAGE_SIZE = 50;
  const HISTORIAL_PAGE_SIZE = 100;
  const [existenciasOffset, setExistenciasOffset] = useState(0);
  const [existenciasTotal, setExistenciasTotal] = useState(0);
  const [valesQuery, setValesQuery] = useState('limit=500');
  const [valesResponsable, setValesResponsable] = useState('');
  const [valesFechaDesde, setValesFechaDesde] = useState('');
  const [valesFechaHasta, setValesFechaHasta] = useState('');
  const [valesAlmacen, setValesAlmacen] = useState('');
  const [valesBusqueda, setValesBusqueda] = useState('');
  const [valesModo, setValesModo] = useState('desglose'); // 'desglose' | 'global'
  const [valeSeleccionado, setValeSeleccionado] = useState(null);
  const [pedidosQuery, setPedidosQuery] = useState('limit=500');
  const [pedidoBusqueda, setPedidoBusqueda] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [pedidoDetalle, setPedidoDetalle] = useState([]);
  const [pedidoDetalleLoading, setPedidoDetalleLoading] = useState(false);
  const [sanAntonioQuery] = useState('limit=500');
  const [existenciasSearch, setExistenciasSearch] = useState('');
  const [existenciasAlmacen, setExistenciasAlmacen] = useState('');
  const [existenciasFiltro, setExistenciasFiltro] = useState('con'); // 'con' | 'sin' | 'todos'
  const [existenciasLoading, setExistenciasLoading] = useState(false);

  // Filtros interactivos para graficas del dashboard
  const [dashboardFechaDesde, setDashboardFechaDesde] = useState('');
  const [dashboardFechaHasta, setDashboardFechaHasta] = useState('');
  const [topExistenciasCount, setTopExistenciasCount] = useState(8);
  const [topClientesCount, setTopClientesCount] = useState(8);
  const [pedidosEstadoFiltro, setPedidosEstadoFiltro] = useState('');
  const [graficaValesResponsable, setGraficaValesResponsable] = useState('');

  const almacenesOptions = useMemo(() => {
    const set = new Set();
    allVales.forEach((v) => {
      const alm = (v.almacen_origen || '').trim();
      if (alm) set.add(alm);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allVales]);

  // Carga de existencias con loading sutil (no bloquea toda la página)
  const loadExistencias = useCallback(
    async (query) => {
      setExistenciasLoading(true);
      setError(null);
      try {
        const data = await fetchExistencias(query);
        setExistencias(data.data || []);
        setExistenciasTotal(data.total || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setExistenciasLoading(false);
      }
    },
    []
  );

  const buildExistenciasQuery = useCallback(
    (offset = 0) => {
      const params = new URLSearchParams({
        limit: String(EXISTENCIAS_PAGE_SIZE),
        offset: String(offset),
      });
      const term = existenciasSearch.trim();
      if (term) params.set('busqueda', term);
      if (existenciasAlmacen) params.set('almacen', existenciasAlmacen);
      if (existenciasFiltro && existenciasFiltro !== 'con') params.set('existencia', existenciasFiltro);
      return params.toString();
    },
    [existenciasSearch, existenciasAlmacen, existenciasFiltro]
  );

  // Carga de historial de ventas con loading sutil
  const loadHistorialVentas = useCallback(
    async (query) => {
      setHistorialLoading(true);
      setError(null);
      try {
        const data = await fetchHistorialVentas(query);
        setHistorialVentas(data.data || []);
        setHistorialTotal(data.total || 0);
        setHistorialTotales(data.totales || { MXN: 0, USD: 0 });
      } catch (err) {
        setError(err.message);
      } finally {
        setHistorialLoading(false);
      }
    },
    []
  );

  const loadHistorialValorInventario = useCallback(async () => {
    setHistorialValorLoading(true);
    setError(null);
    try {
      const params = {};
      if (historialValorDesde) params.fecha_desde = historialValorDesde;
      if (historialValorHasta) params.fecha_hasta = historialValorHasta;
      const data = await fetchHistorialValorInventario(params);
      setHistorialValor(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setHistorialValorLoading(false);
    }
  }, [historialValorDesde, historialValorHasta]);

  const buildHistorialQuery = useCallback(
    (offset = 0) => {
      const params = new URLSearchParams({
        limit: String(HISTORIAL_PAGE_SIZE),
        offset: String(offset),
      });
      const term = historialSearch.trim();
      if (term) params.set('busqueda', term);
      historialCliente.forEach((c) => {
        if (c && c.trim()) params.append('cliente', c.trim());
      });
      historialCodigo.forEach((c) => {
        if (c && c.trim()) params.append('codigo', c.trim());
      });
      if (historialMoneda) params.set('moneda', historialMoneda);
      if (historialFechaDesde) params.set('fecha_desde', historialFechaDesde);
      if (historialFechaHasta) params.set('fecha_hasta', historialFechaHasta);
      return params.toString();
    },
    [historialSearch, historialCliente, historialCodigo, historialMoneda, historialFechaDesde, historialFechaHasta]
  );

  // Búsqueda server-side en existencias con debounce
  useEffect(() => {
    if (!initialLoadDone.current.existencias) {
      initialLoadDone.current.existencias = true;
      return;
    }
    setExistenciasOffset(0);
    loadExistencias(buildExistenciasQuery(0));
  }, [buildExistenciasQuery, loadExistencias]);

  // Búsqueda en historial de ventas con debounce
  useEffect(() => {
    if (!initialLoadDone.current.historial) {
      initialLoadDone.current.historial = true;
      return;
    }
    setHistorialOffset(0);
    loadHistorialVentas(buildHistorialQuery(0));
  }, [buildHistorialQuery, loadHistorialVentas]);

  // Cambio de página en existencias
  useEffect(() => {
    if (!initialLoadDone.current.existencias) return;
    loadExistencias(buildExistenciasQuery(existenciasOffset));
  }, [existenciasOffset, buildExistenciasQuery, loadExistencias]);

  // Cambio de página en historial de ventas
  useEffect(() => {
    if (!initialLoadDone.current.historial) return;
    loadHistorialVentas(buildHistorialQuery(historialOffset));
  }, [historialOffset, buildHistorialQuery, loadHistorialVentas]);

  useEffect(() => {
    const params = new URLSearchParams({ limit: '500' });
    if (valesResponsable) params.set('responsable', valesResponsable);
    if (valesFechaDesde) params.set('fecha_desde', valesFechaDesde);
    if (valesFechaHasta) params.set('fecha_hasta', valesFechaHasta);
    if (valesAlmacen) params.set('almacen', valesAlmacen);
    if (valesBusqueda.trim()) params.set('busqueda', valesBusqueda.trim());
    setValesQuery(params.toString());
  }, [valesResponsable, valesFechaDesde, valesFechaHasta, valesAlmacen, valesBusqueda]);

  useEffect(() => {
    const params = new URLSearchParams({ limit: '500' });
    if (pedidoBusqueda.trim()) params.set('busqueda', pedidoBusqueda.trim());
    setPedidosQuery(params.toString());
  }, [pedidoBusqueda]);

  useEffect(() => {
    if (!pedidoSeleccionado?.folio) {
      setPedidoDetalle([]);
      return;
    }
    let cancelled = false;
    async function load() {
      setPedidoDetalleLoading(true);
      try {
        const params = new URLSearchParams({ limit: '500' });
        params.set('folio_pedido', pedidoSeleccionado.folio);
        const data = await fetchSeguimientoDocumental(params.toString());
        if (!cancelled) setPedidoDetalle(data.data || []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setPedidoDetalleLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [pedidoSeleccionado]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, e, h, s, v, p] = await Promise.all([
        fetchDashboardResumen(),
        fetchExistencias(buildExistenciasQuery(0)),
        fetchHistorialVentas(buildHistorialQuery(0)),
        fetchSubalmacenes(),
        fetchVales('limit=500'),
        fetchPedidosVivos('limit=500'),
      ]);
      setResumen(r.resumen);
      setExistencias(e.data || []);
      setExistenciasTotal(e.total || 0);
      setHistorialVentas(h.data || []);
      setHistorialTotal(h.total || 0);
      setHistorialTotales(h.totales || { MXN: 0, USD: 0 });
      setSubalmacenes(s.data || []);
      setVales(v.data || []);
      setAllVales(v.data || []);
      setPedidos(p.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [buildExistenciasQuery, buildHistorialQuery]);

  const loadTabData = useCallback(
    async (tab) => {
      setLoading(true);
      setError(null);
      try {
        if (tab === 'vales') {
          const data = await fetchVales(valesQuery);
          setVales(data.data || []);
        } else if (tab === 'pedidos') {
          const data = await fetchPedidosVivos(pedidosQuery);
          setPedidos(data.data || []);
        } else if (tab === 'san-antonio') {
          const data = await fetchSanAntonioOrdenes(sanAntonioQuery);
          setSanAntonio(data);
          setSanAntonioOcSeleccionada(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [valesQuery, pedidosQuery, sanAntonioQuery]
  );

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Recargar vales filtrados para graficas del resumen cuando cambien los filtros de vales
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchVales(valesQuery);
        if (!cancelled) setAllVales(data.data || []);
      } catch {
        // ignorar errores silenciosos para no interrumpir la UI
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [valesQuery]);

  useEffect(() => {
    if (activeTab === 'valor-inventario') {
      loadHistorialValorInventario();
    } else if (activeTab !== 'resumen' && activeTab !== 'existencias' && activeTab !== 'ventas') {
      loadTabData(activeTab);
    }
  }, [activeTab, valesQuery, pedidosQuery, sanAntonioQuery, loadTabData, loadHistorialValorInventario]);

  // Carga metadatos de clientes/códigos para selects del historial de ventas
  useEffect(() => {
    if (activeTab !== 'ventas') return;
    if (historialClientesOptions.length > 0 || historialCodigosOptions.length > 0) return;
    fetchHistorialVentasMetadata()
      .then((meta) => {
        setHistorialClientesOptions(meta.clientes || []);
        setHistorialCodigosOptions(meta.codigos || []);
      })
      .catch(() => {});
  }, [activeTab, historialClientesOptions, historialCodigosOptions]);

  // Snapshot automático del valor del inventario si no existe del día actual
  useEffect(() => {
    if (activeTab !== 'valor-inventario') return;
    if (historialValorLoading) return;

    const hoy = new Date().toISOString().slice(0, 10);
    const tieneHoy = historialValor.some((d) => d.fecha === hoy);

    if (!tieneHoy) {
      guardarSnapshotValorInventario()
        .then(() => loadHistorialValorInventario())
        .catch(() => {});
    }
  }, [activeTab, historialValor, historialValorLoading, loadHistorialValorInventario]);

  const formatCurrency = (value, moneda = 'MXN') => {
    if (value == null) return '—';
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    const monedaCode = typeof moneda === 'string' ? moneda : (moneda?.moneda || 'MXN');
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: monedaCode }).format(num);
  };

  const formatNumber = (value) => {
    if (value == null) return '—';
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    return new Intl.NumberFormat('es-MX').format(num);
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrencyCompact = (value, moneda = 'MXN') => {
    if (value == null) return '—';
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    const monedaCode = typeof moneda === 'string' ? moneda : (moneda?.moneda || 'MXN');
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: monedaCode,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  };

  const formatCurrencySmart = (value, moneda = 'MXN') => {
    if (value == null) return '—';
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    if (Math.abs(num) >= 1_000_000) {
      return formatCurrencyCompact(num, moneda);
    }
    return formatCurrency(num, moneda);
  };

  const valesResumen = useMemo(() => {
    const filtrados = graficaValesResponsable
      ? allVales.filter((v) => classifyResponsable(v.entregado_a) === graficaValesResponsable)
      : allVales;
    const totalPiezas = filtrados.reduce((sum, v) => sum + (Number(v.cantidad) || 0), 0);
    const responsables = graficaValesResponsable
      ? RESPONSABLES.filter((r) => r.id === graficaValesResponsable)
      : RESPONSABLES.filter((r) => r.id);
    const porPersona = responsables.map((r) => {
      const value = filtrados
        .filter((v) => classifyResponsable(v.entregado_a) === r.id)
        .reduce((sum, v) => sum + (Number(v.cantidad) || 0), 0);
      return {
        label: r.shortLabel,
        value,
        color: colorHexForResponsable(r.id),
      };
    });
    return { totalPiezas, totalVales: filtrados.length, porPersona };
  }, [allVales, graficaValesResponsable]);

  const valesGlobal = useMemo(() => {
    const agrupado = {};
    vales.forEach((v) => {
      const codigo = v.codigo || 'Sin código';
      if (!agrupado[codigo]) {
        agrupado[codigo] = {
          codigo,
          descripcion: v.descripcion || '',
          cantidad_viva: 0,
          cantidad: 0,
          folios: new Set(),
          almacenes: new Set(),
        };
      }
      agrupado[codigo].cantidad_viva += Number(v.cantidad_viva) || 0;
      agrupado[codigo].cantidad += Number(v.cantidad) || 0;
      agrupado[codigo].folios.add(v.folio);
      if (v.almacen_origen) agrupado[codigo].almacenes.add(v.almacen_origen);
    });
    return Object.values(agrupado).map((g) => ({
      ...g,
      folios: Array.from(g.folios).sort(),
      almacenes: Array.from(g.almacenes).sort(),
      folios_count: g.folios.size,
    }));
  }, [vales]);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      if (pedidosEstadoFiltro && (p.estado || 'Sin estado') !== pedidosEstadoFiltro) return false;
      if (!dashboardFechaDesde && !dashboardFechaHasta) return true;
      const fecha = p.fecha ? p.fecha.slice(0, 10) : '';
      if (!fecha) return false;
      if (dashboardFechaDesde && fecha < dashboardFechaDesde) return false;
      if (dashboardFechaHasta && fecha > dashboardFechaHasta) return false;
      return true;
    });
  }, [pedidos, pedidosEstadoFiltro, dashboardFechaDesde, dashboardFechaHasta]);

  const pedidosResumen = useMemo(() => {
    const total = pedidosFiltrados.length;
    const monto = pedidosFiltrados.reduce((sum, p) => sum + (Number(p.saldo_pendiente) || 0), 0);
    const porEstado = {};
    pedidosFiltrados.forEach((p) => {
      const estado = p.estado || 'Sin estado';
      porEstado[estado] = (porEstado[estado] || 0) + 1;
    });
    const estadosData = Object.entries(porEstado).map(([label, value], i) => ({
      label,
      value,
      color: PALETTE[i % PALETTE.length],
    }));
    return { total, monto, porEstado: estadosData };
  }, [pedidosFiltrados]);

  const topExistencias = useMemo(() => {
    return [...existencias]
      .sort((a, b) => (Number(b.existencia_total) || 0) - (Number(a.existencia_total) || 0))
      .slice(0, topExistenciasCount)
      .map((item, i) => ({
        label: `${item.codigo || ''} - ${item.descripcion || ''}`.trim(),
        value: Number(item.existencia_total) || 0,
        color: PALETTE[i % PALETTE.length],
      }));
  }, [existencias, topExistenciasCount]);

  const mejoresClientes = useMemo(() => {
    const porCliente = {};
    pedidosFiltrados.forEach((p) => {
      const cliente = p.cliente || 'Sin cliente';
      porCliente[cliente] = (porCliente[cliente] || 0) + (Number(p.saldo_pendiente) || 0);
    });
    return Object.entries(porCliente)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topClientesCount)
      .map(([label, value], i) => ({
        label,
        value,
        color: PALETTE[i % PALETTE.length],
      }));
  }, [pedidosFiltrados, topClientesCount]);

  const existenciasPageInfo = useMemo(() => {
    const page = Math.floor(existenciasOffset / EXISTENCIAS_PAGE_SIZE) + 1;
    const totalPages = Math.ceil(existenciasTotal / EXISTENCIAS_PAGE_SIZE) || 1;
    return { page, totalPages };
  }, [existenciasOffset, existenciasTotal]);

  const handleExistenciasPageChange = useCallback(
    (newOffset) => {
      setExistenciasOffset(newOffset);
      loadExistencias(buildExistenciasQuery(newOffset));
    },
    [buildExistenciasQuery, loadExistencias]
  );

  const subalmacenesData = useMemo(() => {
    return [...subalmacenes]
      .sort((a, b) => (Number(b.valor_total) || 0) - (Number(a.valor_total) || 0))
      .map((item, i) => ({
        label: item.nombre || `Almacén ${item.cve_alm}`,
        value: Number(item.valor_total) || 0,
        color: PALETTE[i % PALETTE.length],
      }));
  }, [subalmacenes]);

  const totalExistencia = useMemo(
    () => existencias.reduce((sum, item) => sum + (Number(item.existencia_total) || 0), 0),
    [existencias]
  );

  const historialPageInfo = useMemo(() => {
    const page = Math.floor(historialOffset / HISTORIAL_PAGE_SIZE) + 1;
    const totalPages = Math.ceil(historialTotal / HISTORIAL_PAGE_SIZE) || 1;
    return { page, totalPages };
  }, [historialOffset, historialTotal]);

  const handleChartItemClick = (chart, item) => {
    if (!item) return;
    if (chart === 'vales-persona') {
      const responsable = RESPONSABLES.find((r) => r.id && r.shortLabel === item.label);
      if (responsable) {
        setGraficaValesResponsable(responsable.id);
        setActiveTab('vales');
        setValesResponsable(responsable.id);
      }
    } else if (chart === 'existencias-top') {
      const codigo = String(item.label).split(' - ')[0];
      if (codigo) {
        setExistenciasSearch(codigo);
        setActiveTab('existencias');
      }
    } else if (chart === 'clientes-top') {
      const cliente = item.label;
      if (cliente) {
        setHistorialCliente(cliente);
        setActiveTab('ventas');
      }
    } else if (chart === 'pedidos-estado') {
      setPedidosEstadoFiltro(item.label);
    }
  };

  const renderResumen = () => (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
        <KpiCard
          label="Pedidos abiertos"
          value={resumen?.pedidos_vivos}
          icon={ShoppingCart}
          color="bg-p3-blue"
          subtext="Pendientes por facturar"
        />
        <KpiCard
          label="Pendiente MXN"
          value={formatCurrencySmart(resumen?.monto_pendiente_mxn)}
          icon={DollarSign}
          color="bg-p3-red"
          subtext="Saldo en pesos"
        />
        <KpiCard
          label="Pendiente USD"
          value={formatCurrencySmart(resumen?.monto_pendiente_usd, 'USD')}
          icon={DollarSign}
          color="bg-emerald-600"
          subtext="Saldo en dólares"
        />
        <KpiCard
          label="Vales abiertos"
          value={resumen?.vales_abiertos}
          icon={ClipboardList}
          color="bg-orange-500"
          subtext="Con material vivo"
        />
        <KpiCard
          label="Piezas en vales"
          value={formatNumber(valesResumen.totalPiezas)}
          icon={Boxes}
          color="bg-emerald-600"
          subtext="Material apartado"
        />
        <KpiCard
          label="Bajo mínimo"
          value={resumen?.productos_bajo_minimo}
          icon={AlertCircle}
          color="bg-red-500"
          subtext="Requieren atención"
        />
        <KpiCard
          label="Mov. 90 días"
          value={resumen?.movimientos_90d}
          icon={TrendingUp}
          color="bg-p3-blue-light"
          subtext="Actividad de inventario"
        />
      </div>

      {/* Filtros globales del dashboard */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Filter size={16} className="text-p3-red" />
              Filtros de periodo
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Desde</label>
                <input
                  type="date"
                  value={dashboardFechaDesde}
                  onChange={(e) => setDashboardFechaDesde(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-p3-red focus:border-p3-red"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                <input
                  type="date"
                  value={dashboardFechaHasta}
                  onChange={(e) => setDashboardFechaHasta(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-p3-red focus:border-p3-red"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDashboardFechaDesde('');
                setDashboardFechaHasta('');
                setPedidosEstadoFiltro('');
                setGraficaValesResponsable('');
                setTopExistenciasCount(8);
                setTopClientesCount(8);
              }}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Users className="text-p3-red" size={24} />
              <h3 className="text-xl font-bold text-gray-800">Material en vales por persona</h3>
            </div>
            <div className="flex flex-wrap gap-1">
              {RESPONSABLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setGraficaValesResponsable(r.id)}
                  className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                    graficaValesResponsable === r.id
                      ? `${r.activeBg} text-white border-transparent`
                      : `bg-white text-gray-600 ${r.border} ${r.hover}`
                  }`}
                >
                  {r.shortLabel}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <PieChart
              data={valesResumen.porPersona}
              valueFormatter={formatNumber}
              setTooltip={setTooltip}
              onItemClick={(item) => handleChartItemClick('vales-persona', item)}
            />
            <ChartLegend items={valesResumen.porPersona} valueFormatter={formatNumber} />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Package className="text-p3-red" size={24} />
              <h3 className="text-xl font-bold text-gray-800">Top productos en existencia</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {topExistencias.length} registros
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {[5, 10, 20, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => setTopExistenciasCount(n)}
                  className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                    topExistenciasCount === n
                      ? 'bg-p3-red text-white border-p3-red'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Top {n}
                </button>
              ))}
            </div>
          </div>
          <HorizontalBarChart
            data={topExistencias}
            valueFormatter={formatNumber}
            setTooltip={setTooltip}
            onItemClick={(item) => handleChartItemClick('existencias-top', item)}
          />
          <ChartLegend items={topExistencias.slice(0, 5)} valueFormatter={formatNumber} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Users className="text-p3-red" size={24} />
              <h3 className="text-xl font-bold text-gray-800">Mejores clientes</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {mejoresClientes.length} registros
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {[5, 10, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setTopClientesCount(n)}
                  className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                    topClientesCount === n
                      ? 'bg-p3-red text-white border-p3-red'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Top {n}
                </button>
              ))}
            </div>
          </div>
          <HorizontalBarChart
            data={mejoresClientes}
            valueFormatter={formatCurrency}
            setTooltip={setTooltip}
            onItemClick={(item) => handleChartItemClick('clientes-top', item)}
          />
          <ChartLegend items={mejoresClientes.slice(0, 5)} valueFormatter={formatCurrency} />
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <ClipboardList className="text-p3-red" size={24} />
              <h3 className="text-xl font-bold text-gray-800">Pedidos por estado</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {pedidosResumen.total} registros
              </span>
            </div>
            <select
              value={pedidosEstadoFiltro}
              onChange={(e) => setPedidosEstadoFiltro(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-red focus:border-p3-red"
            >
              <option value="">Todos los estados</option>
              {Array.from(new Set(pedidos.map((p) => p.estado || 'Sin estado')))
                .sort()
                .map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
            </select>
          </div>
          {pedidosResumen.porEstado.length === 0 ? (
            <EmptyState message="Sin pedidos por estado" icon={ShoppingCart} />
          ) : (
            <>
              <div className="flex flex-wrap gap-3 mt-2">
                {pedidosResumen.porEstado.map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: e.color }}
                    />
                    <span className="text-sm text-gray-700 font-medium">{e.label}</span>
                    <span className="text-sm font-bold text-gray-900">{e.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <HorizontalBarChart
                  data={pedidosResumen.porEstado}
                  valueFormatter={(v) => v}
                  setTooltip={setTooltip}
                  onItemClick={(item) => handleChartItemClick('pedidos-estado', item)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Valorización por sub-almacén */}
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <SectionHeader
            title="Valorización por sub-almacén"
            count={subalmacenes.length}
            icon={Warehouse}
          />
          <p className="text-sm text-gray-500 mb-5">
            {/*
              NOTA: Para mostrar cómo "sube o baja" la valorización con el tiempo se
              requeriría guardar un histórico periódico de este cálculo. Por ahora se
              muestra el valor actual del inventario por sub-almacén.
            */}
            Valor actual del inventario distribuido por sub-almacén.
          </p>
          <div className="min-h-[24rem]">
            <HorizontalBarChart
              data={subalmacenesData}
              valueFormatter={formatCurrency}
              setTooltip={setTooltip}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <SectionHeader title="Detalle por sub-almacén" icon={Warehouse} />
          <DataTable
            rows={subalmacenes}
            columns={[
              { key: 'nombre', label: 'Almacén', sortable: true, wrap: true },
              {
                key: 'existencia_total',
                label: 'Existencia total',
                sortable: true,
                total: true,
                accessor: (row) => Number(row.existencia_total) || 0,
                format: formatNumber,
              },
              {
                key: 'valor_total',
                label: 'Valor total',
                sortable: true,
                total: true,
                accessor: (row) => Number(row.valor_total) || 0,
                format: formatCurrency,
              },
            ]}
            emptyMessage="No se encontraron sub-almacenes"
            emptyIcon={Warehouse}
          />
        </div>
      </div>

      {/* Gauge y resumen de vales */}
      {totalExistencia > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:col-span-1">
            <SectionHeader title="Material en vales vs existencia total" icon={Gauge} />
            <GaugeChart
              percent={(valesResumen.totalPiezas / totalExistencia) * 100}
              setTooltip={setTooltip}
            />
            <p className="text-center text-xs text-gray-500 mt-2">
              {formatNumber(valesResumen.totalPiezas)} de {formatNumber(totalExistencia)} piezas
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:col-span-2">
            <SectionHeader title="Resumen de vales" icon={ClipboardList} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
              <KpiCard
                label="Total de vales abiertos"
                value={formatNumber(valesResumen.totalVales)}
                icon={ClipboardList}
                color="bg-p3-blue"
                subtext="Folios activos"
              />
              <KpiCard
                label="Total de piezas en vales"
                value={formatNumber(valesResumen.totalPiezas)}
                icon={Boxes}
                color="bg-emerald-600"
                subtext="Unidades apartadas"
              />
              {valesResumen.porPersona.map((p) => {
                const r = RESPONSABLES.find((x) => x.shortLabel === p.label);
                return (
                  <KpiCard
                    key={p.label}
                    label={p.label}
                    value={formatNumber(p.value)}
                    icon={Users}
                    color={r?.activeBg || 'bg-gray-500'}
                    subtext="piezas"
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderExistencias = () => (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] xl:grid-cols-[1fr,360px] 2xl:grid-cols-[1fr,400px] gap-4 lg:gap-6">
      <div className="min-w-0 space-y-6">
        <SectionHeader
          title="Existencias por producto"
          count={existencias.length}
          icon={Package}
        />
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <DebouncedInput
              type="text"
              placeholder="Buscar código o descripción..."
              value={existenciasSearch}
              onChange={setExistenciasSearch}
              delay={600}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
            />
            {existenciasLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-p3-red border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="relative min-w-[12rem] lg:min-w-[16rem]">
            <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={existenciasAlmacen}
              onChange={(e) => setExistenciasAlmacen(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow appearance-none"
            >
              <option value="">Todos los almacenes</option>
              {subalmacenes.map((s) => (
                <option key={s.cve_alm} value={s.cve_alm}>
                  {s.nombre || `Almacén ${s.cve_alm}`}
                </option>
              ))}
            </select>
          </div>
          <div className="relative min-w-[10rem]">
            <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={existenciasFiltro}
              onChange={(e) => setExistenciasFiltro(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow appearance-none"
            >
              <option value="con">Con existencia</option>
              <option value="sin">Sin existencia</option>
              <option value="todos">Todos</option>
            </select>
          </div>
        </div>
        <div className="relative">
          {existenciasLoading && (
            <div className="absolute top-2 right-2 z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100 text-xs text-gray-600">
                <div className="w-3.5 h-3.5 border-2 border-p3-red border-t-transparent rounded-full animate-spin"></div>
                Actualizando...
              </div>
            </div>
          )}
          <DataTable
            rows={existencias}
            onRowClick={(row) => setExistenciasSelected(row)}
            selectedRow={existenciasSelected}
            columns={[
            { key: 'codigo', label: 'Código', sortable: true },
            { key: 'descripcion', label: 'Descripción', sortable: true, wrap: true },
            {
              key: 'material_en_vales',
              label: 'Existencia en vales',
              sortable: true,
              total: true,
              accessor: (row) => Number(row.material_en_vales) || 0,
              format: formatNumber,
            },
            {
              key: 'existencia_almacen',
              label: 'Existencia en almacén',
              sortable: true,
              total: true,
              accessor: (row) =>
                Number((row.existencia_total || 0) - (row.material_en_vales || 0)),
              format: formatNumber,
            },
            {
              key: 'existencia_total',
              label: 'Existencia total',
              sortable: true,
              total: true,
              accessor: (row) => Number(row.existencia_total) || 0,
              format: formatNumber,
            },
          ]}
          emptyMessage="No se encontraron existencias"
          emptyIcon={Package}
        />
        </div>
        {existenciasTotal > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-sm text-gray-500">
              Mostrando <span className="font-semibold text-gray-700">{existencias.length}</span> de{' '}
              <span className="font-semibold text-gray-700">{existenciasTotal}</span> registros
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleExistenciasPageChange(Math.max(0, existenciasOffset - EXISTENCIAS_PAGE_SIZE))
                }
                disabled={existenciasOffset === 0}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600 px-2">
                Página {existenciasPageInfo.page} de {existenciasPageInfo.totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  handleExistenciasPageChange(existenciasOffset + EXISTENCIAS_PAGE_SIZE)
                }
                disabled={existenciasOffset + EXISTENCIAS_PAGE_SIZE >= existenciasTotal}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 bg-white rounded-2xl shadow-md border border-gray-100 p-5 space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Foto del producto
          </h4>
          {!existenciasSelected ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-200">
              <div className="mx-auto w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-3">
                <Camera className="text-gray-400" size={28} />
              </div>
              <p className="text-gray-500 font-medium text-sm">Selecciona un producto</p>
              <p className="text-xs text-gray-400 mt-1">
                Haz clic en una fila para ver su foto.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Código</p>
                <p className="text-base font-semibold text-gray-900">
                  {existenciasSelected.codigo}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Descripción</p>
                <p className="text-sm text-gray-700 leading-snug">
                  {existenciasSelected.descripcion || '—'}
                </p>
              </div>

              <ProductoFoto
                codigo={existenciasSelected.codigo}
                onExpand={() => setFotoLightboxOpen(true)}
              />

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500 uppercase">Total</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatNumber(existenciasSelected.existencia_total)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500 uppercase">En vales</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatNumber(existenciasSelected.material_en_vales)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500 uppercase">Almacén</p>
                  <p className="text-sm font-bold text-gray-900">
                    {formatNumber(existenciasSelected.existencia_almacen)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {fotoLightboxOpen && existenciasSelected && (
        <ImageLightbox
          codigo={existenciasSelected.codigo}
          descripcion={existenciasSelected.descripcion}
          onClose={() => setFotoLightboxOpen(false)}
        />
      )}
    </div>
  );

  const detalleVale = useMemo(() => {
    if (!valeSeleccionado) return [];
    return vales.filter((v) => v.folio === valeSeleccionado.folio);
  }, [valeSeleccionado, vales]);

  const renderVales = () => (
    <div className="space-y-6">
      <SectionHeader
        title="Material en vales abiertos"
        count={valesModo === 'global' ? valesGlobal.length : vales.length}
        icon={ClipboardList}
      />

      {/* Modo vista */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setValesModo('desglose')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            valesModo === 'desglose'
              ? 'bg-p3-red text-white border-p3-red'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <FileText size={16} />
          Desglose por vale
        </button>
        <button
          onClick={() => setValesModo('global')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            valesModo === 'global'
              ? 'bg-p3-red text-white border-p3-red'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Layers size={16} />
          Global por código
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {RESPONSABLES.map((r) => {
          const isActive = valesResponsable === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setValesResponsable(r.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                isActive
                  ? `${r.activeBg} text-white`
                  : `bg-white ${r.text} ${r.hover} ${r.border}`
              }`}
            >
              <Users size={16} />
              {r.label}
            </button>
          );
        })}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Filter size={16} className="text-p3-red" />
          Filtros adicionales
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Desde</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={valesFechaDesde}
                onChange={(e) => setValesFechaDesde(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Hasta</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="date"
                value={valesFechaHasta}
                onChange={(e) => setValesFechaHasta(e.target.value)}
                className="pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Almacén origen</label>
            <select
              value={valesAlmacen}
              onChange={(e) => setValesAlmacen(e.target.value)}
              className="min-w-[12rem] px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
            >
              <option value="">Todos los almacenes</option>
              {almacenesOptions.map((alm) => (
                <option key={alm} value={alm}>
                  {alm}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Código / descripción</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <DebouncedInput
                type="text"
                placeholder="Buscar..."
                value={valesBusqueda}
                onChange={setValesBusqueda}
                delay={600}
                className="min-w-[14rem] pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
              />
            </div>
          </div>
          <button
            onClick={() => {
              setValesFechaDesde('');
              setValesFechaHasta('');
              setValesAlmacen('');
              setValesResponsable('');
              setValesBusqueda('');
            }}
            className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {valesModo === 'global' ? (
        <DataTable
          rows={valesGlobal}
          columns={[
            { key: 'codigo', label: 'Código', sortable: true },
            { key: 'descripcion', label: 'Descripción', sortable: true, wrap: true },
            {
              key: 'cantidad_viva',
              label: 'Cantidad viva total',
              sortable: true,
              total: true,
              accessor: (row) => Number(row.cantidad_viva) || 0,
              format: formatNumber,
            },
            {
              key: 'folios_count',
              label: 'Vales',
              sortable: true,
              accessor: (row) => Number(row.folios_count) || 0,
              format: formatNumber,
            },
            {
              key: 'almacenes',
              label: 'Almacenes',
              sortable: false,
              wrap: true,
              accessor: (row) => (row.almacenes || []).join(', '),
            },
          ]}
          emptyMessage="No hay vales abiertos actualmente"
          emptyIcon={ClipboardList}
        />
      ) : (
        <DataTable
          rows={vales}
          onRowDoubleClick={(row) => setValeSeleccionado(row)}
          columns={[
            { key: 'folio', label: 'Folio', sortable: true },
            { key: 'entregado_a', label: 'Entregado a', sortable: true, wrap: true },
            { key: 'fecha_salida', label: 'Fecha', sortable: true },
            { key: 'codigo', label: 'Código', sortable: true },
            { key: 'descripcion', label: 'Descripción', sortable: true, wrap: true },
            {
              key: 'cantidad',
              label: 'Cantidad',
              sortable: true,
              total: true,
              accessor: (row) => Number(row.cantidad) || 0,
              format: formatNumber,
            },
            { key: 'almacen_origen', label: 'Almacén', sortable: true, wrap: true },
            { key: 'estado', label: 'Estado', sortable: true },
          ]}
          emptyMessage="No hay vales abiertos actualmente"
          emptyIcon={ClipboardList}
        />
      )}

      {/* Modal detalle de vale */}
      {valeSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-2 sm:mx-0">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Vale {valeSeleccionado.folio}
                </h3>
                <p className="text-sm text-gray-500">
                  {detalleVale.length} partida{detalleVale.length === 1 ? '' : 's'} · Entregado a:{' '}
                  {valeSeleccionado.entregado_a || '—'}
                </p>
              </div>
              <button
                onClick={() => setValeSeleccionado(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 overflow-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Fecha de salida</p>
                  <p className="font-semibold text-gray-900">{valeSeleccionado.fecha_salida || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Estado</p>
                  <p className="font-semibold text-gray-900">{valeSeleccionado.estado || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Total piezas</p>
                  <p className="font-semibold text-gray-900">
                    {formatNumber(detalleVale.reduce((s, v) => s + (Number(v.cantidad) || 0), 0))}
                  </p>
                </div>
              </div>
              <DataTable
                rows={detalleVale}
                columns={[
                  { key: 'codigo', label: 'Código', sortable: true },
                  { key: 'descripcion', label: 'Descripción', sortable: true, wrap: true },
                  {
                    key: 'cantidad',
                    label: 'Cantidad',
                    sortable: true,
                    total: true,
                    accessor: (row) => Number(row.cantidad) || 0,
                    format: formatNumber,
                  },
                  {
                    key: 'cantidad_viva',
                    label: 'Cantidad viva',
                    sortable: true,
                    total: true,
                    accessor: (row) => Number(row.cantidad_viva) || 0,
                    format: formatNumber,
                  },
                  { key: 'almacen_origen', label: 'Almacén origen', sortable: true, wrap: true },
                ]}
                emptyMessage="Sin partidas"
                emptyIcon={ClipboardList}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPedidos = () => (
    <div className="space-y-6">
      <SectionHeader title="Pedidos abiertos" count={pedidos.length} icon={ShoppingCart} />

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative flex-1 min-w-[14rem]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <DebouncedInput
              type="text"
              placeholder="Buscar folio, cliente o código..."
              value={pedidoBusqueda}
              onChange={setPedidoBusqueda}
              delay={600}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
            />
          </div>
          <button
            onClick={() => {
              setPedidoBusqueda('');
              setPedidoSeleccionado(null);
            }}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      <DataTable
        rows={pedidos}
        selectedRow={pedidoSeleccionado}
        onRowClick={(row) => setPedidoSeleccionado(row)}
        columns={[
          { key: 'folio', label: 'Folio', sortable: true },
          { key: 'cliente', label: 'Cliente', sortable: true, wrap: true },
          { key: 'fecha', label: 'Fecha', sortable: true },
          {
            key: 'importe_total',
            label: 'Importe',
            sortable: true,
            total: true,
            accessor: (row) => Number(row.importe_total) || 0,
            format: formatCurrency,
          },
          {
            key: 'total_facturado',
            label: 'Facturado',
            sortable: true,
            total: true,
            accessor: (row) => Number(row.total_facturado) || 0,
            format: formatCurrency,
          },
          {
            key: 'saldo_pendiente',
            label: 'Saldo',
            sortable: true,
            total: true,
            accessor: (row) => Number(row.saldo_pendiente) || 0,
            format: formatCurrency,
          },
          { key: 'estado', label: 'Estado', sortable: true },
          {
            key: 'dias_pendiente',
            label: 'Días',
            sortable: true,
            accessor: (row) => Number(row.dias_pendiente) || 0,
            format: formatNumber,
          },
        ]}
        emptyMessage="No hay pedidos abiertos pendientes"
        emptyIcon={ShoppingCart}
      />

      <p className="text-xs text-gray-500">
        {pedidoSeleccionado
          ? `Mostrando seguimiento documental del pedido ${pedidoSeleccionado.folio}. Haz clic en otra fila para cambiar.`
          : 'Haz clic en un pedido para ver su seguimiento documental.'}
      </p>

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <SectionHeader
            title={pedidoSeleccionado ? `Seguimiento documental: ${pedidoSeleccionado.folio}` : 'Seguimiento documental'}
            count={pedidoDetalle.length}
            icon={FileText}
          />
          {pedidoSeleccionado && (
            <button
              onClick={() => setPedidoSeleccionado(null)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Ver todos los pedidos
            </button>
          )}
        </div>

        {pedidoDetalleLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-p3-red border-t-transparent rounded-full animate-spin"></div>
            Cargando seguimiento...
          </div>
        )}

        {pedidoSeleccionado ? (
          <DataTable
            rows={pedidoDetalle}
            columns={[
              { key: 'folio_pedido', label: 'Pedido', sortable: true },
              { key: 'fecha_pedido', label: 'Fecha pedido', sortable: true },
              { key: 'cliente', label: 'Cliente', sortable: true, wrap: true },
              { key: 'codigo', label: 'Código', sortable: true },
              { key: 'descripcion', label: 'Descripción', sortable: true, wrap: true },
              {
                key: 'cantidad_pedido',
                label: 'Cantidad',
                sortable: true,
                total: true,
                accessor: (row) => Number(row.cantidad_pedido) || 0,
                format: formatNumber,
              },
              { key: 'folio_remision', label: 'Remisión', sortable: true },
              {
                key: 'cantidad_remision',
                label: 'Cant. remisión',
                sortable: true,
                total: true,
                accessor: (row) => Number(row.cantidad_remision) || 0,
                format: formatNumber,
              },
              { key: 'folio_factura', label: 'Factura', sortable: true },
              {
                key: 'cantidad_factura',
                label: 'Cant. factura',
                sortable: true,
                total: true,
                accessor: (row) => Number(row.cantidad_factura) || 0,
                format: formatNumber,
              },
              { key: 'estatus_linea', label: 'Estatus', sortable: true },
            ]}
            emptyMessage="No hay seguimiento documental para este pedido"
            emptyIcon={FileText}
          />
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Selecciona un pedido</p>
            <p className="text-sm text-gray-400 mt-1">
              Haz clic en una fila de la tabla superior para ver su seguimiento documental.
            </p>
          </div>
        )}
      </section>
    </div>
  );

  const renderHistorialVentas = () => {
    const handleHistorialPageChange = (newOffset) => {
      setHistorialOffset(newOffset);
      loadHistorialVentas(buildHistorialQuery(newOffset));
    };

    return (
      <div className="space-y-6">
        <SectionHeader
          title="Historial de ventas"
          count={historialTotal}
          icon={History}
        />

        {/* KPIs de totales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard
            label="Total ventas MXN"
            value={formatCurrency(historialTotales.MXN)}
            icon={DollarSign}
            color="bg-p3-red"
            subtext="Total acumulado filtrado"
          />
          <KpiCard
            label="Total ventas USD"
            value={formatCurrency(historialTotales.USD, 'USD')}
            icon={DollarSign}
            color="bg-emerald-600"
            subtext="Total acumulado filtrado"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <DebouncedInput
              type="text"
              placeholder="Buscar cliente, código o descripción..."
              value={historialSearch}
              onChange={setHistorialSearch}
              delay={600}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
            />
            {historialLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-p3-red border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="min-w-[14rem]">
            <MultiSearchableSelect
              values={historialCliente}
              onChange={setHistorialCliente}
              options={historialClientesOptions}
              placeholder="Escribe para buscar clientes..."
              emptyMessage="No se encontraron clientes"
              className="w-full"
            />
          </div>
          <div className="min-w-[12rem]">
            <MultiSearchableSelect
              values={historialCodigo}
              onChange={setHistorialCodigo}
              options={historialCodigosOptions}
              placeholder="Buscar códigos..."
              emptyMessage="No se encontraron códigos"
              className="w-full"
            />
          </div>
          <div className="relative min-w-[8rem]">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={historialMoneda}
              onChange={(e) => setHistorialMoneda(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow appearance-none"
            >
              <option value="">Todas las monedas</option>
              <option value="MXN">Pesos (MXN)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>
        </div>

        {/* Filtros de fecha y exportación */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <div className="flex flex-1 flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={historialFechaDesde}
                onChange={(e) => setHistorialFechaDesde(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow text-sm"
                placeholder="Desde"
              />
            </div>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={historialFechaHasta}
                onChange={(e) => setHistorialFechaHasta(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow text-sm"
                placeholder="Hasta"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                setHistorialFechaDesde(start.toISOString().slice(0, 10));
                setHistorialFechaHasta(now.toISOString().slice(0, 10));
              }}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Mes actual
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const end = new Date(now.getFullYear(), now.getMonth(), 0);
                setHistorialFechaDesde(start.toISOString().slice(0, 10));
                setHistorialFechaHasta(end.toISOString().slice(0, 10));
              }}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Mes anterior
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setHistorialFechaDesde(`${now.getFullYear()}-01-01`);
                setHistorialFechaHasta(now.toISOString().slice(0, 10));
              }}
              className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Año actual
            </button>
            <button
              type="button"
              onClick={() => {
                setHistorialFechaDesde('');
                setHistorialFechaHasta('');
              }}
              className="px-3 py-2 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Limpiar fechas
            </button>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await exportarHistorialVentas(
                  {
                    busqueda: historialSearch.trim(),
                    cliente: historialCliente.filter(Boolean),
                    codigo: historialCodigo.filter(Boolean),
                    moneda: historialMoneda,
                    fecha_desde: historialFechaDesde || null,
                    fecha_hasta: historialFechaHasta || null,
                  },
                  `historial_ventas_${new Date().toISOString().slice(0, 10)}.xlsx`
                );
              } catch (err) {
                setError(err.message);
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm"
          >
            <FileSpreadsheet size={18} />
            Exportar Excel
          </button>
        </div>

        {/* Tabla */}
        <div className="relative">
          {historialLoading && (
            <div className="absolute top-2 right-2 z-10">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100 text-xs text-gray-600">
                <div className="w-3.5 h-3.5 border-2 border-p3-red border-t-transparent rounded-full animate-spin"></div>
                Actualizando...
              </div>
            </div>
          )}
          <DataTable
            rows={historialVentas}
            columns={[
              { key: 'cliente', label: 'Cliente', sortable: true, wrap: true },
              { key: 'folio_factura', label: 'Folio factura', sortable: true },
              { key: 'fecha_factura', label: 'Fecha factura', sortable: true, accessor: (row) => row.fecha_factura, format: formatDate },
              { key: 'codigo', label: 'Código', sortable: true },
              { key: 'descripcion', label: 'Descripción', sortable: true, wrap: true },
              {
                key: 'cantidad',
                label: 'Cantidad',
                sortable: true,
                total: true,
                accessor: (row) => Number(row.cantidad) || 0,
                format: formatNumber,
              },
              {
                key: 'precio_unitario',
                label: 'Precio unitario',
                sortable: true,
                accessor: (row) => Number(row.precio_unitario) || 0,
                format: formatCurrency,
              },
              {
                key: 'importe_partida',
                label: 'Importe',
                sortable: true,
                total: true,
                accessor: (row) => Number(row.importe_partida) || 0,
                format: formatCurrency,
              },
              { key: 'moneda', label: 'Moneda', sortable: true },
            ]}
            emptyMessage="No se encontraron ventas con esos criterios"
            emptyIcon={History}
          />
        </div>

        {historialTotal > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-sm text-gray-500">
              Mostrando <span className="font-semibold text-gray-700">{historialVentas.length}</span> de{' '}
              <span className="font-semibold text-gray-700">{historialTotal}</span> registros
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleHistorialPageChange(Math.max(0, historialOffset - HISTORIAL_PAGE_SIZE))
                }
                disabled={historialOffset === 0}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600 px-2">
                Página {historialPageInfo.page} de {historialPageInfo.totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  handleHistorialPageChange(historialOffset + HISTORIAL_PAGE_SIZE)
                }
                disabled={historialOffset + HISTORIAL_PAGE_SIZE >= historialTotal}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSanAntonio = () => {
    const cabeceras = sanAntonio?.cabeceras || [];
    const partidas = sanAntonio?.partidas || [];

    const estadosPartida = [...new Set(partidas.map((p) => String(p.estadolinea || '').trim()).filter(Boolean))].sort();

    const cabecerasFiltradas = (() => {
      let filtradas = cabeceras;

      if (sanAntonioBusquedaOc.trim()) {
        const q = sanAntonioBusquedaOc.toLowerCase();
        filtradas = filtradas.filter((oc) =>
          ['folio', 'nopedido', 'fechaoc', 'moneda', 'condicionespago', 'estadooc', 'cargadaportal'].some((k) =>
            String(oc[k] || '').toLowerCase().includes(q)
          )
        );
      }

      if (sanAntonioBusquedaMaterialOc.trim()) {
        const q = sanAntonioBusquedaMaterialOc.toLowerCase();
        const foliosConMaterial = new Set(
          partidas
            .filter((p) =>
              [p.codigo, p.descripcion].some((v) => String(v || '').toLowerCase().includes(q))
            )
            .map((p) => String(p.folio))
        );
        filtradas = filtradas.filter((oc) => foliosConMaterial.has(String(oc.folio)));
      }

      return filtradas;
    })();

    const partidasFiltradas = (() => {
      let filtradas = partidas;
      if (sanAntonioOcSeleccionada) {
        filtradas = filtradas.filter((p) => String(p.folio) === String(sanAntonioOcSeleccionada.folio));
      }
      if (sanAntonioEstadoPartida) {
        filtradas = filtradas.filter(
          (p) => String(p.estadolinea || '').toLowerCase() === sanAntonioEstadoPartida.toLowerCase()
        );
      }
      if (sanAntonioBusquedaPartida.trim()) {
        const q = sanAntonioBusquedaPartida.toLowerCase();
        filtradas = filtradas.filter((p) =>
          [p.codigo, p.descripcion, p.folio].some((v) => String(v || '').toLowerCase().includes(q))
        );
      }
      return filtradas;
    })();

    return (
      <div className="space-y-6">
        {sanAntonio?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <span>{sanAntonio.error}</span>
          </div>
        )}

        <section className="space-y-4">
          <SectionHeader title="Órdenes de compra" count={cabecerasFiltradas.length} icon={FileText} />
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="relative flex-1 min-w-[14rem]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <DebouncedInput
                  type="text"
                  placeholder="Buscar folio, pedido, fecha, moneda, condiciones o estado..."
                  value={sanAntonioBusquedaOc}
                  onChange={setSanAntonioBusquedaOc}
                  delay={400}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
                />
              </div>
              <div className="relative flex-1 min-w-[14rem]">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <DebouncedInput
                  type="text"
                  placeholder="Filtrar OC por código o descripción de material..."
                  value={sanAntonioBusquedaMaterialOc}
                  onChange={setSanAntonioBusquedaMaterialOc}
                  delay={400}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
                />
              </div>
              <button
                onClick={() => {
                  setSanAntonioBusquedaOc('');
                  setSanAntonioBusquedaMaterialOc('');
                  setSanAntonioOcSeleccionada(null);
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>
          <DataTable
            rows={cabecerasFiltradas}
            selectedRow={sanAntonioOcSeleccionada}
            onRowClick={(row) => setSanAntonioOcSeleccionada(row)}
            columns={[
              { key: 'folio', label: 'Folio', sortable: true },
              { key: 'nopedido', label: 'No. pedido', sortable: true },
              { key: 'fechaoc', label: 'Fecha OC', sortable: true },
              { key: 'moneda', label: 'Moneda', sortable: true },
              { key: 'condicionespago', label: 'Condiciones pago', sortable: true, wrap: true },
              {
                key: 'totaloc',
                label: 'Total',
                sortable: true,
                accessor: (row) => Number(row.totaloc) || 0,
                format: formatCurrency,
              },
              { key: 'estadooc', label: 'Estado', sortable: true },
              { key: 'cargadaportal', label: 'Cargada portal', sortable: true },
            ]}
            emptyMessage="No se encontraron órdenes de San Antonio"
            emptyIcon={FileText}
          />
          <p className="text-xs text-gray-500">
            {sanAntonioOcSeleccionada
              ? `Mostrando material de la OC ${sanAntonioOcSeleccionada.folio}. Haz clic en otra fila para cambiar.`
              : 'Haz clic en una orden de compra para ver su material abajo.'}
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <SectionHeader
              title={sanAntonioOcSeleccionada ? `Material de OC ${sanAntonioOcSeleccionada.folio}` : 'Material de la OC'}
              count={partidasFiltradas.length}
              icon={Filter}
            />
            {sanAntonioOcSeleccionada && (
              <button
                onClick={() => setSanAntonioOcSeleccionada(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Ver todas las OC
              </button>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="relative flex-1 min-w-[14rem]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <DebouncedInput
                  type="text"
                  placeholder="Buscar código o descripción..."
                  value={sanAntonioBusquedaPartida}
                  onChange={setSanAntonioBusquedaPartida}
                  delay={400}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Estado de línea</label>
                <select
                  value={sanAntonioEstadoPartida}
                  onChange={(e) => setSanAntonioEstadoPartida(e.target.value)}
                  className="min-w-[12rem] px-3 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-p3-red focus:border-p3-red transition-shadow"
                >
                  <option value="">Todos los estados</option>
                  {estadosPartida.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setSanAntonioBusquedaPartida('');
                  setSanAntonioEstadoPartida('');
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>

          {sanAntonioOcSeleccionada ? (
            <DataTable
              rows={partidasFiltradas}
              columns={[
                {
                  key: 'posicion',
                  label: 'Pos',
                  sortable: true,
                  accessor: (row) => Number(row.posicion) || 0,
                  format: formatNumber,
                },
                { key: 'codigo', label: 'Código', sortable: true },
                { key: 'descripcion', label: 'Descripción', sortable: true, wrap: true },
                {
                  key: 'cantidadpedido',
                  label: 'Cantidad pedido',
                  sortable: true,
                  total: true,
                  accessor: (row) => Number(row.cantidadpedido) || 0,
                  format: formatNumber,
                },
                {
                  key: 'preciounitario',
                  label: 'Precio unit',
                  sortable: true,
                  accessor: (row) => Number(row.preciounitario) || 0,
                  format: formatCurrency,
                },
                {
                  key: 'entregada',
                  label: 'Entregada',
                  sortable: true,
                  total: true,
                  accessor: (row) => Number(row.entregada) || 0,
                  format: formatNumber,
                },
                {
                  key: 'saldo',
                  label: 'Saldo',
                  sortable: true,
                  total: true,
                  accessor: (row) => Number(row.saldo) || 0,
                  format: formatNumber,
                },
                { key: 'estadolinea', label: 'Estado', sortable: true },
              ]}
              emptyMessage="No hay partidas para la OC seleccionada"
              emptyIcon={Filter}
            />
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Selecciona una orden de compra</p>
              <p className="text-sm text-gray-400 mt-1">
                Haz clic en una fila de la tabla superior para ver su material.
              </p>
            </div>
          )}
        </section>
      </div>
    );
  };

  const renderValorInventario = () => {
    const fechas = [...new Set(historialValor.map((d) => d.fecha))].sort();
    const almacenes = historialValor
      .filter((d) => d.cve_alm && d.cve_alm !== 'TOTAL')
      .map((d) => ({ cve_alm: d.cve_alm, nombre_alm: d.nombre_alm }));
    const uniqueAlmacenes = Array.from(new Map(almacenes.map((a) => [a.cve_alm, a])).values());

    const buildSeries = () => {
      const totalSeries = {
        label: 'Total',
        color: COLORS.red,
        isTotal: true,
        values: fechas.map((f) => {
          const row = historialValor.find((d) => d.fecha === f && (!d.cve_alm || d.cve_alm === 'TOTAL'));
          return { fecha: f, value: row ? row.valor_total : 0 };
        }),
      };

      const almacenSeries = uniqueAlmacenes.map((alm, i) => ({
        label: alm.nombre_alm || `Almacén ${alm.cve_alm}`,
        color: PALETTE[(i + 1) % PALETTE.length],
        values: fechas.map((f) => {
          const row = historialValor.find((d) => d.fecha === f && d.cve_alm === alm.cve_alm);
          return { fecha: f, value: row ? row.valor_total : 0 };
        }),
      }));

      return [totalSeries, ...almacenSeries].filter(
        (s) => !Object.prototype.hasOwnProperty.call(historialValorVisibleSeries, s.label) || historialValorVisibleSeries[s.label]
      );
    };

    const series = buildSeries();

    const totalRows = historialValor.filter((d) => !d.cve_alm || d.cve_alm === 'TOTAL').sort((a, b) => a.fecha.localeCompare(b.fecha));
    const valorActual = totalRows.length > 0 ? totalRows[totalRows.length - 1].valor_total : 0;
    const valorAnterior = totalRows.length > 1 ? totalRows[totalRows.length - 2].valor_total : valorActual;
    const cambio = valorActual - valorAnterior;
    const cambioPct = valorAnterior !== 0 ? (cambio / valorAnterior) * 100 : 0;

    const toggleSeries = (label) => {
      setHistorialValorVisibleSeries((prev) => ({
        ...prev,
        [label]: !(Object.prototype.hasOwnProperty.call(prev, label) ? prev[label] : true),
      }));
    };

    return (
      <div className="space-y-6">
        <SectionHeader title="Valor histórico del inventario" icon={Activity} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            label="Valor actual"
            value={formatCurrencySmart(valorActual)}
            icon={DollarSign}
            color="bg-p3-blue"
            subtext="Inventario total hoy"
          />
          <KpiCard
            label="Cambio vs día anterior"
            value={formatCurrencySmart(cambio)}
            icon={cambio >= 0 ? ArrowUp : ArrowDown}
            color={cambio >= 0 ? 'bg-emerald-600' : 'bg-red-500'}
            subtext={`${cambioPct >= 0 ? '+' : ''}${cambioPct.toFixed(2)}%`}
          />
          <KpiCard
            label="Días registrados"
            value={fechas.length}
            icon={Calendar}
            color="bg-p3-blue-light"
            subtext="Snapshots guardados"
          />
        </div>

        <div className="flex flex-wrap items-end gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Desde</label>
            <input
              type="date"
              value={historialValorDesde}
              onChange={(e) => setHistorialValorDesde(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-p3-red focus:border-p3-red"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Hasta</label>
            <input
              type="date"
              value={historialValorHasta}
              onChange={(e) => setHistorialValorHasta(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-p3-red focus:border-p3-red"
            />
          </div>
          <button
            type="button"
            onClick={loadHistorialValorInventario}
            disabled={historialValorLoading}
            className="flex items-center gap-2 px-4 py-2 bg-p3-red text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {historialValorLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Actualizar
          </button>
          <button
            type="button"
            onClick={async () => {
              setHistorialValorLoading(true);
              try {
                await guardarSnapshotValorInventario();
                await loadHistorialValorInventario();
              } catch (err) {
                setError(err.message);
              } finally {
                setHistorialValorLoading(false);
              }
            }}
            disabled={historialValorLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
          >
            <TrendingUp size={16} />
            Guardar snapshot hoy
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          {fechas.length === 0 ? (
            <EmptyState
              message="Aún no hay historial de valor"
              icon={BarChart3}
            />
          ) : (
            <>
              <LineChart
                series={series}
                valueFormatter={formatCurrencySmart}
                setTooltip={setTooltip}
              />
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {[{
                  label: 'Total',
                  color: COLORS.red,
                }, ...uniqueAlmacenes.map((alm, i) => ({
                  label: alm.nombre_alm || `Almacén ${alm.cve_alm}`,
                  color: PALETTE[(i + 1) % PALETTE.length],
                }))].map((item) => {
                  const visible = Object.prototype.hasOwnProperty.call(historialValorVisibleSeries, item.label)
                    ? historialValorVisibleSeries[item.label]
                    : true;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => toggleSeries(item.label)}
                      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg border transition-all ${
                        visible
                          ? 'bg-gray-50 border-gray-200 text-gray-700'
                          : 'bg-white border-gray-200 text-gray-400 opacity-60'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const tabContent = {
    resumen: renderResumen(),
    existencias: renderExistencias(),
    vales: renderVales(),
    pedidos: renderPedidos(),
    ventas: renderHistorialVentas(),
    'san-antonio': renderSanAntonio(),
    'valor-inventario': renderValorInventario(),
  };

  return (
    <div className="min-h-screen bg-gray-50/70">
      <Tooltip tooltip={tooltip} />
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="mx-auto max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1920px] flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              <div className="bg-p3-red text-white p-2 rounded-lg shadow-sm">
                <Package size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                  Dashboard Operativo 3P
                </h1>
                <p className="text-xs text-gray-500">
                  {user?.nombre} · {user?.rol}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user?.rol === 'admin' && (
                <button
                  onClick={() => (window.location.href = '/admin')}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
                  title="Administración"
                >
                  <Shield size={18} />
                  <span className="hidden sm:inline">Administración</span>
                </button>
              )}
              <button
                onClick={() => (window.location.href = '/cotizador')}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
                title="Cotizador"
              >
                <Calculator size={18} />
                <span className="hidden sm:inline">Cotizador</span>
              </button>
              <button
                onClick={() => (activeTab === 'resumen' ? loadAll() : loadTabData(activeTab))}
                className="p-2 text-gray-500 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
                title="Recargar"
              >
                <RefreshCw size={18} />
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-p3-red hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mx-auto max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1920px]">
          <div className="flex overflow-x-auto gap-2 mb-6 pb-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-p3-red text-white border-p3-red shadow-md'
                    : 'bg-white text-gray-600 hover:text-p3-red hover:bg-red-50 border-gray-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-p3-red border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-gray-500">Cargando información...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
            {tabContent[activeTab]}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
