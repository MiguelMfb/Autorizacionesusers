import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle2, XCircle, Eye, ArrowUpDown } from 'lucide-react';
import Select from 'react-select';
import { UserListSummary, SortConfig, PaginationConfig, Option } from '../types';
import { fetchUserListSummaries, dependenciasList } from '../utils/api';

interface UserListViewProps {
  onNavigateToDetail: (identifier: string) => void;
}

const UserListView: React.FC<UserListViewProps> = ({ onNavigateToDetail }) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedDependenciaFilter, setSelectedDependenciaFilter] = useState<Option | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'ascending' });
  const [pagination, setPagination] = useState<PaginationConfig>({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  });
  const [users, setUsers] = useState<UserListSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Load users
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchUserListSummaries({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        searchTerm: debouncedSearchTerm,
        dependencyFilter: selectedDependenciaFilter?.value,
        sortKey: sortConfig.key,
        sortDirection: sortConfig.direction
      });

      setUsers(response.data);
      setPagination(prev => ({ ...prev, totalItems: response.total }));
    } catch (err) {
      setError('Error al cargar los datos de usuarios');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, debouncedSearchTerm, selectedDependenciaFilter, sortConfig]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle sorting
  const handleSort = (key: keyof UserListSummary) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending'
        ? 'descending'
        : 'ascending'
    }));
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

  // Handle filters
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadUsers();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDependenciaFilter(null);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    loadUsers();
  };

  // Calculate pagination info
  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage);
  const startItem = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  const endItem = Math.min(startItem + pagination.itemsPerPage - 1, pagination.totalItems);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Gestión de usuarios</h1>
      <h2 className="text-lg font-semibold text-green-600 mb-6">Lista</h2>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div>
            <Select
              value={selectedDependenciaFilter}
              onChange={setSelectedDependenciaFilter}
              options={dependenciasList}
              placeholder="Seleccionar dependencia..."
              isClearable
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
            >
              Limpiar
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'cliente', label: 'Cliente' },
                  { key: 'dependencia', label: 'Dependencia' },
                  { key: 'nombreCompleto', label: 'Nombre completo' },
                  { key: 'identificacion', label: 'Identificación' },
                  { key: 'codigoInternoAutorizacion', label: 'Codigo interno autorizacion' },
                  { key: 'celular', label: 'Celular' },
                  { key: 'solicitaServicio', label: '¿Solicita servicio?' },
                  { key: 'sRestantes', label: 'S Restantes' },
                  { key: 'vigenciaStatus', label: 'Vigencia' }
                ].map(column => (
                  <th
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort(column.key as keyof UserListSummary)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      <ArrowUpDown size={16} className="ml-1" />
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
                  <td colSpan={10} className="px-6 py-4 text-center">
                    Cargando datos de usuarios...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{user.cliente}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.dependencia}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.nombreCompleto}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.identificacion}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.codigoInternoAutorizacion}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.celular}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {user.solicitaServicio && (
                        <CheckCircle2 className="text-green-500 inline-block" size={20} />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{user.sRestantes}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.vigenciaStatus === 'VIGENTE' ? (
                          <>
                            <CheckCircle2 className="text-green-500 mr-2" size={20} />
                            <span className="text-green-500">VIGENTE</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="text-red-500 mr-2" size={20} />
                            <span className="text-red-500">NO VIGENTE</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => onNavigateToDetail(user.codigoInternoAutorizacion)}
                        className="text-green-500 hover:text-green-700"
                      >
                        <Eye size={20} />
                      </button>
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
              Mostrando {users.length > 0 ? startItem : 0} a {endItem} de {pagination.totalItems} registros
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
                    className={`w-8 h-8 ${
                      pagination.currentPage === pageNum
                        ? 'bg-green-100 text-green-700 border-green-500'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    } rounded-md`}
                  >
                    {pageNum}
                  </button>
                );
              })}

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
  );
};

export default UserListView;