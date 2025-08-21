import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, X, Edit, Trash2, Download, Plus, Filter, MoreVertical } from 'lucide-react';
import { Menu, Dialog } from '@headlessui/react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { Authorization, UserAuthorizationDetail, Option } from '../types';
import { fetchAuthorizationById, fetchAuthorizationsForUser, colombianCities, empresaOptions } from '../utils/api';
import CreateAuthorizationModal from './CreateAuthorizationModal';
import "react-datepicker/dist/react-datepicker.css";

interface AuthorizationDetailViewProps {
  authorizationId: string;
  onNavigateBack: () => void;
}

// Edit Authorization Modal Component
interface EditAuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorization: UserAuthorizationDetail;
  onSave: (updatedAuth: UserAuthorizationDetail) => void;
}

const EditAuthorizationModal: React.FC<EditAuthorizationModalProps> = ({
  isOpen,
  onClose,
  authorization,
  onSave
}) => {
  const [formData, setFormData] = useState<UserAuthorizationDetail>({ ...authorization });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({ ...authorization });
  }, [authorization]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
      // Clear rangoKmAutorizados when esKm is unchecked
      ...(name === 'esKm' && !checked ? { rangoKmAutorizados: '' } : {})
    }));

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (date: Date | null, field: string) => {
    if (!date) return;
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSelectChange = (option: Option | null, field: string) => {
    if (!option) return;
    setFormData(prev => ({
      ...prev,
      [field]: option.value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.noMipres) {
      newErrors['noMipres'] = 'El número MiPres es requerido';
    }

    if (!formData.noVolante) {
      newErrors['noVolante'] = 'El número de volante es requerido';
    }

    if (!formData.ciudadA || !formData.ciudadB) {
      newErrors['cities'] = 'Debe seleccionar tanto Ciudad A como Ciudad B';
    }

    if (formData.ciudadA === formData.ciudadB) {
      newErrors['cities'] = 'Ciudad A y Ciudad B deben ser diferentes';
    }

    if (formData.numeroServiciosAutorizados <= 0) {
      newErrors['numeroServiciosAutorizados'] = 'El número de servicios debe ser mayor a 0';
    }

    if (formData.fechaInicioVigencia >= formData.fechaFinVigencia) {
      newErrors['fechas'] = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    onSave(formData);
    onClose();
  };

  // Check if this authorization has KM range (we'll determine this from existing data)
  const hasKmRange = formData.rangoKmAutorizados && formData.rangoKmAutorizados.trim() !== '';

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-4">
            <Dialog.Title className="text-xl font-bold text-gray-800">
              Editar autorización
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. MiPres *
                </label>
                <input
                  type="text"
                  name="noMipres"
                  value={formData.noMipres}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${errors['noMipres'] ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {errors['noMipres'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['noMipres']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Volante *
                </label>
                <input
                  type="text"
                  name="noVolante"
                  value={formData.noVolante}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${errors['noVolante'] ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {errors['noVolante'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['noVolante']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Tarifa Autorizada
                </label>
                <input
                  type="text"
                  name="codigoTarifaAutorizada"
                  value={formData.codigoTarifaAutorizada || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Tarifa Autorizada
                </label>
                <input
                  type="text"
                  name="nombreTarifaAutorizada"
                  value={formData.nombreTarifaAutorizada || ''}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de servicios autorizados *
                </label>
                <input
                  type="number"
                  name="numeroServiciosAutorizados"
                  value={formData.numeroServiciosAutorizados}
                  onChange={handleInputChange}
                  min={1}
                  className={`w-full p-2 border ${errors['numeroServiciosAutorizados'] ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {errors['numeroServiciosAutorizados'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['numeroServiciosAutorizados']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad A *
                </label>
                <Select
                  options={colombianCities}
                  value={colombianCities.find(option => option.value === formData.ciudadA)}
                  onChange={(option) => handleSelectChange(option, 'ciudadA')}
                  className="w-full"
                  placeholder="Seleccionar Ciudad A..."
                  isSearchable
                  isClearable
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad B *
                </label>
                <Select
                  options={colombianCities}
                  value={colombianCities.find(option => option.value === formData.ciudadB)}
                  onChange={(option) => handleSelectChange(option, 'ciudadB')}
                  className="w-full"
                  placeholder="Seleccionar Ciudad B..."
                  isSearchable
                  isClearable
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha inicio vigencia *
                </label>
                <DatePicker
                  selected={formData.fechaInicioVigencia}
                  onChange={(date) => handleDateChange(date, 'fechaInicioVigencia')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha fin vigencia *
                </label>
                <DatePicker
                  selected={formData.fechaFinVigencia}
                  onChange={(date) => handleDateChange(date, 'fechaFinVigencia')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <div className="flex items-center space-x-6 col-span-1 md:col-span-2 lg:col-span-3">
                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700 mr-2">
                    ¿Es viaje?
                  </label>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      name="esViaje"
                      id="esViaje"
                      checked={formData.esViaje}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="esViaje"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                        formData.esViaje ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                          formData.esViaje ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700 mr-2">
                    ¿Es traslado?
                  </label>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      name="esTraslado"
                      id="esTraslado"
                      checked={formData.esTraslado}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="esTraslado"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                        formData.esTraslado ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                          formData.esTraslado ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Only show KM range field if this authorization has KM range data */}
              {hasKmRange && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rango KM autorizados
                  </label>
                  <input
                    type="text"
                    name="rangoKmAutorizados"
                    value={formData.rangoKmAutorizados || ''}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Ej: 0-100 km"
                  />
                </div>
              )}
            </div>

            {/* Route Information Display */}
            {formData.ciudadA && formData.ciudadB && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Información de la ruta:</h4>
                <div className="flex items-center text-sm text-blue-700">
                  <span className="font-medium">
                    {colombianCities.find(city => city.value === formData.ciudadA)?.label}
                  </span>
                  <span className="mx-2">→</span>
                  <span className="font-medium">
                    {colombianCities.find(city => city.value === formData.ciudadB)?.label}
                  </span>
                  {formData.rangoKmAutorizados && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="font-medium text-green-700">
                        Rango KM: {formData.rangoKmAutorizados}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Error Messages */}
            {errors['cities'] && (
              <p className="text-red-500 text-sm mt-2">{errors['cities']}</p>
            )}
            {errors['fechas'] && (
              <p className="text-red-500 text-sm mt-2">{errors['fechas']}</p>
            )}
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
            >
              Volver atrás
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

// Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  authorizationInfo: string;
  hasServices: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  authorizationInfo,
  hasServices
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto p-6">
          <div className="flex justify-between items-center border-b pb-4">
            <Dialog.Title className="text-xl font-bold text-gray-800">
              {hasServices ? 'No se puede anular' : 'Confirmar anulación'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-6">
            {hasServices ? (
              <>
                <p className="text-gray-700 mb-4">
                  No se puede anular esta autorización porque tiene servicios asociados.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm font-medium">
                    {authorizationInfo}
                  </p>
                </div>
                <p className="text-gray-600 text-sm mt-3">
                  Para anular esta autorización, primero debe eliminar todos los servicios asociados.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-700 mb-4">
                  ¿Está seguro de que desea anular la autorización?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-medium">
                    {authorizationInfo}
                  </p>
                </div>
                <p className="text-gray-600 text-sm mt-3">
                  Esta acción no se puede deshacer.
                </p>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
            >
              {hasServices ? 'Entendido' : 'Cancelar'}
            </button>
            {!hasServices && (
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Anular
              </button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

const AuthorizationDetailView: React.FC<AuthorizationDetailViewProps> = ({
  authorizationId,
  onNavigateBack
}) => {
  // Main authorization data
  const [authorization, setAuthorization] = useState<Authorization | null>(null);
  const [authorizationDetails, setAuthorizationDetails] = useState<UserAuthorizationDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [noMipres, setNoMipres] = useState('');
  const [noVolante, setNoVolante] = useState('');
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAuthForEdit, setSelectedAuthForEdit] = useState<UserAuthorizationDetail | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAuthForDelete, setSelectedAuthForDelete] = useState<UserAuthorizationDetail | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Load authorization data
  useEffect(() => {
    const loadAuthorizationData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API call to get authorization by ID
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock authorization data - in real app, this would come from API
        const mockAuth: Authorization = {
          id: authorizationId,
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
        };

        // Mock authorization details - some with KM range, some without
        const mockDetails: UserAuthorizationDetail[] = [
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
            ciudadB: 'BOGOTA',
            codigoTarifaAutorizada: 'TAR001',
            nombreTarifaAutorizada: 'TARIFA BASICA',
            rangoKmAutorizados: '0-500 km' // This one has KM range
          },
          {
            id: '2',
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
            ciudadB: 'CALI',
            codigoTarifaAutorizada: 'TAR002',
            nombreTarifaAutorizada: 'TARIFA PREMIUM'
            // Note: No rangoKmAutorizados for this one - it's not a KM-based authorization
          }
        ];

        setAuthorization(mockAuth);
        setAuthorizationDetails(mockDetails);
      } catch (err) {
        setError('Error al cargar los datos de la autorización');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthorizationData();
  }, [authorizationId]);

  const handleSearch = () => {
    // Implement search logic
    console.log('Searching with filters:', { noMipres, noVolante, fechaInicio, fechaFin });
  };

  const handleClearFilters = () => {
    setNoMipres('');
    setNoVolante('');
    setFechaInicio(null);
    setFechaFin(null);
  };

  const handleEdit = (detail: UserAuthorizationDetail) => {
    setSelectedAuthForEdit(detail);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedAuth: UserAuthorizationDetail) => {
    setAuthorizationDetails(prev => 
      prev.map(auth => auth.id === updatedAuth.id ? updatedAuth : auth)
    );
    setIsEditModalOpen(false);
    setSelectedAuthForEdit(null);
  };

  const handleDeleteClick = (detail: UserAuthorizationDetail) => {
    setSelectedAuthForDelete(detail);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedAuthForDelete) {
      setAuthorizationDetails(prev => prev.filter(detail => detail.id !== selectedAuthForDelete.id));
      setIsDeleteModalOpen(false);
      setSelectedAuthForDelete(null);
    }
  };

  // Check if authorization has services (mock logic - in real app, this would check the database)
  const authorizationHasServices = (authDetail: UserAuthorizationDetail): boolean => {
    // Mock logic: authorization has services if it has consumed services (sRestante < numeroServiciosAutorizados)
    return authDetail.sRestante < authDetail.numeroServiciosAutorizados;
  };

  const handleDownloadCertificate = (detailId: string) => {
    const detail = authorizationDetails.find(d => d.id === detailId);
    if (!detail) return;

    // Create certificate content based on the authorization detail
    const certificateContent = `
CERTIFICADO DE AUTORIZACIÓN

Código Único: ${detail.codigoUnico}
No. MiPres: ${detail.noMipres}
No. Volante: ${detail.noVolante}
Servicios Autorizados: ${detail.numeroServiciosAutorizados}
Servicios Restantes: ${detail.sRestante}
Ruta: ${getCityLabel(detail.ciudadA)} → ${getCityLabel(detail.ciudadB)}
Vigencia: ${formatDate(detail.fechaInicioVigencia)} - ${formatDate(detail.fechaFinVigencia)}
Estado: ${detail.vigenciaStatus}
${detail.rangoKmAutorizados ? `Rango KM: ${detail.rangoKmAutorizados}` : ''}

Este certificado es válido únicamente para los servicios especificados.
    `.trim();

    // Simulate certificate download
    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado_${detail.codigoUnico}_${detail.noMipres}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCityLabel = (cityValue: string): string => {
    const city = colombianCities.find(city => city.value === cityValue);
    return city ? city.label : cityValue;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Cargando detalles de autorización...</span>
        </div>
      </div>
    );
  }

  if (error || !authorization) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-red-600">
          {error || 'No se encontró la autorización'}
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
            Detalle de la autorización
          </h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Crear autorización
        </button>
      </div>

      {/* Authorization Info Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-green-600 mb-4">
          Información de la autorización
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código único
            </label>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <span className="font-medium text-blue-800">{authorization.codigoUnico}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prestador
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-800">{authorization.empresaPrestadorServicio}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-800">{authorization.nombreCompleto}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identificación
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-800">{authorization.identificacion}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dependencia
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-800">{authorization.dependencia}</span>
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
                No. MiPres
              </label>
              <input
                type="text"
                value={noMipres}
                onChange={(e) => setNoMipres(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ingrese No. MiPres..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Volante
              </label>
              <input
                type="text"
                value={noVolante}
                onChange={(e) => setNoVolante(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ingrese No. Volante..."
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

      {/* User Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-blue-800 mb-4">
          Información del usuario
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-blue-600 font-medium">Nombre:</p>
            <p className="text-blue-800">{authorization.nombreCompleto}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Identificación:</p>
            <p className="text-blue-800">{authorization.identificacion}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Cliente:</p>
            <p className="text-blue-800">TUTELAS EPS</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Dependencia:</p>
            <p className="text-blue-800">{authorization.dependencia}</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-md">
          <p className="text-blue-800 text-sm">
            <span className="font-medium">Usar código único existente:</span> {authorization.codigoUnico}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-blue-600 font-medium">No. MiPres:</p>
            <p className="text-blue-800">{authorization.mipres}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">No. Volante:</p>
            <p className="text-blue-800">{authorization.volante}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Código tarifa autorizada:</p>
            <p className="text-blue-800">TAR001</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Nombre tarifa autorizada:</p>
            <p className="text-blue-800">TARIFA BASICA</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Número de servicios autorizados:</p>
            <p className="text-blue-800">{authorization.cantidadS}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Ciudad A:</p>
            <p className="text-blue-800">{getCityLabel(authorization.ciudadA)}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Ciudad B:</p>
            <p className="text-blue-800">{getCityLabel(authorization.ciudadB)}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Fecha inicio:</p>
            <p className="text-blue-800">{formatDate(authorization.fechaInicioVigencia)}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Fecha fin:</p>
            <p className="text-blue-800">{formatDate(authorization.fechaFinVigencia)}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">¿Es viaje?:</p>
            <p className="text-blue-800">Sí</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">¿Es traslado?:</p>
            <p className="text-blue-800">No</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Rango KM autorizados:</p>
            <p className="text-blue-800">0-500 km</p>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-green-600">
            Tabla de datos
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Pintar una tabla con los datos de las autorizaciones
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Identificación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código tarifa autorizada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre tarifa autorizada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ciudad A
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ciudad B
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MiPres
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volante
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad servicios autorizados
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad servicios consumidos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad servicios restantes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rango KM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado (vigente o no)
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {authorizationDetails.map((detail) => (
                <tr key={detail.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {authorization.nombreCompleto}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {authorization.identificacion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {detail.codigoTarifaAutorizada || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {detail.nombreTarifaAutorizada || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCityLabel(detail.ciudadA)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCityLabel(detail.ciudadB)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {detail.noMipres}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {detail.noVolante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {detail.numeroServiciosAutorizados}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {detail.numeroServiciosAutorizados - detail.sRestante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {detail.sRestante}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {detail.rangoKmAutorizados || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      detail.vigenciaStatus === 'VIGENTE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {detail.vigenciaStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical size={18} />
                      </Menu.Button>
                      
                      <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleEdit(detail)}
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                              >
                                <Edit size={16} className="mr-3" />
                                Editar
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleDeleteClick(detail)}
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100`}
                              >
                                <Trash2 size={16} className="mr-3" />
                                Anular
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleDownloadCertificate(detail.id)}
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100`}
                              >
                                <Download size={16} className="mr-3" />
                                Descargar certificado
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Authorization Modal */}
      <CreateAuthorizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Edit Authorization Modal */}
      {selectedAuthForEdit && (
        <EditAuthorizationModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAuthForEdit(null);
          }}
          authorization={selectedAuthForEdit}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedAuthForDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedAuthForDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          authorizationInfo={`MiPres: ${selectedAuthForDelete.noMipres} - Volante: ${selectedAuthForDelete.noVolante}`}
          hasServices={authorizationHasServices(selectedAuthForDelete)}
        />
      )}
    </div>
  );
};

export default AuthorizationDetailView;