import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { User, Option, UserAuthorizationDetail, AuthorizationGroup } from '../types';
import { empresaOptions, colombianCities, lookupTarifas } from '../utils/api';
import "react-datepicker/dist/react-datepicker.css";

interface AddAuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: User;
  onAuthorizationAdded: (authorization: UserAuthorizationDetail) => void;
}

const AddAuthorizationModal: React.FC<AddAuthorizationModalProps> = ({
  isOpen,
  onClose,
  userData,
  onAuthorizationAdded
}) => {
  const [selectedAuthGroup, setSelectedAuthGroup] = useState<AuthorizationGroup | null>(null);
  const [createNewGroup, setCreateNewGroup] = useState(false);
  const [newGroupCode, setNewGroupCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  
  const [formData, setFormData] = useState({
    noMiPres: '',
    noVolante: '',
    codigoTarifaAutorizada: '',
    nombreTarifaAutorizada: '',
    numeroServiciosAutorizados: 0,
    fechaInicioVigencia: new Date(),
    fechaFinVigencia: new Date(),
    esViaje: false,
    esTraslado: false,
    esKm: false,
    rangoKm: '',
    empresaPrestadorServicio: userData.empresaPrestadorServicio || '',
    ciudadA: '',
    ciudadB: ''
  });

  const [tarifaOptions, setTarifaOptions] = useState<Option[]>([]);
  const [isLoadingTarifas, setIsLoadingTarifas] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get existing authorization groups for the user
  const existingAuthGroups = userData.authorizationGroups || [];

  // Convert to options for the select
  const authGroupOptions: Option[] = existingAuthGroups.map(group => ({
    value: group.codigoUnico,
    label: `${group.codigoUnico} - ${group.observaciones || 'Sin observaciones'}`
  }));

  const generateRandomCode = async () => {
    setIsGeneratingCode(true);
    try {
      // Simulate API call to generate unique code
      await new Promise(resolve => setTimeout(resolve, 500));
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const newCode = `AUTH-${year}-${randomNum}`;
      setNewGroupCode(newCode);
    } catch (error) {
      console.error('Error generating code:', error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
      // Clear rangoKm when esKm is unchecked
      ...(name === 'esKm' && !checked ? { rangoKm: '' } : {})
    }));

    // Clear error when user starts typing
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

  const handleTarifaInputChange = async (inputValue: string) => {
    if (!inputValue) {
      setTarifaOptions([]);
      return;
    }

    setIsLoadingTarifas(true);
    try {
      const tarifas = await lookupTarifas(inputValue);
      setTarifaOptions(tarifas.map(tarifa => ({ value: tarifa, label: tarifa })));
    } catch (error) {
      console.error('Error fetching tarifas:', error);
    } finally {
      setIsLoadingTarifas(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!createNewGroup && !selectedAuthGroup) {
      newErrors['authGroup'] = 'Debe seleccionar un grupo de autorización existente o crear uno nuevo';
    }

    if (createNewGroup && !newGroupCode) {
      newErrors['newGroupCode'] = 'Debe generar un código único para el nuevo grupo';
    }

    if (!formData.noMiPres) {
      newErrors['noMiPres'] = 'El número MiPres es requerido';
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

    if (formData.esKm && !formData.rangoKm.trim()) {
      newErrors['rangoKm'] = 'El rango de KM es requerido cuando se marca como KM';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Determine which authorization group code to use
      const authGroupCode = createNewGroup ? newGroupCode : selectedAuthGroup?.codigoUnico;

      if (!authGroupCode) {
        setErrors({ submit: 'Error: No se pudo determinar el código de autorización' });
        return;
      }

      // Create the new authorization
      const newAuthorization: UserAuthorizationDetail = {
        id: `auth-${Date.now()}`, // In real app, this would be generated by the backend
        codigoUnico: authGroupCode,
        noMipres: formData.noMiPres,
        noVolante: formData.noVolante,
        fechaInicioVigencia: formData.fechaInicioVigencia,
        fechaFinVigencia: formData.fechaFinVigencia,
        numeroServiciosAutorizados: formData.numeroServiciosAutorizados,
        esViaje: formData.esViaje,
        esTraslado: formData.esTraslado,
        sRestante: formData.numeroServiciosAutorizados, // Initially, all services are remaining
        vigenciaStatus: formData.fechaFinVigencia > new Date() ? 'VIGENTE' : 'NO VIGENTE',
        empresaPrestadorServicio: formData.empresaPrestadorServicio,
        ciudadA: formData.ciudadA,
        ciudadB: formData.ciudadB,
        codigoTarifaAutorizada: formData.codigoTarifaAutorizada,
        nombreTarifaAutorizada: formData.nombreTarifaAutorizada,
        rangoKmAutorizados: formData.esKm ? formData.rangoKm : undefined
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call the callback to add the authorization
      onAuthorizationAdded(newAuthorization);

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error creating authorization:', error);
      setErrors({ submit: 'Error al crear la autorización' });
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-4">
            <Dialog.Title className="text-xl font-bold text-gray-800">
              Añadir nueva autorización
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-6">
            {/* User Information Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                Información del usuario
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Nombre completo:</p>
                  <p className="font-medium">{userData.nombreCompleto}</p>
                </div>
                <div>
                  <p className="text-gray-600">Identificación:</p>
                  <p className="font-medium">{userData.identificacion}</p>
                </div>
                <div>
                  <p className="text-gray-600">Cliente:</p>
                  <p className="font-medium">{userData.cliente}</p>
                </div>
                <div>
                  <p className="text-gray-600">Dependencia:</p>
                  <p className="font-medium">{userData.dependencia}</p>
                </div>
              </div>
            </div>

            {/* Authorization Group Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Código único de autorización
              </h3>
              
              <div className="space-y-4">
                {/* Option 1: Use existing authorization group */}
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id="useExisting"
                    name="authGroupOption"
                    checked={!createNewGroup}
                    onChange={() => setCreateNewGroup(false)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="useExisting" className="block text-sm font-medium text-gray-700 mb-2">
                      Usar código único existente
                    </label>
                    <Select
                      options={authGroupOptions}
                      value={authGroupOptions.find(option => option.value === selectedAuthGroup?.codigoUnico)}
                      onChange={(option) => {
                        if (option) {
                          const group = existingAuthGroups.find(g => g.codigoUnico === option.value);
                          setSelectedAuthGroup(group || null);
                        }
                      }}
                      placeholder="Seleccionar código único existente..."
                      isDisabled={createNewGroup}
                      className="w-full"
                    />
                    {authGroupOptions.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        No hay códigos únicos existentes para este usuario
                      </p>
                    )}
                  </div>
                </div>

                {/* Option 2: Create new authorization group */}
                <div className="flex items-start space-x-3">
                  <input
                    type="radio"
                    id="createNew"
                    name="authGroupOption"
                    checked={createNewGroup}
                    onChange={() => setCreateNewGroup(true)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="createNew" className="block text-sm font-medium text-gray-700 mb-2">
                      Crear nuevo código único
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newGroupCode}
                        onChange={(e) => setNewGroupCode(e.target.value)}
                        placeholder="Código único..."
                        disabled={!createNewGroup}
                        className="flex-1 p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                        readOnly
                      />
                      <button
                        onClick={generateRandomCode}
                        disabled={!createNewGroup || isGeneratingCode}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isGeneratingCode ? 'Generando...' : 'Generar código'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {errors['authGroup'] && (
                <p className="text-red-500 text-sm mt-2">{errors['authGroup']}</p>
              )}
              {errors['newGroupCode'] && (
                <p className="text-red-500 text-sm mt-2">{errors['newGroupCode']}</p>
              )}
            </div>

            {/* Authorization Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. MiPres *
                </label>
                <input
                  type="text"
                  name="noMiPres"
                  value={formData.noMiPres}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${errors['noMiPres'] ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {errors['noMiPres'] && (
                  <p className="text-red-500 text-xs mt-1">{errors['noMiPres']}</p>
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
                  Codigo Tarifa Autorizada
                </label>
                <input
                  type="text"
                  name="codigoTarifaAutorizada"
                  value={formData.codigoTarifaAutorizada}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Tarifa Autorizada
                </label>
                <Select
                  options={tarifaOptions}
                  value={tarifaOptions.find(option => option.value === formData.nombreTarifaAutorizada)}
                  onChange={(option) => handleSelectChange(option, 'nombreTarifaAutorizada')}
                  onInputChange={handleTarifaInputChange}
                  isLoading={isLoadingTarifas}
                  isClearable
                  placeholder="Buscar tarifa..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero de servicios autorizados *
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
                  Empresa Prestador Servicio
                </label>
                <Select
                  options={empresaOptions}
                  value={empresaOptions.find(option => option.value === formData.empresaPrestadorServicio)}
                  onChange={(option) => handleSelectChange(option, 'empresaPrestadorServicio')}
                  className="w-full"
                  placeholder="Seleccionar empresa..."
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

                <div className="flex items-center">
                  <label className="text-sm font-medium text-gray-700 mr-2">
                    ¿Es KM?
                  </label>
                  <div className="relative inline-block w-12 align-middle select-none">
                    <input
                      type="checkbox"
                      name="esKm"
                      id="esKm"
                      checked={formData.esKm}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <label
                      htmlFor="esKm"
                      className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                        formData.esKm ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                          formData.esKm ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      ></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* KM Range Field - Only show when esKm is true */}
              {formData.esKm && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rango de KM *
                  </label>
                  <input
                    type="text"
                    name="rangoKm"
                    value={formData.rangoKm}
                    onChange={handleInputChange}
                    className={`w-full p-2 border ${errors['rangoKm'] ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    placeholder="Ej: 0-100 km, 100-200 km, etc."
                  />
                  {errors['rangoKm'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['rangoKm']}</p>
                  )}
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
                  {formData.esKm && formData.rangoKm && (
                    <>
                      <span className="mx-2">•</span>
                      <span className="font-medium text-green-700">
                        Rango KM: {formData.rangoKm}
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
            {errors['submit'] && (
              <p className="text-red-500 text-sm mt-2">{errors['submit']}</p>
            )}
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Añadir autorización
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AddAuthorizationModal;