
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

// Loading indicator
const loading = document.getElementById("loading");

// Movie sorting controls
const sortFilter = document.getElementById("sort-filter");


/* =========================================
   CONTENT TYPE FILTER
   Selects movies, TV series, or all results.
   ========================================= */

// Reference the content type dropdown
const typeFilter = document.getElementById("type-filter");


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


    // Show the Discover section once a search begins
    document.getElementById("discover").hidden = false;


    // Clear the previous message and show the spinner
    statusMessage.textContent = "";
    loading.hidden = false;
    // moviesContainer.replaceChildren();
    // pagination.hidden = true;



    /* =========================================
       PAGINATION LOADING
       Clears old results and brings the user
       to the loading animation immediately.
       ========================================= */

    // Remove previous movie cards while loading
    moviesContainer.replaceChildren();

    // Hide pagination until the new results arrive
    pagination.hidden = true;

    // Scroll to Explore Movies while the API loads
    document.getElementById("discover").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });



    try {

        /* =========================================
           API URL WITH CONTENT TYPE FILTER
           Requests movies, series, or all content.
           ========================================= */

        // Build the API URL with the search query and page
        let url = `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchQuery)}&page=${page}`;

        // Add a content type only when one is selected
        if (typeFilter.value) {
            url += `&type=${typeFilter.value}`;
        }


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

    } finally {

        // Hide the spinner whether the request succeeds or fails
        loading.hidden = true;

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
   CONTENT TYPE FILTER EVENT
   Fetches matching movies or TV series
   whenever the selected type changes.
   ========================================= */

typeFilter.addEventListener("change", () => {

    // Don't fetch anything if no search has been made
    if (!currentSearch) return;

    // Load page 1 using the selected content type
    fetchMovies(currentSearch, 1);

});


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
   MOBILE FLOATING SEARCH
   Opens and closes the mobile search bar.
   ========================================= */

const mobileSearchToggle = document.getElementById("mobile-search-toggle");

mobileSearchToggle.addEventListener("click", () => {

    // Toggle the mobile search bar
    const isOpen = document.body.classList.toggle("mobile-search-open");

    // Close the filters panel when opening search
    if (isOpen) {
        closeMobileFilters();
    }

    // Update accessibility information
    mobileSearchToggle.setAttribute("aria-expanded", isOpen);
    mobileSearchToggle.setAttribute(
        "aria-label",
        isOpen ? "Close movie search" : "Open movie search"
    );

    // Focus the input when the search bar opens
    if (isOpen) {
        searchInput.focus();
    }
});




/* =========================================
   MOBILE FLOATING FILTERS
   Reuses the existing filter dropdowns.
   ========================================= */

const mobileFilterToggle = document.getElementById("mobile-filter-toggle");
const mobileFilterPanel = document.getElementById("mobile-filter-panel");
const mobileFilterControls = document.getElementById("mobile-filter-controls");

const discoverFilters = document.querySelector(".discover__filters");
const discoverHeader = document.querySelector(".discover__header");

// Match the mobile breakpoint used in styles.css
const mobileBreakpoint = window.matchMedia("(max-width: 600px)");

// Close the filter panel and reset its button
const closeMobileFilters = () => {
    mobileFilterPanel.hidden = true;

    mobileFilterToggle.setAttribute("aria-expanded", "false");
    mobileFilterToggle.setAttribute("aria-label", "Open movie filters");
};

// Move the SAME dropdowns between desktop and mobile
const updateFilterLayout = () => {

    if (mobileBreakpoint.matches) {

        // Mobile: Move filters into the floating panel
        mobileFilterControls.appendChild(discoverFilters);

    } else {

        // Desktop: Return filters to their original section
        discoverHeader.appendChild(discoverFilters);

        closeMobileFilters();
    }
};

// Set the correct layout when the page loads
updateFilterLayout();

// Update the layout when the screen size changes
mobileBreakpoint.addEventListener("change", updateFilterLayout);

// Open or close the floating filter panel
mobileFilterToggle.addEventListener("click", () => {

    const isOpening = mobileFilterPanel.hidden;

    // Close the panel if it is already open
    if (!isOpening) {
        closeMobileFilters();
        return;
    }

    // Close floating search before opening filters
    document.body.classList.remove("mobile-search-open");

    mobileSearchToggle.setAttribute("aria-expanded", "false");
    mobileSearchToggle.setAttribute("aria-label", "Open movie search");

    searchInput.blur();

    // Show the filter panel
    mobileFilterPanel.hidden = false;

    mobileFilterToggle.setAttribute("aria-expanded", "true");
    mobileFilterToggle.setAttribute("aria-label", "Close movie filters");
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


    // Close the floating search after submitting
    document.body.classList.remove("mobile-search-open");
    mobileSearchToggle.setAttribute("aria-expanded", "false");
    mobileSearchToggle.setAttribute("aria-label", "Open movie search");
    searchInput.blur();


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


