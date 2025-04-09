document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-inscription');
  const nomInput = document.getElementById('input-nom');
  const prenomInput = document.getElementById('input-prenom');
  const courrielInput = document.getElementById('input-courriel');
  const motDePasseInput = document.getElementById('input-mot-de-passe'); 
  const confirmationMotDePasseInput = document.getElementById('input-confirmation-mot-de-passe'); 
  const submitButton = document.getElementById("inscription_button");


  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Réinitialiser les messages d'erreur
    document.querySelectorAll('.erreur-message').forEach(span => span.textContent = '');

    // Validation des champs
    let isValid = true;

    if (!nomInput.value.trim()) {
      document.getElementById('nom-erreur').textContent = 'Le nom est requis';
      isValid = false;
    }

    if (!prenomInput.value.trim()) {
      document.getElementById('prenom-erreur').textContent = 'Le prénom est requis';
      isValid = false;
    }

    if (!courrielInput.value.trim()) {
      document.getElementById('courriel-erreur').textContent = 'Le courriel est requis';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(courrielInput.value)) {
      document.getElementById('courriel-erreur').textContent = 'Format de courriel invalide';
      isValid = false;
    }

    if (!motDePasseInput.value) {
      document.getElementById('mot-de-passe-erreur').textContent = 'Le mot de passe est requis';
      isValid = false;
    } else if (motDePasseInput.value.length < 8) {
      document.getElementById('mot-de-passe-erreur').textContent = 'Le mot de passe doit contenir au moins 8 caractères';
      isValid = false;
    }

    if (motDePasseInput.value !== confirmationMotDePasseInput.value) {
      document.getElementById('confirmation-mot-de-passe-erreur').textContent = 'Les mots de passe ne correspondent pas';
      isValid = false;
    }

    if (!isValid) return;

    try {
      // Désactiver le bouton et afficher le chargement
      submitButton.disabled = true;
      submitButton.textContent = "Inscription en cours...";

      const response = await fetch('/inscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom: nomInput.value.trim(),
          prenom: prenomInput.value.trim(),
          email: courrielInput.value.trim(),
          password: motDePasseInput.value
        })
      });
 
      const data = await response.json();

      if (response.ok) {
        // Redirection vers la page de connexion en cas de succès
        window.location.href = '/connexion';
      } else {
        // Affichage des erreurs du serveur
        if (data.error) {
          if (data.error === "Email déjà utilisé") {
            document.getElementById('courriel-erreur').textContent = data.error;
          } else if (data.details) { 
            // Afficher les erreurs de validation détaillées
            if (data.details.email) {
              document.getElementById('courriel-erreur').textContent = data.details.email;
            }
            if (data.details.password) {
              document.getElementById('mot-de-passe-erreur').textContent = data.details.password;
            }
          } else {
            // Afficher l'erreur générale
            alert(data.error);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      alert('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
    } finally {
      // Réactiver le bouton et restaurer le texte
      submitButton.disabled = false; 
      submitButton.textContent = "S'inscrire";
    }
  });
}); 