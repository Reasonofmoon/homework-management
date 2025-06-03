-- 기존 정책이 있는지 확인 후 생성 (중복 오류 방지)
DO $$
BEGIN
    -- 선생님은 자신의 클래스 학생 배정을 볼 수 있습니다
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'student_assignments' 
        AND policyname = 'Teachers can view student assignments'
    ) THEN
        EXECUTE 'CREATE POLICY "Teachers can view student assignments"
          ON student_assignments FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM assignments a
              JOIN classes c ON a.class_id = c.id
              WHERE a.id = student_assignments.assignment_id
              AND c.teacher_id = auth.uid()
            )
          )';
    ELSE
        -- 기존 정책 최적화 (성능 개선)
        EXECUTE 'DROP POLICY "Teachers can view student assignments" ON student_assignments';
        EXECUTE 'CREATE POLICY "Teachers can view student assignments"
          ON student_assignments FOR SELECT
          USING (
            EXISTS (
              SELECT 1 FROM assignments a
              JOIN classes c ON a.class_id = c.id
              WHERE a.id = student_assignments.assignment_id
              AND c.teacher_id = (SELECT auth.uid())
            )
          )';
    END IF;

    -- 선생님은 학생에게 숙제를 배정할 수 있습니다
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'student_assignments' 
        AND policyname = 'Teachers can create student assignments'
    ) THEN
        EXECUTE 'CREATE POLICY "Teachers can create student assignments"
          ON student_assignments FOR INSERT
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM assignments a
              JOIN classes c ON a.class_id = c.id
              WHERE a.id = assignment_id
              AND c.teacher_id = auth.uid()
            )
          )';
    ELSE
        -- 기존 정책 최적화 (성능 개선)
        EXECUTE 'DROP POLICY "Teachers can create student assignments" ON student_assignments';
        EXECUTE 'CREATE POLICY "Teachers can create student assignments"
          ON student_assignments FOR INSERT
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM assignments a
              JOIN classes c ON a.class_id = c.id
              WHERE a.id = assignment_id
              AND c.teacher_id = (SELECT auth.uid())
            )
          )';
    END IF;
END $$;

-- 프로필 테이블 RLS 최적화
DO $$
BEGIN
    -- 사용자는 자신의 프로필을 볼 수 있습니다
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can view own profile'
    ) THEN
        EXECUTE 'DROP POLICY "Users can view own profile" ON profiles';
        EXECUTE 'CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING ((SELECT auth.uid()) = id)';
    END IF;

    -- 사용자는 자신의 프로필을 업데이트할 수 있습니다
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        EXECUTE 'DROP POLICY "Users can update own profile" ON profiles';
        EXECUTE 'CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING ((SELECT auth.uid()) = id)';
    END IF;
END $$;

-- 클래스 테이블 RLS 최적화
DO $$
BEGIN
    -- 선생님은 자신의 클래스를 볼 수 있습니다
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'classes' 
        AND policyname = 'Teachers can view own classes'
    ) THEN
        EXECUTE 'DROP POLICY "Teachers can view own classes" ON classes';
        EXECUTE 'CREATE POLICY "Teachers can view own classes" ON classes
            FOR SELECT USING ((SELECT auth.uid()) = teacher_id)';
    END IF;

    -- 선생님은 클래스를 생성할 수 있습니다
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'classes' 
        AND policyname = 'Teachers can create classes'
    ) THEN
        EXECUTE 'DROP POLICY "Teachers can create classes" ON classes';
        EXECUTE 'CREATE POLICY "Teachers can create classes" ON classes
            FOR INSERT WITH CHECK ((SELECT auth.uid()) = teacher_id)';
    END IF;
END $$;
