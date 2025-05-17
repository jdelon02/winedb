I need to create a web app within this folder.  It will be both a recipe and a wine manamgent sytem.  It should allow for user registration and login, and then allow for creating, editing, and bookmarking both recipes and wines.  It should allow for creating new recipes and editing ones that user previously creaeted.  Fields that could be reused between recipes or between wines; like ingredients, vineyard, varietal, year, etc... should all be separate tables in the db.  For those types of fields, it should allow for the values to be select2 style lists, where I can select existing ingredients, or create new ones.  For ingredients specifically, I want that entity to have the following:

- A quantity field
- A unit of measure field
- An ingredient item
- A description field

The dropdown fields should be the measurement field and the ingredient field.  That way, those can be reused between recipes.  I want to be able to create a recipe with multiple ingredients, and I want to be able to create a wine with multiple varietals.  I want to be able to create a recipe with multiple steps, and I want to be able to create a wine that can have multiple tasting notes (one per user is fine).  I want to be able to create a recipe with multiple tags, and I want to be able to create a wine with multiple classifications.  I want to be able to create a recipe with multiple images, and I want to be able to create a wine with multiple images.  It should allow for creating wine reviews.  I want to be able to search for recipes and wines, and filter them by various criteria.  I also want to be able to create shopping lists based on the recipes and wines I select. I want to also have the ability to rate both the recipes and wines, and I want to be able to see the average rating for each recipe and wine.  I want to be able to create a profile page that shows my favorite recipes and wines, as well as my reviews.  I want to be able to follow other users and see their profiles, as well as their favorite recipes and wines.  I want to be able to send messages to other users.  I want to be able to create groups and invite other users to join them.  I want to be able to create a comment ability to allow for discussion on recipes and wines with other users.  I want to be able to create a dashboard that shows my activity and the activity of the users I follow.  I want to be able to create a search engine that allows me to search for recipes and wines by various criteria.  I want to be able to create a tagging system that allows me to tag recipes and wines with keywords.  I want to be able to create a rating system that allows me to rate recipes and wines on a scale of 1-5 stars.  I want to be able to create a review system that allows me to write reviews for recipes and wines.  I want to be able to create a bookmarking system that allows me to bookmark recipes and wines for later use.  I want to be able to create a sharing system that allows me to share recipes and wines with other users.  I want to be able to create a commenting system that allows me to comment on recipes and wines.  I want to be able to create a liking system that allows me to like recipes and wines.  I want to be able to create a following system that allows me to follow other users.

