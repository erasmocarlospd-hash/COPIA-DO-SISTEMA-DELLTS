import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { X, User, Phone, MapPin, FileText, AlertCircle } from 'lucide-react';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id'>) => void;
  initialData?: Client | null;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cpf: '',
    cnpj: '',
    address: '',
    notes: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        name: initialData.name,
        phone: initialData.phone,
        cpf: initialData.cpf || '',
        cnpj: initialData.cnpj || '',
        address: initialData.address || '',
        notes: initialData.notes || ''
      });
    } else if (isOpen) {
      setFormData({ name: '', phone: '', cpf: '', cnpj: '', address: '', notes: '' });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const validateDocs = () => {
    if (formData.cpf && formData.cpf.length < 14) {
      setError('CPF incompleto ou inválido.');
      return false;
    }
    if (formData.cnpj && formData.cnpj.length < 18) {
      setError('CNPJ incompleto ou inválido.');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateDocs()) return;

    onSave({
      name: formData.name,
      phone: formData.phone,
      cpf: formData.cpf || undefined,
      cnpj: formData.cnpj || undefined,
      address: formData.address,
      notes: formData.notes
    });
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      const masked = formatCPF(value);
      setFormData(prev => ({ ...prev, cpf: masked, cnpj: '' }));
      if (error) setError('');
    } else if (name === 'cnpj') {
      const masked = formatCNPJ(value);
      setFormData(prev => ({ ...prev, cnpj: masked, cpf: '' }));
      if (error) setError('');
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-[fadeIn_0.3s_ease-out]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">{initialData ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                required 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                placeholder="Nome do cliente" 
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                required 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                placeholder="(00) 00000-0000" 
              />
            </div>
          </div>

          {/* CPF / CNPJ Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${formData.cnpj ? 'text-gray-300' : 'text-gray-700'}`}>CPF</label>
              <div className="relative">
                <FileText className={`absolute left-3 top-1/2 -translate-y-1/2 ${formData.cnpj ? 'text-gray-200' : 'text-gray-400'}`} size={16} />
                <input 
                  type="text" 
                  name="cpf" 
                  value={formData.cpf} 
                  onChange={handleChange} 
                  disabled={!!formData.cnpj}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg border outline-none transition-all text-sm ${
                    formData.cnpj 
                    ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`} 
                  placeholder="000.000.000-00" 
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${formData.cpf ? 'text-gray-300' : 'text-gray-700'}`}>CNPJ</label>
              <div className="relative">
                <FileText className={`absolute left-3 top-1/2 -translate-y-1/2 ${formData.cpf ? 'text-gray-200' : 'text-gray-400'}`} size={16} />
                <input 
                  type="text" 
                  name="cnpj" 
                  value={formData.cnpj} 
                  onChange={handleChange} 
                  disabled={!!formData.cpf}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg border outline-none transition-all text-sm ${
                    formData.cpf 
                    ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' 
                    : 'border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                  }`} 
                  placeholder="00.000.000/0000-00" 
                />
              </div>
            </div>
          </div>

          {/* Erro de Documento */}
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded-lg border border-red-100 animate-[fadeIn_0.3s_ease-out]">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço (Opcional)</label>
             <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                placeholder="Endereço completo" 
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              rows={3} 
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none" 
              placeholder="Detalhes adicionais..." 
            />
          </div>

          {/* Botão Salvar */}
          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-md active:scale-[0.98] transition-all"
            >
              {initialData ? 'Salvar Alterações' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};