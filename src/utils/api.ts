import { 
  UserManagementSummary,
  UserDetailInfo,
  UserAuthorizationDetail,
  FetchUserManagementParams,
  FetchUserDetailParams,
  FetchResponse,
  Option,
  Authorization,
  FetchAuthorizationsParams,
  AuthorizationGroup
} from '../types';

// Lists for dropdowns
export const clientesList: Option[] = [
  { value: 'TUTELAS EPS', label: 'TUTELAS EPS' },
  { value: 'SERVICIOS MEDICOS', label: 'SERVICIOS MEDICOS' }
];

export const dependenciasList: Option[] = [
  { value: 'TRANSPORTE PACIENTES REGIONAL ANTIOQUIA', label: 'TRANSPORTE PACIENTES REGIONAL ANTIOQUIA' },
  { value: 'TRANSPORTE PACIENTES REGIONAL CENTRAL', label: 'TRANSPORTE PACIENTES REGIONAL CENTRAL' }
];

export const empresaOptions: Option[] = [
  { value: 'NUEVO RUMBO', label: 'NUEVO RUMBO' },
  { value: 'RENETUR', label: 'RENETUR' }
];

// Colombian cities list
export const colombianCities: Option[] = [
  // Major cities
  { value: 'BOGOTA', label: 'Bogotá D.C.' },
  { value: 'MEDELLIN', label: 'Medellín' },
  { value: 'CALI', label: 'Cali' },
  { value: 'BARRANQUILLA', label: 'Barranquilla' },
  { value: 'CARTAGENA', label: 'Cartagena' },
  { value: 'CUCUTA', label: 'Cúcuta' },
  { value: 'BUCARAMANGA', label: 'Bucaramanga' },
  { value: 'PEREIRA', label: 'Pereira' },
  { value: 'SANTA_MARTA', label: 'Santa Marta' },
  { value: 'IBAGUE', label: 'Ibagué' },
  { value: 'PASTO', label: 'Pasto' },
  { value: 'MANIZALES', label: 'Manizales' },
  { value: 'NEIVA', label: 'Neiva' },
  { value: 'VILLAVICENCIO', label: 'Villavicencio' },
  { value: 'ARMENIA', label: 'Armenia' },
  { value: 'VALLEDUPAR', label: 'Valledupar' },
  { value: 'MONTERIA', label: 'Montería' },
  { value: 'SINCELEJO', label: 'Sincelejo' },
  { value: 'POPAYAN', label: 'Popayán' },
  { value: 'TUNJA', label: 'Tunja' },
  { value: 'FLORENCIA', label: 'Florencia' },
  { value: 'RIOHACHA', label: 'Riohacha' },
  { value: 'YOPAL', label: 'Yopal' },
  { value: 'QUIBDO', label: 'Quibdó' },
  { value: 'MOCOA', label: 'Mocoa' },
  { value: 'SAN_JOSE_DEL_GUAVIARE', label: 'San José del Guaviare' },
  { value: 'LETICIA', label: 'Leticia' },
  { value: 'INIRIDA', label: 'Inírida' },
  { value: 'PUERTO_CARRENO', label: 'Puerto Carreño' },
  { value: 'MITU', label: 'Mitú' },
  
  // Antioquia
  { value: 'BELLO', label: 'Bello' },
  { value: 'ITAGUI', label: 'Itagüí' },
  { value: 'ENVIGADO', label: 'Envigado' },
  { value: 'APARTADO', label: 'Apartadó' },
  { value: 'TURBO', label: 'Turbo' },
  { value: 'RIONEGRO', label: 'Rionegro' },
  { value: 'SABANETA', label: 'Sabaneta' },
  { value: 'LA_ESTRELLA', label: 'La Estrella' },
  { value: 'COPACABANA', label: 'Copacabana' },
  { value: 'GIRARDOTA', label: 'Girardota' },
  
  // Valle del Cauca
  { value: 'PALMIRA', label: 'Palmira' },
  { value: 'BUENAVENTURA', label: 'Buenaventura' },
  { value: 'TULUA', label: 'Tuluá' },
  { value: 'CARTAGO', label: 'Cartago' },
  { value: 'BUGA', label: 'Buga' },
  { value: 'JAMUNDI', label: 'Jamundí' },
  { value: 'YUMBO', label: 'Yumbo' },
  
  // Cundinamarca
  { value: 'SOACHA', label: 'Soacha' },
  { value: 'GIRARDOT', label: 'Girardot' },
  { value: 'ZIPAQUIRA', label: 'Zipaquirá' },
  { value: 'FACATATIVA', label: 'Facatativá' },
  { value: 'CHÍA', label: 'Chía' },
  { value: 'MOSQUERA', label: 'Mosquera' },
  { value: 'MADRID', label: 'Madrid' },
  { value: 'FUNZA', label: 'Funza' },
  { value: 'CAJICA', label: 'Cajicá' },
  
  // Atlántico
  { value: 'SOLEDAD', label: 'Soledad' },
  { value: 'MALAMBO', label: 'Malambo' },
  { value: 'SABANALARGA', label: 'Sabanalarga' },
  { value: 'PUERTO_COLOMBIA', label: 'Puerto Colombia' },
  
  // Santander
  { value: 'FLORIDABLANCA', label: 'Floridablanca' },
  { value: 'GIRON', label: 'Girón' },
  { value: 'PIEDECUESTA', label: 'Piedecuesta' },
  { value: 'BARRANCABERMEJA', label: 'Barrancabermeja' },
  { value: 'SAN_GIL', label: 'San Gil' },
  { value: 'BARBOSA', label: 'Barbosa' },
  
  // Bolívar
  { value: 'MAGANGUE', label: 'Magangué' },
  { value: 'TURBACO', label: 'Turbaco' },
  { value: 'ARJONA', label: 'Arjona' },
  
  // Risaralda
  { value: 'DOSQUEBRADAS', label: 'Dosquebradas' },
  { value: 'LA_VIRGINIA', label: 'La Virginia' },
  { value: 'SANTA_ROSA_DE_CABAL', label: 'Santa Rosa de Cabal' },
  
  // Tolima
  { value: 'ESPINAL', label: 'Espinal' },
  { value: 'MELGAR', label: 'Melgar' },
  { value: 'HONDA', label: 'Honda' },
  { value: 'CHAPARRAL', label: 'Chaparral' },
  
  // Norte de Santander
  { value: 'VILLA_DEL_ROSARIO', label: 'Villa del Rosario' },
  { value: 'LOS_PATIOS', label: 'Los Patios' },
  { value: 'OCAÑA', label: 'Ocaña' },
  
  // Caldas
  { value: 'VILLAMARIA', label: 'Villamaría' },
  { value: 'CHINCHINA', label: 'Chinchiná' },
  { value: 'LA_DORADA', label: 'La Dorada' },
  
  // Quindío
  { value: 'CALARCA', label: 'Calarcá' },
  { value: 'LA_TEBAIDA', label: 'La Tebaida' },
  { value: 'MONTENEGRO', label: 'Montenegro' },
  
  // Nariño
  { value: 'TUMACO', label: 'Tumaco' },
  { value: 'IPIALES', label: 'Ipiales' },
  
  // Huila
  { value: 'GARZON', label: 'Garzón' },
  { value: 'PITALITO', label: 'Pitalito' },
  
  // Meta
  { value: 'ACACIAS', label: 'Acacías' },
  { value: 'GRANADA', label: 'Granada' },
  
  // Córdoba
  { value: 'LORICA', label: 'Lorica' },
  { value: 'CERETE', label: 'Cereté' },
  { value: 'SAHAGUN', label: 'Sahagún' },
  
  // Sucre
  { value: 'COROZAL', label: 'Corozal' },
  
  // Cesar
  { value: 'AGUACHICA', label: 'Aguachica' },
  { value: 'BOSCONIA', label: 'Bosconia' },
  
  // Magdalena
  { value: 'CIENAGA', label: 'Ciénaga' },
  { value: 'FUNDACION', label: 'Fundación' },
  
  // La Guajira
  { value: 'MAICAO', label: 'Maicao' },
  
  // Boyacá
  { value: 'DUITAMA', label: 'Duitama' },
  { value: 'SOGAMOSO', label: 'Sogamoso' },
  { value: 'CHIQUINQUIRA', label: 'Chiquinquirá' },
  
  // Cauca
  { value: 'SANTANDER_DE_QUILICHAO', label: 'Santander de Quilichao' },
  
  // Casanare
  { value: 'AGUAZUL', label: 'Aguazul' },
  
  // Arauca
  { value: 'ARAUCA', label: 'Arauca' },
  
  // Putumayo
  { value: 'PUERTO_ASIS', label: 'Puerto Asís' },
  
  // Caquetá
  { value: 'SAN_VICENTE_DEL_CAGUAN', label: 'San Vicente del Caguán' },
  
  // Amazonas
  { value: 'PUERTO_NARIÑO', label: 'Puerto Nariño' },
  
  // Guainía
  { value: 'BARRANCO_MINAS', label: 'Barranco Minas' },
  
  // Guaviare
  { value: 'CALAMAR', label: 'Calamar' },
  
  // Vaupés
  { value: 'CARURU', label: 'Carurú' },
  
  // Vichada
  { value: 'LA_PRIMAVERA', label: 'La Primavera' }
].sort((a, b) => a.label.localeCompare(b.label));

