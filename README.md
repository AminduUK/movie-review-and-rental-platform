# 🎬 CineNest — Movie Rental & Review Platform

> A full-stack web application for renting movies, writing reviews, and managing a personal watchlist. Built with Spring Boot and vanilla JavaScript.

---

## 📌 Project Overview

CineNest is a full-stack movie rental and review platform developed as a university project for the **SE1020 – Object Oriented Programming** module. The platform consists of two separate frontends — a **main movie site** for users and an **admin panel** for administrators — both powered by a single Spring Boot REST API backend.

---

## ✨ Features

### 👤 User Features
- Sign up and sign in with JWT authentication
- Browse, search, and filter movies by title, category, and release year
- Rent up to 3 movies at a time (7-day rental period)
- Secure card payments powered by **Stripe**
- Return movies manually before the due date
- Rate and write reviews for rented movies
- Manage a personal watchlist
- View watch history (returned rentals)
- Update profile details and password

### 🔐 Admin Features
- Secure admin signin (separate dashboard)
- Add, update, and delete movies
- Manage movie categories
- View and search registered users
- Delete user accounts
- Moderate and delete reviews

### ⚙️ System Features
- JWT-based stateless authentication
- Role-based access control (`ROLE_USER` / `ROLE_ADMIN`)
- Automatic movie return scheduler (runs daily at midnight)
- Watchlist auto-created on user signup
- Spring Security protecting all API endpoints

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Java 21 | Core language |
| Spring Boot | Application framework |
| Spring Security | Authentication & authorization |
| JWT (JJWT 0.12.6) | Stateless token-based auth |
| Spring Data JPA | Database ORM |
| Hibernate | JPA implementation |
| MySQL | Relational database |
| Stripe Java SDK | Payment processing |
| Maven | Dependency management |

### Frontend
| Technology | Purpose |
|------------|---------|
| HTML5 / CSS3 | Structure and styling |
| Vanilla JavaScript | Dynamic interactions |
| Stripe.js | Secure card input |
| Playfair Display | Typography (Google Fonts) |

---

## 🗄️ Database Schema

```
USER ────────────────────────────────────┐
 │                                       │
 │ 1:N                                   │ 1:N
 ▼                                       ▼
RENTAL ──── 1:1 ──── PAYMENT        WATCHLIST
 │ N:1                                   │ N:1
 ▼                                       │
MOVIE ◄─────────────────────────────────┘
 │  │
 │  └──── N:N ──── CATEGORY
 │         (via movie_category table)
 │
 │ 1:N
 ▼
REVIEW
```

### Entities
- **User** — stores both admins and regular users with role differentiation
- **Movie** — movie catalog with title, description, language, duration, release year
- **Category** — movie genres linked via `movie_category` join table
- **Rental** — tracks active and returned rentals with due dates
- **Payment** — one-to-one with rental, integrated with Stripe
- **Review** — ratings (1–5) and comments, restricted to rented movies
- **Watchlist** — permanent per-user list of saved movies

---

## 📁 Project Structure

```
src/
├── main/
│   ├── java/lk/ac/sliit/movie_rental_and_review_platform/
│   │   ├── config/
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   ├── admin/
│   │   │   │   ├── AdminMovieController.java
│   │   │   │   ├── AdminUserController.java
│   │   │   │   ├── AdminCategoryController.java
│   │   │   │   └── AdminReviewController.java
│   │   │   ├── auth/
│   │   │   │   └── AuthController.java
│   │   │   ├── common/
│   │   │   │   └── SearchMovieController.java
│   │   │   ├── rental/
│   │   │   │   └── RentalController.java
│   │   │   └── user/
│   │   │       ├── UserProfileController.java
│   │   │       ├── UserReviewController.java
│   │   │       └── WatchlistController.java
│   │   ├── dto/
│   │   │   ├── request/
│   │   │   └── response/
│   │   ├── entity/
│   │   ├── repository/
│   │   ├── scheduler/
│   │   │   └── RentalScheduler.java
│   │   ├── security/
│   │   │   ├── CustomUserDetails.java
│   │   │   ├── CustomUserDetailsService.java
│   │   │   ├── JwtFilter.java
│   │   │   └── JwtUtil.java
│   │   ├── service/
│   │   │   └── impl/
│   │   ├── stripe/
│   │   │   └── StripeService.java
│   │   └── MovieRentalAndReviewPlatformApplication.java
│   └── resources/
│       ├── static/               ← frontend files
│       │   ├── index.html
│       │   ├── css/
│       │   └── js/
│       └── application.properties
```

---

## 🚀 Getting Started

### Prerequisites
- Java 21+
- Maven 3.8+
- MySQL 8.0+
- IntelliJ IDEA (recommended)
- Stripe account (test mode)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/movie-rental-and-review-platform.git
cd movie-rental-and-review-platform
```

### 2. Create the Database
```sql
CREATE DATABASE movie_rental_db;
```

### 3. Configure `application.properties`
Create `src/main/resources/application.properties` and add:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/movie_rental_db
spring.datasource.username=your_mysql_username
spring.datasource.password=your_mysql_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

jwt.secret=your_very_long_secret_key_at_least_32_characters
stripe.secret.key=sk_test_your_stripe_secret_key
stripe.rental.price=299
```

