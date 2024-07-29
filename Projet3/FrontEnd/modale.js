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
            addProjectToGallery(project);
        });
    }
}

// Ajouter un projet à la galerie
function addProjectToGallery(project) {
    console.log('addProjectToGallery appelé avec:', project);

    if (!project || !project.id || !project.categoryId || !project.imageUrl) {
        console.error('Projet invalide:', project);
        return;
    }

    const gallery = document.querySelector(".gallery");
    if (gallery) {
        const figure = document.createElement("figure");
        figure.classList.add(`category-${project.categoryId}`);
        figure.dataset.id = project.id;

        const img = document.createElement("img");
        img.src = project.imageUrl;

        const caption = document.createElement("figcaption");
        caption.innerText = project.title;

        figure.appendChild(img);
        figure.appendChild(caption);
        gallery.appendChild(figure);
        console.log('Image ajoutée à la galerie:', project);
    }
}

// Mettre en place les filtres dynamiquement
async function setupFilters() {
    const categories = await getCategories();
    const filterContainer = document.querySelector('.categories');

    if (filterContainer) {
        filterContainer.innerHTML = '';

        const filterAll = document.createElement('div');
        filterAll.innerText = 'Tous';
        filterAll.id = 'tous';
        filterAll.classList.add('filtre-button');
        filterAll.addEventListener('click', () => {
            filterProjects('Tous');
            setActiveButton(filterAll);
        });
        filterContainer.appendChild(filterAll);

        categories.forEach(category => {
            const filterButton = document.createElement('div');
            filterButton.innerText = category.name;
            filterButton.id = category.id;
            filterButton.classList.add('filtre-button');
            filterButton.addEventListener('click', () => {
                filterProjects(category.id);
                setActiveButton(filterButton);
            });
            filterContainer.appendChild(filterButton);
        });

        setActiveButton(filterAll);
    }
}

// Fonction pour définir le bouton actif
function setActiveButton(activeButton) {
    const buttons = document.querySelectorAll('.filtre-button');
    buttons.forEach(button => {
        button.classList.remove('active');
        button.style.backgroundColor = '';
        button.style.color = '';
    });

    activeButton.classList.add('active');
    activeButton.style.backgroundColor = '#1D6154';
    activeButton.style.color = 'white';
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
    setupDeleteIcons();
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
        modalContent.innerHTML = '';
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
        let monToken = window.localStorage.getItem('authToken');
        if (!monToken) {
            alert("Utilisateur non authentifié. Veuillez vous connecter.");
            return;
        }

        if (confirmDelete()) {
            const fetchDelete = await fetch(`http://localhost:5678/api/works/${worksId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${monToken}`,
                },
            });

            if (fetchDelete.ok) {
                removeProjectFromGallery(worksId);
                alert("Projet supprimé avec succès");
            } else {
                console.error("Erreur lors de la suppression du projet :", fetchDelete.statusText);
                alert('Suppression impossible, une erreur est survenue');
            }
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

// Supprimer un projet de la galerie
function removeProjectFromGallery(projectId) {
    const projectElement = document.querySelector(`figure[data-id="${projectId}"]`);
    if (projectElement) {
        projectElement.remove();
    }

    const modalElement = document.querySelector(`.img-container[data-image-id="${projectId}"]`);
    if (modalElement) {
        modalElement.remove();
    }
}

// Fonction pour créer un nouveau projet
async function createNewWork(categoryValue, file, titleValue) {
    const token = window.localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('category', categoryValue);
    formData.append('image', file);
    formData.append('title', titleValue);

    console.log('Données envoyées au serveur:', { categoryValue, file, titleValue });

    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: "POST",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (response.ok) {
            const newProject = await response.json();
            console.log('Nouveau projet créé:', newProject);
            if (newProject && newProject.id) {
                // Ajouter le nouveau projet à la galerie
                addProjectToGallery(newProject);
                // Ajouter le nouveau projet à la modale
                addProjectToModal(newProject);
                alert('Projet ajouté avec succès');
                // Réinitialiser le formulaire
                resetForm();
                // Fermer la deuxième modale et réouvrir la première modale
                secondModalContainer.style.display = 'none';
                modalContainer.style.display = 'block';
            } else {
                console.error('Réponse inattendue du serveur:', newProject);
                alert('Erreur: Projet ajouté mais les données sont incomplètes.');
            }
        } else {
            console.error(`Erreur lors de l'ajout du projet : ${response.statusText}`);
            alert(`Ajout du projet impossible : ${response.statusText}`);
        }
    } catch (error) {
        console.error("Une erreur s'est produite lors de la création du projet :", error);
        alert("Une erreur s'est produite lors de la création du projet.");
    }
}

// Fonction pour réinitialiser le formulaire
function resetForm() {
    const form = document.getElementById('secondPhotoForm');
    form.reset(); // Réinitialiser le formulaire
    // Réinitialiser l'aperçu de la photo
    const preview = document.getElementById('photoPreview');
    preview.src = '';
    preview.style.display = 'none';
    document.querySelector('#label1 .upload-icon').style.display = 'block';
}

// Ajouter un projet à la modale
function addProjectToModal(project) {
    console.log('addProjectToModal appelé avec:', project);

    if (!project || !project.id || !project.imageUrl) {
        console.error('Projet invalide:', project);
        return;
    }

    const modalContent = document.querySelector('.modal .modal-content');
    if (modalContent) {
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

        // Ajouter l'événement de suppression pour la nouvelle image
        deleteIcon.addEventListener('click', async function () {
            const imageId = this.dataset.imageId;
            if (imageId) {
                await deleteWorks(imageId);
                console.log('Événement de suppression ajouté pour l\'image:', project);
            } else {
                console.error('Identifiant d\'image non disponible');
            }
        });
        console.log('Image ajoutée à la modale:', project);
    }
}

// Fonction pour déclencher le clic sur l'input file
function triggerFileInput() {
    const fileInput = document.getElementById('photoFile');
    fileInput.click();
}

document.getElementById('buttonValider').addEventListener('click', triggerFileInput);

// Écouteur d'événement pour soumettre le formulaire
const submitFormButton = document.getElementById('submitPhotoBtn');
submitFormButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById('photoFile');
    const categoryInput = document.getElementById('photoCategory');
    const titleInput = document.getElementById('photoTitle');

    const file = fileInput.files[0];
    const categoryValue = parseInt(categoryInput.value, 10);
    const titleValue = titleInput.value.trim();

    if (file && categoryValue && titleValue) {
        try {
            await createNewWork(categoryValue, file, titleValue);
            // Fermer la deuxième modale et réouvrir la première modale
            secondModalContainer.style.display = 'none';
            modalContainer.style.display = 'block';
        } catch (error) {
            console.error("Une erreur s'est produite lors de l'ajout du projet :", error);
        }
    } else {
        alert("Veuillez remplir tous les champs.");
    }
});

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

    checkFormValidity();
});

// Fonction d'initialisation
document.addEventListener("DOMContentLoaded", async () => {
    const projects = await getProjects();
    renderProjects(projects);
    setupFilters();
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