// Helper function to get city label by value
export const getCityLabel = (cityValue: string): string => {
  const city = colombianCities.find(city => city.value === cityValue);
  return city ? city.label : cityValue;
};

// Mock authorization groups
const mockAuthorizationGroups: AuthorizationGroup[] = [
  {
    codigoUnico: 'AUTH-2024-001',
    fechaCreacion: new Date('2024-01-15'),
    estado: 'ACTIVO',
    observaciones: 'Grupo de autorizaciones para servicios básicos'
  },
  {
    codigoUnico: 'AUTH-2024-002',
    fechaCreacion: new Date('2024-02-01'),
    estado: 'ACTIVO',
    observaciones: 'Grupo de autorizaciones para servicios especiales'
  },
  {
    codigoUnico: 'AUTH-2024-003',
    fechaCreacion: new Date('2024-02-15'),
    estado: 'ACTIVO',
    observaciones: 'Grupo adicional de autorizaciones'
  },
  {
    codigoUnico: 'AUTH-2024-004',
    fechaCreacion: new Date('2024-03-01'),
    estado: 'ACTIVO',
    observaciones: 'Autorizaciones de marzo'
  },
  {
    codigoUnico: 'AUTH-2024-005',
    fechaCreacion: new Date('2024-03-15'),
    estado: 'ACTIVO',
    observaciones: 'Autorizaciones especiales'
  }
];

