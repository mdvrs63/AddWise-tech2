export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      devices: {
        Row: {
          allocated_at: string | null
          allocated_to_customer_id: number | null
          allocated_to_customer_name: string | null
          created_at: string | null
          device_code: string
          device_name: string | null
          id: number
          is_active: boolean | null
          qr_code: string
        }
        Insert: {
          allocated_at?: string | null
          allocated_to_customer_id?: number | null
          allocated_to_customer_name?: string | null
          created_at?: string | null
          device_code: string
          device_name?: string | null
          id?: number
          is_active?: boolean | null
          qr_code: string
        }
        Update: {
          allocated_at?: string | null
          allocated_to_customer_id?: number | null
          allocated_to_customer_name?: string | null
          created_at?: string | null
          device_code?: string
          device_name?: string | null
          id?: number
          is_active?: boolean | null
          qr_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_devices_customer"
            columns: ["allocated_to_customer_id"]
            isOneToOne: false
            referencedRelation: "signup_users"
            referencedColumns: ["id"]
          },
        ]
      }
      gps_data: {
        Row: {
          id: number
          latitude: number | null
          longitude: number | null
          timestamp: string | null
          user_id: number | null
          device_code: string | null
        }
        Insert: {
          id?: number
          latitude?: number | null
          longitude?: number | null
          timestamp?: string | null
          user_id?: number | null
          device_code?: string | null
        }
        Update: {
          id?: number
          latitude?: number | null
          longitude?: number | null
          timestamp?: string | null
          user_id?: number | null
          device_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_device_code"
            columns: ["device_code"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["device_code"]
          },
        ]
      }
      employee_data: {
        Row: {
          created_at: string
          email: string
          employee_id: string
          full_name: string
          id: number
          phone_number: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          employee_id: string
          full_name: string
          id?: number
          phone_number: string
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          employee_id?: string
          full_name?: string
          id?: number
          phone_number?: string
          role?: string
        }
        Relationships: []
      }
      employee_login_logs: {
        Row: {
          employee_id: string
          id: number
          login_time: string
        }
        Insert: {
          employee_id: string
          id?: number
          login_time: string
        }
        Update: {
          employee_id?: string
          id?: number
          login_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_employee_login_logs_employee_id"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employee_data"
            referencedColumns: ["employee_id"]
          }
        ]
      }
      login_users: {
        Row: {
          created_at: string | null
          email: string
          id: number
          password: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          password: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          password?: string
        }
        Relationships: []
      }
      otp_verifications: {
        Row: {
          created_at: string
          expires_at: string
          id: number
          is_verified: boolean
          otp: string
          phone_number: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: number
          is_verified?: boolean
          otp: string
          phone_number: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: number
          is_verified?: boolean
          otp?: string
          phone_number?: string
        }
        Relationships: []
      }
      signup_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: number
          phone_number: string
          user_id: number
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: number
          phone_number: string
          user_id: number
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: number
          phone_number?: string
          user_id?: number
        }
        Relationships: []
      }
      super_admins: {
        Row: {
          created_at: string | null
          full_name: string
          id: number
          phone_number: string
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id?: number
          phone_number: string
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: number
          phone_number?: string
        }
        Relationships: []
      }
      password_resets: {
        Row: {
          created_at: string | null
          expires_at: string
          id: number
          is_verified: boolean | null
          otp: string
          phone_number: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: number
          is_verified?: boolean | null
          otp: string
          phone_number: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: number
          is_verified?: boolean | null
          otp?: string
          phone_number?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
