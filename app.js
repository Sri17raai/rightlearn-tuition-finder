const demoClasses = [
  {
    id: 1,
    name: "Udaan Learning Centre",
    locality: "Kankarbagh, Patna",
    city: "Patna",
    subjects: ["Mathematics", "Science"],
    levels: ["9-10", "11-12"],
    fee: 800,
    distance: 1.2,
    rating: 4.8,
    languages: ["Hindi", "English"],
    scholarship: true,
    hostel: true,
    girlsSafe: true,
    features: ["Evening batch", "Doubt room", "Free notes"],
    address: "Near Colony More, Kankarbagh Main Road",
    phone: "+91 98765 12001",
    nextBatch: "10 June, 6:00 PM",
    route: "12 minutes from Patna Junction by shared auto",
    seats: 8
  },
  {
    id: 2,
    name: "Prerna Commerce Classes",
    locality: "Laxmi Nagar, Delhi",
    city: "Delhi",
    subjects: ["Commerce", "English"],
    levels: ["11-12"],
    fee: 1500,
    distance: 2.4,
    rating: 4.6,
    languages: ["Hindi", "English"],
    scholarship: true,
    hostel: false,
    girlsSafe: true,
    features: ["Accounts lab", "Weekend tests", "Parent updates"],
    address: "Block C, Laxmi Nagar Market",
    phone: "+91 98765 12002",
    nextBatch: "12 June, 5:30 PM",
    route: "Walkable from Laxmi Nagar Metro Gate 4",
    seats: 14
  },
  {
    id: 3,
    name: "Sankalp NEET Foundation",
    locality: "Indra Vihar, Kota",
    city: "Kota",
    subjects: ["NEET", "Science"],
    levels: ["11-12", "competitive"],
    fee: 3200,
    distance: 0.8,
    rating: 4.7,
    languages: ["Hindi"],
    scholarship: false,
    hostel: true,
    girlsSafe: true,
    features: ["Hostel route", "Daily practice", "Counselling"],
    address: "Indra Vihar Road, close to Talwandi hostels",
    phone: "+91 98765 12003",
    nextBatch: "15 June, 7:00 AM",
    route: "Hostel pickup route available",
    seats: 11
  },
  {
    id: 4,
    name: "Bridge Academy",
    locality: "Hadapsar, Pune",
    city: "Pune",
    subjects: ["Mathematics", "English"],
    levels: ["6-8", "9-10"],
    fee: 600,
    distance: 1.9,
    rating: 4.5,
    languages: ["Hindi", "English", "Marathi"],
    scholarship: true,
    hostel: true,
    girlsSafe: false,
    features: ["Bridge courses", "Basic English", "Library hour"],
    address: "Hadapsar Gaon Road, near bus depot",
    phone: "+91 98765 12004",
    nextBatch: "9 June, 4:00 PM",
    route: "5 minutes from Hadapsar bus depot",
    seats: 18
  },
  {
    id: 5,
    name: "Lakshya JEE Tutorials",
    locality: "Boring Road, Patna",
    city: "Patna",
    subjects: ["JEE", "Mathematics", "Science"],
    levels: ["11-12", "competitive"],
    fee: 2800,
    distance: 3.1,
    rating: 4.9,
    languages: ["Hindi", "English"],
    scholarship: true,
    hostel: false,
    girlsSafe: true,
    features: ["Test series", "Merit discount", "Small batches"],
    address: "Boring Road crossing, second floor",
    phone: "+91 98765 12005",
    nextBatch: "14 June, 6:30 AM",
    route: "Direct bus from Gandhi Maidan",
    seats: 6
  },
  {
    id: 6,
    name: "Nayi Disha Study Room",
    locality: "Ashok Nagar, Ranchi",
    city: "Ranchi",
    subjects: ["Science", "English"],
    levels: ["6-8", "9-10"],
    fee: 300,
    distance: 0.6,
    rating: 4.4,
    languages: ["Hindi", "English"],
    scholarship: true,
    hostel: true,
    girlsSafe: true,
    features: ["Free first month", "Mentor support", "Bus stop nearby"],
    address: "Ashok Nagar Road 2, beside public library",
    phone: "+91 98765 12006",
    nextBatch: "8 June, 5:00 PM",
    route: "2 minutes from Ashok Nagar bus stop",
    seats: 20
  }
];

