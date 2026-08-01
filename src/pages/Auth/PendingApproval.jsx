import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function PendingApproval() {
  const location = useLocation();
  const email = location.state?.email || '';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm animate-pulse">
          <Clock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">Registration Submitted</h1>
          <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-bold">
            Status: Pending Admin Approval
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed pt-2">
            "Your account is waiting for Admin Approval."
          </p>
          {email && (
            <p className="text-[11px] text-slate-400 font-mono">
              Account Registered: {email}
            </p>
          )}
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Security Protocol
          </div>
          <p>
            An administrator has been notified of your registration request. Once approved, you will be granted access to your role-specific dashboard.
          </p>
        </div>

        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
