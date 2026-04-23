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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      prefectures: {
        Row: {
          code: string
          created_at: string
          id: string
          name_ar: string
          name_fr: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name_ar: string
          name_fr: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name_ar?: string
          name_fr?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          prefecture_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          prefecture_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          prefecture_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_prefecture_id_fkey"
            columns: ["prefecture_id"]
            isOneToOne: false
            referencedRelation: "prefectures"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_associations: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          motif: string | null
          movement_date: string | null
          movement_type: string
          name: string
          submission_id: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          motif?: string | null
          movement_date?: string | null
          movement_type: string
          name: string
          submission_id: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          motif?: string | null
          movement_date?: string | null
          movement_type?: string
          name?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_associations_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_camps: {
        Row: {
          boys: number
          camp_type: string | null
          created_at: string
          facilitators: number
          facilitators_trained: number
          girls: number
          id: string
          name: string
          rural: number
          submission_id: string
          urban: number
        }
        Insert: {
          boys?: number
          camp_type?: string | null
          created_at?: string
          facilitators?: number
          facilitators_trained?: number
          girls?: number
          id?: string
          name: string
          rural?: number
          submission_id: string
          urban?: number
        }
        Update: {
          boys?: number
          camp_type?: string | null
          created_at?: string
          facilitators?: number
          facilitators_trained?: number
          girls?: number
          id?: string
          name?: string
          rural?: number
          submission_id?: string
          urban?: number
        }
        Relationships: [
          {
            foreignKeyName: "submission_camps_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_festivals: {
        Row: {
          created_at: string
          id: string
          name: string
          participants: number
          qualified: number
          submission_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          participants?: number
          qualified?: number
          submission_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          participants?: number
          qualified?: number
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submission_festivals_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_indicators: {
        Row: {
          actual_value: number
          created_at: string
          id: string
          label: string
          program: string
          submission_id: string
          target_value: number
        }
        Insert: {
          actual_value?: number
          created_at?: string
          id?: string
          label: string
          program: string
          submission_id: string
          target_value?: number
        }
        Update: {
          actual_value?: number
          created_at?: string
          id?: string
          label?: string
          program?: string
          submission_id?: string
          target_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "submission_indicators_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submission_socioeco: {
        Row: {
          activity_type: string | null
          created_at: string
          duration: string | null
          id: string
          men: number
          partner: string | null
          rural_pct: number
          subject: string
          submission_id: string
          urban_pct: number
          women: number
        }
        Insert: {
          activity_type?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          men?: number
          partner?: string | null
          rural_pct?: number
          subject: string
          submission_id: string
          urban_pct?: number
          women?: number
        }
        Update: {
          activity_type?: string | null
          created_at?: string
          duration?: string | null
          id?: string
          men?: number
          partner?: string | null
          rural_pct?: number
          subject?: string
          submission_id?: string
          urban_pct?: number
          women?: number
        }
        Relationships: [
          {
            foreignKeyName: "submission_socioeco_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          camping_associations: number | null
          camping_facilitators: number | null
          camping_female: number | null
          camping_male: number | null
          camping_participants: number | null
          camping_rural: number | null
          camping_trainings: number | null
          camping_urban: number | null
          comments: string | null
          completeness_pct: number | null
          created_at: string
          director_name: string | null
          festivals_count: number | null
          festivals_participants: number | null
          festivals_qualified: number | null
          global_score: number | null
          id: string
          inst_dispute: number | null
          inst_in_progress: number | null
          inst_rehab_needs: number | null
          inst_updated: number | null
          integration_beneficiaries: number | null
          integration_partners: number | null
          integration_trainings: number | null
          outreach_capacity: number | null
          outreach_cultural: number | null
          outreach_educative: number | null
          outreach_sportive: number | null
          period: Database["public"]["Enums"]["submission_period"]
          perm_associations: number | null
          perm_capacity: number | null
          perm_clubs: number | null
          perm_conventions: number | null
          perm_cultural: number | null
          perm_educative: number | null
          perm_sportive: number | null
          prefecture_id: string
          report_date: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
          year: number
        }
        Insert: {
          camping_associations?: number | null
          camping_facilitators?: number | null
          camping_female?: number | null
          camping_male?: number | null
          camping_participants?: number | null
          camping_rural?: number | null
          camping_trainings?: number | null
          camping_urban?: number | null
          comments?: string | null
          completeness_pct?: number | null
          created_at?: string
          director_name?: string | null
          festivals_count?: number | null
          festivals_participants?: number | null
          festivals_qualified?: number | null
          global_score?: number | null
          id?: string
          inst_dispute?: number | null
          inst_in_progress?: number | null
          inst_rehab_needs?: number | null
          inst_updated?: number | null
          integration_beneficiaries?: number | null
          integration_partners?: number | null
          integration_trainings?: number | null
          outreach_capacity?: number | null
          outreach_cultural?: number | null
          outreach_educative?: number | null
          outreach_sportive?: number | null
          period?: Database["public"]["Enums"]["submission_period"]
          perm_associations?: number | null
          perm_capacity?: number | null
          perm_clubs?: number | null
          perm_conventions?: number | null
          perm_cultural?: number | null
          perm_educative?: number | null
          perm_sportive?: number | null
          prefecture_id: string
          report_date?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          camping_associations?: number | null
          camping_facilitators?: number | null
          camping_female?: number | null
          camping_male?: number | null
          camping_participants?: number | null
          camping_rural?: number | null
          camping_trainings?: number | null
          camping_urban?: number | null
          comments?: string | null
          completeness_pct?: number | null
          created_at?: string
          director_name?: string | null
          festivals_count?: number | null
          festivals_participants?: number | null
          festivals_qualified?: number | null
          global_score?: number | null
          id?: string
          inst_dispute?: number | null
          inst_in_progress?: number | null
          inst_rehab_needs?: number | null
          inst_updated?: number | null
          integration_beneficiaries?: number | null
          integration_partners?: number | null
          integration_trainings?: number | null
          outreach_capacity?: number | null
          outreach_cultural?: number | null
          outreach_educative?: number | null
          outreach_sportive?: number | null
          period?: Database["public"]["Enums"]["submission_period"]
          perm_associations?: number | null
          perm_capacity?: number | null
          perm_clubs?: number | null
          perm_conventions?: number | null
          perm_cultural?: number | null
          perm_educative?: number | null
          perm_sportive?: number | null
          prefecture_id?: string
          report_date?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "submissions_prefecture_id_fkey"
            columns: ["prefecture_id"]
            isOneToOne: false
            referencedRelation: "prefectures"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_owns_submission: {
        Args: { _submission_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin_regional" | "equipe_regionale" | "directeur_prefectoral"
      submission_period: "annuelle" | "trimestrielle"
      submission_status: "brouillon" | "soumise" | "validee"
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
      app_role: ["admin_regional", "equipe_regionale", "directeur_prefectoral"],
      submission_period: ["annuelle", "trimestrielle"],
      submission_status: ["brouillon", "soumise", "validee"],
    },
  },
} as const
