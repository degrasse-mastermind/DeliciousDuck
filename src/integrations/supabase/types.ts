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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      indexing_coverage_snapshots: {
        Row: {
          breakdown: Json
          captured_at: string
          checked_count: number
          failed_count: number
          id: string
          incomplete_reason: string | null
          indexed_count: number
          is_complete: boolean
          monitored_count: number
          not_indexed_count: number
          site_url: string
          source: string
          unresolved_count: number
        }
        Insert: {
          breakdown?: Json
          captured_at?: string
          checked_count?: number
          failed_count?: number
          id?: string
          incomplete_reason?: string | null
          indexed_count?: number
          is_complete?: boolean
          monitored_count?: number
          not_indexed_count?: number
          site_url: string
          source?: string
          unresolved_count?: number
        }
        Update: {
          breakdown?: Json
          captured_at?: string
          checked_count?: number
          failed_count?: number
          id?: string
          incomplete_reason?: string | null
          indexed_count?: number
          is_complete?: boolean
          monitored_count?: number
          not_indexed_count?: number
          site_url?: string
          source?: string
          unresolved_count?: number
        }
        Relationships: []
      }
      indexing_cron_credential: {
        Row: {
          id: number
          rotated_at: string
          token: string
        }
        Insert: {
          id?: number
          rotated_at?: string
          token: string
        }
        Update: {
          id?: number
          rotated_at?: string
          token?: string
        }
        Relationships: []
      }
      indexing_snapshots: {
        Row: {
          captured_at: string
          error_count: number
          id: string
          indexed_count: number
          is_pending: boolean
          last_downloaded: string | null
          last_submitted: string | null
          site_url: string
          sitemap_url: string
          source: string
          submitted_count: number
          warning_count: number
        }
        Insert: {
          captured_at?: string
          error_count?: number
          id?: string
          indexed_count?: number
          is_pending?: boolean
          last_downloaded?: string | null
          last_submitted?: string | null
          site_url: string
          sitemap_url: string
          source?: string
          submitted_count?: number
          warning_count?: number
        }
        Update: {
          captured_at?: string
          error_count?: number
          id?: string
          indexed_count?: number
          is_pending?: boolean
          last_downloaded?: string | null
          last_submitted?: string | null
          site_url?: string
          sitemap_url?: string
          source?: string
          submitted_count?: number
          warning_count?: number
        }
        Relationships: []
      }
      indexing_url_coverage: {
        Row: {
          captured_at: string
          coverage_state: string | null
          google_canonical: string | null
          id: string
          index_state: string
          indexing_state: string | null
          inspect_error: string | null
          is_indexed: boolean
          last_crawl_time: string | null
          page_fetch_state: string | null
          robots_txt_state: string | null
          site_url: string
          snapshot_id: string | null
          url: string
          verdict: string | null
        }
        Insert: {
          captured_at?: string
          coverage_state?: string | null
          google_canonical?: string | null
          id?: string
          index_state?: string
          indexing_state?: string | null
          inspect_error?: string | null
          is_indexed?: boolean
          last_crawl_time?: string | null
          page_fetch_state?: string | null
          robots_txt_state?: string | null
          site_url: string
          snapshot_id?: string | null
          url: string
          verdict?: string | null
        }
        Update: {
          captured_at?: string
          coverage_state?: string | null
          google_canonical?: string | null
          id?: string
          index_state?: string
          indexing_state?: string | null
          inspect_error?: string | null
          is_indexed?: boolean
          last_crawl_time?: string | null
          page_fetch_state?: string | null
          robots_txt_state?: string | null
          site_url?: string
          snapshot_id?: string | null
          url?: string
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "indexing_url_coverage_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "indexing_coverage_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_provider_events: {
        Row: {
          created_at: string
          detail: string | null
          email_normalized: string
          event_type: string
          id: string
          occurred_at: string | null
          provider: string
          provider_event_id: string | null
          received_at: string
          subscriber_id: string | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          detail?: string | null
          email_normalized: string
          event_type: string
          id?: string
          occurred_at?: string | null
          provider?: string
          provider_event_id?: string | null
          received_at?: string
          subscriber_id?: string | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          detail?: string | null
          email_normalized?: string
          event_type?: string
          id?: string
          occurred_at?: string | null
          provider?: string
          provider_event_id?: string | null
          received_at?: string
          subscriber_id?: string | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_provider_events_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          acquisition_source: string | null
          concern: string | null
          confirmation_sent_at: string | null
          confirmation_sent_count: number
          confirmation_status: string
          confirmation_token: string
          confirmed_at: string | null
          consent_record: string
          consent_source_path: string | null
          consent_text_version: string | null
          consented_at: string | null
          created_at: string
          cut: string | null
          email: string
          email_normalized: string
          first_content_path: string | null
          game_plan_email_at: string | null
          id: string
          interest: string | null
          interests: string[]
          last_engagement_at: string | null
          last_resend_sync_at: string | null
          last_signup_at: string
          lifecycle_stage: string
          method: string | null
          party_size_bucket: string | null
          placement: string | null
          preference_token: string
          primary_interest: string | null
          privacy_policy_url: string | null
          privacy_policy_version: string | null
          provider_last_event: string | null
          provider_last_event_at: string | null
          resend_contact_id: string | null
          resend_sync_status: string
          signup_count: number
          source: string | null
          source_path: string | null
          status: string
          subscribed_at: string
          suppressed_at: string | null
          suppression_reason: string | null
          unsubscribed_at: string | null
          updated_at: string
          welcome_event_at: string | null
          welcome_event_status: string
        }
        Insert: {
          acquisition_source?: string | null
          concern?: string | null
          confirmation_sent_at?: string | null
          confirmation_sent_count?: number
          confirmation_status?: string
          confirmation_token?: string
          confirmed_at?: string | null
          consent_record?: string
          consent_source_path?: string | null
          consent_text_version?: string | null
          consented_at?: string | null
          created_at?: string
          cut?: string | null
          email: string
          email_normalized: string
          first_content_path?: string | null
          game_plan_email_at?: string | null
          id?: string
          interest?: string | null
          interests?: string[]
          last_engagement_at?: string | null
          last_resend_sync_at?: string | null
          last_signup_at?: string
          lifecycle_stage?: string
          method?: string | null
          party_size_bucket?: string | null
          placement?: string | null
          preference_token?: string
          primary_interest?: string | null
          privacy_policy_url?: string | null
          privacy_policy_version?: string | null
          provider_last_event?: string | null
          provider_last_event_at?: string | null
          resend_contact_id?: string | null
          resend_sync_status?: string
          signup_count?: number
          source?: string | null
          source_path?: string | null
          status?: string
          subscribed_at?: string
          suppressed_at?: string | null
          suppression_reason?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
          welcome_event_at?: string | null
          welcome_event_status?: string
        }
        Update: {
          acquisition_source?: string | null
          concern?: string | null
          confirmation_sent_at?: string | null
          confirmation_sent_count?: number
          confirmation_status?: string
          confirmation_token?: string
          confirmed_at?: string | null
          consent_record?: string
          consent_source_path?: string | null
          consent_text_version?: string | null
          consented_at?: string | null
          created_at?: string
          cut?: string | null
          email?: string
          email_normalized?: string
          first_content_path?: string | null
          game_plan_email_at?: string | null
          id?: string
          interest?: string | null
          interests?: string[]
          last_engagement_at?: string | null
          last_resend_sync_at?: string | null
          last_signup_at?: string
          lifecycle_stage?: string
          method?: string | null
          party_size_bucket?: string | null
          placement?: string | null
          preference_token?: string
          primary_interest?: string | null
          privacy_policy_url?: string | null
          privacy_policy_version?: string | null
          provider_last_event?: string | null
          provider_last_event_at?: string | null
          resend_contact_id?: string | null
          resend_sync_status?: string
          signup_count?: number
          source?: string | null
          source_path?: string | null
          status?: string
          subscribed_at?: string
          suppressed_at?: string | null
          suppression_reason?: string | null
          unsubscribed_at?: string | null
          updated_at?: string
          welcome_event_at?: string | null
          welcome_event_status?: string
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
