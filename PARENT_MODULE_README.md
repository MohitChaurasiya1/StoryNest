# StoryNest - Parent Module Documentation

## 1. Overview and Functionality
The Parent Module is a comprehensive section of the StoryNest application designed to give parents full control and visibility over their children's reading journey. 

**Key Functionalities:**
- **Profile & Settings:** Parents can manage their own profiles, themes, and notification preferences.
- **Child Management:** Add, edit, and monitor multiple child profiles, including setting their reading levels, goals, and schedules.
- **Dashboards & Analytics:** View detailed metrics on a child's reading progress, streaks, test scores (quizzes), and activity timelines.
- **Story Library & Engagement:** Browse stories, mark favorites, approve/reject generated stories, and rate them.
- **AI & Extended Insights:** Get AI-driven recommendations and insights based on the child's reading patterns and growth.
- **Rewards & Achievements:** Track earned certificates and badges, and manage reward points.

---

## 2. Frontend Structure
The frontend of the Parent Module is located in `frontend/src/components/ParentModule/`. It is built with React and consists of modular components.

### Key Components:
- **Dashboards & Views:**
  - `ChildDetails.jsx` & `ChildGrowthDashboard.jsx`: The main views for tracking a specific child's holistic growth and detailed metrics.
  - `ChildrenList.jsx` & `ChildCard.jsx`: Displays a summary of all children associated with the parent.
  - `ParentProfile.jsx` & `ParentSettings.jsx`: Forms for managing the parent's personal information and application settings (like dark/light mode).
- **Reading & Activity Tracking:**
  - `ReadingAnalytics.jsx`, `ReadingStreak.jsx`, & `ReadingLogTable.jsx`: Visualizations and tabular data showing how much and how often a child is reading.
  - `ActivityTimeline.jsx` & `ProgressChart.jsx`: Chronological feeds and charts showing recent milestones.
  - `ReadingSchedule.jsx` & `ChildGoals.jsx`: Interactive components where parents set specific reading routines and targets.
- **Story Interaction:**
  - `ParentStoryLibrary.jsx`, `FavoriteStories.jsx`, & `StoryCard.jsx`: The library interface for browsing available books.
  - `StoryApprovals.jsx` & `StoryFeedback.jsx`: Interfaces for parents to review AI-generated stories before their children see them.
- **Rewards & gamification:**
  - `Achievements.jsx`, `Certificates.jsx`, & `RewardsShop.jsx`: Components showcasing the badges the child has earned and a shop where points can be redeemed.
- **Advanced Insights:**
  - `AIInsights.jsx`, `ChildComparison.jsx`, & `StoryRecommendations.jsx`: Features leveraging data to compare sibling progress or provide smart story suggestions.
- **Utility Components:**
  - `GlobalSearch.jsx`, `NotificationCenter.jsx`, `ToastNotification.jsx`: Global navigation and alert components.

---

## 3. Backend Structure
The backend is built with Django Django Rest Framework (DRF), located in `backend/api/`.

### Key Files:
- **`urls.py`:** Routes all `/parent/...` API requests to their respective views. It heavily uses DRF `DefaultRouter` for viewsets (like `/parent/children/`) and explicit paths for specific actions (like `/parent/children/<id>/ai-insights/`).
- **`parent_views.py`:** Contains the core logic for the Parent Module. 
  - Highlights include `ParentDashboardView`, `ChildProfileViewSet` (CRUD for children), `ReadingLogViewSet`, and `QuizHistoryView`.
- **`parent_views_extended.py`:** Contains advanced features and extended logic to keep the main views file clean.
  - Highlights include `ChildGrowthDashboardView`, `AIInsightsView`, `StoryApprovalViewSet`, and `ReadingAnalyticsView`.
- **`serializers.py`:** Translates complex database models into JSON for the frontend, and validates incoming data from the parent's forms.

---

## 4. Database Models
The data structure is defined in `backend/api/models.py`. The Parent Module interacts heavily with the following models:

- **`User` & `ParentProfile`:** The `User` model handles authentication (where `role='PARENT'`). The `ParentProfile` has a One-To-One relationship with `User` and stores preferences like theme, language, and notifications.
- **`ChildProfile`:** Linked to the Parent via a Foreign Key. Stores the child's name, age, reading level, avatar, and interests.
- **`Story` & `FavouriteStory`:** Parents and children interact with stories. `FavouriteStory` acts as a junction table tracking which child favorited which story.
- **`ReadingLog` & `ReadingProgress`:** Every time a child reads, a log is generated. `ReadingProgress` tracks exactly which page they are on and their completion percentage.
- **`QuizAttempt` & `StudentReport`:** Stores the scores and answers when a child takes a comprehension check.
- **`ChildGoal` & `ReadingSchedule`:** Stores the targets set by the parent (e.g., read 15 mins/day) and specific days/times for reading routines.
- **`StoryApproval`:** A queue system model where `status` can be `pending`, `approved`, or `rejected` based on parent review.

---

## 5. Data Flow: How it Connects & Updates the Database
Here is an example of how the entire system communicates when a **Parent adds a new Reading Schedule**:

1. **Frontend Action:** The parent navigates to the `ReadingSchedule.jsx` component and selects "Monday at 5:00 PM". They click Save.
2. **API Call:** The frontend makes a `POST` request to `/api/parent/schedules/` with the JSON payload `{"day_of_week": 0, "time": "17:00", "child": 1}`.
3. **Backend Routing:** The Django `urls.py` catches this route and directs it to the `ReadingScheduleViewSet` in `parent_views_extended.py`.
4. **Validation (Serializer):** The DRF Serializer checks if the data is valid (e.g., ensuring the child ID belongs to this specific parent).
5. **Database Update:** The viewset calls `.save()` on the serializer. The Django ORM executes an `INSERT INTO api_readingschedule ...` SQL query, creating a new row in the `db.sqlite3` database.
6. **Response:** The backend returns a `201 Created` status with the new schedule object.
7. **UI Update:** The React frontend receives the response and instantly updates the `ReadingSchedule.jsx` UI to display the new time slot without needing to refresh the page.

### Other Important DB Interactions:
- **Child Progress:** When a child reads, the frontend periodically hits the `ReadingProgressView`. This sends an `UPDATE` query to the `ReadingProgress` table, modifying the `completion_percentage`. The parent views this updated data via `ChildDashboardView` which runs a `SELECT` query to aggregate those logs.
- **Story Approvals:** A generated story is created with a `StoryApproval` status of `pending`. The parent sees this in `StoryApprovals.jsx`. Clicking "Approve" sends a `PATCH` request, updating the DB row to `approved`, which then makes the story visible in the child's interface.
