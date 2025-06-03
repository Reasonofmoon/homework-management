-- 데이터베이스 설정 완료 확인 및 최종 검증

-- 1. 모든 테이블 존재 확인
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES 
        ('profiles'),
        ('classes'), 
        ('students'),
        ('assignments'),
        ('student_assignments'),
        ('submissions')
) AS required_tables(table_name)
ORDER BY table_name;

-- 2. RLS 정책 확인
SELECT 
    tablename,
    policyname,
    cmd,
    '✅ ACTIVE' as status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. 인덱스 확인
SELECT 
    schemaname,
    tablename,
    indexname,
    '✅ CREATED' as status
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 4. 외래 키 제약 조건 확인
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    '✅ ACTIVE' as status
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 5. 테스트 데이터 확인 (클래스가 생성되었는지)
SELECT 
    COUNT(*) as class_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ TEST DATA EXISTS'
        ELSE '⚠️ NO TEST DATA'
    END as status
FROM classes;

-- 6. 현재 사용자 프로필 확인
SELECT 
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ USER AUTHENTICATED'
        ELSE '❌ NOT AUTHENTICATED'
    END as auth_status,
    auth.uid() as user_id;
