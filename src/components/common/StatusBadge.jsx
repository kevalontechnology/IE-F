import React from 'react';

export default function StatusBadge({ status }) {
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'Approved':
    case 'Completed':
    case 'Success':
    case 'Shipped':
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'Pending':
    case 'Draft':
    case 'Pending Logistics':
      badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'Converted':
      badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case 'Rejected':
    case 'Blocked':
    case 'Cancelled':
    case 'Failed':
      badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    default:
      break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold inline-block ${badgeStyle}`}>
      {status}
    </span>
  );
}
