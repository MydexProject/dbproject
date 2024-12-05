import React from 'react';
import './TabBar.css';

const TabBar = ({ name, level, experience, onLogout }) => {
  return (
    <div className="tab-bar">
      <div className="tab-bar-logo">
        <span className="dsu">DSU</span>
        <span className="mydex">MYDEX</span>
      </div>
      <ul className="tab-bar-menu">
        <li>랭킹보드<br />(Ranking)</li>
        <li>마이페이지<br />(Mypage)</li>
        <li>비교과프로그램<br />(Co-curricular program)</li>
        <li>여정지도<br />(Travel-map)</li>
        <li>스크랩<br />(Scrap)</li>
      </ul>
      <div className="tab-bar-user-info">
        <div className="level">Lv. {level}</div>
        <div className="experience">Exp. {experience}</div>
        <div className="user-name">{name}</div>
        <button className="logout-button" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default TabBar;
