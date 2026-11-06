# SCENEO — The Cinematic Vault

**Discover. Explore. Experience.**

SCENEO is a modern, responsive movie discovery web application designed to provide an elegant and intuitive way to explore the world of cinema. Powered by the Open Movie Database (OMDb) API, SCENEO combines real movie information with a premium, cinematic user interface.

The application is developed entirely with **HTML5, CSS3, and vanilla JavaScript**, demonstrating core frontend development skills without relying on frameworks or external UI libraries.

**Live Website:** https://jonathanborrego.github.io/SCENEO-THE-CINEMATIC-VAULT/

**GitHub Repository:** https://github.com/jonathanborrego/SCENEO-THE-CINEMATIC-VAULT

---

## About the Project

SCENEO — The Cinematic Vault was created as a frontend development portfolio project and JavaScript final assessment for the Frontend Simplified (FES) development program.

The project follows the structure of a real-world frontend developer take-home interview assignment, emphasizing clean code, responsive design, API integration, accessibility, and user experience.

The goal is to deliver an application that is both visually engaging and technically well-structured, demonstrating practical frontend development skills applicable to professional software engineering environments.

## Features

The following functionality defines the application's planned final experience.

### Movie & TV Show Search
- Search movies and television series using the OMDb API.
- Retrieve real movie information dynamically.
- Display movie posters, titles, release years, and content types.
- Handle searches with no matching results.

### Movie Discovery
- Responsive movie cards with cinematic poster imagery.
- Detailed movie information, including synopsis, genre, cast, runtime, and IMDb ratings.
- Clean navigation and organized search results.
- Additional results through API pagination.

### Filtering & Sorting
- Filter results by movies or television series.
- Sort titles alphabetically (A–Z and Z–A).
- Sort results by release year (newest and oldest).
- Provide intuitive controls for refining search results.

### User Experience
- Modern dark-themed interface with violet accents.
- Fully responsive layouts for desktop, tablet, and mobile.
- Smooth hover effects and transitions.
- Loading indicators during API requests.
- Clear error messages and empty states.
- Accessible semantic HTML and keyboard-friendly controls.

## Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure and application layout |
| CSS3 | Responsive design, animations, and visual styling |
| JavaScript (ES6+) | Application logic, DOM manipulation, and interactivity |
| Fetch API | Asynchronous requests to the OMDb API |
| OMDb API | External movie and television data |
| Git & GitHub | Version control and source-code hosting |
| GitHub Pages | Static website deployment |

The application intentionally avoids frontend frameworks to demonstrate a strong understanding of foundational web technologies.

## Design & User Interface

SCENEO follows a premium cinema-inspired design system emphasizing simplicity, readability, and visual consistency.

**Design principles:**
- Dark midnight backgrounds.
- Violet accent colors and subtle gradients.
- Modern typography with clear visual hierarchy.
- Minimal navigation with compact branding.
- Responsive layouts and consistent spacing.
- Subtle micro-interactions that enhance usability.

The interface is designed to prioritize content discovery while maintaining a polished, professional appearance across devices.

## API Integration

SCENEO uses the **Open Movie Database (OMDb) API** to retrieve movie and television information.

**Official API:** https://www.omdbapi.com/

The application uses JavaScript's native `fetch()` API to make HTTP requests and process JSON responses.

The planned API workflow includes:

1. Capturing a user's search query.
2. Requesting matching titles from OMDb.
3. Processing the returned JSON data.
4. Dynamically generating movie cards in the DOM.
5. Providing filtering and sorting controls.
6. Handling loading states, unsuccessful requests, and empty results.

The OMDb API requires an API key. API credentials should be managed with awareness that client-side JavaScript and GitHub Pages are publicly accessible.

## Project Structure

The project uses a straightforward structure to keep the source code organized and maintainable.

- `index.html` — Main application structure and semantic markup.
- `styles.css` — Global styles, layout, visual components, and responsive design.
- `script.js` — Planned JavaScript application logic, API requests, search, filtering, and dynamic rendering.
- `README.md` — Project overview and technical documentation.

Additional assets may be introduced as development progresses.

## Running the Project Locally

1. Clone or download the GitHub repository.
2. Open the project folder in Visual Studio Code.
3. Launch `index.html` using a local development server, such as the VS Code Live Server extension.
4. Open the local URL in your browser.

Once API functionality is implemented, configure an activated OMDb API key as required by the application.

No framework installation or build process is required.

## Development Status

**Status: In Development**

The initial application structure, navigation, hero section, search interface, and discovery section are being developed.

