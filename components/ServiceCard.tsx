import React, { useState } from 'react';
import { ServiceItem, ServiceStatus, Client } from '../types';
import { STATUS_COLORS, STATUS_LABELS, STATUS_ICONS } from '../constants';
import { Monitor, Calendar, ChevronRight, ChevronDown, Printer } from 'lucide-react';

interface ServiceCardProps {
  service: ServiceItem;
  onClick: (id: string) => void;
  onStatusChange: (id: string, newStatus: ServiceStatus) => void;
  onPrint: (id: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick, onStatusChange, onPrint }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const StatusIcon = STATUS_ICONS[service.status];
  const dateObj = new Date(service.date);
  const formattedDate = dateObj.toLocaleDateString('pt-BR');

  const statusOptions: ServiceStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'];

  // Fetch client name from localStorage
  const savedClientsStr = localStorage.getItem('techservice_clients');
  const savedClients: Client[] = savedClientsStr ? JSON.parse(savedClientsStr) : [];
  const client = savedClients.find(c => c.id === service.clientId);
  const clientName = client ? client.name : 'Cliente não encontrado';

  const handleStatusClick = (e: React.MouseEvent, status: ServiceStatus) => {
    e.stopPropagation();
    onStatusChange(service.id, status);
    setIsMenuOpen(false);
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handlePrintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrint(service.id);
  };

  return (
    <div 
      onClick={() => onClick(service.id)}
      className={`relative bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 mb-3 border-l-[5px] cursor-pointer ${STATUS_COLORS[service.status].split(' ')[0]}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0 pr-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">#{service.id.slice(0, 8)}</span>
            <h3 className="font-bold text-gray-800 text-lg truncate">{clientName}</h3>
          </div>
          
          {/* Status Badge & Dropdown */}
          <div className="relative">
            <button
              onClick={toggleMenu}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap ${STATUS_COLORS[service.status].split(' ').slice(1).join(' ')}`}
            >
              <StatusIcon size={12} strokeWidth={3} />
              {STATUS_LABELS[service.status]}
              <ChevronDown size={12} className={`ml-0.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }} />
                <div 
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl z-30 border border-gray-100 py-1"
                  style={{ animation: 'fadeIn 0.2s ease-out forwards' }}
                >
                  {statusOptions.map((status) => {
                    const ItemIcon = STATUS_ICONS[status];
                    const isSelected = service.status === status;
                    return (
                      <button
                        key={status}
                        onClick={(e) => handleStatusClick(e, status)}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors
                          ${isSelected ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}
                        `}
                      >
                        <ItemIcon size={14} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                        {STATUS_LABELS[status]}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
          <Monitor size={14} />
          <span className="truncate font-medium">{service.equipment}</span>
        </div>
        
        <p className="text-gray-500 text-sm mb-3 line-clamp-2 bg-gray-50 p-2 rounded-md border border-gray-100">
          {service.problem}
        </p>

        {/* Print Button Row */}
        <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center text-gray-400 text-xs">
              <Calendar size={12} className="mr-1" />
              {formattedDate}
            </div>
            
            <button 
              onClick={handlePrintClick}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-2.5 py-1 rounded-md transition-colors border border-gray-200 hover:border-blue-200"
            >
              <Printer size={12} />
              Imprimir SO
            </button>
          </div>

          <div className="flex items-center font-bold text-gray-800">
            R$ {service.value.toFixed(2).replace('.', ',')}
            <ChevronRight size={16} className="text-gray-300 ml-2" />
          </div>
        </div>
      </div>
    </div>
  );
};