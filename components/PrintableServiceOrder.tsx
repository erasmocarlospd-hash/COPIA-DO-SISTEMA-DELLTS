import React from 'react';
import { ServiceItem, Client } from '../types';
import { STATUS_LABELS } from '../constants';

interface PrintableServiceOrderProps {
  service: ServiceItem | null;
}

export const PrintableServiceOrder: React.FC<PrintableServiceOrderProps> = ({ service }) => {
  if (!service) return null;

  const dateObj = new Date(service.date);
  const formattedDate = dateObj.toLocaleDateString('pt-BR');

  // Try to find the client's document if it's stored in LocalStorage
  const savedClientsStr = localStorage.getItem('techservice_clients');
  const savedClients: Client[] = savedClientsStr ? JSON.parse(savedClientsStr) : [];
  const clientData = savedClients.find(c => c.id === service.clientId);
  const clientName = clientData ? clientData.name : 'Cliente não encontrado';
  const clientDoc = clientData?.cpf || clientData?.cnpj;
  const docType = clientData?.cpf ? 'CPF' : 'CNPJ';

  return (
    <div className="print-only bg-white p-8 max-w-[210mm] mx-auto min-h-screen text-gray-800 font-sans">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-6 mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dellts Informática</h1>
          <p className="text-sm text-gray-500 mt-1">Soluções em Tecnologia e Manutenção</p>
          <p className="text-xs text-gray-400 mt-1 font-medium tracking-wide">CNPJ: 27.376.081/0001-85</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-gray-700">Ordem de Serviço</h2>
          <p className="text-lg font-mono font-bold text-gray-900 mt-1">#{service.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-sm text-gray-500 mt-1">Data: {formattedDate}</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8">
        <div className="col-span-2">
          <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Cliente</label>
          <div className="text-lg font-medium border-b border-gray-200 pb-1">{clientName}</div>
        </div>

        {clientDoc && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Documento ({docType})</label>
            <div className="text-base border-b border-gray-200 pb-1">{clientDoc}</div>
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Equipamento</label>
          <div className="text-base border-b border-gray-200 pb-1">{service.equipment}</div>
        </div>

        <div className={!clientDoc ? 'col-span-1' : ''}>
          <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Status Atual</label>
          <div className="text-base border-b border-gray-200 pb-1 font-semibold text-gray-700">
            {STATUS_LABELS[service.status]}
          </div>
        </div>

        {clientData?.phone && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Contato</label>
            <div className="text-base border-b border-gray-200 pb-1">{clientData.phone}</div>
          </div>
        )}

        <div className="col-span-2 mt-2">
          <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Problema Relatado / Serviço</label>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700 min-h-[80px]">
            {service.problem}
          </div>
        </div>

        <div className="col-span-2">
          <label className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Observações Técnicas</label>
          <div className="text-sm text-gray-600 border-b border-gray-200 pb-1 min-h-[24px]">
            {service.notes || 'Nenhuma observação registrada.'}
          </div>
        </div>
      </div>

      {/* Value Section */}
      <div className="flex justify-end mb-12">
        <div className="bg-gray-100 px-6 py-4 rounded-lg border border-gray-200 min-w-[200px]">
          <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-1 text-right">Valor Total</label>
          <div className="text-2xl font-bold text-gray-900 text-right">
            R$ {service.value.toFixed(2).replace('.', ',')}
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-auto pt-16">
        <div className="grid grid-cols-2 gap-12">
          <div className="text-center">
            <div className="border-t border-gray-400 w-full mb-2"></div>
            <p className="text-sm font-medium text-gray-600">Assinatura do Técnico</p>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 w-full mb-2"></div>
            <p className="text-sm font-medium text-gray-600">Assinatura do Cliente</p>
            <p className="text-xs text-gray-400 mt-1">Declaro estar ciente dos serviços acima.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
        <p>Dellts Informática - Documento gerado eletronicamente em {new Date().toLocaleString('pt-BR')}</p>
      </div>
    </div>
  );
};