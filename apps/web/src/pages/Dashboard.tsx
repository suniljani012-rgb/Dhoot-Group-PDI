import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, CheckCircle2, AlertTriangle, Clock, Truck, Bookmark, 
  UserCheck, Wrench, ShieldCheck, ArrowRight, Plus, 
  TrendingUp, Calendar, Filter, Sparkles, Building, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { currentBrand, user } = useAuth();

  // Dynamic Multi-Tier Enterprise KPIs for Dhoot Group
  const kpiData = {
    totalStock: 184,
    receivingPending: 14,
    inYard: 146,
    pdiPending: 28,
    pdiDone: 112,
    totalBookings: 96,
    allocatedVehicles: 74,
    inRepair: 6,
    deliveredThisMonth: 24,
  };

  // Primary Metrics Cards (8 Core Pillars)
  const primaryKpis = [
    {
      title: 'Total Stock Fleet',
      value: kpiData.totalStock,
      subtitle: 'Total dealership inventory',
      link: '/vehicles',
      icon: Car,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200/80',
    },
    {
      title: 'Vehicle Receiving Pending',
      value: kpiData.receivingPending,
      subtitle: 'In-transit from OEM plant',
      link: '/receiving',
      icon: Truck,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200/80',
      badge: 'Gate Inward Action',
    },
    {
      title: 'Vehicles in Stockyard',
      value: kpiData.inYard,
      subtitle: 'Physical yard inventory',
      link: '/vehicles',
      icon: Building,
      color: 'text-slate-800',
      bg: 'bg-slate-100',
      border: 'border-slate-200',
    },
    {
      title: 'PDI Pending in Yard',
      value: kpiData.pdiPending,
      subtitle: 'Awaiting stockyard inspection',
      link: '/pdi',
      icon: Clock,
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-200/80',
      badge: 'Action Required',
    },
    {
      title: 'PDI Done & Approved',
      value: kpiData.pdiDone,
      subtitle: 'Quality passed & certified',
      link: '/pdi',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/80',
    },
    {
      title: 'Customer Bookings',
      value: kpiData.totalBookings,
      subtitle: 'Registered customer orders',
      link: '/bookings',
      icon: Bookmark,
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200/80',
    },
    {
      title: 'Allocated Vehicles',
      value: kpiData.allocatedVehicles,
      subtitle: 'Assigned to customer voucher',
      link: '/bookings',
      icon: UserCheck,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200/80',
    },
    {
      title: 'Workshop / Repairs',
      value: kpiData.inRepair,
      subtitle: 'Minor rectification in progress',
      link: '/repairs',
      icon: Wrench,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200/80',
    }
  ];

  // Live Activity Queue
  const recentActivities = [
    {
      id: 'act-1',
      type: 'YARD_INWARD',
      title: 'Trailer Inward Received #TR-4421',
      desc: 'Tata Safari Accomplished Plus (Oberon Black) received with paper PDI sheet photo & unloading video.',
      time: '15 mins ago',
      user: 'Ramesh Gate Officer',
      badge: 'Gate Inward',
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'act-2',
      type: 'PDI_APPROVED',
      title: 'PDI Certified • Tata Harrier Dark',
      desc: '54 checkpoints passed with dual photo proofs. QA certificate #CERT-9981 generated.',
      time: '42 mins ago',
      user: 'Vikram Malhotra (Inspector)',
      badge: 'PDI Approved',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'act-3',
      type: 'BOOKING_ALLOCATED',
      title: 'Vehicle Allocated to Customer',
      desc: 'Hyundai Creta SX(O) allocated to Sunil Jani against Booking #BK-2026-081.',
      time: '1 hour ago',
      user: 'Sales Desk',
      badge: 'Allocation',
      badgeColor: 'bg-purple-100 text-purple-800'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 select-none">
      
      {/* Top Banner & Quick Action Buttons */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
              {currentBrand.name} Management
            </span>
            <span className="text-xs font-semibold text-slate-400">Dhoot Group Automobile HQ</span>
          </div>
          <h1 className="text-xl font-black text-[#0F172A] mt-1">Stockyard & Dealership Overview</h1>
          <p className="text-xs text-slate-500 font-medium">
            Live fleet status from Plant In-Transit ➔ Yard Receiving ➔ PDI Inspection ➔ Customer Allocation.
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/receiving"
            className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-900 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Truck className="w-4 h-4 text-amber-700" />
            <span>Receive Vehicle</span>
          </Link>

          <Link
            to="/pdi"
            className="px-4 py-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Start PDI</span>
          </Link>

          <Link
            to="/bookings"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Bookmark className="w-4 h-4 text-slate-600" />
            <span>New Booking</span>
          </Link>
        </div>
      </div>

      {/* 8 Primary Real-Time Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {primaryKpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={idx}
              to={kpi.link}
              className={`bg-white border hover:border-slate-400 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group ${kpi.border}`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-2xl ${kpi.bg}`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                {kpi.badge && (
                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    {kpi.badge}
                  </span>
                )}
              </div>

              <div>
                <div className="text-2xl font-black text-[#0F172A] font-mono group-hover:text-blue-700 transition-colors">
                  {kpi.value}
                </div>
                <div className="text-xs font-bold text-[#0F172A] mt-0.5">{kpi.title}</div>
                <div className="text-[10px] text-slate-400 font-medium">{kpi.subtitle}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Workflow Progression Stepper (From Plant to Customer) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">Automobile Stock Lifecycle Progression</h2>
            <p className="text-xs text-slate-500">Standard operating procedure for Dhoot Group stockyard management</p>
          </div>
          <span className="text-[11px] font-bold text-slate-400">6 Connected Stages</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Stage 1 */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Stage 1</span>
            <h3 className="text-xs font-bold text-[#0F172A]">Plant In-Transit</h3>
            <p className="text-[10px] text-slate-500">Stock assigned, trailer dispatched from OEM.</p>
          </div>

          {/* Stage 2 */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-amber-800 uppercase">Stage 2</span>
            <h3 className="text-xs font-bold text-amber-950">Yard Gate Inward</h3>
            <p className="text-[10px] text-amber-800">Verify paper PDI photo & unloading video.</p>
          </div>

          {/* Stage 3 */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-blue-800 uppercase">Stage 3</span>
            <h3 className="text-xs font-bold text-blue-950">PDI Inspection</h3>
            <p className="text-[10px] text-blue-800">54 checkpoints inspection with 2-angle photos.</p>
          </div>

          {/* Stage 4 */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-emerald-800 uppercase">Stage 4</span>
            <h3 className="text-xs font-bold text-emerald-950">QA Certified</h3>
            <p className="text-[10px] text-emerald-800">Manager sign-off & digital certificate.</p>
          </div>

          {/* Stage 5 */}
          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-purple-800 uppercase">Stage 5</span>
            <h3 className="text-xs font-bold text-purple-950">Customer Allocated</h3>
            <p className="text-[10px] text-purple-800">Linked to customer booking voucher.</p>
          </div>

          {/* Stage 6 */}
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Stage 6</span>
            <h3 className="text-xs font-bold text-white">Delivery Handover</h3>
            <p className="text-[10px] text-slate-300">Gatepass issued & delivered to customer.</p>
          </div>

        </div>
      </div>

      {/* Two Column Grid: Live Feed & Stockyard Bay Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Recent Activity Feed (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">Live Dealership Activity Feed</h2>
              <p className="text-xs text-slate-500">Real-time stock inward and PDI certifications</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync
            </span>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div 
                key={act.id}
                className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${act.badgeColor}`}>
                    {act.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{act.time}</span>
                </div>
                <h3 className="text-xs font-bold text-[#0F172A]">{act.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{act.desc}</p>
                <div className="text-[10px] text-slate-400 font-medium">Logged by: {act.user}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Stockyard Bays Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-[#0F172A]">Stockyard Bay Allocations</h2>
              <p className="text-xs text-slate-500">Physical yard capacity & inspection lanes</p>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A]">Bay 1: Inspection Staging</h3>
                  <p className="text-[10px] text-slate-400">Incoming trailer unloading lane</p>
                </div>
                <span className="text-xs font-bold text-[#0F172A] font-mono">14 Vehicles</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A]">Bay 2: Active PDI Workstation</h3>
                  <p className="text-[10px] text-slate-400">Engineers inspecting with checklists</p>
                </div>
                <span className="text-xs font-bold text-blue-700 font-mono">28 Vehicles</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A]">Bay 3: Delivery Ready Fleet</h3>
                  <p className="text-[10px] text-slate-400">PDI certified & customer allocated</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 font-mono">74 Vehicles</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0F172A]">Bay 4: Workshop Rectification</h3>
                  <p className="text-[10px] text-slate-400">Buffing & minor part replacements</p>
                </div>
                <span className="text-xs font-bold text-rose-700 font-mono">6 Vehicles</span>
              </div>
            </div>
          </div>

          <Link
            to="/vehicles"
            className="w-full py-3 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>View Complete Yard Stock</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
};
