let inputCourriel = document.getElementById("input-courriel");
let inputMotDePasse = document.getElementById("input-mot-de-passe");
let formConnexion = document.getElementById("form-connexion");

// Utiliser les <span> existants pour afficher les erreurs
let courrielErreur = document.getElementById("courriel-erreur");
let motDePasseErreur = document.getElementById("mot-de-passe-erreur");

formConnexion.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Réinitialiser les messages d'erreur
  courrielErreur.textContent = "";
  motDePasseErreur.textContent = "";

  const data = {
    email: inputCourriel.value,
    password: inputMotDePasse.value,
  };

  let response = await fetch("/connexion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    // Si l'authentification est réussie, on redirige vers une autre page
    window.location.replace("/");
  } else {
    // Si l'authentification échoue, on affiche les messages d'erreur
    let data = await response.json();

    if (data.details) {
      if (data.details.email) {
        courrielErreur.textContent = data.details.email;
      }
      if (data.details.password) {
        motDePasseErreur.textContent = data.details.password;
      }
    } else {
      alert("Erreur inconnue : " + data.erreur);
    }
  }
});