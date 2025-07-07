# Recipe Builder - Frontend

A modern, responsive recipe management application built with React and Material-UI. This frontend application allows users to create, manage, and organize recipes and meal plans with an intuitive interface.

## 🌐 Live Demo

**Try it out:** [https://recipe-builder-app.vercel.app/](https://recipe-builder-app.vercel.app/)

Experience the full functionality of the Recipe Builder application with the live demo deployed on Vercel.

## 🍳 What the Project Does

Recipe Builder is a comprehensive recipe management system that provides:

### Core Features

- **Recipe Management**: Create, edit, view, and delete recipes with detailed instructions
- **Ingredient Management**: Add and manage ingredients for recipes
- **Meal Plan Creation**: Organize recipes into structured meal plans with date ranges
- **User Authentication**: Secure login and signup functionality
- **Dashboard**: Centralized view of all recipes and meal plans
- **Search & Filter**: Find recipes and meal plans quickly
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### User Interface Features

- **Modern Material-UI Design**: Clean, professional interface with consistent styling
- **Interactive Tables**: Sortable and filterable data displays for recipes and meal plans
- **Modal Forms**: User-friendly forms for creating and editing content
- **Step-by-Step Wizards**: Guided 3-step meal plan creation process (plan details → recipe selection → processing)
- **Focused Edit Modals**: Streamlined editing experience (e.g., meal plan editing focuses on title and dates only)
- **Loading States**: Smooth user experience with proper feedback
- **Error Handling**: Comprehensive error messages and validation
- **Responsive Design**: Optimized for desktop, tablet, and mobile viewing

### Technical Features

- **React 18**: Modern React with hooks and functional components
- **Material-UI v5**: Professional component library with theming
- **React Hook Form**: Efficient form handling with validation
- **React Router**: Client-side routing for single-page application
- **Vite**: Fast development build tool
- **ESLint**: Code quality and consistency

## 🚀 How to Install and Run It

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Backend API** running (see API section below)

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd recipe-builder
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:

   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_APP_TITLE=Recipe Builder
   ```

4. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

## 🔧 Key Technologies

### Frontend Stack

- **React 19**: Latest React with modern hooks and concurrent features
- **Material-UI v7**: Professional component library with extensive theming
- **React Hook Form**: Efficient form handling with built-in validation
- **Yup**: Schema validation for forms
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API requests
- **Vite**: Fast build tool and development server

### Development Tools

- **ESLint**: Code linting and formatting
- **Emotion**: CSS-in-JS styling solution
- **Redux Toolkit**: State management (if needed for complex state)

### Recent Improvements

- **Wizard-style Modal Forms**: 3-step guided creation process for meal plans
- **Table-based Data Display**: Responsive tables for better data organization
- **Focused Edit Modals**: Streamlined editing experience with context-specific forms
- **Enhanced Error Handling**: Comprehensive validation and error feedback
- **Modern UI Components**: Consistent design system with Material-UI

## 📡 API Examples

The frontend communicates with a Django REST API backend. Here are the main API endpoints and examples:

### Base URL

```
http://localhost:8000/api
```

### Authentication Endpoints

#### User Registration

```http
POST /auth/register/
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### User Login

```http
POST /auth/login/
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Recipe Endpoints

#### Get All Recipes

```http
GET /recipes/recipe/
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Spaghetti Carbonara",
      "instructions": "Cook pasta, mix with eggs and cheese...",
      "image_url": "https://example.com/image.jpg",
      "created_at": "2024-01-15T10:30:00Z",
      "created_by": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  ]
}
```

#### Create Recipe

```http
POST /recipes/recipe/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Chicken Stir Fry",
  "instructions": "Heat oil, add chicken, stir fry vegetables...",
  "image_url": "https://example.com/chicken-stir-fry.jpg"
}
```

#### Get Single Recipe

```http
GET /recipes/recipe/{id}/
Authorization: Bearer <access_token>
```

#### Update Recipe

```http
PUT /recipes/recipe/{id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Updated Recipe Title",
  "instructions": "Updated instructions...",
  "image_url": "https://example.com/updated-image.jpg"
}
```

#### Delete Recipe

```http
DELETE /recipes/recipe/{id}/
Authorization: Bearer <access_token>
```

### Ingredient Endpoints

#### Get Recipe Ingredients

```http
GET /recipes/recipe/{recipe_id}/ingredients/
Authorization: Bearer <access_token>
```

#### Add Ingredient to Recipe

```http
POST /recipes/recipe/{recipe_id}/ingredients/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Olive Oil",
  "quantity": "2 tablespoons"
}
```

### Meal Plan Endpoints

#### Get All Meal Plans

```http
GET /mealplans/meal-plans/
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "title": "Weekly Meal Plan",
      "start_date": "2024-01-15",
      "end_date": "2024-01-21",
      "description": "Healthy meals for the week",
      "created_at": "2024-01-10T09:00:00Z",
      "created_by": {
        "id": 1,
        "first_name": "John"
      }
    }
  ]
}
```

#### Create Meal Plan

```http
POST /mealplans/meal-plans/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Mediterranean Week",
  "start_date": "2024-02-01",
  "end_date": "2024-02-07",
  "description": "Mediterranean diet meal plan"
}
```

#### Get Meal Plan Recipes

```http
GET /mealplans/meal-plans/{id}/recipes/
Authorization: Bearer <access_token>
```

#### Add Recipe to Meal Plan

```http
POST /mealplans/meal-plans/{id}/recipes/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "recipe": 1
}
```

#### Remove Recipe from Meal Plan

```http
DELETE /mealplans/meal-plans/{meal_plan_id}/recipes/{recipe_id}/
Authorization: Bearer <access_token>
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": {
    "field_name": ["Specific field error"]
  }
}
```

**Common HTTP Status Codes:**

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## 🛠 Development

### Project Structure

```
src/
├── components/          # React components
│   ├── MealPlans/      # Meal plan related components
│   │   ├── AddMealPlan.jsx      # 3-step wizard for creating meal plans
│   │   ├── EditMealPlan.jsx     # Modal for editing meal plan details
│   │   ├── MealPlanList.jsx     # Table view of all meal plans
│   │   └── MealPlanDetail.jsx   # Detailed view with recipes table
│   ├── Recipes/        # Recipe related components
│   │   ├── RecipeDetail.jsx     # Detailed recipe view
│   │   └── ...
│   ├── Ingredients/    # Ingredient related components
│   ├── users/          # Authentication components
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── Dashboard.jsx   # Main dashboard component
│   └── Loading.jsx     # Loading component
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── utils/             # Utility functions
│   └── http_service.js # API service layer
├── theme/             # Material-UI theme
│   └── theme.js       # Theme configuration
└── assets/            # Static assets
    └── images/        # Image assets
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Features in Detail

