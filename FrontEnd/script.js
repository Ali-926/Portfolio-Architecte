/* 1. Récupération des travaux depuis l'API */
async function getWorks() {
  const response = await fetch("http://localhost:5678/api/works");
  return await response.json();
}

/* 2. Récupération des catégories pour créer les filtres */
async function getCategories() {
  const response = await fetch("http://localhost:5678/api/categories");
  return await response.json();
}

/* 3. Affichage de la galerie */
function displayWorks(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ""; /* vide la galerie */

  works.forEach((work) => {
    const figure = document.createElement("figure");
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

/* 4. Création dynamique des filtres */
function displayFilters(categories, works) {
  const portfolioSection = document.querySelector("#portfolio");

  /* Si les filtres existent déjà, ne pas les recréer */
  if (document.querySelector(".filters")) return;

  const filtersContainer = document.createElement("div");
  filtersContainer.classList.add("filters");

  /* Bouton "Tous" */
  const allBtn = document.createElement("button");
  allBtn.textContent = "Tous";
  allBtn.classList.add("filter-btn", "active");
  filtersContainer.appendChild(allBtn);

  allBtn.addEventListener("click", () => {
    setActiveFilter(allBtn);
    displayWorks(works);
  });

  /* Boutons dynamiques */
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

/* 5. Gestion de l'état actif des boutons */
function setActiveFilter(selectedBtn) {
  document
    .querySelectorAll(".filter-btn")
    .forEach((btn) => btn.classList.remove("active"));
  selectedBtn.classList.add("active");
}

/* 6. Initialisation au chargement */
async function init() {
  const works = await getWorks();
  const categories = await getCategories();

  displayWorks(works); /* Afficher la galerie */
  displayFilters(categories, works); /* Générer les filtres */
}

init();
