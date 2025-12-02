// =====================
//  Sélecteurs
// =====================

const modalOverlay = document.querySelector(".modal-overlay");
const modalClose = document.querySelector(".modal-close");
const btnModify = document.querySelector(".btn-modify");

const modalGalleryView = document.querySelector(".modal-gallery-view");
const modalAddView = document.querySelector(".modal-add-view");
const modalGalleryContainer = document.querySelector(".modal-gallery");

const btnOpenAddPhoto = document.querySelector(".modal-add-photo-btn");
const btnBack = document.querySelector(".modal-back");

const addPhotoForm = document.querySelector(".modal-add-form");

const photoInput = document.getElementById("photo-input");
const titleInput = document.getElementById("title");
const categorySelect = document.getElementById("category");
const validateBtn = document.querySelector(".modal-validate-btn");
const uploadArea = document.querySelector(".modal-upload-area");

// Message UI
let messageBox = null;

// =============================
//  CONSTANTES
// =============================
const API_BASE = "http://localhost:5678/api";
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// =============================
//  INITIALISATION
// =============================
(function initModal() {
  btnModify?.addEventListener("click", openModal);
  modalClose?.addEventListener("click", closeModal);

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  btnOpenAddPhoto?.addEventListener("click", openAddView);
  btnBack?.addEventListener("click", openGalleryView);

  photoInput?.addEventListener("change", handlePhotoChange);
  titleInput?.addEventListener("input", updateFormState);
  categorySelect?.addEventListener("change", updateFormState);

  addPhotoForm?.addEventListener("submit", handleSubmit);

  // Box messages
  messageBox = document.createElement("div");
  messageBox.className = "modal-message-box";
  messageBox.style.textAlign = "center";
  messageBox.style.minHeight = "20px";
  messageBox.style.marginTop = "6px";

  document.querySelector(".modal")?.appendChild(messageBox);

  updateValidateBtn(false);
})();

// =============================
//  OUVERTURE / FERMETURE MODALE
// =============================
async function openModal() {
  modalOverlay.classList.remove("hidden");
  await showModalGallery();
  await loadCategories();
  openGalleryView();
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  clearAddForm();
  clearMessage();
}

// =============================
//  AFFICHAGE GALERIE MODALE
// =============================
async function showModalGallery() {
  modalAddView.classList.add("hidden");
  modalGalleryView.classList.remove("hidden");

  try {
    const res = await fetch(`${API_BASE}/works`);
    if (!res.ok) throw new Error();
    const works = await res.json();

    modalGalleryContainer.innerHTML = "";

    works.forEach((work) =>
      modalGalleryContainer.appendChild(createModalFigure(work))
    );
  } catch {
    showMessage("error", "Erreur lors du chargement de la galerie.");
  }
}

// Crée uniquement le <figure> de la modale
function createModalFigure(work) {
  const figure = document.createElement("figure");
  figure.dataset.id = work.id;

  const img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title || "Projet";
  figure.appendChild(img);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
  deleteBtn.title = "Supprimer";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteWork(work.id);
  });

  figure.appendChild(deleteBtn);
  return figure;
}

