import { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { parseCSV, downloadSampleCSV } from '@/lib/csvImporter';
import { useCSVImport } from '@/hooks/useCSVImport';
import { useCategories } from '@/hooks/useCategories';

interface ImportCSVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportCSVModal({ isOpen, onClose }: ImportCSVModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parseErrors, setParseErrors] = useState<Array<{ row: number; message: string }>>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: categories = [] } = useCategories();
  const importMutation = useCSVImport();

  const handleDownloadTemplate = () => {
    downloadSampleCSV();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseErrors([]);
    setPreviewData([]);

    try {
      const text = await file.text();
      const result = parseCSV(text, categories);

      if (!result.success) {
        setParseErrors(result.errors || []);
      } else {
        setPreviewData(result.data || []);
        if (result.errors && result.errors.length > 0) {
          setParseErrors(result.errors);
        }
      }
    } catch (error) {
      setParseErrors([
        {
          row: 0,
          message: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ]);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    setIsLoading(true);
    try {
      await importMutation.mutateAsync(previewData);
      setPreviewData([]);
      setParseErrors([]);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParseErrors([]);
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Download a template, fill it with your transactions, and upload it here.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Download Template */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Step 1: Download Template</h3>
            <p className="text-sm text-muted-foreground">
              Download the CSV template to see the required format and example data.
            </p>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              Download Sample CSV
            </Button>
          </div>

          {/* Step 2: Upload File */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Step 2: Upload Your File</h3>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">
                {selectedFile ? selectedFile.name : 'Click or drag CSV file here'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supported format: CSV (Comma-Separated Values)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Parse Errors */}
          {parseErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    {parseErrors.length} error{parseErrors.length !== 1 ? 's' : ''} found:
                  </p>
                  <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                    {parseErrors.map((err, idx) => (
                      <li key={idx}>
                        Row {err.row}: {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Preview</h3>
                <Badge variant="secondary">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {previewData.length} transaction{previewData.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted">
                        <th className="px-3 py-2 text-left font-medium">Description</th>
                        <th className="px-3 py-2 text-left font-medium">Amount</th>
                        <th className="px-3 py-2 text-left font-medium">Type</th>
                        <th className="px-3 py-2 text-left font-medium">Date</th>
                        <th className="px-3 py-2 text-left font-medium">Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((tx, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="px-3 py-2">{tx.description}</td>
                          <td className="px-3 py-2">₹{tx.amount.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2">
                            <Badge variant={tx.type === 'INCOME' ? 'default' : 'secondary'}>
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="px-3 py-2">{tx.transaction_date}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {tx.category_id ? (
                              categories.find(c => c.id === tx.category_id)?.name || 'Unknown'
                            ) : (
                              'Uncategorized'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 5 && (
                  <div className="px-3 py-2 bg-muted text-xs text-muted-foreground text-center">
                    +{previewData.length - 5} more transaction{previewData.length - 5 !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={previewData.length === 0 || isLoading || importMutation.isPending}
              className="gap-2"
            >
              {isLoading || importMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-current" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import {previewData.length > 0 && `${previewData.length} Transaction${previewData.length !== 1 ? 's' : ''}`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
