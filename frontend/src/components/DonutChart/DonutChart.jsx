import React, { useState } from 'react';
import './DonutChart.css';

export default function DonutChart() {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Data: Segment Name, Percentage, Color
  const data = [
    { label: 'Completed', value: 65, color: 'var(--primary-accent)' },
    { label: 'In Progress', value: 20, color: 'var(--secondary-accent)' },
    { label: 'Not Started', value: 15, color: 'var(--text-muted)' }
  ];

  // SVG parameters
  const size = 180;
  const radius = 65;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative percentages for offset positioning
  let cumulativeValue = 0;

  return (
    <div className="donut-card">
      <h4 className="donut-title">Lesson Progress Overview</h4>
      
      <div className="donut-layout">
        <div className="donut-svg-container">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#F2EDDF"
              strokeWidth={strokeWidth}
            />
            {data.map((item, idx) => {
              const strokeLength = (item.value / 100) * circumference;
              const strokeOffset = circumference - strokeLength;
              const angleOffset = (cumulativeValue / 100) * 360;
              cumulativeValue += item.value;

              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={strokeOffset}
                  className="donut-segment"
                  style={{
                    transform: `rotate(${angleOffset - 90}deg)`,
                    transformOrigin: 'center',
                    cursor: 'pointer',
                    transition: 'stroke-width 0.2s ease, stroke 0.2s ease'
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
            
            {/* Center Text */}
            <g className="donut-center-text">
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                fontSize="24"
                fontWeight="700"
                fill="var(--text-primary)"
              >
                {hoveredIdx !== null ? `${data[hoveredIdx].value}%` : '82%'}
              </text>
              <text
                x="50%"
                y="65%"
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="var(--text-muted)"
                textTransform="uppercase"
                letterSpacing="0.05em"
              >
                {hoveredIdx !== null ? data[hoveredIdx].label : 'Avg Done'}
              </text>
            </g>
          </svg>
        </div>

        <div className="donut-legend">
          {data.map((item, idx) => (
            <div 
              key={idx} 
              className={`legend-item ${hoveredIdx === idx ? 'highlighted' : ''}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span className="legend-indicator" style={{ backgroundColor: item.color }}></span>
              <div className="legend-info">
                <span className="legend-label">{item.label}</span>
                <span className="legend-val">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
