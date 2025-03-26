import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LoginForm from '@/components/LoginForm';
import StudentCsvImport from '@/components/StudentCsvImport';
import { StudentHomeworkStatus } from '@/components/student-homework-status';

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setUser(session.user);
      }
    }
    checkSession();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) {
    return <LoginForm onLogin={(user) => setUser(user)} />;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">학생 및 숙제 관리</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
          로그아웃
        </button>
      </header>
      <section className="mb-8">
        <h2 className="text-xl mb-4">학생 데이터 가져오기 (CSV)</h2>
        <StudentCsvImport />
      </section>
      <section>
        <h2 className="text-xl mb-4">숙제 상태 관리</h2>
        <StudentHomeworkStatus studentId={user.id} status="all" />
      </section>
    </div>
  );
} 