let classes = [...demoClasses];

const state = {
  search: "",
  level: "all",
  subject: "all",
  budget: 2500,
  languages: new Set(),
  scholarshipOnly: false,
  hostelOnly: false,
  girlsSafeOnly: false,
  sort: "recommended",
  saved: new Set()
};

const citySearch = document.querySelector("#citySearch");
const classLevel = document.querySelector("#classLevel");
const subject = document.querySelector("#subject");
const budget = document.querySelector("#budget");
const budgetValue = document.querySelector("#budgetValue");
const scholarshipOnly = document.querySelector("#scholarshipOnly");
const hostelOnly = document.querySelector("#hostelOnly");
const sortBy = document.querySelector("#sortBy");
const resultsGrid = document.querySelector("#resultsGrid");
const resultCount = document.querySelector("#resultCount");
const shortlistItems = document.querySelector("#shortlistItems");
const shortlistText = document.querySelector("#shortlistText");
const classDialog = document.querySelector("#classDialog");
const dialogContent = document.querySelector("#dialogContent");
const closeDialog = document.querySelector("#closeDialog");
const listingForm = document.querySelector("#listingForm");
const listingStatus = document.querySelector("#listingStatus");

function formatFee(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
}

function getMatches() {
  const search = state.search.trim().toLowerCase();
  const selectedLanguages = Array.from(state.languages);

  const filtered = classes.filter((item) => {
    const matchesSearch = !search ||
      item.city.toLowerCase().includes(search) ||
      item.locality.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search);
    const matchesLevel = state.level === "all" || item.levels.includes(state.level);
    const matchesSubject = state.subject === "all" || item.subjects.includes(state.subject);
    const matchesBudget = item.fee <= state.budget;
    const matchesLanguage = selectedLanguages.length === 0 ||
      selectedLanguages.every((language) => item.languages.includes(language));
    const matchesScholarship = !state.scholarshipOnly || item.scholarship;
    const matchesHostel = !state.hostelOnly || item.hostel;
    const matchesGirlsSafe = !state.girlsSafeOnly || item.girlsSafe;

    return matchesSearch && matchesLevel && matchesSubject && matchesBudget && matchesLanguage && matchesScholarship && matchesHostel && matchesGirlsSafe;
  });

  return filtered.sort((a, b) => {
    if (state.sort === "fee") return a.fee - b.fee;
    if (state.sort === "distance") return a.distance - b.distance;
    if (state.sort === "rating") return b.rating - a.rating;
    return Number(b.scholarship) - Number(a.scholarship) || b.rating - a.rating || a.fee - b.fee;
  });
}

function renderResults() {
  const matches = getMatches();
  resultCount.textContent = `${matches.length} ${matches.length === 1 ? "match" : "matches"}`;

  if (matches.length === 0) {
    resultsGrid.innerHTML = `
      <article class="class-card">
        <div>
          <h3>No classes found yet</h3>
          <p class="meta-row">Try increasing your fee limit or removing one filter.</p>
          <div class="tag-row">
            <span class="tag">Mentor callback available</span>
            <span class="tag scholarship">New listings added weekly</span>
          </div>
        </div>
      </article>
    `;
    renderShortlist();
    return;
  }

  resultsGrid.innerHTML = matches.map((item) => {
    const saved = state.saved.has(item.id);
    const tags = [
      ...item.subjects,
      ...item.languages,
      item.scholarship ? "Scholarship" : null,
      item.hostel ? "Near hostel/bus" : null,
      item.girlsSafe ? "Girls friendly" : null
    ].filter(Boolean);

    return `
      <article class="class-card">
        <div>
          <h3>${item.name}</h3>
          <div class="meta-row">
            <span>${item.locality}</span>
            <span>${item.distance} km away</span>
            <span>★ ${item.rating}</span>
          </div>
          <div class="tag-row">
            ${tags.map((tag) => `<span class="tag ${tag === "Scholarship" ? "scholarship" : ""}">${tag}</span>`).join("")}
          </div>
          <p class="meta-row">${item.features.join(" · ")}</p>
        </div>
        <div class="card-actions">
          <span class="fee">${formatFee(item.fee)}/mo</span>
          <button class="details-button" type="button" data-view="${item.id}">Details</button>
          <button class="save-button ${saved ? "saved" : ""}" type="button" data-save="${item.id}">
            ${saved ? "Saved" : "Save"}
          </button>
        </div>
      </article>
    `;
  }).join("");

  renderShortlist();
}

