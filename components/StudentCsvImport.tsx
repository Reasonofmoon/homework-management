import React, { useState } from 'react';

// Allowed classes: minimum A반, B반, C반, and up to 30 total classes
const allowedClasses = [
  "A반", "B반", "C반", "D반", "E반", "F반", "G반", "H반", "I반", "J반",
  "K반", "L반", "M반", "N반", "O반", "P반", "Q반", "R반", "S반", "T반",
  "U반", "V반", "W반", "X반", "Y반", "Z반", "AA반", "AB반", "AC반", "AD반"
];

export default function StudentCsvImport() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!csvFile) {
      setMessage('파일을 선택해주세요.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        processCSV(text);
      } else {
        setMessage('파일을 읽는 도중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(csvFile);
  };

  const processCSV = (data: string) => {
    const lines = data.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2) {
      setMessage('CSV에 데이터가 충분하지 않습니다.');
      return;
    }
    // 첫 번째 줄은 헤더로 간주
    const header = lines[0].split(',').map(h => h.trim());
    const idIndex = header.findIndex(h => h.toLowerCase() === 'id');
    const nameIndex = header.findIndex(h => h.toLowerCase() === 'name');
    const classIndex = header.findIndex(h => h.toLowerCase() === 'class');

    if (idIndex === -1 || nameIndex === -1 || classIndex === -1) {
      setMessage("CSV 파일 헤더에 'id', 'name', 'class' 칼럼이 필요합니다.");
      return;
    }

    const students = lines.slice(1).map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        id: parts[idIndex],
        name: parts[nameIndex],
        class: parts[classIndex],
        completionRate: 0
      };
    });

    // 각 학생의 class가 allowedClasses 안에 있는지 확인
    for (const student of students) {
      if (!allowedClasses.includes(student.class)) {
        setMessage(`학생 ${student.name}의 반(${student.class})은 유효하지 않습니다. 허용된 반: ${allowedClasses.join(", ")}`);
        return;
      }
    }

    // CSV 파일에 등장하는 반의 종류가 30개를 넘지 않는지 체크
    const uniqueClasses = Array.from(new Set(students.map(s => s.class)));
    if (uniqueClasses.length > 30) {
      setMessage(`CSV 파일에 설정된 반의 수가 ${uniqueClasses.length}개 입니다. 최대 30개까지만 허용됩니다.`);
      return;
    }

    // localStorage의 'students' 데이터 가져오기
    const stored = localStorage.getItem('students');
    let existingStudents = stored ? JSON.parse(stored) : [];
    // 새로운 학생 데이터를 기존 데이터에 추가
    existingStudents = existingStudents.concat(students);
    localStorage.setItem('students', JSON.stringify(existingStudents));
    setMessage('CSV 파일에서 학생 데이터를 성공적으로 가져왔습니다.');
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl mb-4">CSV 파일로 학생 데이터 가져오기</h2>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button
        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleImport}
      >
        가져오기
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