// Update mock data to reflect correct AUTH code grouping
const mockAuthorizations: Authorization[] = [
  {
    id: '1',
    codigoUnico: 'AUTH-2024-001',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL ANTIOQUIA',
    nombreCompleto: 'MARIA CARMEN JIMENEZ',
    identificacion: '43567890',
    volante: '26898465',
    mipres: '20240124126037795639',
    cantidadS: 30,
    sRestantes: 27,
    serviciosAutorizados: 'Transporte',
    fechaInicioVigencia: '2024-01-29',
    fechaFinVigencia: '2024-03-29',
    vigenciaStatus: 'VIGENTE',
    empresaPrestadorServicio: 'NUEVO RUMBO',
    ciudadA: 'MEDELLIN',
    ciudadB: 'BOGOTA'
  },
  {
    id: '2',
    codigoUnico: 'AUTH-2024-002',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL CENTRAL',
    nombreCompleto: 'JUAN CARLOS MARTINEZ',
    identificacion: '71234567',
    volante: '26898466',
    mipres: '20240124126037795640',
    cantidadS: 15,
    sRestantes: 12,
    serviciosAutorizados: 'Traslado',
    fechaInicioVigencia: '2024-02-01',
    fechaFinVigencia: '2024-02-29',
    vigenciaStatus: 'NO VIGENTE',
    empresaPrestadorServicio: 'RENETUR',
    ciudadA: 'BOGOTA',
    ciudadB: 'CALI'
  },
  {
    id: '3',
    codigoUnico: 'AUTH-2024-003',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL CENTRAL',
    nombreCompleto: 'ANA SOFIA RODRIGUEZ',
    identificacion: '52789123',
    volante: '26898467',
    mipres: '20240124126037795641',
    cantidadS: 20,
    sRestantes: 20,
    serviciosAutorizados: 'Transporte',
    fechaInicioVigencia: '2024-02-15',
    fechaFinVigencia: '2024-04-15',
    vigenciaStatus: 'VIGENTE',
    empresaPrestadorServicio: 'NUEVO RUMBO',
    ciudadA: 'CALI',
    ciudadB: 'BARRANQUILLA'
  },
  {
    id: '4',
    codigoUnico: 'AUTH-2024-004',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL ANTIOQUIA',
    nombreCompleto: 'CARLOS ANDRES LOPEZ',
    identificacion: '98456123',
    volante: '26898468',
    mipres: '20240124126037795642',
    cantidadS: 25,
    sRestantes: 20,
    serviciosAutorizados: 'Transporte',
    fechaInicioVigencia: '2024-03-01',
    fechaFinVigencia: '2024-05-01',
    vigenciaStatus: 'VIGENTE',
    empresaPrestadorServicio: 'RENETUR',
    ciudadA: 'BUCARAMANGA',
    ciudadB: 'CARTAGENA'
  },
  {
    id: '5',
    codigoUnico: 'AUTH-2024-005',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL CENTRAL',
    nombreCompleto: 'PATRICIA ELENA GOMEZ',
    identificacion: '43123789',
    volante: '26898469',
    mipres: '20240124126037795643',
    cantidadS: 40,
    sRestantes: 35,
    serviciosAutorizados: 'Transporte',
    fechaInicioVigencia: '2024-03-15',
    fechaFinVigencia: '2024-05-15',
    vigenciaStatus: 'VIGENTE',
    empresaPrestadorServicio: 'NUEVO RUMBO',
    ciudadA: 'PEREIRA',
    ciudadB: 'MANIZALES'
  }
];

