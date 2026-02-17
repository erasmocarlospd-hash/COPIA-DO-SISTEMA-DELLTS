import { ServiceStatus, UserAccount } from './types';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export const STATUS_COLORS: Record<ServiceStatus, string> = {
  PENDING: 'border-orange-500 text-orange-600 bg-orange-50',
  IN_PROGRESS: 'border-blue-500 text-blue-600 bg-blue-50',
  COMPLETED: 'border-green-500 text-green-600 bg-green-50',
  CANCELED: 'border-gray-500 text-gray-600 bg-gray-100',
};

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em Andamento',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
};

export const STATUS_ICONS = {
  PENDING: Clock,
  IN_PROGRESS: Loader2,
  COMPLETED: CheckCircle2,
  CANCELED: XCircle,
};

export const DEFAULT_NFS_LINK = 'https://www.nfse.gov.br/EmissorNacional/Login?ReturnUrl=%2fEmissorNacional';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'admin-01',
    username: 'ADMIN',
    password: 'ADMIN',
    accessLevel: 'ADMIN'
  }
];

export const INITIAL_CLIENTS = [
  {
    id: '1',
    name: 'João Silva',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123',
    cpf: '123.456.789-00',
    notes: 'Cliente desde 2023'
  },
  {
    id: '2',
    name: 'Maria Oliveira',
    phone: '(21) 98888-7777',
    address: 'Av. Principal, 500, Apt 22',
    cnpj: '12.345.678/0001-90',
    notes: ''
  },
  {
    id: '3',
    name: 'Tech Corp Ltda',
    phone: '(11) 3030-4040',
    address: 'Centro Empresarial, Sala 405',
    notes: 'Empresa parceira'
  }
];

export const INITIAL_SERVICES = [
  {
    id: '1',
    clientId: '1',
    equipment: 'Notebook Dell Inspiron',
    problem: 'Tela quebrada',
    status: 'PENDING' as ServiceStatus,
    value: 450.00,
    date: new Date().toISOString(),
    notes: 'Aguardando peça'
  },
  {
    id: '2',
    clientId: '2',
    equipment: 'PC Gamer',
    problem: 'Limpeza e Formatação',
    status: 'IN_PROGRESS' as ServiceStatus,
    value: 120.00,
    date: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Prioridade alta'
  },
  {
    id: '3',
    clientId: '3',
    equipment: 'Impressora Epson',
    problem: 'Não imprime preto',
    status: 'COMPLETED' as ServiceStatus,
    value: 80.00,
    date: new Date(Date.now() - 172800000).toISOString(),
    notes: 'Entregue'
  }
];