// =====================
//  SÉLECTEURS
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

// =====================
//  CONSTANTES
// =====================
const API_BASE = "http://localhost:5678/api";
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// =====================
//  INITIALISATION
// =====================
(function initModal() {
  if (btnModify) btnModify.addEventListener("click", openModal);
  if (modalClose) modalClose.addEventListener("click", closeModal);

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  if (btnOpenAddPhoto) btnOpenAddPhoto.addEventListener("click", openAddView);
  if (btnBack) btnBack.addEventListener("click", openGalleryView);

  if (photoInput) photoInput.addEventListener("change", handlePhotoChange);
  if (titleInput) titleInput.addEventListener("input", updateFormState);
  if (categorySelect)
    categorySelect.addEventListener("change", updateFormState);

  if (addPhotoForm) addPhotoForm.addEventListener("submit", handleSubmit);

  // Zone de message unifiée
  messageBox = document.createElement("div");
  messageBox.className = "modal-message-box";
  Object.assign(messageBox.style, {
    textAlign: "center",
    minHeight: "20px",
    marginTop: "6px",
  });

  const modal = document.querySelector(".modal");
  if (modal) modal.appendChild(messageBox);

  updateValidateBtn(false);
})();

// =====================
//  OUVERTURE / FERMETURE
// =====================
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

// =====================
//  GALERIE MODALE
// =====================
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

// Crée un <figure> dans la modale
function createModalFigure(work) {
  const figure = document.createElement("figure");
  figure.dataset.id = work.id;
  figure.classList.add("modal-figure");

  // Image
  const img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title || "Projet";
  figure.appendChild(img);

  // Bouton supprimer
  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
  deleteBtn.title = "Supprimer";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteWork(work.id);
  });
  figure.appendChild(deleteBtn);

  // Titre au survol
  const caption = document.createElement("figcaption");
  caption.classList.add("modal-caption");
  caption.textContent = work.title;
  figure.appendChild(caption);

  return figure;
}

// =============================
//  SUPPRESSION
// =============================
async function deleteWork(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    showMessage("error", "Vous devez être connecté pour supprimer un projet.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/works/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      showMessage("error", "Erreur suppression.");
      return;
    }

    removeWorkFromDOM(id);
    showMessage("success", "Projet supprimé.");
  } catch (err) {
    console.error(err);
    showMessage("error", "Erreur suppression.");
  }
}

function removeWorkFromDOM(id) {
  document.querySelectorAll(`[data-id="${id}"]`).forEach((el) => el.remove());
}

// =====================
//  NAVIGATION MODALE
// =====================
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

// =====================
//  CHARGEMENT CATÉGORIES
// =====================
async function loadCategories() {
  if (!categorySelect) return;

  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error();

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

// =====================
//  PREVIEW UPLOAD
// =====================
function handlePhotoChange() {
  clearMessage();

  const file = photoInput.files[0];
  if (!file) {
    removePreview();
    updateFormState();
    return;
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return showInvalid("Format non supporté (jpg / png).");
  }

  if (file.size > MAX_FILE_SIZE) {
    return showInvalid("Fichier trop volumineux (max 4 Mo).");
  }

  createPreview(URL.createObjectURL(file));
  updateFormState();
}

function showInvalid(errorMsg) {
  showMessage("error", errorMsg);
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

  uploadArea.insertBefore(previewImg, uploadArea.firstChild);
}

function removePreview() {
  const prev = uploadArea.querySelector(".upload-preview");
  if (prev) prev.remove();
  uploadArea.classList.remove("has-preview");
}

// =====================
//  ÉTAT DU FORMULAIRE
// =====================
function updateFormState() {
  const enabled =
    photoInput.files.length > 0 &&
    titleInput.value.trim().length > 0 &&
    categorySelect.value !== "";

  updateValidateBtn(enabled);
}

function updateValidateBtn(enabled) {
  if (!validateBtn) return;

  validateBtn.classList.toggle("active", enabled);
  validateBtn.disabled = false; // Ne jamais désactiver
}

// =====================
//  AJOUT DANS LE DOM
// =====================
function addWorkToDOM(work) {
  // Galerie principale
  const gallery = document.querySelector(".gallery");
  if (gallery) {
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
  }

  // Galerie modale
  modalGalleryContainer.appendChild(createModalFigure(work));
}

// =====================
//  ENVOI FORMULAIRE
// =====================
async function handleSubmit(e) {
  e.preventDefault();
  clearMessage();

  const file = photoInput.files[0];
  const title = titleInput.value.trim();
  const category = categorySelect.value;

  if (!file || !title || !category) {
    return showMessage("error", "Veuillez remplir tous les champs.");
  }

  const token = localStorage.getItem("token");
  if (!token) {
    return showMessage(
      "error",
      "Vous devez être connecté pour ajouter un projet."
    );
  }

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
      let errText = `${res.status} ${res.statusText}`;
      try {
        const errJson = await res.json();
        if (errJson?.message) errText = errJson.message;
      } catch {}
      return showMessage("error", `Erreur lors de l'envoi : ${errText}`);
    }

    const newWork = await res.json();
    addWorkToDOM(newWork);

    showMessage("success", "Projet ajouté !");
    setTimeout(() => {
      clearAddForm();
      openGalleryView();
    }, 800);
  } catch (err) {
    console.error(err);
    showMessage("error", "Erreur lors de l'envoi. Vérifiez la connexion.");
  }
}

// =====================
//  UTILITAIRES
// =====================
function showMessage(type, text) {
  if (!messageBox) return;
  messageBox.textContent = text;
  messageBox.style.color = type === "error" ? "#b00020" : "#0f7a4f";

  if (type === "success") {
    setTimeout(() => (messageBox.textContent = ""), 3000);
  }
}

function clearMessage() {
  if (messageBox) messageBox.textContent = "";
}

function clearAddForm() {
  if (addPhotoForm) addPhotoForm.reset();
  removePreview();
  updateValidateBtn(false);
  clearMessage();
}
