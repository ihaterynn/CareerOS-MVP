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
      application_reviews: {
        Row: {
          candidate: string
          employer_id: string
          feedback_trace: string[] | null
          id: string
          reason_required: string | null
          role: string
          score: number | null
          status: Database["public"]["Enums"]["review_status"]
        }
        Insert: {
          candidate: string
          employer_id: string
          feedback_trace?: string[] | null
          id?: string
          reason_required?: string | null
          role: string
          score?: number | null
          status?: Database["public"]["Enums"]["review_status"]
        }
        Update: {
          candidate?: string
          employer_id?: string
          feedback_trace?: string[] | null
          id?: string
          reason_required?: string | null
          role?: string
          score?: number | null
          status?: Database["public"]["Enums"]["review_status"]
        }
        Relationships: [
          {
            foreignKeyName: "application_reviews_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      attrition_clusters: {
        Row: {
          employer_id: string
          evidence: string[] | null
          id: string
          label: string
          risk: number | null
          root_cause: string | null
          share: string | null
        }
        Insert: {
          employer_id: string
          evidence?: string[] | null
          id?: string
          label: string
          risk?: number | null
          root_cause?: string | null
          share?: string | null
        }
        Update: {
          employer_id?: string
          evidence?: string[] | null
          id?: string
          label?: string
          risk?: number | null
          root_cause?: string | null
          share?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attrition_clusters_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_applications: {
        Row: {
          candidate_id: string
          id: string
          job_id: string
          next_step: string | null
          quick_apply_step: number
          resume_version: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string | null
        }
        Insert: {
          candidate_id: string
          id?: string
          job_id: string
          next_step?: string | null
          quick_apply_step?: number
          resume_version?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
        }
        Update: {
          candidate_id?: string
          id?: string
          job_id?: string
          next_step?: string | null
          quick_apply_step?: number
          resume_version?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_certifications: {
        Row: {
          candidate_id: string
          id: string
          issuer: string
          name: string
          year: string
        }
        Insert: {
          candidate_id: string
          id?: string
          issuer: string
          name: string
          year: string
        }
        Update: {
          candidate_id?: string
          id?: string
          issuer?: string
          name?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_certifications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_dna_signals: {
        Row: {
          candidate_id: string
          id: string
          signal: string
        }
        Insert: {
          candidate_id: string
          id?: string
          signal: string
        }
        Update: {
          candidate_id?: string
          id?: string
          signal?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_dna_signals_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_education: {
        Row: {
          candidate_id: string
          credential: string
          id: string
          school: string
          year: string
        }
        Insert: {
          candidate_id: string
          credential: string
          id?: string
          school: string
          year: string
        }
        Update: {
          candidate_id?: string
          credential?: string
          id?: string
          school?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_education_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_experience: {
        Row: {
          candidate_id: string
          company: string
          id: string
          impact: string[] | null
          period: string
          role: string
          sort_order: number
        }
        Insert: {
          candidate_id: string
          company: string
          id?: string
          impact?: string[] | null
          period: string
          role: string
          sort_order?: number
        }
        Update: {
          candidate_id?: string
          company?: string
          id?: string
          impact?: string[] | null
          period?: string
          role?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "candidate_experience_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_learning_signals: {
        Row: {
          candidate_id: string
          id: string
          signal: string
        }
        Insert: {
          candidate_id: string
          id?: string
          signal: string
        }
        Update: {
          candidate_id?: string
          id?: string
          signal?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_learning_signals_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_onboarding_sessions: {
        Row: {
          candidate_id: string
          completed_at: string | null
          coverage: Json
          id: string
          skipped_at: string | null
          source_kind:
            | Database["public"]["Enums"]["onboarding_source_kind"]
            | null
          started_at: string
          state: Json
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          completed_at?: string | null
          coverage?: Json
          id?: string
          skipped_at?: string | null
          source_kind?:
            | Database["public"]["Enums"]["onboarding_source_kind"]
            | null
          started_at?: string
          state?: Json
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          completed_at?: string | null
          coverage?: Json
          id?: string
          skipped_at?: string | null
          source_kind?:
            | Database["public"]["Enums"]["onboarding_source_kind"]
            | null
          started_at?: string
          state?: Json
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_onboarding_sessions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_portfolio: {
        Row: {
          candidate_id: string
          description: string
          id: string
          sort_order: number
        }
        Insert: {
          candidate_id: string
          description: string
          id?: string
          sort_order?: number
        }
        Update: {
          candidate_id?: string
          description?: string
          id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "candidate_portfolio_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_profile_facts: {
        Row: {
          candidate_id: string
          confidence: number
          created_at: string
          dimension: Database["public"]["Enums"]["fact_dimension"]
          edited: boolean
          evidence: string | null
          id: string
          key: string
          label: string
          source: Database["public"]["Enums"]["fact_source"]
          superseded_by: string | null
          unit: string | null
          value: Json
        }
        Insert: {
          candidate_id: string
          confidence?: number
          created_at?: string
          dimension: Database["public"]["Enums"]["fact_dimension"]
          edited?: boolean
          evidence?: string | null
          id?: string
          key: string
          label: string
          source: Database["public"]["Enums"]["fact_source"]
          superseded_by?: string | null
          unit?: string | null
          value: Json
        }
        Update: {
          candidate_id?: string
          confidence?: number
          created_at?: string
          dimension?: Database["public"]["Enums"]["fact_dimension"]
          edited?: boolean
          evidence?: string | null
          id?: string
          key?: string
          label?: string
          source?: Database["public"]["Enums"]["fact_source"]
          superseded_by?: string | null
          unit?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "candidate_profile_facts_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_profile_facts_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "candidate_profile_facts"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_profiles: {
        Row: {
          career_interests: string[] | null
          commute_preference_minutes: number | null
          created_at: string
          current_role_title: string
          email: string | null
          id: string
          latitude: number | null
          location: string
          longitude: number | null
          name: string
          phone: string | null
          photo_url: string | null
          relocation_flexibility: string | null
          salary_expectation: string | null
          summary: string | null
          updated_at: string
          user_id: string
          work_preferences: string[] | null
        }
        Insert: {
          career_interests?: string[] | null
          commute_preference_minutes?: number | null
          created_at?: string
          current_role_title: string
          email?: string | null
          id?: string
          latitude?: number | null
          location: string
          longitude?: number | null
          name: string
          phone?: string | null
          photo_url?: string | null
          relocation_flexibility?: string | null
          salary_expectation?: string | null
          summary?: string | null
          updated_at?: string
          user_id: string
          work_preferences?: string[] | null
        }
        Update: {
          career_interests?: string[] | null
          commute_preference_minutes?: number | null
          created_at?: string
          current_role_title?: string
          email?: string | null
          id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          relocation_flexibility?: string | null
          salary_expectation?: string | null
          summary?: string | null
          updated_at?: string
          user_id?: string
          work_preferences?: string[] | null
        }
        Relationships: []
      }
      career_path_routes: {
        Row: {
          bridge_skills: string[] | null
          candidate_id: string
          current_expected_pay: string | null
          horizon: string | null
          id: string
          market_signal: string | null
          next_milestones: string[] | null
          pay_evidence: string[] | null
          projects: string[] | null
          readiness: number | null
          required_signals: string[] | null
          salary_range: string | null
          source_signals: string[] | null
          title: string
          track: Database["public"]["Enums"]["career_track"]
          unlocked_pay_range: string | null
          why_realistic: string[] | null
        }
        Insert: {
          bridge_skills?: string[] | null
          candidate_id: string
          current_expected_pay?: string | null
          horizon?: string | null
          id?: string
          market_signal?: string | null
          next_milestones?: string[] | null
          pay_evidence?: string[] | null
          projects?: string[] | null
          readiness?: number | null
          required_signals?: string[] | null
          salary_range?: string | null
          source_signals?: string[] | null
          title: string
          track: Database["public"]["Enums"]["career_track"]
          unlocked_pay_range?: string | null
          why_realistic?: string[] | null
        }
        Update: {
          bridge_skills?: string[] | null
          candidate_id?: string
          current_expected_pay?: string | null
          horizon?: string | null
          id?: string
          market_signal?: string | null
          next_milestones?: string[] | null
          pay_evidence?: string[] | null
          projects?: string[] | null
          readiness?: number | null
          required_signals?: string[] | null
          salary_range?: string | null
          source_signals?: string[] | null
          title?: string
          track?: Database["public"]["Enums"]["career_track"]
          unlocked_pay_range?: string | null
          why_realistic?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "career_path_routes_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      career_root_branches: {
        Row: {
          employer_id: string
          field: string
          fit_reason: string | null
          id: string
          threshold_relaxed: string | null
        }
        Insert: {
          employer_id: string
          field: string
          fit_reason?: string | null
          id?: string
          threshold_relaxed?: string | null
        }
        Update: {
          employer_id?: string
          field?: string
          fit_reason?: string | null
          id?: string
          threshold_relaxed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_root_branches_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      career_route_courses: {
        Row: {
          duration: string | null
          id: string
          partner: string | null
          provider: string
          route_id: string
          target_skill: string | null
          title: string
          url: string | null
        }
        Insert: {
          duration?: string | null
          id?: string
          partner?: string | null
          provider?: string
          route_id: string
          target_skill?: string | null
          title: string
          url?: string | null
        }
        Update: {
          duration?: string | null
          id?: string
          partner?: string | null
          provider?: string
          route_id?: string
          target_skill?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "career_route_courses_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "career_path_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          author: Database["public"]["Enums"]["chat_author"]
          candidate_id: string
          created_at: string
          id: string
          session: string
          text: string
        }
        Insert: {
          author: Database["public"]["Enums"]["chat_author"]
          candidate_id: string
          created_at?: string
          id?: string
          session: string
          text: string
        }
        Update: {
          author?: Database["public"]["Enums"]["chat_author"]
          candidate_id?: string
          created_at?: string
          id?: string
          session?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_job_mappings: {
        Row: {
          course_id: string
          job_id: string
        }
        Insert: {
          course_id: string
          job_id: string
        }
        Update: {
          course_id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_job_mappings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_job_mappings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      course_recommendations: {
        Row: {
          duration: string | null
          id: string
          partner: string | null
          provider: string
          reason: string | null
          target_skill: string | null
          title: string
          url: string | null
        }
        Insert: {
          duration?: string | null
          id?: string
          partner?: string | null
          provider?: string
          reason?: string | null
          target_skill?: string | null
          title: string
          url?: string | null
        }
        Update: {
          duration?: string | null
          id?: string
          partner?: string | null
          provider?: string
          reason?: string | null
          target_skill?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      cv_ingestion_records: {
        Row: {
          confidence: number | null
          created_at: string
          employer_id: string
          id: string
          location: string | null
          name: string
          role: string | null
          skills: string[] | null
          source: string | null
          status: Database["public"]["Enums"]["cv_status"] | null
          years: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          employer_id: string
          id?: string
          location?: string | null
          name: string
          role?: string | null
          skills?: string[] | null
          source?: string | null
          status?: Database["public"]["Enums"]["cv_status"] | null
          years?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          employer_id?: string
          id?: string
          location?: string | null
          name?: string
          role?: string | null
          skills?: string[] | null
          source?: string | null
          status?: Database["public"]["Enums"]["cv_status"] | null
          years?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_ingestion_records_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_metrics: {
        Row: {
          detail: string | null
          employer_id: string
          id: string
          label: string
          value: string
        }
        Insert: {
          detail?: string | null
          employer_id: string
          id?: string
          label: string
          value: string
        }
        Update: {
          detail?: string | null
          employer_id?: string
          id?: string
          label?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_metrics_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      employers: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      interview_kit_categories: {
        Row: {
          basis: string | null
          category_id: Database["public"]["Enums"]["interview_category_id"]
          id: string
          kit_id: string
          label: string
        }
        Insert: {
          basis?: string | null
          category_id: Database["public"]["Enums"]["interview_category_id"]
          id?: string
          kit_id: string
          label: string
        }
        Update: {
          basis?: string | null
          category_id?: Database["public"]["Enums"]["interview_category_id"]
          id?: string
          kit_id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_kit_categories_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "interview_kits"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_kits: {
        Row: {
          created_at: string
          headline: string | null
          id: string
          role_title: string
          talent_match_id: string
        }
        Insert: {
          created_at?: string
          headline?: string | null
          id?: string
          role_title: string
          talent_match_id: string
        }
        Update: {
          created_at?: string
          headline?: string | null
          id?: string
          role_title?: string
          talent_match_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_kits_talent_match_id_fkey"
            columns: ["talent_match_id"]
            isOneToOne: false
            referencedRelation: "talent_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          category_id: string
          id: string
          look_for: string | null
          probes: string | null
          prompt: string
          sort_order: number
        }
        Insert: {
          category_id: string
          id?: string
          look_for?: string | null
          probes?: string | null
          prompt: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          id?: string
          look_for?: string | null
          probes?: string | null
          prompt?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "interview_kit_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          commute_minutes: number | null
          company: string
          created_at: string
          employer_id: string
          explanation: string[] | null
          id: string
          is_active: boolean
          latitude: number | null
          location: string
          longitude: number | null
          match_geo: number | null
          match_overall: number | null
          match_preference: number | null
          match_salary: number | null
          match_skills: number | null
          missing_skills: string[] | null
          mode: Database["public"]["Enums"]["job_mode"]
          requirements: string[] | null
          salary: string | null
          title: string
        }
        Insert: {
          commute_minutes?: number | null
          company: string
          created_at?: string
          employer_id: string
          explanation?: string[] | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          location: string
          longitude?: number | null
          match_geo?: number | null
          match_overall?: number | null
          match_preference?: number | null
          match_salary?: number | null
          match_skills?: number | null
          missing_skills?: string[] | null
          mode: Database["public"]["Enums"]["job_mode"]
          requirements?: string[] | null
          salary?: string | null
          title: string
        }
        Update: {
          commute_minutes?: number | null
          company?: string
          created_at?: string
          employer_id?: string
          explanation?: string[] | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          location?: string
          longitude?: number | null
          match_geo?: number | null
          match_overall?: number | null
          match_preference?: number | null
          match_salary?: number | null
          match_skills?: number | null
          missing_skills?: string[] | null
          mode?: Database["public"]["Enums"]["job_mode"]
          requirements?: string[] | null
          salary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_rate_limits: {
        Row: {
          candidate_id: string
          request_count: number
          route: string
          window_start: string
        }
        Insert: {
          candidate_id: string
          request_count?: number
          route: string
          window_start: string
        }
        Update: {
          candidate_id?: string
          request_count?: number
          route?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "llm_rate_limits_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_modules: {
        Row: {
          description: string | null
          href: string
          icon: string | null
          id: string
          label: string
          portal: Database["public"]["Enums"]["portal"]
          sort_order: number
        }
        Insert: {
          description?: string | null
          href: string
          icon?: string | null
          id: string
          label: string
          portal: Database["public"]["Enums"]["portal"]
          sort_order?: number
        }
        Update: {
          description?: string | null
          href?: string
          icon?: string | null
          id?: string
          label?: string
          portal?: Database["public"]["Enums"]["portal"]
          sort_order?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_phases: {
        Row: {
          goal: string | null
          id: string
          name: string
          sort_order: number
          time_window: string | null
          workflow_id: string
        }
        Insert: {
          goal?: string | null
          id?: string
          name: string
          sort_order?: number
          time_window?: string | null
          workflow_id: string
        }
        Update: {
          goal?: string | null
          id?: string
          name?: string
          sort_order?: number
          time_window?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_phases_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "onboarding_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_predictions: {
        Row: {
          drivers: string[] | null
          employer_id: string
          hire: string
          id: string
          next_milestone: string | null
          role: string
          success_probability: number | null
          time_to_impact: string | null
          turnover_risk: number | null
        }
        Insert: {
          drivers?: string[] | null
          employer_id: string
          hire: string
          id?: string
          next_milestone?: string | null
          role: string
          success_probability?: number | null
          time_to_impact?: string | null
          turnover_risk?: number | null
        }
        Update: {
          drivers?: string[] | null
          employer_id?: string
          hire?: string
          id?: string
          next_milestone?: string | null
          role?: string
          success_probability?: number | null
          time_to_impact?: string | null
          turnover_risk?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_predictions_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tasks: {
        Row: {
          due: string | null
          id: string
          owner: string | null
          phase_id: string
          status: Database["public"]["Enums"]["onboarding_task_status"]
          title: string
          type: Database["public"]["Enums"]["onboarding_task_type"]
        }
        Insert: {
          due?: string | null
          id?: string
          owner?: string | null
          phase_id: string
          status?: Database["public"]["Enums"]["onboarding_task_status"]
          title: string
          type: Database["public"]["Enums"]["onboarding_task_type"]
        }
        Update: {
          due?: string | null
          id?: string
          owner?: string | null
          phase_id?: string
          status?: Database["public"]["Enums"]["onboarding_task_status"]
          title?: string
          type?: Database["public"]["Enums"]["onboarding_task_type"]
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "onboarding_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_workflows: {
        Row: {
          automated_count: number | null
          buddy: string | null
          id: string
          manager: string | null
          prediction_id: string
          start_date: string | null
          total_count: number | null
        }
        Insert: {
          automated_count?: number | null
          buddy?: string | null
          id?: string
          manager?: string | null
          prediction_id: string
          start_date?: string | null
          total_count?: number | null
        }
        Update: {
          automated_count?: number | null
          buddy?: string | null
          id?: string
          manager?: string | null
          prediction_id?: string
          start_date?: string | null
          total_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_workflows_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "onboarding_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      registration_steps: {
        Row: {
          candidate_id: string
          id: string
          is_complete: boolean
          sort_order: number
          step_label: string
        }
        Insert: {
          candidate_id: string
          id?: string
          is_complete?: boolean
          sort_order?: number
          step_label: string
        }
        Update: {
          candidate_id?: string
          id?: string
          is_complete?: boolean
          sort_order?: number
          step_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_steps_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_versions: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          resume_text: string
          target_job_id: string | null
          target_role: string | null
          version_name: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          resume_text: string
          target_job_id?: string | null
          target_role?: string | null
          version_name: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          resume_text?: string
          target_job_id?: string | null
          target_role?: string | null
          version_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_versions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_factors: {
        Row: {
          contribution: number | null
          detail: string | null
          id: string
          label: string
          retention_signal_id: string
          weight: string | null
        }
        Insert: {
          contribution?: number | null
          detail?: string | null
          id?: string
          label: string
          retention_signal_id: string
          weight?: string | null
        }
        Update: {
          contribution?: number | null
          detail?: string | null
          id?: string
          label?: string
          retention_signal_id?: string
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retention_factors_retention_signal_id_fkey"
            columns: ["retention_signal_id"]
            isOneToOne: false
            referencedRelation: "retention_signals"
            referencedColumns: ["id"]
          },
        ]
      }
      retention_signals: {
        Row: {
          created_at: string
          employee: string
          employer_id: string
          id: string
          opt_out: boolean
          role: string
          score: number | null
          team: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee: string
          employer_id: string
          id?: string
          opt_out?: boolean
          role: string
          score?: number | null
          team?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee?: string
          employer_id?: string
          id?: string
          opt_out?: boolean
          role?: string
          score?: number | null
          team?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retention_signals_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      role_talent_board_applicants: {
        Row: {
          education_fit: number | null
          experience_fit: number | null
          highlights: string[] | null
          id: string
          interest_signal: number | null
          missing_signals: string[] | null
          mobility_intent: string | null
          role_board_id: string
          score: number | null
          skill_fit: number | null
          status: Database["public"]["Enums"]["review_status"]
          summary: string | null
          talent_match_id: string
        }
        Insert: {
          education_fit?: number | null
          experience_fit?: number | null
          highlights?: string[] | null
          id?: string
          interest_signal?: number | null
          missing_signals?: string[] | null
          mobility_intent?: string | null
          role_board_id: string
          score?: number | null
          skill_fit?: number | null
          status?: Database["public"]["Enums"]["review_status"]
          summary?: string | null
          talent_match_id: string
        }
        Update: {
          education_fit?: number | null
          experience_fit?: number | null
          highlights?: string[] | null
          id?: string
          interest_signal?: number | null
          missing_signals?: string[] | null
          mobility_intent?: string | null
          role_board_id?: string
          score?: number | null
          skill_fit?: number | null
          status?: Database["public"]["Enums"]["review_status"]
          summary?: string | null
          talent_match_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_talent_board_applicants_role_board_id_fkey"
            columns: ["role_board_id"]
            isOneToOne: false
            referencedRelation: "role_talent_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_talent_board_applicants_talent_match_id_fkey"
            columns: ["talent_match_id"]
            isOneToOne: false
            referencedRelation: "talent_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      role_talent_boards: {
        Row: {
          employer_id: string
          hiring_goal: string | null
          id: string
          location: string | null
          openings: number
          priority: Database["public"]["Enums"]["role_priority"]
          role_signals: string[] | null
          team: string | null
          title: string
        }
        Insert: {
          employer_id: string
          hiring_goal?: string | null
          id?: string
          location?: string | null
          openings?: number
          priority?: Database["public"]["Enums"]["role_priority"]
          role_signals?: string[] | null
          team?: string | null
          title: string
        }
        Update: {
          employer_id?: string
          hiring_goal?: string | null
          id?: string
          location?: string | null
          openings?: number
          priority?: Database["public"]["Enums"]["role_priority"]
          role_signals?: string[] | null
          team?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_talent_boards_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_heatmap_points: {
        Row: {
          demand: number | null
          id: string
          location: string
          salary_pressure: Database["public"]["Enums"]["salary_pressure"] | null
          skill: string
          supply: number | null
          x: number | null
          y: number | null
        }
        Insert: {
          demand?: number | null
          id?: string
          location: string
          salary_pressure?:
            | Database["public"]["Enums"]["salary_pressure"]
            | null
          skill: string
          supply?: number | null
          x?: number | null
          y?: number | null
        }
        Update: {
          demand?: number | null
          id?: string
          location?: string
          salary_pressure?:
            | Database["public"]["Enums"]["salary_pressure"]
            | null
          skill?: string
          supply?: number | null
          x?: number | null
          y?: number | null
        }
        Relationships: []
      }
      skill_signals: {
        Row: {
          candidate_id: string
          category: Database["public"]["Enums"]["skill_category"]
          evidence: string | null
          id: string
          level: number
          name: string
        }
        Insert: {
          candidate_id: string
          category: Database["public"]["Enums"]["skill_category"]
          evidence?: string | null
          id?: string
          level: number
          name: string
        }
        Update: {
          candidate_id?: string
          category?: Database["public"]["Enums"]["skill_category"]
          evidence?: string | null
          id?: string
          level?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_signals_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_matches: {
        Row: {
          avatar_url: string | null
          candidate_id: string
          career_interests: string[] | null
          certifications: string[] | null
          created_at: string
          current_track: string | null
          dna_signals: string[] | null
          education: string | null
          education_fit: number | null
          experience: string[] | null
          experience_fit: number | null
          highlights: string[] | null
          id: string
          interest_signal: number | null
          learning_signals: string[] | null
          location: string | null
          missing_signals: string[] | null
          mobility_intent: string | null
          name: string
          portfolio: string[] | null
          score: number | null
          skill_fit: number | null
          skills: string[] | null
          source_field: string | null
          summary: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          candidate_id: string
          career_interests?: string[] | null
          certifications?: string[] | null
          created_at?: string
          current_track?: string | null
          dna_signals?: string[] | null
          education?: string | null
          education_fit?: number | null
          experience?: string[] | null
          experience_fit?: number | null
          highlights?: string[] | null
          id?: string
          interest_signal?: number | null
          learning_signals?: string[] | null
          location?: string | null
          missing_signals?: string[] | null
          mobility_intent?: string | null
          name: string
          portfolio?: string[] | null
          score?: number | null
          skill_fit?: number | null
          skills?: string[] | null
          source_field?: string | null
          summary?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          candidate_id?: string
          career_interests?: string[] | null
          certifications?: string[] | null
          created_at?: string
          current_track?: string | null
          dna_signals?: string[] | null
          education?: string | null
          education_fit?: number | null
          experience?: string[] | null
          experience_fit?: number | null
          highlights?: string[] | null
          id?: string
          interest_signal?: number | null
          learning_signals?: string[] | null
          location?: string | null
          missing_signals?: string[] | null
          mobility_intent?: string | null
          name?: string
          portfolio?: string[] | null
          score?: number | null
          skill_fit?: number | null
          skills?: string[] | null
          source_field?: string | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_matches_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["portal"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["portal"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["portal"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_candidate_onboarding: { Args: never; Returns: undefined }
      consume_rate_limit: {
        Args: { p_limit: number; p_route: string; p_window_seconds: number }
        Returns: boolean
      }
      current_candidate_id: { Args: never; Returns: string }
      upsert_candidate_facts: {
        Args: { p_facts: Json }
        Returns: {
          candidate_id: string
          confidence: number
          created_at: string
          dimension: Database["public"]["Enums"]["fact_dimension"]
          edited: boolean
          evidence: string | null
          id: string
          key: string
          label: string
          source: Database["public"]["Enums"]["fact_source"]
          superseded_by: string | null
          unit: string | null
          value: Json
        }[]
        SetofOptions: {
          from: "*"
          to: "candidate_profile_facts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      aggregation_mode: "skillCluster" | "experienceBand" | "location" | "gap"
      application_status: "Draft" | "Review" | "Applied" | "Interview"
      candidate_module_id:
        | "dashboard"
        | "dna"
        | "jobs"
        | "career-path"
        | "jobby"
        | "applications"
      career_track: "Grow" | "Pivot" | "Specialize" | "Adjacent"
      chat_author: "assistant" | "candidate" | "bot" | "user"
      cv_status: "missing contact" | "duplicate fingerprint" | "parse failed"
      employer_module_id:
        | "dashboard"
        | "career-root"
        | "talent"
        | "ingestion"
        | "retention"
        | "onboarding"
        | "heatmap"
        | "attrition"
        | "review"
      fact_dimension:
        | "identity"
        | "experience"
        | "skills"
        | "preferences"
        | "dna"
      fact_source: "parsed" | "confirmed" | "inferred" | "self-reported"
      interview_category_id: "role" | "personality" | "culture"
      job_mode: "Hybrid" | "Remote-first" | "On-site"
      onboarding_source_kind: "resume" | "linkedin" | "paste" | "conversation"
      onboarding_task_status: "Done" | "In progress" | "Scheduled"
      onboarding_task_type: "Automated" | "Manual" | "Document"
      portal: "candidate" | "employer"
      review_status: "New" | "Shortlisted" | "Rejected"
      role_priority: "Urgent" | "Active" | "Pipeline"
      salary_pressure: "Low" | "Medium" | "High"
      skill_category: "Core" | "Adjacent" | "Emerging"
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
      aggregation_mode: ["skillCluster", "experienceBand", "location", "gap"],
      application_status: ["Draft", "Review", "Applied", "Interview"],
      candidate_module_id: [
        "dashboard",
        "dna",
        "jobs",
        "career-path",
        "jobby",
        "applications",
      ],
      career_track: ["Grow", "Pivot", "Specialize", "Adjacent"],
      chat_author: ["assistant", "candidate", "bot", "user"],
      cv_status: ["missing contact", "duplicate fingerprint", "parse failed"],
      employer_module_id: [
        "dashboard",
        "career-root",
        "talent",
        "ingestion",
        "retention",
        "onboarding",
        "heatmap",
        "attrition",
        "review",
      ],
      fact_dimension: [
        "identity",
        "experience",
        "skills",
        "preferences",
        "dna",
      ],
      fact_source: ["parsed", "confirmed", "inferred", "self-reported"],
      interview_category_id: ["role", "personality", "culture"],
      job_mode: ["Hybrid", "Remote-first", "On-site"],
      onboarding_source_kind: ["resume", "linkedin", "paste", "conversation"],
      onboarding_task_status: ["Done", "In progress", "Scheduled"],
      onboarding_task_type: ["Automated", "Manual", "Document"],
      portal: ["candidate", "employer"],
      review_status: ["New", "Shortlisted", "Rejected"],
      role_priority: ["Urgent", "Active", "Pipeline"],
      salary_pressure: ["Low", "Medium", "High"],
      skill_category: ["Core", "Adjacent", "Emerging"],
    },
  },
} as const

