
import React, { useState, useEffect } from 'react';
import { ProcessingStep, DatasetStats, DataColumn } from './types';
import MissingValueChart from './components/MissingValueChart';
import { getInterviewGuidance } from './services/geminiService';

const MOCK_DATASET: DatasetStats = {
  totalRows: 1460,
  totalCols: 10,
  columns: [
    { name: 'LotFrontage', type: 'numeric', missingCount: 259, totalCount: 1460, mean: 70.04, median: 69 },
    { name: 'Alley', type: 'categorical', missingCount: 1369, totalCount: 1460, mode: 'Grvl' },
    { name: 'MasVnrType', type: 'categorical', missingCount: 8, totalCount: 1460, mode: 'None' },
    { name: 'GarageYrBlt', type: 'numeric', missingCount: 81, totalCount: 1460, mean: 1978.5, median: 1980 },
    { name: 'PoolQC', type: 'categorical', missingCount: 1453, totalCount: 1460, mode: 'Ex' },
    { name: 'Fence', type: 'categorical', missingCount: 1179, totalCount: 1460, mode: 'MnPrv' },
    { name: 'FireplaceQu', type: 'categorical', missingCount: 690, totalCount: 1460, mode: 'Gd' },
    { name: 'SalePrice', type: 'numeric', missingCount: 0, totalCount: 1460, mean: 180921, median: 163000 },
    { name: 'OverallQual', type: 'numeric', missingCount: 0, totalCount: 1460, mean: 6.09, median: 6 },
    { name: 'Neighborhood', type: 'categorical', missingCount: 0, totalCount: 1460, mode: 'NAmes' },
  ]
};

const INTERVIEW_QUESTIONS = [
  "Mean vs median imputation?",
  "When should rows be dropped?",
  "Why missing data is harmful?",
  "What is data leakage?",
  "What is data quality?"
];

