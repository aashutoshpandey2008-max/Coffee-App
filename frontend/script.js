const API_URL = "https://coffee-rating-api-tlbd.onrender.com/api/coffees";
let coffees = [];

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
// GET COFFEES FROM BACKEND
// ========================================

async function fetchCoffees() {
  try {

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch coffees");
    }

    coffees = await response.json();

    populateOrigins();
    renderCoffees(coffees);
    renderLeaderboard();
    updateStats();

  } catch (error) {

    console.error(error);

    coffeeContainer.innerHTML = `
      <p class="no-results">
        Unable to load coffees.
        Make sure the backend server is running.
      </p>
    `;
  }
}


// ========================================
// DISPLAY COFFEE CARDS
// ========================================

function renderCoffees(data) {

  coffeeContainer.innerHTML = "";

  if (data.length === 0) {

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

      <h3>${coffee.name}</h3>

      <p class="rating">
        ★ ${coffee.rating.toFixed(1)} / 5
      </p>

      <p class="vote-info">
        <span>${coffee.votes}</span> community votes
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
// VOTE
// ========================================

async function vote(id, button) {

  try {

    button.disabled = true;
    button.textContent = "Voting...";

    const response = await fetch(
      `${API_URL}/${id}/vote`,
      {
        method: "POST"
      }
    );

    if (!response.ok) {
      throw new Error("Vote failed");
    }

    const updatedCoffee = await response.json();

    const index =
      coffees.findIndex(
        coffee => coffee.id === updatedCoffee.id
      );

    if (index !== -1) {
      coffees[index] = updatedCoffee;
    }

    applyFilters();

    renderLeaderboard();
    updateStats();

  } catch (error) {

    console.error(error);

    alert("Could not register your vote.");

  } finally {

    button.disabled = false;
    button.textContent = "Vote for this roast";
  }
}


// ========================================
// LEADERBOARD
// ========================================

function renderLeaderboard() {

  const topThree = [...coffees]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3);

  const medals = ["🥇", "🥈", "🥉"];

  leaderboardContainer.innerHTML = "";

  topThree.forEach((coffee, index) => {

    const card = document.createElement("div");

    card.className = "leader-card";

    card.innerHTML = `
      <div class="position">
        ${medals[index]}
      </div>

      <h3>${coffee.name}</h3>

      <p>
        ${coffee.origin} • ${coffee.roast} Roast
      </p>

      <p>
        ★ ${coffee.rating.toFixed(1)}
      </p>

      <p>
        <strong>${coffee.votes}</strong> votes
      </p>
    `;

    leaderboardContainer.appendChild(card);
  });
}


// ========================================
// STATS
// ========================================

function updateStats() {

  document.getElementById("coffeeCount")
    .textContent = coffees.length;

  const totalVotes =
    coffees.reduce(
      (total, coffee) => total + coffee.votes,
      0
    );

  document.getElementById("voteCount")
    .textContent = totalVotes.toLocaleString();

  const origins =
    new Set(coffees.map(coffee => coffee.origin));

  document.getElementById("countryCount")
    .textContent = origins.size;
}


// ========================================
// ORIGIN FILTER
// ========================================

function populateOrigins() {

  const origins =
    [...new Set(
      coffees.map(coffee => coffee.origin)
    )].sort();

  originFilter.innerHTML =
    `<option value="all">All Origins</option>`;

  origins.forEach(origin => {

    const option =
      document.createElement("option");

    option.value = origin;
    option.textContent = origin;

    originFilter.appendChild(option);
  });
}


// ========================================
// SEARCH + FILTER
// ========================================

function applyFilters() {

  const search =
    searchInput.value.toLowerCase().trim();

  const selectedOrigin =
    originFilter.value;

  const selectedRoast =
    roastFilter.value;

  const filtered =
    coffees.filter(coffee => {

      const matchesSearch =
        coffee.name.toLowerCase().includes(search) ||
        coffee.origin.toLowerCase().includes(search);

      const matchesOrigin =
        selectedOrigin === "all" ||
        coffee.origin === selectedOrigin;

      const matchesRoast =
        selectedRoast === "all" ||
        coffee.roast === selectedRoast;

      return (
        matchesSearch &&
        matchesOrigin &&
        matchesRoast
      );
    });

  renderCoffees(filtered);
}


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