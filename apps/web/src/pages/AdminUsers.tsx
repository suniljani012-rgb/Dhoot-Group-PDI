import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Search, Plus, Shield, ShieldCheck, 
  Settings, Key, X, Loader2, Edit3, CheckCircle2, 
  Building2, Briefcase, Eye, EyeOff, UserPlus
} from 'lucide-react';

export interface EnterpriseUser {
  id: string;
  user_code: string;
  employee_id: string;
  user_name: string;
  password_hash: string;
  date_of_birth?: string;
  mail_id: string;
  mobile_number: string;
  branch_code: string;
  designation: string;
  brand: string;
  nature: string;
  status: string;
  role: string;
  created_at: string;
}

export const AdminUsersPage: React.FC = () => {
  const { currentBrand } = useAuth();

  const [usersList, setUsersList] = useState<EnterpriseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [natureFilter, setNatureFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Master options
  const [designations, setDesignations] = useState<{ id: string; title: string; nature: string }[]>([]);
  const [natures, setNatures] = useState<{ id: string; name: string; description: string }[]>([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EnterpriseUser | null>(null);

  // Password visibility map
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // New User Form State
  const [newUser, setNewUser] = useState({
    userName: '',
    password: 'Dhootgroup@123',
    dateOfBirth: '1995-01-01',
    mailId: '',
    mobileNumber: '+91 ',
    branchCode: 'HO-DHOOT',
    designation: 'PDI Engineer',
    brand: 'Autoprime Tata',
    nature: 'Yard',
    role: 'PDI_ENGINEER',
    status: 'ACTIVE'
  });

  // Master Entry Form State
  const [newDesignationTitle, setNewDesignationTitle] = useState('');
  const [newDesignationNature, setNewDesignationNature] = useState('Yard');
  const [newNatureName, setNewNatureName] = useState('');
  const [newNatureDesc, setNewNatureDesc] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchMasters();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8787/api/v1/users');
      if (res.ok) {
        const json = await res.json();
        setUsersList(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasters = async () => {
    try {
      const res = await fetch('http://localhost:8787/api/v1/users/masters');
      if (res.ok) {
        const json = await res.json();
        setDesignations(json.data?.designations || []);
        setNatures(json.data?.natures || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8787/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewUser({
          userName: '',
          password: 'Dhootgroup@123',
          dateOfBirth: '1995-01-01',
          mailId: '',
          mobileNumber: '+91 ',
          branchCode: 'HO-DHOOT',
          designation: 'PDI Engineer',
          brand: 'Autoprime Tata',
          nature: 'Yard',
          role: 'PDI_ENGINEER',
          status: 'ACTIVE'
        });
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const res = await fetch(`http://localhost:8787/api/v1/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedUser)
      });
      if (res.ok) {
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddDesignation = async () => {
    if (!newDesignationTitle.trim()) return;
    try {
      const res = await fetch('http://localhost:8787/api/v1/users/masters/designation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newDesignationTitle, nature: newDesignationNature })
      });
      if (res.ok) {
        setNewDesignationTitle('');
        fetchMasters();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddNature = async () => {
    if (!newNatureName.trim()) return;
    try {
      const res = await fetch('http://localhost:8787/api/v1/users/masters/nature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newNatureName, description: newNatureDesc })
      });
      if (res.ok) {
        setNewNatureName('');
        setNewNatureDesc('');
        fetchMasters();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = usersList.filter(u => {
    const matchesSearch = 
      u.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.user_code?.toLowerCase().includes(search.toLowerCase()) ||
      u.employee_id?.toLowerCase().includes(search.toLowerCase()) ||
      u.mail_id?.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile_number?.includes(search) ||
      u.designation?.toLowerCase().includes(search.toLowerCase());

    const matchesBrand = brandFilter === 'ALL' || u.brand === brandFilter || u.brand === 'ALL';
    const matchesNature = natureFilter === 'ALL' || u.nature === natureFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesBrand && matchesNature && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div 
            style={{ backgroundColor: `${currentBrand.primaryColor}15`, color: currentBrand.primaryColor }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold"
          >
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Dhoot Group • Enterprise User Management & Admin Desk
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              SaaS Multi-Brand Role Engine, Automatic DG00X Generator, Nature & Designation Configurator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowMasterModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            <span>Master Setup (Nature/Designation)</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{ backgroundColor: currentBrand.primaryColor }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User (Auto ID)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enterprise Staff</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{usersList.length} Accounts</div>
          <div className="text-[11px] text-slate-500 mt-1">Dhoot Group Multi-Brand Hub</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Employees</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {usersList.filter(u => u.status === 'ACTIVE').length} Active
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Authorized SSO Logins</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department Natures</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">{natures.length || 8} Natures</div>
          <div className="text-[11px] text-slate-500 mt-1">Yard, Sale, Service, Backoffice, MD...</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Super Administrator</div>
          <div className="text-sm font-bold text-blue-700 mt-2">
            Admin • System Administration
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Dual Brand Access (ALL)</div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search User ID, Name, Email, Mobile, Designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
          >
            <option value="ALL">All Brands</option>
            <option value="Autoprime Tata">Autoprime Tata</option>
            <option value="Raja Hyundai">Raja Hyundai</option>
          </select>

          <select
            value={natureFilter}
            onChange={(e) => setNatureFilter(e.target.value)}
            className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
          >
            <option value="ALL">All Natures</option>
            {natures.map(n => (
              <option key={n.id} value={n.name}>{n.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      {/* Users Data Table with exact Enterprise Headers */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User Id</th>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Password</th>
                <th className="py-3 px-4">Date of Birth</th>
                <th className="py-3 px-4">Mail Id</th>
                <th className="py-3 px-4">Mobile Number</th>
                <th className="py-3 px-4">Branch Code</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Nature</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-500" />
                    Loading Enterprise Users Registry...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-900 font-bold">
                        {u.user_code || u.employee_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {u.user_name}
                      {u.role === 'SUPER_ADMIN' && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600">
                          {visiblePasswords[u.id] ? u.password_hash : '••••••••••••'}
                        </span>
                        <button
                          onClick={() => togglePassword(u.id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {visiblePasswords[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.date_of_birth || '1990-01-01'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {u.mail_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {u.mobile_number || '-'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 font-bold">
                      {u.branch_code || 'HO-01'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {u.designation}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        u.brand === 'ALL' ? 'bg-purple-100 text-purple-800' :
                        u.brand === 'Autoprime Tata' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                        'bg-sky-50 text-sky-800 border border-sky-200'
                      }`}>
                        {u.brand}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {u.nature}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setShowEditModal(true);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CREATE NEW USER (AUTO DG00X) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5" style={{ color: currentBrand.primaryColor }} />
                <h3 className="font-bold text-slate-900">Create New Enterprise User • Auto ID (DG...)</h3>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">User Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Employee Name"
                    value={newUser.userName}
                    onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Password *</label>
                  <input
                    type="text"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={newUser.dateOfBirth}
                    onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Mail Id (Official Email) *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@dhootgroup.com"
                    value={newUser.mailId}
                    onChange={(e) => setNewUser({ ...newUser, mailId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98290 12345"
                    value={newUser.mobileNumber}
                    onChange={(e) => setNewUser({ ...newUser, mobileNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Branch Code *</label>
                  <select
                    value={newUser.branchCode}
                    onChange={(e) => setNewUser({ ...newUser, branchCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 font-bold"
                  >
                    <option value="HO-DHOOT">HO-DHOOT (Head Office)</option>
                    <option value="BR-PUN-01">BR-PUN-01 (Pune Tata)</option>
                    <option value="BR-MUM-01">BR-MUM-01 (Mumbai Tata)</option>
                    <option value="BR-JPR-01">BR-JPR-01 (Jaipur Hyundai)</option>
                    <option value="BR-JDH-01">BR-JDH-01 (Jodhpur Hyundai)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Brand *</label>
                  <select
                    value={newUser.brand}
                    onChange={(e) => setNewUser({ ...newUser, brand: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 font-bold"
                  >
                    <option value="Autoprime Tata">Autoprime Tata</option>
                    <option value="Raja Hyundai">Raja Hyundai</option>
                    <option value="ALL">ALL (Dual Brand Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Department Nature *</label>
                  <select
                    value={newUser.nature}
                    onChange={(e) => setNewUser({ ...newUser, nature: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 font-bold"
                  >
                    {natures.map(n => (
                      <option key={n.id} value={n.name}>{n.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Designation *</label>
                  <select
                    value={newUser.designation}
                    onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 font-bold"
                  >
                    {designations.map(d => (
                      <option key={d.id} value={d.title}>{d.title} ({d.nature})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">System Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 font-bold"
                  >
                    <option value="SYSTEM_ADMIN">System Administrator (Full Access)</option>
                    <option value="BRANCH_MANAGER">Branch Manager</option>
                    <option value="YARD_MANAGER">Yard Manager (Gate Inward & Unloading)</option>
                    <option value="PDI_ENGINEER">PDI Engineer (Inspection Checklist)</option>
                    <option value="QA_MANAGER">QA Manager (Review & Sign-Off)</option>
                    <option value="SALES_CONSULTANT">Sales Consultant (Bookings & Allocation)</option>
                    <option value="WORKSHOP_MANAGER">Workshop Manager (Repairs)</option>
                    <option value="ACCOUNTS_EXECUTIVE">Accounts Executive (Invoicing & Challans)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: currentBrand.primaryColor }}
                  className="px-5 py-2.5 rounded-xl font-bold text-white shadow hover:opacity-90"
                >
                  Generate User & Assign DG-ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Edit User: {selectedUser.user_code} ({selectedUser.user_name})</h3>
                <p className="text-xs text-slate-500">Update designation, password, brand & role permissions</p>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">User Full Name</label>
                  <input
                    type="text"
                    value={selectedUser.user_name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, user_name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Password</label>
                  <input
                    type="text"
                    value={selectedUser.password_hash}
                    onChange={(e) => setSelectedUser({ ...selectedUser, password_hash: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Mail Id</label>
                  <input
                    type="email"
                    value={selectedUser.mail_id}
                    onChange={(e) => setSelectedUser({ ...selectedUser, mail_id: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={selectedUser.mobile_number}
                    onChange={(e) => setSelectedUser({ ...selectedUser, mobile_number: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Brand Access</label>
                  <select
                    value={selectedUser.brand}
                    onChange={(e) => setSelectedUser({ ...selectedUser, brand: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Autoprime Tata">Autoprime Tata</option>
                    <option value="Raja Hyundai">Raja Hyundai</option>
                    <option value="ALL">ALL (Dual Brand Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Designation</label>
                  <select
                    value={selectedUser.designation}
                    onChange={(e) => setSelectedUser({ ...selectedUser, designation: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {designations.map(d => (
                      <option key={d.id} value={d.title}>{d.title} ({d.nature})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Account Status</label>
                  <select
                    value={selectedUser.status}
                    onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: currentBrand.primaryColor }}
                  className="px-5 py-2.5 rounded-xl font-bold text-white shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MASTER CONFIGURATIONS (DESIGNATIONS & NATURES) */}
      {showMasterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-slate-900">Admin Master Desk • Natures & Designations</h3>
              </div>
              <button 
                onClick={() => setShowMasterModal(false)}
                className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Section A: Add Designation */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>Add New Designation</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Designation Title (e.g. Lead Technician)"
                    value={newDesignationTitle}
                    onChange={(e) => setNewDesignationTitle(e.target.value)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                  <select
                    value={newDesignationNature}
                    onChange={(e) => setNewDesignationNature(e.target.value)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl font-bold"
                  >
                    {natures.map(n => (
                      <option key={n.id} value={n.name}>{n.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddDesignation}
                    className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                  >
                    Add Designation
                  </button>
                </div>
              </div>

              {/* Section B: Add Department Nature */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Add Department Nature Type</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nature Name (e.g. Audit / Security)"
                    value={newNatureName}
                    onChange={(e) => setNewNatureName(e.target.value)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Description (Optional)"
                    value={newNatureDesc}
                    onChange={(e) => setNewNatureDesc(e.target.value)}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddNature}
                    className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700"
                  >
                    Add Nature Type
                  </button>
                </div>
              </div>

              {/* Lists preview */}
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">Existing Master Natures</h4>
                <div className="flex flex-wrap gap-2">
                  {natures.map(n => (
                    <span key={n.id} className="px-2.5 py-1 bg-slate-100 rounded-xl font-bold text-slate-700 border border-slate-200">
                      {n.name}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                onClick={() => setShowMasterModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
