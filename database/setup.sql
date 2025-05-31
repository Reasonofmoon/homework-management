-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
  school_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  grade_level TEXT,
  subject TEXT,
  school_year TEXT DEFAULT EXTRACT(YEAR FROM NOW())::TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  student_number TEXT,
  email TEXT,
  phone TEXT,
  parent_contact TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  due_date DATE,
  assignment_type TEXT DEFAULT 'homework' CHECK (assignment_type IN ('homework', 'project', 'exam', 'quiz')),
  points_possible INTEGER DEFAULT 100,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_assignments table (junction table for assignment submissions)
CREATE TABLE IF NOT EXISTS public.student_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'graded', 'late')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  graded_at TIMESTAMP WITH TIME ZONE,
  points_earned INTEGER,
  feedback TEXT,
  submission_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, assignment_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON public.classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON public.students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON public.assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON public.assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_student_assignments_student_id ON public.student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_assignment_id ON public.student_assignments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_status ON public.student_assignments(status);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for classes
CREATE POLICY "Teachers can view own classes" ON public.classes
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own classes" ON public.classes
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own classes" ON public.classes
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own classes" ON public.classes
  FOR DELETE USING (auth.uid() = teacher_id);

-- Create RLS policies for students
CREATE POLICY "Teachers can view own students" ON public.students
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own students" ON public.students
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own students" ON public.students
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own students" ON public.students
  FOR DELETE USING (auth.uid() = teacher_id);

-- Create RLS policies for assignments
CREATE POLICY "Teachers can view own assignments" ON public.assignments
  FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own assignments" ON public.assignments
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own assignments" ON public.assignments
  FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own assignments" ON public.assignments
  FOR DELETE USING (auth.uid() = teacher_id);

-- Create RLS policies for student_assignments
CREATE POLICY "Teachers can view student assignments for their students" ON public.student_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_id AND s.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert student assignments for their students" ON public.student_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_id AND s.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update student assignments for their students" ON public.student_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_id AND s.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can delete student assignments for their students" ON public.student_assignments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_id AND s.teacher_id = auth.uid()
    )
  );

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.student_assignments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
