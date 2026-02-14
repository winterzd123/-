
import React, { useState, useEffect } from 'react';
import { AppState, Product, Transaction, TransactionType } from './types';
import { loadState, saveState } from './utils/storage';
import Header from './components/Header';
import InventoryView from './components/InventoryView';
import ProductForm from './components/ProductForm';
import SalesDashboard from './components/SalesDashboard';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({ products: [], transactions: [] });
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales' | 'dashboard'>('inventory');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [recordingProduct, setRecordingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // 出库模态框内部状态
  const [saleQty, setSaleQty] = useState(1);

  useEffect(() => {
    const data = loadState();
    setState(data);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveState(state);
    }
  }, [state, isLoaded]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (recordingProduct) setSaleQty(1);
  }, [recordingProduct]);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const recordTransaction = (product: Product, qty: number, type: TransactionType, note?: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      type,
      quantity: qty,
      totalPrice: type === 'SALE' ? product.price * qty : 0,
      note,
      date: new Date().toISOString(),
    };

    setState(prev => ({
      transactions: [newTransaction, ...prev.transactions],
      products: prev.products.map(p => 
        p.id === product.id ? { ...p, stock: p.stock - qty } : p
      )
    }));
    
    showNotify(`${type === 'SALE' ? '出库成功' : '库存已同步'}: ${product.name} x${Math.abs(qty)}`);
  };

  const handleAddProduct = (product: Product) => {
    setState(prev => {
      const exists = prev.products.some(p => p.id === product.id);
      if (exists) {
        return { ...prev, products: prev.products.map(p => p.id === product.id ? product : p) };
      }
      return { ...prev, products: [product, ...prev.products] };
    });
    setIsFormOpen(false);
    setEditingProduct(undefined);
    showNotify('产品信息已保存');
  };

  const handleAdjustStock = (productId: string, amount: number) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;
    recordTransaction(product, -amount, 'ADJUST', '手动快捷调整');
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col relative bg-slate-50">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`${notification.type === 'success' ? 'bg-indigo-600' : 'bg-red-600'} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3`}>
            <span className="text-xl">{notification.type === 'success' ? '✨' : '⚠️'}</span>
            <span className="font-bold tracking-wide">{notification.message}</span>
          </div>
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800">实时库存</h2>
              <button 
                onClick={() => setIsFormOpen(true)}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center"
              >
                <span className="mr-2">＋</span> 新增产品
              </button>
            </div>
            
            <InventoryView 
              products={state.products} 
              onAdjustStock={handleAdjustStock}
              onEdit={(p) => { setEditingProduct(p); setIsFormOpen(true); }}
              onDelete={(id) => {
                if(confirm('确定删除吗？')) {
                  setState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
                  showNotify('产品已移除');
                }
              }}
              onRecordSale={(p) => setRecordingProduct(p)}
            />
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800">收支流水记录</h2>
              <button 
                onClick={() => { if(confirm('清空所有记录？')) setState(prev => ({...prev, transactions: []})) }}
                className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors"
              >
                清空流水
              </button>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4">时间</th>
                      <th className="px-6 py-4">动作类型</th>
                      <th className="px-6 py-4">产品名称</th>
                      <th className="px-6 py-4 text-right">变动数量</th>
                      <th className="px-6 py-4 text-right">交易金额</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {state.transactions.length > 0 ? (
                      state.transactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                            {new Date(t.date).toLocaleTimeString('zh-CN', {hour12: false, hour:'2-digit', minute:'2-digit'})}
                            <span className="ml-2 opacity-50">{new Date(t.date).toLocaleDateString('zh-CN', {month:'2-digit', day:'2-digit'})}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                              t.type === 'SALE' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {t.type === 'SALE' ? '销售出库' : '库存校准'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-700">{t.productName}</td>
                          <td className={`px-6 py-4 text-sm text-right font-mono font-bold ${t.quantity > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {t.quantity > 0 ? `-${t.quantity}` : `+${Math.abs(t.quantity)}`}
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-black text-slate-900">
                            {t.totalPrice > 0 ? `¥${t.totalPrice.toFixed(2)}` : '--'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-slate-300 italic">等待第一笔流水记录...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <SalesDashboard transactions={state.transactions} products={state.products} />
        )}
      </main>

      {recordingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-900 mb-2">确认出库销售</h3>
            <p className="text-slate-500 text-sm mb-6">正在为 <span className="font-bold text-slate-800">{recordingProduct.name}</span> 登记销售记录</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">出库数量</label>
                <div className="flex items-center justify-between bg-slate-100 rounded-2xl p-2">
                   <button 
                    onClick={() => setSaleQty(q => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center text-2xl font-bold text-slate-400 hover:text-slate-600"
                   >-</button>
                   <input 
                    type="number" 
                    value={saleQty}
                    onChange={(e) => setSaleQty(Math.min(recordingProduct.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="bg-transparent text-center text-2xl font-black text-slate-900 w-full outline-none" 
                   />
                   <button 
                    onClick={() => setSaleQty(q => Math.min(recordingProduct.stock, q + 1))}
                    className="w-12 h-12 flex items-center justify-center text-2xl font-bold text-slate-400 hover:text-slate-600"
                   >+</button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-right">可用库存: {recordingProduct.stock}</p>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setRecordingProduct(null)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >取消</button>
                <button 
                  onClick={() => {
                    if(saleQty > 0 && saleQty <= recordingProduct.stock) {
                      recordTransaction(recordingProduct, saleQty, 'SALE');
                      setRecordingProduct(null);
                    } else {
                      showNotify('数量无效或库存不足', 'error');
                    }
                  }}
                  className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >确认出库</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <ProductForm 
          onAdd={handleAddProduct} 
          onClose={() => { setIsFormOpen(false); setEditingProduct(undefined); }}
          initialProduct={editingProduct}
        />
      )}
    </div>
  );
};

export default App;
