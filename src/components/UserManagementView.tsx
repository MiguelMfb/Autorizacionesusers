import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle2, Plus, Eye, Edit2, Trash2, ArrowUpDown, Filter, FileSpreadsheet, Download } from 'lucide-react';
import { Menu } from '@headlessui/react';
import Select from 'react-select';
import { UserManagementSummary, SortConfig, PaginationConfig, Option } from '../types';
import { fetchUserManagementData, dependenciasList } from '../utils/api';
import EditUserModal from './EditUserModal';

interface UserManagementViewProps {
  onNavigateToDetail: (identifier: string) => void;
}

const UserManagementView: React.FC<UserManagementViewProps> = ({
  onNavigateToDetail
}) => {
  // Main state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDependenciaFilter, setSelectedDependenciaFilter] = useState<Option | null>(null);
  const [identificacionFilter, setIdentificacionFilter] = useState('');
  const [dependenciaFilter, setDependenciaFilter] = useState<Option | null>(null);
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'ascending' });
  const [pagination, setPagination] = useState<PaginationConfig>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });
  
  const [users, setUsers] = useState<UserManagementSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserManagementSummary | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Filter panel state
  const [showFilters, setShowFilters] = useState(true);
  
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchUserManagementData({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        searchTerm,
        dependencyFilter: selectedDependenciaFilter?.value,
        sortKey: sortConfig.key,
        sortDirection: sortConfig.direction
      });
      
      let filteredUsers = response.data;
      
      // Apply additional filters
      if (identificacionFilter) {
        filteredUsers = filteredUsers.filter(user => 
          user.identificacion.toLowerCase().includes(identificacionFilter.toLowerCase())
        );
      }
      
      if (dependenciaFilter) {
        filteredUsers = filteredUsers.filter(user => 
          user.dependencia === dependenciaFilter.value
        );
      }
      
      setUsers(filteredUsers);
      setPagination(prev => ({ ...prev, totalItems: filteredUsers.length }));
    } catch (err) {
      setError('Error al cargar los datos de usuarios');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    searchTerm,
    selectedDependenciaFilter,
    identificacionFilter,
    dependenciaFilter,
    sortConfig
  ]);
  
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  
  const handleSort = (key: keyof UserManagementSummary) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending'
        ? 'descending'
        : 'ascending'
    }));
  };
  
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadUsers();
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDependenciaFilter(null);
    setIdentificacionFilter('');
    setDependenciaFilter(null);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  
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
  
  // Modal handlers
  const handleOpenEditModal = (user: UserManagementSummary) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };
  
  const handleSaveUser = (updatedUser: UserManagementSummary) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    handleCloseEditModal();
  };
  
  const handleDeleteConfirmation = (userId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    }
  };

  const handleCreateUser = () => {
    // Implement create user logic
    console.log('Create user clicked');
  };

  const handleCreateMassively = () => {
    // Implement create massively logic
    console.log('Create massively clicked');
  };

  const handleExportExcel = () => {
    // Implement Excel export logic
    console.log('Export to Excel clicked');
  };

  const handleExportCSV = () => {
    // Implement CSV export logic
    console.log('Export to CSV clicked');
  };
  
  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
  const startItem = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  const endItem = Math.min(startItem + pagination.itemsPerPage - 1, pagination.totalItems);
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de usuarios</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button 
            onClick={handleCreateMassively}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center text-sm font-medium"
          >
            <Plus size={18} className="mr-2" />
            Crear masivamente
          </button>
          <button 
            onClick={handleCreateUser}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center text-sm font-medium"
          >
            <Plus size={18} className="mr-2" />
            Crear usuario
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-green-600 flex items-center">
              <Filter size={20} className="mr-2" />
              Filtros
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showFilters ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {/* Caja de texto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caja de texto
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              
              {/* Dependencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dependencia
                </label>
                <Select
                  value={dependenciaFilter}
                  onChange={setDependenciaFilter}
                  options={dependenciasList}
                  placeholder="Seleccionar dependencia..."
                  isClearable
                  className="text-sm"
                />
              </div>

              {/* Identificación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identificación
                </label>
                <input
                  type="text"
                  placeholder="Número de identificación..."
                  value={identificacionFilter}
                  onChange={(e) => setIdentificacionFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
              >
                Limpiar
              </button>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center"
              >
                <Search size={16} className="mr-2" />
                Buscar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-green-600">
              Tabla datos
              <span className="text-sm text-gray-500 ml-2">
                (Pintar una tabla con los datos de los usuarios app cliente, debe tener:)
              </span>
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Mostrando {users.length > 0 ? startItem : 0} a {endItem} de {pagination.totalItems} registros
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportExcel}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
                  title="Exportar a Excel"
                >
                  <FileSpreadsheet size={20} />
                </button>
                <button
                  onClick={handleExportCSV}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                  title="Exportar a CSV"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'nombreCompleto', label: 'Nombre' },
                  { key: 'identificacion', label: 'Identificación' },
                  { key: 'celular', label: 'Celular' },
                  { key: 'cliente', label: 'Cliente' },
                  { key: 'dependencia', label: 'Dependencia' },
                  { key: 'solicitaServicio', label: 'Solicita Servicio?' }
                ].map(column => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap hover:bg-gray-100"
                    onClick={() => handleSort(column.key as keyof UserManagementSummary)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      <ArrowUpDown size={14} className="ml-1 opacity-50" />
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                      <span className="ml-2 text-gray-600">Cargando datos de usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron usuarios que coincidan con los criterios de búsqueda
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{user.nombreCompleto}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {user.identificacion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {user.celular}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {user.cliente}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      <div className="max-w-xs truncate" title={user.dependencia}>
                        {user.dependencia}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {user.solicitaServicio ? (
                        <CheckCircle2 className="text-green-500 inline-block" size={20} />
                      ) : (
                        <span className="text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="text-gray-500 hover:text-gray-700 focus:outline-none p-2 rounded-full hover:bg-gray-100">
                          <ArrowUpDown size={18} />
                        </Menu.Button>
                        
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => onNavigateToDetail(user.id)}
                                  className={`${
                                    active ? 'bg-gray-100' : ''
                                  } flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                                >
                                  <Eye size={16} className="mr-3" />
                                  Detalle
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleOpenEditModal(user)}
                                  className={`${
                                    active ? 'bg-gray-100' : ''
                                  } flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                                >
                                  <Edit2 size={16} className="mr-3" />
                                  Editar
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDeleteConfirmation(user.id)}
                                  className={`${
                                    active ? 'bg-gray-100' : ''
                                  } flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100`}
                                >
                                  <Trash2 size={16} className="mr-3" />
                                  Eliminar
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
        <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 bg-gray-50">
          <div className="mb-4 sm:mb-0">
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{users.length > 0 ? startItem : 0}</span> a{' '}
              <span className="font-medium">{endItem}</span> de{' '}
              <span className="font-medium">{pagination.totalItems}</span> registros
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
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                {'<<'}
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                {'<'}
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 ${
                      pagination.currentPage === pageNum
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    } rounded-md font-medium`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                {'>'}
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={pagination.currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                {'>>'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {isEditModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          userData={selectedUser}
          onSave={handleSaveUser}
          onDelete={handleDeleteConfirmation}
        />
      )}

    </div>
  );
};

export default UserManagementView;