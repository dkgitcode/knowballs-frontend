# Question History Feature 📝

This feature automatically saves questions and answers to the Supabase database for authenticated users. This allows users to review their past interactions and continue conversations where they left off.

## How It Works 🔄

1. When a user submits a question, the answer is generated as usual
2. After the answer is displayed, the question and answer are saved to Supabase
3. The saving process happens in the background and doesn't block the main functionality
4. Users can view their history through the API endpoint

## API Endpoints 🚀

### Save Question History

```
POST /api/history/save
```

**Request Body:**
```json
{
  "prompt": "What is JavaScript?",
  "answer": "JavaScript is a programming language...",
  "mode": "answer" // or "visualizer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Question history saved successfully",
  "data": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "prompt": "What is JavaScript?",
      "answer": "JavaScript is a programming language...",
      "mode": "answer",
      "created_at": "2023-03-15T12:00:00.000Z"
    }
  ]
}
```

### Get Question History

```
GET /api/history?limit=10&page=1
```

**Query Parameters:**
- `limit` (optional): Number of items per page (default: 10)
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "prompt": "What is JavaScript?",
      "answer": "JavaScript is a programming language...",
      "mode": "answer",
      "created_at": "2023-03-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

## Database Schema 🗄️

The feature uses a `question_history` table in Supabase with the following schema:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| prompt | TEXT | The user's question |
| answer | TEXT | The generated answer |
| mode | TEXT | Either "answer" or "visualizer" |
| created_at | TIMESTAMP | When the record was created |
| metadata | JSONB | Additional data (optional) |

## Security 🔒

- Row Level Security (RLS) policies ensure users can only access their own history
- Authentication is required for all history-related operations
- The API validates user authentication before any database operations

## Setup Instructions 🛠️

1. Run the SQL script in `docs/supabase-setup.sql` in your Supabase SQL Editor
2. The feature will automatically work for authenticated users

## Future Enhancements 🚀

Potential future enhancements for this feature:
- Add ability to star/favorite specific Q&A pairs
- Implement search functionality for history
- Allow users to organize history into folders/categories
- Add ability to continue a conversation from history 