// Update dummy data to include multiple authorization groups per user
const dummyUserManagementData: UserManagementSummary[] = [
  {
    id: '1',
    nombreCompleto: 'MARIA CARMEN JIMENEZ',
    identificacion: '43567890',
    celular: '3125222258',
    cliente: 'TUTELAS EPS',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL ANTIOQUIA',
    solicitaServicio: true,
    empresaPrestadorServicio: 'NUEVO RUMBO',
    authorizationGroups: [mockAuthorizationGroups[0], mockAuthorizationGroups[1]],
    codigoAutorizacion: 'AUTH-2024-001'
  },
  {
    id: '2',
    nombreCompleto: 'JUAN CARLOS MARTINEZ',
    identificacion: '71234567',
    celular: '3157894561',
    cliente: 'SERVICIOS MEDICOS',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL CENTRAL',
    solicitaServicio: true,
    empresaPrestadorServicio: 'RENETUR',
    authorizationGroups: [mockAuthorizationGroups[1]],
    codigoAutorizacion: 'AUTH-2024-002'
  },
  {
    id: '3',
    nombreCompleto: 'ANA SOFIA RODRIGUEZ',
    identificacion: '52789123',
    celular: '3209876543',
    cliente: 'TUTELAS EPS',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL CENTRAL',
    solicitaServicio: true,
    empresaPrestadorServicio: 'NUEVO RUMBO',
    authorizationGroups: [mockAuthorizationGroups[2]],
    codigoAutorizacion: 'AUTH-2024-003'
  },
  {
    id: '4',
    nombreCompleto: 'CARLOS ANDRES LOPEZ',
    identificacion: '98456123',
    celular: '3112345678',
    cliente: 'SERVICIOS MEDICOS',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL ANTIOQUIA',
    solicitaServicio: true,
    empresaPrestadorServicio: 'RENETUR',
    authorizationGroups: [mockAuthorizationGroups[3]],
    codigoAutorizacion: 'AUTH-2024-004'
  },
  {
    id: '5',
    nombreCompleto: 'PATRICIA ELENA GOMEZ',
    identificacion: '43123789',
    celular: '3145678901',
    cliente: 'TUTELAS EPS',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL CENTRAL',
    solicitaServicio: true,
    empresaPrestadorServicio: 'NUEVO RUMBO',
    authorizationGroups: [mockAuthorizationGroups[4]],
    codigoAutorizacion: 'AUTH-2024-005'
  }
];

