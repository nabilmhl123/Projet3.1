// Récupérer les images
async function getProjects() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        const projects = await response.json();
        return projects;
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
    
}


// Récupérer les catégories
async function getCategories() {
    try {
        const response = await fetch("http://localhost:5678/api/categories");
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// Nettoyer une zone spécifique
function clearArea(area) {
    if (area) {
        area.innerHTML = "";
    }
}

// Afficher les projets
function renderProjects(projects) {
    const gallery = document.querySelector(".gallery");
    if (gallery) {
        clearArea(gallery);
        projects.forEach(project => {
            const figure = document.createElement("figure");
            figure.classList.add(`category-${project.category.id}`);
            figure.dataset.id = project.id;

            const img = document.createElement("img");
            img.src = project.imageUrl;

            const caption = document.createElement("figcaption");
            caption.innerText = project.title;

            figure.appendChild(img);
            figure.appendChild(caption);
            gallery.appendChild(figure);
        });
    }
}

// Mettre en place les filtres dynamiquement
async function setupFilters() {
    const categories = await getCategories();
    const filterContainer = document.querySelector('.categories');

    if (filterContainer) {
        // Vider le conteneur de filtres existants
        filterContainer.innerHTML = '';

        // Ajouter le bouton de filtre "Tous"
        const filterAll = document.createElement('div');
        filterAll.innerText = 'Tous';
        filterAll.id = 'tous';
        filterAll.classList.add('filtre-button');
        filterAll.addEventListener('click', () => {
            filterProjects('Tous');
        });
        filterContainer.appendChild(filterAll);

        // Ajouter les boutons de filtre pour chaque catégorie
        categories.forEach(category => {
            const filterButton = document.createElement('div');
            filterButton.innerText = category.name;
            filterButton.id = category.id; // Utiliser l'ID de la catégorie comme identifiant
            filterButton.classList.add('filtre-button');
            filterButton.addEventListener('click', () => {
                filterProjects(category.id);
            });
            filterContainer.appendChild(filterButton);
        });
    }
}

// Filtrer les projets par ID de catégorie ou montrer tous les projets
function filterProjects(categoryId) {
    getProjects().then(projects => {
        const filteredProjects = categoryId === 'Tous' ? projects : projects.filter(project => project.category.id === categoryId);
        renderProjects(filteredProjects);
    });
}

// Afficher la première modale
const modalTrigger = document.querySelector('.modal-trigger');
const modalContainer = document.querySelector('.modal-container');
const closeModalBtn = document.querySelector('.close-modal');
const addPhotoBtn = document.querySelector('.add-photo-btn');
const secondModalContainer = document.querySelector('.second-modal-container');
const secondCloseModalBtn = document.querySelector('.second-modal-container .close-modal');

modalTrigger.addEventListener('click', async function () {
    modalContainer.style.display = 'block';
    const projects = await getProjects();
    displayModalImages(projects);
    setupDeleteIcons(); // Associer les gestionnaires d'événements après l'affichage des images
});

closeModalBtn.addEventListener('click', function () {
    modalContainer.style.display = 'none';
});

modalContainer.addEventListener('click', function (event) {
    if (event.target === modalContainer) {
        modalContainer.style.display = 'none';
    }
});

addPhotoBtn.addEventListener('click', function () {
    modalContainer.style.display = 'none';
    secondModalContainer.style.display = 'block';
});

secondCloseModalBtn.addEventListener('click', function () {
    secondModalContainer.style.display = 'none';
});

// Afficher les images dans la modale
function displayModalImages(projects) {
    const modalContent = document.querySelector('.modal .modal-content');
    if (modalContent) {
        modalContent.innerHTML = ''; // Vider le contenu précédent
        projects.forEach(project => {
            const imgContainer = document.createElement("div");
            imgContainer.classList.add("img-container");
            imgContainer.dataset.imageId = project.id;

            const img = document.createElement("img");
            img.src = project.imageUrl;
            img.alt = project.title || 'Image';

            imgContainer.appendChild(img);

            const deleteIcon = document.createElement("i");
            deleteIcon.classList.add("fa", "fa-trash");
            deleteIcon.dataset.imageId = project.id;

            imgContainer.appendChild(deleteIcon);
            modalContent.appendChild(imgContainer);
        });
    }
}

// Associer les gestionnaires d'événements aux icônes de suppression
function setupDeleteIcons() {
    const deleteIcons = document.querySelectorAll('.fa-trash');
    deleteIcons.forEach(icon => {
        icon.addEventListener('click', async function () {
            const imageId = this.dataset.imageId;
            console.log('Attempting to delete image with ID:', imageId);
            if (imageId) {
                await deleteWorks(imageId);
            } else {
                console.error('Identifiant d\'image non disponible');
            }
        });
    });
}

// Fonction pour supprimer un projet
async function deleteWorks(worksId) {
    try {
        debugger
        let monToken = window.localStorage.getItem('authToken');
        console.log("Récupération du token:", monToken); // Ajout d'un log pour vérifier le token

        if (!monToken) {
            alert("Utilisateur non authentifié. Veuillez vous connecter.");
            return;
        }

        if (confirmDelete()) {
            console.log(`Attempting to delete image with ID: ${worksId}`); // Ajout d'un log pour vérifier l'ID

            const fetchDelete = await fetch(`http://localhost:5678/api/works/${worksId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${monToken}`,
                },
            });

        }
    } catch (error) {
        console.error("Une erreur s'est produite lors de la suppression :", error);
        alert('Suppression impossible, une erreur est survenue');
    }
}

