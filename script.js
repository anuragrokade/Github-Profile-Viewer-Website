const perPage = 10;
let currentPage = 1;
let repositories = [];

function getUser() {
  const username = document.getElementById('username').value.trim();
  if (!username) {
    showError('Please enter a GitHub username.');
    return;
  }

  clearError();
  clearProfile();
  clearRepositories();

  fetch(`https://api.github.com/users/${username}`)
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then(user => {
      displayUser(user);
      fetchRepositories(username);
    })
    .catch(error => showError(`User not found: ${username}`));
}

function fetchRepositories(username) {
  fetch(`https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${currentPage}`)
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    })
    .then(data => {
      repositories = data;
      displayRepositories();
      displayPagination();
    })
    .catch(error => showError(`Error fetching repositories: ${error.message}`));
}

function displayUser(user) {
  const profileElement = document.getElementById('profile');
  const profileHTML = `
    <div>
      <img src="${user.avatar_url}" alt="Avatar" class="avatar">
      <h2>${user.name}</h2>
      <p>${user.bio || 'No bio available'}</p>
      <p><strong>Followers:</strong> ${user.followers}</p>
      <p><strong>Following:</strong> ${user.following}</p>
      <p><strong>Public Repositories:</strong> ${user.public_repos}</p>
    </div>
  `;
  profileElement.innerHTML = profileHTML;
}

function displayRepositories() {
  const repositoriesElement = document.getElementById('repositories');
  repositoriesElement.innerHTML = '';

  repositories.forEach(repo => {
    const repoElement = document.createElement('div');
    repoElement.classList.add('repo');
    repoElement.innerHTML = `
      <a href="${repo.html_url}" target="_blank">${repo.name}</a>
      <p><strong>Stars:</strong> ${repo.stargazers_count}</p>
      <p><strong>Language:</strong> ${repo.language || 'Not specified'}</p>
    `;
    repositoriesElement.appendChild(repoElement);
  });
}

function displayPagination() {
  const paginationElement = document.getElementById('pagination');
  const totalPages = Math.ceil(repositories.length / perPage);
  if (totalPages > 1) {
    paginationElement.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement('button');
      button.textContent = i;
      button.onclick = () => {
        currentPage = i;
        displayRepositories();
      };
      paginationElement.appendChild(button);
    }
  } else {
    paginationElement.innerHTML = '';
  }
}

function sortRepositories() {
  const sortBy = document.getElementById('sort').value;
  repositories.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'stars') {
      return b.stargazers_count - a.stargazers_count;
    } else if (sortBy === 'updated') {
      return new Date(b.updated_at) - new Date(a.updated_at);
    }
  });
  displayRepositories();
}

function filterRepositories() {
  const filterBy = document.getElementById('filter').value.toLowerCase();
  const filteredRepositories = repositories.filter(repo => repo.language && repo.language.toLowerCase().includes(filterBy));
  if (filterBy) {
    repositories = filteredRepositories;
  } else {
    fetchRepositories(document.getElementById('username').value.trim());
  }
  displayRepositories();
}

function clearError() {
  document.getElementById('error-msg').textContent = '';
}

function showError(message) {
  document.getElementById('error-msg').textContent = message;
}

function clearProfile() {
  document.getElementById('profile').innerHTML = '';
}

function clearRepositories() {
  document.getElementById('repositories').innerHTML = '';
  document.getElementById('pagination').innerHTML = '';
}
