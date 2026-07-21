# 🎵 Mood Melodies

An AI-powered Full Stack MERN application that recommends songs based on the user's facial emotions. The application detects emotions in real-time and provides personalized music recommendations with secure user authentication and playlist management.

---

## ✨ Features

- 🎭 Real-time facial emotion detection
- 🎵 Mood-based music recommendation
- 🔐 JWT Authentication (Login & Signup)
- ❤️ Save favorite songs
- 📂 Playlist management
- 📱 Fully responsive UI
- ⚡ RESTful API
- ☁️ MongoDB Database Integration

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router DOM

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer
- Bcrypt.js
- CORS
- Dotenv

---

# 📂 Project Structure

```
Mood-Melodies
│
├── Backend
│   ├── src
│   ├── uploads
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── Frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/chandan-sharma07/Mood-Melodies.git
```

---

## 2️⃣ Backend Setup

```bash
cd Backend
npm install
npm run dev
```

---

## 3️⃣ Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

---

# 🔐 Environment Variables

Create a `.env` file inside the **Backend** folder and add the following variables:

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173
```

> **Note:** The `.env` file is not included in the repository for security reasons. Create it manually before running the backend.

---

# 📸 Screenshots

Add project screenshots here.

### Home Page

<img src="screenshots/home.png" width="800"/>

### Login Page

<img src="screenshots/login.png" width="800"/>

### Emotion Detection

<img src="screenshots/emotion.png" width="800"/>

### Music Recommendation

<img src="screenshots/recommendation.png" width="800"/>

---

# 📌 Future Improvements

- Spotify API Integration
- AI-based Recommendation Enhancement
- Google Authentication
- Music History
- Dark Mode
- Admin Dashboard
- User Analytics

---

# 📦 API Endpoints

## Authentication

```
POST /api/auth/register
POST /api/auth/login
```

## User

```
GET /api/user/profile
PUT /api/user/profile
```

## Songs

```
GET /api/songs
POST /api/songs
GET /api/songs/:id
```

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature-name
```

3. Commit your changes.

```bash
git commit -m "Add new feature"
```

4. Push to GitHub.

```bash
git push origin feature-name
```

5. Open a Pull Request.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Chandan Kumar Sharma**

- 🎓 B.Tech Computer Science Engineering
- 💻 MERN Stack Developer
- 🌐 GitHub: https://github.com/chandan-sharma07

---

⭐ If you like this project, don't forget to **Star** the repository.
