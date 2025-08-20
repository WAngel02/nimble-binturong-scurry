import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import HeaderAdmin from '../HeaderAdmin';

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:pl-64 flex flex-col flex-1">
        <HeaderAdmin />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;