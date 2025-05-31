-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('teacher', 'admin');
CREATE TYPE assignment_status AS ENUM ('todo', 'in-progress', 'completed');
CREATE TYPE student_status AS ENUM ('active', 'inactive');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE submission_status AS ENUM ('assigned', 'in-progress', 'completed', 'overdue');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'teacher',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, teacher_id)
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    status student_status DEFAULT 'active',
    completion_rate INTEGER DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 100),
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    priority priority_level DEFAULT 'medium',
    status assignment_status DEFAULT 'todo',
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignment_students junction table
CREATE TABLE IF NOT EXISTS assignment_students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    status submission_status DEFAULT 'assigned',
    submitted_at TIMESTAMP WITH TIME ZONE,
    grade INTEGER CHECK (grade >= 0 AND grade <= 100),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_teacher_id ON students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignment_students_assignment_id ON assignment_students(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_students_student_id ON assignment_students(student_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_students ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Classes policies
CREATE POLICY "Teachers can view own classes" ON classes
    FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own classes" ON classes
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own classes" ON classes
    FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own classes" ON classes
    FOR DELETE USING (auth.uid() = teacher_id);

-- Students policies
CREATE POLICY "Teachers can view own students" ON students
    FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own students" ON students
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own students" ON students
    FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own students" ON students
    FOR DELETE USING (auth.uid() = teacher_id);

-- Assignments policies
CREATE POLICY "Teachers can view own assignments" ON assignments
    FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert own assignments" ON assignments
    FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update own assignments" ON assignments
    FOR UPDATE USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete own assignments" ON assignments
    FOR DELETE USING (auth.uid() = teacher_id);

-- Assignment_students policies
CREATE POLICY "Teachers can view assignment_students for their assignments" ON assignment_students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = assignment_students.assignment_id 
            AND assignments.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can insert assignment_students for their assignments" ON assignment_students
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = assignment_students.assignment_id 
            AND assignments.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can update assignment_students for their assignments" ON assignment_students
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = assignment_students.assignment_id 
            AND assignments.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Teachers can delete assignment_students for their assignments" ON assignment_students
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = assignment_students.assignment_id 
            AND assignments.teacher_id = auth.uid()
        )
    );

-- Create functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
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
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_classes
    BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_students
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_assignments
    BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_assignment_students
    BEFORE UPDATE ON assignment_students
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Create function to calculate student completion rate
CREATE OR REPLACE FUNCTION public.calculate_student_completion_rate(student_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_assignments INTEGER;
    completed_assignments INTEGER;
    completion_rate INTEGER;
BEGIN
    -- Count total assignments for the student
    SELECT COUNT(*) INTO total_assignments
    FROM assignment_students
    WHERE student_id = student_uuid;
    
    -- Count completed assignments
    SELECT COUNT(*) INTO completed_assignments
    FROM assignment_students
    WHERE student_id = student_uuid AND status = 'completed';
    
    -- Calculate completion rate
    IF total_assignments = 0 THEN
        completion_rate := 0;
    ELSE
        completion_rate := ROUND((completed_assignments::DECIMAL / total_assignments::DECIMAL) * 100);
    END IF;
    
    -- Update student record
    UPDATE students 
    SET completion_rate = completion_rate
    WHERE id = student_uuid;
    
    RETURN completion_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update completion rate when assignment status changes
CREATE OR REPLACE FUNCTION public.update_student_completion_rate()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_student_completion_rate(NEW.student_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_completion_rate_on_assignment_change
    AFTER INSERT OR UPDATE OR DELETE ON assignment_students
    FOR EACH ROW EXECUTE FUNCTION update_student_completion_rate();
