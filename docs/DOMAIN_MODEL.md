# ResourceHub — Core Domain Model

The core domain revolves around user management, resources, and interactions. The main entities are:

- **User**: The central actor. All content and interactions are owned and scoped to a specific user.
- **Resource**: Represents a piece of content (e.g., an article, a video, an image).
- **Comment**: A user-generated textual response to a resource.
- **Like**: A user's positive endorsement of a resource.
- **AuthToken**: Represents a valid session for an authenticated user.

The following diagram illustrates the relationships between these entities:  
<img width="866" height="672" alt="image" src="https://github.com/user-attachments/assets/2d046a3c-ff6d-457e-97cd-bfb1bb8fdd60" />


---

## Key Relationships Explained

- **User → AuthToken (One-to-Many)**  
  A single User can have many active AuthToken sessions (e.g., logged in on multiple devices). Each AuthToken belongs to exactly one User.

- **User → Resource (One-to-Many)**  
  A User creates or uploads many Resource objects. Each Resource is owned by a single User.

- **User → Comment (One-to-Many)**  
  A User can post many Comment objects. Each Comment is associated with a single User.

- **User → Like (One-to-Many)**  
  A User can express many Like objects. Each Like is associated with a single User.

- **Resource → Comment (One-to-Many)**  
  A single Resource can have many Comment objects. Each Comment is posted on exactly one Resource.

- **Resource → Like (One-to-Many)**  
  A single Resource can receive many Like objects. Each Like is directed towards exactly one Resource.

---

## Entity Attributes

### User
- `id` (Primary Key)  
- `username`  
- `email`  
- `password`  
- `createdAt`  

### Resource
- `id` (PK)  
- `title`  
- `description`  
- `url`  
- `userId` (FK to User)  

### Comment
- `id` (PK)  
- `text`  
- `createdAt`  
- `updatedAt`  
- `resourceId` (FK to Resource)  
- `userId` (FK to User)  

### Like
- `id` (PK)  
- `isUpvote` (true = like, false = dislike)  
- `resourceId` (FK to Resource)  
- `userId` (FK to User)  

### AuthToken
- `id` (PK)  
- `token`  
- `expiresAt`  
- `userId` (FK to User)  

---

This model ensures data isolation between users and provides a flexible structure for managing content and user interactions within the application.
