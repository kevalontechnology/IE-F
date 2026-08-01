import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/authApi';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { UserCheck, Shield, Lock, CheckCircle, XCircle } from 'lucide-react';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authApi.getUsers({ page, limit: 10, search });
      if (res.success) {
        setUsers(res.data);
        setTotal(res.meta?.total || res.data.length);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      const res = await authApi.updateUserStatus(userId, { status: newStatus });
      if (res.success) {
        showToast(`User status updated to ${newStatus}`, 'success');
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    }
  };

  const columns = [
    { header: 'Full Name', accessor: 'fullName', cell: (row) => <span className="font-bold text-slate-900">{row.fullName}</span> },
    { header: 'Company Name', accessor: 'companyName' },
    { header: 'Email', accessor: 'email' },
    { header: 'Mobile', accessor: 'mobile' },
    { header: 'Role', accessor: 'role', cell: (row) => <span className="font-semibold text-brand-700">{row.role}</span> },
    { header: 'Status', accessor: 'status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Admin Controls',
      cell: (row) => {
        if (row.role === 'Admin') return <span className="text-[11px] text-slate-400 font-italic">System Admin</span>;

        return (
          <div className="flex items-center gap-2">
            {row.status === 'Pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(row._id, 'Approved')}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate(row._id, 'Rejected')}
                  className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-semibold"
                >
                  Reject
                </button>
              </>
            )}

            {row.status === 'Approved' && (
              <button
                onClick={() => handleStatusUpdate(row._id, 'Blocked')}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
              >
                Block
              </button>
            )}

            {row.status === 'Blocked' && (
              <button
                onClick={() => handleStatusUpdate(row._id, 'Approved')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
              >
                Unblock
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <DataTable
        title="User Access & Approval Management"
        columns={columns}
        data={users}
        total={total}
        page={page}
        onPageChange={setPage}
        onSearch={setSearch}
        loading={loading}
        exportFilename="users_access_export"
      />
    </div>
  );
}
