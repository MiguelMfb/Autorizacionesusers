import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Calendar, Eye, Users, FileCheck, Plus } from 'lucide-react';

interface LatestChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToChange: (changeId: string) => void;
}

interface Change {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  section: string;
}

const changes: Change[] = [
  {
    id: 'user-detail-status',
    title: 'Eliminación del estado de vigencia en detalles de usuario',
    description: 'Se removió la visualización del estado "vigente/no vigente" de los datos generales del usuario en la vista de detalles para simplificar la interfaz y evitar información redundante.',
    icon: Users,
    section: 'Gestión de Usuarios'
  },
  {
    id: 'authorization-delete-protection',
    title: 'Protección contra eliminación de autorizaciones con servicios',
    description: 'Se implementó una validación que impide eliminar autorizaciones que tengan servicios asociados. Además, se cambió la etiqueta del botón de "Eliminar" por "Anular" para mayor claridad en la acción.',
    icon: FileCheck,
    section: 'Gestión de Autorizaciones'
  },
  {
    id: 'tariff-dropdown',
    title: 'Lista desplegable para tarifas autorizadas',
    description: 'Al crear nuevas autorizaciones, el campo "Nombre de tarifa autorizada" ahora es una lista desplegable que permite seleccionar únicamente entre las tarifas existentes, mejorando la consistencia de datos.',
    icon: FileCheck,
    section: 'Gestión de Autorizaciones'
  },
  {
    id: 'multiple-authorizations',
    title: 'Creación múltiple de autorizaciones con código único compartido',
    description: 'Se añadió la funcionalidad para crear múltiples autorizaciones simultáneamente que comparten el mismo código único. Incluye un botón "Añadir más" que permite agregar campos adicionales para nuevas autorizaciones sin solicitar un nuevo código único.',
    icon: Plus,
    section: 'Gestión de Autorizaciones'
  }
];

const LatestChangesModal: React.FC<LatestChangesModalProps> = ({
  isOpen,
  onClose,
  onNavigateToChange
}) => {
  const handleViewChange = (changeId: string) => {
    onNavigateToChange(changeId);
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
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <div className="flex items-center">
              <Calendar className="text-blue-600 mr-3" size={24} />
              <div>
                <Dialog.Title className="text-2xl font-bold text-gray-800">
                  Últimos Cambios
                </Dialog.Title>
                <p className="text-sm text-gray-600 mt-1">
                  Implementados el 18 de junio de 2025
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 focus:outline-none transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="text-blue-600 mr-2" size={20} />
                <span className="text-blue-800 font-medium">18 de junio de 2025</span>
              </div>
            </div>

            <div className="grid gap-4">
              {changes.map((change, index) => {
                const IconComponent = change.icon;
                return (
                  <div 
                    key={change.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mr-3">
                            <IconComponent className="text-green-600" size={20} />
                          </div>
                          <div>
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mb-1">
                              {change.section}
                            </span>
                            <h4 className="text-lg font-semibold text-gray-800">
                              {index + 1}. {change.title}
                            </h4>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed ml-13">
                          {change.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleViewChange(change.id)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm font-medium"
                      >
                        <Eye size={16} className="mr-2" />
                        Ver cambio
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default LatestChangesModal;