const stats = [
  { value: '5000+', label: 'customers served' },
  { value: '30,000+', label: 'products sold' },
  { value: '15,000+', label: 'packets sold' },
  { value: '29+', label: 'Indian states served' },
];

export default function StatsBar() {
  return (
    <section className="bg-white border-y border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.value} className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-black text-text-main">{stat.value}</span>
              <span className="text-sm text-text-muted mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
