# Store Rating Management System

A full-stack web application that allows users to rate stores, store owners to monitor customer ratings, and administrators to manage users and stores.

## Project Overview

The **Store Rating Management System** is developed using React.js, Node.js, Express.js, and MySQL. It provides a centralized platform where users can explore stores and submit ratings from 1 to 5.

The application supports three types of users:

- System Administrator
- Normal User
- Store Owner

Each role has different permissions and functionalities.

## Technology Stack

| Technology   | Purpose              |
| ------------ | -------------------- |
| React.js     | Frontend development |
| Node.js      | Backend runtime      |
| Express.js   | REST API development |
| MySQL        | Database             |
| JWT          | Authentication       |
| bcryptjs     | Password hashing     |
| Postman      | API testing          |
| Git & GitHub | Version control      |

## User Roles and Features

### 1. System Administrator

- Log in to the admin dashboard.
- View total users, stores, and ratings.
- Add and manage stores.
- Add and manage users.
- Create administrator accounts.
- View user and store details.
- Filter and sort users and stores.
- View store owners' ratings.

### 2. Normal User

- Register and log in.
- View available stores.
- Search stores by name or address.
- View overall store ratings.
- Submit ratings between 1 and 5.
- Update previously submitted ratings.
- View personal rating history.
- Update password.

### 3. Store Owner

- Log in to the application.
- View store rating statistics.
- View the average rating of their store.
- View users who have submitted ratings.
- Update password.

## API Endpoints

Base URL:

```text
http://localhost:5000
```

### Authentication APIs

| Method | Endpoint                    | Description                |
| ------ | --------------------------- | -------------------------- |
| POST   | `/api/auth/register`        | Register a normal user     |
| POST   | `/api/auth/login`           | Login                      |
| GET    | `/api/auth/profile`         | Get logged-in user details |
| PUT    | `/api/auth/update-password` | Update password            |

### Admin APIs

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| GET    | `/api/admin/dashboard`  | View dashboard statistics |
| GET    | `/api/admin/users`      | Get all users             |
| POST   | `/api/admin/users`      | Create a user             |
| GET    | `/api/admin/users/:id`  | Get user details          |
| PUT    | `/api/admin/users/:id`  | Update user details       |
| GET    | `/api/admin/stores`     | Get all stores            |
| POST   | `/api/admin/stores`     | Add a store               |
| GET    | `/api/admin/stores/:id` | Get store details         |
| PUT    | `/api/admin/stores/:id` | Update store details      |
| DELETE | `/api/admin/stores/:id` | Delete a store            |

### Normal User APIs

| Method | Endpoint                  | Description           |
| ------ | ------------------------- | --------------------- |
| GET    | `/api/stores`             | View all stores       |
| GET    | `/api/stores/:id`         | View store details    |
| GET    | `/api/stores/search`      | Search stores         |
| POST   | `/api/ratings`            | Submit a rating       |
| PUT    | `/api/ratings/:id`        | Update a rating       |
| GET    | `/api/ratings/my-ratings` | View personal ratings |

### Store Owner APIs

| Method | Endpoint               | Description                    |
| ------ | ---------------------- | ------------------------------ |
| GET    | `/api/owner/dashboard` | View store rating statistics   |
| GET    | `/api/owner/ratings`   | View users who rated the store |
| GET    | `/api/owner/store`     | View owned store details       |

**Note:** These are planned API endpoints. They will be implemented and tested incrementally during development.

## Database Structure

The project uses MySQL as its relational database.

Main tables:

### 1. Users

Stores user account information and roles.

- id
- name
- email
- password
- address
- role
- created_at

### 2. Stores

Stores information about registered stores.

- id
- name
- email
- address
- owner_id
- created_at

### 3. Ratings

Stores ratings submitted by users.

- id
- user_id
- store_id
- rating
- created_at
- updated_at

A user can submit only one rating per store. Existing ratings can be updated.

## Project Structure

```text
Store-Rating-System/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   ├── routes/
│   │   └── authRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MySQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Rushikesh4567/store-rating-management-system.git
```

### 2. Navigate to the Project

```bash
cd store-rating-management-system
```

### 3. Backend Setup

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the backend directory:

```env
PORT=5000
APP_NAME=Store Rating System

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_db
```

Replace `your_mysql_password` with your local MySQL password.

### 5. Start the Backend Server

```bash
npm run dev
```

The backend server will run at:

```text
http://localhost:5000
```

### 6. Frontend Setup

Once the frontend is configured:

```bash
cd frontend
npm install
npm run dev
```

## Validation Rules

The application follows these input validation requirements:

| Field             | Validation                                              |
| ----------------- | ------------------------------------------------------- |
| Name              | 20–60 characters                                        |
| Address           | Maximum 400 characters                                  |
| Password          | 8–16 characters                                         |
| Password Security | At least one uppercase letter and one special character |
| Email             | Must be a valid email address                           |
| Rating            | Integer between 1 and 5                                 |

## Security Features

- Password hashing using bcryptjs.
- JWT-based authentication.
- Role-based access control.
- Input validation using express-validator.
- Protected API endpoints.
- Parameterized MySQL queries to help prevent SQL injection.

## Development Progress

- Project setup
- Express server configuration
- MySQL database connection
- Database tables creation
- User registration API
- User login API
- JWT authentication middleware
- Role-based authorization
- Admin APIs
- Normal User APIs
- Store Owner APIs
- React.js frontend
- Complete application testing


## Author

**Rushikesh Anantpure**

GitHub: [Rushikesh4567](https://github.com/Rushikesh4567)

---

