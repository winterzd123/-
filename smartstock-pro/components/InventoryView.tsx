
import React from 'react';
import { Product } from '../types';

interface InventoryViewProps {
  products: Product[];
  onAdjustStock: (productId: string, amount: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onRecordSale: (product: Product) => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ products, onAdjustStock, onEdit, onDelete, onRecordSale }) => {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-300">
        <div className="text-6xl mb-6">📦</div>
        <p className="text-lg font-bold">仓库空空如也</p>
        <p className="text-sm">点击右上角“新增产品”开始管理</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all overflow-hidden border border-slate-50 group relative">
          <div className="relative h-56 overflow-hidden">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
              <button onClick={() => onEdit(product)} className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-indigo-600 shadow-xl hover:bg-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              <button onClick={() => onDelete(product.id)} className="p-3 bg-white/90 backdrop-blur-md rounded-2xl text-red-600 shadow-xl hover:bg-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-md text-indigo-600 text-[10px] font-black rounded-lg uppercase tracking-widest shadow-sm">
              {product.category}
            </div>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-black text-slate-800 line-clamp-1">{product.name}</h3>
              <span className="text-indigo-600 font-black text-lg">¥{product.price.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-4 bg-slate-50 p-2 rounded-2xl">
                <button 
                  onClick={() => onAdjustStock(product.id, -1)}
                  disabled={product.stock <= 0}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm hover:shadow-md disabled:opacity-50 transition-all font-bold"
                >-</button>
                <div className="text-center px-1">
                  <div className={`text-xl font-black ${product.stock < 5 ? 'text-red-500' : 'text-slate-800'}`}>{product.stock}</div>
                  <div className="text-[8px] uppercase text-slate-400 font-black tracking-widest">库存</div>
                </div>
                <button 
                  onClick={() => onAdjustStock(product.id, 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm hover:shadow-md transition-all font-bold"
                >+</button>
              </div>
              
              <button
                onClick={() => onRecordSale(product)}
                disabled={product.stock <= 0}
                className="px-6 py-3 bg-indigo-600 text-white text-xs font-black rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-200 transition-all shadow-lg shadow-indigo-100"
              >出库记录</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryView;
