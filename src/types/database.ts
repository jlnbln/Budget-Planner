export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          monthly_budget: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          monthly_budget?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          monthly_budget?: number
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          emoji: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          emoji?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          name?: string
          color?: string
          emoji?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'categories_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          recurring_id: string | null
          amount: number
          description: string
          expense_date: string
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          recurring_id?: string | null
          amount: number
          description: string
          expense_date?: string
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          amount?: number
          description?: string
          expense_date?: string
          is_favorite?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'expenses_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      recurring_expenses: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          name: string
          amount: number
          day_of_month: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          name: string
          amount: number
          day_of_month: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          category_id?: string | null
          name?: string
          amount?: number
          day_of_month?: number
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'recurring_expenses_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      monthly_savings: {
        Row: {
          id: string
          user_id: string
          year: number
          month: number
          budget_amount: number
          total_spent: number
          net_savings: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          year: number
          month: number
          budget_amount: number
          total_spent: number
          net_savings: number
          created_at?: string
        }
        Update: {
          budget_amount?: number
          total_spent?: number
          net_savings?: number
        }
        Relationships: [
          {
            foreignKeyName: 'monthly_savings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
  }
}

// App-level interfaces
export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  emoji: string
  sort_order: number
  created_at: string
}

export interface ExpenseWithCategory {
  id: string
  user_id: string
  amount: number
  description: string
  expense_date: string
  is_favorite: boolean
  recurring_id: string | null
  category: Category | null
}

export interface RecurringExpense {
  id: string
  user_id: string
  category_id: string | null
  name: string
  amount: number
  day_of_month: number
  is_active: boolean
  created_at: string
  category?: Category | null
}

export interface MonthlySavings {
  id: string
  user_id: string
  year: number
  month: number
  budget_amount: number
  total_spent: number
  net_savings: number
  created_at: string
}

export interface MonthlyStats {
  totalSpent: number
  budget: number
  utilizationPercent: number
  avgDailySpend: number
  biggestExpense: ExpenseWithCategory | null
  daysLeft: number
  dailyBudgetLeft: number
}
