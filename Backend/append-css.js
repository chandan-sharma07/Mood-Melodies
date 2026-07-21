const fs = require('fs');
const css = `

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.profile-modal {
  width: 900px;
  max-width: 95vw;
  height: 600px;
  max-height: 90vh;
  background: #121212;
  border-radius: 16px;
  border: 1px solid #333;
  display: flex;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 10;
  opacity: 0.6;
  transition: 0.3s;
}
.modal-close-btn:hover {
  opacity: 1;
}

.modal-sidebar {
  width: 250px;
  background: #1a1a1d;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333;
}

.sidebar-title {
  color: #ff65a3;
  margin: 0 0 2rem 2rem;
  font-size: 1.5rem;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}

.menu-btn {
  background: none;
  border: none;
  color: #a0a0a0;
  text-align: left;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.3s;
}
.menu-btn:hover {
  color: #fff;
  background: rgba(255, 101, 163, 0.05);
}
.menu-btn.active {
  color: #fff;
  background: rgba(255, 101, 163, 0.15);
  border-right: 4px solid #ff65a3;
}

.logout-btn {
  background: none;
  border: none;
  color: #ff3b30;
  text-align: left;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.3s;
}
.logout-btn:hover {
  background: rgba(255, 59, 48, 0.1);
}

.modal-body {
  flex-grow: 1;
  padding: 3rem;
  overflow-y: auto;
  color: #fff;
}

.fade-in {
  animation: fadeIn 0.3s ease forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.profile-stats, .history-list {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.stat-group {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #333;
  padding-bottom: 0.8rem;
}
.stat-label {
  color: #909090;
}
.stat-value {
  font-weight: bold;
}

.history-item {
  display: flex;
  justify-content: space-between;
  background: #1a1a1d;
  padding: 1rem 1.5rem;
  border-radius: 8px;
}
.history-item .time {
  color: #888;
}

.settings-pane h2 { margin-bottom: 2rem; }
.settings-section {
  margin-bottom: 2.5rem;
}
.settings-section h3 {
  color: #ff65a3;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #333;
}
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: #e0e0e0;
}

.dark-select {
  background: #2a2a2d;
  color: #fff;
  border: 1px solid #444;
  padding: 0.5rem 1rem;
  border-radius: 6px;
}
.outline-btn {
  border: 1px solid #ff65a3;
  color: #ff65a3;
  background: transparent;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  transition: 0.3s;
}
.outline-btn:hover {
  background: rgba(255, 101, 163, 0.1);
}
`;

fs.appendFileSync('c:/Programming/BackEnd/music-by-faces/Frontend/src/features/home/styles/Home.scss', css);
console.log('Success');
