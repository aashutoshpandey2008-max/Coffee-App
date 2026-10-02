// ========================================
// API CONFIGURATION
// ========================================

const API_URL =
  "https://coffee-rating-api-tlbd.onrender.com/api/coffees";

let coffees = [];


// ========================================
// DOM ELEMENTS
// ========================================

const coffeeContainer =
  document.getElementById("coffeeContainer");

const leaderboardContainer =
  document.getElementById("leaderboardContainer");

const searchInput =
  document.getElementById("searchInput");

const originFilter =
  document.getElementById("originFilter");

const roastFilter =
  document.getElementById("roastFilter");


// ========================================
// FETCH COFFEES
// ========================================

async function fetchCoffees() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch coffees. Status: ${response.status}`
      );
    }

    const data = await response.json();

    console.log("API data:", data);
    console.log("Is array:", Array.isArray(data));

    // Make sure API actually returned an array
    if (!Array.isArray(data)) {
      throw new Error(
        "API response is not an array."
      );
    }

    coffees = data;

    populateOrigins();
    renderCoffees(coffees);
    renderLeaderboard();
    updateStats();

  } catch (error) {
    console.error("Fetch error:", error);

    coffeeContainer.innerHTML = `
      <p class="no-results">
        Unable to load coffees.
        Please try again later.
      </p>
    `;
  }
}


// ========================================
// RENDER COFFEE CARDS
// ========================================

function renderCoffees(data) {
  coffeeContainer.innerHTML = "";

  if (!Array.isArray(data) || data.length === 0) {
    coffeeContainer.innerHTML = `
      <p class="no-results">
        No coffees found.
      </p>
    `;

    return;
  }

  data.forEach((coffee) => {
    const card = document.createElement("article");

    card.className = "coffee-card";

    card.innerHTML = `
      <div class="card-top">

        <span class="origin">
          ${coffee.origin}
        </span>

        <span class="roast">
          ${coffee.roast} Roast
        </span>

      </div>

      <h3>
        ${coffee.name}
      </h3>

      <p class="rating">
        ★ ${Number(coffee.rating).toFixed(1)} / 5
      </p>

      <p class="vote-info">
        <span>${coffee.votes}</span>
        community votes
      </p>

      <button
        class="vote-btn"
        onclick="vote(${coffee.id}, this)"
      >
        Vote for this roast
      </button>
    `;

    coffeeContainer.appendChild(card);
  });
}


// ========================================
// VOTE FOR COFFEE
// ========================================

async function vote(id, button) {
  try {
    button.disabled = true;
    button.textContent = "Voting...";

    const response = await fetch(
      `${API_URL}/${id}/vote`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Vote failed. Status: ${response.status}`
      );
    }

    const updatedCoffee =
      await response.json();

    console.log(
      "Updated coffee:",
      updatedCoffee
    );

    const index =
      coffees.findIndex(
        (coffee) =>
          coffee.id === updatedCoffee.id
      );

    if (index !== -1) {
      coffees[index] = updatedCoffee;
    }

    // Re-render current filtered list
    applyFilters();

    // Update leaderboard instantly
    renderLeaderboard();

    // Update total vote count
    updateStats();

  } catch (error) {
    console.error(
      "Vote error:",
      error
    );

    alert(
      "Could not register your vote. Please try again."
    );

  } finally {
    button.disabled = false;
    button.textContent =
      "Vote for this roast";
  }
}


// ========================================
// LEADERBOARD
// ========================================

function renderLeaderboard() {
  leaderboardContainer.innerHTML = "";

  if (
    !Array.isArray(coffees) ||
    coffees.length === 0
  ) {
    leaderboardContainer.innerHTML = `
      <p class="no-results">
        No leaderboard data available.
      </p>
    `;

    return;
  }

  const topThree =
    [...coffees]
      .sort(
        (a, b) =>
          Number(b.votes) -
          Number(a.votes)
      )
      .slice(0, 3);

  const medals = [
    "🥇",
    "🥈",
    "🥉"
  ];

  topThree.forEach(
    (coffee, index) => {

      const card =
        document.createElement("div");

      card.className =
        "leader-card";

      card.innerHTML = `
        <div class="position">
          ${medals[index]}
        </div>

        <h3>
          ${coffee.name}
        </h3>

        <p>
          ${coffee.origin}
          •
          ${coffee.roast} Roast
        </p>

        <p>
          ★ ${Number(coffee.rating).toFixed(1)}
        </p>

        <p>
          <strong>
            ${coffee.votes}
          </strong>
          votes
        </p>
      `;

      leaderboardContainer
        .appendChild(card);
    }
  );
}


// ========================================
// UPDATE STATISTICS
// ========================================

function updateStats() {
  if (!Array.isArray(coffees)) {
    return;
  }

  // Number of coffees
  document
    .getElementById("coffeeCount")
    .textContent =
    coffees.length;

  // Total votes
  const totalVotes =
    coffees.reduce(
      (total, coffee) =>
        total +
        Number(coffee.votes || 0),
      0
    );

  document
    .getElementById("voteCount")
    .textContent =
    totalVotes.toLocaleString();

  // Unique countries
  const origins =
    new Set(
      coffees.map(
        (coffee) =>
          coffee.origin
      )
    );

  document
    .getElementById("countryCount")
    .textContent =
    origins.size;
}


// ========================================
// POPULATE ORIGIN FILTER
// ========================================

function populateOrigins() {
  if (!Array.isArray(coffees)) {
    console.error(
      "populateOrigins expected an array:",
      coffees
    );

    return;
  }

  const origins =
    [
      ...new Set(
        coffees.map(
          (coffee) =>
            coffee.origin
        )
      )
    ].sort();

  originFilter.innerHTML = `
    <option value="all">
      All Origins
    </option>
  `;

  origins.forEach(
    (origin) => {

      const option =
        document.createElement(
          "option"
        );

      option.value = origin;
      option.textContent = origin;

      originFilter.appendChild(
        option
      );
    }
  );
}


// ========================================
// SEARCH AND FILTER
// ========================================

function applyFilters() {
  if (!Array.isArray(coffees)) {
    return;
  }

  const search =
    searchInput.value
      .toLowerCase()
      .trim();

  const selectedOrigin =
    originFilter.value;

  const selectedRoast =
    roastFilter.value;

  const filtered =
    coffees.filter(
      (coffee) => {

        const coffeeName =
          String(
            coffee.name || ""
          ).toLowerCase();

        const coffeeOrigin =
          String(
            coffee.origin || ""
          ).toLowerCase();

        const matchesSearch =
          coffeeName.includes(
            search
          ) ||
          coffeeOrigin.includes(
            search
          );

        const matchesOrigin =
          selectedOrigin === "all" ||
          coffee.origin ===
            selectedOrigin;

        const matchesRoast =
          selectedRoast === "all" ||
          coffee.roast ===
            selectedRoast;

        return (
          matchesSearch &&
          matchesOrigin &&
          matchesRoast
        );
      }
    );

  renderCoffees(filtered);
}


// ========================================
// EVENT LISTENERS
// ========================================

searchInput.addEventListener(
  "input",
  applyFilters
);

originFilter.addEventListener(
  "change",
  applyFilters
);

roastFilter.addEventListener(
  "change",
  applyFilters
);


// ========================================
// START APPLICATION
// ========================================

fetchCoffees();