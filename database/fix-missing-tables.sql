-- 누락된 테이블 확인 및 생성
-- assignment_students 테이블이 student_assignments로 변경되었는지 확인

-- 1. 기존 테이블 확인
DO $$
BEGIN
    -- assignment_students 테이블이 없고 student_assignments가 있는 경우
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assignment_students' AND table_schema = 'public')
       AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_assignments' AND table_schema = 'public') THEN
        
        -- assignment_students를 student_assignments의 별칭으로 생성 (뷰)
        CREATE OR REPLACE VIEW assignment_students AS 
        SELECT * FROM student_assignments;
        
        RAISE NOTICE 'Created assignment_students view pointing to student_assignments table';
        
    -- assignment_students 테이블이 완전히 없는 경우 생성
    ELSIF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assignment_students' AND table_schema = 'public') THEN
        
        CREATE TABLE assignment_students (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
            assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
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
        
        -- 인덱스 생성
        CREATE INDEX idx_assignment_students_student_id ON assignment_students(student_id);
        CREATE INDEX idx_assignment_students_assignment_id ON assignment_students(assignment_id);
        CREATE INDEX idx_assignment_students_status ON assignment_students(status);
        
        -- RLS 활성화
        ALTER TABLE assignment_students ENABLE ROW LEVEL SECURITY;
        
        -- RLS 정책 생성
        CREATE POLICY "Teachers can view assignment students" ON assignment_students
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM students s 
                    WHERE s.id = student_id AND s.teacher_id = (SELECT auth.uid())
                )
            );
        
        CREATE POLICY "Teachers can insert assignment students" ON assignment_students
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM students s 
                    WHERE s.id = student_id AND s.teacher_id = (SELECT auth.uid())
                )
            );
        
        CREATE POLICY "Teachers can update assignment students" ON assignment_students
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM students s 
                    WHERE s.id = student_id AND s.teacher_id = (SELECT auth.uid())
                )
            );
        
        CREATE POLICY "Teachers can delete assignment students" ON assignment_students
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM students s 
                    WHERE s.id = student_id AND s.teacher_id = (SELECT auth.uid())
                )
            );
        
        -- updated_at 트리거 생성
        CREATE TRIGGER handle_updated_at BEFORE UPDATE ON assignment_students
            FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
        
        RAISE NOTICE 'Created assignment_students table with RLS policies';
        
    ELSE
        RAISE NOTICE 'assignment_students table already exists';
    END IF;
END $$;

-- 2. 다른 누락될 수 있는 테이블들도 확인
DO $$
BEGIN
    -- profiles 테이블 확인
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        CREATE TABLE profiles (
            id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            avatar_url TEXT,
            role TEXT DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
            school_name TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING ((SELECT auth.uid()) = id);
        
        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING ((SELECT auth.uid()) = id);
        
        CREATE POLICY "Users can insert own profile" ON profiles
            FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);
        
        CREATE TRIGGER handle_updated_at BEFORE UPDATE ON profiles
            FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
        
        RAISE NOTICE 'Created profiles table';
    END IF;
    
    -- classes 테이블 확인
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'classes' AND table_schema = 'public') THEN
        CREATE TABLE classes (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
            grade_level TEXT,
            subject TEXT,
            school_year TEXT DEFAULT EXTRACT(YEAR FROM NOW())::TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
        
        ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Teachers can view own classes" ON classes
            FOR SELECT USING ((SELECT auth.uid()) = teacher_id);
        
        CREATE POLICY "Teachers can insert own classes" ON classes
            FOR INSERT WITH CHECK ((SELECT auth.uid()) = teacher_id);
        
        CREATE POLICY "Teachers can update own classes" ON classes
            FOR UPDATE USING ((SELECT auth.uid()) = teacher_id);
        
        CREATE POLICY "Teachers can delete own classes" ON classes
            FOR DELETE USING ((SELECT auth.uid()) = teacher_id);
        
        CREATE TRIGGER handle_updated_at BEFORE UPDATE ON classes
            FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
        
        RAISE NOTICE 'Created classes table';
    END IF;
    
    -- students 테이블 확인
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'students' AND table_schema = 'public') THEN
        CREATE TABLE students (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL,
            student_number TEXT,
            email TEXT,
            phone TEXT,
            parent_contact TEXT,
            class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
            teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
            is_active BOOLEAN DEFAULT true,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_students_class_id ON students(class_id);
        CREATE INDEX idx_students_teacher_id ON students(teacher_id);
        
        ALTER TABLE students ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Teachers can view own students" ON students
            FOR SELECT USING ((SELECT auth.uid()) = teacher_id);
        
        CREATE POLICY "Teachers can insert own students" ON students
            FOR INSERT WITH CHECK ((SELECT auth.uid()) = teacher_id);
        
        CREATE POLICY "Teachers can update own students" ON students
            FOR UPDATE USING ((SELECT auth.uid()) = teacher_id);
        
        CREATE POLICY "Teachers can delete own students" ON students
            FOR DELETE USING ((SELECT auth.uid()) = teacher_id);
        
        CREATE TRIGGER handle_updated_at BEFORE UPDATE ON students
            FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
        
        RAISE NOTICE 'Created students table';
    END IF;
    
    -- assignments 테이블 확인
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assignments' AND table_schema = 'public') THEN
        CREATE TABLE assignments (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
            teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
            due_date DATE,
            assignment_type TEXT DEFAULT 'homework' CHECK (assignment_type IN ('homework', 'project', 'exam', 'quiz')),
            points_possible INTEGER DEFAULT 100,
            is_published BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX idx_assignments_class_id ON assignments(class_id);
        CREATE INDEX idx_assignments_teacher_id ON assignments(teacher_id);
        CREATE INDEX idx_assignments_due_date ON assignments(due_date);
        
        ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Teachers can view own assignments" ON assignments
            FOR SELECT USING ((SELECT auth.uid()) = teacher_id);
        
        CREATE POLICY "Teachers can insert own assignments" ON assignments
            FOR INSERT WITH CHECK ((SELECT auth.uid()) = teacher_id);
        
        CREATE POLICY "Teachers can update own assignments" ON assignments
            FOR UPDATE USING ((SELECT auth.uid()) = teacher_id);
        
        CREATE POLICY "Teachers can delete own assignments" ON assignments
            FOR DELETE USING ((SELECT auth.uid()) = teacher_id);
        
        CREATE TRIGGER handle_updated_at BEFORE UPDATE ON assignments
            FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
        
        RAISE NOTICE 'Created assignments table';
    END IF;
END $$;

-- 3. 테이블 존재 여부 최종 확인
SELECT 
    'profiles' as table_name,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'classes' as table_name,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'classes' AND table_schema = 'public') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'students' as table_name,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'students' AND table_schema = 'public') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'assignments' as table_name,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assignments' AND table_schema = 'public') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'student_assignments' as table_name,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'student_assignments' AND table_schema = 'public') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'assignment_students' as table_name,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'assignment_students' AND table_schema = 'public') 
         THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;