// Update user details to include all users
const dummyUserDetails: Record<string, UserDetailInfo> = {
  '1': {
    id: '1',
    nombreCompleto: 'MARIA CARMEN JIMENEZ',
    identificacion: '43567890',
    celular: '3125222258',
    cliente: 'TUTELAS EPS',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL ANTIOQUIA',
    sRestantes: 27,
    vigenciaStatus: 'VIGENTE',
    empresaPrestadorServicio: 'NUEVO RUMBO',
    authorizationGroups: [mockAuthorizationGroups[0], mockAuthorizationGroups[1]]
  },
  '2': {
    id: '2',
    nombreCompleto: 'JUAN CARLOS MARTINEZ',
    identificacion: '71234567',
    celular: '3157894561',
    cliente: 'SERVICIOS MEDICOS',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL CENTRAL',
    sRestantes: 12,
    vigenciaStatus: 'NO VIGENTE',
    empresaPrestadorServicio: 'RENETUR',
    authorizationGroups: [mockAuthorizationGroups[1]]
  },
  '3': {
    id: '3',
    nombreCompleto: 'ANA SOFIA RODRIGUEZ',
    identificacion: '52789123',
    celular: '3209876543',
    cliente: 'TUTELAS EPS',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL CENTRAL',
    sRestantes: 20,
    vigenciaStatus: 'VIGENTE',
    empresaPrestadorServicio: 'NUEVO RUMBO',
    authorizationGroups: [mockAuthorizationGroups[2]]
  },
  '4': {
    id: '4',
    nombreCompleto: 'CARLOS ANDRES LOPEZ',
    identificacion: '98456123',
    celular: '3112345678',
    cliente: 'SERVICIOS MEDICOS',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL ANTIOQUIA',
    sRestantes: 20,
    vigenciaStatus: 'VIGENTE',
    empresaPrestadorServicio: 'RENETUR',
    authorizationGroups: [mockAuthorizationGroups[3]]
  },
  '5': {
    id: '5',
    nombreCompleto: 'PATRICIA ELENA GOMEZ',
    identificacion: '43123789',
    celular: '3145678901',
    cliente: 'TUTELAS EPS',
    dependencia: 'TRANSPORTE PACIENTES REGIONAL CENTRAL',
    sRestantes: 35,
    vigenciaStatus: 'VIGENTE',
    empresaPrestadorServicio: 'NUEVO RUMBO',
    authorizationGroups: [mockAuthorizationGroups[4]]
  }
};

// Update authorization details for all users
const dummyAuthorizationDetails: Record<string, UserAuthorizationDetail[]> = {
  '1': [
    {
      id: '1',
      codigoUnico: 'AUTH-2024-001',
      noMipres: '20240124126037795639',
      noVolante: '26898465',
      fechaInicioVigencia: new Date('2024-01-29'),
      fechaFinVigencia: new Date('2024-03-29'),
      numeroServiciosAutorizados: 30,
      esViaje: true,
      esTraslado: false,
      sRestante: 27,
      vigenciaStatus: 'VIGENTE',
      empresaPrestadorServicio: 'NUEVO RUMBO',
      ciudadA: 'MEDELLIN',
      ciudadB: 'BOGOTA'
    },
    {
      id: '1b',
      codigoUnico: 'AUTH-2024-001',
      noMipres: '20240124126037795650',
      noVolante: '26898475',
      fechaInicioVigencia: new Date('2024-02-01'),
      fechaFinVigencia: new Date('2024-04-01'),
      numeroServiciosAutorizados: 20,
      esViaje: false,
      esTraslado: true,
      sRestante: 18,
      vigenciaStatus: 'VIGENTE',
      empresaPrestadorServicio: 'NUEVO RUMBO',
      ciudadA: 'MEDELLIN',
      ciudadB: 'CALI'
    }
  ],
  '2': [{
    id: '2',
    codigoUnico: 'AUTH-2024-002',
    noMipres: '20240124126037795640',
    noVolante: '26898466',
    fechaInicioVigencia: new Date('2024-02-01'),
    fechaFinVigencia: new Date('2024-02-29'),
    numeroServiciosAutorizados: 15,
    esViaje: false,
    esTraslado: true,
    sRestante: 12,
    vigenciaStatus: 'NO VIGENTE',
    empresaPrestadorServicio: 'RENETUR',
    ciudadA: 'BOGOTA',
    ciudadB: 'CALI'
  }],
  '3': [{
    id: '3',
    codigoUnico: 'AUTH-2024-003',
    noMipres: '20240124126037795641',
    noVolante: '26898467',
    fechaInicioVigencia: new Date('2024-02-15'),
    fechaFinVigencia: new Date('2024-04-15'),
    numeroServiciosAutorizados: 20,
    esViaje: true,
    esTraslado: false,
    sRestante: 20,
    vigenciaStatus: 'VIGENTE',
    empresaPrestadorServicio: 'NUEVO RUMBO',
    ciudadA: 'CALI',
    ciudadB: 'BARRANQUILLA'
  }],
  '4': [{
    id: '4',
    codigoUnico: 'AUTH-2024-004',
    noMipres: '20240124126037795642',
    noVolante: '26898468',
    fechaInicioVigencia: new Date('2024-03-01'),
    fechaFinVigencia: new Date('2024-05-01'),
    numeroServiciosAutorizados: 25,
    esViaje: true,
    esTraslado: false,
    sRestante: 20,
    vigenciaStatus: 'VIGENTE',
    empresaPrestadorServicio: 'RENETUR',
    ciudadA: 'BUCARAMANGA',
    ciudadB: 'CARTAGENA'
  }],
  '5': [{
    id: '5',
    codigoUnico: 'AUTH-2024-005',
    noMipres: '20240124126037795643',
    noVolante: '26898469',
    fechaInicioVigencia: new Date('2024-03-15'),
    fechaFinVigencia: new Date('2024-05-15'),
    numeroServiciosAutorizados: 40,
    esViaje: true,
    esTraslado: false,
    sRestante: 35,
    vigenciaStatus: 'VIGENTE',
    empresaPrestadorServicio: 'NUEVO RUMBO',
    ciudadA: 'PEREIRA',
    ciudadB: 'MANIZALES'
  }]
};

