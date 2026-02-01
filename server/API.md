# Albania Guide API (Postman Manual Test)

Base URL:
- `http://localhost:3000`

## Auth

### Register
- `POST /auth/register`
- Body (JSON):
  - `email` (string, required)
  - `password` (string, required)
  - `name` (string, optional)

Example:
```json
{
  "email": "test@example.com",
  "password": "Password123!",
  "name": "Test User"
}
```

Response:
- `201` -> `{ token, user }`

### Login
- `POST /auth/login`
- Body (JSON):
  - `email` (string, required)
  - `password` (string, required)

Response:
- `200` -> `{ token, user }`

## Health

### API Health
- `GET /health`

### DB Health
- `GET /health/db`

## Users (Bearer Token required)

Add header:
- `Authorization: Bearer <token>`

Admin notes:
- Admin is determined by `is_admin=true` on the user record.
- You can seed a superuser by setting `SUPERUSER_EMAIL` and `SUPERUSER_PASSWORD` in `.env` (see `.env.example`).

### Get Me
- `GET /users/me`

### Get Users
- `GET /users`
- Admin only

### Get User By Id
- `GET /users/:id`

### Create User
- `POST /users`
- Admin only
- Body (JSON):
  - `email` (string, required)
  - `password` (string, required)
  - `name` (string, optional)
  - `is_admin` (boolean, optional)

### Update User By Id
- `PUT /users/:id`
- Bearer token required
- Body (JSON) (all optional):
  - `email` (string)
  - `name` (string)
  - `password` (string)
  - `is_admin` (boolean)

### Delete User By Id
- `DELETE /users/:id`
- Admin only

## Packages

### List Packages (Public)
- `GET /packages`

### Get Package By Slug (Public)
- `GET /packages/slug/:slug`

### Get Package By Id
- `GET /packages/:id`

### List Packages (Admin)
- `GET /admin/packages`
- Admin only

### Create Package (Admin)
- `POST /admin/packages`
- Admin only
- Body (JSON):
  - `destination_id` (uuid, required)
  - `title` (string, required)
  - `slug` (string, optional)
  - `description` (string, optional)
  - `highlights` (string, optional)
  - `duration_days` (integer, optional)
  - `price_cents` (integer, optional)
  - `currency` (string, optional)
  - `max_group_size` (integer, optional)
  - `cover_image_path` (string, optional)
  - `gallery_image_paths` (string[], optional)
  - `is_active` (boolean, optional)

### Update Package (Admin)
- `PUT /admin/packages/:id`
- Admin only

### Delete Package (Admin)
- `DELETE /admin/packages/:id`
- Admin only

## Package Availability

### List Availability For Package (Public)
- `GET /packages/:packageId/availability`

### List Availability For Package (Admin)
- `GET /admin/packages/:packageId/availability`
- Admin only

### Upsert Availability Row (Admin)
- `POST /admin/packages/:packageId/availability`
- Admin only
- Body (JSON):
  - `available_date` (date, required)
  - `capacity` (integer, required)
  - `is_open` (boolean, optional)

### Update Availability Row (Admin)
- `PUT /admin/availability/:id`
- Admin only
- Body (JSON):
  - `capacity` (integer, optional)
  - `remaining` (integer, optional)
  - `is_open` (boolean, optional)

### Delete Availability Row (Admin)
- `DELETE /admin/availability/:id`
- Admin only

## Bookings

### Create Booking (Public)
- `POST /bookings`
- Notes:
  - Guest booking is allowed.
  - To prevent duplicate submissions, send an idempotency key.
- Optional headers:
  - `Authorization: Bearer <token>`
  - `Idempotency-Key: <unique-key>`
- Body (JSON):
  - `package_id` (uuid, required)
  - `booking_date` (date, required)
  - `traveler_adults` (integer, optional)
  - `traveler_children` (integer, optional)
  - `guest_email` (string, optional)
  - `guest_name` (string, optional)
  - `notes` (string, optional)

### List My Bookings
- `GET /bookings/me`
- Bearer token required

### List Bookings (Admin)
- `GET /admin/bookings`
- Admin only

### Update Booking Status (Admin)
- `PUT /admin/bookings/:id`
- Admin only
- Body (JSON):
  - `status` (string, required)

## Favorites

### List My Favorites
- `GET /favorites`
- Bearer token required

### Toggle Favorite
- `POST /favorites/toggle`
- Bearer token required
- Body (JSON):
  - `package_id` (uuid, required)

## Reviews

### List Reviews By Package (Public)
- `GET /packages/:packageId/reviews`

### Create Review
- `POST /reviews`
- Bearer token required
- Body (JSON):
  - `booking_id` (uuid, required)
  - `rating` (integer 1-5, required)
  - `title` (string, optional)
  - `body` (string, optional)

### Sign Review Image Upload
- `POST /reviews/:reviewId/images/sign`
- Bearer token required
- Body (JSON):
  - `ext` (string, required)
  - `contentType` (string, required)

### Register Review Image
- `POST /reviews/:reviewId/images`
- Bearer token required
- Body (JSON):
  - `path` (string, required)

### List Reviews (Admin)
- `GET /admin/reviews`
- Admin only

### Update Review Moderation (Admin)
- `PUT /admin/reviews/:id`
- Admin only
- Body (JSON):
  - `moderation_status` (string, required)

## Admin Workflows

### Packages + Availability
1. Create or select a destination (Admin Destinations).
2. Create a package (`POST /admin/packages`) and keep `is_active=false` until ready.
3. Add availability rows for the package (`POST /admin/packages/:packageId/availability`).
4. Set the package to `is_active=true` (`PUT /admin/packages/:id`).
5. Verify public listing and details:
   - `GET /packages`
   - `GET /packages/slug/:slug`
   - `GET /packages/:packageId/availability`

### Bookings
1. Create a booking (guest or logged-in) with `POST /bookings`.
2. If you suspect double-submits, re-send the same request with the same `Idempotency-Key` header.
3. Verify the user booking history: `GET /bookings/me`.
4. Admin can view and update bookings:
   - `GET /admin/bookings`
   - `PUT /admin/bookings/:id`

### Favorites
1. As a logged-in user, toggle favorite with `POST /favorites/toggle`.
2. Confirm favorites list: `GET /favorites`.

### Reviews + Moderation
1. Ensure the booking is eligible (typically completed, one review per booking).
2. Create a review: `POST /reviews`.
3. (Optional) Upload review images:
   - `POST /reviews/:reviewId/images/sign` -> client uploads to storage using signed URL
   - `POST /reviews/:reviewId/images` -> register path
4. Admin moderates reviews:
   - `GET /admin/reviews`
   - `PUT /admin/reviews/:id`

## Edge-Case Checklist

- **[Public visibility]** Inactive packages should not appear in `GET /packages`.
- **[Destination visibility dependency]** If a destination is inactive, its packages should not be publicly visible.
- **[Availability closed]** `is_open=false` or `remaining<=0` should block new bookings.
- **[Overbooking protection]** Concurrent booking attempts should not drive `remaining` below 0.
- **[Idempotency]** Replaying a booking request with the same `Idempotency-Key` must not create duplicates.
- **[Guest booking throttling]** `POST /bookings` is rate-limited (verify 429 behavior after repeated requests).
- **[Favorites uniqueness]** Favoriting the same package twice should not create duplicates.
- **[Review eligibility]** User must not be able to review someone else’s booking or review the same booking twice.
- **[Review moderation]** Public review listing should only show `approved` reviews.
- **[Media access]** Signed URLs should be generated server-side and should expire.