// =============================
//  SUPPRESSION D’UN TRAVAIL
// =============================
async function deleteWork(id) {
  const token = localStorage.getItem("token");
  if (!token) return showMessage("error", "Vous devez être connecté.");

  try {
    const res = await fetch(`${API_BASE}/works/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return showMessage("error", "Erreur suppression.");

    removeWorkFromDOM(id);
    showMessage("success", "Projet supprimé.");
  } catch {
    showMessage("error", "Erreur suppression.");
  }
}

// =============================
//  SUPPRESSION DOM (galerie + modale)
// =============================
function removeWorkFromDOM(id) {
  document.querySelectorAll(`[data-id="${id}"]`).forEach((el) => el.remove());
}

// =============================
//  NAVIGATION INTERNE
// =============================
async function openAddView() {
  await loadCategories();
  modalGalleryView.classList.add("hidden");
  modalAddView.classList.remove("hidden");
}

function openGalleryView() {
  modalAddView.classList.add("hidden");
  modalGalleryView.classList.remove("hidden");
  clearAddForm();
  clearMessage();
}

// =============================
//  CHARGEMENT CATEGORIES
// =============================
async function loadCategories() {
  if (!categorySelect) return;

  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error();
    const categories = await res.json();

    categorySelect.innerHTML = `
      <option value="" disabled selected>Sélectionner une catégorie</option>
    `;

    categories.forEach((cat) => {
      categorySelect.insertAdjacentHTML(
        "beforeend",
        `<option value="${cat.id}">${cat.name}</option>`
      );
    });
  } catch {
    showMessage("error", "Impossible de charger les catégories.");
  }
}

// =============================
//  PREVIEW + VALIDATION
// =============================
function handlePhotoChange() {
  clearMessage();

  const file = photoInput.files[0];
  if (!file) return removePreview(), updateFormState();

  if (!ALLOWED_TYPES.includes(file.type))
    return invalidFile("Format non supporté (jpg / png)");

  if (file.size > MAX_FILE_SIZE)
    return invalidFile("Fichier trop volumineux (max 4 Mo).");

  createPreview(URL.createObjectURL(file));
  updateFormState();
}

function invalidFile(msg) {
  showMessage("error", msg);
  photoInput.value = "";
  removePreview();
  updateFormState();
}

function createPreview(src) {
  removePreview();
  uploadArea.classList.add("has-preview");

  const previewImg = document.createElement("img");
  previewImg.className = "upload-preview";
  previewImg.src = src;
  previewImg.alt = "preview";
  previewImg.style.maxHeight = "180px";
  previewImg.style.objectFit = "cover";

  uploadArea.prepend(previewImg);
}

function removePreview() {
  uploadArea.querySelector(".upload-preview")?.remove();
  uploadArea.classList.remove("has-preview");
}

function updateFormState() {
  const enabled =
    photoInput.files.length > 0 &&
    titleInput.value.trim().length > 0 &&
    categorySelect.value !== "";

  updateValidateBtn(enabled);
}

function updateValidateBtn(enabled) {
  if (!validateBtn) return;
  validateBtn.disabled = !enabled;
  validateBtn.classList.toggle("active", enabled);
}

// =============================
//  AJOUT DANS LE DOM (NOUVEAU WORK)
// =============================
function addWorkToDOM(work) {
  // ----- Galerie principale -----
  const gallery = document.querySelector(".gallery");
  if (gallery) {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;

    figure.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}">
      <figcaption>${work.title}</figcaption>
    `;

    gallery.appendChild(figure);
  }

  // ----- Modale -----
  modalGalleryContainer.appendChild(createModalFigure(work));
}

// =============================
//  ENVOI DU FORMULAIRE (POST)
// =============================
async function handleSubmit(e) {
  e.preventDefault();
  clearMessage();

  const file = photoInput.files[0];
  const title = titleInput.value.trim();
  const category = categorySelect.value;

  if (!file || !title || !category)
    return showMessage("error", "Veuillez remplir tous les champs.");

  const token = localStorage.getItem("token");
  if (!token) return showMessage("error", "Vous devez être connecté.");

  const formData = new FormData();
  formData.append("image", file);
  formData.append("title", title);
  formData.append("category", category);

  try {
    const res = await fetch(`${API_BASE}/works`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return showMessage("error", err.message || "Erreur lors de l'envoi.");
    }

    const newWork = await res.json();
    addWorkToDOM(newWork);

    showMessage("success", "Projet ajouté !");
    setTimeout(() => {
      clearAddForm();
      openGalleryView();
    }, 800);
  } catch {
    showMessage("error", "Erreur lors de l'envoi. Vérifiez la connexion.");
  }
}

// =============================
//  UTILITAIRES UI
// =============================
function showMessage(type, text) {
  messageBox.textContent = text;
  messageBox.style.color = type === "error" ? "#b00020" : "#0f7a4f";

  if (type === "success") {
    setTimeout(() => (messageBox.textContent = ""), 3000);
  }
}

function clearMessage() {
  messageBox.textContent = "";
}

function clearAddForm() {
  addPhotoForm.reset();
  removePreview();
  updateValidateBtn(false);
  clearMessage();
}
