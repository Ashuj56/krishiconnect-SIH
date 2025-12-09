export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_date: string
          activity_type: string
          area_covered: number | null
          area_covered_unit: string | null
          cost: number | null
          created_at: string | null
          crop_id: string | null
          description: string | null
          id: string
          photo_url: string | null
          quantity: number | null
          quantity_unit: string | null
          title: string
          user_id: string
        }
        Insert: {
          activity_date?: string
          activity_type: string
          area_covered?: number | null
          area_covered_unit?: string | null
          cost?: number | null
          created_at?: string | null
          crop_id?: string | null
          description?: string | null
          id?: string
          photo_url?: string | null
          quantity?: number | null
          quantity_unit?: string | null
          title: string
          user_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          area_covered?: number | null
          area_covered_unit?: string | null
          cost?: number | null
          created_at?: string | null
          crop_id?: string | null
          description?: string | null
          id?: string
          photo_url?: string | null
          quantity?: number | null
          quantity_unit?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          action_url: string | null
          category: string
          created_at: string
          expires_at: string | null
          farmer_id: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
        }
        Insert: {
          action_url?: string | null
          category?: string
          created_at?: string
          expires_at?: string | null
          farmer_id: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string
          expires_at?: string | null
          farmer_id?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
        }
        Relationships: []
      }
      buyers: {
        Row: {
          contact_info: string | null
          created_at: string
          crops_accepted: string[]
          district: string
          id: string
          min_grade: string
          name: string
          pincodes_served: string[]
          price_per_kg: number
          type: string
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          crops_accepted: string[]
          district: string
          id?: string
          min_grade: string
          name: string
          pincodes_served: string[]
          price_per_kg: number
          type: string
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          crops_accepted?: string[]
          district?: string
          id?: string
          min_grade?: string
          name?: string
          pincodes_served?: string[]
          price_per_kg?: number
          type?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      crop_schedules: {
        Row: {
          created_at: string
          crop_name: string
          id: string
          schedule: Json
        }
        Insert: {
          created_at?: string
          crop_name: string
          id?: string
          schedule: Json
        }
        Update: {
          created_at?: string
          crop_name?: string
          id?: string
          schedule?: Json
        }
        Relationships: []
      }
      crops: {
        Row: {
          area: number | null
          area_unit: string | null
          created_at: string | null
          current_stage: string | null
          expected_harvest_date: string | null
          farm_id: string
          health_status: string | null
          id: string
          name: string
          notes: string | null
          planting_date: string | null
          updated_at: string | null
          user_id: string
          variety: string | null
        }
        Insert: {
          area?: number | null
          area_unit?: string | null
          created_at?: string | null
          current_stage?: string | null
          expected_harvest_date?: string | null
          farm_id: string
          health_status?: string | null
          id?: string
          name: string
          notes?: string | null
          planting_date?: string | null
          updated_at?: string | null
          user_id: string
          variety?: string | null
        }
        Update: {
          area?: number | null
          area_unit?: string | null
          created_at?: string | null
          current_stage?: string | null
          expected_harvest_date?: string | null
          farm_id?: string
          health_status?: string | null
          id?: string
          name?: string
          notes?: string | null
          planting_date?: string | null
          updated_at?: string | null
          user_id?: string
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crops_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farmer_documents: {
        Row: {
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          uploaded_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          uploaded_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          uploaded_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      farmer_loans: {
        Row: {
          approved_amount: number | null
          created_at: string
          crop_id: string | null
          crop_name: string | null
          duration_months: number
          eligibility_score: number | null
          emi: number | null
          id: string
          interest_rate: number | null
          lender_id: string | null
          next_due_date: string | null
          proof_url: string | null
          purpose: string
          rejection_reason: string | null
          requested_amount: number
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
          vendor_id: string | null
          vendor_name: string | null
        }
        Insert: {
          approved_amount?: number | null
          created_at?: string
          crop_id?: string | null
          crop_name?: string | null
          duration_months?: number
          eligibility_score?: number | null
          emi?: number | null
          id?: string
          interest_rate?: number | null
          lender_id?: string | null
          next_due_date?: string | null
          proof_url?: string | null
          purpose: string
          rejection_reason?: string | null
          requested_amount: number
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vendor_id?: string | null
          vendor_name?: string | null
        }
        Update: {
          approved_amount?: number | null
          created_at?: string
          crop_id?: string | null
          crop_name?: string | null
          duration_months?: number
          eligibility_score?: number | null
          emi?: number | null
          id?: string
          interest_rate?: number | null
          lender_id?: string | null
          next_due_date?: string | null
          proof_url?: string | null
          purpose?: string
          rejection_reason?: string | null
          requested_amount?: number
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farmer_loans_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farmer_loans_lender_id_fkey"
            columns: ["lender_id"]
            isOneToOne: false
            referencedRelation: "lenders"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          area_unit: string | null
          created_at: string | null
          id: string
          location: string | null
          name: string
          soil_type: string | null
          total_area: number | null
          updated_at: string | null
          user_id: string
          water_source: string | null
        }
        Insert: {
          area_unit?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          soil_type?: string | null
          total_area?: number | null
          updated_at?: string | null
          user_id: string
          water_source?: string | null
        }
        Update: {
          area_unit?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          soil_type?: string | null
          total_area?: number | null
          updated_at?: string | null
          user_id?: string
          water_source?: string | null
        }
        Relationships: []
      }
      grade_tickets: {
        Row: {
          created_at: string
          crop: string
          district: string
          harvest_batch_id: string
          id: string
          pincode: string
          preliminary_grade: string
          quantity_kg: number
          ticket_code: string
        }
        Insert: {
          created_at?: string
          crop: string
          district: string
          harvest_batch_id: string
          id?: string
          pincode: string
          preliminary_grade: string
          quantity_kg: number
          ticket_code: string
        }
        Update: {
          created_at?: string
          crop?: string
          district?: string
          harvest_batch_id?: string
          id?: string
          pincode?: string
          preliminary_grade?: string
          quantity_kg?: number
          ticket_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "grade_tickets_harvest_batch_id_fkey"
            columns: ["harvest_batch_id"]
            isOneToOne: false
            referencedRelation: "harvest_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      harvest_batches: {
        Row: {
          created_at: string
          crop: string
          district: string
          farmer_id: string
          final_grade: string | null
          grade: string
          harvest_date: string
          id: string
          pincode: string
          preliminary_grade: string | null
          quantity_kg: number
        }
        Insert: {
          created_at?: string
          crop: string
          district: string
          farmer_id: string
          final_grade?: string | null
          grade: string
          harvest_date?: string
          id?: string
          pincode: string
          preliminary_grade?: string | null
          quantity_kg: number
        }
        Update: {
          created_at?: string
          crop?: string
          district?: string
          farmer_id?: string
          final_grade?: string | null
          grade?: string
          harvest_date?: string
          id?: string
          pincode?: string
          preliminary_grade?: string | null
          quantity_kg?: number
        }
        Relationships: []
      }
      lenders: {
        Row: {
          contact_info: string | null
          created_at: string
          description: string | null
          id: string
          interest_rate: number
          loan_limit: number
          logo_url: string | null
          min_credit_score: number
          name: string
          processing_fee: number
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          description?: string | null
          id?: string
          interest_rate?: number
          loan_limit?: number
          logo_url?: string | null
          min_credit_score?: number
          name: string
          processing_fee?: number
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          description?: string | null
          id?: string
          interest_rate?: number
          loan_limit?: number
          logo_url?: string | null
          min_credit_score?: number
          name?: string
          processing_fee?: number
        }
        Relationships: []
      }
      loan_repayments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          loan_id: string
          paid_date: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          loan_id: string
          paid_date?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          loan_id?: string
          paid_date?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_repayments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "farmer_loans"
            referencedColumns: ["id"]
          },
        ]
      }
      market_price_history: {
        Row: {
          created_at: string
          crop: string
          district: string
          id: string
          price: number
          recorded_date: string
        }
        Insert: {
          created_at?: string
          crop: string
          district: string
          id?: string
          price: number
          recorded_date?: string
        }
        Update: {
          created_at?: string
          crop?: string
          district?: string
          id?: string
          price?: number
          recorded_date?: string
        }
        Relationships: []
      }
      microfinance_vendors: {
        Row: {
          business_address: string
          business_name: string
          contact_no: string | null
          created_at: string
          district: string
          email: string | null
          id: string
          interest_rate: number | null
          is_verified: boolean
          license_holder: string
          license_number: string
          loan_term_months: number | null
        }
        Insert: {
          business_address: string
          business_name: string
          contact_no?: string | null
          created_at?: string
          district: string
          email?: string | null
          id?: string
          interest_rate?: number | null
          is_verified?: boolean
          license_holder: string
          license_number: string
          loan_term_months?: number | null
        }
        Update: {
          business_address?: string
          business_name?: string
          contact_no?: string | null
          created_at?: string
          district?: string
          email?: string | null
          id?: string
          interest_rate?: number | null
          is_verified?: boolean
          license_holder?: string
          license_number?: string
          loan_term_months?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string
          expires_at: string | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          language: string | null
          location: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          location?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          location?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          activity_id: string | null
          category: string
          created_at: string
          crop_id: string | null
          due_date: string
          farmer_id: string
          id: string
          is_sent: boolean
          message: string
          trigger_source: string
        }
        Insert: {
          activity_id?: string | null
          category?: string
          created_at?: string
          crop_id?: string | null
          due_date: string
          farmer_id: string
          id?: string
          is_sent?: boolean
          message: string
          trigger_source?: string
        }
        Update: {
          activity_id?: string | null
          category?: string
          created_at?: string
          crop_id?: string | null
          due_date?: string
          farmer_id?: string
          id?: string
          is_sent?: boolean
          message?: string
          trigger_source?: string
        }
        Relationships: []
      }
      sale_recommendations: {
        Row: {
          best_channel: string
          created_at: string
          expected_income_best: number
          harvest_batch_id: string
          id: string
        }
        Insert: {
          best_channel: string
          created_at?: string
          expected_income_best: number
          harvest_batch_id: string
          id?: string
        }
        Update: {
          best_channel?: string
          created_at?: string
          expected_income_best?: number
          harvest_batch_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_recommendations_harvest_batch_id_fkey"
            columns: ["harvest_batch_id"]
            isOneToOne: false
            referencedRelation: "harvest_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_results: {
        Row: {
          confidence: number | null
          created_at: string | null
          crop_id: string | null
          id: string
          image_url: string | null
          recommendations: string[] | null
          result_data: Json | null
          scan_type: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          crop_id?: string | null
          id?: string
          image_url?: string | null
          recommendations?: string[] | null
          result_data?: Json | null
          scan_type: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          crop_id?: string | null
          id?: string
          image_url?: string | null
          recommendations?: string[] | null
          result_data?: Json | null
          scan_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_results_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_deadlines: {
        Row: {
          created_at: string
          deadline_date: string
          description: string | null
          district: string | null
          id: string
          scheme_url: string | null
          state: string | null
          title: string
        }
        Insert: {
          created_at?: string
          deadline_date: string
          description?: string | null
          district?: string | null
          id?: string
          scheme_url?: string | null
          state?: string | null
          title: string
        }
        Update: {
          created_at?: string
          deadline_date?: string
          description?: string | null
          district?: string | null
          id?: string
          scheme_url?: string | null
          state?: string | null
          title?: string
        }
        Relationships: []
      }
      soil_reports: {
        Row: {
          created_at: string
          id: string
          nitrogen: number
          ph: number
          phosphorus: number
          potassium: number
          status_json: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nitrogen: number
          ph: number
          phosphorus: number
          potassium: number
          status_json?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nitrogen?: number
          ph?: number
          phosphorus?: number
          potassium?: number
          status_json?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          crop_id: string | null
          description: string | null
          id: string
          priority: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          crop_id?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          crop_id?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
        ]
      }
      value_added_options: {
        Row: {
          conversion_ratio: number
          crop: string
          id: string
          min_grade_required: string
          processing_cost_per_kg: number
          product: string
          selling_price_per_kg: number
        }
        Insert: {
          conversion_ratio: number
          crop: string
          id?: string
          min_grade_required: string
          processing_cost_per_kg: number
          product: string
          selling_price_per_kg: number
        }
        Update: {
          conversion_ratio?: number
          crop?: string
          id?: string
          min_grade_required?: string
          processing_cost_per_kg?: number
          product?: string
          selling_price_per_kg?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
