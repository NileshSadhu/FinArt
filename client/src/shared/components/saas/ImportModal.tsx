import { useState, useRef, type FC, type ChangeEvent, type DragEvent } from 'react';
import toast from 'react-hot-toast';
import {
  FileSpreadsheet,
  X,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { Account } from '../../services/api/accountService';
import transactionService from '../../services/api/transactionService';
import { getApiErrorMessage } from '../../utils/validation';

export interface ImportModalProps {
  isOpen: boolean;
  accounts: Account[];
  onClose: () => void;
  onSuccess: (result: {
    importedCount: number;
    skippedCount: number;
    errors: string[];
  }) => void;
}

export const ImportModal: FC<ImportModalProps> = ({
  isOpen,
  accounts,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [defaultAccountId, setDefaultAccountId] = useState<string>(
    accounts[0]?.id ?? '',
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (f: File) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const lowerName = f.name.toLowerCase();
    const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      toast.error('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }

    if (f.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setFile(f);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select an Excel or CSV file to import');
      return;
    }

    const targetAccountId = defaultAccountId || accounts[0]?.id;
    if (!targetAccountId) {
      toast.error('Please select a default account for imported entries');
      return;
    }

    setIsImporting(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Extract base64 portion from data URL
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(base64);
        };
        reader.onerror = (error) => reject(error);
      });

      reader.readAsDataURL(file);
      const fileBase64 = await base64Promise;

      const result = await transactionService.importTransactions(
        fileBase64,
        file.name,
        targetAccountId,
      );

      onSuccess(result);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to import transactions'));
    } finally {
      setIsImporting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      onClick={(e) =>
        e.target === e.currentTarget && !isImporting && onClose()
      }
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-neutral-100 overflow-hidden">
        {/* ── Dark header band ── */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-700 px-6 pt-6 pb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white leading-tight">
              Import Transactions
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              FinArt · Excel (.xlsx, .xls) & CSV Import
            </p>
          </div>
          {!isImporting && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Modal Body ── */}
        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* File Upload Drop Area */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${isDragging
                  ? 'border-neutral-900 bg-neutral-50'
                  : 'border-neutral-200 hover:border-neutral-400 bg-neutral-50/50'
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center mx-auto mb-3 text-neutral-600">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-neutral-800">
                Click to browse or drag and drop file here
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv) up to 10MB
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              {!isImporting && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-200/60 transition-colors cursor-pointer"
                  title="Remove selected file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Account Mapping Selection */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-1.5">
              Default Account <span className="text-red-500">*</span>
            </label>
            <select
              value={defaultAccountId || accounts[0]?.id || ''}
              onChange={(e) => setDefaultAccountId(e.target.value)}
              disabled={isImporting}
              className="w-full h-10 px-3 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-colors cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type} · {acc.currency})
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-400 mt-1">
              Used if the file does not specify an account or if an account name does not match.
            </p>
          </div>

          {/* Relationships & Constraints Notice */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-neutral-600 shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-600 leading-relaxed space-y-1">
                <p className="font-semibold text-neutral-900">
                  Automatic Constraint & Relationship Handling
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-neutral-500">
                  <li>
                    <strong className="text-neutral-700">Accounts & Categories:</strong> Matched by name automatically (e.g. &ldquo;Cash&rdquo;, &ldquo;Food&rdquo;).
                  </li>
                  <li>
                    <strong className="text-neutral-700">Double-Entry:</strong> Entries are balanced automatically according to transaction type (Expense / Income).
                  </li>
                  <li>
                    <strong className="text-neutral-700">Compatible:</strong> Re-import any Excel file exported from FinArt, or your bank CSV.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Template Download Link */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={transactionService.downloadSampleCsv}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-black transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Sample CSV Template
            </button>
            {file && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready to import
              </span>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 pt-2 flex items-center gap-2.5 border-t border-neutral-100">
          <button
            type="button"
            disabled={isImporting}
            onClick={onClose}
            className="flex-1 py-2 px-4 rounded-full text-sm font-medium border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!file || isImporting || accounts.length === 0}
            onClick={handleImport}
            className="flex-1 py-2 px-4 rounded-full text-sm font-semibold bg-neutral-900 hover:bg-black text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isImporting ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Importing…
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Import Transactions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
