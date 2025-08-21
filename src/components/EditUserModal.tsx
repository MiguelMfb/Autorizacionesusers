import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, CheckCircle2, XCircle, Pencil, Upload, Plus, Edit } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { User, Option, UserAuthorizationDetail, AuthorizationGroup } from '../types';
import { 
  clientesList, 
  dependenciasList, 
  empresaOptions, 
  lookupTarifas, 
  addTarifa,
  fetchAuthorizationsForUser,
  saveAuthorizationDetail,
  colombianCities
} from '../utils/api';
import AddAuthorizationModal from './AddAuthorizationModal';
import EditCodesModal from './EditCodesModal';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: User;
  onSave: (userData: User) => void;
  onDelete: (userId: string) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  userData,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<User>({ ...userData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [modalMode, setModalMode] = useState<'editingUser' | 'editingAuthorization'>('editingUser');
  const [authorizationsList, setAuthorizationsList] = useState<UserAuthorizationDetail[]>([]);
  const [isLoadingAuthorizations, setIsLoadingAuthorizations] = useState(true);
  const [errorAuthorizations, setErrorAuthorizations] = useState<string | null>(null);
  const [selectedAuthorizationToEdit, setSelectedAuthorizationToEdit] = useState<UserAuthorizationDetail | null>(null);
  const [authorizationEditFormState, setAuthorizationEditFormState] = useState<Partial<UserAuthorizationDetail>>({});
  const [isAddAuthorizationModalOpen, setIsAddAuthorizationModalOpen] = useState(false);
  const [selectedAuthForCodeEdit, setSelectedAuthForCodeEdit] = useState<UserAuthorizationDetail | null>(null);
  const [isCodeEditModalOpen, setIsCodeEditModalOpen] = useState(false);

  useEffect(() => {
    setFormData({ ...userData });
  }, [userData]);

  useEffect(() => {
    if (isOpen && userData.id) {
      fetchAndSetAuthorizations(userData.id);
    }
  }, [isOpen, userData.id]);

  const fetchAndSetAuthorizations = async (userId: string) => {
    setIsLoadingAuthorizations(true);
    setErrorAuthorizations(null);
    try {
      const authorizations = await fetchAuthorizationsForUser(userId);
      setAuthorizationsList(authorizations);
    } catch (error) {
      setErrorAuthorizations('Error al cargar las autorizaciones');
      console.error(error);
    } finally {
      setIsLoadingAuthorizations(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (option: Option | null, fieldName: string) => {
    if (!option) return;
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: option.value
    }));
    
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nombreCompleto) {
      newErrors['nombreCompleto'] = 'El nombre completo es requerido';
    }
    
    if (!formData.identificacion) {
      newErrors['identificacion'] = 'La identificación es requerida';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors['email'] = 'Formato de email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    
    onSave(formData);
  };

  const handleStartEditAuthorization = (authorization: UserAuthorizationDetail) => {
    setSelectedAuthorizationToEdit(authorization);
    setAuthorizationEditFormState(authorization);
    setModalMode('editingAuthorization');
  };

  const handleAuthorizationFormFieldChange = (
    field: keyof UserAuthorizationDetail,
    value: any
  ) => {
    setAuthorizationEditFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAuthorizationEdit = async () => {
    try {
      if (!selectedAuthorizationToEdit?.id) return;
      
      const updatedAuth = await saveAuthorizationDetail({
        ...selectedAuthorizationToEdit,
        ...authorizationEditFormState
      } as UserAuthorizationDetail);

      setAuthorizationsList(prev =>
        prev.map(auth =>
          auth.id === updatedAuth.id ? updatedAuth : auth
        )
      );

      handleCancelAuthorizationEdit();
    } catch (error) {
      console.error('Error al guardar la autorización:', error);
    }
  };

  const handleCancelAuthorizationEdit = () => {
    setModalMode('editingUser');
    setSelectedAuthorizationToEdit(null);
    setAuthorizationEditFormState({});
  };

  const handleOpenAddAuthorizationModal = () => {
    setIsAddAuthorizationModalOpen(true);
  };

  const handleCloseAddAuthorizationModal = () => {
    setIsAddAuthorizationModalOpen(false);
  };

  const handleAuthorizationAdded = (newAuthorization: UserAuthorizationDetail) => {
    setAuthorizationsList(prev => [...prev, newAuthorization]);
    setIsAddAuthorizationModalOpen(false);
  };

  const handleOpenCodeEditModal = (authorization: UserAuthorizationDetail) => {
    setSelectedAuthForCodeEdit(authorization);
    setIsCodeEditModalOpen(true);
  };

  const handleCloseCodeEditModal = () => {
    setIsCodeEditModalOpen(false);
    setSelectedAuthForCodeEdit(null);
  };

  const handleSaveCodeEdit = (data: { codigoUnico: string; empresaPrestadorServicio: string; serviciosAutorizados?: string }) => {
    if (!selectedAuthForCodeEdit) return;
    setAuthorizationsList(prev =>
      prev.map(a =>
        a.id === selectedAuthForCodeEdit.id
          ? {
              ...a,
              codigoUnico: data.codigoUnico,
              empresaPrestadorServicio: data.empresaPrestadorServicio,
              nombreTarifaAutorizada: data.serviciosAutorizados
            }
          : a
      )
    );
    handleCloseCodeEditModal();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <Dialog 
        open={isOpen} 
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-4">
              <Dialog.Title className="text-xl font-bold text-gray-800">
                {modalMode === 'editingUser' ? 'Editar usuario app cliente' : 'Editar autorización'}
              </Dialog.Title>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
              >
                <X size={20} />
              </button>
            </div>

            {modalMode === 'editingUser' ? (
              <>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cliente
                      </label>
                      <Select
                        options={clientesList}
                        value={clientesList.find(option => option.value === formData.cliente)}
                        onChange={(option) => handleSelectChange(option, 'cliente')}
                        className="w-full"
                        placeholder="Seleccionar cliente..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dependencia
                      </label>
                      <Select
                        options={dependenciasList}
                        value={dependenciasList.find(option => option.value === formData.dependencia)}
                        onChange={(option) => handleSelectChange(option, 'dependencia')}
                        className="w-full"
                        placeholder="Seleccionar dependencia..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa Prestador Servicio
                      </label>
                      <Select
                        options={empresaOptions}
                        value={empresaOptions.find(option => option.value === formData.empresaPrestadorServicio)}
                        onChange={(option) => handleSelectChange(option, 'empresaPrestadorServicio')}
                        placeholder="Seleccionar empresa..."
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="nombreCompleto"
                        value={formData.nombreCompleto || ''}
                        onChange={handleInputChange}
                        className={`w-full p-2 border ${
                          errors['nombreCompleto'] ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors['nombreCompleto'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['nombreCompleto']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Identificación *
                      </label>
                      <input
                        type="text"
                        name="identificacion"
                        value={formData.identificacion || ''}
                        onChange={handleInputChange}
                        className={`w-full p-2 border ${
                          errors['identificacion'] ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors['identificacion'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['identificacion']}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className={`w-full p-2 border ${
                          errors['email'] ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      {errors['email'] && (
                        <p className="text-red-500 text-xs mt-1">{errors['email']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Celular
                      </label>
                      <input
                        type="tel"
                        name="celular"
                        value={formData.celular || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <div className="flex items-center">
                        <label className="text-sm font-medium text-gray-700 mr-2">
                          ¿Solicita servicio?
                        </label>
                        <div className="relative inline-block w-12 mr-2 align-middle select-none">
                          <input
                            type="checkbox"
                            name="solicitaServicio"
                            id="solicitaServicio"
                            checked={formData.solicitaServicio || false}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <label
                            htmlFor="solicitaServicio"
                            className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                              formData.solicitaServicio ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                                formData.solicitaServicio ? 'translate-x-6' : 'translate-x-0'
                              }`}
                            ></span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 col-span-1 md:col-span-3 mt-6">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Autorizaciones
                      </h3>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleOpenAddAuthorizationModal}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                        >
                          <Plus size={20} className="mr-2" />
                          Añadir autorización
                        </button>
                        <button
                          onClick={() => {/* Handle file upload */}}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                          <Upload size={20} className="mr-2" />
                          Cargar archivo plano
                        </button>
                      </div>
                    </div>

                    <div className="mt-8 pt-6">
                      <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                        Histórico de autorizaciones
                      </h3>

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
                                Ciudad A
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ciudad B
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha inicio vigencia
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fecha fin vigencia
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Numero de servicios autorizados
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ¿Es viaje?
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ¿Es traslado?
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                S. Restante
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          
                          <tbody className="bg-white divide-y divide-gray-200">
                            {isLoadingAuthorizations ? (
                              <tr>
                                <td colSpan={13} className="px-6 py-4 text-center">
                                  Cargando autorizaciones...
                                </td>
                              </tr>
                            ) : authorizationsList.length === 0 ? (
                              <tr>
                                <td colSpan={13} className="px-6 py-4 text-center text-gray-500">
                                  No hay autorizaciones registradas
                                </td>
                              </tr>
                            ) : (
                              authorizationsList.map((auth) => (
                                <tr key={auth.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                                    {auth.codigoUnico}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">{auth.noMipres}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">{auth.noVolante}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {colombianCities.find(city => city.value === auth.ciudadA)?.label || auth.ciudadA}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {colombianCities.find(city => city.value === auth.ciudadB)?.label || auth.ciudadB}
                                  </td>
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
                                    {auth.esViaje ? 'Si' : 'No'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {auth.esTraslado ? 'Si' : 'No'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {auth.sRestante}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {auth.vigenciaStatus === 'VIGENTE' ? (
                                        <>
                                          <CheckCircle2 className="text-green-500 mr-2\" size={20} />
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
                                    <div className="flex justify-center space-x-2">
                                      <button
                                        onClick={() => handleStartEditAuthorization(auth)}
                                        className="text-green-500 hover:text-green-700"
                                      >
                                        <Pencil size={20} />
                                      </button>
                                      <button
                                        onClick={() => handleOpenCodeEditModal(auth)}
                                        className="text-blue-500 hover:text-blue-700"
                                      >
                                        <Edit size={20} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
                  >
                    Volver atrás
                  </button>
                  <button
                    onClick={() => onDelete(userData.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Editar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. MiPres
                    </label>
                    <input
                      type="text"
                      value={authorizationEditFormState.noMipres || ''}
                      onChange={(e) => 
                        handleAuthorizationFormFieldChange('noMipres', e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. Volante
                    </label>
                    <input
                      type="text"
                      value={authorizationEditFormState.noVolante || ''}
                      onChange={(e) => 
                        handleAuthorizationFormFieldChange('noVolante', e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad A
                    </label>
                    <Select
                      options={colombianCities}
                      value={colombianCities.find(option => option.value === authorizationEditFormState.ciudadA)}
                      onChange={(option) => 
                        handleAuthorizationFormFieldChange('ciudadA', option?.value)
                      }
                      className="w-full"
                      placeholder="Seleccionar Ciudad A..."
                      isSearchable
                      isClearable
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad B
                    </label>
                    <Select
                      options={colombianCities}
                      value={colombianCities.find(option => option.value === authorizationEditFormState.ciudadB)}
                      onChange={(option) => 
                        handleAuthorizationFormFieldChange('ciudadB', option?.value)
                      }
                      className="w-full"
                      placeholder="Seleccionar Ciudad B..."
                      isSearchable
                      isClearable
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha inicio vigencia
                    </label>
                    <DatePicker
                      selected={authorizationEditFormState.fechaInicioVigencia}
                      onChange={(date) => 
                        handleAuthorizationFormFieldChange('fechaInicioVigencia', date)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha fin vigencia
                    </label>
                    <DatePicker
                      selected={authorizationEditFormState.fechaFinVigencia}
                      onChange={(date) => 
                        handleAuthorizationFormFieldChange('fechaFinVigencia', date)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      dateFormat="dd/MM/yyyy"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numero de servicios autorizados
                    </label>
                    <input
                      type="number"
                      value={authorizationEditFormState.numeroServiciosAutorizados || 0}
                      onChange={(e) => 
                        handleAuthorizationFormFieldChange(
                          'numeroServiciosAutorizados',
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <label className="text-sm font-medium text-gray-700 mr-2">
                        ¿Es viaje?
                      </label>
                      <div className="relative inline-block w-12 align-middle select-none">
                        <input
                          type="checkbox"
                          checked={authorizationEditFormState.esViaje || false}
                          onChange={(e) => 
                            handleAuthorizationFormFieldChange('esViaje', e.target.checked)
                          }
                          className="sr-only"
                          id="esViaje"
                        />
                        <label
                          htmlFor="esViaje"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            authorizationEditFormState.esViaje ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                              authorizationEditFormState.esViaje ? 'translate-x-6' : 'translate-x-0'
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
                          checked={authorizationEditFormState.esTraslado || false}
                          onChange={(e) => 
                            handleAuthorizationFormFieldChange('esTraslado', e.target.checked)
                          }
                          className="sr-only"
                          id="esTraslado"
                        />
                        <label
                          htmlFor="esTraslado"
                          className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                            authorizationEditFormState.esTraslado ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                              authorizationEditFormState.esTraslado ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          ></span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Only show KM range field if this authorization has KM range data */}
                  {authorizationEditFormState.rangoKmAutorizados && (
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rango KM autorizados
                      </label>
                      <input
                        type="text"
                        value={authorizationEditFormState.rangoKmAutorizados || ''}
                        onChange={(e) => 
                          handleAuthorizationFormFieldChange('rangoKmAutorizados', e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Ej: 0-100 km"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={handleCancelAuthorizationEdit}
                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveAuthorizationEdit}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Guardar Cambios Autorización
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Dialog>

      {/* Add Authorization Modal */}
      {isAddAuthorizationModalOpen && (
        <AddAuthorizationModal
          isOpen={isAddAuthorizationModalOpen}
          onClose={handleCloseAddAuthorizationModal}
          userData={userData}
          onAuthorizationAdded={handleAuthorizationAdded}
        />
      )}

      {selectedAuthForCodeEdit && (
        <EditCodesModal
          isOpen={isCodeEditModalOpen}
          onClose={handleCloseCodeEditModal}
          authorization={selectedAuthForCodeEdit ? {
            ...selectedAuthForCodeEdit,
            nombreCompleto: userData.nombreCompleto,
            identificacion: userData.identificacion,
            serviciosAutorizados: selectedAuthForCodeEdit.nombreTarifaAutorizada
          } as any : null}
          availableCodes={Array.from(new Set(authorizationsList.map(a => a.codigoUnico))).map(code => ({ value: code, label: code }))}
          onSave={handleSaveCodeEdit}
        />
      )}
    </>
  );
};

export default EditUserModal;
