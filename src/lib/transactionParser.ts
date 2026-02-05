 import { CreateTransactionInput, TransactionType } from '@/types/finance';
 import { Category, Tag } from '@/types/finance';
 
 interface ParseResult {
   success: boolean;
   data?: CreateTransactionInput & { categoryName?: string; tagNames?: string[] };
   error?: string;
 }
 
 /**
  * Smart transaction parser for Spotlight entry
  * Grammar: [description] [amount] [date?] [@category?] [#tag ...]
  * 
  * Examples:
  * - "Coffee 4.50 today @Food #office #friends"
  * - "Salary 50000 2026-02-01 @Income"
  * - "Groceries 1200 @Essentials #weekly"
  */
 export function parseTransactionInput(
   input: string,
   categories: Category[],
   tags: Tag[]
 ): ParseResult {
   const trimmed = input.trim();
   if (!trimmed) {
     return { success: false, error: 'Input cannot be empty' };
   }
 
   // Extract tags (#tagname)
   const tagMatches = trimmed.match(/#(\w+)/g) || [];
   const tagNames = tagMatches.map(t => t.slice(1).toLowerCase());
 
   // Extract category (@category)
   const categoryMatch = trimmed.match(/@(\w+)/);
   const categoryName = categoryMatch ? categoryMatch[1] : null;
 
   // Remove tags and category from input
   let remaining = trimmed
     .replace(/#\w+/g, '')
     .replace(/@\w+/g, '')
     .trim();
 
   // Extract date (today, yesterday, or YYYY-MM-DD)
   let transactionDate: string;
   const today = new Date();
   
   if (/\btoday\b/i.test(remaining)) {
     transactionDate = today.toISOString().slice(0, 10);
     remaining = remaining.replace(/\btoday\b/i, '').trim();
   } else if (/\byesterday\b/i.test(remaining)) {
     const yesterday = new Date(today);
     yesterday.setDate(yesterday.getDate() - 1);
     transactionDate = yesterday.toISOString().slice(0, 10);
     remaining = remaining.replace(/\byesterday\b/i, '').trim();
   } else {
     const dateMatch = remaining.match(/\b(\d{4}-\d{2}-\d{2})\b/);
     if (dateMatch) {
       const parsedDate = new Date(dateMatch[1]);
       if (isNaN(parsedDate.getTime())) {
         return { success: false, error: `Invalid date format: ${dateMatch[1]}. Use YYYY-MM-DD, "today", or "yesterday".` };
       }
       transactionDate = dateMatch[1];
       remaining = remaining.replace(dateMatch[1], '').trim();
     } else {
       // Default to today
       transactionDate = today.toISOString().slice(0, 10);
     }
   }
 
   // Extract amount (last number in the string)
   const numberMatches = remaining.match(/\b\d+(?:\.\d{1,2})?\b/g);
   if (!numberMatches || numberMatches.length === 0) {
     return { success: false, error: 'Amount is required. Add a number like "Coffee 50" or "Lunch 125.50".' };
   }
 
   const amount = parseFloat(numberMatches[numberMatches.length - 1]);
   if (amount <= 0) {
     return { success: false, error: 'Amount must be greater than zero.' };
   }
 
   // Remove the amount from remaining to get description
   const amountStr = numberMatches[numberMatches.length - 1];
   const amountIndex = remaining.lastIndexOf(amountStr);
   remaining = remaining.slice(0, amountIndex) + remaining.slice(amountIndex + amountStr.length);
   remaining = remaining.replace(/\s+/g, ' ').trim();
 
   if (!remaining) {
     return { success: false, error: 'Description is required. Example: "Coffee 50 @Food"' };
   }
 
   // Determine type based on category
   let type: TransactionType = 'EXPENSE';
   if (categoryName) {
     const foundCategory = categories.find(c => 
       c.name.toLowerCase() === categoryName.toLowerCase()
     );
     if (foundCategory && foundCategory.name.toLowerCase() === 'income') {
       type = 'INCOME';
     }
   }
 
   // Find category ID
   let category_id: string | undefined;
   if (categoryName) {
     const foundCategory = categories.find(c => 
       c.name.toLowerCase() === categoryName.toLowerCase()
     );
     if (foundCategory) {
       category_id = foundCategory.id;
     }
   }
 
   // Find tag IDs
   const tag_ids: string[] = [];
   tagNames.forEach(tagName => {
     const foundTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
     if (foundTag) {
       tag_ids.push(foundTag.id);
     }
   });
 
   return {
     success: true,
     data: {
       type,
       amount,
       description: remaining,
       transaction_date: transactionDate,
       category_id,
       tag_ids,
       categoryName: categoryName || undefined,
       tagNames: tagNames.length > 0 ? tagNames : undefined
     }
   };
 }
 
 // Format currency for display
 export function formatCurrency(amount: number, currency: string = 'INR'): string {
   return new Intl.NumberFormat('en-IN', {
     style: 'currency',
     currency,
     minimumFractionDigits: 0,
     maximumFractionDigits: 2
   }).format(amount);
 }
 
 // Format date for display
 export function formatDate(dateStr: string): string {
   const date = new Date(dateStr);
   const today = new Date();
   const yesterday = new Date(today);
   yesterday.setDate(yesterday.getDate() - 1);
 
   if (dateStr === today.toISOString().slice(0, 10)) {
     return 'Today';
   } else if (dateStr === yesterday.toISOString().slice(0, 10)) {
     return 'Yesterday';
   }
 
   return date.toLocaleDateString('en-IN', {
     day: 'numeric',
     month: 'short',
     year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
   });
 }
 
 // Get month name
 export function getMonthName(monthYear: string): string {
   const [year, month] = monthYear.split('-');
   const date = new Date(parseInt(year), parseInt(month) - 1);
   return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
 }