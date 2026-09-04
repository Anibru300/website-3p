import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'Sin datos', icon = Inbox }) {
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
