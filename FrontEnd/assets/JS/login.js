document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
      afficherErreur("Veuillez remplir tous les champs.");
      return;
    }

    const user = { email, password };

    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        const data = await response.json();
        // Stocke le token
        localStorage.setItem("token", data.token);
        // Redirige vers l'accueil pour que l'état connecté soit pris en compte
        window.location.href = "index.html";
      } else if (response.status === 401 || response.status === 404) {
        afficherErreur("Email ou mot de passe incorrect");
      } else {
        afficherErreur("Une erreur est survenue");
      }
    } catch (error) {
      afficherErreur("Impossible de contacter le serveur");
    }
  });

  function afficherErreur(message) {
    let errorDiv = document.querySelector(".login-error");
    if (!errorDiv) {
      errorDiv = document.createElement("p");
      errorDiv.classList.add("login-error");
      errorDiv.style.color = "red";
      errorDiv.style.textAlign = "center";
      errorDiv.style.marginTop = "15px";
      loginForm.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
  }
});
