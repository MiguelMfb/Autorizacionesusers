import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Search, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { User, Option } from '../types';
import { empresaOptions, colombianCities, lookupTarifas } from '../utils/api';
import "react-datepicker/dist/react-datepicker.css";

interface CreateAuthorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AuthorizationFormData {
  noMiPres: string;
  noVolante: string;
  codigoTarifaAutorizada: string;
  nombreTarifaAutorizada: string;
  numeroServiciosAutorizados: number;
  fechaInicioVigencia: Date;
  fechaFinVigencia: Date;
  esViaje: boolean;
  esTraslado: boolean;
  esKm: boolean;
  rangoKm: string;
  empresaPrestadorServicio: string;
  ciudadA: string;
  ciudadB: string;
}

const CreateAuthorizationModal: React.FC<CreateAuthorizationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchIdentification, setSearchIdentification] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userFound, setUserFound] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Shared unique code for all authorizations
  const [codigoUnico, setCodigoUnico] = useState('');

  // Multiple authorizations state
  const [authorizations, setAuthorizations] = useState<AuthorizationFormData[]>([{
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
    empresaPrestadorServicio: '',
    ciudadA: '',
    ciudadB: ''
  }]);

  // Tarifa dropdown state
  const [tarifaOptions, setTarifaOptions] = useState<Option[]>([]);
  const [isLoadingTarifas, setIsLoadingTarifas] = useState(false);

  // Load all available tarifas when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAllTarifas();
    }
  }, [isOpen]);

  const loadAllTarifas = async () => {
    setIsLoadingTarifas(true);
    try {
      // Get all available tarifas by searching with empty string
      const tarifas = await lookupTarifas('');
      setTarifaOptions(tarifas.map(tarifa => ({ value: tarifa, label: tarifa })));
    } catch (error) {
      console.error('Error loading tarifas:', error);
    } finally {
      setIsLoadingTarifas(false);
    }
  };

  const handleSearch = async () => {
    if (!searchIdentification.trim()) {
      setError('Por favor ingrese un número de identificación');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Simulate API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - replace with actual API response
      const mockUser: User = {
        id: '123',
        nombreCompleto: 'JUAN PÉREZ',
        identificacion: searchIdentification,
        email: 'juan@example.com',
        celular: '3001234567',
        cliente: 'TUTELAS EPS',
        dependencia: 'TRANSPORTE PACIENTES REGIONAL ANTIOQUIA'
      };
      
      setUserFound(mockUser);
      
      // If user has an existing unique code, set it in the form
      if (mockUser.codigoUnico) {
        setCodigoUnico(mockUser.codigoUnico);
      }
    } catch (err) {
      setError('Error al buscar el usuario');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAuthorizations(prev => prev.map((auth, i) => 
      i === index 
        ? { 
            ...auth, 
            [name]: type === 'checkbox' ? checked : value,
            // Clear rangoKm when esKm is unchecked
            ...(name === 'esKm' && !checked ? { rangoKm: '' } : {})
          }
        : auth
    ));
  };

  const handleDateChange = (index: number, date: Date | null, field: string) => {
    if (!date) return;
    setAuthorizations(prev => prev.map((auth, i) => 
      i === index 
        ? { ...auth, [field]: date }
        : auth
    ));
  };

  const handleSelectChange = (index: number, option: Option | null, field: string) => {
    if (!option) return;
    setAuthorizations(prev => prev.map((auth, i) => 
      i === index 
        ? { ...auth, [field]: option.value }
        : auth
    ));
  };

  const handleCreateNewCode = async () => {
    try {
      // Simulate API call to generate new unique code
      await new Promise(resolve => setTimeout(resolve, 500));
      const newCode = `AUTH-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      setCodigoUnico(newCode);
    } catch (error) {
      console.error('Error generating new code:', error);
    }
  };

  const handleAddMoreAuthorization = () => {
    setAuthorizations(prev => [...prev, {
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
      empresaPrestadorServicio: '',
      ciudadA: '',
      ciudadB: ''
    }]);
  };

  const handleRemoveAuthorization = (index: number) => {
    if (authorizations.length > 1) {
      setAuthorizations(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    // Validate that all authorizations have required fields
    for (let i = 0; i < authorizations.length; i++) {
      const auth = authorizations[i];
      if (!auth.ciudadA || !auth.ciudadB) {
        setError(`Autorización ${i + 1}: Por favor seleccione tanto Ciudad A como Ciudad B`);
        return;
      }

      if (auth.ciudadA === auth.ciudadB) {
        setError(`Autorización ${i + 1}: Ciudad A y Ciudad B deben ser diferentes`);
        return;
      }

      if (auth.esKm && !auth.rangoKm.trim()) {
        setError(`Autorización ${i + 1}: Por favor ingrese el rango de KM`);
        return;
      }
    }

    // Implement authorization creation logic
    console.log('Creating authorizations:', { 
      user: userFound, 
      codigoUnico, 
      authorizations 
    });
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full mx-auto p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-4">
            <Dialog.Title className="text-xl font-bold text-gray-800">
              Crear nueva autorización
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar usuario por número de identificación
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchIdentification}
                    onChange={(e) => setSearchIdentification(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Ingrese número de identificación..."
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            {userFound && (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <CheckCircle2 className="text-green-500 mr-2" size={20} />
                    <h3 className="text-lg font-medium text-green-800">
                      Usuario encontrado
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Nombre completo:</p>
                      <p className="font-medium">{userFound.nombreCompleto}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Identificación:</p>
                      <p className="font-medium">{userFound.identificacion}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cliente:</p>
                      <p className="font-medium">{userFound.cliente}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Dependencia:</p>
                      <p className="font-medium">{userFound.dependencia}</p>
                    </div>
                  </div>
                </div>

                {/* Shared Unique Code Section */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-lg font-medium text-blue-800 mb-4">
                    Código Único (compartido para todas las autorizaciones)
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={codigoUnico}
                      onChange={(e) => setCodigoUnico(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md"
                      placeholder="Código único..."
                      readOnly
                    />
                    <button
                      onClick={handleCreateNewCode}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 whitespace-nowrap"
                    >
                      Crear nuevo
                    </button>
                  </div>
                </div>

                {/* Authorizations Section */}
                <div className="space-y-6">
                  {authorizations.map((authorization, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-800">
                          Autorización {index + 1}
                        </h3>
                        {authorizations.length > 1 && (
                          <button
                            onClick={() => handleRemoveAuthorization(index)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                            title="Eliminar autorización"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            No. MiPres
                          </label>
                          <input
                            type="text"
                            name="noMiPres"
                            value={authorization.noMiPres}
                            onChange={(e) => handleInputChange(index, e)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            No. Volante
                          </label>
                          <input
                            type="text"
                            name="noVolante"
                            value={authorization.noVolante}
                            onChange={(e) => handleInputChange(index, e)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Codigo Tarifa Autorizada
                          </label>
                          <input
                            type="text"
                            name="codigoTarifaAutorizada"
                            value={authorization.codigoTarifaAutorizada}
                            onChange={(e) => handleInputChange(index, e)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre Tarifa Autorizada
                          </label>
                          <Select
                            options={tarifaOptions}
                            value={tarifaOptions.find(option => option.value === authorization.nombreTarifaAutorizada)}
                            onChange={(option) => handleSelectChange(index, option, 'nombreTarifaAutorizada')}
                            isLoading={isLoadingTarifas}
                            isClearable
                            placeholder="Seleccionar tarifa..."
                            className="w-full"
                            noOptionsMessage={() => "No hay tarifas disponibles"}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Numero de servicios autorizados
                          </label>
                          <input
                            type="number"
                            name="numeroServiciosAutorizados"
                            value={authorization.numeroServiciosAutorizados}
                            onChange={(e) => handleInputChange(index, e)}
                            min={0}
                            className="w-full p-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ciudad A *
                          </label>
                          <Select
                            options={colombianCities}
                            value={colombianCities.find(option => option.value === authorization.ciudadA)}
                            onChange={(option) => handleSelectChange(index, option, 'ciudadA')}
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
                            value={colombianCities.find(option => option.value === authorization.ciudadB)}
                            onChange={(option) => handleSelectChange(index, option, 'ciudadB')}
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
                            value={empresaOptions.find(option => option.value === authorization.empresaPrestadorServicio)}
                            onChange={(option) => handleSelectChange(index, option, 'empresaPrestadorServicio')}
                            className="w-full"
                            placeholder="Seleccionar empresa..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha inicio vigencia
                          </label>
                          <DatePicker
                            selected={authorization.fechaInicioVigencia}
                            onChange={(date) => handleDateChange(index, date, 'fechaInicioVigencia')}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            dateFormat="dd/MM/yyyy"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha fin vigencia
                          </label>
                          <DatePicker
                            selected={authorization.fechaFinVigencia}
                            onChange={(date) => handleDateChange(index, date, 'fechaFinVigencia')}
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
                                id={`esViaje-${index}`}
                                checked={authorization.esViaje}
                                onChange={(e) => handleInputChange(index, e)}
                                className="sr-only"
                              />
                              <label
                                htmlFor={`esViaje-${index}`}
                                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                  authorization.esViaje ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                                    authorization.esViaje ? 'translate-x-6' : 'translate-x-0'
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
                                id={`esTraslado-${index}`}
                                checked={authorization.esTraslado}
                                onChange={(e) => handleInputChange(index, e)}
                                className="sr-only"
                              />
                              <label
                                htmlFor={`esTraslado-${index}`}
                                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                  authorization.esTraslado ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                                    authorization.esTraslado ? 'translate-x-6' : 'translate-x-0'
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
                                id={`esKm-${index}`}
                                checked={authorization.esKm}
                                onChange={(e) => handleInputChange(index, e)}
                                className="sr-only"
                              />
                              <label
                                htmlFor={`esKm-${index}`}
                                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                                  authorization.esKm ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                              >
                                <span
                                  className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                                    authorization.esKm ? 'translate-x-6' : 'translate-x-0'
                                  }`}
                                ></span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* KM Range Field - Only show when esKm is true */}
                        {authorization.esKm && (
                          <div className="col-span-1 md:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Rango de KM *
                            </label>
                            <input
                              type="text"
                              name="rangoKm"
                              value={authorization.rangoKm}
                              onChange={(e) => handleInputChange(index, e)}
                              className="w-full p-2 border border-gray-300 rounded-md"
                              placeholder="Ej: 0-100 km, 100-200 km, etc."
                            />
                          </div>
                        )}
                      </div>

                      {/* Route Information Display */}
                      {authorization.ciudadA && authorization.ciudadB && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-800 mb-2">Información de la ruta:</h4>
                          <div className="flex items-center text-sm text-blue-700">
                            <span className="font-medium">
                              {colombianCities.find(city => city.value === authorization.ciudadA)?.label}
                            </span>
                            <span className="mx-2">→</span>
                            <span className="font-medium">
                              {colombianCities.find(city => city.value === authorization.ciudadB)?.label}
                            </span>
                            {authorization.esKm && authorization.rangoKm && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="font-medium text-green-700">
                                  Rango KM: {authorization.rangoKm}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add More Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={handleAddMoreAuthorization}
                      className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    >
                      <Plus size={20} className="mr-2" />
                      Añadir más
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="mt-8 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
              >
                Volver atrás
              </button>
              {userFound && (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Crear autorización{authorizations.length > 1 ? 'es' : ''}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateAuthorizationModal;