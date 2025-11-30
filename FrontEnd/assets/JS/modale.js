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
  // sécurité : certains éléments peuvent être masqués s'ils ne sont pas enregistrés
  if (btnModify) {
    btnModify.addEventListener("click", openModal);
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  // fermer en cliquant en dehors
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // navigation entre vues
  if (btnOpenAddPhoto) btnOpenAddPhoto.addEventListener("click", openAddView);
  if (btnBack) btnBack.addEventListener("click", openGalleryView);

  // preview + validation
  if (photoInput) photoInput.addEventListener("change", handlePhotoChange);
  if (titleInput) titleInput.addEventListener("input", updateFormState);
  if (categorySelect)
    categorySelect.addEventListener("change", updateFormState);

  // envoi du formulaire
  if (addPhotoForm) addPhotoForm.addEventListener("submit", handleSubmit);

  // crée message dans la modale
  messageBox = document.createElement("div");
  messageBox.className = "modal-message-box";
  // style
  messageBox.style.textAlign = "center";
  messageBox.style.minHeight = "20px";
  messageBox.style.marginTop = "6px";
  const modal = document.querySelector(".modal");
  if (modal) modal.appendChild(messageBox);

  // état initial du bouton
  updateValidateBtn(false);
})();

// =============================
//  OUVERTURE / FERMETURE MODALE
// =============================
async function openModal() {
  modalOverlay.classList.remove("hidden");
  await showModalGallery();
  // toujours charger les catégories pour qu'elles soient à jour
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
  // aficher/maquer galerie
  modalAddView.classList.add("hidden");
  modalGalleryView.classList.remove("hidden");

  // Fetch travaux galerie modale
  try {
    const res = await fetch(`${API_BASE}/works`);
    if (!res.ok) throw new Error("Impossible de charger les travaux");
    const works = await res.json();

    modalGalleryContainer.innerHTML = "";

    works.forEach((work) => {
      const figure = document.createElement("figure");

      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title || "Projet";
      figure.appendChild(img);

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
      deleteBtn.title = "Supprimer";

      deleteBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        await deleteWork(work.id);
      });

      figure.appendChild(deleteBtn);
      modalGalleryContainer.appendChild(figure);
    });
  } catch (err) {
    showMessage("error", "Erreur lors du chargement de la galerie.");
    console.error(err);
  }
}

// =============================
//  SUPPRESSION D’UN TRAVAIL
// =============================
async function deleteWork(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    showMessage("error", "Vous devez être connecté pour supprimer.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/works/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      showMessage("error", "Erreur suppression.");
      return;
    }

    // actualise modale + page galerie
    await showModalGallery();
    if (typeof loadGallery === "function") loadGallery();
    showMessage("success", "Projet supprimé.");
  } catch (err) {
    console.error(err);
    showMessage("error", "Erreur suppression.");
  }
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
//  CHARGEMENT CATEGORIES DYNAMIQUES
// =============================
async function loadCategories() {
  if (!categorySelect) return;
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error("Erreur categories");
    const categories = await res.json();

    categorySelect.innerHTML = "";
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Sélectionner une catégorie";
    placeholder.disabled = true;
    placeholder.selected = true;
    categorySelect.appendChild(placeholder);

    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
    showMessage("error", "Impossible de charger les catégories.");
  }
}
