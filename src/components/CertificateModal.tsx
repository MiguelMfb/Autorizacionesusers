import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { UserAuthorizationDetail } from '../types';
import "react-datepicker/dist/react-datepicker.css";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorizations: UserAuthorizationDetail[];
}

const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  authorizations
}) => {
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [filteredAuthorizations, setFilteredAuthorizations] = useState<UserAuthorizationDetail[]>([]);
  const [selectedAuthorizations, setSelectedAuthorizations] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!fechaInicio || !fechaFin) return;

    const filtered = authorizations.filter(auth => {
      const authStartDate = new Date(auth.fechaInicioVigencia);
      const authEndDate = new Date(auth.fechaFinVigencia);
      return authStartDate >= fechaInicio && authEndDate <= fechaFin;
    });

    setFilteredAuthorizations(filtered);
    setSelectedAuthorizations([]);
    setHasSearched(true);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedAuthorizations(filteredAuthorizations.map(auth => auth.id));
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

  const handleGenerate = () => {
    if (selectedAuthorizations.length === 0) {
      alert('Por favor seleccione al menos una autorización');
      return;
    }
    
    // Here you would implement the PDF generation logic
    console.log('Generating certificate for authorizations:', selectedAuthorizations);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto p-6">
          <div className="flex justify-between items-center border-b pb-4">
            <Dialog.Title className="text-xl font-bold text-gray-800">
              Generar certificado
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha inicio
                </label>
                <DatePicker
                  selected={fechaInicio}
                  onChange={date => setFechaInicio(date)}
                  className="w-full p-2 border border-gray-300 rounded-md"
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
                  className="w-full p-2 border border-gray-300 rounded-md"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccionar fecha..."
                />
              </div>
            </div>

            <div className="flex justify-end mb-6">
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={!fechaInicio || !fechaFin}
              >
                Buscar
              </button>
            </div>

            {hasSearched && (
              <div className="border rounded-lg overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedAuthorizations.length === filteredAuthorizations.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Seleccionar todas
                    </span>
                  </label>
                </div>

                <div className="divide-y">
                  {filteredAuthorizations.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No se encontraron autorizaciones en el rango de fechas seleccionado
                    </div>
                  ) : (
                    filteredAuthorizations.map(auth => (
                      <div key={auth.id} className="p-4 hover:bg-gray-50">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedAuthorizations.includes(auth.id)}
                            onChange={() => handleSelectAuthorization(auth.id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <div className="ml-3 flex-grow">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  No. Mipres: {auth.noMipres}
                                </p>
                                <p className="text-sm text-gray-500">
                                  No. Volante: {auth.noVolante}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">
                                  Servicios autorizados: {auth.numeroServiciosAutorizados}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Servicios restantes: {auth.sRestante}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              Vigencia: {formatDate(new Date(auth.fechaInicioVigencia))} - {formatDate(new Date(auth.fechaFinVigencia))}
                            </p>
                          </div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {hasSearched && filteredAuthorizations.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleGenerate}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  disabled={selectedAuthorizations.length === 0}
                >
                  Generar certificado
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CertificateModal;