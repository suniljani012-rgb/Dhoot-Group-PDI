import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../utils/apiConfig';
import { 
  Users, Search, Plus, Shield, ShieldCheck, 
  Settings, Key, X, Loader2, Edit3, CheckCircle2, 
  Building2, Briefcase, Eye, EyeOff, UserPlus,
  Sliders, Check, Trash2, ShieldAlert, FileText, CheckSquare,
  Lock, LayoutDashboard, Truck, Car, Wrench, Bookmark
} from 'lucide-react';

export interface EnterpriseUser {
  id: string;
  user_code: string;
  employee_id: string;
  user_name: string;
  password_hash: string;
  password?: string;
  date_of_birth?: string;
  mail_id: string;
  mobile_number: string;
  branch_code: string;
  designation: string;
  brand: string;
  nature: string;
  status: string;
  role: string;
  created_at?: string;
}

export interface RolePermissionConfig {
  role: string;
  displayName: string;
  department: string;
  description: string;
  windows: {
    dashboard: boolean;
    receiving: boolean;
    stockLedger: boolean;
    inspections: boolean;
    qaReview: boolean;
    repairs: boolean;
    bookings: boolean;
    invoicing: boolean;
    adminPanel: boolean;
  };
  actions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    approve: boolean;
    delete: boolean;
  };
}

const DEFAULT_ROLE_CONFIGS: RolePermissionConfig[] = [
  {
    role: 'SYSTEM_ADMIN',
    displayName: 'Super Administrator',
    department: 'Corporate HQ',
    description: 'Unrestricted full master access across all windows, approvals, and enterprise settings',
    windows: {
      dashboard: true, receiving: true, stockLedger: true, inspections: true,
      qaReview: true, repairs: true, bookings: true, invoicing: true, adminPanel: true
    },
    actions: { view: true, create: true, edit: true, approve: true, delete: true }
  },
  {
    role: 'BRANCH_MANAGER',
    displayName: 'Branch / General Manager',
    department: 'Management',
    description: 'High-level operational oversight, stock valuation, commercial approvals, and invoicing oversight',
    windows: {
      dashboard: true, receiving: true, stockLedger: true, inspections: true,
      qaReview: true, repairs: true, bookings: true, invoicing: true, adminPanel: false
    },
    actions: { view: true, create: true, edit: true, approve: true, delete: false }
  },
  {
    role: 'YARD_MANAGER',
    displayName: 'Yard & Logistics Supervisor',
    department: 'Stockyard',
    description: 'Chassis gate inward receiving, trailer dispatch, transit inspection, and yard bay tracking',
    windows: {
      dashboard: true, receiving: true, stockLedger: true, inspections: true,
      qaReview: false, repairs: false, bookings: false, invoicing: false, adminPanel: false
    },
    actions: { view: true, create: true, edit: true, approve: false, delete: false }
  },
  {
    role: 'PDI_ENGINEER',
    displayName: 'PDI Quality Inspector',
    department: 'Quality Inspection',
    description: 'Executes rigorous 6-stage vehicle pre-delivery checklists, uploads photo/video evidence, flags defects',
    windows: {
      dashboard: true, receiving: false, stockLedger: true, inspections: true,
      qaReview: false, repairs: true, bookings: false, invoicing: false, adminPanel: false
    },
    actions: { view: true, create: true, edit: true, approve: false, delete: false }
  },
  {
    role: 'QA_MANAGER',
    displayName: 'QA Manager & Certifier',
    department: 'Quality Assurance',
    description: 'Reviews completed PDI sessions, verifies defect rectifications, and signs digital PDI certificates',
    windows: {
      dashboard: true, receiving: false, stockLedger: true, inspections: true,
      qaReview: true, repairs: true, bookings: false, invoicing: false, adminPanel: false
    },
    actions: { view: true, create: false, edit: true, approve: true, delete: false }
  },
  {
    role: 'SALES_CONSULTANT',
    displayName: 'Sales Consultant / DSE',
    department: 'Sales',
    description: 'Registers retail customer bookings, requests chassis allocation, tracks customer delivery readiness',
    windows: {
      dashboard: true, receiving: false, stockLedger: true, inspections: false,
      qaReview: false, repairs: false, bookings: true, invoicing: false, adminPanel: false
    },
    actions: { view: true, create: true, edit: true, approve: false, delete: false }
  },
  {
    role: 'WORKSHOP_MANAGER',
    displayName: 'Bodyshop / Service Manager',
    department: 'Workshop',
    description: 'Manages defect rectification tickets, assigns technicians, logs parts, and marks repairs complete',
    windows: {
      dashboard: true, receiving: false, stockLedger: true, inspections: false,
      qaReview: false, repairs: true, bookings: false, invoicing: false, adminPanel: false
    },
    actions: { view: true, create: false, edit: true, approve: true, delete: false }
  },
  {
    role: 'ACCOUNTS_EXECUTIVE',
    displayName: 'Commercial Accounts & Billing',
    department: 'Accounts',
    description: 'Generates 35-field GST tax invoices, verifies financier & insurance settlements, issues gatepass',
    windows: {
      dashboard: true, receiving: false, stockLedger: true, inspections: false,
      qaReview: false, repairs: false, bookings: true, invoicing: true, adminPanel: false
    },
    actions: { view: true, create: true, edit: true, approve: true, delete: false }
  }
];

