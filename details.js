
/* =========================================
   SCENEO — MOVIE & TV DETAILS
   Fetches information using an IMDb ID.
   ========================================= */

// Use the same OMDb API key from script.js
const OMDB_API_KEY = "ef678e1f";
const OMDB_API_URL = "https://www.omdbapi.com/";

// Get the movie ID from the page URL
const urlParams = new URLSearchParams(window.location.search);
const movieID = urlParams.get("id");

// Page elements
const detailsStatus = document.getElementById("details-status");
const detailsContent = document.getElementById("details-content");

// Load information for the selected movie or TV show
const loadMovieDetails = async () => {

    // Make sure an IMDb ID was provided
    if (!movieID) {
        detailsStatus.textContent = "No movie selected.";
        return;
    }

    try {
        detailsStatus.textContent = "Loading movie details...";

        // Request full information from OMDb
        const response = await fetch(
            `${OMDB_API_URL}?apikey=${OMDB_API_KEY}&i=${encodeURIComponent(movieID)}&plot=full`
        );

        if (!response.ok) {
            throw new Error("Could not connect to OMDb.");
        }

        const movie = await response.json();

        if (movie.Response === "False") {
            throw new Error(movie.Error);
        }

        // Update the browser tab title
        document.title = `${movie.Title} | SCENEO`;

        // Create the movie heading
        const title = document.createElement("h1");
        title.textContent = movie.Title;

        // Create movie metadata
        const metadata = document.createElement("p");
        metadata.textContent =
            `${movie.Year} · ${movie.Rated} · ${movie.Runtime}`;

        // Display the IMDb rating
        const rating = document.createElement("p");
        rating.textContent = `IMDb Rating: ${movie.imdbRating}/10`;

        // Create the movie description
        const plot = document.createElement("p");
        plot.textContent = movie.Plot;


        /* =========================================
           CINEMATIC MOVIE DETAILS LAYOUT
           Organizes the poster and movie information
           into separate responsive containers.
           ========================================= */

        // Main hero container
        const hero = document.createElement("div");
        hero.className = "details__hero";

        // Movie information container
        const info = document.createElement("div");
        info.className = "details__info";

        // Assign classes for our cinematic styling
        title.className = "details__title";
        metadata.className = "details__meta";
        rating.className = "details__rating";
        plot.className = "details__plot";

        // Display the movie poster when available
        if (movie.Poster && movie.Poster !== "N/A") {

            const poster = document.createElement("img");

            poster.src = movie.Poster;
            poster.alt = `${movie.Title} poster`;
            poster.className = "details__poster";

            hero.appendChild(poster);
        }


        /* =========================================
           MOVIE GENRES
           Display each OMDb genre as a separate tag.
           ========================================= */

        // Container for the genre tags
        const genres = document.createElement("div");
        genres.className = "details__genres";

        // Only display genres when OMDb provides them
        if (movie.Genre && movie.Genre !== "N/A") {

            // OMDb separates genres using commas
            movie.Genre.split(",").forEach((genre) => {

                // Create an individual genre badge
                const badge = document.createElement("span");
                badge.className = "details__genre";
                badge.textContent = genre.trim();

                genres.appendChild(badge);
            });
        }

        // Group all movie information together
        info.append(title, metadata, genres, rating, plot);


        /* =========================================
           ADDITIONAL MOVIE RATINGS
           Display Rotten Tomatoes and Metacritic
           when available from OMDb.
           ========================================= */

        // Container for additional ratings
        const additionalRatings = document.createElement("div");
        additionalRatings.className = "details__extra-ratings";

        // Only display ratings provided by OMDb
        const ratings = Array.isArray(movie.Ratings)
            ? movie.Ratings
            : [];

        // Create a badge for each additional rating
        ratings.forEach((item) => {

            // IMDb is already displayed separately
            if (item.Source === "Internet Movie Database") return;

            const badge = document.createElement("span");
            badge.className = "details__rating-badge";

            badge.textContent = `${item.Source}: ${item.Value}`;

            additionalRatings.appendChild(badge);
        });

        // Place additional ratings beneath the IMDb rating
        if (additionalRatings.children.length > 0) {
            rating.after(additionalRatings);
        }



        /* =========================================
           DETAILS PAGE — FAVORITES BUTTON
           Saves or removes the selected movie using
           the same localStorage as the homepage.
           ========================================= */

        // Create the Favorites button
        const favoriteButton = document.createElement("button");
        favoriteButton.type = "button";
        favoriteButton.className = "details__favorite";

        // Use the same storage key as script.js
        const FAVORITES_KEY = "sceneo-favorites";

        // Retrieve existing saved movies
        const getFavorites = () => {
            try {
                const saved = JSON.parse(
                    localStorage.getItem(FAVORITES_KEY) || "[]"
                );

                return Array.isArray(saved) ? saved : [];
            } catch (error) {
                console.error("Unable to load favorites:", error);
                return [];
            }
        };

        // Update the button depending on saved status
        const updateFavoriteButton = () => {

            const isSaved = getFavorites().some(
                (item) => item.imdbID === movie.imdbID
            );

            favoriteButton.textContent = isSaved
                ? "♥ Remove from Favorites"
                : "♡ Add to Favorites";

            favoriteButton.setAttribute("aria-pressed", String(isSaved));
        };

        // Save or remove the current title
        favoriteButton.addEventListener("click", () => {

            const favorites = getFavorites();

            const isSaved = favorites.some(
                (item) => item.imdbID === movie.imdbID
            );

            // Save the same movie fields used by the homepage
            const favoriteMovie = {
                imdbID: movie.imdbID,
                Title: movie.Title,
                Year: movie.Year,
                Type: movie.Type,
                Poster: movie.Poster
            };

            const updatedFavorites = isSaved
                ? favorites.filter((item) => item.imdbID !== movie.imdbID)
                : [...favorites, favoriteMovie];

            try {
                localStorage.setItem(
                    FAVORITES_KEY,
                    JSON.stringify(updatedFavorites)
                );

                updateFavoriteButton();

            } catch (error) {
                console.error("Unable to save favorites:", error);
            }
        });

        // Display the current saved status
        updateFavoriteButton();

        // Place the button inside the movie information
        info.appendChild(favoriteButton);



        // Assemble the final hero layout
        hero.appendChild(info);

        // Replace previous content with the new layout
        detailsContent.replaceChildren(hero);


        /* =========================================
           PRODUCTION & CAST INFORMATION
           Displays additional details from OMDb.
           ========================================= */

        // Create the production information section
        const production = document.createElement("section");
        production.className = "details__production";

        // Section heading
        const productionTitle = document.createElement("h2");
        productionTitle.className = "details__section-title";
        productionTitle.textContent = "Production & Cast";

        // Container for movie information
        const productionGrid = document.createElement("dl");
        productionGrid.className = "details__production-grid";

        // Information provided by OMDb
        const productionData = [
            ["Director", movie.Director],
            ["Cast", movie.Actors],
            ["Writer", movie.Writer],
            ["Release Date", movie.Released],
            ["Country", movie.Country],
            ["Language", movie.Language],
            ["Awards", movie.Awards],
            ["Box Office", movie.BoxOffice]
        ];

        // Create a label and value for each available field
        productionData.forEach(([label, value]) => {

            // Skip information that OMDb doesn't provide
            if (!value || value === "N/A") return;

            const item = document.createElement("div");
            item.className = "details__production-item";

            const term = document.createElement("dt");
            term.textContent = label;

            const description = document.createElement("dd");
            description.textContent = value;

            item.append(term, description);
            productionGrid.appendChild(item);
        });

        // Add the production section beneath the hero
        production.append(productionTitle, productionGrid);
        detailsContent.appendChild(production);



        // Display content and hide loading message
        detailsContent.hidden = false;
        detailsStatus.hidden = true;

    } catch (error) {
        console.error("Movie details error:", error);
        detailsStatus.textContent =
            "Unable to load movie details. Please try again.";
    }
};

// Fetch movie information when the page opens
loadMovieDetails();
