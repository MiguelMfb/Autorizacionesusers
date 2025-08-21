import React from 'react';
import {
  PieChart,
  Briefcase,
  Users,
  FileCheck,
  BarChart3,
  MapPin,
  Car
} from 'lucide-react';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ElementType;
  isSubItem?: boolean;
  parentKey?: string;
  hasSubIndicator?: boolean;
  enabled?: boolean;
}

interface SidebarProps {
  isCollapsed: boolean;
  activeItem: string;
  onNavigate: (viewKey: string) => void;
}

const menuItems: MenuItem[] = [
  { key: 'panel', label: 'Panel interactivo', icon: PieChart, enabled: false },
  { key: 'servicios', label: 'Gestión de servicios', icon: Briefcase, enabled: false },
  { key: 'conductores', label: 'Gestión de Conductores', icon: Car, enabled: false },
  { key: 'usuarios', label: 'Gestión de usuarios', icon: Users, enabled: true },
  { key: 'autorizaciones', label: 'Gestión de autorizaciones', icon: FileCheck, enabled: true },
  { key: 'reportes', label: 'Reportes', icon: BarChart3, hasSubIndicator: true, enabled: false },
  { key: 'geo', label: 'Geolocalizador', icon: MapPin, enabled: false },
];

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  activeItem,
  onNavigate
}) => {
  return (
    <div 
      className={`bg-slate-900 text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      } min-h-screen flex flex-col`}
    >
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-700 flex justify-center items-center">
          <img 
            src="https://web.tnrapp.com.co/assets/image/logo-menu.png"
            alt="Logo"
            className="h-8"
          />
        </div>
      )}

      <nav className="flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === activeItem;
          const indentClass = item.isSubItem ? (isCollapsed ? '' : 'ml-4') : '';

          return (
            <button
              key={item.key}
              onClick={() => item.enabled && onNavigate(item.key)}
              disabled={!item.enabled}
              className={`
                w-full flex items-center px-4 py-3 transition-colors duration-200
                ${indentClass}
                ${isActive ? 'bg-slate-700' : item.enabled ? 'hover:bg-slate-800' : 'opacity-50 cursor-not-allowed'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 whitespace-nowrap">{item.label}</span>
              )}
              {!isCollapsed && item.hasSubIndicator && (
                <span className="ml-auto">›</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;