Inventory Pro
Inventory Pro is a full-stack web application designed for efficient management of inventory, customers, sales, and reports. It features a responsive user interface, secure authentication, and real-time analytics, making it an ideal tool for small to medium-sized businesses to track and manage their operations.
Features

Dashboard: Visualize key metrics such as total sales, inventory levels, and recent activity.
Inventory Management: Add, edit, and delete items with details like name, description, quantity, and price.
Customer Management: Manage customer profiles, including contact information.
Sales Tracking: Record sales, search by item or customer name, and filter by date or customer.
Reports: Generate detailed sales and inventory reports for data-driven decisions.
Authentication: Secure user login and registration using JWT.
Responsive Design: Mobile-friendly interface built with Tailwind CSS and Framer Motion animations.

Tech Stack

Frontend:
React (with Vite)
RTK Query (for API management)
Tailwind CSS (styling)
Framer Motion (animations)
React Router (navigation)


Backend:
Node.js with Express
TypeScript
MongoDB with Mongoose
JWT for authentication
bcryptjs for password hashing


Database: MongoDB (MongoDB Atlas for production)
Deployment: Render (Static Site for frontend, Web Service for backend)
Testing: Jest and Supertest (backend), Vitest and React Testing Library (frontend)

Prerequisites
To set up and run Inventory Pro locally, ensure you have:

Node.js: v18 or higher (v22.14.0 recommended for compatibility)
npm: v8 or higher
MongoDB: Local instance or MongoDB Atlas account
Git: For cloning the repository
Render Account: For accessing the deployed version
GitHub Account: For accessing the source code

Local Setup Instructions
Follow these steps to set up and run the application locally.
1. Clone the Repository
git clone https://github.com/your-username/inventory-pro.git
cd inventory-pro

2. Backend Setup

Navigate to the Backend Directory:
cd server


Install Dependencies:
npm install


Configure Environment Variables:Create a .env file in the server/ directory with the following:
MONGO_URI=mongodb://localhost:27017/inventory
JWT_SECRET=your_secure_secret
PORT=5000


Replace your_secure_secret with a secure string (e.g., generate with openssl rand -base64 32).
For MongoDB Atlas, use the connection string from your cluster (e.g., mongodb+srv://user:password@cluster0.mongodb.net/inventory).


Seed the Database (Optional):

If using a local MongoDB, start the MongoDB server (mongod).
Run the seed script to populate the database with sample data (see docs/SEED.md for details).
Example (in mongosh):use inventory;
db.items.insertMany([{ name: "Apple iPhone", description: "Smartphone", quantity: 5, price: 500, createdBy: "user1" }]);




Run the Backend:
npm run dev


The backend API will be available at http://localhost:5000/api.



3. Frontend Setup

Navigate to the Frontend Directory:
cd ../client


Install Dependencies:
npm install


Configure Environment Variables:Create a .env file in the client/ directory with:
VITE_API_URL=http://localhost:5000/api


Run the Frontend:
npm run dev


The frontend will be available at http://localhost:3000.



4. Test the Application Locally

Open http://localhost:3000 in your browser.
Register a new user at /login or use test credentials (e.g., email: test@example.com, password: password).
Navigate to the Sales page (/sales), search for "Apple" or "Leslie", and verify results.
Test other features (Dashboard, Inventory, Customers, Reports) via the sidebar.

Accessing the Deployed Version
The application is deployed on Render as two services: a frontend static site and a backend web service.
Deployed URLs

Frontend: https://inventory-pro-client.onrender.com
Backend API: https://inventory-pro-server.onrender.com/api

Instructions

Visit the Frontend:

Open the frontend URL in your browser.
Register or log in to access the application.
Navigate to /sales and search for terms like "Apple" or "Leslie" to view seeded data.


Test the Backend API:

Use a tool like curl or Postman to interact with the API.
Example:curl -i "https://inventory-pro-server.onrender.com/api/sales?page=1&limit=10&search=le"


To access protected endpoints, obtain a JWT token via /api/auth/login and include it in the Authorization header:curl -H "Authorization: Bearer your_token" -i "https://inventory-pro-server.onrender.com/api/sales"




Note on Render Free Tier:

The free tier may cause cold starts, leading to initial delays (up to 30 seconds) for API requests.
Refresh the page or wait if the frontend appears slow.



Running Tests
The application includes basic unit tests for both backend and frontend.
Backend Tests

Navigate to the backend:cd server


Run tests:npm test


Tests use Jest and Supertest to verify API endpoints (e.g., /api/sales).



Frontend Tests

Navigate to the frontend:cd client


Run tests:npm test


Tests use Vitest and React Testing Library to verify components (e.g., Sales page).



Documentation
Detailed documentation is available in the docs/ folder:

SETUP.md: Instructions for local setup.
USAGE.md: Guide to using the application.
API.md: API endpoint documentation.
SEED.md: Database seeding instructions.
DEPLOYMENT.md: Deployment guide for Render.

Project Structure
inventory-pro/
├── client/               # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── server/               # Node.js backend
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── docs/                 # Documentation
└── README.md

Screenshots



Dashboard
Sales Page







Troubleshooting

Backend API Errors:
Check Render logs for MongoDB connection issues or missing environment variables.
Ensure MONGO_URI and JWT_SECRET are set correctly in Render.


Frontend Issues:
Verify VITE_API_URL matches the backend URL.
Check browser DevTools for CORS or network errors.


Sales Search Returns No Data:
Ensure the database is seeded (see docs/SEED.md).
Test the /api/sales endpoint directly.


Sidebar Animation:
The sidebar should remain static after the initial load. If it animates on navigation, verify Layout.tsx and Sidebar.tsx configurations.



Contributing
Contributions are welcome! Please fork the repository, create a new branch, and submit a pull request.
License
This project is licensed under the MIT License.
Contact
For questions or support, contact your-email@example.com or open an issue on GitHub.
