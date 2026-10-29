# 🚀 Rank Radar — AI SEO Rank Tracker

Rank Radar is a full-stack SEO analytics platform that helps users monitor keyword rankings, analyze website SEO performance, track ranking changes, and generate AI-powered insights to improve search engine visibility.

The platform combines real-time search data, historical ranking information, and generative AI to help users make data-driven SEO decisions.

## ✨ Features

- **🔐 User Authentication** — Secure registration, login, and JWT-based authentication.
- **🌐 Website Management** — Manage websites and SEO analysis projects.
- **📈 Keyword Rank Tracking** — Track keyword positions in search engine results.
- **📊 Ranking History** — Store and monitor keyword ranking changes over time.
- **🤖 AI-Powered SEO Analysis** — Generate actionable SEO insights using Google Gemini.
- **🔍 Search Engine Data** — Retrieve search results using Browserbase or Serper API.
- **📝 SEO Recommendations** — Identify optimization opportunities and suggest improvements.
- **📉 Analytics Dashboard** — Visualize SEO performance and ranking trends.
- **⚙️ Background Processing** — Process SEO analysis and scheduled rank-tracking tasks asynchronously.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| AI Integration | Google Gemini API, Groq API|
| Search Data | Browserbase, Serper API |
| Background Jobs | Node Cron |
| API Communication | REST APIs |
| Development Tools | Git, GitHub, VS Code |

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      User            │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │          │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │      Backend         │
                    └──────┬───────┬───────┘
                           │       │
                 ┌─────────▼──┐ ┌──▼────────────┐
                 │  MongoDB   │ │ Serper API    │
                 │  Database  │ │ Search Data   │
                 └────────────┘ └──────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Google Gemini   │
                              │   AI Analysis   │
                              └─────────────────┘
```

## 📁 Project Structure

```text
Rank_Radar/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── cron/
│   ├── config/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### 1. Prerequisites

Install or create accounts for the following:

- [Node.js](https://nodejs.org/) — LTS version recommended.
- [MongoDB Atlas](https://www.mongodb.com/atlas) or a local MongoDB instance.
- [Google AI Studio](https://aistudio.google.com/) for a Gemini API key.
- [Serper](https://serper.dev/) for a search API key.
- Git for version control.

### 2. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Rank_Radar
```

### 3. Install Dependencies

Open separate terminals for the frontend and backend.

**Backend**

```bash
cd backend
npm install
```

**Frontend**

```bash
cd frontend
npm install
```

If your repository uses different folder names, replace `backend` and `frontend` accordingly.

### 4. Configure Environment Variables

Create a `.env` file in the backend directory.

**Backend `.env`**

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_long_random_secret

GEMINI_API_KEY=your_gemini_api_key

SERPER_API_KEY=your_serper_api_key

CLIENT_URL=http://localhost:5173
```

Use the exact variable names expected by your backend code. If your application uses Groq as an AI fallback, add its API key only if required by your implementation.

**Frontend `.env`**

```env
VITE_API_URL=http://localhost:5000
```

If your Axios configuration expects a URL ending in `/api`, use the appropriate base URL for your backend routes.

> **Security:** Never commit `.env` files or expose API keys, database credentials, or JWT secrets in your frontend. Add `.env` to `.gitignore` and provide safe placeholders in `.env.example`.

### 5. Run the Application

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the local URL printed by Vite, typically:

```text
http://localhost:5173
```

These commands assume your backend defines a `dev` script and your frontend uses Vite. Check each `package.json` if the commands differ.

## 🔑 API Integrations

### Google Gemini API

Google Gemini powers the AI-based SEO analysis functionality.

Potential uses include:

- Interpreting SEO-related information.
- Generating optimization recommendations.
- Summarizing website SEO performance.
- Producing actionable insights from collected search data.

### Serper API

Serper retrieves search engine results that can be used for keyword position tracking and search-result analysis.

The backend can process the returned results, determine keyword positions, and store ranking snapshots for historical comparisons.

### MongoDB

MongoDB stores application data such as:

- User accounts.
- Website and project details.
- SEO analysis records.
- Keyword tracking configurations.
- Historical ranking snapshots.

## 🔄 How It Works

1. **User authentication:** A user registers or logs in.
2. **Website setup:** The user adds a website or creates an SEO analysis project.
3. **Keyword tracking:** The application retrieves search results for tracked keywords.
4. **Position calculation:** The backend determines the website's ranking position when it appears in the results.
5. **Data persistence:** Ranking information and analysis records are saved in MongoDB.
6. **AI analysis:** Relevant SEO data is sent to the configured AI provider to generate insights.
7. **Dashboard updates:** The frontend presents available rankings, historical changes, and SEO recommendations.

Actual results depend on API availability, search-result coverage, configured tracking depth, and the website's presence in the returned results.

## 🔒 Security Considerations

- Store passwords as bcrypt hashes rather than plaintext.
- Validate JWTs through authentication middleware.
- Keep API keys and database credentials on the backend.
- Validate incoming request data.
- Protect private endpoints with appropriate authentication and authorization.
- Configure CORS for trusted frontend origins.
- Apply rate limiting and sensible API timeouts.
- Avoid exposing sensitive errors or credentials in production logs.

## 🚧 Current Limitations

- AI analysis can be delayed by provider rate limits, high demand, or temporary server errors.
- Search API limits may restrict tracking frequency and the number of keywords processed.
- Ranking results may vary by location, device, search context, and time.
- Background analysis can remain pending when jobs take longer than expected or fail.
- AI-generated recommendations should be reviewed before implementation.

## 🚀 Future Enhancements

- Competitor benchmarking and keyword gap analysis.
- Technical SEO audits and page-speed insights.
- Email alerts for significant ranking changes.
- Search visibility and keyword difficulty metrics.
- Improved background job queues and retry handling.
- Analysis caching and request deduplication.
- More AI provider options and configurable model selection.
- Exportable SEO reports and scheduled summaries.
- Automated testing and continuous integration.

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Commit your changes with a descriptive message.
5. Open a pull request.

## 👨‍💻 Author

**Raman Gahlawat**

- GitHub: [Your GitHub Profile](https://github.com/ramangahlawat5)
- LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/ramangahlawat5)

---

⭐ If you find Rank Radar useful, consider giving the repository a star!
