export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Relationships = []

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string; username: string | null; full_name: string | null; avatar_url: string | null
          current_streak: number; longest_streak: number; total_xp: number; level: number
          last_activity_date: string | null; daily_goal_minutes: number; created_at: string; updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
        Relationships: Relationships
      }
      subjects: {
        Row: { id: string; code: string; title: string; description: string | null; icon: string | null; color: string | null; order_index: number; total_topics: number; created_at: string }
        Insert: Omit<Database['public']['Tables']['subjects']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['subjects']['Row']>
        Relationships: Relationships
      }
      phases: {
        Row: { id: string; subject_id: string; code: string; title: string; order_index: number; created_at: string }
        Insert: Omit<Database['public']['Tables']['phases']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['phases']['Row']>
        Relationships: Relationships
      }
      topic_groups: {
        Row: { id: string; phase_id: string; subject_id: string; code: string; title: string; order_index: number; created_at: string }
        Insert: Omit<Database['public']['Tables']['topic_groups']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['topic_groups']['Row']>
        Relationships: Relationships
      }
      topics: {
        Row: { id: string; topic_group_id: string; subject_id: string; title: string; description: string | null; order_index: number; xp_reward: number; created_at: string }
        Insert: Omit<Database['public']['Tables']['topics']['Row'], 'id' | 'created_at' | 'description'> & { description?: string | null }
        Update: Partial<Database['public']['Tables']['topics']['Row']>
        Relationships: Relationships
      }
      user_progress: {
        Row: { id: string; user_id: string; topic_id: string; status: 'not_started' | 'in_progress' | 'completed' | 'reviewing'; completed_at: string | null; notes: string | null; created_at: string; updated_at: string }
        Insert: Omit<Database['public']['Tables']['user_progress']['Row'], 'id' | 'created_at' | 'updated_at' | 'notes'> & { notes?: string | null }
        Update: Partial<Database['public']['Tables']['user_progress']['Row']>
        Relationships: Relationships
      }
      daily_sessions: {
        Row: { id: string; user_id: string; session_date: string; topics_completed: number; xp_earned: number; duration_minutes: number; created_at: string; updated_at: string }
        Insert: Omit<Database['public']['Tables']['daily_sessions']['Row'], 'id' | 'created_at' | 'updated_at' | 'duration_minutes'> & { duration_minutes?: number }
        Update: Partial<Database['public']['Tables']['daily_sessions']['Row']>
        Relationships: Relationships
      }
      achievements: {
        Row: { id: string; code: string; title: string; description: string | null; icon: string | null; xp_reward: number; condition_type: string | null; condition_value: number | null; created_at: string }
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['achievements']['Row']>
        Relationships: Relationships
      }
      user_achievements: {
        Row: { id: string; user_id: string; achievement_id: string; earned_at: string }
        Insert: Omit<Database['public']['Tables']['user_achievements']['Row'], 'id' | 'earned_at'>
        Update: Partial<Database['public']['Tables']['user_achievements']['Row']>
        Relationships: Relationships
      }
      problem_log: {
        Row: { id: string; user_id: string; title: string; platform: string | null; difficulty: 'easy' | 'medium' | 'hard' | null; pattern: string | null; subject_id: string | null; topic_group_id: string | null; status: 'solved' | 'attempted' | 'revisit'; time_taken_minutes: number | null; notes: string | null; url: string | null; solved_at: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['problem_log']['Row'], 'id' | 'created_at' | 'subject_id' | 'topic_group_id'> & { subject_id?: string | null; topic_group_id?: string | null }
        Update: Partial<Database['public']['Tables']['problem_log']['Row']>
        Relationships: Relationships
      }
    }
    Views: Record<string, never>
    Functions: {
      award_xp: {
        Args: { p_user_id: string; p_xp: number }
        Returns: null
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subject = Database['public']['Tables']['subjects']['Row']
export type Phase = Database['public']['Tables']['phases']['Row']
export type TopicGroup = Database['public']['Tables']['topic_groups']['Row']
export type Topic = Database['public']['Tables']['topics']['Row']
export type UserProgress = Database['public']['Tables']['user_progress']['Row']
export type DailySession = Database['public']['Tables']['daily_sessions']['Row']
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type ProblemLog = Database['public']['Tables']['problem_log']['Row']
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'reviewing'

export interface SubjectWithProgress extends Subject { completedTopics: number; totalTopics: number; progress: number }
export interface TopicGroupWithProgress extends TopicGroup { topics: TopicWithProgress[]; completedCount: number }
export interface TopicWithProgress extends Topic { userProgress?: UserProgress }