const App: React.FC = () => {
  const [step, setStep] = useState<ProcessingStep>(ProcessingStep.UPLOAD);
  const [dataset, setDataset] = useState<DatasetStats>(MOCK_DATASET);
  const [originalDataset, setOriginalDataset] = useState<DatasetStats>(MOCK_DATASET);
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({});
  const [loadingAnswer, setLoadingAnswer] = useState<string | null>(null);

  const handleClean = (type: 'mean' | 'median' | 'mode' | 'drop_high') => {
    let newCols = [...dataset.columns];
    
    if (type === 'drop_high') {
      newCols = newCols.filter(col => (col.missingCount / col.totalCount) < 0.5);
    } else {
      newCols = newCols.map(col => {
        if (col.missingCount > 0) {
          if (type === 'mode' && col.type === 'categorical') {
            return { ...col, missingCount: 0 };
          }
          if ((type === 'mean' || type === 'median') && col.type === 'numeric') {
            return { ...col, missingCount: 0 };
          }
        }
        return col;
      });
    }

    setDataset({ ...dataset, columns: newCols });
  };

  const fetchAnswer = async (q: string) => {
    setLoadingAnswer(q);
    try {
      const ans = await getInterviewGuidance(q);
      setInterviewAnswers(prev => ({ ...prev, [q]: ans }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAnswer(null);
    }
  };

  const renderSidebar = () => (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">D</div>
        <h1 className="text-xl font-bold text-white tracking-tight">Precision</h1>
      </div>
      <nav className="flex-1 py-6">
        <button 
          onClick={() => setStep(ProcessingStep.UPLOAD)}
          className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${step === ProcessingStep.UPLOAD ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
        >
          <i className="fas fa-file-upload"></i> Dataset Source
        </button>
        <button 
          onClick={() => setStep(ProcessingStep.CLEANING)}
          className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${step === ProcessingStep.CLEANING ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
        >
          <i className="fas fa-broom"></i> Data Refinement
        </button>
        <button 
          onClick={() => setStep(ProcessingStep.REVIEW)}
          className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${step === ProcessingStep.REVIEW ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
        >
          <i className="fas fa-check-double"></i> Validation
        </button>
        <button 
          onClick={() => setStep(ProcessingStep.INTERVIEW_PREP)}
          className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${step === ProcessingStep.INTERVIEW_PREP ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}
        >
          <i className="fas fa-graduation-cap"></i> Knowledge Hub
        </button>
      </nav>
      <div className="p-6 border-t border-slate-800 text-xs text-slate-500">
        Professional Series • v2.0
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {renderSidebar()}
      
      <main className="ml-64 p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {step === ProcessingStep.UPLOAD && "Select Source Material"}
              {step === ProcessingStep.CLEANING && "Refinement & Imputation"}
              {step === ProcessingStep.REVIEW && "Dataset Integrity Report"}
              {step === ProcessingStep.INTERVIEW_PREP && "Technical Concepts"}
            </h2>
            <p className="text-slate-500">Workspace / {step.replace('_', ' ')}</p>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all">
              <i className="fas fa-download"></i> Export Results
            </button>
          </div>
        </header>

        {step === ProcessingStep.UPLOAD && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm border-dashed border-2 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4">
                <i className="fas fa-cloud-upload-alt text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Custom Dataset</h3>
              <p className="text-slate-500 mb-6">Drag and drop your CSV or Excel files here</p>
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Browse Files
              </button>
            </div>
            
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Standard Industry Sets</h3>
              <div className="space-y-4">
                <div className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-lg">
                      <i className="fas fa-home"></i>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Property Valuation</p>
                      <p className="text-xs text-slate-400">1460 Rows • 81 Columns</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300 group-hover:text-indigo-400 transition-colors"></i>
                </div>
                <div className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-lg">
                      <i className="fas fa-hospital-user"></i>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Medical Engagement</p>
                      <p className="text-xs text-slate-400">110k Rows • 14 Columns</p>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right text-slate-300 group-hover:text-indigo-400 transition-colors"></i>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === ProcessingStep.CLEANING && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <MissingValueChart data={dataset.columns} />
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Refinement Controls</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleClean('mean')}
                    className="w-full text-left px-4 py-3 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all flex items-center justify-between"
                  >
                    <span>Mean Imputation (Numeric)</span>
                    <i className="fas fa-magic"></i>
                  </button>
                  <button 
                    onClick={() => handleClean('median')}
                    className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl hover:bg-purple-100 transition-all flex items-center justify-between"
                  >
                    <span>Median Imputation (Numeric)</span>
                    <i className="fas fa-calculator"></i>
                  </button>
                  <button 
                    onClick={() => handleClean('mode')}
                    className="w-full text-left px-4 py-3 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl hover:bg-amber-100 transition-all flex items-center justify-between"
                  >
                    <span>Mode Imputation (Categorical)</span>
                    <i className="fas fa-tags"></i>
                  </button>
                  <button 
                    onClick={() => handleClean('drop_high')}
                    className="w-full text-left px-4 py-3 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl hover:bg-rose-100 transition-all flex items-center justify-between"
                  >
                    <span>Prune Insufficient Columns (&gt;50%)</span>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Schema Review</h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  {dataset.columns.length} Features
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Column Name</th>
                      <th className="px-6 py-3 font-semibold">Classification</th>
                      <th className="px-6 py-3 font-semibold">Missing Count</th>
                      <th className="px-6 py-3 font-semibold">Fill Rate</th>
                      <th className="px-6 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dataset.columns.map((col, idx) => {
                      const fillRate = ((1 - col.missingCount / col.totalCount) * 100).toFixed(1);
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{col.name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${col.type === 'numeric' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                              {col.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{col.missingCount}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${parseFloat(fillRate) > 80 ? 'bg-emerald-500' : parseFloat(fillRate) > 50 ? 'bg-amber-400' : 'bg-rose-500'}`}
                                  style={{ width: `${fillRate}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500">{fillRate}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-indigo-600 hover:text-indigo-800 font-medium">Configure</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {step === ProcessingStep.REVIEW && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-2 uppercase tracking-wide font-semibold">Initial Dimensions</p>
                <p className="text-4xl font-bold text-slate-800">{originalDataset.totalRows} × {originalDataset.totalCols}</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm border-indigo-100">
                <p className="text-slate-500 text-sm mb-2 uppercase tracking-wide font-semibold">Processed Dimensions</p>
                <p className="text-4xl font-bold text-indigo-600">{dataset.totalRows} × {dataset.columns.length}</p>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-sm mb-2 uppercase tracking-wide font-semibold">Health Score</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-4xl font-bold text-emerald-500">98.2</span>
                  <span className="text-emerald-500"><i className="fas fa-arrow-up"></i></span>
                </div>
              </div>
            </div>

            <div className="bg-indigo-900 rounded-3xl p-10 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 bg-indigo-500/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <i className="fas fa-check-circle text-4xl"></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Refinement Successful</h3>
                  <p className="text-indigo-200 max-w-lg">The dataset has been successfully processed. All critical missing values have been addressed using selected imputation strategies. Integrity checks passed for standard ML workflows.</p>
                </div>
                <div className="ml-auto">
                  <button className="px-8 py-3 bg-white text-indigo-900 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-colors">
                    Download Refined Pack
                  </button>
                </div>
              </div>
              {/* Background abstract shapes */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-24 -mb-24 blur-3xl"></div>
            </div>
          </div>
        )}

        {step === ProcessingStep.INTERVIEW_PREP && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {INTERVIEW_QUESTIONS.map((q, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-slate-800 text-lg flex gap-3">
                      <span className="text-indigo-500">Q{idx + 1}.</span> {q}
                    </h4>
                    {!interviewAnswers[q] && (
                      <button 
                        onClick={() => fetchAnswer(q)}
                        disabled={loadingAnswer === q}
                        className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                      >
                        {loadingAnswer === q ? <i className="fas fa-spinner fa-spin"></i> : "View Explanation"}
                      </button>
                    )}
                  </div>
                  {interviewAnswers[q] && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl text-slate-700 leading-relaxed text-sm animate-in slide-in-from-top-2 duration-300">
                      {interviewAnswers[q]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="bg-slate-900 text-white rounded-3xl p-8 sticky top-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <i className="fas fa-lightbulb text-amber-400"></i> Expert Advice
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-400">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-indigo-400 mb-1">On Imputation</p>
                    <p className="text-sm text-slate-400">Never impute before splitting your data into training and testing sets. This prevents data leakage.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 text-slate-400">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-rose-400 mb-1">On Dropping Rows</p>
                    <p className="text-sm text-slate-400">Drop rows only if the missing data is minimal (&lt;5%) and occurs randomly. Otherwise, you risk introducing bias.</p>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-800">
                  <p className="text-slate-500 text-xs italic">"Clean data is the foundation of every high-performance predictive system."</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
