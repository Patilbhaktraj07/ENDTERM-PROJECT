export function SkeletonCard({ height = 180 }) {
  return (
    <div className="card" style={{ padding: 24, height }}>
      <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 12 }} />
      <div className="skeleton" style={{ width: '70%', height: 10, marginBottom: 20 }} />
      <div className="skeleton" style={{ width: '100%', height: height - 110, borderRadius: 8 }} />
    </div>
  );
}

export function SkeletonMetric() {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
        <div className="skeleton" style={{ width: 50, height: 20, borderRadius: 10 }} />
      </div>
      <div className="skeleton" style={{ width: '60%', height: 24, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: '40%', height: 12 }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="skeleton" style={{ width: '30%', height: 16, marginBottom: 20 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 14, alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '15%', height: 12 }} />
          <div className="skeleton" style={{ width: '30%', height: 12 }} />
          <div className="skeleton" style={{ width: '20%', height: 12 }} />
          <div className="skeleton" style={{ width: '15%', height: 12 }} />
        </div>
      ))}
    </div>
  );
}
