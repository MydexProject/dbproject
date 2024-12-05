import React, { useState } from 'react';
import TabBar from './components/TabBar';

const App = () => {
  const [userData, setUserData] = useState(null);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  // 로그인 처리
  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data.data);
        setLoggedIn(true);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('로그인 오류:', error);
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setUserData(null); // 사용자 데이터 초기화
    setId(''); // ID 초기화
    setPassword(''); // 비밀번호 초기화
    setLoggedIn(false); // 로그인 상태 초기화
  };

  // 로그인 화면
  if (!loggedIn) {
    return (
      <div>
        <h2>로그인</h2>
        <input
          type="text"
          placeholder="ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>로그인</button>
      </div>
    );
  }

  // 메인 화면
  return (
    <div>
      {userData && (
        <TabBar
          name={userData.name}
          level={userData.level}
          experience={userData.stu_exp}
          onLogout={handleLogout} // 로그아웃 함수 전달
        />
      )}
      <main>
        <h1>메인 콘텐츠</h1>
      </main>
    </div>
  );
};

export default App;