// Fetch user management data
export const fetchUserManagementData = async (
  params: FetchUserManagementParams
): Promise<FetchResponse<UserManagementSummary>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredUsers = [...dummyUserManagementData];
  
  if (params.searchTerm) {
    const searchLower = params.searchTerm.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.nombreCompleto.toLowerCase().includes(searchLower) ||
      user.identificacion.toLowerCase().includes(searchLower) ||
      user.celular.toLowerCase().includes(searchLower) ||
      user.authorizationGroups.some(group => group.codigoUnico.toLowerCase().includes(searchLower))
    );
  }
  
  if (params.dependencyFilter) {
    filteredUsers = filteredUsers.filter(user => 
      user.dependencia === params.dependencyFilter
    );
  }

  if (params.empresaFilter) {
    filteredUsers = filteredUsers.filter(user => 
      user.empresaPrestadorServicio === params.empresaFilter
    );
  }
  
  if (params.sortKey && params.sortDirection) {
    filteredUsers.sort((a, b) => {
      const keyA = a[params.sortKey as keyof UserManagementSummary];
      const keyB = b[params.sortKey as keyof UserManagementSummary];
      
      if (typeof keyA === 'string' && typeof keyB === 'string') {
        return params.sortDirection === 'ascending' 
          ? keyA.localeCompare(keyB) 
          : keyB.localeCompare(keyA);
      }
      
      if (typeof keyA === 'boolean' && typeof keyB === 'boolean') {
        return params.sortDirection === 'ascending' 
          ? Number(keyA) - Number(keyB) 
          : Number(keyB) - Number(keyA);
      }
      
      return 0;
    });
  }
  
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  return {
    data: paginatedUsers,
    total: filteredUsers.length
  };
};

// Fetch user detail info
export const fetchUserDetailInfo = async (userId: string): Promise<UserDetailInfo | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return dummyUserDetails[userId] || null;
};

// Fetch user authorization details
export const fetchUserAuthorizationDetails = async (
  userId: string,
  params: FetchUserDetailParams
): Promise<FetchResponse<UserAuthorizationDetail>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let details = dummyAuthorizationDetails[userId] || [];
  
  if (params.searchTerm) {
    const searchLower = params.searchTerm.toLowerCase();
    details = details.filter(detail => 
      detail.noVolante.toLowerCase().includes(searchLower) ||
      detail.noMipres.toLowerCase().includes(searchLower)
    );
  }
  
  if (params.mipres) {
    details = details.filter(detail => 
      detail.noMipres.includes(params.mipres!)
    );
  }
  
  if (params.volante) {
    details = details.filter(detail => 
      detail.noVolante.includes(params.volante!)
    );
  }
  
  if (params.fechaInicio) {
    details = details.filter(detail => 
      new Date(detail.fechaInicioVigencia) >= new Date(params.fechaInicio!)
    );
  }
  
  if (params.fechaFin) {
    details = details.filter(detail => 
      new Date(detail.fechaFinVigencia) <= new Date(params.fechaFin!)
    );
  }
  
  if (params.sortKey && params.sortDirection) {
    details.sort((a, b) => {
      const keyA = a[params.sortKey as keyof UserAuthorizationDetail];
      const keyB = b[params.sortKey as keyof UserAuthorizationDetail];
      
      if (typeof keyA === 'string' && typeof keyB === 'string') {
        return params.sortDirection === 'ascending' 
          ? keyA.localeCompare(keyB) 
          : keyB.localeCompare(keyA);
      }
      
      if (typeof keyA === 'number' && typeof keyB === 'number') {
        return params.sortDirection === 'ascending'
          ? keyA - keyB
          : keyB - keyA;
      }
      
      return 0;
    });
  }
  
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const paginatedDetails = details.slice(startIndex, endIndex);
  
  return {
    data: paginatedDetails,
    total: details.length
  };
};

