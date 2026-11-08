
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
   FAVORITES — LOCAL STORAGE
   Saves movies and TV shows in the browser.
   ========================================= */

// Name used to store favorites in localStorage
const FAVORITES_KEY = "sceneo-favorites";

// Navbar counter
const favoritesCount = document.getElementById("favorites-count");

// Get all previously saved favorites
const getFavorites = () => {
    try {
        const saved = localStorage.getItem(FAVORITES_KEY);

        // Return an empty array if nothing is saved yet
        const favorites = saved ? JSON.parse(saved) : [];

        return Array.isArray(favorites) ? favorites : [];
    } catch (error) {
        console.error("Could not load favorites:", error);
        return [];
    }
};

// Update the number displayed in the navbar
const updateFavoritesCount = () => {
    favoritesCount.textContent = getFavorites().length;
};

// Save favorites and refresh the navbar counter
const saveFavorites = (favorites) => {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        updateFavoritesCount();
    } catch (error) {
        console.error("Could not save favorites:", error);
    }
};

// Display the saved count when SCENEO loads
updateFavoritesCount();


/* =========================================
   FAVORITES SECTION NAVIGATION
   Shows movies saved in localStorage.
   ========================================= */

// Favorites section and its elements
const favoritesLink = document.getElementById("favorites-link");
const favoritesSection = document.getElementById("favorites");
const favoritesContainer = document.getElementById("favorites-container");
const favoritesStatus = document.getElementById("favorites-status");
const discoverSection = document.getElementById("discover");

// Open the saved favorites collection
favoritesLink.addEventListener("click", (event) => {
    event.preventDefault();

    // Retrieve saved movies and TV shows
    const favorites = getFavorites();

    // Switch from search results to favorites
    discoverSection.hidden = true;
    favoritesSection.hidden = false;

    // Hide homepage releases while viewing favorites
    document.getElementById("fresh-releases").hidden = true;

    // Show a helpful message if nothing is saved
    favoritesStatus.hidden = favorites.length > 0;

    // Reuse the existing movie card renderer
    renderMovies(favorites, favoritesContainer);

    // Scroll to the favorites section
    favoritesSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});


/* =========================================
   BACK TO MOVIES NAVIGATION
   Restores previous search results or home.
   ========================================= */

// Get the Back to Movies button
const backToMovies = document.getElementById("back-to-movies");

