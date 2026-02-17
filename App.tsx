import React, { useState, useEffect, useMemo } from 'react';
import { Menu, Plus, Search, Filter, Shield, AlertTriangle } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ServiceFormModal } from './components/ServiceFormModal';
import { ClientFormModal } from './components/ClientFormModal';
import { ServiceCard } from './components/ServiceCard';
import { ClientCard } from './components/ClientCard';
import { PrintableServiceOrder } from './components/PrintableServiceOrder';
import { LoginScreen } from './components/LoginScreen';
import { UserSettings } from './components/UserSettings';
import { ReportsView } from './components/ReportsView';
import { ServiceItem, Client, ViewState, ServiceStatus, UserAccount } from './types';
import { INITIAL_SERVICES, INITIAL_CLIENTS, INITIAL_USERS, STATUS_LABELS, DEFAULT_NFS_LINK } from './constants';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [nfsLink, setNfsLink] = useState(DEFAULT_NFS_LINK);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('SERVICES');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  
  // Client Modal States
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'ALL'>('ALL');
  
  // App Notifications/Alerts
  const [alert, setAlert] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  // State for printing
  const [serviceToPrint, setServiceToPrint] = useState<ServiceItem | null>(null);

  // Clear alert after timeout
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Initial setup: Load users and configurations
  useEffect(() => {
    const savedNfsLink = localStorage.getItem('techservice_nfs_link');
    if (savedNfsLink) {
      setNfsLink(savedNfsLink);
    }

    const savedUsers = localStorage.getItem('techservice_users');
    let loadedUsers: UserAccount[] = [];
    if (savedUsers) {
      loadedUsers = JSON.parse(savedUsers);
    } else {
      loadedUsers = INITIAL_USERS;
      localStorage.setItem('techservice_users', JSON.stringify(loadedUsers));
    }
    setUsers(loadedUsers);

    const auth = localStorage.getItem('techservice_auth');
    const currentUserId = localStorage.getItem('techservice_current_user_id');
    
    if (auth === 'true' && currentUserId) {
      const user = loadedUsers.find(u => u.id === currentUserId);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('techservice_auth');
        localStorage.removeItem('techservice_current_user_id');
      }
    }
    setIsLoadingAuth(false);
  }, []);

  // Load business data
  useEffect(() => {
    if (isAuthenticated) {
      const savedServices = localStorage.getItem('techservice_data');
      if (savedServices) {
        setServices(JSON.parse(savedServices));
      } else {
        setServices(INITIAL_SERVICES);
      }

      const savedClients = localStorage.getItem('techservice_clients');
      if (savedClients) {
        setClients(JSON.parse(savedClients));
      } else {
        setClients(INITIAL_CLIENTS);
      }
    }
  }, [isAuthenticated]);

  // Persist business data
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('techservice_data', JSON.stringify(services));
    }
  }, [services, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('techservice_clients', JSON.stringify(clients));
    }
  }, [clients, isAuthenticated]);

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('techservice_users', JSON.stringify(users));
    }
  }, [users]);

  // Handle printing effect
  useEffect(() => {
    if (serviceToPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [serviceToPrint]);

  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('techservice_auth');
    localStorage.removeItem('techservice_current_user_id');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsSidebarOpen(false);
    setCurrentView('SERVICES');
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const handleUpdateNfsLink = (newLink: string) => {
    setNfsLink(newLink);
    localStorage.setItem('techservice_nfs_link', newLink);
  };

  // --- BACKUP & RESTORE ---
  const handleBackup = () => {
    try {
      const backupData = {
        users: JSON.parse(localStorage.getItem('techservice_users') || '[]'),
        clients: JSON.parse(localStorage.getItem('techservice_clients') || '[]'),
        services: JSON.parse(localStorage.getItem('techservice_data') || '[]'),
        nfsLink: localStorage.getItem('techservice_nfs_link') || DEFAULT_NFS_LINK,
        version: '1.2.5',
        timestamp: new Date().toISOString()
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const now = new Date();
      const dateString = now.toISOString().split('T')[0];
      link.href = url;
      link.download = `backup-sistema-${dateString}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setAlert({ message: 'Backup gerado com sucesso.', type: 'success' });
    } catch (err) {
      setAlert({ message: 'Erro ao gerar backup.', type: 'error' });
    }
  };

  const handleRestore = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Simple validation
        if (!data.users || !data.clients || !data.services) {
          throw new Error('Formato de backup inválido');
        }

        if (window.confirm('Restaurar backup substituirá todos os dados atuais. Deseja continuar?')) {
          // Update LocalStorage
          localStorage.setItem('techservice_users', JSON.stringify(data.users));
          localStorage.setItem('techservice_clients', JSON.stringify(data.clients));
          localStorage.setItem('techservice_data', JSON.stringify(data.services));
          localStorage.setItem('techservice_nfs_link', data.nfsLink || DEFAULT_NFS_LINK);

          // Update State
          setUsers(data.users);
          setClients(data.clients);
          setServices(data.services);
          setNfsLink(data.nfsLink || DEFAULT_NFS_LINK);

          setAlert({ message: 'Backup restaurado com sucesso!', type: 'success' });
          
          // Force a small view refresh if needed, usually React state handles it
        }
      } catch (err) {
        setAlert({ message: 'Falha na restauração. Arquivo inválido.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  // --- SERVICE ACTIONS ---
  const handleAddService = (newServiceData: Omit<ServiceItem, 'id'>) => {
    const newService: ServiceItem = {
      ...newServiceData,
      id: crypto.randomUUID(),
    };
    setServices(prev => [newService, ...prev]);
    setAlert({ message: 'Serviço cadastrado com sucesso!', type: 'success' });
  };

  const handleStatusChange = (id: string, newStatus: ServiceStatus) => {
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, status: newStatus } : service
    ));
  };

  const handlePrint = (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) {
      setServiceToPrint(service);
    }
  };

  // --- CLIENT ACTIONS ---
  const handleSaveClient = (clientData: Omit<Client, 'id'>) => {
    if (editingClient) {
      // Update existing
      setClients(prev => prev.map(c => 
        c.id === editingClient.id ? { ...clientData, id: c.id } : c
      ));
      setAlert({ message: 'Cliente atualizado com sucesso!', type: 'success' });
    } else {
      // Add new
      const newClient: Client = {
        ...clientData,
        id: crypto.randomUUID(),
      };
      setClients(prev => [newClient, ...prev]);
      setAlert({ message: 'Cliente cadastrado com sucesso!', type: 'success' });
    }
    setEditingClient(null);
  };

  const handleEditClientClick = (client: Client) => {
    setEditingClient(client);
    setIsClientModalOpen(true);
  };

  const handleDeleteClient = (id: string) => {
    const isLinked = services.some(s => s.clientId === id);
    if (isLinked) {
      setAlert({ message: 'Cliente vinculado a uma Ordem de Serviço!', type: 'error' });
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      setClients(prev => prev.filter(c => c.id !== id));
      setAlert({ message: 'Cliente excluído com sucesso.', type: 'success' });
    }
  };

  // --- FILTERED LISTS ---
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const client = clients.find(c => c.id === service.clientId);
      const clientName = client ? client.name.toLowerCase() : '';
      const matchesSearch = clientName.includes(searchTerm.toLowerCase()) || 
                            service.equipment.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || service.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [services, clients, searchTerm, statusFilter]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const lowerSearch = searchTerm.toLowerCase();
      return client.name.toLowerCase().includes(lowerSearch) ||
             client.phone.includes(lowerSearch) ||
             (client.cpf && client.cpf.includes(lowerSearch)) ||
             (client.cnpj && client.cnpj.includes(lowerSearch));
    });
  }, [clients, searchTerm]);

  const stats = useMemo(() => {
    return {
      toReceive: services.filter(s => s.status !== 'COMPLETED' && s.status !== 'CANCELED')
        .reduce((acc, curr) => acc + curr.value, 0),
      received: services.filter(s => s.status === 'COMPLETED')
        .reduce((acc, curr) => acc + curr.value, 0),
      total: services.reduce((acc, curr) => acc + curr.value, 0)
    };
  }, [services]);

  const handleViewChange = (view: ViewState) => {
    setCurrentView(view);
    setSearchTerm('');
    setStatusFilter('ALL');
  };

  const renderServicesView = () => (
    <div className="pb-24">
      <div className="sticky top-16 z-10 bg-[#f3f4f6]/95 backdrop-blur-sm py-2 space-y-2 mb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button 
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            Todos
          </button>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key as ServiceStatus)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filteredServices.length > 0 ? (
        <div className="space-y-3">
          {filteredServices.map(service => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              onClick={(id) => console.log('View details', id)} 
              onStatusChange={handleStatusChange}
              onPrint={handlePrint}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Filter size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">Nenhum serviço encontrado</p>
          <p className="text-sm">Tente mudar os filtros ou adicione um novo.</p>
        </div>
      )}
    </div>
  );

  const renderClientsView = () => (
    <div className="pb-24">
      <div className="sticky top-16 z-10 bg-[#f3f4f6]/95 backdrop-blur-sm py-2 space-y-2 mb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Nome, documento ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {filteredClients.length > 0 ? (
        <div className="space-y-3">
          {filteredClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={(id) => console.log('View client', id)}
              onEdit={handleEditClientClick}
              onDelete={handleDeleteClient}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Filter size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">Nenhum cliente encontrado</p>
          <p className="text-sm">Adicione um novo cliente para começar.</p>
        </div>
      )}
    </div>
  );

  const renderFinanceView = () => (
    <div className="pt-4 space-y-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
        <p className="text-blue-100 text-sm font-medium mb-1">Receita Total (Estimada)</p>
        <h2 className="text-3xl font-bold">R$ {stats.total.toFixed(2).replace('.', ',')}</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">A Receber</p>
          <p className="text-xl font-bold text-gray-800 mt-1">R$ {stats.toReceive.toFixed(2).replace('.', ',')}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Recebido</p>
          <p className="text-xl font-bold text-gray-800 mt-1">R$ {stats.received.toFixed(2).replace('.', ',')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-400 italic">Mais detalhes financeiros em breve...</p>
      </div>
    </div>
  );

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'SERVICES': return 'Meus Serviços';
      case 'CLIENTS': return 'Meus Clientes';
      case 'FINANCE': return 'Fluxo de Caixa';
      case 'REPORTS': return 'Painel de Relatórios';
      case 'SETTINGS': return 'Configurações de Usuário';
      default: return currentView.charAt(0) + currentView.slice(1).toLowerCase();
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const isAdmin = currentUser?.accessLevel === 'ADMIN';

  return (
    <>
      <div className="min-h-screen bg-[#f3f4f6] no-print relative">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-600 to-teal-400 shadow-md z-30 flex items-center justify-between px-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-white font-bold text-lg tracking-wide uppercase truncate px-2">
            {getHeaderTitle()}
          </h1>
          <div className="w-10"></div>
        </header>

        {/* Floating Alert */}
        {alert && (
          <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-[fadeIn_0.3s_ease-out] border ${
            alert.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {alert.type === 'error' && <AlertTriangle size={16} />}
            <span className="text-sm font-medium">{alert.message}</span>
          </div>
        )}

        {/* Main Content */}
        <main className="pt-20 px-4 pb-24 max-w-3xl mx-auto">
          {currentView === 'SERVICES' && renderServicesView()}
          {currentView === 'CLIENTS' && renderClientsView()}
          {currentView === 'FINANCE' && isAdmin && renderFinanceView()}
          {currentView === 'REPORTS' && isAdmin && (
            <ReportsView services={services} clients={clients} />
          )}
          {currentView === 'SETTINGS' && isAdmin && currentUser && (
            <UserSettings 
              currentUser={currentUser} 
              onUpdateUser={handleUpdateUser} 
              nfsLink={nfsLink}
              onUpdateNfsLink={handleUpdateNfsLink}
            />
          )}
          
          {(currentView === 'FINANCE' || currentView === 'SETTINGS' || currentView === 'REPORTS') && !isAdmin && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
               <Shield size={64} className="text-gray-300 mb-4" />
               <h3 className="text-xl font-bold text-gray-600">Acesso Restrito</h3>
               <p className="text-gray-400 max-w-xs mt-2">Seu nível de acesso não permite visualizar esta seção. Entre em contato com um administrador.</p>
            </div>
          )}

          {currentView === 'PRODUCTS' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 animate-pulse">
                <span className="text-3xl">🚧</span>
              </div>
              <h3 className="text-xl font-bold text-gray-600">Produtos</h3>
              <p>Funcionalidade em desenvolvimento</p>
            </div>
          )}
        </main>

        {/* Components */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          currentView={currentView}
          onChangeView={handleViewChange}
          onLogout={handleLogout}
          onBackup={handleBackup}
          onRestore={handleRestore}
          user={currentUser}
          nfsLink={nfsLink}
        />

        <ServiceFormModal 
          isOpen={isServiceModalOpen}
          onClose={() => setIsServiceModalOpen(false)}
          onSave={handleAddService}
          clients={clients}
          onAddClient={() => {
            setIsServiceModalOpen(false);
            setCurrentView('CLIENTS');
            setIsClientModalOpen(true);
          }}
        />

        <ClientFormModal 
          isOpen={isClientModalOpen}
          onClose={() => {
            setIsClientModalOpen(false);
            setEditingClient(null);
          }}
          onSave={handleSaveClient}
          initialData={editingClient}
        />

        {/* Floating Action Button */}
        {(currentView === 'SERVICES' || currentView === 'CLIENTS') && (
          <button
            onClick={() => {
              if (currentView === 'SERVICES') {
                setIsServiceModalOpen(true);
              } else {
                setEditingClient(null);
                setIsClientModalOpen(true);
              }
            }}
            className="fixed bottom-6 right-6 w-14 h-14 bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg shadow-pink-500/40 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-20"
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Hidden Printable Component */}
      <PrintableServiceOrder service={serviceToPrint} />
    </>
  );
}

export default App;