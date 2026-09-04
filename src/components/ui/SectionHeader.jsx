export default function SectionHeader({ title, count, icon: Icon }) {
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