backToMovies.addEventListener("click", () => {

    // Hide the Favorites section
    favoritesSection.hidden = true;

    // Check whether previous search results exist
    const hasPreviousResults = currentMovies.length > 0;

    // Restore results only when movies were previously loaded
    discoverSection.hidden = !hasPreviousResults;

    // Restore Fresh Releases only if no search results exist
    document.getElementById("fresh-releases").hidden = hasPreviousResults;

    if (hasPreviousResults) {

        // Return to the existing movie results
        discoverSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } else {

        // No previous results: return to the homepage
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
});






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

    // Show search results and hide other sections
    document.getElementById("fresh-releases").hidden = true;
    document.getElementById("favorites").hidden = true;


    // Show the Discover section once a search begins
    document.getElementById("discover").hidden = false;


    // Clear the previous message and show the spinner
    statusMessage.textContent = "";
    loading.hidden = false;



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
   FRESH RELEASES — TMDB API
   Loads recently released movies and TV shows.
   Uses IMDb IDs for existing SCENEO features.
   ========================================= */

const TMDB_API_KEY = "b22b2b8abb847cc58180b44a32ff6554";
const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_POSTER_URL = "https://image.tmdb.org/t/p/w500";

// Homepage containers
const recentMoviesContainer = document.getElementById("recent-movies");
const recentSeriesContainer = document.getElementById("recent-series");
const freshReleasesStatus = document.getElementById("fresh-releases-status");

// Make a request to TMDb
const fetchTMDB = async (path, parameters = {}) => {

    const url = new URL(`${TMDB_API_URL}${path}`);

    // Authenticate using the TMDb v3 API key
    url.searchParams.set("api_key", TMDB_API_KEY);

    // Add optional filters to the request
    Object.entries(parameters).forEach(([name, value]) => {
        url.searchParams.set(name, value);
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`TMDb request failed: ${response.status}`);
    }

    return response.json();
};

// Format a date as YYYY-MM-DD using local time
const formatTMDBDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Retrieve four recent titles compatible with OMDb cards
const getRecentTitles = async (type, startDate, endDate) => {

    const isMovie = type === "movie";

    // Movies and TV shows have different release-date fields
    const dateField = isMovie
        ? "primary_release_date"
        : "first_air_date";

    const data = await fetchTMDB(`/discover/${type}`, {
        [`${dateField}.gte`]: startDate,
        [`${dateField}.lte`]: endDate,
        "sort_by": "popularity.desc",
        "vote_count.gte": 5,
        "language": "en-US"
    });

    // Consider titles that have artwork
    const candidates = data.results
        .filter((item) => item.poster_path)
        .slice(0, 12);

    // Convert TMDb titles to our existing OMDb card structure
    const titles = await Promise.all(
        candidates.map(async (item) => {

            try {
                // Look up the IMDb ID for Favorites and details
                const externalIDs = await fetchTMDB(
                    `/${type}/${item.id}/external_ids`
                );

                // Skip titles without a matching IMDb ID
                if (!externalIDs.imdb_id) return null;

                return {
                    imdbID: externalIDs.imdb_id,
                    Title: isMovie ? item.title : item.name,
                    Year: (
                        isMovie
                            ? item.release_date
                            : item.first_air_date
                    )?.slice(0, 4) || "N/A",
                    Type: isMovie ? "movie" : "series",
                    Poster: `${TMDB_POSTER_URL}${item.poster_path}`
                };

            } catch (error) {
                console.error("Could not load title details:", error);
                return null;
            }
        })
    );

    // Remove unavailable titles and keep only four
    return titles.filter(Boolean).slice(0, 4);
};

// Automatically load recent releases on the homepage
const loadFreshReleases = async () => {

    const today = new Date();

    // Look back up to 120 days, staying within the current year
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const recentStart = new Date(today);
    recentStart.setDate(today.getDate() - 120);

    const startDate = formatTMDBDate(
        recentStart > yearStart ? recentStart : yearStart
    );

    const endDate = formatTMDBDate(today);

    try {

        // Fetch movies and television shows together
        const [movies, series] = await Promise.all([
            getRecentTitles("movie", startDate, endDate),
            getRecentTitles("tv", startDate, endDate)
        ]);

        // Reuse our existing movie cards and favorite buttons
        renderMovies(movies, recentMoviesContainer);
        renderMovies(series, recentSeriesContainer);

        // Hide loading text when releases are available
        if (movies.length || series.length) {
            freshReleasesStatus.hidden = true;
        } else {
            freshReleasesStatus.textContent =
                "No recent releases are available right now.";
        }

    } catch (error) {

        console.error("Fresh Releases error:", error);

        freshReleasesStatus.textContent =
            "Could not load recent releases. Please try again later.";
    }
};

// Load featured titles when SCENEO opens
loadFreshReleases();



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
   MOBILE FILTER PANEL DISMISSAL
   Close the panel when tapping outside
   or pressing the Escape key.
   ========================================= */

// Close filters when clicking outside the panel
document.addEventListener("pointerdown", (event) => {

    // Do nothing if the panel is already closed
    if (mobileFilterPanel.hidden) return;

    // Keep the panel open when interacting with its controls
    if (
        mobileFilterPanel.contains(event.target) ||
        mobileFilterToggle.contains(event.target)
    ) {
        return;
    }

    closeMobileFilters();
});

// Allow keyboard users to close the panel with Escape
document.addEventListener("keydown", (event) => {

    if (event.key === "Escape" && !mobileFilterPanel.hidden) {
        closeMobileFilters();
        mobileFilterToggle.focus();
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

// Render movie cards inside any specified container
const renderMovies = (movies, targetContainer = moviesContainer) => {

    // Remove previous search results
    targetContainer.replaceChildren();

    // Create a card for each returned movie
    movies.forEach((movie) => {

        // Main card container
        const card = document.createElement("article");
        card.className = "movie-card";


        /* =========================================
           MOVIE CARD FAVORITE BUTTON
           Saves or removes this movie locally.
           ========================================= */

        // Create the heart button
        const favoriteButton = document.createElement("button");
        favoriteButton.type = "button";
        favoriteButton.className = "movie-card__favorite";

        // Update the heart based on saved favorites
        const updateFavoriteButton = () => {

            const isFavorite = getFavorites().some(
                (favorite) => favorite.imdbID === movie.imdbID
            );

            // Filled heart = saved, outlined heart = not saved
            favoriteButton.textContent = isFavorite ? "♥" : "♡";

            favoriteButton.classList.toggle("is-favorite", isFavorite);

            // Accessibility for screen readers
            favoriteButton.setAttribute("aria-pressed", String(isFavorite));
            favoriteButton.setAttribute(
                "aria-label",
                isFavorite
                    ? `Remove ${movie.Title} from favorites`
                    : `Add ${movie.Title} to favorites`
            );
        };

        // Display the correct heart when the card is created
        updateFavoriteButton();

        // Save or remove the movie when the heart is clicked
        favoriteButton.addEventListener("click", () => {

            const favorites = getFavorites();

            // Check whether this title has already been saved
            const alreadySaved = favorites.some(
                (favorite) => favorite.imdbID === movie.imdbID
            );

            if (alreadySaved) {

                // Remove this movie from saved favorites
                const updatedFavorites = favorites.filter(
                    (favorite) => favorite.imdbID !== movie.imdbID
                );

                saveFavorites(updatedFavorites);

            } else {

                // Save the movie details needed for its card
                const favoriteMovie = {
                    imdbID: movie.imdbID,
                    Title: movie.Title,
                    Year: movie.Year,
                    Type: movie.Type,
                    Poster: movie.Poster
                };

                saveFavorites([...favorites, favoriteMovie]);
            }

            // Refresh the heart after saving or removing
            updateFavoriteButton();
        });



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


        /* =========================================
           MOVIE DETAILS NAVIGATION
           Opens the selected title's details page.
           ========================================= */

        // Create a link to this movie's details page
        const detailsLink = document.createElement("a");

        detailsLink.href = `./details.html?id=${encodeURIComponent(movie.imdbID)}`;
        detailsLink.className = "movie-card__details-link";

        // Accessible description for screen readers
        detailsLink.setAttribute(
            "aria-label",
            `View details for ${movie.Title}`
        );


        /* =========================================
           SAVE CURRENT VIEW
           Remember where the visitor was before
           opening a movie or TV details page.
           ========================================= */

        detailsLink.addEventListener("click", () => {

            // Identify the currently displayed section
            const currentView = !favoritesSection.hidden
                ? "favorites"
                : !discoverSection.hidden
                    ? "search"
                    : "home";

            // Store the search and navigation settings
            const previousView = {
                view: currentView,
                search: currentSearch,
                page: currentPage,
                type: typeFilter.value,
                sort: sortFilter.value
            };

            // Keep this information for the current browser tab
            sessionStorage.setItem(
                "sceneo-previous-view",
                JSON.stringify(previousView)
            );
        });


        /* =========================================
           RESTORE PREVIOUS VIEW
           Returns visitors to their previous search,
           favorites, or homepage after movie details.
           ========================================= */

        const restorePreviousView = async () => {

            // Retrieve the last saved view
            const savedView = sessionStorage.getItem("sceneo-previous-view");

            if (!savedView) return;

            // Clear it so future visits start normally
            sessionStorage.removeItem("sceneo-previous-view");

            try {

                const previousView = JSON.parse(savedView);

                // Return to saved favorites
                if (previousView.view === "favorites") {
                    favoritesLink.click();
                    return;
                }

                // Restore the previous movie search
                if (previousView.view === "search" && previousView.search) {

                    // Restore the search and filter selections
                    searchInput.value = previousView.search;
                    typeFilter.value = previousView.type || "";
                    sortFilter.value = previousView.sort || "newest";

                    // Load the same search results page
                    await fetchMovies(
                        previousView.search,
                        previousView.page || 1
                    );
                }

                // Otherwise, keep the normal Fresh Releases homepage

            } catch (error) {
                console.error("Could not restore previous view:", error);
            }
        };

        // Restore the saved view when the homepage loads
        restorePreviousView();



        // Assemble the card
        content.append(title, meta);
        card.append(poster, favoriteButton, content, detailsLink);


        // Add the finished card to the grid
        targetContainer.appendChild(card);
    });
};


