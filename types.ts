export type ServiceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
export type AccessLevel = 'ADMIN' | 'SUPPORT';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  accessLevel: AccessLevel;
}

export interface ServiceItem {
  id: string;
  clientId: string; // Changed from clientName to clientId
  equipment: string;
  problem: string;
  status: ServiceStatus;
  value: number;
  date: string; // ISO string
  notes?: string;
  clientDoc?: string; // To store either CPF or CNPJ for the service order
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  cpf?: string;
  cnpj?: string;
  notes?: string;
}

export type ViewState = 'SERVICES' | 'FINANCE' | 'CLIENTS' | 'PRODUCTS' | 'REPORTS' | 'SETTINGS';

export interface ServiceStats {
  pending: number;
  inProgress: number;
  completed: number;
  totalValuePending: number;
  totalValueReceived: number;
}