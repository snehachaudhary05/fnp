

# **Xeno Shopify Dashboard – Backend**

## **Overview**

This is the **backend** of the Xeno Shopify Dashboard. Built with **Node.js** and **Express**, it provides REST APIs for managing users, orders, products, and customers. The backend integrates with **Shopify via webhooks**, stores data in **MySQL**, and secures user sessions using **JWT authentication**.

---

## **Setup Instructions**

1. **Clone the repository**

```bash
git clone https://github.com/snehachaudhary05/fnp.git
cd fnp
```

2. **Install dependencies**

```bash
npm install
```

3. **Create a `.env` file** in the root directory with the following variables:

```
PORT=5000
DB_HOST=<database-host>
DB_USER=<db-username>
DB_PASSWORD=<db-password>
DB_NAME=<db-name>
JWT_SECRET=<your-secret-key>
SHOPIFY_API_KEY=<shopify-api-key>
SHOPIFY_API_SECRET=<shopify-api-secret>
```

4. **Start the development server**

```bash
npm run dev
```

* The backend will run on `http://localhost:5000` (or your configured PORT).
* Ensure MySQL is running and accessible with the credentials provided.

---

## **Architecture Diagram**

```
[Frontend (React)] <--> [Backend (Node.js/Express)] <--> [MySQL Database]
                  |
                  v
            [Shopify Webhooks]
```

*Frontend communicates with backend APIs, backend interacts with database and Shopify webhooks for real-time updates.*

---

## **API Endpoints**

### **Auth**

| Method | Endpoint           | Body                | Description             |
| ------ | ------------------ | ------------------- | ----------------------- |
| POST   | /api/auth/register | { email, password } | Register new user       |
| POST   | /api/auth/login    | { email, password } | User login, returns JWT |

### **Orders**

| Method | Endpoint         | Body            | Description           |
| ------ | ---------------- | --------------- | --------------------- |
| GET    | /api/orders      | -               | Fetch all orders      |
| POST   | /api/orders      | { orderData }   | Add a new order       |
| PUT    | /api/orders/\:id | { updatedData } | Update existing order |
| DELETE | /api/orders/\:id | -               | Delete an order       |

### **Products**

| Method | Endpoint           | Body            | Description             |
| ------ | ------------------ | --------------- | ----------------------- |
| GET    | /api/products      | -               | Fetch all products      |
| POST   | /api/products      | { productData } | Add a new product       |
| PUT    | /api/products/\:id | { updatedData } | Update existing product |
| DELETE | /api/products/\:id | -               | Delete a product        |

### **Customers**

| Method | Endpoint            | Body             | Description              |
| ------ | ------------------- | ---------------- | ------------------------ |
| GET    | /api/customers      | -                | Fetch all customers      |
| POST   | /api/customers      | { customerData } | Add a new customer       |
| PUT    | /api/customers/\:id | { updatedData }  | Update existing customer |
| DELETE | /api/customers/\:id | -                | Delete a customer        |

---

## **Database Schema (MySQL)**

**AppUser**

| Column   | Type         | Constraints        |
| -------- | ------------ | ------------------ |
| id       | INT          | PK, Auto Increment |
| email    | VARCHAR(255) | UNIQUE, NOT NULL   |
| password | VARCHAR(255) | NOT NULL           |
| tenantId | VARCHAR(255) | NOT NULL           |

**Order**

| Column     | Type         | Constraints        |
| ---------- | ------------ | ------------------ |
| id         | INT          | PK, Auto Increment |
| tenantId   | VARCHAR(255) | NOT NULL           |
| shopifyId  | VARCHAR(255) | NOT NULL           |
| totalPrice | FLOAT        | NOT NULL           |
| currency   | VARCHAR(10)  |                    |
| orderDate  | DATETIME     | NOT NULL           |

**Product**

| Column   | Type         | Constraints        |
| -------- | ------------ | ------------------ |
| id       | INT          | PK, Auto Increment |
| tenantId | VARCHAR(255) | NOT NULL           |
| name     | VARCHAR(255) | NOT NULL           |
| price    | FLOAT        | NOT NULL           |
| stock    | INT          |                    |

**Customer**

| Column   | Type         | Constraints        |
| -------- | ------------ | ------------------ |
| id       | INT          | PK, Auto Increment |
| tenantId | VARCHAR(255) | NOT NULL           |
| name     | VARCHAR(255) | NOT NULL           |
| email    | VARCHAR(255) | UNIQUE             |

---

## **Known Limitations / Assumptions**

* Assumes **Shopify API credentials** are valid and webhooks are configured correctly.
* JWT tokens expire, requiring refresh for long sessions.
* Currently supports **REST APIs** only; GraphQL is not implemented.
* Error handling exists but may need refinement for edge cases like Shopify rate limits.
* Supports **single tenantId per user** for simplicity.
* MySQL must be running and accessible; migrations are not automated.


