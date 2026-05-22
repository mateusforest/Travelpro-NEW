import type { AuthRole } from "@/lib/permissions/roles"

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type AgencyAccessContext = {
  userId: string
  profileId: string | null
  agencyId: string | null
  role: AuthRole
  isMaster: boolean
}

export type Database = {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string
          name: string
          slug: string | null
          owner_name: string | null
          owner_email: string | null
          phone: string | null
          status: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          owner_name?: string | null
          owner_email?: string | null
          phone?: string | null
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["agencies"]["Insert"]>
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          agency_id: string | null
          email: string
          full_name: string | null
          phone: string | null
          avatar_path: string | null
          role: string
          status: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agency_id?: string | null
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_path?: string | null
          role?: string
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>
      }
      agency_members: {
        Row: {
          id: string
          agency_id: string
          user_id: string
          profile_id: string | null
          role: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          user_id: string
          profile_id?: string | null
          role?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["agency_members"]["Insert"]>
      }
      clients: {
        Row: {
          id: string
          agency_id: string
          profile_id: string | null
          owner_user_id: string | null
          name: string
          email: string | null
          phone: string | null
          document_number: string | null
          traveler_profile: Json
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          profile_id?: string | null
          owner_user_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          document_number?: string | null
          traveler_profile?: Json
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>
      }
      leads: {
        Row: {
          id: string
          agency_id: string
          user_id: string | null
          client_id: string | null
          name: string
          email: string | null
          phone: string | null
          origin: string | null
          destination: string | null
          status: string
          temperature: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          user_id?: string | null
          client_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          origin?: string | null
          destination?: string | null
          status?: string
          temperature?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>
      }
      trips: {
        Row: {
          id: string
          agency_id: string
          client_id: string | null
          user_id: string | null
          destination: string
          origin: string | null
          status: string
          starts_at: string | null
          ends_at: string | null
          summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          client_id?: string | null
          user_id?: string | null
          destination: string
          origin?: string | null
          status?: string
          starts_at?: string | null
          ends_at?: string | null
          summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["trips"]["Insert"]>
      }
      itineraries: {
        Row: {
          id: string
          agency_id: string
          trip_id: string
          client_id: string | null
          day_index: number
          title: string
          description: string | null
          activity_time: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          trip_id: string
          client_id?: string | null
          day_index?: number
          title: string
          description?: string | null
          activity_time?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["itineraries"]["Insert"]>
      }
      documents: {
        Row: {
          id: string
          agency_id: string
          client_id: string | null
          trip_id: string | null
          user_id: string | null
          title: string
          type: string
          status: string
          storage_bucket: string | null
          storage_path: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          client_id?: string | null
          trip_id?: string | null
          user_id?: string | null
          title: string
          type: string
          status?: string
          storage_bucket?: string | null
          storage_path?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>
      }
      catalog_items: {
        Row: {
          id: string
          agency_id: string
          title: string
          description: string | null
          status: string
          price: number | null
          currency: string
          public_slug: string | null
          match_enabled: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          title: string
          description?: string | null
          status?: string
          price?: number | null
          currency?: string
          public_slug?: string | null
          match_enabled?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["catalog_items"]["Insert"]>
      }
      team_members: {
        Row: {
          id: string
          agency_id: string
          user_id: string | null
          profile_id: string | null
          name: string
          role: string
          scope: string | null
          modules: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          user_id?: string | null
          profile_id?: string | null
          name: string
          role: string
          scope?: string | null
          modules?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["team_members"]["Insert"]>
      }
      financial_records: {
        Row: {
          id: string
          agency_id: string
          user_id: string | null
          client_id: string | null
          trip_id: string | null
          type: string
          amount: number
          status: string
          description: string | null
          category: string | null
          occurred_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          user_id?: string | null
          client_id?: string | null
          trip_id?: string | null
          type: string
          amount: number
          status?: string
          description?: string | null
          category?: string | null
          occurred_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["financial_records"]["Insert"]>
      }
      subscriptions: {
        Row: {
          id: string
          agency_id: string
          plan_code: string
          status: string
          price: number | null
          renews_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          plan_code: string
          status?: string
          price?: number | null
          renews_at?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>
      }
      payments: {
        Row: {
          id: string
          agency_id: string
          subscription_id: string | null
          amount: number
          status: string
          payment_method: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          subscription_id?: string | null
          amount: number
          status?: string
          payment_method?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>
      }
      credit_transactions: {
        Row: {
          id: string
          agency_id: string
          user_id: string | null
          type: string
          feature: string | null
          amount: number
          source: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          user_id?: string | null
          type: string
          feature?: string | null
          amount: number
          source?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["credit_transactions"]["Insert"]>
      }
      notifications: {
        Row: {
          id: string
          agency_id: string | null
          user_id: string | null
          profile_id: string | null
          title: string
          body: string | null
          type: string
          status: string
          action_url: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id?: string | null
          user_id?: string | null
          profile_id?: string | null
          title: string
          body?: string | null
          type?: string
          status?: string
          action_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>
      }
      tasks: {
        Row: {
          id: string
          agency_id: string
          user_id: string | null
          client_id: string | null
          trip_id: string | null
          title: string
          description: string | null
          priority: string
          status: string
          due_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          user_id?: string | null
          client_id?: string | null
          trip_id?: string | null
          title: string
          description?: string | null
          priority?: string
          status?: string
          due_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>
      }
      reports: {
        Row: {
          id: string
          agency_id: string | null
          user_id: string | null
          name: string
          type: string
          status: string
          filters: Json
          result_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id?: string | null
          user_id?: string | null
          name: string
          type: string
          status?: string
          filters?: Json
          result_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>
      }
      trip_share_links: {
        Row: {
          id: string
          agency_id: string
          trip_id: string
          client_id: string | null
          token: string
          is_active: boolean
          expires_at: string | null
          view_count: number
          last_viewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          trip_id: string
          client_id?: string | null
          token: string
          is_active?: boolean
          expires_at?: string | null
          view_count?: number
          last_viewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["trip_share_links"]["Insert"]>
      }
      audit_logs: {
        Row: {
          id: string
          agency_id: string | null
          user_id: string | null
          action: string
          entity: string
          entity_id: string | null
          status: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          agency_id?: string | null
          user_id?: string | null
          action: string
          entity: string
          entity_id?: string | null
          status?: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          status?: string
          metadata?: Json
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      current_profile_id: { Args: Record<PropertyKey, never>; Returns: string | null }
      current_profile_role: { Args: Record<PropertyKey, never>; Returns: string | null }
      current_agency_id: { Args: Record<PropertyKey, never>; Returns: string | null }
      is_master: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_agency_member: { Args: Record<PropertyKey, never>; Returns: boolean }
      is_client: { Args: Record<PropertyKey, never>; Returns: boolean }
      storage_path_agency_id: { Args: { path: string }; Returns: string | null }
      storage_path_profile_id: { Args: { path: string }; Returns: string | null }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type PublicTable<Name extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][Name]["Row"]

export type BaseRow = {
  id: string
  agency_id: string | null
  created_at: string
  updated_at?: string
}

export type ClientRow = PublicTable<"clients">
export type AgencyRow = PublicTable<"agencies">
export type ProfileRow = PublicTable<"profiles">
export type LeadRow = PublicTable<"leads">
export type TripRow = PublicTable<"trips">
export type ItineraryRow = PublicTable<"itineraries">
export type DocumentRow = PublicTable<"documents">
export type CatalogItemRow = PublicTable<"catalog_items">
export type TeamMemberRow = PublicTable<"team_members">
export type FinancialRecordRow = PublicTable<"financial_records">
export type SubscriptionRow = PublicTable<"subscriptions">
export type PaymentRow = PublicTable<"payments">
export type CreditTransactionRow = PublicTable<"credit_transactions">
export type NotificationRow = PublicTable<"notifications">
export type TaskRow = PublicTable<"tasks">
export type ReportRow = PublicTable<"reports">
export type TripShareLinkRow = PublicTable<"trip_share_links">
export type AuditLogRow = PublicTable<"audit_logs">
