# ResourceHub — Use Case Analysis
<img width="1024" height="592" alt="ww" src="https://github.com/user-attachments/assets/7e6fa2d4-c6ef-491a-99fc-43d3b310fb22" />

## Actors

- **Unauthenticated User (Guest)**: A user who has not logged in. Can only access the login and registration pages.  
- **Authenticated User**: A registered user who has successfully logged into the system. This is the primary actor for all core functionalities, including creating, commenting on, and liking resources.

---

## Use Case Scenarios

### UC1: Register New Account
- **Actor**: Unauthenticated User  
- **Precondition**: The user is not logged in and is on the application's landing page.  

**Flow of Events**:
1. User clicks the "Register" link.  
2. Frontend displays a registration form (Username, Email, Password).  
3. User fills in the form and submits.  
4. Frontend validates input (email format, password strength).  
5. Frontend sends `POST /api/users/register` with the form data.  
6. Backend processes request:
   - Validates username and email uniqueness.  
   - Hashes password securely.  
   - Persists new User record (`id`, `username`, `email`, `password_hash`, `createdAt`).  
7. Backend returns `201 Created`.  
8. Frontend displays success message and redirects to login page.  

**Alternative Flow (A)**: Validation fails (e.g., username taken, invalid email)  
- Backend returns `4xx` (e.g., `409 Conflict`, `400 Bad Request`) with a message.  
- Frontend shows error without redirecting.  

**Postcondition**: New user account created.

---

### UC2: Login
- **Actor**: Unauthenticated User  
- **Precondition**: User is on the login page.  

**Flow of Events**:
1. User enters username and password, clicks "Login".  
2. Frontend sends `POST /api/auth/login` with credentials.  
3. Backend processes request:
   - Finds user by username.  
   - Compares password with stored hash.  
   - If valid, generates `AuthToken` (`id`, `token`, `expiresAt`, `userId`) and returns it.  
4. AuthToken is stored (HTTP-only cookie or frontend storage).  
5. Frontend redirects user to dashboard/resource feed.  

**Alternative Flow (A)**: Invalid credentials  
- Backend returns `401 Unauthorized`.  
- Frontend displays "Invalid login credentials".  

**Postcondition**: User is authenticated; AuthToken session is active.

---

### UC3: Create New Resource
- **Actor**: Authenticated User  
- **Precondition**: User is logged in and on resource creation page.  

**Flow of Events**:
1. User navigates to "Create Resource" page.  
2. Frontend displays form (Title, Description, URL or upload).  
3. User fills in form and submits.  
4. Frontend validates input.  
5. Frontend sends `POST /api/resources` with resource data and AuthToken in header.  
6. Backend:
   - Validates AuthToken.  
   - Validates resource data.  
   - Creates new `Resource` (`id`, `title`, `description`, `url`, `userId`).  
7. Backend returns `201 Created` with resource data.  
8. Frontend shows success and redirects to resource view/list.  

**Alternative Flow (A)**: Validation fails  
- Backend returns `400 Bad Request` with message.  
- Frontend displays error.  

**Postcondition**: New resource created and linked to user.

---

### UC4: Comment on a Resource
- **Actor**: Authenticated User  
- **Precondition**: User is logged in and viewing a specific resource.  

**Flow of Events**:
1. User scrolls to comment section.  
2. User types comment and clicks "Post Comment".  
3. Frontend sends `POST /api/resources/{resourceId}/comments` with `{ "text": "..." }` and AuthToken.  
4. Backend:
   - Validates AuthToken.  
   - Validates `resourceId`.  
   - Creates new `Comment` (`id`, `text`, `createdAt`, `updatedAt`, `resourceId`, `userId`).  
5. Backend returns `201 Created`.  
6. Frontend updates UI to show new comment.  

**Alternative Flow (A)**: Empty comment or invalid resource  
- Backend returns `400 Bad Request` or `404 Not Found`.  
- Frontend shows error.  

**Postcondition**: Comment added to resource.

---

### UC5: Like a Resource
- **Actor**: Authenticated User  
- **Precondition**: User is logged in and viewing a resource they haven't liked.  

**Flow of Events**:
1. User clicks "Like".  
2. Frontend sends `POST /api/resources/{resourceId}/likes` with AuthToken.  
3. Backend:
   - Validates AuthToken.  
   - Validates `resourceId`.  
   - Checks if user already liked resource.  
   - If not, inserts new `Like` (`id`, `resourceId`, `userId`, optional order).  
4. Backend returns `200 OK` or `201 Created`.  
5. Frontend updates UI (like counter, button state).  

**Alternative Flow (A)**: User already liked  
- Backend returns `409 Conflict` or `200 OK`.  
- Frontend may show message or do nothing.  

**Alternative Flow (B)**: Resource does not exist  
- Backend returns `404 Not Found`.  
- Frontend displays error.  

**Postcondition**: Resource marked as liked by user; like count updated.
