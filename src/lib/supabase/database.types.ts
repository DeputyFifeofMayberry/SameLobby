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
      accounts: {
        Row: {
          adult_attested_at: string | null
          auth_user_id: string
          community_standards_version: string | null
          created_at: string
          deleted_at: string | null
          email: string
          enforcement_key: string
          id: string
          locale: string
          privacy_version: string | null
          status: Database["public"]["Enums"]["account_status"]
          terms_version: string | null
          time_zone: string | null
          updated_at: string
        }
        Insert: {
          adult_attested_at?: string | null
          auth_user_id: string
          community_standards_version?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          enforcement_key?: string
          id?: string
          locale?: string
          privacy_version?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          terms_version?: string | null
          time_zone?: string | null
          updated_at?: string
        }
        Update: {
          adult_attested_at?: string | null
          auth_user_id?: string
          community_standards_version?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          enforcement_key?: string
          id?: string
          locale?: string
          privacy_version?: string | null
          status?: Database["public"]["Enums"]["account_status"]
          terms_version?: string | null
          time_zone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          account_id: string
          created_at: string
          disabled_at: string | null
          mfa_enrolled_at: string | null
          scopes: string[]
        }
        Insert: {
          account_id: string
          created_at?: string
          disabled_at?: string | null
          mfa_enrolled_at?: string | null
          scopes?: string[]
        }
        Update: {
          account_id?: string
          created_at?: string
          disabled_at?: string | null
          mfa_enrolled_at?: string | null
          scopes?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      appeals: {
        Row: {
          appellant_account_id: string
          body: string
          created_at: string
          id: string
          moderation_action_id: string
          status: Database["public"]["Enums"]["appeal_status"]
          updated_at: string
        }
        Insert: {
          appellant_account_id: string
          body: string
          created_at?: string
          id?: string
          moderation_action_id: string
          status?: Database["public"]["Enums"]["appeal_status"]
          updated_at?: string
        }
        Update: {
          appellant_account_id?: string
          body?: string
          created_at?: string
          id?: string
          moderation_action_id?: string
          status?: Database["public"]["Enums"]["appeal_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appeals_appellant_account_id_fkey"
            columns: ["appellant_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appeals_moderation_action_id_fkey"
            columns: ["moderation_action_id"]
            isOneToOne: true
            referencedRelation: "moderation_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          action: string
          actor_account_id: string | null
          correlation_id: string | null
          created_at: string
          id: string
          metadata: Json
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          actor_account_id?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          actor_account_id?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_account_id_fkey"
            columns: ["actor_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_windows: {
        Row: {
          account_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_windows_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      block_enforcement_keys: {
        Row: {
          blocked_key: string
          blocker_key: string
          created_at: string
        }
        Insert: {
          blocked_key: string
          blocker_key: string
          created_at?: string
        }
        Update: {
          blocked_key?: string
          blocker_key?: string
          created_at?: string
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_account_id: string
          blocker_account_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_account_id: string
          blocker_account_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_account_id?: string
          blocker_account_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_account_id_fkey"
            columns: ["blocked_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_account_id_fkey"
            columns: ["blocker_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_activation_status: {
        Row: {
          cohort_key: string
          status: Database["public"]["Enums"]["cohort_status"]
          updated_at: string
        }
        Insert: {
          cohort_key: string
          status?: Database["public"]["Enums"]["cohort_status"]
          updated_at?: string
        }
        Update: {
          cohort_key?: string
          status?: Database["public"]["Enums"]["cohort_status"]
          updated_at?: string
        }
        Relationships: []
      }
      cohort_metrics: {
        Row: {
          cohort_key: string
          id: string
          measured_at: string
          qualified_account_count: number
        }
        Insert: {
          cohort_key: string
          id?: string
          measured_at?: string
          qualified_account_count: number
        }
        Update: {
          cohort_key?: string
          id?: string
          measured_at?: string
          qualified_account_count?: number
        }
        Relationships: []
      }
      compatibility_preferences: {
        Row: {
          account_id: string
          created_at: string
          group_size_preference: string | null
          id: string
          playstyle_notes: string | null
          social_energy: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          group_size_preference?: string | null
          id?: string
          playstyle_notes?: string | null
          social_energy?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          group_size_preference?: string | null
          id?: string
          playstyle_notes?: string | null
          social_energy?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compatibility_preferences_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_requests: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          intent_id: string | null
          message: string | null
          recipient_account_id: string
          responded_at: string | null
          sender_account_id: string
          status: Database["public"]["Enums"]["connection_request_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          intent_id?: string | null
          message?: string | null
          recipient_account_id: string
          responded_at?: string | null
          sender_account_id: string
          status?: Database["public"]["Enums"]["connection_request_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          intent_id?: string | null
          message?: string | null
          recipient_account_id?: string
          responded_at?: string | null
          sender_account_id?: string
          status?: Database["public"]["Enums"]["connection_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_requests_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "current_intents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_recipient_account_id_fkey"
            columns: ["recipient_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_sender_account_id_fkey"
            columns: ["sender_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          connection_request_id: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
          user_a_id: string
          user_b_id: string
        }
        Insert: {
          connection_request_id?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          user_a_id: string
          user_b_id: string
        }
        Update: {
          connection_request_id?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          user_a_id?: string
          user_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_connection_request_id_fkey"
            columns: ["connection_request_id"]
            isOneToOne: false
            referencedRelation: "connection_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_events: {
        Row: {
          account_id: string
          created_at: string
          event_type: Database["public"]["Enums"]["consent_event_type"]
          id: string
          ip_hash: string | null
          policy_version: string
          user_agent_hash: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          event_type: Database["public"]["Enums"]["consent_event_type"]
          id?: string
          ip_hash?: string | null
          policy_version: string
          user_agent_hash?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          event_type?: Database["public"]["Enums"]["consent_event_type"]
          id?: string
          ip_hash?: string | null
          policy_version?: string
          user_agent_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_events_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_members: {
        Row: {
          account_id: string
          conversation_id: string
          joined_at: string
          last_read_at: string | null
        }
        Insert: {
          account_id: string
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
        }
        Update: {
          account_id?: string
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_members_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          connection_id: string | null
          created_at: string
          group_id: string | null
          id: string
          kind: Database["public"]["Enums"]["conversation_kind"]
          permission: Database["public"]["Enums"]["conversation_permission"]
          updated_at: string
        }
        Insert: {
          connection_id?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["conversation_kind"]
          permission?: Database["public"]["Enums"]["conversation_permission"]
          updated_at?: string
        }
        Update: {
          connection_id?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["conversation_kind"]
          permission?: Database["public"]["Enums"]["conversation_permission"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "private_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      crossplay_sets: {
        Row: {
          game_id: string
          id: string
          notes: string | null
          platform_ids: string[]
          reviewed_at: string
        }
        Insert: {
          game_id: string
          id?: string
          notes?: string | null
          platform_ids: string[]
          reviewed_at?: string
        }
        Update: {
          game_id?: string
          id?: string
          notes?: string | null
          platform_ids?: string[]
          reviewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crossplay_sets_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      current_intents: {
        Row: {
          account_id: string
          created_at: string
          expires_at: string
          game_id: string | null
          goal: Database["public"]["Enums"]["intent_goal"]
          id: string
          platform_id: string | null
          status: Database["public"]["Enums"]["intent_status"]
          updated_at: string
          voice_preferred: boolean
        }
        Insert: {
          account_id: string
          created_at?: string
          expires_at: string
          game_id?: string | null
          goal: Database["public"]["Enums"]["intent_goal"]
          id?: string
          platform_id?: string | null
          status?: Database["public"]["Enums"]["intent_status"]
          updated_at?: string
          voice_preferred?: boolean
        }
        Update: {
          account_id?: string
          created_at?: string
          expires_at?: string
          game_id?: string | null
          goal?: Database["public"]["Enums"]["intent_goal"]
          id?: string
          platform_id?: string | null
          status?: Database["public"]["Enums"]["intent_status"]
          updated_at?: string
          voice_preferred?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "current_intents_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "current_intents_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "current_intents_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      deletion_job_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          deletion_request_id: string
          error: string | null
          id: string
          stage: Database["public"]["Enums"]["deletion_job_stage"]
          started_at: string | null
          status: Database["public"]["Enums"]["deletion_job_status"]
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          deletion_request_id: string
          error?: string | null
          id?: string
          stage: Database["public"]["Enums"]["deletion_job_stage"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["deletion_job_status"]
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          deletion_request_id?: string
          error?: string | null
          id?: string
          stage?: Database["public"]["Enums"]["deletion_job_stage"]
          started_at?: string | null
          status?: Database["public"]["Enums"]["deletion_job_status"]
        }
        Relationships: [
          {
            foreignKeyName: "deletion_job_runs_deletion_request_id_fkey"
            columns: ["deletion_request_id"]
            isOneToOne: false
            referencedRelation: "deletion_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      deletion_requests: {
        Row: {
          account_id: string
          created_at: string
          id: string
          requested_at: string
          scheduled_purge_at: string | null
          status: Database["public"]["Enums"]["deletion_request_status"]
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          requested_at?: string
          scheduled_purge_at?: string | null
          status?: Database["public"]["Enums"]["deletion_request_status"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          requested_at?: string
          scheduled_purge_at?: string | null
          status?: Database["public"]["Enums"]["deletion_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deletion_requests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_signals: {
        Row: {
          account_id: string
          cohort_key: string
          created_at: string
          id: string
        }
        Insert: {
          account_id: string
          cohort_key: string
          created_at?: string
          id?: string
        }
        Update: {
          account_id?: string
          cohort_key?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_signals_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      disclosure_settings: {
        Row: {
          account_id: string
          created_at: string
          field_key: string
          id: string
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_level"]
        }
        Insert: {
          account_id: string
          created_at?: string
          field_key: string
          id?: string
          updated_at?: string
          visibility: Database["public"]["Enums"]["visibility_level"]
        }
        Update: {
          account_id?: string
          created_at?: string
          field_key?: string
          id?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Relationships: [
          {
            foreignKeyName: "disclosure_settings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_recommendations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          reason_codes: string[]
          recommended_account_id: string
          viewer_account_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          reason_codes: string[]
          recommended_account_id: string
          viewer_account_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          reason_codes?: string[]
          recommended_account_id?: string
          viewer_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discovery_recommendations_recommended_account_id_fkey"
            columns: ["recommended_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discovery_recommendations_viewer_account_id_fkey"
            columns: ["viewer_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlements: {
        Row: {
          account_id: string
          max_active_games: number
          max_active_groups_owned: number
          max_saved_searches: number
          read_only: boolean
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
        }
        Insert: {
          account_id: string
          max_active_games?: number
          max_active_groups_owned?: number
          max_saved_searches?: number
          read_only?: boolean
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          max_active_games?: number
          max_active_groups_owned?: number
          max_saved_searches?: number
          read_only?: boolean
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      environment_preferences: {
        Row: {
          accommodation_notes: string | null
          account_id: string
          boundaries: string | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          accommodation_notes?: string | null
          account_id: string
          boundaries?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          accommodation_notes?: string | null
          account_id?: string
          boundaries?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "environment_preferences_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          enabled: boolean
          key: string
          metadata: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          enabled?: boolean
          key: string
          metadata?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          enabled?: boolean
          key?: string
          metadata?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      game_platforms: {
        Row: {
          game_id: string
          platform_id: string
        }
        Insert: {
          game_id: string
          platform_id: string
        }
        Update: {
          game_id?: string
          platform_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_platforms_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_platforms_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      gamer_profiles: {
        Row: {
          account_id: string
          communication_modes: Database["public"]["Enums"]["communication_mode"][]
          created_at: string
          discovery_paused_at: string | null
          display_name: string | null
          id: string
          introduction: string | null
          onboarding_completed_at: string | null
          onboarding_step: Database["public"]["Enums"]["onboarding_step"]
          updated_at: string
        }
        Insert: {
          account_id: string
          communication_modes?: Database["public"]["Enums"]["communication_mode"][]
          created_at?: string
          discovery_paused_at?: string | null
          display_name?: string | null
          id?: string
          introduction?: string | null
          onboarding_completed_at?: string | null
          onboarding_step?: Database["public"]["Enums"]["onboarding_step"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          communication_modes?: Database["public"]["Enums"]["communication_mode"][]
          created_at?: string
          discovery_paused_at?: string | null
          display_name?: string | null
          id?: string
          introduction?: string | null
          onboarding_completed_at?: string | null
          onboarding_step?: Database["public"]["Enums"]["onboarding_step"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamer_profiles_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_anchor: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_anchor?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_anchor?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      gaming_sessions: {
        Row: {
          completed_at: string | null
          confirmed_start_at: string
          conversation_id: string
          created_at: string
          game_id: string
          id: string
          invitation_id: string
          occurred_a: boolean | null
          occurred_b: boolean | null
          participant_a_id: string
          participant_b_id: string
          platform_id: string
          reminder_24h_sent_at: string | null
          reminder_30m_sent_at: string | null
          session_length_minutes: number
          started_at: string | null
          status: Database["public"]["Enums"]["gaming_session_status"]
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          confirmed_start_at: string
          conversation_id: string
          created_at?: string
          game_id: string
          id?: string
          invitation_id: string
          occurred_a?: boolean | null
          occurred_b?: boolean | null
          participant_a_id: string
          participant_b_id: string
          platform_id: string
          reminder_24h_sent_at?: string | null
          reminder_30m_sent_at?: string | null
          session_length_minutes: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["gaming_session_status"]
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          confirmed_start_at?: string
          conversation_id?: string
          created_at?: string
          game_id?: string
          id?: string
          invitation_id?: string
          occurred_a?: boolean | null
          occurred_b?: boolean | null
          participant_a_id?: string
          participant_b_id?: string
          platform_id?: string
          reminder_24h_sent_at?: string | null
          reminder_30m_sent_at?: string | null
          session_length_minutes?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["gaming_session_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gaming_sessions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gaming_sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gaming_sessions_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: true
            referencedRelation: "play_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gaming_sessions_participant_a_id_fkey"
            columns: ["participant_a_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gaming_sessions_participant_b_id_fkey"
            columns: ["participant_b_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gaming_sessions_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      group_invitation_approvals: {
        Row: {
          approved: boolean
          created_at: string
          invitation_id: string
          updated_at: string
          voter_account_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          invitation_id: string
          updated_at?: string
          voter_account_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          invitation_id?: string
          updated_at?: string
          voter_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_invitation_approvals_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "group_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitation_approvals_voter_account_id_fkey"
            columns: ["voter_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      group_invitations: {
        Row: {
          created_at: string
          expires_at: string
          group_id: string
          id: string
          invitee_account_id: string
          inviter_account_id: string
          status: Database["public"]["Enums"]["group_invitation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          group_id: string
          id?: string
          invitee_account_id: string
          inviter_account_id: string
          status?: Database["public"]["Enums"]["group_invitation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          group_id?: string
          id?: string
          invitee_account_id?: string
          inviter_account_id?: string
          status?: Database["public"]["Enums"]["group_invitation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "private_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_invitee_account_id_fkey"
            columns: ["invitee_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_invitations_inviter_account_id_fkey"
            columns: ["inviter_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      group_memberships: {
        Row: {
          account_id: string
          created_at: string
          group_id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["group_member_role"]
          status: Database["public"]["Enums"]["group_membership_status"]
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          group_id: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["group_member_role"]
          status?: Database["public"]["Enums"]["group_membership_status"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          group_id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["group_member_role"]
          status?: Database["public"]["Enums"]["group_membership_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_memberships_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "private_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_open_seats: {
        Row: {
          created_at: string
          created_by_account_id: string
          game_id: string | null
          group_id: string
          id: string
          kind: Database["public"]["Enums"]["open_seat_kind"]
          role_note: string | null
          status: Database["public"]["Enums"]["open_seat_status"]
          unavailable_account_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_account_id: string
          game_id?: string | null
          group_id: string
          id?: string
          kind: Database["public"]["Enums"]["open_seat_kind"]
          role_note?: string | null
          status?: Database["public"]["Enums"]["open_seat_status"]
          unavailable_account_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_account_id?: string
          game_id?: string | null
          group_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["open_seat_kind"]
          role_note?: string | null
          status?: Database["public"]["Enums"]["open_seat_status"]
          unavailable_account_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_open_seats_created_by_account_id_fkey"
            columns: ["created_by_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_open_seats_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_open_seats_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "private_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_open_seats_unavailable_account_id_fkey"
            columns: ["unavailable_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      interests: {
        Row: {
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      job_runs: {
        Row: {
          completed_at: string | null
          id: string
          idempotency_key: string
          job_name: string
          metadata: Json
          started_at: string
          status: Database["public"]["Enums"]["job_run_status"]
        }
        Insert: {
          completed_at?: string | null
          id?: string
          idempotency_key: string
          job_name: string
          metadata?: Json
          started_at?: string
          status?: Database["public"]["Enums"]["job_run_status"]
        }
        Update: {
          completed_at?: string | null
          id?: string
          idempotency_key?: string
          job_name?: string
          metadata?: Json
          started_at?: string
          status?: Database["public"]["Enums"]["job_run_status"]
        }
        Relationships: []
      }
      legal_holds: {
        Row: {
          account_id: string
          active: boolean
          case_id: string | null
          created_at: string
          created_by_account_id: string | null
          id: string
          reason: string
          updated_at: string
        }
        Insert: {
          account_id: string
          active?: boolean
          case_id?: string | null
          created_at?: string
          created_by_account_id?: string | null
          id?: string
          reason: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          active?: boolean
          case_id?: string | null
          created_at?: string
          created_by_account_id?: string | null
          id?: string
          reason?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_holds_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_holds_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "moderation_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_holds_created_by_account_id_fkey"
            columns: ["created_by_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          retention_at: string
          sender_account_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          retention_at: string
          sender_account_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          retention_at?: string
          sender_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_account_id_fkey"
            columns: ["sender_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_actions: {
        Row: {
          action_type: Database["public"]["Enums"]["moderation_action_type"]
          appeal_deadline_at: string | null
          case_id: string
          created_at: string
          created_by_account_id: string
          effective_at: string
          expires_at: string | null
          id: string
          reason_code: string
          subject_account_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["moderation_action_type"]
          appeal_deadline_at?: string | null
          case_id: string
          created_at?: string
          created_by_account_id: string
          effective_at?: string
          expires_at?: string | null
          id?: string
          reason_code: string
          subject_account_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["moderation_action_type"]
          appeal_deadline_at?: string | null
          case_id?: string
          created_at?: string
          created_by_account_id?: string
          effective_at?: string
          expires_at?: string | null
          id?: string
          reason_code?: string
          subject_account_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_actions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "moderation_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_created_by_account_id_fkey"
            columns: ["created_by_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_actions_subject_account_id_fkey"
            columns: ["subject_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_case_notes: {
        Row: {
          author_account_id: string
          body: string
          case_id: string
          created_at: string
          id: string
        }
        Insert: {
          author_account_id: string
          body: string
          case_id: string
          created_at?: string
          id?: string
        }
        Update: {
          author_account_id?: string
          body?: string
          case_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_case_notes_author_account_id_fkey"
            columns: ["author_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "moderation_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_cases: {
        Row: {
          assigned_reviewer_account_id: string | null
          claimed_at: string | null
          created_at: string
          id: string
          policy_reference: string | null
          report_id: string
          severity: Database["public"]["Enums"]["moderation_severity"]
          status: Database["public"]["Enums"]["moderation_case_status"]
          updated_at: string
        }
        Insert: {
          assigned_reviewer_account_id?: string | null
          claimed_at?: string | null
          created_at?: string
          id?: string
          policy_reference?: string | null
          report_id: string
          severity: Database["public"]["Enums"]["moderation_severity"]
          status?: Database["public"]["Enums"]["moderation_case_status"]
          updated_at?: string
        }
        Update: {
          assigned_reviewer_account_id?: string | null
          claimed_at?: string | null
          created_at?: string
          id?: string
          policy_reference?: string | null
          report_id?: string
          severity?: Database["public"]["Enums"]["moderation_severity"]
          status?: Database["public"]["Enums"]["moderation_case_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moderation_cases_assigned_reviewer_account_id_fkey"
            columns: ["assigned_reviewer_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_cases_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_evidence: {
        Row: {
          body: string
          captured_at: string
          case_id: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["moderation_evidence_kind"]
          source_message_id: string | null
        }
        Insert: {
          body: string
          captured_at?: string
          case_id: string
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["moderation_evidence_kind"]
          source_message_id?: string | null
        }
        Update: {
          body?: string
          captured_at?: string
          case_id?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["moderation_evidence_kind"]
          source_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_evidence_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "moderation_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_evidence_source_message_id_fkey"
            columns: ["source_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          account_id: string
          created_at: string
          email_new_message: boolean
          email_play_reminder: boolean
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          email_new_message?: boolean
          email_play_reminder?: boolean
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          email_new_message?: boolean
          email_play_reminder?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          account_id: string
          body: string
          created_at: string
          href: string | null
          id: string
          kind: Database["public"]["Enums"]["notification_kind"]
          read_at: string | null
          title: string
        }
        Insert: {
          account_id: string
          body: string
          created_at?: string
          href?: string | null
          id?: string
          kind: Database["public"]["Enums"]["notification_kind"]
          read_at?: string | null
          title: string
        }
        Update: {
          account_id?: string
          body?: string
          created_at?: string
          href?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["notification_kind"]
          read_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          display_name: string
          key: string
          stripe_price_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          key: string
          stripe_price_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          key?: string
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      platforms: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      play_invitations: {
        Row: {
          conversation_id: string
          created_at: string
          expires_at: string
          game_id: string
          id: string
          note: string | null
          platform_id: string
          proposer_account_id: string
          recipient_account_id: string
          responded_at: string | null
          scheduling_mode: Database["public"]["Enums"]["play_scheduling_mode"]
          session_length_minutes: number
          status: Database["public"]["Enums"]["play_invitation_status"]
          updated_at: string
          voice_preferred: boolean
        }
        Insert: {
          conversation_id: string
          created_at?: string
          expires_at: string
          game_id: string
          id?: string
          note?: string | null
          platform_id: string
          proposer_account_id: string
          recipient_account_id: string
          responded_at?: string | null
          scheduling_mode: Database["public"]["Enums"]["play_scheduling_mode"]
          session_length_minutes: number
          status?: Database["public"]["Enums"]["play_invitation_status"]
          updated_at?: string
          voice_preferred?: boolean
        }
        Update: {
          conversation_id?: string
          created_at?: string
          expires_at?: string
          game_id?: string
          id?: string
          note?: string | null
          platform_id?: string
          proposer_account_id?: string
          recipient_account_id?: string
          responded_at?: string | null
          scheduling_mode?: Database["public"]["Enums"]["play_scheduling_mode"]
          session_length_minutes?: number
          status?: Database["public"]["Enums"]["play_invitation_status"]
          updated_at?: string
          voice_preferred?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "play_invitations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_invitations_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_invitations_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_invitations_proposer_account_id_fkey"
            columns: ["proposer_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "play_invitations_recipient_account_id_fkey"
            columns: ["recipient_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      play_time_options: {
        Row: {
          id: string
          invitation_id: string
          proposed_start_at: string
          sort_order: number
        }
        Insert: {
          id?: string
          invitation_id: string
          proposed_start_at: string
          sort_order: number
        }
        Update: {
          id?: string
          invitation_id?: string
          proposed_start_at?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "play_time_options_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "play_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      post_play_feedback: {
        Row: {
          account_id: string
          continuation:
            | Database["public"]["Enums"]["post_play_continuation"]
            | null
          created_at: string
          id: string
          occurred: Database["public"]["Enums"]["post_play_occurred"] | null
          session_id: string
        }
        Insert: {
          account_id: string
          continuation?:
            | Database["public"]["Enums"]["post_play_continuation"]
            | null
          created_at?: string
          id?: string
          occurred?: Database["public"]["Enums"]["post_play_occurred"] | null
          session_id: string
        }
        Update: {
          account_id?: string
          continuation?:
            | Database["public"]["Enums"]["post_play_continuation"]
            | null
          created_at?: string
          id?: string
          occurred?: Database["public"]["Enums"]["post_play_occurred"] | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_play_feedback_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_play_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "gaming_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      private_groups: {
        Row: {
          created_at: string
          emblem_key: string | null
          id: string
          name: string
          owner_account_id: string
          shared_game_id: string | null
          size_goal: number
          status: Database["public"]["Enums"]["private_group_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          emblem_key?: string | null
          id?: string
          name: string
          owner_account_id: string
          shared_game_id?: string | null
          size_goal: number
          status?: Database["public"]["Enums"]["private_group_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          emblem_key?: string | null
          id?: string
          name?: string
          owner_account_id?: string
          shared_game_id?: string | null
          size_goal?: number
          status?: Database["public"]["Enums"]["private_group_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_groups_owner_account_id_fkey"
            columns: ["owner_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_groups_shared_game_id_fkey"
            columns: ["shared_game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_reason_codes: {
        Row: {
          code: string
          description: string | null
          label: string
        }
        Insert: {
          code: string
          description?: string | null
          label: string
        }
        Update: {
          code?: string
          description?: string | null
          label?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          category: Database["public"]["Enums"]["report_category"]
          conversation_id: string | null
          created_at: string
          description: string
          group_id: string | null
          id: string
          include_message_context: boolean
          moderation_case_id: string | null
          play_invitation_id: string | null
          reported_account_id: string
          reporter_account_id: string
          severity: Database["public"]["Enums"]["moderation_severity"] | null
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          category: Database["public"]["Enums"]["report_category"]
          conversation_id?: string | null
          created_at?: string
          description: string
          group_id?: string | null
          id?: string
          include_message_context?: boolean
          moderation_case_id?: string | null
          play_invitation_id?: string | null
          reported_account_id: string
          reporter_account_id: string
          severity?: Database["public"]["Enums"]["moderation_severity"] | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          category?: Database["public"]["Enums"]["report_category"]
          conversation_id?: string | null
          created_at?: string
          description?: string
          group_id?: string | null
          id?: string
          include_message_context?: boolean
          moderation_case_id?: string | null
          play_invitation_id?: string | null
          reported_account_id?: string
          reporter_account_id?: string
          severity?: Database["public"]["Enums"]["moderation_severity"] | null
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "private_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_moderation_case_id_fkey"
            columns: ["moderation_case_id"]
            isOneToOne: false
            referencedRelation: "moderation_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_play_invitation_id_fkey"
            columns: ["play_invitation_id"]
            isOneToOne: false
            referencedRelation: "play_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reported_account_id_fkey"
            columns: ["reported_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_account_id_fkey"
            columns: ["reporter_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_policies: {
        Row: {
          retention_days: number
          severity: Database["public"]["Enums"]["moderation_severity"]
        }
        Insert: {
          retention_days: number
          severity: Database["public"]["Enums"]["moderation_severity"]
        }
        Update: {
          retention_days?: number
          severity?: Database["public"]["Enums"]["moderation_severity"]
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          account_id: string
          created_at: string
          filters: Json
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          filters?: Json
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          event_type: string
          id: string
          metadata: Json
          processed_at: string
          stripe_event_id: string
        }
        Insert: {
          event_type: string
          id?: string
          metadata?: Json
          processed_at?: string
          stripe_event_id: string
        }
        Update: {
          event_type?: string
          id?: string
          metadata?: Json
          processed_at?: string
          stripe_event_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          account_id: string
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          past_due_since: string | null
          plan_key: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          past_due_since?: string | null
          plan_key?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          past_due_since?: string | null
          plan_key?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_key_fkey"
            columns: ["plan_key"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["key"]
          },
        ]
      }
      teammate_notes: {
        Row: {
          account_id: string
          body: string
          created_at: string
          id: string
          relationship_id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          body: string
          created_at?: string
          id?: string
          relationship_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          body?: string
          created_at?: string
          id?: string
          relationship_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teammate_notes_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teammate_notes_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "teammate_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      teammate_relationships: {
        Row: {
          connection_id: string
          created_at: string
          id: string
          proposed_by_account_id: string | null
          regular_teammate_at: string | null
          status: Database["public"]["Enums"]["teammate_status"]
          status_changed_at: string
          updated_at: string
          user_a_affirmed: boolean
          user_a_id: string
          user_b_affirmed: boolean
          user_b_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string
          id?: string
          proposed_by_account_id?: string | null
          regular_teammate_at?: string | null
          status?: Database["public"]["Enums"]["teammate_status"]
          status_changed_at?: string
          updated_at?: string
          user_a_affirmed?: boolean
          user_a_id: string
          user_b_affirmed?: boolean
          user_b_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string
          id?: string
          proposed_by_account_id?: string | null
          regular_teammate_at?: string | null
          status?: Database["public"]["Enums"]["teammate_status"]
          status_changed_at?: string
          updated_at?: string
          user_a_affirmed?: boolean
          user_a_id?: string
          user_b_affirmed?: boolean
          user_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teammate_relationships_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teammate_relationships_proposed_by_account_id_fkey"
            columns: ["proposed_by_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teammate_relationships_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teammate_relationships_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_games: {
        Row: {
          account_id: string
          created_at: string
          game_id: string
          id: string
          is_active: boolean
          platform_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          game_id: string
          id?: string
          is_active?: boolean
          platform_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          game_id?: string
          id?: string
          is_active?: boolean
          platform_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_games_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_games_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_games_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          account_id: string
          interest_id: string
        }
        Insert: {
          account_id: string
          interest_id: string
        }
        Update: {
          account_id?: string
          interest_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_connection_request: {
        Args: { p_request_id: string }
        Returns: string
      }
      accept_group_invitation: {
        Args: { p_invitation_id: string }
        Returns: boolean
      }
      accept_play_invitation: {
        Args: { p_invitation_id: string; p_time_option_id?: string }
        Returns: string
      }
      account_has_legal_hold: {
        Args: { p_account_id: string }
        Returns: boolean
      }
      accounts_blocked: {
        Args: { a_id: string; b_id: string }
        Returns: boolean
      }
      active_group_member_count: {
        Args: { p_group_id: string }
        Returns: number
      }
      admin_can_access_case: { Args: { p_case_id: string }; Returns: boolean }
      admin_has_scope: { Args: { p_scope: string }; Returns: boolean }
      affirm_teammate_proposal: {
        Args: { p_relationship_id: string }
        Returns: boolean
      }
      apply_moderation_action: {
        Args: {
          p_action_type: Database["public"]["Enums"]["moderation_action_type"]
          p_case_id: string
          p_reason_code: string
          p_subject_account_id: string
        }
        Returns: string
      }
      approval_threshold_met: {
        Args: { p_invitation_id: string }
        Returns: boolean
      }
      assign_report_severity: {
        Args: {
          p_category: Database["public"]["Enums"]["report_category"]
          p_description: string
        }
        Returns: Database["public"]["Enums"]["moderation_severity"]
      }
      claim_moderation_case: { Args: { p_case_id: string }; Returns: undefined }
      complete_account_attestation: {
        Args: {
          p_account_id: string
          p_adult_attestation_version: string
          p_adult_attested_at: string
          p_community_standards_version: string
          p_ip_hash: string
          p_privacy_version: string
          p_terms_version: string
          p_user_agent_hash: string
        }
        Returns: undefined
      }
      confirm_account_deletion: {
        Args: { p_account_id: string }
        Returns: undefined
      }
      conversation_partner_account_id: {
        Args: { p_account_id: string; p_conversation_id: string }
        Returns: string
      }
      create_conversation_for_connection: {
        Args: { p_connection_id: string }
        Returns: string
      }
      create_conversation_for_group: {
        Args: { p_group_id: string }
        Returns: string
      }
      create_moderation_case_from_report: {
        Args: { p_report_id: string }
        Returns: string
      }
      create_private_group: {
        Args: {
          p_emblem_key?: string
          p_name: string
          p_shared_game_id?: string
          p_size_goal: number
        }
        Returns: string
      }
      current_account_id: { Args: never; Returns: string }
      end_teammate_relationship: {
        Args: { p_relationship_id: string }
        Returns: undefined
      }
      export_account_data: { Args: { p_account_id: string }; Returns: Json }
      has_completed_session_between: {
        Args: { p_account_a: string; p_account_b: string }
        Returns: boolean
      }
      hook_before_user_created: { Args: { event: Json }; Returns: Json }
      invite_to_group: {
        Args: { p_group_id: string; p_invitee_account_id: string }
        Returns: string
      }
      is_blocked_with_any_conversation_member: {
        Args: { p_account_id: string; p_conversation_id: string }
        Returns: boolean
      }
      is_conversation_member: {
        Args: { p_account_id: string; p_conversation_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { p_account_id: string; p_group_id: string }
        Returns: boolean
      }
      is_play_participant: {
        Args: { p_account_id: string; p_invitation_id: string }
        Returns: boolean
      }
      is_session_participant: {
        Args: { p_account_id: string; p_session_id: string }
        Returns: boolean
      }
      is_teammate_participant: {
        Args: { p_account_id: string; p_relationship_id: string }
        Returns: boolean
      }
      moderation_case_release_eligible: {
        Args: { p_case_id: string }
        Returns: boolean
      }
      process_deletion_stage: {
        Args: { p_batch_size?: number }
        Returns: number
      }
      promote_regular_teammate: {
        Args: { p_relationship_id: string }
        Returns: undefined
      }
      promote_teammate_if_mutual: {
        Args: { p_relationship_id: string }
        Returns: boolean
      }
      propose_teammate: {
        Args: { p_other_account_id: string }
        Returns: string
      }
      purge_expired_messages: {
        Args: { p_batch_size?: number }
        Returns: number
      }
      recompute_entitlements: {
        Args: { p_account_id: string }
        Returns: undefined
      }
      record_teammate_intent: {
        Args: { p_session_id: string }
        Returns: boolean
      }
      registration_cap_max: { Args: never; Returns: number }
      registration_cap_reached: { Args: never; Returns: boolean }
      registration_cap_utilization: { Args: never; Returns: Json }
      release_moderation_case: {
        Args: { p_case_id: string }
        Returns: undefined
      }
      request_account_deletion: {
        Args: { p_account_id: string; p_scheduled_purge_at: string }
        Returns: undefined
      }
      set_catalog_game_platforms: {
        Args: { p_game_id: string; p_platform_ids: string[] }
        Returns: undefined
      }
      submit_appeal: {
        Args: { p_action_id: string; p_body: string }
        Returns: string
      }
      transfer_private_group_ownership: {
        Args: { p_group_id: string }
        Returns: string
      }
      upsert_saved_search: {
        Args: { p_filters: Json; p_name: string }
        Returns: string
      }
      vote_group_invitation: {
        Args: { p_approved: boolean; p_invitation_id: string }
        Returns: boolean
      }
    }
    Enums: {
      account_status:
        | "onboarding"
        | "active"
        | "restricted"
        | "suspended"
        | "deletion_pending"
        | "deleted"
      appeal_status:
        | "submitted"
        | "under_review"
        | "upheld"
        | "modified"
        | "reversed"
      cohort_status:
        | "below_threshold"
        | "demand_collecting"
        | "qualified"
        | "active_discovery"
      communication_mode:
        | "same_lobby_text"
        | "in_game_text"
        | "voice_chat"
        | "discord"
      connection_request_status:
        | "pending"
        | "accepted"
        | "declined"
        | "expired"
        | "cancelled"
      connection_status: "connected" | "archived" | "ended"
      consent_event_type:
        | "adult_attestation"
        | "terms_accepted"
        | "privacy_accepted"
        | "community_standards_accepted"
        | "policy_updated"
      conversation_kind: "direct" | "group"
      conversation_permission:
        | "open"
        | "archived"
        | "restricted"
        | "blocked"
        | "closed"
      deletion_job_stage:
        | "anonymize_profile"
        | "revoke_sessions"
        | "purge_messages"
        | "finalize_account"
      deletion_job_status: "pending" | "running" | "completed" | "failed"
      deletion_request_status:
        | "requested"
        | "confirmed"
        | "processing"
        | "completed"
      gaming_session_status:
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
      group_invitation_status:
        | "pending"
        | "accepted"
        | "declined"
        | "expired"
        | "cancelled"
      group_member_role: "owner" | "admin" | "member"
      group_membership_status:
        | "pending_approval"
        | "active"
        | "left"
        | "removed"
      intent_goal:
        | "gaming_friendship"
        | "specific_game_duo"
        | "teammates"
        | "casual_sessions"
        | "cross_platform_play"
      intent_status: "active" | "paused" | "expired"
      job_run_status: "running" | "completed" | "failed"
      moderation_action_type:
        | "warn"
        | "restrict_messaging"
        | "restrict_discovery"
        | "suspend"
        | "close_no_action"
      moderation_case_status:
        | "open"
        | "investigating"
        | "action_taken"
        | "appealed"
        | "closed"
      moderation_evidence_kind:
        | "report_description"
        | "message_excerpt"
        | "metadata"
      moderation_severity: "p0" | "p1" | "p2" | "p3"
      notification_kind:
        | "new_message"
        | "connection_request"
        | "connection_accepted"
        | "play_invitation"
        | "play_reminder"
        | "teammate_proposal"
        | "moderation_outcome"
      onboarding_step:
        | "identity"
        | "games"
        | "communication"
        | "goal"
        | "availability"
        | "preview"
      open_seat_kind: "temporary" | "permanent"
      open_seat_status: "open" | "filled" | "cancelled"
      play_invitation_status:
        | "proposed"
        | "accepted"
        | "declined"
        | "expired"
        | "cancelled"
        | "countered"
      play_scheduling_mode: "play_now" | "scheduled"
      post_play_continuation:
        | "keep_chatting"
        | "play_again"
        | "add_teammate"
        | "not_now"
        | "add_to_group"
      post_play_occurred: "yes" | "no" | "skip"
      private_group_status: "forming" | "active" | "closed"
      report_category:
        | "harassment"
        | "spam"
        | "inappropriate_content"
        | "scam"
        | "other"
      report_status:
        | "received"
        | "triaged"
        | "case_opened"
        | "closed"
        | "dismissed"
      subscription_status:
        | "none"
        | "active"
        | "past_due"
        | "cancel_at_period_end"
        | "canceled"
      subscription_tier: "free" | "plus"
      teammate_status: "proposed" | "teammate" | "regular_teammate" | "ended"
      visibility_level: "public" | "match_only" | "connection_only" | "private"
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
      account_status: [
        "onboarding",
        "active",
        "restricted",
        "suspended",
        "deletion_pending",
        "deleted",
      ],
      appeal_status: [
        "submitted",
        "under_review",
        "upheld",
        "modified",
        "reversed",
      ],
      cohort_status: [
        "below_threshold",
        "demand_collecting",
        "qualified",
        "active_discovery",
      ],
      communication_mode: [
        "same_lobby_text",
        "in_game_text",
        "voice_chat",
        "discord",
      ],
      connection_request_status: [
        "pending",
        "accepted",
        "declined",
        "expired",
        "cancelled",
      ],
      connection_status: ["connected", "archived", "ended"],
      consent_event_type: [
        "adult_attestation",
        "terms_accepted",
        "privacy_accepted",
        "community_standards_accepted",
        "policy_updated",
      ],
      conversation_kind: ["direct", "group"],
      conversation_permission: [
        "open",
        "archived",
        "restricted",
        "blocked",
        "closed",
      ],
      deletion_job_stage: [
        "anonymize_profile",
        "revoke_sessions",
        "purge_messages",
        "finalize_account",
      ],
      deletion_job_status: ["pending", "running", "completed", "failed"],
      deletion_request_status: [
        "requested",
        "confirmed",
        "processing",
        "completed",
      ],
      gaming_session_status: [
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
      ],
      group_invitation_status: [
        "pending",
        "accepted",
        "declined",
        "expired",
        "cancelled",
      ],
      group_member_role: ["owner", "admin", "member"],
      group_membership_status: [
        "pending_approval",
        "active",
        "left",
        "removed",
      ],
      intent_goal: [
        "gaming_friendship",
        "specific_game_duo",
        "teammates",
        "casual_sessions",
        "cross_platform_play",
      ],
      intent_status: ["active", "paused", "expired"],
      job_run_status: ["running", "completed", "failed"],
      moderation_action_type: [
        "warn",
        "restrict_messaging",
        "restrict_discovery",
        "suspend",
        "close_no_action",
      ],
      moderation_case_status: [
        "open",
        "investigating",
        "action_taken",
        "appealed",
        "closed",
      ],
      moderation_evidence_kind: [
        "report_description",
        "message_excerpt",
        "metadata",
      ],
      moderation_severity: ["p0", "p1", "p2", "p3"],
      notification_kind: [
        "new_message",
        "connection_request",
        "connection_accepted",
        "play_invitation",
        "play_reminder",
        "teammate_proposal",
        "moderation_outcome",
      ],
      onboarding_step: [
        "identity",
        "games",
        "communication",
        "goal",
        "availability",
        "preview",
      ],
      open_seat_kind: ["temporary", "permanent"],
      open_seat_status: ["open", "filled", "cancelled"],
      play_invitation_status: [
        "proposed",
        "accepted",
        "declined",
        "expired",
        "cancelled",
        "countered",
      ],
      play_scheduling_mode: ["play_now", "scheduled"],
      post_play_continuation: [
        "keep_chatting",
        "play_again",
        "add_teammate",
        "not_now",
        "add_to_group",
      ],
      post_play_occurred: ["yes", "no", "skip"],
      private_group_status: ["forming", "active", "closed"],
      report_category: [
        "harassment",
        "spam",
        "inappropriate_content",
        "scam",
        "other",
      ],
      report_status: [
        "received",
        "triaged",
        "case_opened",
        "closed",
        "dismissed",
      ],
      subscription_status: [
        "none",
        "active",
        "past_due",
        "cancel_at_period_end",
        "canceled",
      ],
      subscription_tier: ["free", "plus"],
      teammate_status: ["proposed", "teammate", "regular_teammate", "ended"],
      visibility_level: ["public", "match_only", "connection_only", "private"],
    },
  },
} as const
