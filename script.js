
/* =========================================
   SCENEO — THE CINEMATIC VAULT
   Main Application JavaScript
   ========================================= */


/* =========================================
   OMDb API CONFIGURATION
   ========================================= */

// OMDb API key and endpoint
const API_KEY = "ef678e1f";
const API_URL = "https://www.omdbapi.com/";


/* =========================================
   DOM ELEMENTS
   References to HTML elements used by JS.
   ========================================= */

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const statusMessage = document.getElementById("status-message");
const moviesContainer = document.getElementById("movies-container");

// Movie sorting controls
const sortFilter = document.getElementById("sort-filter");

// Store the latest search results
let currentMovies = [];


/* =========================================
   PAGINATION ELEMENTS & STATE
   ========================================= */

// Pagination HTML elements
const pagination = document.getElementById("pagination");
const prevPage = document.getElementById("prev-page");
const nextPage = document.getElementById("next-page");
const pageInfo = document.getElementById("page-info");

// Track the current search and page
let currentSearch = "";
let currentPage = 1;
let totalPages = 1;



/* =========================================
   FETCH MOVIES
   Retrieves movie results from OMDb.
   ========================================= */


/* =========================================
   FETCH MOVIES
   Retrieves movie results from OMDb,
   including pagination support.
   ========================================= */

const fetchMovies = async (searchQuery, page = 1) => {

    // Display loading message and clear old results
    statusMessage.textContent = "Searching for movies...";
    // moviesContainer.replaceChildren();
    // pagination.hidden = true;


    // Keep existing cards visible while loading another page
    if (page === 1) {
        moviesContainer.replaceChildren();
    }

    pagination.hidden = true;


    try {
        // Fetch the requested page of movie results
        const url = `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchQuery)}&page=${page}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to connect to OMDb.");
        }

        const data = await response.json();

        // Handle searches without results
        if (data.Response === "False") {
            currentMovies = [];
            statusMessage.textContent = data.Error;
            return;
        }

        // Save the results and current search information
        currentMovies = data.Search;
        currentSearch = searchQuery;
        currentPage = page;

        // OMDb returns 10 results per page
        totalPages = Math.ceil(Number(data.totalResults) / 10);

        // Update the results message
        statusMessage.textContent =
            `Found ${data.totalResults} results for "${searchQuery}"`;

        // Display movies using the selected sorting option
        sortMovies(sortFilter.value);


        // Smoothly scroll to the movie results after loading
        document.getElementById("discover").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


        // Update pagination information
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

        // Disable buttons at the first and last pages
        prevPage.disabled = currentPage === 1;
        nextPage.disabled = currentPage === totalPages;

        // Show pagination when multiple pages exist
        pagination.hidden = totalPages <= 1;

    } catch (error) {

        // Handle failed requests
        statusMessage.textContent =
            "Something went wrong. Please try again.";

        console.error("OMDb API Error:", error);
    }
};




/* =========================================
   SORT MOVIES
   Sorts movies without modifying original data.
   ========================================= */

const sortMovies = (sortBy) => {

    // Create a copy of the original movie results
    const sortedMovies = [...currentMovies];

    // Sort titles alphabetically (A to Z)
    if (sortBy === "az") {
        sortedMovies.sort((a, b) =>
            a.Title.localeCompare(b.Title)
        );
    }

    // Sort titles alphabetically (Z to A)
    else if (sortBy === "za") {
        sortedMovies.sort((a, b) =>
            b.Title.localeCompare(a.Title)
        );
    }

    // Sort by newest release year
    else if (sortBy === "newest") {
        sortedMovies.sort((a, b) =>
            parseInt(b.Year, 10) - parseInt(a.Year, 10)
        );
    }

    // Sort by oldest release year
    else if (sortBy === "oldest") {
        sortedMovies.sort((a, b) =>
            parseInt(a.Year, 10) - parseInt(b.Year, 10)
        );
    }

    // Update the movie cards with the sorted results
    renderMovies(sortedMovies);
};



/* =========================================
   SORT FILTER EVENT
   Updates movie order when the user selects
   a sorting option.
   ========================================= */

sortFilter.addEventListener("change", () => {

    // Get the selected sorting option
    const selectedSort = sortFilter.value;

    // Sort and update the displayed movie cards
    sortMovies(selectedSort);

});



/* =========================================
   PAGINATION BUTTON EVENTS
   ========================================= */

// Load the previous page
prevPage.addEventListener("click", () => {
    if (currentPage > 1) {
        fetchMovies(currentSearch, currentPage - 1);
    }
});

// Load the next page
nextPage.addEventListener("click", () => {
    if (currentPage < totalPages) {
        fetchMovies(currentSearch, currentPage + 1);
    }
});



/* =========================================
   SEARCH FORM
   Executes a movie search on submission.
   ========================================= */

searchForm.addEventListener("submit", (event) => {

    // Prevent the default page refresh
    event.preventDefault();

    // Read and clean the user's search query
    const searchQuery = searchInput.value.trim();

    // Ignore empty searches
    if (!searchQuery) return;

    // Execute the OMDb API request
    fetchMovies(searchQuery);

});



/* =========================================
   RENDER MOVIE CARDS
   Dynamically creates cards from OMDb data.
   ========================================= */

const renderMovies = (movies) => {

    // Remove previous search results
    moviesContainer.replaceChildren();

    // Create a card for each returned movie
    movies.forEach((movie) => {

        // Main card container
        const card = document.createElement("article");
        card.className = "movie-card";

        // Movie poster or fallback
        const hasPoster = movie.Poster && movie.Poster !== "N/A";
        const poster = document.createElement(hasPoster ? "img" : "div");
        poster.className = "movie-card__poster";

        if (hasPoster) {
            poster.src = movie.Poster;
            poster.alt = `${movie.Title} poster`;
            poster.loading = "lazy";


            // Display a placeholder if the poster image fails to load
            poster.addEventListener("error", () => {

                // Create a fallback element
                const fallback = document.createElement("div");

                // Apply our existing poster placeholder styles
                fallback.className = "movie-card__poster movie-card__poster--empty";

                // Show a message instead of a broken image
                fallback.textContent = "Image unavailable";

                // Replace the broken image
                poster.replaceWith(fallback);
            });


        } else {
            poster.textContent = "Poster unavailable";
            poster.classList.add("movie-card__poster--empty");
        }

        // Movie information container
        const content = document.createElement("div");
        content.className = "movie-card__content";

        // Movie title
        const title = document.createElement("h3");
        title.className = "movie-card__title";
        title.textContent = movie.Title;

        // Release year and content type
        const meta = document.createElement("p");
        meta.className = "movie-card__meta";

        const type = movie.Type === "series" ? "TV Series" : "Movie";
        meta.textContent = `${movie.Year} · ${type}`;

        // Assemble the card
        content.append(title, meta);
        card.append(poster, content);

        // Add the finished card to the grid
        moviesContainer.append(card);
    });
};


