 // Fonction pour vérifier l'état de connexion
 function checkLoginStatus() {
    const authToken = localStorage.getItem('authToken');
    return authToken !== null;
}

// Fonction pour effectuer la déconnexion
function logout() {
    const confirmation = confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
    if (confirmation) {
        localStorage.removeItem('authToken');
        alert("Déconnexion réussie");
        window.location.href = 'formulaire.html';
    }
}

// Écouter l'événement "DOMContentLoaded" pour afficher le bon lien
document.addEventListener('DOMContentLoaded', function () {
    const isLoggedIn = checkLoginStatus();
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');

    if (isLoggedIn) {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
    } else {
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
    }
});