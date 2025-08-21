import React from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Authorization } from '../types';

interface CancelCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  authorization: Authorization | null;
}

const CancelCodeModal: React.FC<CancelCodeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  authorization
}) => {
  if (!authorization) return null;

  const consumed = authorization.cantidadS - authorization.sRestantes;
  const hasServices = consumed > 0;

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
                  No se puede anular este código único porque tiene servicios asociados.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm font-medium">
                    Código: {authorization.codigoUnico}<br />
                    Servicios consumidos: {consumed} de {authorization.cantidadS}
                  </p>
                </div>
                <p className="text-gray-600 text-sm mt-3">
                  Para anular este código, primero debe eliminar todos los servicios asociados.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-700 mb-4">
                  ¿Está seguro de que desea anular el código único?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-medium">
                    Código: {authorization.codigoUnico}<br />
                    Usuario: {authorization.nombreCompleto}<br />
                    Servicios restantes: {authorization.sRestantes}
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
                Anular código
              </button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default CancelCodeModal;

