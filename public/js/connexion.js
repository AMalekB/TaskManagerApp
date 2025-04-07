let inputCourriel = document.getElementById("input-courriel");
let inputMotDePasse = document.getElementById("input-mot-de-passe");
let formConnexion = document.getElementById("form-connexion");

formConnexion.addEventListener("submit", async (event) => {
  event.preventDefault();

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
    // Si l'authentification est réussi, on
    // redirige vers une autre page
    window.location.replace("/");
  } else {
    // Si l'authentification ne réussi pas, on
    // a le message d'erreur dans l'objet "data"
    let data = await response.json();

    alert("echec de connexion", data.erreur);
  }
});