> ⚠️ Never commit `application.properties` to GitHub. It is listed in `.gitignore`.

### 4. Run the Application
```bash
mvn spring-boot:run
```

Or run `MovieRentalAndReviewPlatformApplication.java` directly from IntelliJ.

### 5. Access the Application
```
Main Site   → http://localhost:8080/index.html
Sign In     → http://localhost:8080/signin_page.html
Sign Up     → http://localhost:8080/signup_page.html
```

---

## 🔑 Default Admin Account

The admin account is auto-created on first startup via `DataInitializer`:

```
Username : Admin
Email    : admin@cinenest.com
Password : admin123
```

> ⚠️ Change these credentials before deploying to production.

---

## 📡 API Endpoints

### Auth
```
POST /api/auth/signup         → Register new user
POST /api/auth/signin         → Sign in (returns JWT)
```

### Admin — Movies
```
GET    /api/admin/movies/get-all-movies       → List all movies
POST   /api/admin/movies/add-movie            → Add new movie
PUT    /api/admin/movies/update-movie         → Update movie
DELETE /api/admin/movies/delete-movie/{id}    → Delete movie
```

### Admin — Users
```
GET    /api/admin/users                       → List all users
GET    /api/admin/users/search?email=...      → Search user
DELETE /api/admin/users/{id}                  → Delete user
```

### Admin — Categories
```
GET    /api/admin/categories/get-all-categories    → List categories
POST   /api/admin/categories/add-category          → Add category
PUT    /api/admin/categories/update-category       → Update category
DELETE /api/admin/categories/delete-category/{id}  → Delete category
```

### Common — Movies (Public)
```
GET /api/common/movies/get-all-movies              → Browse all movies
GET /api/common/movies/{id}                        → Get movie details
GET /api/common/movies/search-by-title?title=...  → Search by title
GET /api/common/movies/search-by-category/{id}    → Filter by category
GET /api/common/movies/search-by-year/{year}      → Filter by year
GET /api/common/movies/{id}/reviews               → Get movie reviews
```

### User — Rentals
```
POST /api/user/rentals                  → Rent a movie (Stripe payment)
PUT  /api/user/rentals/{id}/return      → Return a movie
GET  /api/user/rentals/active           → View active rentals
GET  /api/user/rentals/history          → View watch history
```

### User — Profile
```
GET /api/user/profile                         → View profile
PUT /api/user/profile                         → Update profile
PUT /api/user/profile/update-password         → Update password
```

### User — Watchlist
```
GET    /api/user/watchlist                         → View watchlist
POST   /api/user/watchlist/add-movie/{movieId}     → Add movie
DELETE /api/user/watchlist/remove-movie/{movieId}  → Remove movie
```

### User — Reviews
```
POST   /api/user/reviews/add-review           → Add review
PUT    /api/user/reviews/update-review        → Update review
DELETE /api/user/reviews/delete-review/{id}   → Delete review
```

---

## 💳 Payment Testing

This project uses **Stripe in test mode**. No real money is charged.

**Test card details:**
```
Card Number  : 4242 4242 4242 4242
Expiry       : 12/26
CVC          : 123
```

**Generate a test payment method via Postman:**
```
POST https://api.stripe.com/v1/payment_methods
Authorization: Bearer sk_test_your_key

Body (x-www-form-urlencoded):
type         = card
card[token]  = tok_visa
```

---

## 🔒 Security

- All passwords are hashed using **BCrypt**
- JWT tokens expire after **24 hours**
- Admin accounts can only be created server-side — never through the signup endpoint
- `application.properties` is excluded from version control
- Spring Security enforces role-based access on every API endpoint

---

## 🗓️ Scheduled Tasks

| Task | Schedule |
|------|----------|
| Auto-return overdue rentals | Every day at midnight |

Rentals not manually returned by the user are automatically marked as `RETURNED` when the due date passes.

---

## 📖 OOP Concepts Applied

| Concept | Where Used |
|---------|------------|
| **Encapsulation** | All entity classes with private fields and getters/setters |
| **Inheritance** | `UserServiceImpl` implements `UserService` interface |
| **Polymorphism** | Service interfaces with multiple possible implementations |
| **Abstraction** | Service layer abstracts business logic from controllers |

---

## 👥 Team

| Member                | Component                   |
|-----------------------|-----------------------------|
| Amindu Umayanga       | User & Admin Management     |
| Dilip Charuka         | Rental & Payment Management |
| Pasindu Jayasinghe    | Review & Rating Management  |
| Janith Rajapaksha     | Watchlist Management        |
| Savindu Udara         | Movie Management            |
| Janithi Liyanarachchi | Category Management         |

---

## 📄 License

This project is developed for academic purposes as part of the **SE1020 – Object Oriented Programming** module at **SLIIT**.

---

<div align="center">
  Built with ❤️ by the CineNest Team · SLIIT
</div>
