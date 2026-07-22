import React, { useState } from 'react';
import './LineChart.css';

export default function LineChart() {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Weekly data: Day, Reading Minutes
  const data = [
    { day: 'Mon', mins: 25 },
    { day: 'Tue', mins: 42 },
    { day: 'Wed', mins: 30 },
    { day: 'Thu', mins: 58 },
    { day: 'Fri', mins: 45 },
    { day: 'Sat', mins: 75 },
    { day: 'Sun', mins: 60 }
  ];

  // SVG parameters
  const width = 600;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  // Max value for scaling
  const maxVal = 80;

  // Map values to coordinates
  const getCoordinates = () => {
    return data.map((item, idx) => {
      const x = paddingX + (idx * (width - 2 * paddingX)) / (data.length - 1);
      const y = height - paddingY - (item.mins * (height - 2 * paddingY)) / maxVal;
      return { x, y, day: item.day, value: item.mins };
    });
  };

  const coords = getCoordinates();

  // Create smooth bezier curve path
  const getCurvePath = () => {
    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const current = coords[i];
      const next = coords[i + 1];
      // Control points for bezier curve
      const cpX1 = current.x + (next.x - current.x) / 2;
      const cpY1 = current.y;
      const cpX2 = current.x + (next.x - current.x) / 2;
      const cpY2 = next.y;
      path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
    return path;
  };

  // Create area path under the curve
  const getAreaPath = () => {
    const curvePath = getCurvePath();
    const lastCoord = coords[coords.length - 1];
    const firstCoord = coords[0];
    return `${curvePath} L ${lastCoord.x} ${height - paddingY} L ${firstCoord.x} ${height - paddingY} Z`;
  };

  return (
    <div className="chart-wrapper">
      <div className="chart-header">
        <h4 className="chart-title">Weekly Reading Activity</h4>
        <div className="chart-legend">
          <span className="legend-dot"></span>
          <span>Daily average (mins)</span>
        </div>
      </div>

      <div className="svg-container">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
          <defs>
            {/* Gradient under the line */}
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-accent)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--primary-accent)" stopOpacity="0.0" />
            </linearGradient>
            {/* Filter for glowing line */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 20, 40, 60, 80].map((tick, idx) => {
            const y = height - paddingY - (tick * (height - 2 * paddingY)) / maxVal;
            return (
              <g key={idx} className="chart-grid-group">
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke="var(--border-color)" 
                  strokeWidth="1" 
                  strokeDasharray="4 6" 
                />
                <text 
                  x={paddingX - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  fontSize="11" 
                  fill="var(--text-muted)"
                  fontWeight="500"
                >
                  {tick}m
                </text>
              </g>
            );
          })}

          {/* Area under curve */}
          <path d={getAreaPath()} fill="url(#chartGradient)" />

          {/* Curve Line */}
          <path 
            d={getCurvePath()} 
            fill="none" 
            stroke="var(--primary-accent)" 
            strokeWidth="3.5" 
            strokeLinecap="round"
            className="chart-line-draw"
          />

          {/* Data points */}
          {coords.map((coord, idx) => (
            <g key={idx}>
              <circle
                cx={coord.x}
                cy={coord.y}
                r={hoveredPoint === idx ? 7 : 4.5}
                fill="#FFFFFF"
                stroke="var(--primary-accent)"
                strokeWidth={hoveredPoint === idx ? 3.5 : 2}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
                style={{ cursor: 'pointer', transition: 'r 0.15s ease, stroke-width 0.15s ease' }}
              />
              {/* X Axis Labels */}
              <text
                x={coord.x}
                y={height - 10}
                textAnchor="middle"
                fontSize="12"
                fill="var(--text-muted)"
                fontWeight="600"
              >
                {coord.day}
              </text>
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint !== null && (
          <div 
            className="chart-tooltip"
            style={{
              left: `${(coords[hoveredPoint].x / width) * 100}%`,
              top: `${(coords[hoveredPoint].y / height) * 100 - 18}%`,
            }}
          >
            <div className="tooltip-day">{coords[hoveredPoint].day}</div>
            <div className="tooltip-value">{coords[hoveredPoint].value} mins</div>
          </div>
        )}
      </div>
    </div>
  );
}
