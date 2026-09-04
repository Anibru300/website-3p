import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox } from 'lucide-react';
import EmptyState from './EmptyState.jsx';

export default function DataTable({ columns, rows, emptyMessage = 'Sin datos', emptyIcon = Inbox, onRowClick, onRowDoubleClick, selectedRow }) {
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
