// app.js

document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const userList = document.getElementById('userList');
    const editUserForm = document.getElementById('editUserForm');
    const deleteUserModal = new bootstrap.Modal(document.getElementById('deleteUserModal'));
    const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));

    let selectedUserId = null;

    // Vérification du token à chaque chargement de page
    if (!localStorage.getItem('token')) {
        window.location.href = 'login.html';
    }

    // Fonction pour charger les utilisateurs
    const loadUsers = async () => {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const users = await response.json();
        userList.innerHTML = '';

        users.forEach(user => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${user.name} - ${user.email}
                <button class="btn btn-warning btn-sm" onclick="editUser('${user._id}', '${user.name}', '${user.email}')">Modifier</button>
                <button class="btn btn-danger btn-sm" onclick="confirmDeleteUser('${user._id}')">Supprimer</button>
            `;
            userList.appendChild(li);
        });
    };

    // Charger les utilisateurs au chargement de la page
    loadUsers();

    // Soumettre le formulaire d'ajout d'utilisateur
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            userForm.reset();
            loadUsers();
        }
    });

    // Fonction pour ouvrir le modal de modification avec les données de l'utilisateur
    window.editUser = (id, name, email) => {
        selectedUserId = id;
        document.getElementById('editUserId').value = id;
        document.getElementById('editName').value = name;
        document.getElementById('editEmail').value = email;
        document.getElementById('editPassword').value = '';
        editUserModal.show();
    };

    // Soumettre le formulaire de modification
    editUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('editUserId').value;
        const name = document.getElementById('editName').value;
        const email = document.getElementById('editEmail').value;
        const password = document.getElementById('editPassword').value;

        const response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        if (response.ok) {
            editUserModal.hide();
            loadUsers();
        }
    });

    // Fonction pour ouvrir le modal de confirmation de suppression
    window.confirmDeleteUser = (id) => {
        selectedUserId = id;
        deleteUserModal.show();
    };

    // Confirmer la suppression de l'utilisateur
    document.getElementById('confirmDeleteButton').addEventListener('click', async () => {
        if (selectedUserId) {
            const response = await fetch(`/api/users/${selectedUserId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                deleteUserModal.hide();
                loadUsers();
            }
        }
    });

    // Déconnexion
    document.getElementById('logoutButton').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });
});
