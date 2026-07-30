import React from 'react';

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-200" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-4/5 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-10 w-full rounded-xl bg-slate-200" />
      <div className="h-14 w-full rounded-xl bg-slate-100" />
      <div className="h-14 w-full rounded-xl bg-slate-100" />
      <div className="h-14 w-full rounded-xl bg-slate-100" />
    </div>
  );
}

export default function SkeletonLoader({ type = 'card', count = 3 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        type === 'table' ? <SkeletonTable key={idx} /> : <SkeletonCard key={idx} />
      ))}
    </div>
  );
}