export const fetchAuthorizationsForUser = async (userId: string): Promise<UserAuthorizationDetail[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return dummyAuthorizationDetails[userId] || [];
};

export const saveAuthorizationDetail = async (authData: UserAuthorizationDetail): Promise<UserAuthorizationDetail> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return authData;
};

// Fetch authorization by ID
export const fetchAuthorizationById = async (authorizationId: string): Promise<Authorization | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockAuthorizations.find(auth => auth.id === authorizationId) || null;
};

// Fetch authorizations with filtering and pagination
export const fetchAuthorizations = async (
  params: FetchAuthorizationsParams
): Promise<FetchResponse<Authorization>> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredAuths = [...mockAuthorizations];
  
  // Apply filters
  if (params.searchTerm) {
    const searchLower = params.searchTerm.toLowerCase();
    filteredAuths = filteredAuths.filter(auth => 
      auth.codigoUnico.toLowerCase().includes(searchLower) ||
      auth.nombreCompleto.toLowerCase().includes(searchLower) ||
      auth.identificacion.toLowerCase().includes(searchLower) ||
      auth.volante.toLowerCase().includes(searchLower) ||
      auth.mipres.toLowerCase().includes(searchLower)
    );
  }
  
  if (params.fechaInicio) {
    filteredAuths = filteredAuths.filter(auth => 
      new Date(auth.fechaInicioVigencia) >= new Date(params.fechaInicio)
    );
  }
  
  if (params.fechaFin) {
    filteredAuths = filteredAuths.filter(auth => 
      new Date(auth.fechaFinVigencia) <= new Date(params.fechaFin)
    );
  }
  
  if (params.identificacion) {
    filteredAuths = filteredAuths.filter(auth => 
      auth.identificacion.includes(params.identificacion)
    );
  }
  
  if (params.noMipres) {
    filteredAuths = filteredAuths.filter(auth => 
      auth.mipres.includes(params.noMipres)
    );
  }
  
  if (params.noVolante) {
    filteredAuths = filteredAuths.filter(auth => 
      auth.volante.includes(params.noVolante)
    );
  }
  
  if (params.dependencia) {
    filteredAuths = filteredAuths.filter(auth => 
      auth.dependencia === params.dependencia
    );
  }
  
  if (params.vigencia && params.vigencia !== 'TODOS') {
    filteredAuths = filteredAuths.filter(auth => 
      auth.vigenciaStatus === params.vigencia
    );
  }
  
  // Apply sorting
  if (params.sortKey && params.sortDirection) {
    filteredAuths.sort((a, b) => {
      const keyA = a[params.sortKey as keyof Authorization];
      const keyB = b[params.sortKey as keyof Authorization];
      
      if (typeof keyA === 'string' && typeof keyB === 'string') {
        return params.sortDirection === 'ascending' 
          ? keyA.localeCompare(keyB) 
          : keyB.localeCompare(keyA);
      }
      
      if (typeof keyA === 'number' && typeof keyB === 'number') {
        return params.sortDirection === 'ascending'
          ? keyA - keyB
          : keyB - keyA;
      }
      
      return 0;
    });
  }
  
  // Apply pagination
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const paginatedAuths = filteredAuths.slice(startIndex, endIndex);
  
  return {
    data: paginatedAuths,
    total: filteredAuths.length
  };
};

// Mock API functions for tarifa management
export const lookupTarifas = async (searchTerm: string): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const mockTarifas = [
    'TARIFA BASICA',
    'TARIFA PREMIUM',
    'TARIFA ESPECIAL'
  ];
  return mockTarifas.filter(tarifa => 
    tarifa.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const addTarifa = async (tarifaName: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return tarifaName;
};