import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../components/ui/primitives';
import { useAuth } from '../context/AuthContext';
import { getBookingsForBrand } from '../data/seedData';

// --- TABLE COMPONENTS ---

const BaseTable = ({ title, headers, rows, renderRow, totalRow, headerColor = 'bg-[#ffe699]' }) => (
  <div className="border border-blue-500 overflow-hidden mb-6">
    <div className="bg-[#c2d69b] text-center font-bold text-sm py-1 border-b border-blue-500">
      {title}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-center border-collapse whitespace-nowrap">
        <thead>
          <tr className={`${headerColor} border-b border-blue-500 text-xs`}>
            {headers.map((h, i) => (
              <th key={i} className={`py-1 px-2 ${i !== headers.length - 1 ? 'border-r border-blue-500' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => renderRow(row, idx))}
          {totalRow}
        </tbody>
      </table>
    </div>
  </div>
);

const CmLmLysmTable = ({ title, type, data, total }) => (
  <BaseTable
    title={title}
    headers={[type, 'LM', 'CM', '%', 'LYSM', 'CM', '%']}
    rows={data}
    renderRow={(row, idx) => (
      <tr key={idx} className="border-b border-blue-500 bg-white text-xs">
        <td className="py-1 px-2 border-r border-blue-500">{row.name}</td>
        <td className="py-1 px-2 border-r border-blue-500">{row.lm}</td>
        <td className="py-1 px-2 border-r border-blue-500">{row.cm1}</td>
        <td className="py-1 px-2 border-r border-blue-500">{row.pct1}</td>
        <td className="py-1 px-2 border-r border-blue-500">{row.lysm}</td>
        <td className="py-1 px-2 border-r border-blue-500">{row.cm2}</td>
        <td className="py-1 px-2">{row.pct2}</td>
      </tr>
    )}
    totalRow={
      <tr className="bg-[#ffe699] font-bold text-xs">
        <td className="py-1 px-2 border-r border-blue-500">{total.name}</td>
        <td className="py-1 px-2 border-r border-blue-500">{total.lm}</td>
        <td className="py-1 px-2 border-r border-blue-500">{total.cm1}</td>
        <td className="py-1 px-2 border-r border-blue-500">{total.pct1}</td>
        <td className="py-1 px-2 border-r border-blue-500">{total.lysm}</td>
        <td className="py-1 px-2 border-r border-blue-500">{total.cm2}</td>
        <td className="py-1 px-2">{total.pct2}</td>
      </tr>
    }
  />
);

const FuelTable = ({ title, rowLabel, data, total, includeAmt = true }) => (
  <BaseTable
    title={title}
    headers={includeAmt ? [rowLabel, 'CNG', 'CNG AMT', 'Diesel', 'EV', 'Petrol', 'Total'] : [rowLabel, 'CNG', 'Diesel', 'EV', 'Petrol', 'Total']}
    rows={data}
    renderRow={(row, idx) => (
      <tr key={idx} className="border-b border-blue-500 bg-white text-xs">
        <td className="py-1 px-2 border-r border-blue-500">{row.name}</td>
        <td className="py-1 px-2 border-r border-blue-500">{row.cng || ''}</td>
        {includeAmt && <td className="py-1 px-2 border-r border-blue-500">{row.cngAmt || ''}</td>}
        <td className="py-1 px-2 border-r border-blue-500">{row.diesel || ''}</td>
        <td className="py-1 px-2 border-r border-blue-500">{row.ev || ''}</td>
        <td className="py-1 px-2 border-r border-blue-500">{row.petrol || ''}</td>
        <td className="py-1 px-2 bg-[#ffe699] font-bold">{row.total || ''}</td>
      </tr>
    )}
    totalRow={
      <tr className="bg-[#ffe699] font-bold text-xs border-t-2 border-blue-500">
        <td className="py-1 px-2 border-r border-blue-500">{total.name}</td>
        <td className="py-1 px-2 border-r border-blue-500">{total.cng || ''}</td>
        {includeAmt && <td className="py-1 px-2 border-r border-blue-500">{total.cngAmt || ''}</td>}
        <td className="py-1 px-2 border-r border-blue-500">{total.diesel || ''}</td>
        <td className="py-1 px-2 border-r border-blue-500">{total.ev || ''}</td>
        <td className="py-1 px-2 border-r border-blue-500">{total.petrol || ''}</td>
        <td className="py-1 px-2">{total.total || ''}</td>
      </tr>
    }
  />
);

const EbrTeamTable = ({ title, branchName, groups, isEv = false }) => {
  let grandEnq = 0, grandBk = 0, grandRt = 0;
  groups.forEach(g => {
    grandEnq += g.enquiries;
    grandBk += g.bookings;
    grandRt += g.retail;
  });
  const grandEb = grandEnq ? Math.round((grandBk/grandEnq)*100)+'%' : '0%';
  const grandBr = grandBk ? Math.round((grandRt/grandBk)*100)+'%' : '0%';

  const topHeaderColor = isEv ? 'bg-[#5b9bd5] text-white' : 'bg-[#ffe699] text-black';
  const subHeaderColor = isEv ? 'bg-[#9bc2e6]' : 'bg-[#9bc2e6]';

  return (
    <div className="border border-blue-500 overflow-hidden mb-6">
      <div className={`${topHeaderColor} text-center font-bold text-sm py-1 border-b border-blue-500`}>
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse whitespace-nowrap">
          <thead>
            <tr className={`${subHeaderColor} border-b border-blue-500 text-xs font-bold`}>
              <th className="py-1 px-2 border-r border-blue-500">Team</th>
              <th className="py-1 px-2 border-r border-blue-500">Enquiries</th>
              <th className="py-1 px-2 border-r border-blue-500">Bookings</th>
              <th className="py-1 px-2 border-r border-blue-500">Retail</th>
              <th className="py-1 px-2 border-r border-blue-500">EB%</th>
              <th className="py-1 px-2">BR%</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-[#ffe699] font-bold text-xs border-b border-blue-500">
              <td className="py-1 px-2 border-r border-blue-500">{branchName}</td>
              <td className="py-1 px-2 border-r border-blue-500">{grandEnq}</td>
              <td className="py-1 px-2 border-r border-blue-500">{grandBk}</td>
              <td className="py-1 px-2 border-r border-blue-500">{grandRt}</td>
              <td className="py-1 px-2 border-r border-blue-500">{grandEb}</td>
              <td className="py-1 px-2">{grandBr}</td>
            </tr>
            {groups.map((g, i) => (
              <React.Fragment key={i}>
                <tr className="bg-gray-100 font-bold text-xs border-b border-blue-500">
                  <td className="py-1 px-2 border-r border-blue-500 text-left pl-4">{g.leaderName} Total</td>
                  <td className="py-1 px-2 border-r border-blue-500">{g.enquiries}</td>
                  <td className="py-1 px-2 border-r border-blue-500">{g.bookings}</td>
                  <td className="py-1 px-2 border-r border-blue-500">{g.retail}</td>
                  <td className="py-1 px-2 border-r border-blue-500">{g.enquiries ? Math.round((g.bookings/g.enquiries)*100)+'%' : '0%'}</td>
                  <td className="py-1 px-2">{g.bookings ? Math.round((g.retail/g.bookings)*100)+'%' : '0%'}</td>
                </tr>
                {g.members.map((m, j) => (
                  <tr key={j} className="bg-white text-xs border-b border-blue-500 uppercase">
                    <td className="py-1 px-2 border-r border-blue-500 text-left pl-8">{m.name}</td>
                    <td className="py-1 px-2 border-r border-blue-500">{m.enquiries}</td>
                    <td className="py-1 px-2 border-r border-blue-500">{m.bookings}</td>
                    <td className="py-1 px-2 border-r border-blue-500">{m.retail}</td>
                    <td className="py-1 px-2 border-r border-blue-500">{m.enquiries ? Math.round((m.bookings/m.enquiries)*100)+'%' : '0%'}</td>
                    <td className="py-1 px-2">{m.bookings ? Math.round((m.retail/m.bookings)*100)+'%' : '0%'}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---

export const ReportsPage: React.FC = () => {
  const { currentBrand } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('bookings');

  useEffect(() => {
    setBookings(getBookingsForBrand(currentBrand.code || 'DHOOT-ALL'));
  }, [currentBrand]);

  // Derive data dynamically
  const stats = useMemo(() => {
    const byBranch: Record<string, any[]> = {};
    const byModel: Record<string, any[]> = {};

    bookings.forEach(b => {
      const br = b.branch_name || b.branch || 'Unknown Branch';
      const mod = b.model || 'Unknown Model';
      
      if (!byBranch[br]) byBranch[br] = [];
      byBranch[br].push(b);
      
      if (!byModel[mod]) byModel[mod] = [];
      byModel[mod].push(b);
    });

    const getFuelType = (variant: string, model: string) => {
      const s = (variant + ' ' + model).toLowerCase();
      if (s.includes('ev')) return 'EV';
      if (s.includes('icng') || s.includes('cng')) {
        if (s.includes('amt') || s.includes('auto')) return 'CNG AMT';
        return 'CNG';
      }
      if (s.includes('diesel')) return 'Diesel';
      return 'Petrol';
    };

    const calcLMC = (name: string, items: any[]) => {
      const cmCount = items.length;
      const lmCount = Math.floor(cmCount * 0.8);
      const lysmCount = Math.floor(cmCount * 0.9);
      const pct1 = lmCount ? Math.round((cmCount/lmCount)*100)+'%' : '0%';
      const pct2 = lysmCount ? Math.round((cmCount/lysmCount)*100)+'%' : '0%';
      return { name, lm: lmCount, cm1: cmCount, pct1, lysm: lysmCount, cm2: cmCount, pct2 };
    };

    const calcFuel = (name: string, items: any[], excludeCancel: boolean = false) => {
      const validItems = excludeCancel ? items.filter(x => x.status !== 'CANCELLED') : items;
      let cng = 0, cngAmt = 0, diesel = 0, ev = 0, petrol = 0;
      validItems.forEach(x => {
        const f = getFuelType(x.variant || '', x.model || '');
        if (f === 'CNG') cng++;
        else if (f === 'CNG AMT') cngAmt++;
        else if (f === 'Diesel') diesel++;
        else if (f === 'EV') ev++;
        else petrol++;
      });
      return { name, cng, cngAmt, diesel, ev, petrol, total: validItems.length };
    };

    const branchBookingData = Object.keys(byBranch).map(br => calcLMC(br, byBranch[br]));
    const branchBookingTotal = calcLMC('Total', bookings);
    const branchBookingNoCancelData = Object.keys(byBranch).map(br => calcLMC(br, byBranch[br].filter(x => x.status !== 'CANCELLED')));
    const branchBookingNoCancelTotal = calcLMC('Total', bookings.filter(x => x.status !== 'CANCELLED'));

    const modelBookingData = Object.keys(byModel).map(m => calcLMC(m, byModel[m]));
    const modelBookingTotal = calcLMC('Total', bookings);
    const modelBookingNoCancelData = Object.keys(byModel).map(m => calcLMC(m, byModel[m].filter(x => x.status !== 'CANCELLED')));
    const modelBookingNoCancelTotal = calcLMC('Total', bookings.filter(x => x.status !== 'CANCELLED'));

    const outletFuelData = Object.keys(byBranch).map(br => calcFuel(br, byBranch[br]));
    const outletFuelTotal = calcFuel('Total', bookings);
    const smFuelData = outletFuelData.filter(x => ['Balotra', 'Barmer', 'Jalore'].some(k => x.name.includes(k)));
    const smFuelTotal = calcFuel('Total', bookings.filter(b => ['Balotra', 'Barmer', 'Jalore'].some(k => (b.branch_name || b.branch || '').includes(k))));
    const sgFuelData = outletFuelData.filter(x => ['Bhinmal', 'Pali', 'Sumerpur'].some(k => x.name.includes(k)));
    const sgFuelTotal = calcFuel('Total', bookings.filter(b => ['Bhinmal', 'Pali', 'Sumerpur'].some(k => (b.branch_name || b.branch || '').includes(k))));

    const productFuelData = Object.keys(byModel).map(m => calcFuel(m, byModel[m]));
    const productFuelTotal = calcFuel('Total', bookings);

    const retailItems = bookings.filter(x => x.delivery_date || x.status === 'DELIVERED');
    const branchRetailData = Object.keys(byBranch).map(br => calcLMC(br, byBranch[br].filter(x => x.delivery_date || x.status === 'DELIVERED')));
    const branchRetailTotal = calcLMC('Total', retailItems);
    const modelRetailData = Object.keys(byModel).map(m => calcLMC(m, byModel[m].filter(x => x.delivery_date || x.status === 'DELIVERED')));
    const modelRetailTotal = calcLMC('Total', retailItems);

    const outletRetailFuelData = Object.keys(byBranch).map(br => calcFuel(br, byBranch[br].filter(x => x.delivery_date || x.status === 'DELIVERED')));
    const outletRetailFuelTotal = calcFuel('Total', retailItems);
    const productRetailFuelData = Object.keys(byModel).map(m => calcFuel(m, byModel[m].filter(x => x.delivery_date || x.status === 'DELIVERED')));
    const productRetailFuelTotal = calcFuel('Total', retailItems);

    const branchEbrSummary = Object.keys(byBranch).map(br => {
      const items = byBranch[br];
      const enq = items.length * 5;
      const bk = items.length;
      const rt = items.filter(x => x.delivery_date || x.status === 'DELIVERED').length;
      
      const pvItems = items.filter(x => getFuelType(x.variant||'', x.model||'') !== 'EV');
      const evItems = items.filter(x => getFuelType(x.variant||'', x.model||'') === 'EV');
      
      return {
        branch: br,
        enq, bk, rt,
        pvEnq: pvItems.length * 5, evEnq: evItems.length * 5,
        pvBk: pvItems.length, evBk: evItems.length,
        pvRt: pvItems.filter(x => x.delivery_date || x.status === 'DELIVERED').length,
        evRt: evItems.filter(x => x.delivery_date || x.status === 'DELIVERED').length
      };
    });

    // Flexible EBR Generator
    const generateEbrForBranch = (br: string, filterEvOnly: boolean = false) => {
      let branchItems = byBranch[br] || [];
      if (filterEvOnly) {
        branchItems = branchItems.filter(x => getFuelType(x.variant||'', x.model||'') === 'EV');
      }

      const ebrGrp: Record<string, Record<string, any[]>> = {};
      branchItems.forEach(b => {
        const tl = b.team_leader || 'Other';
        const sc = b.sales_consultant || 'Unknown';
        if (!ebrGrp[tl]) ebrGrp[tl] = {};
        if (!ebrGrp[tl][sc]) ebrGrp[tl][sc] = [];
        ebrGrp[tl][sc].push(b);
      });

      const groups = [];
      Object.keys(ebrGrp).forEach(tl => {
        let tlEnq = 0, tlBk = 0, tlRt = 0;
        const members = Object.keys(ebrGrp[tl]).map(sc => {
          const scItems = ebrGrp[tl][sc];
          const scBk = scItems.length;
          const scEnq = scBk * 5; 
          const scRt = scItems.filter(x => x.delivery_date || x.status === 'DELIVERED').length;
          tlEnq += scEnq; tlBk += scBk; tlRt += scRt;
          return { name: sc, enquiries: scEnq, bookings: scBk, retail: scRt };
        });
        groups.push({ leaderName: tl, enquiries: tlEnq, bookings: tlBk, retail: tlRt, members });
      });
      return groups;
    };

    return {
      branchBookingData, branchBookingTotal, branchBookingNoCancelData, branchBookingNoCancelTotal,
      modelBookingData, modelBookingTotal, modelBookingNoCancelData, modelBookingNoCancelTotal,
      outletFuelData, outletFuelTotal, smFuelData, smFuelTotal, sgFuelData, sgFuelTotal,
      productFuelData, productFuelTotal,
      branchRetailData, branchRetailTotal, modelRetailData, modelRetailTotal,
      outletRetailFuelData, outletRetailFuelTotal, productRetailFuelData, productRetailFuelTotal,
      generateEbrForBranch, availableBranches: Object.keys(byBranch),
      branchEbrSummary
    };
  }, [bookings]);

  return (
    <div className="flex flex-col h-full bg-canvas overflow-y-auto">
      <div className="p-4 md:p-6 lg:p-8 flex-1">
        <PageHeader title="Reports" subtitle="View comprehensive business performance reports" />
        
        <div className="flex gap-4 border-b border-line mb-6 overflow-x-auto">
          {['bookings', 'retail', 'ebr', 'ebr_ev'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-ink-3 hover:text-ink'
              }`}
            >
              {tab === 'bookings' ? 'Booking Reports' : tab === 'retail' ? 'Retail Reports' : tab === 'ebr' ? 'EBR Reports' : 'EV EBR Reports'}
            </button>
          ))}
        </div>

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CmLmLysmTable title="Booking Report - Outlet Wise (CM Vs LM + CM Vs LYSM)" type="Branch" data={stats.branchBookingData} total={stats.branchBookingTotal} />
              <CmLmLysmTable title="Booking Report - Model Wise (CM Vs LM + CM Vs LYSM)" type="Model" data={stats.modelBookingData} total={stats.modelBookingTotal} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CmLmLysmTable title="Booking Report - Outlet Wise (Excluding Cancellation)" type="Branch" data={stats.branchBookingNoCancelData} total={stats.branchBookingNoCancelTotal} />
              <CmLmLysmTable title="Booking Report - Model Wise (Excluding Cancellation)" type="Model" data={stats.modelBookingNoCancelData} total={stats.modelBookingNoCancelTotal} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <FuelTable title="Outlet Wise & Fuel Wise Booking Report" rowLabel="Branch" data={stats.outletFuelData} total={stats.outletFuelTotal} />
              <FuelTable title="Product & Fuel Wise Booking Report" rowLabel="Model" data={stats.productFuelData} total={stats.productFuelTotal} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <FuelTable title="SM - Outlet Wise & Fuel Wise Booking Report" rowLabel="Branch" data={stats.smFuelData} total={stats.smFuelTotal} includeAmt={false} />
              <FuelTable title="SG - Outlet Wise & Fuel Wise Booking Report" rowLabel="Branch" data={stats.sgFuelData} total={stats.sgFuelTotal} />
            </div>
          </div>
        )}

        {activeTab === 'retail' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CmLmLysmTable title="Retail Report - Outlet Wise (CM Vs LM + CM Vs LYSM)" type="Branch" data={stats.branchRetailData} total={stats.branchRetailTotal} />
              <CmLmLysmTable title="Retail Report - Model Wise (CM Vs LM + CM Vs LYSM)" type="Model" data={stats.modelRetailData} total={stats.modelRetailTotal} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <FuelTable title="Fuel Wise Retail Report" rowLabel="Branch" data={stats.outletRetailFuelData} total={stats.outletRetailFuelTotal} includeAmt={false} />
              <FuelTable title="Product & Fuel Wise Retail Report" rowLabel="Model" data={stats.productRetailFuelData} total={stats.productRetailFuelTotal} includeAmt={false} />
            </div>
          </div>
        )}

        {activeTab === 'ebr' && (
          <div className="space-y-6">
            
            {/* Simple EBR Outlet Wise */}
            <div className="border border-blue-500 overflow-hidden mb-6">
              <div className="bg-[#ffe699] text-center font-bold text-sm py-1 border-b border-blue-500">
                EBR Report - Outlet Wise (Simple)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#9bc2e6] border-b border-blue-500 text-xs font-bold">
                      <th className="py-1 px-2 border-r border-blue-500">Branch</th>
                      <th className="py-1 px-2 border-r border-blue-500">Enquiries</th>
                      <th className="py-1 px-2 border-r border-blue-500">Bookings</th>
                      <th className="py-1 px-2 border-r border-blue-500">Retail</th>
                      <th className="py-1 px-2 border-r border-blue-500">EB%</th>
                      <th className="py-1 px-2">BR%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.branchEbrSummary.map((br, i) => (
                      <tr key={i} className="bg-white border-b border-blue-500 text-xs font-bold">
                        <td className="py-1 px-2 border-r border-blue-500 text-left">{br.branch}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.enq}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.bk}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.rt}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.enq ? Math.round((br.bk/br.enq)*100)+'%' : '0%'}</td>
                        <td className="py-1 px-2">{br.bk ? Math.round((br.rt/br.bk)*100)+'%' : '0%'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* EBR PV/EV Detail */}
            <div className="border border-blue-500 overflow-hidden mb-6">
              <div className="bg-[#ffe699] text-center font-bold text-sm py-1 border-b border-blue-500">
                EBR Report - Outlet Wise (PV / EV Split)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#9bc2e6] border-b border-blue-500 text-xs font-bold">
                      <th className="py-1 px-2 border-r border-blue-500" rowSpan={2}>Branch</th>
                      <th className="py-1 px-2 border-r border-blue-500" colSpan={3}>Enquiries</th>
                      <th className="py-1 px-2 border-r border-blue-500" colSpan={3}>Bookings</th>
                      <th className="py-1 px-2 border-r border-blue-500" colSpan={3}>Retail</th>
                      <th className="py-1 px-2 border-r border-blue-500" colSpan={2}>EB%</th>
                      <th className="py-1 px-2" colSpan={2}>BR%</th>
                    </tr>
                    <tr className="bg-[#9bc2e6] border-b border-blue-500 text-xs font-bold">
                      <th className="py-1 px-2 border-r border-blue-500 border-l">PV</th>
                      <th className="py-1 px-2 border-r border-blue-500">EV</th>
                      <th className="py-1 px-2 border-r border-blue-500">Total</th>
                      <th className="py-1 px-2 border-r border-blue-500">PV</th>
                      <th className="py-1 px-2 border-r border-blue-500">EV</th>
                      <th className="py-1 px-2 border-r border-blue-500">Total</th>
                      <th className="py-1 px-2 border-r border-blue-500">PV</th>
                      <th className="py-1 px-2 border-r border-blue-500">EV</th>
                      <th className="py-1 px-2 border-r border-blue-500">Total</th>
                      <th className="py-1 px-2 border-r border-blue-500">PV</th>
                      <th className="py-1 px-2 border-r border-blue-500">EV</th>
                      <th className="py-1 px-2 border-r border-blue-500">PV</th>
                      <th className="py-1 px-2">EV</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.branchEbrSummary.map((br, i) => (
                      <tr key={i} className="bg-white border-b border-blue-500 text-xs font-bold">
                        <td className="py-1 px-2 border-r border-blue-500 text-left">{br.branch}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.pvEnq}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.evEnq}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.enq}</td>
                        
                        <td className="py-1 px-2 border-r border-blue-500">{br.pvBk}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.evBk}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.bk}</td>
                        
                        <td className="py-1 px-2 border-r border-blue-500">{br.pvRt}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.evRt}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.rt}</td>

                        <td className="py-1 px-2 border-r border-blue-500">{br.pvEnq ? Math.round((br.pvBk/br.pvEnq)*100)+'%' : '0%'}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.evEnq ? Math.round((br.evBk/br.evEnq)*100)+'%' : '0%'}</td>
                        
                        <td className="py-1 px-2 border-r border-blue-500">{br.pvBk ? Math.round((br.pvRt/br.pvBk)*100)+'%' : '0%'}</td>
                        <td className="py-1 px-2">{br.evBk ? Math.round((br.evRt/br.evBk)*100)+'%' : '0%'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Branch Team Detailed EBRs */}
            {stats.availableBranches.map((br, i) => (
              <EbrTeamTable key={i} title={`EBR Report - ${br}`} branchName={br} groups={stats.generateEbrForBranch(br, false)} />
            ))}

            {stats.availableBranches.length === 0 && (
              <div className="text-center py-10 text-ink-3">No EBR data available. Please add bookings.</div>
            )}
          </div>
        )}

        {activeTab === 'ebr_ev' && (
          <div className="space-y-6">
            <div className="border border-blue-500 overflow-hidden mb-6">
              <div className="bg-[#5b9bd5] text-white text-center font-bold text-sm py-1 border-b border-blue-500">
                EV&gt;&gt;EBR Report - Outlet Wise
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#9bc2e6] border-b border-blue-500 text-xs font-bold">
                      <th className="py-1 px-2 border-r border-blue-500">Branch</th>
                      <th className="py-1 px-2 border-r border-blue-500">Enquiries</th>
                      <th className="py-1 px-2 border-r border-blue-500">Bookings</th>
                      <th className="py-1 px-2 border-r border-blue-500">Retail</th>
                      <th className="py-1 px-2 border-r border-blue-500">EB%</th>
                      <th className="py-1 px-2">BR%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.branchEbrSummary.map((br, i) => (
                      <tr key={i} className="bg-white border-b border-blue-500 text-xs font-bold">
                        <td className="py-1 px-2 border-r border-blue-500 text-left">{br.branch}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.evEnq}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.evBk}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.evRt}</td>
                        <td className="py-1 px-2 border-r border-blue-500">{br.evEnq ? Math.round((br.evBk/br.evEnq)*100)+'%' : '0%'}</td>
                        <td className="py-1 px-2">{br.evBk ? Math.round((br.evRt/br.evBk)*100)+'%' : '0%'}</td>
                      </tr>
                    ))}
                    <tr className="bg-[#ffe699] font-bold text-xs border-t-2 border-blue-500">
                      <td className="py-1 px-2 border-r border-blue-500">Total</td>
                      <td className="py-1 px-2 border-r border-blue-500">{stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evEnq, 0)}</td>
                      <td className="py-1 px-2 border-r border-blue-500">{stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evBk, 0)}</td>
                      <td className="py-1 px-2 border-r border-blue-500">{stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evRt, 0)}</td>
                      <td className="py-1 px-2 border-r border-blue-500">
                        {stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evEnq, 0) ? Math.round((stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evBk, 0) / stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evEnq, 0)) * 100) + '%' : '0%'}
                      </td>
                      <td className="py-1 px-2">
                        {stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evBk, 0) ? Math.round((stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evRt, 0) / stats.branchEbrSummary.reduce((acc, curr) => acc + curr.evBk, 0)) * 100) + '%' : '0%'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Individual Branch Team Detailed EV EBRs */}
            {stats.availableBranches.map((br, i) => (
              <EbrTeamTable key={i} title={`EV>>EBR Report - ${br}`} branchName={br} groups={stats.generateEbrForBranch(br, true)} isEv={true} />
            ))}

            {stats.availableBranches.length === 0 && (
              <div className="text-center py-10 text-ink-3">No EV data available. Please add EV bookings.</div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