export const AdminUsersPage: React.FC = () => {
  const { currentBrand } = useAuth();

  const [subTab, setSubTab] = useState<'USERS' | 'ROLES' | 'DESIGNATIONS'>('USERS');

  const [usersList, setUsersList] = useState<EnterpriseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');
  const [natureFilter, setNatureFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Master options
  const [designations, setDesignations] = useState<{ id: string; title: string; nature: string }[]>(() => {
    const saved = localStorage.getItem('dhoot_master_designations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'des-1', title: 'General Manager', nature: 'Management' },
      { id: 'des-2', title: 'Yard Supervisor', nature: 'Stockyard' },
      { id: 'des-3', title: 'PDI Engineer', nature: 'Quality Inspection' },
      { id: 'des-4', title: 'QA Head', nature: 'Quality Assurance' },
      { id: 'des-5', title: 'Sales Consultant', nature: 'Sales' },
      { id: 'des-6', title: 'Bodyshop Lead', nature: 'Workshop' },
      { id: 'des-7', title: 'Billing Officer', nature: 'Accounts' }
    ];
  });

  const [natures, setNatures] = useState<{ id: string; name: string; description: string }[]>(() => {
    return [
      { id: 'nat-1', name: 'Management', description: 'Executive leadership' },
      { id: 'nat-2', name: 'Stockyard', description: 'Logistics and parking' },
      { id: 'nat-3', name: 'Quality Inspection', description: 'Technical inspection' },
      { id: 'nat-4', name: 'Quality Assurance', description: 'Final certification' },
      { id: 'nat-5', name: 'Sales', description: 'Retail booking desk' },
      { id: 'nat-6', name: 'Workshop', description: 'Defect rectification' },
      { id: 'nat-7', name: 'Accounts', description: 'Invoicing and gatepass' }
    ];
  });

  // Roles Matrix State
  const [roleConfigs, setRoleConfigs] = useState<RolePermissionConfig[]>(() => {
    const saved = localStorage.getItem('dhoot_role_permissions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_ROLE_CONFIGS;
  });

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDesModal, setShowDesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EnterpriseUser | null>(null);
  const [editingRole, setEditingRole] = useState<RolePermissionConfig | null>(null);
  const [editingDesignation, setEditingDesignation] = useState<any | null>(null);

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
    brand: 'Dhoot Group',
    nature: 'Stockyard',
    role: 'PDI_ENGINEER',
    status: 'ACTIVE'
  });

  // Master Entry Form State
  const [newDesignationTitle, setNewDesignationTitle] = useState('');
  const [newDesignationNature, setNewDesignationNature] = useState('Stockyard');

  const DEFAULT_USERS: EnterpriseUser[] = [
    { id: 'usr-1', user_code: 'DG001', employee_id: 'DG001', user_name: 'Sunil Jani', password_hash: 'Dhoot@2026', mail_id: 'admin@dhootgroup.com', mobile_number: '+91 98290 11223', branch_code: 'HO-DHOOT', designation: 'Managing Director & System Admin', brand: 'Dhoot Group', nature: 'Management', status: 'ACTIVE', role: 'SYSTEM_ADMIN', date_of_birth: '1990-05-15' },
    { id: 'usr-2', user_code: 'DG-TAT-01', employee_id: 'DG-TAT-01', user_name: 'Rajesh Sharma', password_hash: 'Tata@123', mail_id: 'rajesh.tata@dhootgroup.com', mobile_number: '+91 98220 33445', branch_code: 'BR-PUN-01', designation: 'General Manager (Tata)', brand: 'Tata Motors', nature: 'Management', status: 'ACTIVE', role: 'MANAGEMENT', date_of_birth: '1985-08-20' },
    { id: 'usr-3', user_code: 'DG-HYN-01', employee_id: 'DG-HYN-01', user_name: 'Manish Rathore', password_hash: 'Hyundai@123', mail_id: 'manish.hyn@dhootgroup.com', mobile_number: '+91 94140 55667', branch_code: 'BR-JAI-02', designation: 'General Manager (Hyundai)', brand: 'Hyundai', nature: 'Management', status: 'ACTIVE', role: 'MANAGEMENT', date_of_birth: '1988-11-12' },
    { id: 'usr-4', user_code: 'DG-ENG-01', employee_id: 'DG-ENG-01', user_name: 'Suresh Patil', password_hash: 'Pdi@2026', mail_id: 'suresh.pdi@dhootgroup.com', mobile_number: '+91 98291 77889', branch_code: 'BR-PUN-01', designation: 'Senior PDI Engineer', brand: 'Tata Motors', nature: 'Quality Inspection', status: 'ACTIVE', role: 'PDI_ENGINEER', date_of_birth: '1994-03-10' },
    { id: 'usr-5', user_code: 'DG-ENG-02', employee_id: 'DG-ENG-02', user_name: 'Karan Joshi', password_hash: 'Pdi@2026', mail_id: 'karan.pdi@dhootgroup.com', mobile_number: '+91 98292 99001', branch_code: 'BR-JAI-02', designation: 'PDI Inspector', brand: 'Hyundai', nature: 'Quality Inspection', status: 'ACTIVE', role: 'PDI_ENGINEER', date_of_birth: '1996-07-22' },
    { id: 'usr-6', user_code: 'DG-QA-01', employee_id: 'DG-QA-01', user_name: 'Dr. Arvind Agarwal', password_hash: 'Qa@2026', mail_id: 'arvind.qa@dhootgroup.com', mobile_number: '+91 98293 22334', branch_code: 'HO-DHOOT', designation: 'Quality Assurance Head', brand: 'Dhoot Group', nature: 'Quality Assurance', status: 'ACTIVE', role: 'QA_MANAGER', date_of_birth: '1982-01-30' },
    { id: 'usr-7', user_code: 'DG-WRK-01', employee_id: 'DG-WRK-01', user_name: 'Kishore Mali', password_hash: 'Work@123', mail_id: 'kishore.wrk@dhootgroup.com', mobile_number: '+91 98294 44556', branch_code: 'BR-PUN-01', designation: 'Bodyshop Lead', brand: 'Tata Motors', nature: 'Workshop', status: 'ACTIVE', role: 'WORKSHOP_LEAD', date_of_birth: '1991-09-18' },
    { id: 'usr-8', user_code: 'DG-ACC-01', employee_id: 'DG-ACC-01', user_name: 'Anita Desai', password_hash: 'Bills@123', mail_id: 'anita.acc@dhootgroup.com', mobile_number: '+91 98295 66778', branch_code: 'BR-JAI-02', designation: 'Billing Officer', brand: 'Hyundai', nature: 'Accounts', status: 'ACTIVE', role: 'BILLING_CLERK', date_of_birth: '1993-12-05' }
  ];

  useEffect(() => {
    if (currentBrand.code === 'DHOOT-TATA') {
      setBrandFilter('Tata Motors');
    } else if (currentBrand.code === 'DHOOT-HYUNDAI') {
      setBrandFilter('Hyundai');
    } else {
      setBrandFilter('ALL');
    }
  }, [currentBrand.code]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/v1/users'));
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setUsersList(json.data);
          setLoading(false);
          return;
        }
      }
      setUsersList(DEFAULT_USERS);
    } catch (e) {
      setUsersList(DEFAULT_USERS);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(getApiUrl('/api/v1/users'), {
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
          brand: 'Dhoot Group',
          nature: 'Stockyard',
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
      const res = await fetch(getApiUrl(`/api/v1/users/${selectedUser.id}`), {
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

  const handleAddDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesignationTitle.trim()) return;
    const newDes = {
      id: `des-${Date.now()}`,
      title: newDesignationTitle.trim(),
      nature: newDesignationNature
    };
    const updated = [...designations, newDes];
    setDesignations(updated);
    localStorage.setItem('dhoot_master_designations', JSON.stringify(updated));
    setNewDesignationTitle('');
  };

  const handleDeleteDesignation = (id: string) => {
    if (confirm('Delete this designation master?')) {
      const updated = designations.filter(d => d.id !== id);
      setDesignations(updated);
      localStorage.setItem('dhoot_master_designations', JSON.stringify(updated));
    }
  };

  const handleSaveEditedDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesignation) return;
    const updated = designations.map(d => d.id === editingDesignation.id ? editingDesignation : d);
    setDesignations(updated);
    localStorage.setItem('dhoot_master_designations', JSON.stringify(updated));
    setShowDesModal(false);
    setEditingDesignation(null);
  };

  const handleSaveRolePermissions = (roleToSave: RolePermissionConfig) => {
    const exists = roleConfigs.some(r => r.role === roleToSave.role);
    let updated: RolePermissionConfig[];
    if (exists) {
      updated = roleConfigs.map(r => r.role === roleToSave.role ? roleToSave : r);
    } else {
      updated = [...roleConfigs, roleToSave];
    }
    setRoleConfigs(updated);
    localStorage.setItem('dhoot_role_permissions', JSON.stringify(updated));
    setShowRoleModal(false);
    setEditingRole(null);
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
    <div className="space-y-4">
      
      {/* Sub-Tabs Toolbar */}
      <div className="bg-canvas border border-line rounded p-1.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSubTab('USERS')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'USERS' ? 'bg-accent text-white shadow-xs' : 'text-ink-2 hover:text-ink'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Users ({usersList.length})</span>
          </button>

          <button
            onClick={() => setSubTab('ROLES')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'ROLES' ? 'bg-accent text-white shadow-xs' : 'text-ink-2 hover:text-ink'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Roles & Permissions ({roleConfigs.length})</span>
          </button>

          <button
            onClick={() => setSubTab('DESIGNATIONS')}
            className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'DESIGNATIONS' ? 'bg-accent text-white shadow-xs' : 'text-ink-2 hover:text-ink'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span>Designations ({designations.length})</span>
          </button>
        </div>

        <div>
          {subTab === 'USERS' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 bg-accent hover:bg-accent-600 text-white rounded text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create User (Auto ID)</span>
            </button>
          )}

          {subTab === 'ROLES' && (
            <button
              onClick={() => {
                setEditingRole({
                  role: `ROLE_${Date.now()}`,
                  displayName: 'Custom Operational Role',
                  department: 'Operations',
                  description: 'Custom window permissions',
                  windows: {
                    dashboard: true, receiving: false, stockLedger: true,
                    inspections: false, qaReview: false, repairs: false,
                    bookings: false, invoicing: false, adminPanel: false
                  },
                  actions: { view: true, create: false, edit: false, approve: false, delete: false }
                });
                setShowRoleModal(true);
              }}
              className="px-3.5 py-1.5 bg-accent hover:bg-accent-600 text-white rounded text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Dealership Role</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: STAFF USER ACCOUNTS                                            */}
      {/* ========================================================================= */}
      {subTab === 'USERS' && (
        <div className="bg-white border border-line rounded p-5 shadow-xs space-y-3">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-line pb-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search User ID, Name, Email, Mobile, Designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-canvas border border-line rounded text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-1.5 text-xs bg-canvas border border-line rounded font-medium"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto border border-line rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">User ID</th>
                  <th className="py-2.5 px-3">Employee Name</th>
                  <th className="py-2.5 px-3">Role & RBAC Access</th>
                  <th className="py-2.5 px-3">Designation / Nature</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Branch</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-600" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                      0 matching user accounts found in database.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-canvas/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {u.user_code || u.employee_id}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{u.user_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.mail_id}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-accent text-white text-[10px] font-semibold">
                          {u.role?.replace('_', ' ') || 'PDI ENGINEER'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-800">{u.designation}</div>
                        <div className="text-[10px] text-slate-400">{u.nature}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {u.mobile_number}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {u.branch_code}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => { setSelectedUser(u); setShowEditModal(true); }}
                          className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: ROLES & WINDOW PERMISSION MATRIX                               */}
      {/* ========================================================================= */}
      {subTab === 'ROLES' && (
        <div className="bg-white border border-line rounded p-5 shadow-xs space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-xs font-bold text-slate-900">Role-Based Access Control (RBAC) & Window Visibility Matrix</h2>
            <p className="text-[11px] text-slate-400">
              Configure which operational windows and capabilities are accessible to each dealership staff role.
            </p>
          </div>

          <div className="overflow-x-auto border border-line rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Role & Title</th>
                  <th className="py-2.5 px-2 text-center">Dashboard</th>
                  <th className="py-2.5 px-2 text-center">Yard Inward</th>
                  <th className="py-2.5 px-2 text-center">Stock Ledger</th>
                  <th className="py-2.5 px-2 text-center">Inspections</th>
                  <th className="py-2.5 px-2 text-center">QA Certs</th>
                  <th className="py-2.5 px-2 text-center">Repairs</th>
                  <th className="py-2.5 px-2 text-center">Bookings</th>
                  <th className="py-2.5 px-2 text-center">Invoicing</th>
                  <th className="py-2.5 px-2 text-center">Admin HQ</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
                {roleConfigs.map((r) => (
                  <tr key={r.role} className="hover:bg-canvas/80">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{r.displayName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.role} • {r.department}</div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {r.windows.dashboard ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {r.windows.receiving ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {r.windows.stockLedger ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {r.windows.inspections ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {r.windows.qaReview ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {r.windows.repairs ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {r.windows.bookings ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {r.windows.invoicing ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {r.windows.adminPanel ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => { setEditingRole(r); setShowRoleModal(true); }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Windows</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: MASTER DESIGNATIONS & DEPARTMENTS                              */}
      {/* ========================================================================= */}
      {subTab === 'DESIGNATIONS' && (
        <div className="bg-white border border-line rounded p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">Dealership Designations & Department Natures</h2>
              <p className="text-[11px] text-slate-400">Master job titles assigned during user account creation.</p>
            </div>
          </div>

          {/* Add Designation Form */}
          <form onSubmit={handleAddDesignation} className="bg-canvas border border-line p-4 rounded flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              required
              placeholder="Designation Title (e.g. Lead Technical Inspector)"
              value={newDesignationTitle}
              onChange={(e) => setNewDesignationTitle(e.target.value)}
              className="flex-1 p-2 bg-white border border-line rounded text-xs font-medium"
            />
            <select
              value={newDesignationNature}
              onChange={(e) => setNewDesignationNature(e.target.value)}
              className="p-2 bg-white border border-line rounded text-xs font-bold"
            >
              {natures.map(n => (
                <option key={n.id} value={n.name}>{n.name}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-accent hover:bg-accent-600 text-white rounded text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Designation</span>
            </button>
          </form>

          {/* Designations Table */}
          <div className="overflow-x-auto border border-line rounded">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#EEF2F8] border-b border-[#C9D6E8] text-[#1A3A6B] font-semibold uppercase tracking-[0.06em] text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Designation Title</th>
                  <th className="py-2.5 px-3">Department Nature</th>
                  <th className="py-2.5 px-3">Assigned Staff Count</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium text-[11px]">
                {designations.map((d) => {
                  const staffCount = usersList.filter(u => u.designation === d.title).length;
                  return (
                    <tr key={d.id} className="hover:bg-canvas/80">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{d.title}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-line">
                          {d.nature}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{staffCount} Active Staff</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingDesignation(d);
                              setShowDesModal(true);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Designation"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDesignation(d.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Designation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT ROLE & WINDOW ACCESSIBILITY                                    */}
      {/* ========================================================================= */}
      {showRoleModal && editingRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs select-none z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-panel shadow-pop border border-line overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas text-ink">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold">Configure Role Windows & Permissions</h3>
              </div>
              <button onClick={() => { setShowRoleModal(false); setEditingRole(null); }} className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveRolePermissions(editingRole); }} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Role Identifier</label>
                  <input
                    type="text"
                    required
                    value={editingRole.role}
                    onChange={(e) => setEditingRole({ ...editingRole, role: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editingRole.displayName}
                    onChange={(e) => setEditingRole({ ...editingRole, displayName: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1.5">Window / Module Access Permissions</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-canvas p-3 rounded border border-line">
                  {[
                    { key: 'dashboard', label: 'Dashboard' },
                    { key: 'receiving', label: 'Yard Inward' },
                    { key: 'stockLedger', label: 'Stock Ledger' },
                    { key: 'inspections', label: 'Inspections' },
                    { key: 'qaReview', label: 'QA Reviews' },
                    { key: 'repairs', label: 'Workshop Repairs' },
                    { key: 'bookings', label: 'Customer Bookings' },
                    { key: 'invoicing', label: 'Tax Invoicing' },
                    { key: 'adminPanel', label: 'Admin Master HQ' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 p-2 bg-white rounded border border-line cursor-pointer hover:border-slate-400">
                      <input
                        type="checkbox"
                        checked={(editingRole.windows as any)[key]}
                        onChange={(e) => setEditingRole({
                          ...editingRole,
                          windows: { ...editingRole.windows, [key]: e.target.checked }
                        })}
                        className="rounded text-slate-900 focus:ring-0"
                      />
                      <span className="font-bold text-slate-800 text-[11px]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-line flex justify-end gap-2">
                <button type="button" onClick={() => { setShowRoleModal(false); setEditingRole(null); }} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-accent hover:bg-accent-600 text-white font-semibold rounded shadow-xs">
                  Save Role Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE USER DIALOG                                                 */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs select-none z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-panel shadow-pop border border-line overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas text-ink">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold">Register Dealership Staff Account</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-3 text-xs overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Staff Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newUser.userName}
                    onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul.sharma@dhootgroup.com"
                    value={newUser.mailId}
                    onChange={(e) => setNewUser({ ...newUser, mailId: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Mobile Contact No *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98000 00000"
                    value={newUser.mobileNumber}
                    onChange={(e) => setNewUser({ ...newUser, mobileNumber: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newUser.dateOfBirth}
                    onChange={(e) => setNewUser({ ...newUser, dateOfBirth: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Brand Franchise Access *</label>
                  <select
                    value={newUser.brand}
                    onChange={(e) => setNewUser({ ...newUser, brand: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded font-bold"
                  >
                    <option value="Dhoot Group">Dhoot Group (All Franchises)</option>
                    <option value="Autoprime Tata">Tata Motors</option>
                    <option value="Raja Hyundai">Hyundai</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Department Nature *</label>
                  <select
                    value={newUser.nature}
                    onChange={(e) => setNewUser({ ...newUser, nature: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded font-bold"
                  >
                    <option value="Corporate HQ">Corporate HQ & Management</option>
                    <option value="Stockyard">Stockyard & Inward Logistics</option>
                    <option value="Showroom">Showroom & Retail Sales</option>
                    <option value="Workshop">Workshop & Bodyshop Repairs</option>
                    <option value="Quality">Quality Assurance & Certification</option>
                    <option value="Accounts">Accounts, Billing & Invoicing</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Assigned Designation *</label>
                  <select
                    value={newUser.designation}
                    onChange={(e) => setNewUser({ ...newUser, designation: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded font-bold"
                  >
                    {designations.map(d => (
                      <option key={d.id} value={d.title}>{d.title} ({d.nature})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">RBAC Security Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded font-bold"
                  >
                    {roleConfigs.map(r => (
                      <option key={r.role} value={r.role}>{r.displayName} ({r.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Branch Code / Yard Location</label>
                  <input
                    type="text"
                    placeholder="e.g. BR-PUN-01"
                    value={newUser.branchCode}
                    onChange={(e) => setNewUser({ ...newUser, branchCode: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Initial Password</label>
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full p-2 bg-canvas border border-line rounded font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-line flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-accent hover:bg-accent-600 text-white font-semibold rounded shadow-xs">
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER DIALOG                                                   */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL: EDIT USER DIALOG (100% COMPLETE DATABASE SCHEMA COLUMNS)            */}
      {/* ========================================================================= */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs select-none z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-panel shadow-pop border border-line overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas text-ink">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold">Edit Staff Account • {selectedUser.user_code}</h3>
              </div>
              <button onClick={() => { setShowEditModal(false); setSelectedUser(null); }} className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={selectedUser.user_name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, user_name: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">User Code / Login ID *</label>
                  <input
                    type="text"
                    required
                    value={selectedUser.user_code}
                    onChange={(e) => setSelectedUser({ ...selectedUser, user_code: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Official Email Desk *</label>
                  <input
                    type="email"
                    required
                    value={selectedUser.mail_id}
                    onChange={(e) => setSelectedUser({ ...selectedUser, mail_id: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Mobile Contact No *</label>
                  <input
                    type="text"
                    required
                    value={selectedUser.mobile_number}
                    onChange={(e) => setSelectedUser({ ...selectedUser, mobile_number: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={selectedUser.date_of_birth || '1995-01-01'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, date_of_birth: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Brand Franchise Access *</label>
                  <select
                    value={selectedUser.brand || 'Dhoot Group'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, brand: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-bold"
                  >
                    <option value="Dhoot Group">Dhoot Group (All Franchises)</option>
                    <option value="Tata Motors">Tata Motors</option>
                    <option value="Hyundai">Hyundai</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Department Nature *</label>
                  <select
                    value={selectedUser.nature || 'Stockyard'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, nature: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-bold"
                  >
                    <option value="Management">Executive Leadership</option>
                    <option value="Stockyard">Stockyard & Inward Logistics</option>
                    <option value="Quality Inspection">Quality Inspection</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Sales">Sales & Retail Bookings</option>
                    <option value="Workshop">Workshop & Repairs</option>
                    <option value="Accounts">Accounts & Invoicing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Assigned Designation *</label>
                  <select
                    value={selectedUser.designation}
                    onChange={(e) => setSelectedUser({ ...selectedUser, designation: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-bold"
                  >
                    {designations.map(d => (
                      <option key={d.id} value={d.title}>{d.title} ({d.nature})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">RBAC Security Role *</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-bold"
                  >
                    {roleConfigs.map(r => (
                      <option key={r.role} value={r.role}>{r.displayName} ({r.role})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Branch Code / Yard Location</label>
                  <input
                    type="text"
                    value={selectedUser.branch_code || 'HO-DHOOT'}
                    onChange={(e) => setSelectedUser({ ...selectedUser, branch_code: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Account Operational Status *</label>
                  <select
                    value={selectedUser.status}
                    onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-bold"
                  >
                    <option value="ACTIVE">ACTIVE (Full Login Access)</option>
                    <option value="INACTIVE">INACTIVE (Access Suspended)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Reset Password (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter new password if resetting"
                    value={selectedUser.password || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                    className="w-full p-2.5 bg-canvas border border-line rounded font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-line flex justify-end gap-2">
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedUser(null); }} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-accent hover:bg-accent-600 text-white font-semibold rounded shadow-xs">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL: EDIT DESIGNATION MASTER                                             */}
      {/* ========================================================================= */}
      {showDesModal && editingDesignation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs select-none z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-panel shadow-pop border border-line overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-canvas text-ink">
              <h3 className="font-bold text-sm">Edit Master Designation</h3>
              <button onClick={() => { setShowDesModal(false); setEditingDesignation(null); }} className="w-8 h-8 rounded hover:bg-canvas text-ink-3 hover:text-ink flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedDesignation} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Designation Title *</label>
                <input
                  type="text"
                  required
                  value={editingDesignation.title}
                  onChange={(e) => setEditingDesignation({ ...editingDesignation, title: e.target.value })}
                  className="w-full p-2.5 bg-canvas border border-line rounded font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Department Nature *</label>
                <select
                  value={editingDesignation.nature}
                  onChange={(e) => setEditingDesignation({ ...editingDesignation, nature: e.target.value })}
                  className="w-full p-2.5 bg-canvas border border-line rounded font-bold"
                >
                  {natures.map(n => (
                    <option key={n.id} value={n.name}>{n.name} ({n.description})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-line flex justify-end gap-2">
                <button type="button" onClick={() => { setShowDesModal(false); setEditingDesignation(null); }} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-accent hover:bg-accent-600 text-white font-semibold rounded shadow-xs">
                  Save Designation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