function renderShortlist() {
  const savedClasses = classes.filter((item) => state.saved.has(item.id));
  shortlistItems.innerHTML = savedClasses.map((item) => `
    <li>
      <button type="button" data-view="${item.id}">${item.name}</button>
      <small>${formatFee(item.fee)}/mo · ${item.locality}</small>
    </li>
  `).join("");
  shortlistText.textContent = savedClasses.length
    ? `${savedClasses.length} saved ${savedClasses.length === 1 ? "class" : "classes"} for comparison.`
    : "Save classes to compare fees, distance, and support.";
}

function openClassDetails(id) {
  const item = classes.find((classItem) => classItem.id === id);
  if (!item) return;

  const saved = state.saved.has(item.id);
  dialogContent.innerHTML = `
    <p class="eyebrow">${item.city} tuition class</p>
    <h2 id="dialogTitle">${item.name}</h2>
    <p class="dialog-lead">${item.locality} · ${item.distance} km away · Rated ${item.rating}/5</p>

    <div class="detail-grid">
      <article>
        <span>Monthly fee</span>
        <strong>${formatFee(item.fee)}</strong>
      </article>
      <article>
        <span>Next batch</span>
        <strong>${item.nextBatch}</strong>
      </article>
      <article>
        <span>Seats left</span>
        <strong>${item.seats}</strong>
      </article>
    </div>

    <div class="detail-section">
      <h3>Subjects and classes</h3>
      <p>${item.subjects.join(", ")} for ${item.levels.map((level) => level === "competitive" ? "competitive exams" : `Class ${level}`).join(", ")}.</p>
    </div>

    <div class="detail-section">
      <h3>Access support</h3>
      <p>${item.route}. Languages: ${item.languages.join(", ")}. ${item.scholarship ? "Scholarship support is available." : "Scholarship support is not listed yet."}</p>
    </div>

    <div class="detail-section">
      <h3>Address and contact</h3>
      <p>${item.address}<br>${item.phone}</p>
    </div>

    <div class="dialog-actions">
      <button type="button" data-apply="${item.id}">Request admission help</button>
      <button class="save-button ${saved ? "saved" : ""}" type="button" data-save="${item.id}">${saved ? "Saved" : "Save to shortlist"}</button>
    </div>
    <p class="form-status" id="dialogStatus" role="status"></p>
  `;

  if (classDialog.hasAttribute("open")) {
    return;
  }

  if (typeof classDialog.showModal === "function") {
    classDialog.showModal();
  } else {
    classDialog.setAttribute("open", "");
  }
}

function closeClassDetails() {
  if (typeof classDialog.close === "function") {
    classDialog.close();
  } else {
    classDialog.removeAttribute("open");
  }
}

function syncBudget() {
  state.budget = Number(budget.value);
  budgetValue.textContent = formatFee(state.budget);
}

