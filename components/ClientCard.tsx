import React from 'react';
import { Client } from '../types';
import { Phone, MapPin, FileText, Pencil, Trash2 } from 'lucide-react';

interface ClientCardProps {
  client: Client;
  onClick: (id: string) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ client, onClick, onEdit, onDelete }) => {
  const document = client.cpf || client.cnpj;
  const docType = client.cpf ? 'CPF' : 'CNPJ';

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(client);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(client.id);
  };

  return (
    <div 
      onClick={() => onClick(client.id)}
      className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-200 mb-3 p-4 cursor-pointer border border-gray-100 group"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-50 shadow-sm">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-800 text-lg truncate pr-2">{client.name}</h3>
            <div className="flex gap-1">
              <button 
                onClick={handleEdit}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Editar cliente"
              >
                <Pencil size={16} />
              </button>
              <button 
                onClick={handleDelete}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Excluir cliente"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center text-gray-500 text-sm mt-0.5">
            <Phone size={14} className="mr-1.5 flex-shrink-0" />
            <span className="truncate">{client.phone}</span>
          </div>
        </div>
      </div>
      
      {(document || client.address) && (
        <div className="mt-3 pt-3 border-t border-gray-50 text-sm text-gray-600 space-y-1.5">
           {document && (
             <div className="flex items-center">
               <FileText size={14} className="mr-2 text-gray-400 flex-shrink-0" />
               <span className="truncate font-medium">{docType}: {document}</span>
             </div>
           )}
           {client.address && (
             <div className="flex items-center">
               <MapPin size={14} className="mr-2 text-gray-400 flex-shrink-0" />
               <span className="truncate">{client.address}</span>
             </div>
           )}
        </div>
      )}
    </div>
  );
};