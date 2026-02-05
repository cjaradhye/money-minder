 // Quell Finance App TypeScript Types
 // These types mirror the database schema
 
 export type TransactionType = 'EXPENSE' | 'INCOME';
 export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';
 export type Severity = 'INFO' | 'WARNING' | 'CRITICAL';
 export type AlertType = 'BUDGET_OVERSPENT' | 'BUDGET_AT_RISK' | 'GOAL_OFF_TRACK' | 'RECURRING_PROCESSED' | 'GENERAL';
 export type AISuggestionStatus = 'PENDING' | 'APPLIED' | 'REJECTED';
 export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPLY_SUGGESTION' | 'REJECT_SUGGESTION';
 
 export interface Profile {
   id: string;
   user_id: string;
   email: string;
   name: string | null;
   avatar_url: string | null;
   created_at: string;
   updated_at: string;
 }
 
 export interface UserPreferences {
   id: string;
   user_id: string;
   currency: string;
   week_start_day: string;
   notifications_enabled: boolean;
   enabled_features: {
     betaAiInsights: boolean;
     advancedCharts: boolean;
   };
   created_at: string;
   updated_at: string;
 }
 
 export interface Category {
   id: string;
   user_id: string;
   name: string;
   icon: string | null;
   color: string | null;
   parent_id: string | null;
   created_at: string;
   updated_at: string;
 }
 
 export interface Tag {
   id: string;
   user_id: string;
   name: string;
   created_at: string;
 }
 
 export interface Transaction {
   id: string;
   user_id: string;
   type: TransactionType;
   amount: number;
   description: string;
   transaction_date: string;
   category_id: string | null;
   notes: string | null;
   created_at: string;
   updated_at: string;
   // Joined fields
   category?: Category;
   tags?: Tag[];
 }
 
 export interface TransactionTag {
   transaction_id: string;
   tag_id: string;
 }
 
 export interface RecurringTransaction {
   id: string;
   user_id: string;
   type: TransactionType;
   amount: number;
   description: string;
   category_id: string | null;
   frequency: Frequency;
   next_run_date: string;
   is_paused: boolean;
   created_at: string;
   updated_at: string;
   category?: Category;
 }
 
 export interface Budget {
   id: string;
   user_id: string;
   category_id: string | null;
   monthly_limit: number;
   month_year: string;
   created_at: string;
   updated_at: string;
   category?: Category;
   spent?: number;
 }
 
 export interface Goal {
   id: string;
   user_id: string;
   name: string;
   target_amount: number;
   current_amount: number;
   target_date: string | null;
   icon: string | null;
   color: string | null;
   created_at: string;
   updated_at: string;
 }
 
 export interface GoalContribution {
   id: string;
   goal_id: string;
   transaction_id: string | null;
   amount: number;
   created_at: string;
 }
 
 export interface Alert {
   id: string;
   user_id: string;
   type: AlertType;
   message: string;
   severity: Severity;
   is_read: boolean;
   metadata: Record<string, unknown> | null;
   created_at: string;
 }
 
 export interface AISuggestion {
   id: string;
   user_id: string;
   type: string;
   payload: Record<string, unknown>;
   confidence: number | null;
   status: AISuggestionStatus;
   created_at: string;
   acted_at: string | null;
 }
 
 export interface AuditLog {
   id: string;
   user_id: string;
   action: AuditAction;
   entity_type: string;
   entity_id: string;
   metadata: Record<string, unknown> | null;
   created_at: string;
 }
 
 // Form types for creating/updating
 export interface CreateTransactionInput {
   type: TransactionType;
   amount: number;
   description: string;
   transaction_date: string;
   category_id?: string;
   notes?: string;
   tag_ids?: string[];
 }
 
 export interface CreateBudgetInput {
   category_id: string;
   monthly_limit: number;
   month_year: string;
 }
 
 export interface CreateGoalInput {
   name: string;
   target_amount: number;
   target_date?: string;
   icon?: string;
   color?: string;
 }
 
 export interface CreateRecurringInput {
   type: TransactionType;
   amount: number;
   description: string;
   category_id?: string;
   frequency: Frequency;
   next_run_date: string;
 }
 
 // Analytics types
 export interface AnalyticsSummary {
   totalIncome: number;
   totalExpenses: number;
   netBalance: number;
   topCategories: { category: string; amount: number; percentage: number }[];
   transactionCount: number;
 }
 
 export interface BudgetStatus {
   budget: Budget;
   spent: number;
   remaining: number;
   percentage: number;
   status: 'OK' | 'AT_RISK' | 'OVERSPENT';
 }
 
 export interface GoalProgress {
   goal: Goal;
   percentage: number;
   daysRemaining: number | null;
   requiredPace: number | null;
 }