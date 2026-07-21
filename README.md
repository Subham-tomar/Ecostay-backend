# EcoStay Backend 🌱

Backend API for the EcoStay sustainable travel platform.

EcoStay helps users discover sustainable accommodation options and provides AI-powered recommendations based on their travel preferences.

---

## 🚀 Features

- User registration and login
- Password hashing using bcrypt
- JWT-based authentication
- Google OAuth authentication
- Protected API routes
- Stay management APIs
- Search functionality
- AI-powered eco-friendly stay recommendations
- Request rate limiting for authentication routes

---

## 🤖 AI Recommendation Feature

EcoStay includes an AI-powered recommendation system.

Users can describe their travel preferences, for example:

> I want a peaceful eco-friendly stay in the mountains with nature, clean surroundings, and sustainable facilities.

The AI analyzes the preferences and recommends a suitable type of sustainable accommodation.

The recommendation also includes:

- Why the stay matches the user's preferences
- Sustainable features to look for
- Practical travel advice

---

## 🔗 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/google` | Google OAuth login |

### AI Recommendation

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/recommend` | Generate an AI stay recommendation |

Example request:

```json
{
  "preferences": "I want a peaceful eco-friendly stay in the mountains with nature and sustainable facilities."
}
### Stay APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/stays` | Get all stays |
| GET | `/stays/:id` | Get a specific stay |
| POST | `/stays` | Create a new stay |
| PUT | `/stays/:id` | Update a stay |
| DELETE | `/stays/:id` | Delete a stay |
| GET | `/search?name=keyword` | Search stays |

---

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- OpenAI API
- JWT
- Passport.js
- Google OAuth 2.0
- bcrypt
- Express Rate Limit
- CORS

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/Subham-tomar/Ecostay-backend.git
Navigate to the project folder:
cd Ecostay-backend
Install dependencies:
npm install
Create a .env file in the root directory:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_google_callback_url
Start the server:
node server.js
The backend will run on:
http://localhost:5000
🧪 AI Prompt Testing
AI prompts and testing results are documented in:
PROMPTS.md
The documentation includes:
Different prompt variations
Example inputs and outputs
Best-performing prompt
System prompt and role used
🔐 Security
Sensitive environment variables are stored in .env and should never be committed to GitHub.
The .gitignore file excludes:
.env
node_modules/
📌 Project Status
✅ Authentication implemented
✅ JWT protection implemented
✅ Google OAuth implemented
✅ Stay CRUD APIs implemented
✅ Stay search implemented
✅ AI recommendation feature implemented
✅ AI prompt testing documented