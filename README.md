# 🌍 GeoInsight Dashboard

An **interactive geography dashboard** that gathers **country metadata**, **weather**, and **air quality** for any selected country.  
The data is aggregated in the **frontend**, securely stored in **MongoDB** via a custom **Node.js/Express API**, and protected with **OAuth 2.0 (Auth0)** and an **API key**.

---

## ✨ Features

- 🗺 **Country Metadata** – Capital, population, currency, languages, flag (via RestCountries API)  
- 🌦 **Current Weather** – Real-time weather & temperature (via OpenWeatherMap API)  
- 🌫 **Air Quality Index (AQI)** – Air pollution data (via OpenAQ API)  
- 💾 **Save Snapshots** – Store aggregated data in MongoDB with authentication  
- 📜 **Retrieve Records** – Fetch stored history via `/api/records` endpoint  

---

## 🛠 Technology Stack

**Frontend:** HTML, CSS, JavaScript, AJAX  
**Backend:** Node.js, Express.js  
**Database:** MongoDB (Atlas or local)  
**Security:** OAuth 2.0 (Auth0), API Key authentication  

---

## 📂 Project Structure

```

GeoInsight-Dashboard/
│
├── client/                # Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server/                # Backend (Node.js + Express)
│   ├── index.js
│   ├── routes/
│   ├── controllers/
│   └── models/
│
├── .env.example           # Example environment variables
├── package.json
└── README.md

````

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/GeoInsight-Dashboard.git
cd GeoInsight-Dashboard
````

### 2️⃣ Install Dependencies

**Backend**

```bash
cd server
npm install
```

**Frontend**
(No installation needed — plain HTML/JS)

---

### 3️⃣ Create Environment Variables

Copy `.env.example` → `.env` and set values:

```
MONGO_URI=your_mongodb_connection_string
API_KEY=your_custom_api_key
AUTH0_DOMAIN=your-auth0-domain
AUTH0_AUDIENCE=your-auth0-audience
OPENWEATHERMAP_KEY=your_openweathermap_api_key
```

---

### 4️⃣ Run Backend Server

```bash
cd server
npm start
```

Server will start on `http://localhost:5000`

---

### 5️⃣ Open Frontend

Open `client/index.html` in your browser
(or serve it locally using Live Server in VS Code)

---

## 🔑 Authentication

* **OAuth 2.0**: Implemented via **Auth0** — required for user login.
* **API Key**: Required in the `x-api-key` header for backend requests.

Example request with API Key:

```bash
curl -H "Authorization: Bearer <your-oauth-token>" \
     -H "x-api-key: your_api_key" \
     http://localhost:5000/api/records
```

---

## 📡 APIs Used

| API Name       | Purpose                  | Docs                                   |
| -------------- | ------------------------ | -------------------------------------- |
| RestCountries  | Country info & flag      | [Docs](https://restcountries.com/)     |
| OpenWeatherMap | Weather for capital city | [Docs](https://openweathermap.org/api) |
| OpenAQ         | Air quality index        | [Docs](https://docs.openaq.org/)       |

---

## 📸 Sample Output

**Frontend View:**

```
Country: Japan 🇯🇵
Population: 125,800,000
Weather: 28°C, clear sky
Air Quality Index: 42 (Good)
```

**JSON Sent to Backend:**

```json
{
  "country": "Japan",
  "metadata": {
    "capital": "Tokyo",
    "population": 125800000,
    "currency": "JPY",
    "languages": ["Japanese"],
    "flag": "https://flagcdn.com/w320/jp.png"
  },
  "weather": {
    "temperature": 28,
    "description": "clear sky",
    "humidity": 65
  },
  "airQuality": {
    "aqi": 42,
    "status": "Good"
  },
  "fetchedAt": "2025-08-08T08:00:00Z"
}
```

---

## 🧑‍🤝‍🧑 Team Task Distribution

| Member | Role                     | Tasks                                                      |
| ------ | ------------------------ | ---------------------------------------------------------- |
| **1**  | Frontend UI              | HTML/CSS layout, user input forms, results display         |
| **2**  | Frontend API Integration | Fetch APIs, aggregate JSON, AJAX requests                  |
| **3**  | Backend Developer        | Express routes, API key validation, MongoDB connection     |
| **4**  | Auth & Security          | OAuth 2.0 setup (Auth0), backend security, .env management |

---

## 📜 License

This project is for educational purposes — feel free to adapt it.

---