### Dashboard

- Overview of all recipes and meal plans
- Quick access to create new content
- Recent activity display

### Recipe Management

- Create recipes with detailed instructions
- Upload and manage recipe images
- Add ingredients with quantities
- Edit and delete recipes
- View recipes in responsive table format

### Meal Planning

- Create meal plans with date ranges using a 3-step wizard interface
- Add multiple recipes to meal plans during creation
- View meal plan details in responsive table format
- Edit meal plan information (title and dates) with focused modal
- Manage meal plan recipes independently from plan details

### User Experience Workflow

1. **Authentication**: Secure login/signup with form validation
2. **Dashboard**: Central hub with overview of all content
3. **Recipe Creation**: Step-by-step recipe creation with ingredients
4. **Meal Plan Creation**: 3-step wizard process:
   - Step 1: Plan details (title, dates, description)
   - Step 2: Recipe selection from available recipes
   - Step 3: Processing and confirmation
5. **Content Management**: Edit, view, and delete recipes and meal plans
6. **Responsive Design**: Seamless experience across all devices

### User Interface

- Responsive design for all screen sizes
- Modern Material-UI components
- Consistent color scheme and typography
- Intuitive navigation and user flows
- Professional table layouts for data display
- Context-aware modals and forms

## 🔗 Related Projects

- **Backend API**: Django REST Framework backend
- **Mobile App**: React Native mobile application (if applicable)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

For questions or support, please contact [your-email@example.com]
