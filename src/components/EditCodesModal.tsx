import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import Select from 'react-select';
import { Option, Authorization, UserAuthorizationDetail } from '../types';
import { empresaOptions, lookupTarifas } from '../utils/api';

interface EditCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorization: (Authorization | UserAuthorizationDetail) | null;
  availableCodes: Option[];
  onSave: (data: { codigoUnico: string; empresaPrestadorServicio: string; serviciosAutorizados?: string; }) => void;
}

const EditCodesModal: React.FC<EditCodesModalProps> = ({
  isOpen,
  onClose,
  authorization,
  availableCodes,
  onSave
}) => {
  const [useExisting, setUseExisting] = useState(true);
  const [selectedCode, setSelectedCode] = useState<Option | null>(null);
  const [newCode, setNewCode] = useState('');
  const [empresa, setEmpresa] = useState<Option | null>(null);
  const [tarifa, setTarifa] = useState<Option | null>(null);
  const [tarifaOptions, setTarifaOptions] = useState<Option[]>([]);
  const [isLoadingTarifas, setIsLoadingTarifas] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (authorization) {
      setSelectedCode(
        availableCodes.find(opt => opt.value === authorization.codigoUnico) || null
      );
      setEmpresa(
        empresaOptions.find(opt => opt.value === authorization.empresaPrestadorServicio) || null
      );
      setTarifa(
        authorization.serviciosAutorizados
          ? { value: authorization.serviciosAutorizados, label: authorization.serviciosAutorizados }
          : null
      );
      setUseExisting(true);
      setNewCode('');

      if (authorization.serviciosAutorizados) {
        void handleTarifaInputChange(authorization.serviciosAutorizados);
      }
    }
  }, [authorization, availableCodes]);

  const handleTarifaInputChange = async (inputValue: string) => {
    if (!inputValue) {
      setTarifaOptions([]);
      return;
    }
    setIsLoadingTarifas(true);
    try {
      const tarifas = await lookupTarifas(inputValue);
      setTarifaOptions(tarifas.map(t => ({ value: t, label: t })));
    } catch (err) {
      console.error('Error fetching tarifas:', err);
    } finally {
      setIsLoadingTarifas(false);
    }
  };

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setNewCode(`AUTH-${year}-${random}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    const codigo = useExisting ? selectedCode?.value : newCode;
    if (!codigo || !empresa) return;
    onSave({
      codigoUnico: codigo,
      empresaPrestadorServicio: empresa.value,
      serviciosAutorizados: tarifa?.value
    });
    onClose();
  };

  if (!authorization) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-auto p-6">
          <div className="flex justify-between items-center border-b pb-4">
            <Dialog.Title className="text-xl font-bold text-gray-800">
              Editar código único
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4 space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm space-y-1">
              <p><span className="font-medium">Usuario:</span> {authorization.nombreCompleto}</p>
              <p><span className="font-medium">Identificación:</span> {authorization.identificacion}</p>
              <p><span className="font-medium">Código actual:</span> {authorization.codigoUnico}</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={useExisting}
                  onChange={(e) => setUseExisting(e.target.checked)}
                  className="mr-2"
                />
                Usar código único existente
              </label>
              {useExisting ? (
                <Select
                  options={availableCodes}
                  value={selectedCode}
                  onChange={(opt) => setSelectedCode(opt)}
                  placeholder="Seleccionar código único..."
                  isClearable
                />
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-md"
                    placeholder="Código único..."
                  />
                  <button
                    onClick={handleGenerateCode}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isGenerating ? 'Generando...' : 'Generar código'}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarifa
              </label>
              <Select
                value={tarifa}
                onChange={(opt) => setTarifa(opt)}
                onInputChange={handleTarifaInputChange}
                options={tarifaOptions}
                placeholder="Buscar tarifa..."
                isLoading={isLoadingTarifas}
                isClearable
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa prestadora
              </label>
              <Select
                options={empresaOptions}
                value={empresa}
                onChange={(opt) => setEmpresa(opt)}
                placeholder="Seleccionar empresa..."
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default EditCodesModal;

