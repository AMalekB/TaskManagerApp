document.addEventListener('DOMContentLoaded', () => {
  console.log('Page d\'accueil chargée');
  
  // Animation simple pour le titre
  const title = document.getElementById('welcome_h2');
  if (title) {
    title.style.opacity = '0';
    title.style.transition = 'opacity 1s ease-in-out';
    setTimeout(() => {
      title.style.opacity = '1';
    }, 300);
  }
}); 