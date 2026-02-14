
import React from 'react';

interface HeaderProps {
  activeTab: 'inventory' | 'sales' | 'dashboard';
  setActiveTab: (tab: 'inventory' | 'sales' | 'dashboard') => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <span className="text-white font-black text-xl italic">S</span>
            </div>
            <h1 className="text-xl font-black text-slate-800 hidden sm:block tracking-tight">SmartStock <span className="text-indigo-600">Pro</span></h1>
          </div>
          <nav className="flex space-x-1 sm:space-x-4">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >库存</button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'sales' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >流水</button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >概览</button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