Before writing any code, let's step back and consider:
1. What are the key requirements for a system like this?
2. What are the security implications we need to address?
3. DB connection should be setup to use mysql or postgresql for production, and sqlite for local development.
3. I want it to use laravel as the backend and react for the frontend.  
4. What would the full database structure look like for this kind of system?
5. How can we keep the frontend and backend code separate and how can we keep the api integration in sync?
6. How can we ensure that the system is scalable and maintainable?
7. How can we ensure that the system is user-friendly and easy to navigate?
8. How can we ensure that the system is performant and responsive?
9. How can we ensure that the system is secure and protects user data?
10. How can we ensure that the system is well-documented and easy to understand for future developers?
11. How can we ensure that all of the pieces fit together and work seamlessly (like the ingredients and varietals dropdowns) using the select2 style lists with the API backend?
6. The app should be responsive and work on both desktop and mobile devices.  
7. It should also have a clean and modern design.
8. It should use laravel blueprint (https://blueprint.laravelshift.com/) to generate the entire backend structure.  
9. It should generate a json schema using this package: (https://github.com/rjsf-team/react-jsonschema-form) based on that laravel blueprint to define the structure for the React frontend?
10. It should generate plantuml diagrams and copilot instructions files that give copilot information following the instructions here: (https://code.visualstudio.com/docs/copilot/copilot-customization)
11. API documentation with Swagger/OpenAPI
12. Client-side validation mirroring server-side rules

After analyzing these aspects,

Generate three different approaches to solving this problem:
1. A solution using depth-first search
2. A solution using Tarjan's algorithm
3. A solution using topological sorting

For each approach, explain its:
- Time and space complexity
- Key advantages
- Potential limitations

Then, recommend which approach is best and the key info.  Do this before generating any code.

[ After reviewing the three approaches]

The current workspace folder is the parent folder, so any directories should be created within the current workspace folder.  The backend should be in a folder called "./backend" and the frontend should be in a folder called "./frontend".  We do not need to create a recipes_wines folder, since that is the current workspace folder.   Any mkdir commands should not have recipes_wines in the path, unless full path is used.

For the implementation, let's approach this in stages:

Stage 1: 
This stage focuses on setting up the database structure and related components using Laravel Blueprint.  No code should be generated yet.  This stage will only focus on creating the blueprint.

Database Structure Setup:

Define user table and authentication tables
Create recipe and wine tables with their core fields
Set up review and rating tables
Create bookmark and likes tables
Establish messaging and group tables
Define ingredient and vineyard tables
Create comment and tag tables
Set up all necessary pivot/relationship tables
Data Population:

Create database migrations for all tables
Build database seeders for initial data
Create factories for generating test data
Set up faker providers for wine and recipe specific data
API Development:

Generate RESTful API routes
Create API controllers for all resources
Implement API resource classes for data transformation
Set up API documentation using Swagger/OpenAPI
Authentication & Authorization:

Configure Laravel Sanctum for API authentication
Set up middleware for authentication
Create policies for authorization
Implement gates for complex authorization rules
Testing Infrastructure:

Generate feature tests for API endpoints
Create unit tests for models
Set up database testing environment
Implement test factories and helpers
Documentation:

Generate API documentation
Create database schema documentation
Document authentication flows
Write setup and deployment guides
Configuration Management:

Set up environment configuration files
Configure database connections
Set up caching configuration
Configure queue system
Maintenance Scripts:

Create database migration scripts
Set up seeding scripts
Generate backup and restore scripts
Create deployment scripts
Monitoring and Logging:

Configure error logging
Set up application monitoring
Implement notification system
Create health check endpoints
Security Implementation:

Set up CORS configuration
Implement rate limiting
Configure security headers
Set up input validation rules

[After reviewing the blueprint structure]

Stage 2: Implement the json schema for the React app based on the Laravel blueprint schema. Do not generate implementation code in any files, just create the json schema.  This schema will include:

Core Entity Schemas:

Define User schema (profile, authentication, preferences)
Create Recipe schema (ingredients, steps, images)
Create Wine schema (varietals, vineyards, tasting notes)
Define Review and Rating schemas
Create Bookmarks and Likes schemas
Define Comments schema
Create Groups schema
Define Tags schema
Create Ingredients schema
Define Vineyard schema
Create Messages schema
Form Schemas:

User registration and profile forms
Recipe creation/editing forms
Wine creation/editing forms
Review submission forms
Comment submission forms
Group creation forms
Message composition forms
Search and filter forms
Rating submission forms
Component Schemas:

Layout components (Header, Footer, Navigation)
List views (Recipes, Wines, Reviews)
Detail views (Recipe, Wine, Profile)
Form components
Modal components
Card components
Table components
Search components
Filter components
Validation Rules:

Form field validation schemas
Data type validations
Required field rules
Custom validation rules
Cross-field validation schemas
File upload validation rules
State Management Schemas:

User authentication state
Application preferences state
Form state management
List/pagination state
Filter/search state
Real-time updates state
Feature Schemas:

Authentication flows
File upload handling
Real-time messaging
Push notifications
Offline support
Email notifications
Internationalization
Dark mode/theming
Integration Schemas:

API endpoint definitions
WebSocket configurations
External service integrations
File storage configurations
Cache configurations
Security Schemas:

Authorization rules
Role-based access control
Input sanitization rules
CSRF protection
API security schemas
Performance Schemas:

Caching strategies
Lazy loading configurations
Code splitting definitions
Asset optimization rules
Accessibility Schemas:

ARIA attribute definitions
Keyboard navigation rules
Screen reader support
Color contrast requirements
Testing Schemas:

Component test definitions
Integration test schemas
End-to-end test configurations
Performance test definitions
Documentation Schemas:

Component documentation
API documentation
Setup instructions
Deployment procedures
Maintenance guides

[After reviewing the json schema]

Stage 3: Let's generate plantuml diagrams from both the laravel blueprint and the json schema file. Let's also generate Copilot instructions.

PlantUML Diagram Generation:

Create a diagrams directory for PlantUML files
Generate database schema diagram from Laravel Blueprint
Generate entity relationship diagram from Laravel Blueprint
Generate component diagram from JSON schema
Generate sequence diagrams for key workflows
Generate class diagrams for main entities
Create GitHub Copilot Instruction Structure:

Verify instructions directory exists
Remove any references to old .github/copilot-instructions.md
Create three main instruction files:
main.instructions.md
backend.instructions.md
frontend.instructions.md
Backend Instructions Content (backend.instructions.md):

Document Laravel application structure
List database models and relationships
Document API endpoints and controllers
Describe authentication and authorization rules
Include common backend patterns and practices
Document testing approaches
Add error handling conventions
List backend dependencies and requirements
Frontend Instructions Content (frontend.instructions.md):

Document React component structure
List form schemas and validations
Document state management patterns
Describe routing configuration
Include styling conventions and Tailwind usage
Document testing strategies
List frontend dependencies
Add accessibility requirements
Main Instructions Content (main.instructions.md):

Project overview and architecture
Development environment setup
Coding standards and conventions
Git workflow and branching strategy
Deployment procedures
Common troubleshooting guides
Security considerations
Performance guidelines
Format Each Instruction File:

Use one statement per line
Include clear section headers
Add code examples where relevant
Include links to relevant documentation
Add comments for complex instructions
Ensure consistent formatting
Add version information
Include last updated date

[After reviewing the plantuml diagrams and copilot instructions]

Stage 4: Install laravel using composer.json in "./backend".  Include all packages needed to run the backend.  

[After reviewing the laravel installation]

Stage 5: Create a step by step plan to implement the backend API using Laravel based on the blueprint structure. The plan should be in markdown format, and the filename for the plan should be "backend_setup.md."  This plan will include all the necessary controllers, models, and routes to handle the API requests.  It will also include the necessary middleware to handle authentication and authorization.  It will also include the necessary tests to ensure that everything works as expected.  It will also include the necessary documentation to explain how everything works.  It will also include the necessary configuration files to set up the environment.  It will also include the necessary scripts to run the application.  It will also include the necessary scripts to deploy the application. It will also include the necessary scripts to log errors.  It will also include the necessary scripts to send notifications.

[After reviewing the backend API implementation]

Stage 6: Install a new react app in "./frontend".  Include any packages needed to implement the app.

[After reviewing the react installation]

Stage 7: Create a step by step plan to implement the frontend using React based on the json schema using typescript. The plan should be in markdown format, and the filename for the plan should be "frontend_setup.md."  This plan will include all the necessary components, forms, listing and detail pages, API endpoints, and validation rules for creating, editing, and viewing recipes, wines, reviews, ratings, bookmarks, messages, comments, tags, groups, likes and any other structures defined in the laravel blueprint and json schema.  It will also include the necessary state management to handle the data flow between components.  It will also include the necessary routing to handle navigation between pages.  It will also include the necessary styling to ensure a clean and modern design.  It will also include the necessary testing to ensure that everything works as expected.  It will also include the necessary documentation to explain how everything works.  It will also include the necessary configuration files to set up the environment.  It will also include the necessary scripts to run the application.  It will also include the necessary scripts to deploy the application.  It will also include the necessary scripts to back up the application.  It will also include the necessary scripts to restore the application.  It will also include the necessary scripts to monitor the application.  It will also include the necessary scripts to log errors.  It will also include the necessary scripts to send notifications.

[After reviewing the frontend implementation]

Stage 7: Add to the plans support for field dependencies where validating one field requires values from other fields.  Update the copilot instructions with any new information needed.

[After reviewing dependencies implementation]

Stage 8: Add to the plans the ability to Implement asynchronous validation support with proper loading states and error handling. Finally, create a README.md file with instructions on how to set up the project.  Update the copilot instructions with any new information needed.

[After reviewing the README.md file]

Stage 9: Add to the plans the ability to Implement a dark mode toggle and persist user preferences.  Update the copilot instructions with any new information needed.

[After reviewing the dark mode implementation]

Stage 10: Add to the plans the ability to Implement a responsive design for mobile and tablet devices. Update the copilot instructions with any new information needed.

[After reviewing the responsive design implementation]

Stage 11: Add to the plans the ability to Implement a search feature for recipes and wines. Update the copilot instructions with any new information needed.

[After reviewing the search feature implementation]

Stage 12: Add to the plans the ability to Implement a bookmarking feature for recipes and wines. Update the copilot instructions with any new information needed.

[After reviewing the bookmarking feature implementation]

Stage 13: Add to the plans the ability to Implement a liking feature for recipes and wines. Update the copilot instructions with any new information needed.

[After reviewing the liking feature implementation]

Stage 14: Add to the plans the ability to Implement a commenting feature for recipes and wines. Update the copilot instructions with any new information needed.

[After reviewing the commenting feature implementation]

Stage 15: Add to the plans the ability to Implement a rating feature for recipes and wines. Update the copilot instructions with any new information needed.

[After reviewing the rating feature implementation]

Stage 16: Add to the plans the ability to Implement a review feature for recipes and wines. Update the copilot instructions with any new information needed.

[After reviewing the review feature implementation]

Stage 17: Add to the plans the ability to Implement a messaging feature for users. Update the copilot instructions with any new information needed.

[After reviewing the messaging feature implementation]

Stage 18: Add to the plans the ability to Implement a following feature for users. Update the copilot instructions with any new information needed.

[After reviewing the following feature implementation]

Stage 19: Add to the plans the ability to Implement a groups feature for users. Update the copilot instructions with any new information needed.

[After reviewing the groups feature implementation]

Stage 20: Add to the plans the ability to Implement a dashboard feature for users. Update the copilot instructions with any new information needed.

[After reviewing the dashboard feature implementation]

Stage 21: Add to the plans the ability to Implement a profile feature for users. Update the copilot instructions with any new information needed.

[After reviewing the profile feature implementation]

Stage 22: Add to the plans the ability to Implement a shopping list feature for users. Update the copilot instructions with any new information needed.

[After reviewing the shopping list feature implementation]

Stage 23: Add to the plans the ability to Implement a tagging feature for recipes and wines. Update the copilot instructions with any new information needed.

[After reviewing the tagging feature implementation]

Stage 24: Add to the plans the ability to Implement a classification feature for wines. Update the copilot instructions with any new information needed.

[After reviewing the classification feature implementation]

Stage 25: Add to the plans the ability to Implement a filtering feature for recipes and wines. Update the copilot instructions with any new information needed.

[After reviewing the filtering feature implementation]

Stage 26: Add to the plans the ability to Implement a wine pairing feature for recipes. Update the copilot instructions with any new information needed.

[After reviewing the wine pairing feature implementation]

Stage 27: Add to the plans the ability to Implement a shopping list feature for recipes and wines. Update the copilot instructions with any new information needed.

[After reviewing the shopping list feature implementation]

Stage 28: Add to the plans the ability to Implement a blog feature for users. Update the copilot instructions with any new information needed.

[After reviewing the blog feature implementation]

Stage 29: Ensure that all changes are properly documented in one or both the json schema for the frontend or the laravel blueprint for the backend.  This includes any changes to the database structure, API endpoints, or frontend components.  It also includes any changes to the documentation files, such as the README.md file or the copilot instructions files.