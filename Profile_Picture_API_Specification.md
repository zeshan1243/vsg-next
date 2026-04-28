# KoreTask — Profile Picture API Specification for Frontend

Complete API reference for implementing profile picture upload and display. Covers the upload endpoint, signed URL handling, and how profile pictures appear in API responses.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Upload Profile Picture](#2-upload-profile-picture)
3. [How Profile Pictures Appear in Responses](#3-how-profile-pictures-appear-in-responses)
4. [Display Logic](#4-display-logic)
5. [Error Handling](#5-error-handling)
6. [Type Definitions (TypeScript)](#6-type-definitions-typescript)
7. [Integration Checklist](#7-integration-checklist)

---

## 1. Overview

Profile pictures are stored in **Google Cloud Storage (GCS)**. The database stores only the relative path (e.g., `profile-pictures/user_1/abc123.jpg`), never the full URL. When the frontend needs to display an image, the backend generates a **time-limited signed URL** that expires after 1 hour.

### Key concepts

| Concept | Value |
|---|---|
| Storage | Google Cloud Storage (`koretask` bucket) |
| Max file size | 5 MB |
| Allowed types | JPEG (`image/jpeg`), PNG (`image/png`), WebP (`image/webp`) |
| Signed URL expiry | 1 hour |
| DB field | `user_tbl.picture_url` (relative path or external URL) |

### Two types of picture URLs

| Type | Example | How it's handled |
|---|---|---|
| **GCS path** (uploaded via our API) | `profile-pictures/user_1/abc123.jpg` | Backend generates a signed URL |
| **External URL** (set via profile update) | `https://cdn.example.com/avatar.jpg` | Used as-is — no signing needed |

---

## 2. Upload Profile Picture

### `POST /api/auth/profile/picture`

Upload an image file. The backend stores it in GCS and updates the user's `pictureUrl`.

**Authentication:** Required (any authenticated user)

**Request:** `multipart/form-data`

```
Content-Type: multipart/form-data
Authorization: Bearer <JWT>

Field: picture (file)
```

**Example (JavaScript):**

```javascript
async function uploadProfilePicture(file) {
  const formData = new FormData();
  formData.append('picture', file);

  const response = await fetch('/api/auth/profile/picture', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
      // Do NOT set Content-Type — browser sets it with boundary automatically
    },
    body: formData,
  });

  return response.json();
}

// Usage with file input
const input = document.querySelector('input[type="file"]');
input.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const result = await uploadProfilePicture(file);
    if (result.success) {
      // Update avatar display immediately
      document.querySelector('.avatar').src = result.signedUrl;
    }
  }
});
```

**Success response (200):**

```json
{
  "success": true,
  "pictureUrl": "profile-pictures/user_1/ea1689e6d35b4c6a8e60e09300dff921.jpg",
  "signedUrl": "https://storage.googleapis.com/koretask/profile-pictures/user_1/ea1689e6...?X-Goog-Algorithm=...&X-Goog-Expires=3600&X-Goog-Signature=..."
}
```

| Field | Type | Notes |
|---|---|---|
| `success` | `boolean` | `true` on successful upload |
| `pictureUrl` | `string` | Relative GCS path — stored in DB (do not use for display) |
| `signedUrl` | `string` | Time-limited URL — use this for immediate display |

**After upload:** Update the avatar in the UI using `signedUrl` immediately. The next login or profile fetch will also include the updated `signedUrl`.

**Error responses:**

| Status | Detail | Cause |
|---|---|---|
| `400` | `"Only image/jpeg, image/png, image/webp images are accepted."` | Wrong file type |
| `400` | `"File size exceeds 5 MB limit."` | File too large |
| `401` | `"Not authenticated"` | Missing or expired JWT |

---

## 3. How Profile Pictures Appear in Responses

Every API response that includes user data now returns two picture fields:

```json
{
  "user": {
    "id": 1,
    "email": "client@test.com",
    "pictureUrl": "profile-pictures/user_1/abc123.jpg",
    "signedUrl": "https://storage.googleapis.com/koretask/profile-pictures/user_1/abc123.jpg?X-Goog-Algorithm=...",
    ...
  }
}
```

| Field | What it is | Use for display? |
|---|---|---|
| `pictureUrl` | Relative path stored in DB | **No** — this is the storage reference |
| `signedUrl` | Time-limited HTTPS URL | **Yes** — use this in `<img src>` |

### Endpoints that return these fields

| Endpoint | Where to find |
|---|---|
| `POST /api/auth/login` | `response.user.signedUrl` |
| `GET /api/auth/profile` | `response.data.signedUrl` |
| `POST /api/admin/users` (list) | Each user in `response.data[].signedUrl` |
| `GET /api/admin/users/{userId}` | `response.data.signedUrl` |
| `POST /api/auth/profile/picture` | `response.signedUrl` (immediate use after upload) |

### When `signedUrl` is null

| Scenario | `pictureUrl` | `signedUrl` |
|---|---|---|
| No picture uploaded | `null` | `null` |
| GCS picture uploaded | `"profile-pictures/..."` | `"https://storage.googleapis.com/..."` |
| External URL set via profile update | `"https://cdn.example.com/..."` | `"https://cdn.example.com/..."` (same — not signed) |

---

## 4. Display Logic

### Recommended avatar component

```javascript
function getAvatarUrl(user) {
  // 1. Use signedUrl if available (GCS or external)
  if (user.signedUrl) return user.signedUrl;

  // 2. Fallback to pictureUrl if it's an external URL
  if (user.pictureUrl && user.pictureUrl.startsWith('https://')) {
    return user.pictureUrl;
  }

  // 3. No picture — return null (show initials or default avatar)
  return null;
}
```

### React example

```jsx
function Avatar({ user, size = 40 }) {
  const url = getAvatarUrl(user);

  if (!url) {
    // Show initials
    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
    return (
      <div className="avatar-initials" style={{ width: size, height: size }}>
        {initials || '?'}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={`${user.firstName} ${user.lastName}`}
      width={size}
      height={size}
      className="avatar"
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
}
```

### Signed URL expiry handling

Signed URLs expire after **1 hour**. If the user keeps the page open longer:

- **Lazy approach:** The image will fail to load after expiry. On next page refresh or API call, a fresh signed URL is returned.
- **Proactive approach:** Re-fetch the profile every 50 minutes to get a fresh signed URL before the current one expires.

For most use cases, the lazy approach is fine — users rarely stare at a profile picture for over an hour without any navigation.

---

## 5. Error Handling

### Upload errors

| Status | Detail | Frontend action |
|---|---|---|
| `400` | Wrong file type | Show: *"Please upload a JPEG, PNG, or WebP image."* |
| `400` | File too large | Show: *"Image must be under 5 MB."* |
| `401` | Not authenticated | Redirect to login |

### Display errors

If an `<img>` tag fails to load (e.g., expired signed URL or network error):
- Hide the broken image icon
- Show the initials fallback
- On next API call, a fresh `signedUrl` will be returned

---

## 6. Type Definitions (TypeScript)

```typescript
// ─── Upload ──────────────────────────────────────────────────────────────────

interface UploadProfilePictureResponse {
  success: boolean;
  pictureUrl: string;    // relative GCS path (stored in DB)
  signedUrl: string;     // time-limited URL (use for display)
}

// ─── User Response (updated) ─────────────────────────────────────────────────

interface UserResponse {
  id: number;
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  mobilePhone: string | null;
  companyName: string | null;
  pictureUrl: string | null;     // relative path or external URL (do not display directly)
  signedUrl: string | null;      // time-limited URL or external URL (USE THIS for <img src>)
  emailVerified: boolean;
  role: string | null;
  appRoles: string | null;
  active: boolean | null;
  approved: boolean | null;
  createdAt: string | null;
  lastLoginAt: string | null;
  sessionTimeoutHours: number | null;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Get the displayable avatar URL from a user object.
 * Returns null if no picture is set.
 */
function getAvatarUrl(user: UserResponse): string | null {
  if (user.signedUrl) return user.signedUrl;
  if (user.pictureUrl?.startsWith('https://')) return user.pictureUrl;
  return null;
}
```

---

## 7. Integration Checklist

### Profile picture upload (settings page)

- [ ] Add file input (`accept="image/jpeg,image/png,image/webp"`)
- [ ] Validate file size client-side before upload (< 5 MB)
- [ ] Show image preview before upload
- [ ] Call `POST /api/auth/profile/picture` with `FormData`
- [ ] Do NOT set `Content-Type` header manually — let the browser set it with the boundary
- [ ] On success — update avatar display using `signedUrl` from response
- [ ] On `400` (wrong type) — show *"Please upload a JPEG, PNG, or WebP image."*
- [ ] On `400` (too large) — show *"Image must be under 5 MB."*

### Avatar display (all pages)

- [ ] Use `signedUrl` from user response for `<img src>`
- [ ] If `signedUrl` is `null` — show initials or default avatar
- [ ] Add `onError` handler on `<img>` to fallback to initials
- [ ] Profile picture appears in: header/nav, profile page, settings page, admin user list

### Admin user list

- [ ] Each user in the list has `signedUrl` — display as avatar thumbnail
- [ ] If `null` — show initials

---

## Quick Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/profile/picture` | JWT | Upload profile picture (multipart/form-data) |
| `PUT` | `/api/auth/profile` | JWT | Update pictureUrl via JSON (for external URLs) |
| `GET` | `/api/auth/profile` | JWT | Get profile with signedUrl |
