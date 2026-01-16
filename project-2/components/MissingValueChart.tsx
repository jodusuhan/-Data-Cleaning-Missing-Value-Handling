
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DataColumn } from '../types';

interface Props {
  data: DataColumn[];
}

const MissingValueChart: React.FC<Props> = ({ data }) => {
  const chartData = data.map(col => ({
    name: col.name,
    missing: col.missingCount,
    percentage: ((col.missingCount / col.totalCount) * 100).toFixed(1)
  })).sort((a, b) => b.missing - a.missing);

  return (
    <div className="h-80 w-full bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Missing Values Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            interval={0} 
            fontSize={12}
            stroke="#64748b"
          />
          <YAxis stroke="#64748b" />
          <Tooltip 
            cursor={{fill: '#f1f5f9'}}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="missing" fill="#6366f1" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={parseFloat(entry.percentage) > 30 ? '#ef4444' : '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MissingValueChart;
