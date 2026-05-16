// src/types/database.ts
// Tipos que espelham as tabelas do Supabase

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          study_area: string | null;
          created_at: string;
          updated_at: string;
          theme: 'light' | 'dark';
          weekly_goal_hours: number;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      subjects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          category: StudyCategory;
          description: string | null;
          target_hours: number;
          studied_hours: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subjects']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['subjects']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          title: string;
          description: string | null;
          due_date: string | null;
          priority: 'low' | 'medium' | 'high';
          status: 'pending' | 'in_progress' | 'done';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          title: string;
          target_value: number;
          current_value: number;
          unit: string;
          deadline: string | null;
          completed: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['goals']['Insert']>;
      };
      exams: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          title: string;
          exam_date: string;
          location: string | null;
          notes: string | null;
          priority: 'low' | 'medium' | 'high';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['exams']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['exams']['Insert']>;
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          duration_minutes: number;
          session_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['study_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['study_sessions']['Insert']>;
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          title: string;
          content: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['notes']['Insert']>;
      };
      uploads: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          file_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['uploads']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['uploads']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      study_category: StudyCategory;
    };
  };
}

export type StudyCategory =
  | 'escola'
  | 'ensino_medio'
  | 'faculdade'
  | 'vestibular'
  | 'enem'
  | 'cursos_online'
  | 'programacao'
  | 'idiomas'
  | 'concursos'
  | 'personalizado';

export const STUDY_CATEGORIES: Record<StudyCategory, string> = {
  escola:         'Escola',
  ensino_medio:   'Ensino Medio',
  faculdade:      'Faculdade',
  vestibular:     'Vestibular',
  enem:           'ENEM',
  cursos_online:  'Cursos Online',
  programacao:    'Programacao',
  idiomas:        'Idiomas',
  concursos:      'Concursos',
  personalizado:  'Personalizado',
};

// Tipos auxiliares
export type Profile  = Database['public']['Tables']['profiles']['Row'];
export type Subject  = Database['public']['Tables']['subjects']['Row'];
export type Task     = Database['public']['Tables']['tasks']['Row'];
export type Goal     = Database['public']['Tables']['goals']['Row'];
export type Exam     = Database['public']['Tables']['exams']['Row'];
export type Note     = Database['public']['Tables']['notes']['Row'];
export type Upload   = Database['public']['Tables']['uploads']['Row'];
export type Session  = Database['public']['Tables']['study_sessions']['Row'];
