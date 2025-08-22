import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Menu } from '@headlessui/react';
import {
  Search,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Plus,
  Download,
  X,
  MoreVertical,
  Eye,
  Edit,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Authorization, FetchAuthorizationsParams, Option } from '../types';
import { fetchAuthorizations, dependenciasList, getCityLabel, empresaOptions } from '../utils/api';
import CreateAuthorizationModal from './CreateAuthorizationModal';
import AuthorizationDetailView from './AuthorizationDetailView';
import CancelCodeModal from './CancelCodeModal';
import EditCodesModal from './EditCodesModal';
import "react-datepicker/dist/react-datepicker.css";

const vigenciaOptions: Option[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'VIGENTE', label: 'Vigente' },
  { value: 'NO VIGENTE', label: 'No Vigente' }
];

const AuthorizationManagementView: React.FC = () => {
  // View state
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedAuthorizationId, setSelectedAuthorizationId] = useState<string | null>(null);
  
  // Add state for create modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Management tab states - Updated according to image
  const [fechaInicioVigencia, setFechaInicioVigencia] = useState<Date | null>(null);
  const [fechaFinVigencia, setFechaFinVigencia] = useState<Date | null>(null);
  const [identificacion, setIdentificacion] = useState('');
  const [noMipres, setNoMipres] = useState('');
  const [noVolante, setNoVolante] = useState('');
  const [codigoUnico, setCodigoUnico] = useState('');
  const [estadoVigencia, setEstadoVigencia] = useState<Option>(vigenciaOptions[0]);
  const [dependencia, setDependencia] = useState<Option | null>(null);
  const [empresaPrestadora, setEmpresaPrestadora] = useState<Option | null>(null);
  
  // Common states
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });
  const [authorizations, setAuthorizations] = useState<Authorization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Certificate functionality states
  const [selectedAuthorizations, setSelectedAuthorizations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Cancel code modal state
  const [selectedAuthForCancel, setSelectedAuthForCancel] = useState<Authorization | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Edit code modal state
  const [selectedAuthForEdit, setSelectedAuthForEdit] = useState<Authorization | null>(null);
  const [isEditCodesModalOpen, setIsEditCodesModalOpen] = useState(false);

  // Available unique codes options
  const availableCodes = useMemo(() => {
    const codesByUser: Record<string, Option[]> = {};
    authorizations.forEach(auth => {
      const id = auth.identificacion;
      if (!codesByUser[id]) {
        codesByUser[id] = [];
      }
      if (!codesByUser[id].some(opt => opt.value === auth.codigoUnico)) {
        codesByUser[id].push({ value: auth.codigoUnico, label: auth.codigoUnico });
      }
    });
    return codesByUser;
  }, [authorizations]);
  
  // Load authorizations
  const loadAuthorizations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const params: FetchAuthorizationsParams = {
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      sortKey: sortConfig.key,
      sortDirection: sortConfig.direction,
      fechaInicio: fechaInicioVigencia?.toISOString(),
      fechaFin: fechaFinVigencia?.toISOString(),
      identificacion: identificacion,
      noMipres: noMipres,
      noVolante: noVolante,
      codigoUnico: codigoUnico,
      dependencia: dependencia?.value,
      vigencia: estadoVigencia.value as 'TODOS' | 'VIGENTE' | 'NO VIGENTE'
    };
    
    try {
      const response = await fetchAuthorizations(params);
      
      let filteredData = response.data;
      if (empresaPrestadora?.value) {
        filteredData = response.data.filter(auth => 
          auth.empresaPrestadorServicio === empresaPrestadora.value
        );
      }
      
      setAuthorizations(filteredData);
      setPagination(prev => ({ 
        ...prev, 
        totalItems: empresaPrestadora?.value ? filteredData.length : response.total 
      }));
    } catch (err) {
      setError('Error al cargar los datos de autorizaciones');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    sortConfig,
    fechaInicioVigencia,
    fechaFinVigencia,
    identificacion,
    noMipres,
    noVolante,
    codigoUnico,
    estadoVigencia,
    dependencia,
    empresaPrestadora
  ]);
  
  useEffect(() => {
    if (currentView === 'list') {
      loadAuthorizations();
    }
  }, [loadAuthorizations, currentView]);

  // Reset pagination when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setSelectedAuthorizations([]);
  }, [fechaInicioVigencia, fechaFinVigencia, identificacion, noMipres, noVolante, codigoUnico, estadoVigencia, dependencia, empresaPrestadora]);
  
  // Handle sorting
  const handleSort = (key: keyof Authorization) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending'
        ? 'descending'
        : 'ascending'
    }));
  };
  
  // Handle filter reset
  const handleResetFilters = () => {
    setFechaInicioVigencia(null);
    setFechaFinVigencia(null);
    setIdentificacion('');
    setNoMipres('');
    setEstadoVigencia(vigenciaOptions[0]);
    setDependencia(null);
    setNoVolante('');
    setCodigoUnico('');
    setEmpresaPrestadora(null);
    setSelectedAuthorizations([]);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  
  // Handle search
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setSelectedAuthorizations([]);
    loadAuthorizations();
  };
  
  // Certificate selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAuthorizations(authorizations.map(auth => auth.id));
    } else {
      setSelectedAuthorizations([]);
    }
  };

  const handleSelectAuthorization = (authId: string) => {
    setSelectedAuthorizations(prev => {
      if (prev.includes(authId)) {
        return prev.filter(id => id !== authId);
      } else {
        return [...prev, authId];
      }
    });
  };

  // Handle certificate generation
  const handleGenerateCertificates = async () => {
    if (selectedAuthorizations.length === 0) {
      alert('Por favor seleccione al menos una autorización para generar el certificado');
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedData = authorizations.filter(auth => 
        selectedAuthorizations.includes(auth.id)
      );
      
      console.log('Generating certificates for:', selectedData);
      
      // Simulate file download
      const blob = new Blob(['Certificate content'], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificados_autorizacion_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert(`Certificado generado exitosamente para ${selectedAuthorizations.length} autorización(es)`);
      setSelectedAuthorizations([]);
    } catch (error) {
      console.error('Error generating certificates:', error);
      alert('Error al generar los certificados');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle single certificate download for an authorization
  const handleDownloadCertificate = async (authorization: Authorization) => {
    setIsGenerating(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate file download for the specific authorization
      const blob = new Blob(['Certificate content'], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado_autorizacion_${authorization.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating certificate:', error);
      alert('Error al generar el certificado');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle authorization detail view
  const handleViewAuthorizationDetail = (authorizationId: string) => {
    setSelectedAuthorizationId(authorizationId);
    setCurrentView('detail');
  };

  const handleEditAuthorization = (authorization: Authorization) => {
    setSelectedAuthForEdit(authorization);
    setIsEditCodesModalOpen(true);
  };

  const handleSaveCodeEdit = (data: { codigoUnico: string; empresaPrestadorServicio: string; serviciosAutorizados?: string }) => {
    if (!selectedAuthForEdit) return;
    setAuthorizations(prev =>
      prev.map(a =>
        a.id === selectedAuthForEdit.id ? { ...a, ...data } : a
      )
    );
    setIsEditCodesModalOpen(false);
    setSelectedAuthForEdit(null);
  };

  const handleCancelAuthorizationClick = (auth: Authorization) => {
    setSelectedAuthForCancel(auth);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (selectedAuthForCancel) {
      setAuthorizations(prev => prev.filter(a => a.id !== selectedAuthForCancel.id));
      setSelectedAuthForCancel(null);
      setIsCancelModalOpen(false);
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedAuthorizationId(null);
  };
  
  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };
  
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPagination({
      currentPage: 1,
      itemsPerPage: parseInt(e.target.value, 10),
      totalItems: pagination.totalItems
    });
  };
  
  // Calculate pagination info
  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
  const startItem = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  const endItem = Math.min(startItem + pagination.itemsPerPage - 1, pagination.totalItems);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Data export helpers
  const exportData = (delimiter: string, fileExtension: string) => {
    const headers = [
      'Código único',
      'Nombre',
      'Identificación',
      'Volante',
      'Mipres',
      'Ciudad A',
      'Ciudad B',
      'Cantidad servicios autorizados',
      'Cantidad servicios restantes',
      'Fecha inicio vigencia',
      'Fecha fin vigencia',
      'Dependencia',
      'Estado vigencia',
      'Empresa Prestadora'
    ];

    const rows = authorizations.map(auth => [
      auth.codigoUnico,
      auth.nombreCompleto,
      auth.identificacion,
      auth.volante,
      auth.mipres,
      getCityLabel(auth.ciudadA),
      getCityLabel(auth.ciudadB),
      auth.cantidadS.toString(),
      auth.sRestantes.toString(),
      formatDate(auth.fechaInicioVigencia),
      formatDate(auth.fechaFinVigencia),
      auth.dependencia,
      auth.vigenciaStatus,
      auth.empresaPrestadorServicio
    ]);

    const content = [headers.join(delimiter), ...rows.map(r => r.join(delimiter))].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autorizaciones_${new Date().toISOString().split('T')[0]}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExportExcel = () => exportData(',', 'csv');

  const handleExportPlainFile = () => exportData('|', 'txt');

  // Render detail view
  if (currentView === 'detail' && selectedAuthorizationId) {
    return (
      <AuthorizationDetailView
        authorizationId={selectedAuthorizationId}
        onNavigateBack={handleBackToList}
      />
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          Gestión de autorizaciones
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center text-sm">
            <Plus size={18} className="mr-2" />
            Crear masivamente
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center text-sm"
          >
            <Plus size={18} className="mr-2" />
            Crear autorización
          </button>
        </div>
      </div>
      
      {/* Filters Section */}
      <h2 className="text-base font-semibold text-green-600 mb-4">
        Filtros
      </h2>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha inicio vigencia
            </label>
            <DatePicker
              selected={fechaInicioVigencia}
              onChange={date => setFechaInicioVigencia(date)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              dateFormat="dd/MM/yyyy"
              placeholderText="Seleccionar fecha..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha fin vigencia
            </label>
            <DatePicker
              selected={fechaFinVigencia}
              onChange={date => setFechaFinVigencia(date)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              dateFormat="dd/MM/yyyy"
              placeholderText="Seleccionar fecha..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identificación
            </label>
            <input
              type="text"
              value={identificacion}
              onChange={e => setIdentificacion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholder="Ingrese identificación..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Mipres
            </label>
            <input
              type="text"
              value={noMipres}
              onChange={e => setNoMipres(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholder="Ingrese No. Mipres..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Volante
            </label>
            <input
              type="text"
              value={noVolante}
              onChange={e => setNoVolante(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholder="Ingrese No. Volante..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código único
            </label>
            <input
              type="text"
              value={codigoUnico}
              onChange={e => setCodigoUnico(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholder="Ingrese código único..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado vigencia
            </label>
            <Select
              value={estadoVigencia}
              onChange={option => setEstadoVigencia(option as Option)}
              options={vigenciaOptions}
              className="text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dependencia
            </label>
            <Select
              value={dependencia}
              onChange={option => setDependencia(option)}
              options={dependenciasList}
              className="text-sm"
              isClearable
              placeholder="Seleccionar dependencia..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa Prestadora
            </label>
            <Select
              value={empresaPrestadora}
              onChange={option => setEmpresaPrestadora(option)}
              options={empresaOptions}
              className="text-sm"
              isClearable
              placeholder="Seleccionar empresa..."
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 text-sm flex items-center"
          >
            <X size={16} className="mr-2" />
            Limpiar
          </button>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center"
          >
            <Search size={16} className="mr-2" />
            Buscar
          </button>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="mt-4 flex justify-end gap-3">
        <button
          onClick={handleExportExcel}
          className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          title="Exportar a Excel"
        >
          <FileSpreadsheet size={18} />
        </button>
        <button
          onClick={handleExportPlainFile}
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          title="Exportar archivo plano"
        >
          <FileText size={18} />
        </button>
      </div>

      {/* Table Section */}
      <div className="mt-6">
        {error && (
          <div className="mb-4 px-4 py-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-base font-semibold text-green-600">
                Tabla datos
              </h2>
              <div className="flex items-center gap-4">
                {selectedAuthorizations.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {selectedAuthorizations.length} seleccionada(s)
                  </span>
                )}
                <button
                  onClick={handleGenerateCertificates}
                  disabled={selectedAuthorizations.length === 0 || isGenerating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                >
                  <Download size={16} className="mr-2" />
                  {isGenerating ? 'Generando...' : 'Descargar Certificado(s) Seleccionado(s)'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={authorizations.length > 0 && selectedAuthorizations.length === authorizations.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('codigoUnico')}
                  >
                    <div className="flex items-center">
                      Código único
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('nombreCompleto')}
                  >
                    <div className="flex items-center">
                      Nombre
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('identificacion')}
                  >
                    <div className="flex items-center">
                      Identificación
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('volante')}
                  >
                    <div className="flex items-center">
                      Volante
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('mipres')}
                  >
                    <div className="flex items-center">
                      Mipres
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('ciudadA')}
                  >
                    <div className="flex items-center">
                      Ciudad A
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('ciudadB')}
                  >
                    <div className="flex items-center">
                      Ciudad B
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('cantidadS')}
                  >
                    <div className="flex items-center justify-center">
                      Cantidad servicios autorizados
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('sRestantes')}
                  >
                    <div className="flex items-center justify-center">
                      Cantidad servicios restantes
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('fechaInicioVigencia')}
                  >
                    <div className="flex items-center">
                      Fecha inicio vigencia
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('fechaFinVigencia')}
                  >
                    <div className="flex items-center">
                      Fecha fin vigencia
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('dependencia')}
                  >
                    <div className="flex items-center">
                      Dependencia
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort('vigenciaStatus')}
                  >
                    <div className="flex items-center">
                      Estado vigencia
                      <ArrowUpDown size={16} className="ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={16} className="px-6 py-4 text-center">
                      Cargando datos...
                    </td>
                  </tr>
                ) : authorizations.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="px-6 py-4 text-center text-gray-500">
                      No se encontraron autorizaciones
                    </td>
                  </tr>
                ) : (
                  authorizations.map(auth => (
                    <tr key={auth.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedAuthorizations.includes(auth.id)}
                          onChange={() => handleSelectAuthorization(auth.id)}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{auth.codigoUnico}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{auth.nombreCompleto}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{auth.identificacion}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{auth.volante}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{auth.mipres}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getCityLabel(auth.ciudadA)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getCityLabel(auth.ciudadB)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">{auth.cantidadS}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">{auth.sRestantes}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(auth.fechaInicioVigencia)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(auth.fechaFinVigencia)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-xs truncate" title={auth.dependencia}>
                          {auth.dependencia}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {auth.vigenciaStatus === 'VIGENTE' ? (
                            <>
                              <CheckCircle2 className="text-green-500 mr-2" size={18} />
                              <span className="text-green-500">VIGENTE</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="text-red-500 mr-2" size={18} />
                              <span className="text-red-500">NO VIGENTE</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Menu as="div" className="relative inline-block text-left">
                          <Menu.Button className="text-gray-500 hover:text-gray-700 focus:outline-none p-2 rounded-full hover:bg-gray-100">
                            <MoreVertical size={18} />
                          </Menu.Button>
                          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleViewAuthorizationDetail(auth.id)}
                                    className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                                  >
                                    <Eye size={16} className="mr-3" />
                                    Ver detalle
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleEditAuthorization(auth)}
                                    className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                                  >
                                    <Edit size={16} className="mr-3" />
                                    Editar
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleDownloadCertificate(auth)}
                                    className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                                  >
                                    <Download size={16} className="mr-3" />
                                    Descargar certificado
                                  </button>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={() => handleCancelAuthorizationClick(auth)}
                                    className={`${active ? 'bg-gray-100' : ''} flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100`}
                                  >
                                    <XCircle size={16} className="mr-3" />
                                    Anular código
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Menu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-t">
            <div className="mb-4 sm:mb-0">
              <p className="text-sm text-gray-700">
                Mostrando {authorizations.length > 0 ? startItem : 0} a {endItem} de {pagination.totalItems} registros
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center mr-4">
                <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-700">
                  Mostrar:
                </label>
                <select
                  id="itemsPerPage"
                  value={pagination.itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                  className="p-1 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  {'<<'}
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="p-1 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  {'<'}
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 ||
                    page === totalPages ||
                    (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
                  )
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 ${
                        pagination.currentPage === page
                          ? 'bg-green-100 text-green-700 border-green-500'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                      } rounded-md`}
                    >
                      {page}
                    </button>
                  ))}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === totalPages}
                  className="p-1 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  {'>'}
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={pagination.currentPage === totalPages}
                  className="p-1 border border-gray-300 rounded-md disabled:opacity-50"
                >
                  {'>>'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add the CreateAuthorizationModal */}
      <CreateAuthorizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedAuthForCancel && (
        <CancelCodeModal
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setSelectedAuthForCancel(null);
          }}
          onConfirm={handleConfirmCancel}
          authorization={selectedAuthForCancel}
        />
      )}

      {selectedAuthForEdit && (
        <EditCodesModal
          isOpen={isEditCodesModalOpen}
          onClose={() => {
            setIsEditCodesModalOpen(false);
            setSelectedAuthForEdit(null);
          }}
          authorization={selectedAuthForEdit}
          availableCodes={availableCodes[selectedAuthForEdit.identificacion] || []}
          onSave={handleSaveCodeEdit}
        />
      )}
    </div>
  );
};

export default AuthorizationManagementView;
