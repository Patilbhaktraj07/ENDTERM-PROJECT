import { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function useCountUp(target, duration = 1000, delay = 0) {
  const [value, setValue] = useState(0);
  const startTime = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    const numTarget = typeof target === 'number' ? target : parseFloat(target);
    if (isNaN(numTarget)) {
      setValue(target);
      return;
    }

    const timeout = setTimeout(() => {
      startTime.current = performance.now();

      function animate(now) {
        const elapsed = now - startTime.current;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * numTarget));
        if (progress < 1) {
          rafId.current = requestAnimationFrame(animate);
        } else {
          setValue(numTarget);
        }
      }

      rafId.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [target, duration, delay]);

  return value;
}

export default function MetricCard({ icon: Icon, label, value, subValue, trend, color, delay = 0 }) {
  const isNumeric = typeof value === 'number' || (!isNaN(parseFloat(value)) && isFinite(value));
  const animatedValue = useCountUp(isNumeric ? parseFloat(value) : 0, 1200, delay + 200);
  const displayValue = isNumeric ? animatedValue : value;

  return (
    <div
      className="metric-card card animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="metric-card-header">
        <div className="metric-icon" style={{ background: color ? `${color}18` : 'var(--primary-lighter)', color: color || 'var(--primary)' }}>
          {Icon && <Icon size={22} />}
        </div>
        {trend !== undefined && (
          <div className={`metric-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className="metric-value">{displayValue}</div>
      <div className="metric-label">{label}</div>
      {subValue && <div className="metric-sub">{subValue}</div>}
    </div>
  );
}
