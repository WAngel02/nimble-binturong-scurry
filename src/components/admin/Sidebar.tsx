import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Calendar,
  Users,
  Stethoscope,
  Shield,
  Settings,
  HelpCircle,
  Hospital,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavigation = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutGrid },
  { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
];

const otherNavigation = [
  { name: 'Patients', href: '/admin/pacientes', icon: Users },
  { name: 'Doctors', href: '/admin/doctores', icon: Stethoscope },
  { name: 'Administration', href: '/admin/administration', icon: Shield },
];

const helpNavigation = [
  { name: 'Help & Center', href: '/admin/help', icon: HelpCircle },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();

  const renderNavLinks = (navItems: typeof mainNavigation) => {
    return navItems.map((item) => (
      <Link
        key={item.name}
        to={item.href}
        className={cn(
          'group flex items-center rounded-md px-3 py-2 text-sm font-medium',
          location.pathname.startsWith(item.href)
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
        )}
      >
        <item.icon
          className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/80"
          aria-hidden="true"
        />
        {item.name}
      </Link>
    ));
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-sidebar border-r border-sidebar-border overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 space-x-2">
          <div className="bg-primary p-2 rounded-lg">
            <Hospital className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-primary">Vitalis</span>
        </div>
        
        <div className="mt-8 flex-1 flex flex-col px-4">
          <nav className="flex-1 space-y-4">
            <div>
              <h3 className="px-3 text-xs font-semibold uppercase text-sidebar-foreground/60 tracking-wider">
                Main Menu
              </h3>
              <div className="mt-2 space-y-1">
                {renderNavLinks(mainNavigation)}
              </div>
            </div>
            <div>
              <h3 className="px-3 text-xs font-semibold uppercase text-sidebar-foreground/60 tracking-wider">
                Other Menu
              </h3>
              <div className="mt-2 space-y-1">
                {renderNavLinks(otherNavigation)}
              </div>
            </div>
            <div>
              <h3 className="px-3 text-xs font-semibold uppercase text-sidebar-foreground/60 tracking-wider">
                Help & Settings
              </h3>
              <div className="mt-2 space-y-1">
                {renderNavLinks(helpNavigation)}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;