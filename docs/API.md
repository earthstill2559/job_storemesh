# StoreMesh API

Base URL:

```text
http://127.0.0.1:8000/api
```

Authenticated requests use:

```text
Authorization: Bearer <access_token>
```

## Authentication

### Register

`POST /auth/register/`

```json
{
  "username": "buyer1",
  "email": "buyer1@example.com",
  "password": "strong-password-123",
  "role": "buyer"
}
```

Returns `access`, `refresh`, and `user`.

### Login

`POST /auth/login/`

```json
{
  "email": "buyer1@example.com",
  "password": "strong-password-123"
}
```

### Current User

`GET /auth/me/`

## Products

### List Products

`GET /products/`

Optional query parameters:

- `search`
- `min_price`
- `max_price`
- `in_stock=true`
- `mine=true` for seller-owned listings

### Create Product

`POST /products/`

Seller only. Use `multipart/form-data`.

Fields:

- `title`
- `description`
- `unit_price`
- `quantity`
- `image`

### Update Product

`PATCH /products/{id}/`

Seller owner only.

### Delete Product

`DELETE /products/{id}/`

Seller owner only.

## Orders

### Checkout

`POST /orders/`

Buyer only.

```json
{
  "items": [
    { "product_id": 1, "quantity": 2 }
  ]
}
```

Creates an order and decrements inventory inside a database transaction.

### List Orders

`GET /orders/`

- Buyer sees their own orders.
- Seller sees orders containing their sold items.
