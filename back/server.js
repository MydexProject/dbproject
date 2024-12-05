const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(cors());
// MySQL Connection
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root', // MySQL 사용자 이름
  password: '1234', // MySQL 비밀번호
  database: 'dbproject', // 사용 중인 데이터베이스 이름
});

db.connect((err) => {
  if (err) {
    console.error('MySQL 연결 실패:', err);
    return;
  }
  console.log('MySQL 연결 성공');
});

// Login API
app.post('/login', (req, res) => {
    const { id, password } = req.body;
  
    const query = 'SELECT name, level, stu_exp FROM student WHERE stu_id = ? AND password = ?';
    db.query(query, [id, password], (err, results) => {
      if (err) {
        console.error('쿼리 실행 오류:', err);
        res.status(500).json({ success: false, message: '서버 오류' });
        return;
      }
      if (results.length > 0) {
        res.json({ success: true, data: results[0] });
      } else {
        res.json({ success: false, message: 'ID 또는 비밀번호가 잘못되었습니다.' });
      }
    });
  });

// Start Server
app.listen(5000, () => {
  console.log('서버가 http://localhost:5000에서 실행 중');
});
