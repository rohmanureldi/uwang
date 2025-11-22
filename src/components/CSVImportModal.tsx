import { useState } from 'react';
import { Transaction } from '../types';
import { X, Upload, Check } from 'lucide-react';
import { formatIDR } from '../utils/currency';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onImport: (transactions: Omit<Transaction, 'id'>[], walletId: string) => void;
  wallets: Array<{ id: string; name: string; color?: string; icon?: string; }>;
}

export default function CSVImportModal({ isOpen, onClose, onImport, wallets }: Props) {
  const [csvData, setCsvData] = useState<Omit<Transaction, 'id'>[]>([]);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [step, setStep] = useState<'upload' | 'preview'>('upload');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const parsedTransactions: Omit<Transaction, 'id'>[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        if (values.length >= 6) {
          parsedTransactions.push({
            date: values[0],
            time: values[1] || '',
            type: values[2].toLowerCase() === 'income' ? 'income' : 'expense',
            amount: parseFloat(values[3]) || 0,
            category: values[4],
            description: values[5],
            subcategory: values[6] || ''
          });
        }
      }
      
      setCsvData(parsedTransactions);
      setStep('preview');
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleImport = () => {
    if (!selectedWallet || csvData.length === 0) return;
    
    const transactionsWithWallet = csvData.map(t => ({
      ...t,
      wallet_id: selectedWallet === 'global' ? undefined : selectedWallet
    }));
    
    onImport(transactionsWithWallet, selectedWallet);
    handleClose();
  };

  const handleClose = () => {
    setCsvData([]);
    setSelectedWallet('');
    setStep('upload');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(10px)' }}>
      <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Import CSV</h3>
            <p className="text-sm text-gray-400">
              {step === 'upload' ? 'Upload your CSV file' : `Preview ${csvData.length} transactions`}
            </p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'upload' ? (
            <div className="text-center py-12">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">Upload CSV File</h4>
              <p className="text-gray-400 mb-6">Select a CSV file with format: Date, Time, Type, Amount, Category, Description</p>
              
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                Choose CSV File
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-white">Select Wallet</h4>
                  <p className="text-sm text-gray-400">Choose which wallet to assign these transactions to</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="bg-gray-800 border border-gray-600 text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="">Pilih Wallet</option>
                    {wallets.filter(w => w.id !== 'global').map(wallet => (
                      <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border border-gray-600 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-300">Date</th>
                      <th className="px-3 py-2 text-left text-gray-300">Type</th>
                      <th className="px-3 py-2 text-right text-gray-300">Amount</th>
                      <th className="px-3 py-2 text-left text-gray-300">Category</th>
                      <th className="px-3 py-2 text-left text-gray-300">Subcategory</th>
                      <th className="px-3 py-2 text-left text-gray-300">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvData.map((transaction, index) => (
                      <tr key={index} className="border-t border-gray-700 hover:bg-gray-800">
                        <td className="px-3 py-2 text-gray-300">{transaction.date}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            transaction.type === 'income' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={`px-3 py-2 text-right font-medium ${
                          transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatIDR(transaction.amount)}
                        </td>
                        <td className="px-3 py-2 text-gray-300">{transaction.category}</td>
                        <td className="px-3 py-2 text-gray-300">{transaction.subcategory || '-'}</td>
                        <td className="px-3 py-2 text-gray-300">{transaction.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-700 flex justify-between">
          {step === 'preview' && (
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            {step === 'preview' && (
              <button
                onClick={handleImport}
                disabled={!selectedWallet}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Import {csvData.length} Transactions
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}