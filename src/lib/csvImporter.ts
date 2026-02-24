import { CreateTransactionInput, TransactionType } from '@/types/finance';

export interface CSVRow {
  description: string;
  amount: string;
  type: string;
  date: string;
  category?: string;
  notes?: string;
}

interface ParseCSVResult {
  success: boolean;
  data?: CreateTransactionInput[];
  errors?: Array<{ row: number; message: string }>;
}

/**
 * CSV format specification:
 * - Headers: description, amount, type, date, category (optional), notes (optional)
 * - type: EXPENSE or INCOME
 * - date: YYYY-MM-DD format
 * - amount: positive number (decimals allowed)
 */
export function generateSampleCSV(): string {
  const headers = ['description', 'amount', 'type', 'date', 'category', 'notes'];
  const sampleData = [
    ['Coffee', '4.50', 'EXPENSE', new Date().toISOString().slice(0, 10), 'Food', 'Morning coffee'],
    ['Grocery Shopping', '125.00', 'EXPENSE', new Date(Date.now() - 86400000).toISOString().slice(0, 10), 'Groceries', 'Weekly groceries'],
    ['Freelance Project', '500.00', 'INCOME', new Date(Date.now() - 172800000).toISOString().slice(0, 10), 'Income', 'Client payment'],
    ['Gas', '45.75', 'EXPENSE', new Date(Date.now() - 259200000).toISOString().slice(0, 10), 'Transport', 'Monthly fuel'],
  ];

  const rows = [headers, ...sampleData].map(row => 
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(cell).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    }).join(',')
  );

  return rows.join('\n');
}

export function downloadSampleCSV(): void {
  const csv = generateSampleCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'sample_transactions.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSV(csvText: string, categories: any[] = []): ParseCSVResult {
  const errors: Array<{ row: number; message: string }> = [];
  const data: CreateTransactionInput[] = [];

  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      return { success: false, errors: [{ row: 0, message: 'CSV must have at least a header and one data row' }] };
    }

    const headers = parseCSVLine(lines[0]);
    const requiredHeaders = ['description', 'amount', 'type', 'date'];
    const hasRequiredHeaders = requiredHeaders.every(h => 
      headers.includes(h.toLowerCase())
    );

    if (!hasRequiredHeaders) {
      return { 
        success: false, 
        errors: [{ 
          row: 0, 
          message: `CSV must have headers: ${requiredHeaders.join(', ')}` 
        }] 
      };
    }

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      try {
        const values = parseCSVLine(line);
        const row: any = {};
        
        headers.forEach((header, idx) => {
          row[header.toLowerCase()] = values[idx]?.trim() || '';
        });

        // Validate and transform
        const description = row.description;
        const amount = parseFloat(row.amount);
        const type = (row.type || '').toUpperCase() as TransactionType;
        const date = row.date;
        const categoryName = row.category;
        const notes = row.notes;

        // Validation
        if (!description) {
          errors.push({ row: i + 1, message: 'Description is required' });
          continue;
        }

        if (isNaN(amount) || amount <= 0) {
          errors.push({ row: i + 1, message: 'Amount must be a positive number' });
          continue;
        }

        if (type !== 'EXPENSE' && type !== 'INCOME') {
          errors.push({ row: i + 1, message: 'Type must be EXPENSE or INCOME' });
          continue;
        }

        if (!isValidDate(date)) {
          errors.push({ row: i + 1, message: 'Date must be in YYYY-MM-DD format' });
          continue;
        }

        // Resolve category ID if provided
        let categoryId: string | null = null;
        if (categoryName) {
          const category = categories.find(c => 
            c.name.toLowerCase() === categoryName.toLowerCase()
          );
          if (category) {
            categoryId = category.id;
          }
        }

        data.push({
          description,
          amount,
          type,
          transaction_date: date,
          category_id: categoryId,
          notes: notes || undefined,
        });
      } catch (err) {
        errors.push({ row: i + 1, message: `Failed to parse row: ${err instanceof Error ? err.message : 'Unknown error'}` });
      }
    }

    if (data.length === 0 && errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, data, errors: errors.length > 0 ? errors : undefined };
  } catch (err) {
    return {
      success: false,
      errors: [{ row: 0, message: `CSV parsing error: ${err instanceof Error ? err.message : 'Unknown error'}` }]
    };
  }
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
