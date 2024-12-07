import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const FriendList = ({ userId }) => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [newFriendId, setNewFriendId] = useState(''); // ID for friend request
  const [message, setMessage] = useState(''); // Success/Failure message
  const [loading, setLoading] = useState(false); // Loading state for API calls

  // Fetch the list of friends
  const fetchFriends = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/friends`, {
        params: { userId },
      });
      
      setFriends(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError(err.response?.data?.message || 'Error fetching friends.');
    } finally {
      setLoading(false);
    }
  }, [userId]);
  const acceptFriendRequest = async (friend_req_id) => {
    console.log('수락 요청 ID:', friend_req_id); // 디버깅: 전달된 ID 확인

    try {
      const response = await axios.post('http://localhost:5000/api/friend/accept', { friend_req_id });
      setMessage(response.data.message); // 성공 메시지
      fetchFriends(); // 친구 목록 갱신
      fetchRequests(); // 친구 요청 목록 갱신
    } catch (error) {
      console.error('친구 요청 수락 오류:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || '친구 요청 수락 중 문제가 발생했습니다.');
    }
  };
  
  // Fetch the list of friend requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/friend/requests`, {
        params: { userId },
      });
      setRequests(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError(err.response?.data?.message || 'Error fetching friend requests.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Send a friend request
  const sendFriendRequest = async () => {
    if (!newFriendId) {
      setMessage('Please enter a friend ID.');
      return;
    }

    try {
      console.log('Sending friend request data:', { stu_id_req: userId, stu_id_res: newFriendId });
      const response = await axios.post(`http://localhost:5000/api/friend/request`, {
        stu_id_req: userId,
        stu_id_res: newFriendId,
      });
      setMessage(response.data.message);
      setNewFriendId(''); // Reset the input field
      fetchRequests(); // Refresh the request list
    } catch (err) {
      console.error('Error sending friend request:', err.response?.data || err.message);
      setMessage(err.response?.data?.message || 'Error sending friend request.');
    }
  };
  const deleteFriend = async (friendId, friendReqId) => {
    console.log('친구 목록 데이터:', friends);
    console.log('삭제 요청 데이터:', {
      friendId: friendId,
      stu_id_res: friendReqId, // 삭제할 친구의 ID
    });
  
    try {
      const response = await axios.delete('http://localhost:5000/api/friend/delete', {
        data: {
          friendId: friendId,
          stu_id_req: userId, // 로그인한 사용자 ID
          stu_id_res: friendReqId, // 삭제할 친구의 ID
        },
      });
  
      setMessage(response.data.message); // 성공 메시지 설정
      fetchFriends(); // 목록 새로고침
    } catch (error) {
      console.error('친구 삭제 오류:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || '친구 삭제 중 문제가 발생했습니다.');
    }
  };
  useEffect(() => {
    if (userId) {
      fetchFriends();
      fetchRequests();
    }
  }, [userId, fetchFriends, fetchRequests]);

  return (
    <div>
      <h2>친구 관리</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      {/* Send Friend Request */}
      <div>
        <h3>친구 요청 보내기</h3>
        <input
          type="text"
          placeholder="Enter Friend ID"
          value={newFriendId}
          onChange={(e) => setNewFriendId(e.target.value)}
        />
        <button onClick={sendFriendRequest}>친구 요청</button>
      </div>

      {/* Friend List */}
      <div>
       
        <h3>친구 목록</h3>
        {friends.length > 0 ? (
          friends.map((friend) => (
            <div key={friend.friend_id}>
      
              <p>
                {friend.name} (Level: {friend.level}, Experience: {friend.stu_exp})
                {friend.near_status && <span> [Close Friend]</span>}
              </p>
              <button onClick={() => deleteFriend(friend.friend_id, friend.stu_id)}>
                친구 삭제
              </button>
            </div>
          ))
        ) : (
          <p>No friends found.</p>
        )}
      </div>

      {/* Friend Request List */}
      <div>
        <h3>친구 요청 목록</h3>
        {requests.length > 0 ? (
          requests.map((req) => (
            <div key={req.friend_req_id}>
              <p>
                {req.name} 님이 친구요청을 보냈습니다.
                <button onClick={() => acceptFriendRequest(req.friend_req_id)}>수락</button>
                </p>
            </div>
          ))
        ) : (
          <p>받은 친구 요청이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default FriendList;
