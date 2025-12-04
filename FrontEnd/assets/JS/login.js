// Attend que tout le DOM soit chargé avant d'exécuter le script
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return; // Sécurité : si le formulaire n'existe pas, on arrête tout

  // Écoute la soumission du formulaire
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Empêche le rechargement classique de la page

    // Récupération des champs email et mot de passe
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    // Vérification des champs requis
    if (!email || !password) {
      afficherErreur("Veuillez remplir tous les champs.");
      return;
    }

    // Données envoyées à l’API
    const user = { email, password };

    try {
      // Requête POST vers l’API de login
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      // Si l'authentification réussit
      if (response.ok) {
        const data = await response.json();

        // Stocke le token dans le localStorage pour le mode admin
        localStorage.setItem("token", data.token);

        // Redirection vers la page d'accueil (qui affichera l'état connecté)
        window.location.href = "index.html";

        // Gestion des erreurs d'identifiants
      } else if (response.status === 401 || response.status === 404) {
        afficherErreur("Email ou mot de passe incorrect");

        // Gestion d'autres erreurs éventuelles
      } else {
        afficherErreur("Une erreur est survenue");
      }
    } catch (error) {
      // Si le serveur est inaccessible
      afficherErreur("Impossible de contacter le serveur");
    }
  });

  // Fonction utilitaire : affiche un message d'erreur sous le formulaire
  function afficherErreur(message) {
    let errorDiv = document.querySelector(".login-error");

    // Si l'élément n'existe pas encore, on le crée
    if (!errorDiv) {
      errorDiv = document.createElement("p");
      errorDiv.classList.add("login-error");
      errorDiv.style.color = "red";
      errorDiv.style.textAlign = "center";
      errorDiv.style.marginTop = "15px";
      loginForm.appendChild(errorDiv);
    }

    // Mise à jour du texte du message d’erreur
    errorDiv.textContent = message;
  }
});
