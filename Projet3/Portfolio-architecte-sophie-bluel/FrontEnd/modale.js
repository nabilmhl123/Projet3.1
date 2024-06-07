// Récupérer les projets
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

// Mettre en place les filtres
function setupFilters(projects) {
    const filterAll = document.getElementById('tous');
    const filterObjects = document.getElementById('objets');
    const filterApartments = document.getElementById('appartements');
    const filterHotels = document.getElementById('hotel');

    if (filterAll) {
        filterAll.addEventListener('click', (event) => {
            event.preventDefault();
            filterProjects('Tous', projects);
        });
    }

    if (filterObjects) {
        filterObjects.addEventListener('click', (event) => {
            event.preventDefault();
            filterProjectsByCategoryName('Objets', projects);
        });
    }

    if (filterApartments) {
        filterApartments.addEventListener('click', (event) => {
            event.preventDefault();
            filterProjectsByCategoryName('Appartements', projects);
        });
    }

    if (filterHotels) {
        filterHotels.addEventListener('click', (event) => {
            event.preventDefault();
            filterProjectsByCategoryName('Hotels & restaurants', projects);
        });
    }
}

// Filtrer les projets par ID de catégorie ou montrer tous les projets
function filterProjects(categoryId, projects) {
    const filteredProjects = categoryId === 'Tous' ? projects : projects.filter(project => project.category.id === categoryId);
    renderProjects(filteredProjects);
}

// Filtrer les projets par nom de catégorie
function filterProjectsByCategoryName(categoryName, projects) {
    const category = projects.find(project => project.category.name === categoryName);
    if (category) {
        filterProjects(category.category.id, projects);
    } else {
        console.error(`Category "${categoryName}" not found`);
    }
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
        clearArea(modalContent);
        projects.forEach(project => {
            const imgContainer = document.createElement("div");
            imgContainer.classList.add("img-container");
            imgContainer.dataset.imageId = project.id;

            const img = document.createElement("img");
            img.src = project.imageUrl;

            const deleteIcon = document.createElement("i");
            deleteIcon.classList.add("fa", "fa-trash");
            deleteIcon.dataset.imageId = project.id;

            imgContainer.appendChild(img);
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
        return response;
    } catch (error) {
        console.error("Une erreur s'est produite lors de la création du travail :", error);
        throw error;
    }
}

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
            alert('Ajout du projet impossible, une erreur est survenue');
        }
    });
}

// Fonction d'initialisation
document.addEventListener("DOMContentLoaded", async () => {
    const projects = await getProjects();
    renderProjects(projects);
    setupFilters(projects);
    setupFormSubmission(); // Appel de la fonction pour configurer la soumission du formulaire
});


