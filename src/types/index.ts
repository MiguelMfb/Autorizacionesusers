// Base interfaces
interface BaseUser {
  id: string;
  nombreCompleto: string;
  identificacion: string;
}

export interface AuthorizationGroup {
  codigoUnico: string;
  fechaCreacion: Date;
  estado: 'ACTIVO' | 'INACTIVO';
  observaciones?: string;
}

export interface User extends BaseUser {
  email?: string;
  celular?: string;
  direccion?: string;
  ciudad?: string;
  cliente?: string;
  dependencia?: string;
  solicitaServicio?: boolean;
  empresaPrestadorServicio?: string;
  authorizationGroups?: AuthorizationGroup[]; // Updated to handle multiple auth groups
  autorizacion?: {
    noMiPres?: string;
    noVolante?: string;
    codigoTarifaAutorizada?: string;
    nombreTarifaAutorizada?: string;
    numeroServiciosAutorizados?: number;
    numeroServiciosDisponibles?: number;
    fechaInicioVigencia?: Date;
    fechaFinVigencia?: Date;
    esViaje?: boolean;
    esTraslado?: boolean;
    empresaPrestadorServicio?: string;
    ciudadA?: string;
    ciudadB?: string;
  };
  codigoUnico?: string;
}

export interface UserManagementSummary extends BaseUser {
  celular: string;
  cliente: string;
  dependencia: string;
  solicitaServicio: boolean;
  empresaPrestadorServicio: string;
  authorizationGroups: AuthorizationGroup[]; // Updated to handle multiple auth groups
  codigoAutorizacion: string;
}

export interface UserDetailInfo extends BaseUser {
  celular: string;
  cliente: string;
  dependencia: string;
  sRestantes: number;
  vigenciaStatus: 'VIGENTE' | 'NO VIGENTE';
  empresaPrestadorServicio: string;
  authorizationGroups: AuthorizationGroup[]; // Updated to handle multiple auth groups
}

export interface UserAuthorizationDetail {
  id: string;
  codigoUnico: string; // This references the AuthorizationGroup
  noMipres: string;
  noVolante: string;
  fechaInicioVigencia: Date;
  fechaFinVigencia: Date;
  numeroServiciosAutorizados: number;
  esViaje: boolean;
  esTraslado: boolean;
  sRestante: number;
  vigenciaStatus: 'VIGENTE' | 'NO VIGENTE';
  empresaPrestadorServicio: string;
  ciudadA: string;
  ciudadB: string;
  codigoTarifaAutorizada?: string;
  nombreTarifaAutorizada?: string;
  rangoKmAutorizados?: string;
}

export interface Authorization {
  id: string;
  codigoUnico: string; // This references the AuthorizationGroup
  dependencia: string;
  nombreCompleto: string;
  identificacion: string;
  volante: string;
  mipres: string;
  cantidadS: number;
  sRestantes: number;
  serviciosAutorizados: string;
  fechaInicioVigencia: string;
  fechaFinVigencia: string;
  vigenciaStatus: 'VIGENTE' | 'NO VIGENTE';
  empresaPrestadorServicio: string;
  ciudadA: string;
  ciudadB: string;
}

export interface Option {
  value: string;
  label: string;
}

export interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface FetchParams {
  page: number;
  limit: number;
  searchTerm?: string;
  sortKey?: string;
  sortDirection?: 'ascending' | 'descending';
}

export interface FetchUserManagementParams extends FetchParams {
  dependencyFilter?: string;
  empresaFilter?: string;
}

export interface FetchUserDetailParams extends FetchParams {
  codigoUnico?: string;
  mipres?: string;
  volante?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface FetchAuthorizationsParams extends FetchParams {
  fechaInicio?: string;
  fechaFin?: string;
  identificacion?: string;
  codigoUnico?: string;
  noMipres?: string;
  noVolante?: string;
  dependencia?: string;
  vigencia?: 'TODOS' | 'VIGENTE' | 'NO VIGENTE';
}

export interface FetchResponse<T> {
  data: T[];
  total: number;
}