function normalizeListing(listing) {
  const subjects = Array.isArray(listing.subjects)
    ? listing.subjects
    : String(listing.subjects || "").split(",").map((subjectName) => subjectName.trim()).filter(Boolean);
  const levels = Array.isArray(listing.levels) ? listing.levels : [listing.level || "9-10"];
  const city = String(listing.city || "").trim();
  const locality = String(listing.locality || "").trim();

  return {
    id: Number(listing.id) || Date.now(),
    name: String(listing.name || "New tuition class").trim(),
    locality: locality && city ? `${locality}, ${city}` : locality || city,
    city,
    subjects: subjects.length ? subjects : ["General"],
    levels,
    fee: Number(listing.fee) || 0,
    distance: Number(listing.distance) || 1,
    rating: Number(listing.rating) || 4.2,
    languages: Array.isArray(listing.languages) ? listing.languages : ["Hindi", "English"],
    scholarship: Boolean(listing.scholarship),
    hostel: Boolean(listing.hostel),
    girlsSafe: Boolean(listing.girlsSafe),
    features: Array.isArray(listing.features) ? listing.features : ["New listing", "Contact for details"],
    address: String(listing.address || locality || city).trim(),
    phone: String(listing.phone || "Contact not added").trim(),
    nextBatch: String(listing.nextBatch || "Contact for next batch").trim(),
    route: String(listing.route || "Route details will be shared by the class owner.").trim(),
    seats: Number(listing.seats) || 10
  };
}

async function loadSavedClasses() {
  if (window.location.protocol === "file:") return;

  try {
    const response = await fetch("/api/classes");
    if (!response.ok) throw new Error("Could not load saved classes");
    const savedClasses = await response.json();
    classes = [...demoClasses, ...savedClasses.map(normalizeListing)];
    renderResults();
  } catch (error) {
    console.warn(error);
  }
}

async function saveListing(listing) {
  if (window.location.protocol === "file:") {
    throw new Error("Start the backend first so listings can be saved permanently.");
  }

  const response = await fetch("/api/classes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(listing)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Could not save listing");
  }

  return response.json();
}

async function saveCallbackRequest(request) {
  if (window.location.protocol === "file:") {
    throw new Error("Start the backend first so callback requests can be saved.");
  }

  const response = await fetch("/api/callbacks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Could not save callback request");
  }

  return response.json();
}

document.querySelector("#finderForm").addEventListener("submit", (event) => {
  event.preventDefault();
  state.search = citySearch.value;
  renderResults();
});

citySearch.addEventListener("input", () => {
  state.search = citySearch.value;
  renderResults();
});

classLevel.addEventListener("change", () => {
  state.level = classLevel.value;
  renderResults();
});

subject.addEventListener("change", () => {
  state.subject = subject.value;
  renderResults();
});

budget.addEventListener("input", () => {
  syncBudget();
  renderResults();
});

document.querySelectorAll("[data-language]").forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) {
      state.languages.add(input.value);
    } else {
      state.languages.delete(input.value);
    }
    renderResults();
  });
});

scholarshipOnly.addEventListener("change", () => {
  state.scholarshipOnly = scholarshipOnly.checked;
  renderResults();
});

hostelOnly.addEventListener("change", () => {
  state.hostelOnly = hostelOnly.checked;
  renderResults();
});

sortBy.addEventListener("change", () => {
  state.sort = sortBy.value;
  renderResults();
});

document.querySelector("#resetFilters").addEventListener("click", () => {
  state.search = "";
  state.level = "all";
  state.subject = "all";
  state.budget = 2500;
  state.languages.clear();
  state.scholarshipOnly = false;
  state.hostelOnly = false;
  state.girlsSafeOnly = false;
  state.sort = "recommended";

  citySearch.value = "";
  classLevel.value = "all";
  subject.value = "all";
  budget.value = "2500";
  scholarshipOnly.checked = false;
  hostelOnly.checked = false;
  sortBy.value = "recommended";
  document.querySelectorAll("[data-language]").forEach((input) => {
    input.checked = false;
  });
  document.querySelectorAll("[data-quick]").forEach((button) => {
    button.classList.remove("active");
  });

  syncBudget();
  renderResults();
});

