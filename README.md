# StoreMesh StoreFront Management System

Full-stack assignment implementation using the requested stack:

- Backend: Python, Django, Django REST Framework
- Frontend: React.js with TypeScript
- Database: PostgreSQL
- Tests: Django REST Framework API tests

## Features

- Register and login as `seller` or `buyer`
- JWT authentication
- Role-based access control
- Seller product listing CRUD with image upload
- Buyer marketplace browsing with search, price, and stock filters
- Product detail view
- Buyer cart and checkout
- Order placement with inventory decrement
- Buyer and seller order history
- ER diagram and API documentation

## Project Structure

```text
backend/
  manage.py
  requirements.txt
  storefront/
  apps/
    accounts/
    catalog/
    orders/
frontend/
  package.json
  src/
docs/
  ERD.md
  API.md
```

## Backend Setup

Install Python 3.11+ first. Then run:

```bash
docker compose up -d postgres
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

PostgreSQL defaults are defined in `docker-compose.yml` and `backend/.env.example`:

```text
POSTGRES_DB=storemesh
POSTGRES_USER=storemesh
POSTGRES_PASSWORD=storemesh_password
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
```

Backend API:

```text
http://127.0.0.1:8000/api/
```

Run backend tests:

```bash
cd backend
python manage.py test
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend app:

```text
http://127.0.0.1:5173
```

Create a `.env` file in `frontend/` when needed:

```text
VITE_API_URL=http://127.0.0.1:8000/api
```

## Documentation

- ER diagram: [docs/ERD.md](docs/ERD.md)
- API documentation: [docs/API.md](docs/API.md)
