import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Search, Filter, X, Download } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { UserDetailInfo, UserAuthorizationDetail, FetchUserDetailParams } from '../types';
import { fetchUserDetailInfo, fetchUserAuthorizationDetails } from '../utils/api';
import CertificateModal from './CertificateModal';
import "react-datepicker/dist/react-datepicker.css";

interface UserDetailViewProps {
  userId: string;
  onNavigateBack: () => void;
}

const UserDetailView: React.FC<UserDetailViewProps> = ({
  userId,
  onNavigateBack
}) => {
  // State
  const [userInfo, setUserInfo] = useState<UserDetailInfo | null>(null);
  const [authorizations, setAuthorizations] = useState<UserAuthorizationDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAuthorizations, setIsLoadingAuthorizations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [mipresFilter, setMipresFilter] = useState('');
  const [volanteFilter, setVolanteFilter] = useState('');
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });
  
  // Modal state
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  
  // Load user info
  useEffect(() => {
    const loadUserInfo = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const info = await fetchUserDetailInfo(userId);
        if (info) {
          setUserInfo(info);
        } else {
          setError('Usuario no encontrado');
        }
      } catch (err) {
        setError('Error al cargar la información del usuario');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserInfo();
  }, [userId]);
  
  // Load authorizations
  const loadAuthorizations = useCallback(async () => {
    setIsLoadingAuthorizations(true);
    
    const params: FetchUserDetailParams = {
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      searchTerm,
      mipres: mipresFilter,
      volante: volanteFilter,
      fechaInicio: fechaInicio?.toISOString(),
      fechaFin: fechaFin?.toISOString()
    };
    
    try {
      const response = await fetchUserAuthorizationDetails(userId, params);
      setAuthorizations(response.data);
      setPagination(prev => ({ ...prev, totalItems: response.total }));
    } catch (err) {
      console.error('Error loading authorizations:', err);
    } finally {
      setIsLoadingAuthorizations(false);
    }
  }, [userId, pagination.currentPage, pagination.itemsPerPage, searchTerm, mipresFilter, volanteFilter, fechaInicio, fechaFin]);
  
  useEffect(() => {
    if (userInfo) {
      loadAuthorizations();
    }
  }, [userInfo, loadAuthorizations]);
  
  // Handle search
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadAuthorizations();
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setMipresFilter('');
    setVolanteFilter('');
    setFechaInicio(null);
    setFechaFin(null);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  
  // Handle pagination
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
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Cargando información del usuario...</span>
        </div>
      </div>
    );
  }
  
  if (error || !userInfo) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-red-600">
          {error || 'No se encontró el usuario'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onNavigateBack}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Detalle del usuario
          </h1>
        </div>
        <button
          onClick={() => setIsCertificateModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <Download size={18} className="mr-2" />
          Generar certificado
        </button>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-green-600 mb-4">
          Información del usuario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-800">{userInfo.nombreCompleto}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identificación
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-800">{userInfo.identificacion}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Celular
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-800">{userInfo.celular}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-800">{userInfo.cliente}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dependencia
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-800">{userInfo.dependencia}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servicios restantes
            </label>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <span className="font-medium text-blue-800">{userInfo.sRestantes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-green-600 flex items-center">
            <Filter size={20} className="mr-2" />
            Filtros
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Buscar en autorizaciones..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. MiPres
              </label>
              <input
                type="text"
                value={mipresFilter}
                onChange={(e) => setMipresFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Filtrar por MiPres..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Volante
              </label>
              <input
                type="text"
                value={volanteFilter}
                onChange={(e) => setVolanteFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Filtrar por volante..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha inicio
              </label>
              <DatePicker
                selected={fechaInicio}
                onChange={date => setFechaInicio(date)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccionar fecha..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha fin
              </label>
              <DatePicker
                selected={fechaFin}
                onChange={date => setFechaFin(date)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccionar fecha..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm flex items-center"
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
      </div>

      {/* Authorizations Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-green-600">
            Histórico de autorizaciones
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código Único
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. MiPres
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. Volante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha inicio vigencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha fin vigencia
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servicios autorizados
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ¿Es viaje?
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ¿Es traslado?
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S. Restante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoadingAuthorizations ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center">
                    Cargando autorizaciones...
                  </td>
                </tr>
              ) : authorizations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron autorizaciones
                  </td>
                </tr>
              ) : (
                authorizations.map((auth) => (
                  <tr key={auth.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                      {auth.codigoUnico}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{auth.noMipres}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{auth.noVolante}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(auth.fechaInicioVigencia)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(auth.fechaFinVigencia)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {auth.numeroServiciosAutorizados}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {auth.esViaje ? 'Sí' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {auth.esTraslado ? 'Sí' : 'No'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {auth.sRestante}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        auth.vigenciaStatus === 'VIGENTE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {auth.vigenciaStatus}
                      </span>
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

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateModalOpen}
        onClose={() => setIsCertificateModalOpen(false)}
        authorizations={authorizations}
      />
    </div>
  );
};

export default UserDetailView;