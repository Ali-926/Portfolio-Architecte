/* ---------------------- 1. Récupération des travaux ---------------------- */
async function getWorks() {
  const response = await fetch("http://localhost:5678/api/works");
  return await response.json();
}

/* ---------------------- 2. Récupération des catégories ---------------------- */
async function getCategories() {
  const response = await fetch("http://localhost:5678/api/categories");
  return await response.json();
}

/* ---------------------- 3. Affichage de la galerie ---------------------- */
function displayWorks(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

/* ---------------------- 4. Affichage des filtres ---------------------- */
function displayFilters(categories, works) {
  const portfolioSection = document.querySelector("#portfolio");

  // Ne jamais bloquer la recréation : permet de recréer les filtres après logout/redirection
  const oldFilters = document.querySelector(".filters");
  if (oldFilters) oldFilters.remove();

  const filtersContainer = document.createElement("div");
  filtersContainer.classList.add("filters");

  // Bouton "Tous"
  const allBtn = document.createElement("button");
  allBtn.textContent = "Tous";
  allBtn.classList.add("filter-btn", "active");
  filtersContainer.appendChild(allBtn);

  allBtn.addEventListener("click", () => {
    setActiveFilter(allBtn);
    displayWorks(works);
  });

  // Boutons dynamiques
  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.textContent = cat.name;
    btn.classList.add("filter-btn");

    btn.addEventListener("click", () => {
      setActiveFilter(btn);
      const filtered = works.filter((work) => work.categoryId === cat.id);
      displayWorks(filtered);
    });

    filtersContainer.appendChild(btn);
  });

  portfolioSection.insertBefore(
    filtersContainer,
    document.querySelector(".gallery")
  );
}

/* ---------------------- 5. Gestion du bouton actif ---------------------- */
function setActiveFilter(btn) {
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

/* ---------------------- 6. Logique de connexion / déconnexion ---------------------- */
function applyLoginState() {
  const token = localStorage.getItem("token");

  const editBanner = document.querySelector(".edit-banner");
  const loginLink = document.querySelector(".login-link");
  const logoutLink = document.querySelector(".logout-link");
  const filters = document.querySelector(".filters");
  const btnModify = document.querySelector(".btn-modify");

  if (token) {
    // MODE CONNECTÉ
    editBanner?.classList.remove("hidden");
    btnModify?.classList.remove("hidden");

    loginLink?.classList.add("hidden");
    logoutLink?.classList.remove("hidden");

    // Masquer les filtres en mode connecté
    filters?.classList.add("hidden");

    logoutLink.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.reload();
    });
  } else {
    // MODE DÉCONNECTÉ
    editBanner?.classList.add("hidden");
    btnModify?.classList.add("hidden");

    loginLink?.classList.remove("hidden");
    logoutLink?.classList.add("hidden");

    // Afficher les filtres
    filters?.classList.remove("hidden");
  }
}

/* ---------------------- 7. Initialisation ---------------------- */
async function init() {
  const works = await getWorks();
  const categories = await getCategories();

  displayWorks(works);

  // IMPORTANT : Générer les filtres avant d'appliquer l'état connexion
  displayFilters(categories, works);

  // Maintenant seulement, adapter l'affichage selon le token
  applyLoginState();
}

init();
