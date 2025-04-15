document.addEventListener("DOMContentLoaded", () => {
  const formConnexion = document.getElementById("form-connexion");
  const inputCourriel = document.getElementById("input-courriel");
  const inputMotDePasse = document.getElementById("input-mot-de-passe");
  const courrielErreur = document.getElementById("courriel-erreur");
  const motDePasseErreur = document.getElementById("mot-de-passe-erreur");
  const submitButton = document.getElementById("connexion_button");

  // Fonction de validation de l'email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Fonction de validation du mot de passe
  const validatePassword = (password) => {
    return password.length >= 8;
  };

  formConnexion.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Réinitialiser les messages d'erreur
    courrielErreur.textContent = "";
    motDePasseErreur.textContent = "";

    // Validation des champs
    let isValid = true;

    // Validation de l'email
    if (!inputCourriel.value.trim()) {
      courrielErreur.textContent = "L'email est requis";
      isValid = false;
    } else if (!validateEmail(inputCourriel.value.trim())) {
      courrielErreur.textContent = "Format d'email invalide";
      isValid = false;
    }

    // Validation du mot de passe
    if (!inputMotDePasse.value) {
      motDePasseErreur.textContent = "Le mot de passe est requis";
      isValid = false;
    } else if (!validatePassword(inputMotDePasse.value)) {
      motDePasseErreur.textContent =
        "Le mot de passe doit contenir au moins 8 caractères";
      isValid = false;
    }

    if (!isValid) return;

    try {
      // Désactiver le bouton et afficher le chargement
      submitButton.disabled = true;
      submitButton.textContent = "Connexion en cours...";

      const response = await fetch("/connexion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inputCourriel.value.trim(),
          password: inputMotDePasse.value,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        sessionStorage.setItem("currentUser", JSON.stringify(data.user)); // Stockage
        // Redirection vers la page d'accueil en cas de succès
        window.location.href = "/home";
      } else {
        // Gestion des erreurs
        if (data.details) {
          if (data.details.email) {
            courrielErreur.textContent = data.details.email;
          }
          if (data.details.password) {
            motDePasseErreur.textContent = data.details.password;
          }
        } else if (data.error) {
          // Afficher l'erreur générale
          alert(data.error);
        } else {
          alert("Une erreur est survenue lors de la connexion");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      alert(
        "Une erreur est survenue lors de la connexion. Veuillez réessayer."
      );
    } finally {
      // Réactiver le bouton et restaurer le texte
      submitButton.disabled = false;
      submitButton.textContent = "Connexion";
    }
  });

  // Validation en temps réel
  inputCourriel.addEventListener("input", () => {
    if (!inputCourriel.value.trim()) {
      courrielErreur.textContent = "L'email est requis";
    } else if (!validateEmail(inputCourriel.value.trim())) {
      courrielErreur.textContent = "Format d'email invalide";
    } else {
      courrielErreur.textContent = "";
    }
  });

  inputMotDePasse.addEventListener("input", () => {
    if (!inputMotDePasse.value) {
      motDePasseErreur.textContent = "Le mot de passe est requis";
    } else if (!validatePassword(inputMotDePasse.value)) {
      motDePasseErreur.textContent =
        "Le mot de passe doit contenir au moins 8 caractères";
    } else {
      motDePasseErreur.textContent = "";
    }
  });
});
