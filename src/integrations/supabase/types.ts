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
