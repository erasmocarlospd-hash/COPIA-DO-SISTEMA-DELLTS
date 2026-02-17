import React, { useRef } from 'react';
import { ViewState, UserAccount } from '../types';
import { 
  Users, 
  Wrench, 
  Package, 
  DollarSign, 
  BarChart3, 
  Settings, 
  X,
  LogOut,
  FileText,
  Download,
  Upload
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  user: UserAccount | null;
  nfsLink: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  currentView, 
  onChangeView, 
  onLogout, 
  onBackup,
  onRestore,
  user, 
  nfsLink 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems: { id: ViewState; label: string; icon: React.ElementType }[] = [
    { id: 'SERVICES', label: 'Serviços', icon: Wrench },
    { id: 'CLIENTS', label: 'Clientes', icon: Users },
    { id: 'PRODUCTS', label: 'Produtos', icon: Package },
    { id: 'FINANCE', label: 'Financeiro', icon: DollarSign },
    { id: 'REPORTS', label: 'Relatórios', icon: BarChart3 },
    { id: 'SETTINGS', label: 'Configurações', icon: Settings },
  ];

  const isAdmin = user?.accessLevel === 'ADMIN';

  const filteredMenuItems = menuItems.filter(item => {
    if (user?.accessLevel === 'SUPPORT') {
      return item.id !== 'FINANCE' && item.id !== 'SETTINGS' && item.id !== 'REPORTS';
    }
    return true;
  });

  const handleItemClick = (view: ViewState) => {
    onChangeView(view);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const handleNfsClick = () => {
    window.open(nfsLink, '_blank');
    onClose();
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestore(file);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Hidden file input for restore */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".json" 
        onChange={handleFileChange}
      />

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-teal-500 flex-shrink-0">
          <div className="flex flex-col">
            <h2 className="text-white font-bold text-xl leading-none">Dellts</h2>
            {user && (
              <span className="text-blue-100 text-[10px] uppercase font-bold tracking-widest mt-0.5">
                {user.accessLevel === 'ADMIN' ? 'Administrador' : 'Suporte'}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === item.id 
                  ? 'bg-blue-50 text-blue-600 font-medium shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}

          <div className="pt-2 mt-2 border-t border-gray-100 space-y-2">
            <button
              onClick={handleNfsClick}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-200"
            >
              <FileText size={20} className="text-teal-500" />
              <span>Emitir NFS-e</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => { onBackup(); onClose(); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-200"
                >
                  <Download size={20} className="text-blue-500" />
                  <span>Backup do Sistema</span>
                </button>
                <button
                  onClick={() => { handleRestoreClick(); onClose(); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-all duration-200"
                >
                  <Upload size={20} className="text-orange-500" />
                  <span>Restaurar Backup</span>
                </button>
              </>
            )}
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
          <div className="mt-4 text-xs text-gray-400 text-center">
            v1.2.5 • Logado como: <span className="font-semibold">{user?.username}</span>
          </div>
        </div>
      </div>
    </>
  );
};