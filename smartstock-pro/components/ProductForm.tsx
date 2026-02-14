
import React, { useState, useRef } from 'react';
import { Product } from '../types';
import { suggestProductCategory } from '../services/geminiService';

interface ProductFormProps {
  onAdd: (product: Product) => void;
  onClose: () => void;
  initialProduct?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({ onAdd, onClose, initialProduct }) => {
  const [name, setName] = useState(initialProduct?.name || '');
  const [price, setPrice] = useState(initialProduct?.price.toString() || '');
  const [stock, setStock] = useState(initialProduct?.stock.toString() || '');
  const [category, setCategory] = useState(initialProduct?.category || '');
  const [imageUrl, setImageUrl] = useState(initialProduct?.imageUrl || '');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAiCategorize = async () => {
    if (!name) return;
    setIsAiLoading(true);
    const cat = await suggestProductCategory(name);
    setCategory(cat);
    setIsAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: initialProduct?.id || Date.now().toString(),
      name,
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      imageUrl: imageUrl || `https://picsum.photos/seed/${name}/400/400`,
      category: category || '其他',
      createdAt: initialProduct?.createdAt || new Date().toISOString(),
    };
    onAdd(product);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-8">
          <h2 className="text-2xl font-black mb-8 text-slate-900">
            {initialProduct ? '编辑产品' : '新增入库'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">产品名称</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                  placeholder="输入名称..."
                />
                <button
                  type="button"
                  onClick={handleAiCategorize}
                  disabled={!name || isAiLoading}
                  className="px-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                >{isAiLoading ? '...' : '✨'}</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">售价 (¥)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">初始库存</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">分类</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                placeholder="例如: 数码/家居"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">产品图片</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 flex justify-center p-6 border-2 border-slate-100 border-dashed rounded-3xl cursor-pointer hover:bg-slate-50 transition-colors"
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="预览" className="h-32 w-32 object-cover rounded-2xl" />
                ) : (
                  <div className="text-center">
                    <div className="text-3xl mb-2 text-slate-300">📸</div>
                    <div className="text-xs text-slate-400 font-bold">点击上传或拍照</div>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
              >取消</button>
              <button
                type="submit"
                className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >保存信息</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
