
import React, { useMemo, useState } from 'react';
import { Transaction, Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getInventoryInsights } from '../services/geminiService';

interface SalesDashboardProps {
  transactions: Transaction[];
  products: Product[];
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ transactions, products }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);

  const getLocalDateKey = (date: Date) => date.toLocaleDateString('sv-SE');

  const stats = useMemo(() => {
    const todayStr = getLocalDateKey(new Date());
    const salesOnly = transactions.filter(t => t.type === 'SALE');
    const todayTransactions = salesOnly.filter(t => getLocalDateKey(new Date(t.date)) === todayStr);
    
    const totalRevenue = todayTransactions.reduce((acc, t) => acc + t.totalPrice, 0);
    const totalUnits = todayTransactions.reduce((acc, t) => acc + t.quantity, 0);
    
    const last7Days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days[getLocalDateKey(date)] = 0;
    }
    
    salesOnly.forEach(t => {
      const dKey = getLocalDateKey(new Date(t.date));
      if (last7Days[dKey] !== undefined) last7Days[dKey] += t.totalPrice;
    });

    const chartData = Object.entries(last7Days).map(([date, amount]) => ({
      date: date.split('-').slice(1).join('/'),
      amount
    }));

    return { totalRevenue, totalUnits, chartData, todayTransactions };
  }, [transactions]);

  const generateInsights = async () => {
    if (products.length === 0) return;
    setIsInsightsLoading(true);
    try {
      const res = await getInventoryInsights(products, transactions);
      setInsights(res || '无法生成建议');
    } catch (e) {
      setInsights('AI 助手暂时离线');
    } finally {
      setIsInsightsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">今日总销 (¥)</p>
          <h2 className="text-3xl font-black text-indigo-600 mt-2">{stats.totalRevenue.toFixed(2)}</h2>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">今日出库 (件)</p>
          <h2 className="text-3xl font-black text-slate-800 mt-2">{stats.totalUnits}</h2>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xs font-black text-slate-800 mb-6 flex items-center uppercase tracking-widest">
          <span className="w-1 h-4 bg-indigo-600 rounded-full mr-2"></span>销售趋势 (7日)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {stats.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === stats.chartData.length - 1 ? '#4f46e5' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden border-4 border-indigo-500">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-lg">✨ AI 商业洞察</h3>
            <button 
              onClick={generateInsights}
              disabled={isInsightsLoading}
              className="px-6 py-2 bg-white text-indigo-900 rounded-full text-xs font-bold transition-all disabled:opacity-50"
            >{isInsightsLoading ? '分析中...' : '生成最新分析'}</button>
          </div>
          <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-xl border border-white/10">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{insights || "点击分析按钮获取经营策略。"}</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </div>
    </div>
  );
};

export default SalesDashboard;