document.querySelectorAll("[data-quick]").forEach((button) => {
  button.addEventListener("click", () => {
    const quick = button.dataset.quick;
    if (quick === "lowCost") {
      const isActive = button.classList.toggle("active");
      budget.value = isActive ? "1000" : "2500";
      syncBudget();
    }
    if (quick === "girlsSafe") {
      state.girlsSafeOnly = !state.girlsSafeOnly;
      button.classList.toggle("active", state.girlsSafeOnly);
    }
    if (quick === "hostel") {
      state.hostelOnly = !state.hostelOnly;
      hostelOnly.checked = state.hostelOnly;
      button.classList.toggle("active", state.hostelOnly);
    }
    if (quick === "scholarship") {
      state.scholarshipOnly = !state.scholarshipOnly;
      scholarshipOnly.checked = state.scholarshipOnly;
      button.classList.toggle("active", state.scholarshipOnly);
    }
    renderResults();
  });
});

function handleActionClick(event) {
  const detailButton = event.target.closest("[data-view]");
  if (detailButton) {
    openClassDetails(Number(detailButton.dataset.view));
    return;
  }

  const button = event.target.closest("[data-save]");
  if (button) {
    const id = Number(button.dataset.save);
    if (state.saved.has(id)) {
      state.saved.delete(id);
    } else {
      state.saved.add(id);
    }
    renderResults();
    if (classDialog.hasAttribute("open")) {
      openClassDetails(id);
    }
    return;
  }

  const applyButton = event.target.closest("[data-apply]");
  if (applyButton) {
    const item = classes.find((classItem) => classItem.id === Number(applyButton.dataset.apply));
    document.querySelector("#studentNeed").value = "Admission help";
    document.querySelector("#formStatus").textContent = `Admission help selected for ${item.name}. Fill your name and phone to continue.`;
    closeClassDetails();
    document.querySelector("#support").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

resultsGrid.addEventListener("click", handleActionClick);
shortlistItems.addEventListener("click", handleActionClick);
dialogContent.addEventListener("click", handleActionClick);

closeDialog.addEventListener("click", closeClassDetails);
classDialog.addEventListener("click", (event) => {
  if (event.target === classDialog) closeClassDetails();
});

document.querySelector("#supportForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = document.querySelector("#studentName").value.trim();
  const phone = document.querySelector("#studentPhone").value.trim();
  const need = document.querySelector("#studentNeed").value;
  const formStatus = document.querySelector("#formStatus");

  formStatus.textContent = "Saving callback request...";

  try {
    await saveCallbackRequest({ name, phone, need });
    formStatus.textContent = `Thanks, ${name || "student"}. Your callback request is saved for the site owner to review.`;
    event.currentTarget.reset();
  } catch (error) {
    formStatus.textContent = error.message;
  }
});

listingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  listingStatus.textContent = "Saving listing...";

  const listing = {
    name: document.querySelector("#listingName").value,
    owner: document.querySelector("#listingOwner").value,
    city: document.querySelector("#listingCity").value,
    locality: document.querySelector("#listingLocality").value,
    subjects: document.querySelector("#listingSubjects").value,
    level: document.querySelector("#listingLevel").value,
    fee: document.querySelector("#listingFee").value,
    phone: document.querySelector("#listingPhone").value,
    address: document.querySelector("#listingAddress").value,
    nextBatch: document.querySelector("#listingBatch").value,
    scholarship: document.querySelector("#listingScholarship").checked,
    hostel: document.querySelector("#listingHostel").checked,
    girlsSafe: document.querySelector("#listingGirlsSafe").checked
  };

  try {
    const savedListing = await saveListing(listing);
    classes = [...classes, normalizeListing(savedListing)];
    renderResults();
    listingStatus.textContent = "Listing saved permanently and added to search results.";
    listingForm.reset();
    document.querySelector("#classes").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    listingStatus.textContent = error.message;
  }
});

syncBudget();
renderResults();
loadSavedClasses();
