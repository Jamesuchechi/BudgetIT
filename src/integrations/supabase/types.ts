export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      budget_entries: {
        Row: {
          actual_amount: number;
          budgeted_amount: number;
          category: string;
          created_at: string;
          created_by: string | null;
          department: string;
          id: string;
          notes: string | null;
          org_id: string;
          period: string;
          updated_at: string;
          vendor: string | null;
        };
        Insert: {
          actual_amount?: number;
          budgeted_amount?: number;
          category: string;
          created_at?: string;
          created_by?: string | null;
          department: string;
          id?: string;
          notes?: string | null;
          org_id: string;
          period: string;
          updated_at?: string;
          vendor?: string | null;
        };
        Update: {
          actual_amount?: number;
          budgeted_amount?: number;
          category?: string;
          created_at?: string;
          created_by?: string | null;
          department?: string;
          id?: string;
          notes?: string | null;
          org_id?: string;
          period?: string;
          updated_at?: string;
          vendor?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "budget_entries_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      org_invites: {
        Row: {
          accepted_at: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string | null;
          org_id: string;
          role: Database["public"]["Enums"]["app_role"];
          token: string;
        };
        Insert: {
          accepted_at?: string | null;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          org_id: string;
          role?: Database["public"]["Enums"]["app_role"];
          token?: string;
        };
        Update: {
          accepted_at?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          org_id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "org_invites_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      org_members: {
        Row: {
          created_at: string;
          id: string;
          org_id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          org_id: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          org_id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organizations: {
        Row: {
          base_currency: string | null;
          company_size: string | null;
          created_at: string;
          fiscal_year_start: string | null;
          id: string;
          industry: string | null;
          logo_url: string | null;
          name: string;
          number_format: string | null;
          onboarding_completed: boolean;
          updated_at: string;
        };
        Insert: {
          base_currency?: string | null;
          company_size?: string | null;
          created_at?: string;
          fiscal_year_start?: string | null;
          id?: string;
          industry?: string | null;
          logo_url?: string | null;
          name: string;
          number_format?: string | null;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
        Update: {
          base_currency?: string | null;
          company_size?: string | null;
          created_at?: string;
          fiscal_year_start?: string | null;
          id?: string;
          industry?: string | null;
          logo_url?: string | null;
          name?: string;
          number_format?: string | null;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      fiscal_periods: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          type: "annual" | "quarterly" | "monthly";
          start_date: string;
          end_date: string;
          status: "draft" | "active" | "closed" | "locked";
          rollover_enabled: boolean;
          carried_over_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          type: "annual" | "quarterly" | "monthly";
          start_date: string;
          end_date: string;
          status?: "draft" | "active" | "closed" | "locked";
          rollover_enabled?: boolean;
          carried_over_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          type?: "annual" | "quarterly" | "monthly";
          start_date?: string;
          end_date?: string;
          status?: "draft" | "active" | "closed" | "locked";
          rollover_enabled?: boolean;
          carried_over_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fiscal_periods_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          org_id: string;
          parent_id: string | null;
          name: string;
          color: string | null;
          icon: string | null;
          budget_cap: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          parent_id?: string | null;
          name: string;
          color?: string | null;
          icon?: string | null;
          budget_cap?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          parent_id?: string | null;
          name?: string;
          color?: string | null;
          icon?: string | null;
          budget_cap?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      departments: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          code: string | null;
          is_archived: boolean;
          budget_cap: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          code?: string | null;
          is_archived?: boolean;
          budget_cap?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          code?: string | null;
          is_archived?: boolean;
          budget_cap?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "departments_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      expenses: {
        Row: {
          id: string;
          org_id: string;
          period_id: string | null;
          period_name: string;
          title: string;
          amount: number;
          date: string;
          department: string;
          category: string;
          vendor: string | null;
          payment_method: "credit_card" | "wire_transfer" | "direct_debit" | "petty_cash";
          receipt_url: string | null;
          notes: string | null;
          status: "planned" | "pending_approval" | "approved" | "paid";
          is_recurring: boolean;
          recurring_frequency: "monthly" | "quarterly" | "annual" | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          period_id?: string | null;
          period_name: string;
          title: string;
          amount: number;
          date?: string;
          department: string;
          category: string;
          vendor?: string | null;
          payment_method?: "credit_card" | "wire_transfer" | "direct_debit" | "petty_cash";
          receipt_url?: string | null;
          notes?: string | null;
          status?: "planned" | "pending_approval" | "approved" | "paid";
          is_recurring?: boolean;
          recurring_frequency?: "monthly" | "quarterly" | "annual" | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          period_id?: string | null;
          period_name?: string;
          title?: string;
          amount?: number;
          date?: string;
          department?: string;
          category?: string;
          vendor?: string | null;
          payment_method?: "credit_card" | "wire_transfer" | "direct_debit" | "petty_cash";
          receipt_url?: string | null;
          notes?: string | null;
          status?: "planned" | "pending_approval" | "approved" | "paid";
          is_recurring?: boolean;
          recurring_frequency?: "monthly" | "quarterly" | "annual" | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_org_id_fkey";
            columns: ["org_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_invite: { Args: { _token: string }; Returns: string };
      complete_onboarding: { Args: { _org: string }; Returns: undefined };
      create_organization: { Args: { _name: string }; Returns: string };
      get_org_role: {
        Args: { _org: string; _user: string };
        Returns: Database["public"]["Enums"]["app_role"];
      };
      has_org_role: {
        Args: {
          _org: string;
          _role: Database["public"]["Enums"]["app_role"];
          _user: string;
        };
        Returns: boolean;
      };
      is_org_member: { Args: { _org: string; _user: string }; Returns: boolean };
      seed_sample_budget_entries: { Args: { _org: string }; Returns: number };
    };
    Enums: {
      app_role:
        | "owner"
        | "admin"
        | "finance_manager"
        | "department_lead"
        | "contributor"
        | "viewer"
        | "member";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "member", "viewer"],
    },
  },
} as const;
