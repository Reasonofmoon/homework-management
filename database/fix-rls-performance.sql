-- RLS 정책 성능 최적화
-- auth.uid() 호출을 최적화하여 각 행마다 재평가되지 않도록 수정

-- 1. profiles 테이블 정책 수정
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING ((SELECT auth.uid()) = id);

-- 2. classes 테이블 정책 수정
DROP POLICY IF EXISTS "Teachers can view own classes" ON classes;
DROP POLICY IF EXISTS "Teachers can insert own classes" ON classes;
DROP POLICY IF EXISTS "Teachers can update own classes" ON classes;
DROP POLICY IF EXISTS "Teachers can delete own classes" ON classes;

CREATE POLICY "Teachers can view own classes" ON classes
    FOR SELECT USING ((SELECT auth.uid()) = teacher_id);

CREATE POLICY "Teachers can insert own classes" ON classes
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = teacher_id);

CREATE POLICY "Teachers can update own classes" ON classes
    FOR UPDATE USING ((SELECT auth.uid()) = teacher_id);

CREATE POLICY "Teachers can delete own classes" ON classes
    FOR DELETE USING ((SELECT auth.uid()) = teacher_id);

-- 3. students 테이블 정책 수정
DROP POLICY IF EXISTS "Teachers can view own students" ON students;
DROP POLICY IF EXISTS "Teachers can insert own students" ON students;
DROP POLICY IF EXISTS "Teachers can update own students" ON students;
DROP POLICY IF EXISTS "Teachers can delete own students" ON students;

CREATE POLICY "Teachers can view own students" ON students
    FOR SELECT USING ((SELECT auth.uid()) = teacher_id);

CREATE POLICY "Teachers can insert own students" ON students
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = teacher_id);

CREATE POLICY "Teachers can update own students" ON students
    FOR UPDATE USING ((SELECT auth.uid()) = teacher_id);

CREATE POLICY "Teachers can delete own students" ON students
    FOR DELETE USING ((SELECT auth.uid()) = teacher_id);

-- 4. assignments 테이블 정책 수정
DROP POLICY IF EXISTS "Teachers can view own assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can insert own assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can update own assignments" ON assignments;
DROP POLICY IF EXISTS "Teachers can delete own assignments" ON assignments;

CREATE POLICY "Teachers can view own assignments" ON assignments
    FOR SELECT USING ((SELECT auth.uid()) = teacher_id);

CREATE POLICY "Teachers can insert own assignments" ON assignments
    FOR INSERT WITH CHECK ((SELECT auth.uid()) = teacher_id);

CREATE POLICY "Teachers can update own assignments" ON assignments
    FOR UPDATE USING ((SELECT auth.uid()) = teacher_id);

CREATE POLICY "Teachers can delete own assignments" ON assignments
    FOR DELETE USING ((SELECT auth.uid()) = teacher_id);

-- 5. assignment_students 테이블 정책 수정
DROP POLICY IF EXISTS "Teachers can view assignment_students for their assignments" ON assignment_students;
DROP POLICY IF EXISTS "Teachers can insert assignment_students for their assignments" ON assignment_students;
DROP POLICY IF EXISTS "Teachers can update assignment_students for their assignments" ON assignment_students;
DROP POLICY IF EXISTS "Teachers can delete assignment_students for their assignments" ON assignment_students;

CREATE POLICY "Teachers can view assignment_students for their assignments" ON assignment_students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = assignment_students.assignment_id 
            AND assignments.teacher_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "Teachers can insert assignment_students for their assignments" ON assignment_students
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = assignment_students.assignment_id 
            AND assignments.teacher_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "Teachers can update assignment_students for their assignments" ON assignment_students
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = assignment_students.assignment_id 
            AND assignments.teacher_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "Teachers can delete assignment_students for their assignments" ON assignment_students
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM assignments 
            WHERE assignments.id = assignment_students.assignment_id 
            AND assignments.teacher_id = (SELECT auth.uid())
        )
    );
