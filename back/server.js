const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '1234',
  database: 'dbproject',
});

// Login API
app.post('/login', async (req, res) => {
  const { id, password } = req.body;

  try {
    const [results] = await db.query(
      'SELECT stu_id, name, level, stu_exp FROM student WHERE stu_id = ? AND password = ?',
      [id, password]
    );

    if (results.length > 0) {
      res.json({ success: true, data: results[0] });
    } else {
      res.status(401).json({ success: false, message: 'ID 또는 비밀번호가 잘못되었습니다.' });
    }
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// 친구 요청 목록 조회 API
app.get('/api/friend/requests', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: '사용자 ID가 필요합니다.' });
  }

  try {
    const [requests] = await db.query(
      `
      SELECT 
        fr.friend_req_id, 
        s.name, 
        s.stu_id AS stu_id_req 
      FROM 
        friend_req fr
      JOIN 
        student s ON fr.stu_id_req = s.stu_id 
      WHERE 
        fr.stu_id_res = ? AND fr.req_status = TRUE
      `,
      [userId]
    );

    res.json(requests);
  } catch (error) {
    console.error('친구 요청 목록 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 친구 요청 보내기 API
app.post('/api/friend/request', async (req, res) => {
  const { stu_id_req, stu_id_res } = req.body;

  if (!stu_id_req || !stu_id_res) {
    return res.status(400).json({ message: '필수 데이터가 누락되었습니다.' });
  }

  try {
    const [reqStudent] = await db.query('SELECT * FROM student WHERE stu_id = ?', [stu_id_req]);
    const [resStudent] = await db.query('SELECT * FROM student WHERE stu_id = ?', [stu_id_res]);

    if (reqStudent.length === 0 || resStudent.length === 0) {
      return res.status(404).json({ message: '요청자 또는 대상자가 유효하지 않습니다.' });
    }

    const [existingRequest] = await db.query(
      'SELECT * FROM friend_req WHERE stu_id_req = ? AND stu_id_res = ? AND req_status = TRUE',
      [stu_id_req, stu_id_res]
    );

    if (existingRequest.length > 0) {
      return res.status(409).json({ message: '이미 요청이 전송되었습니다.' });
    }

    await db.query(
      'INSERT INTO friend_req (stu_id_req, stu_id_res, req_date, req_status,near_req_status) VALUES (?, ?, NOW(), TRUE,FALSE)',
      [stu_id_req, stu_id_res]
    );

    res.status(200).json({ message: '친구 요청이 성공적으로 전송되었습니다!' });
  } catch (error) {
    console.error('친구 요청 처리 중 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 친구 요청 수락 API
app.post('/api/friend/accept', async (req, res) => {
  const { friend_req_id } = req.body;

  if (!friend_req_id) {
    return res.status(400).json({ message: '친구 요청 ID가 필요합니다.' });
  }

  try {
    const [request] = await db.query('SELECT * FROM friend_req WHERE friend_req_id = ?', [friend_req_id]);

    if (request.length === 0) {
      return res.status(404).json({ message: '친구 요청을 찾을 수 없습니다.' });
    }

    const { stu_id_req, stu_id_res } = request[0];

    // 친구 관계 추가
    await db.query(
      'INSERT INTO friend (stu_id_req, stu_id_res, friend_start_date, near_status) VALUES (?, ?, NOW(), FALSE)',
      [stu_id_req, stu_id_res]
    );

    // 친구 요청 삭제
    await db.query('DELETE FROM friend_req WHERE friend_req_id = ?', [friend_req_id]);

    res.status(200).json({ message: '친구 요청을 수락했습니다!' });
  } catch (error) {
    console.error('친구 요청 수락 처리 중 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

//친구 삭제 API
app.delete('/api/friend/delete', async (req, res) => {
  const { stu_id_req, stu_id_res } = req.body; // 요청 데이터 수신
  console.log('친구 삭제 요청 데이터:', req.body);

  if (!stu_id_req || !stu_id_res) {
    return res.status(400).json({ message: '필수 데이터가 누락되었습니다.' });
  }

  try {
    const [result] = await db.query(
      'DELETE FROM friend WHERE (stu_id_req = ? AND stu_id_res = ?) OR (stu_id_req = ? AND stu_id_res = ?)',
      [stu_id_req, stu_id_res, stu_id_res, stu_id_req]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: '삭제할 친구 관계를 찾을 수 없습니다.' });
    }

    res.status(200).json({ message: '친구 관계가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('친구 삭제 처리 중 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});



// 친구 목록 조회 API
app.get('/api/friends', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: '사용자 ID가 필요합니다.' });
  }

  try {
    const [friends] = await db.query(
      `
      SELECT 
        f.friend_id,
      s.stu_id, 
        s.name, 
        s.level, 
        s.stu_exp, 
        f.near_status 
      FROM 
        friend f
      JOIN 
        student s ON 
        (f.stu_id_res = s.stu_id AND f.stu_id_req = ?) 
        OR 
        (f.stu_id_req = s.stu_id AND f.stu_id_res = ?)
      `,
      [userId, userId]
    
    );

    res.json(friends);
  } catch (error) {
    console.error('친구 목록 오류:', error);
    res.status(500).json({ message: '서버 오류' });
  }
});

// Start Server
app.listen(5000, () => {
  console.log('서버가 http://localhost:5000에서 실행 중');
});
