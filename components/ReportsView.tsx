import React, { useState, useMemo } from 'react';
import { ServiceItem, Client, ServiceStatus } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';
import { Calendar, TrendingUp, DollarSign, Users, Package, AlertCircle, BarChart3 } from 'lucide-react';

interface ReportsViewProps {
  services: ServiceItem[];
  clients: Client[];
}

type PeriodType = 'today' | 'week' | 'month' | 'custom';

export const ReportsView: React.FC<ReportsViewProps> = ({ services, clients }) => {
  const [period, setPeriod] = useState<PeriodType>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // 1. Logic: Filter services by period
  const filteredServices = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return services.filter(service => {
      const serviceDate = new Date(service.date).getTime();
      
      switch (period) {
        case 'today':
          return serviceDate >= startOfToday;
        case 'week':
          const weekAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
          return serviceDate >= weekAgo;
        case 'month':
          const monthAgo = now.getTime() - (30 * 24 * 60 * 60 * 1000);
          return serviceDate >= monthAgo;
        case 'custom':
          if (!customStart || !customEnd) return true;
          const start = new Date(customStart).getTime();
          const end = new Date(customEnd).getTime() + (24 * 60 * 60 * 1000); // end of day
          return serviceDate >= start && serviceDate <= end;
        default:
          return true;
      }
    });
  }, [services, period, customStart, customEnd]);

  // 2. Logic: General Summary
  const summary = useMemo(() => {
    const stats = {
      total: filteredServices.length,
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELED: 0,
      revenueTotal: 0,
      received: 0,
      pendingValue: 0,
    };

    filteredServices.forEach(s => {
      stats[s.status]++;
      
      if (s.status !== 'CANCELED') {
        stats.revenueTotal += s.value;
        if (s.status === 'COMPLETED') {
          stats.received += s.value;
        } else {
          stats.pendingValue += s.value;
        }
      }
    });

    return stats;
  }, [filteredServices]);

  // 3. Logic: Client Ranking
  const clientRanking = useMemo(() => {
    const rankingMap = new Map<string, { name: string, count: number, totalValue: number }>();
    
    filteredServices.forEach(s => {
      const client = clients.find(c => c.id === s.clientId);
      const name = client ? client.name : 'Cliente Excluído';
      const current = rankingMap.get(s.clientId) || { name, count: 0, totalValue: 0 };
      
      current.count++;
      if (s.status !== 'CANCELED') {
        current.totalValue += s.value;
      }
      
      rankingMap.set(s.clientId, current);
    });

    return Array.from(rankingMap.values())
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 5);
  }, [filteredServices, clients]);

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Nenhum dado disponível</p>
        <p className="text-sm">Cadastre serviços para visualizar os relatórios.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-[fadeIn_0.3s_ease-out]">
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-[72px] z-10">
        <div className="flex items-center gap-2 mb-3 text-gray-700 font-bold text-sm">
          <Calendar size={16} className="text-blue-600" />
          Período do Relatório
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['today', 'week', 'month', 'custom'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                period === p 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p === 'today' ? 'Hoje' : p === 'week' ? '7 dias' : p === 'month' ? '30 dias' : 'Personalizado'}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-3 mt-4 animate-[fadeIn_0.2s_ease-out]">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none"
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none"
            />
          </div>
        )}
      </div>

      {filteredServices.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
          <p>Nenhum dado disponível para o período selecionado.</p>
        </div>
      ) : (
        <>
          {/* Main Cards Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Serviços</p>
              <h3 className="text-2xl font-bold text-gray-800">{summary.total}</h3>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Concluídos</p>
              <h3 className="text-2xl font-bold text-green-600">{summary.COMPLETED}</h3>
            </div>
          </div>

          {/* Financial Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Faturamento Bruto</p>
                <h2 className="text-3xl font-bold">{formatCurrency(summary.revenueTotal)}</h2>
              </div>
              <DollarSign size={24} className="text-white/30" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <p className="text-blue-100 text-[10px] font-bold uppercase">Recebido</p>
                <p className="text-lg font-bold">{formatCurrency(summary.received)}</p>
                <div className="w-full bg-white/20 h-1 rounded-full mt-2">
                  <div 
                    className="bg-green-400 h-full rounded-full" 
                    style={{ width: `${(summary.received / summary.revenueTotal) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-blue-100 text-[10px] font-bold uppercase">A Receber</p>
                <p className="text-lg font-bold">{formatCurrency(summary.pendingValue)}</p>
                <div className="w-full bg-white/20 h-1 rounded-full mt-2">
                  <div 
                    className="bg-orange-400 h-full rounded-full" 
                    style={{ width: `${(summary.pendingValue / summary.revenueTotal) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-600" />
              Distribuição por Status
            </h4>
            <div className="space-y-4">
              {(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'] as ServiceStatus[]).map(status => {
                const count = summary[status];
                const percentage = summary.total > 0 ? (count / summary.total) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-gray-600">{STATUS_LABELS[status]}</span>
                      <span className="font-bold text-gray-800">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${STATUS_COLORS[status].split(' ')[1].replace('text-', 'bg-')}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Client Ranking */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                Ranking de Clientes (Top 5)
              </h4>
              <TrendingUp size={16} className="text-gray-300" />
            </div>
            <div className="divide-y divide-gray-50">
              {clientRanking.length > 0 ? (
                clientRanking.map((item, idx) => (
                  <div key={idx} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 truncate max-w-[150px]">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">{item.count} {item.count === 1 ? 'Serviço' : 'Serviços'}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-blue-600">{formatCurrency(item.totalValue)}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm italic">
                  Dados insuficientes para o ranking.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
