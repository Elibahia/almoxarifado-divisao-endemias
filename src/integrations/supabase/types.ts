export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          product_id: string
          severity: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          product_id: string
          severity: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          product_id?: string
          severity?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_request_items: {
        Row: {
          created_at: string
          id: string
          order_request_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_of_measure: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_request_id: string
          product_id: string
          product_name: string
          quantity: number
          unit_of_measure: string
        }
        Update: {
          created_at?: string
          id?: string
          order_request_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          unit_of_measure?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_request_items_order_request_id_fkey"
            columns: ["order_request_id"]
            isOneToOne: false
            referencedRelation: "order_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_request_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          delivered_at: string | null
          id: string
          observations: string | null
          request_date: string
          requester_name: string
          status: string
          subdistrict: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          id?: string
          observations?: string | null
          request_date?: string
          requester_name: string
          status?: string
          subdistrict: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          id?: string
          observations?: string | null
          request_date?: string
          requester_name?: string
          status?: string
          subdistrict?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          batch: string
          category: string
          created_at: string
          current_quantity: number
          description: string | null
          expiration_date: string
          id: string
          location: string | null
          minimum_quantity: number
          name: string
          status: string
          supplier: string | null
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          batch: string
          category: string
          created_at?: string
          current_quantity?: number
          description?: string | null
          expiration_date: string
          id?: string
          location?: string | null
          minimum_quantity?: number
          name: string
          status?: string
          supplier?: string | null
          unit_of_measure?: string
          updated_at?: string
        }
        Update: {
          batch?: string
          category?: string
          created_at?: string
          current_quantity?: number
          description?: string | null
          expiration_date?: string
          id?: string
          location?: string | null
          minimum_quantity?: number
          name?: string
          status?: string
          supplier?: string | null
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          id: string
          invoice_number: string | null
          notes: string | null
          product_id: string
          quantity: number
          reason: string
          responsible_user: string
          timestamp: string
          type: string
        }
        Insert: {
          id?: string
          invoice_number?: string | null
          notes?: string | null
          product_id: string
          quantity: number
          reason: string
          responsible_user: string
          timestamp?: string
          type: string
        }
        Update: {
          id?: string
          invoice_number?: string | null
          notes?: string | null
          product_id?: string
          quantity?: number
          reason?: string
          responsible_user?: string
          timestamp?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_active?: boolean
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_access: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "gestor_almoxarifado"
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
    Enums: {
      user_role: ["admin", "gestor_almoxarifado"],
    },
  },
} as const