// Fonction de confirmation de suppression
function confirmDelete() {
    return confirm("Voulez-vous supprimer votre projet ?");
}

// Initialisation
document.addEventListener("DOMContentLoaded", async () => {
    const projects = await getProjects();
    renderProjects(projects);
    setupFilters(projects);
});


// Fonction pour soumettre le formulaire
async function createNewWork(categoryValue, file, titleValue) {
    const token = window.localStorage.getItem('authToken');
    const formData = new FormData();
    debugger
    console.log('Category:', categoryValue);
        console.log('Title:', titleValue);
        console.log('File:', file);
    formData.append('category', categoryValue);
    formData.append('image', file);
    formData.append('title', titleValue);

    

    console.log('FormData entries:', Array.from(formData.entries())); // Ajout de log pour vérifier les entrées de FormData

    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: "POST",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`, // Correction de l'interpolation de chaîne ici
            },
            body: formData,
        });

        console.log('Response status:', response.status); // Log du statut de la réponse
        closeModal(modalContainer); // Fermer la modale après l'ajout réussi
        return response;
    } catch (error) {
        console.error("Une erreur s'est produite lors de la création du travail :", error);
        throw error;
    }
}

// Fonction pour déclencher le clic sur l'input file
function triggerFileInput() {
    const fileInput = document.getElementById('photoFile');
    fileInput.click();
}

document.getElementById('buttonValider').addEventListener('click', triggerFileInput);

// Écouteur d'événements pour soumettre le formulaire
function setupFormSubmission() {
    const form = document.getElementById('secondPhotoForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Empêcher le comportement par défaut du formulaire
        const fileInput = document.getElementById('photoFile');
        debugger
        const categoryInput = document.getElementById('photoCategory');
        const titleInput = document.getElementById('photoTitle');

        const file = fileInput.files[0];
        const categoryValue = parseInt(categoryInput.value, 10);
        const titleValue = titleInput.value.trim();

        

        try {
            const response = await createNewWork(categoryValue, file, titleValue);
            console.log('Response:', response); // Log de la réponse pour le débogage
            if (response.ok) {
                alert('Projet ajouté avec succès');
                form.reset(); // Réinitialiser le formulaire après soumission réussie si nécessaire
            } else {
                const errorData = await response.json();
                console.error(`Erreur lors de l'ajout du projet : ${response.statusText}`, errorData);
                alert(`Ajout du projet impossible : ${response.statusText}`);
            }
        } catch (error) {
            console.error("Une erreur s'est produite lors de l'ajout du projet :", error);
            alert('Projet Ajouté');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('secondPhotoForm');
    const submitBtn = document.getElementById('submitPhotoBtn');
    const fileInput = document.getElementById('photoFile');
    const titleInput = document.getElementById('photoTitle');
    const categoryInput = document.getElementById('photoCategory');

    function checkFormValidity() {
        const isFileSelected = fileInput.files.length > 0;
        const isTitleFilled = titleInput.value.trim() !== '';
        const isCategorySelected = categoryInput.value.trim() !== '';

        if (isFileSelected && isTitleFilled && isCategorySelected) {
            submitBtn.classList.add('enabled');
            submitBtn.disabled = false;
        } else {
            submitBtn.classList.remove('enabled');
            submitBtn.disabled = true;
        }
    }

    fileInput.addEventListener('change', checkFormValidity);
    titleInput.addEventListener('input', checkFormValidity);
    categoryInput.addEventListener('change', checkFormValidity);

    checkFormValidity(); // Initial check on page load
});

// Fonction d'initialisation
document.addEventListener("DOMContentLoaded", async () => {
    const projects = await getProjects();
    renderProjects(projects);
    setupFilters(projects);
    setupFormSubmission(); // Appel de la fonction pour configurer la soumission du formulaire
});

function previewPhoto(event) {
    const input = event.target;
    const preview = document.getElementById('photoPreview');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            document.querySelector('#label1 .upload-icon').style.display = 'none';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

