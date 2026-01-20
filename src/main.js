import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './style.css';
import { registerSW } from 'virtual:pwa-register';

const API_URL = 'http://localhost:3000';
const app = document.querySelector('#app');
let deferredPrompt;

// Navigation Helper
const navigateTo = (url) => {
  history.pushState(null, null, url);
  router();
};

window.addEventListener('popstate', router);

function renderHeader() {
  return `
    <nav class="navbar navbar-expand-lg border-bottom mb-4" style="background-color: var(--bs-body-bg);">
      <div class="container-fluid px-lg-5">
        <a class="navbar-brand fw-bold text-info text-uppercase" href="/" data-link>
          <i class="bi bi-cpu-fill me-2"></i>TechBlog
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            <li class="nav-item">
              <a class="nav-link" href="/" data-link>Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/about" data-link>About</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/admin" data-link>New Post</a>
            </li>
            <li class="nav-item ms-lg-3 mt-2 mt-lg-0">
              <button id="install-btn" class="btn btn-info text-white rounded-pill fw-bold shadow-sm" style="display: none;">
                <i class="bi bi-download me-1"></i> Install App
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `;
}

// UI Helpers
function renderLoading() {
  return `
    <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 50vh;">
      <div class="spinner-border text-info mb-3" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-body-secondary animate-pulse">Loading content...</p>
    </div>
  `;
}

function renderError(title = "Something went wrong", message = "We couldn't load the content. Please check your connection and try again.") {
  return `
    <div class="container d-flex justify-content-center my-4">
      <div class="card border-danger mb-3 shadow" style="max-width: 30rem;">
        <div class="card-body text-center p-5">
          <i class="bi bi-exclamation-triangle-fill text-danger display-1 mb-3"></i>
          <h4 class="card-title text-danger fw-bold">${title}</h4>
          <p class="card-text text-body-secondary">${message}</p>
          <button onclick="window.location.reload()" class="btn btn-danger rounded-pill px-4 mt-3">
            <i class="bi bi-arrow-clockwise me-1"></i> Try Again
          </button>
        </div>
      </div>
    </div>
  `;
}

async function loadHome() {
  try {
    const response = await fetch(`${API_URL}/posts`);
    if (!response.ok) throw new Error('Failed to connect to server');

    const posts = await response.json();

    return `
      ${renderHeader()}
      <main class="container mb-5">
        <div class="row align-items-center mb-4">
          <div class="col">
            <h1 class="fw-bold mb-0 text-white"><i class="bi bi-journal-richtext me-2 text-info"></i>Latest Articles</h1>
          </div>
        </div>
        
        <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          ${posts.map(post => `
            <div class="col">
              <div class="card h-100 shadow border-0 overflow-hidden" style="cursor: pointer; transition: transform 0.2s;" 
                   onmouseover="this.style.transform='translateY(-5px)'" 
                   onmouseout="this.style.transform='translateY(0)'"
                   onclick="window.history.pushState(null, null, '/post/${post.id}'); window.dispatchEvent(new PopStateEvent('popstate'));">
                <img src="${post.image}" class="card-img-top object-fit-cover" alt="${post.title}" height="200" loading="lazy">
                <div class="card-body d-flex flex-column">
                  <small class="text-body-secondary mb-2"><i class="bi bi-calendar-event me-1"></i>${post.date}</small>
                  <h5 class="card-title fw-bold text-white mb-2">${post.title}</h5>
                  <p class="card-text text-body-secondary flex-grow-1 small">${post.excerpt}</p>
                  <div class="mt-3">
                    <span class="text-info fw-semibold text-decoration-none">Read Article <i class="bi bi-arrow-right ms-1"></i></span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </main>
    `;
  } catch (error) {
    return `
      ${renderHeader()}
      <main class="container">
        ${renderError("Connection Error", "Is the JSON server running? We couldn't fetch the latest posts.")}
      </main>
    `;
  }
}

async function loadPost(id) {
  try {
    const [postRes, commentsRes] = await Promise.all([
      // fetch(`${API_URL}/posts/${id}`),
      fetch(`${API_URL}/comments?postId=${id}`)
    ]);

    if (!postRes.ok) throw new Error('Post not found');

    const post = await postRes.json();
    const comments = await commentsRes.json();

    return `
      ${renderHeader()}
      <main class="container mb-5">
        <a href="/" class="btn btn-outline-light mb-4 rounded-pill" data-link>
          <i class="bi bi-arrow-left me-1"></i> Back to Home
        </a>

        <div class="row justify-content-center">
          <div class="col-lg-10">
            <div class="card border-0 shadow-lg overflow-hidden mb-5">
               <img src="${post.image}" class="card-img-top object-fit-cover" alt="${post.title}" style="max-height: 400px;">
               <div class="card-body p-4 p-lg-5 bg-body-tertiary">
                  <h1 class="display-5 fw-bold mb-3">${post.title}</h1>
                  <p class="text-body-secondary mb-4 border-bottom pb-4">
                    <i class="bi bi-calendar3 me-2"></i>Published on ${post.date}
                  </p>
                  
                  <div class="post-content fs-5 text-body text-break mb-5">
                    ${post.content}
                  </div>

                  <hr class="my-5 border-secondary">

                  <div class="bg-body-secondary rounded-4 p-4 mb-5">
                    <h3 class="mb-3 fw-bold"><i class="bi bi-chat-left-dots me-2"></i>Leave a Comment</h3>
                    <form id="comment-form" data-post-id="${post.id}">
                      <div class="mb-3">
                        <input type="text" class="form-control form-control-lg bg-body text-white border-0" id="comment-author" placeholder="Your Name" required>
                      </div>
                      <div class="mb-3">
                        <textarea class="form-control form-control-lg bg-body text-white border-0" id="comment-text" placeholder="Share your thoughts..." rows="3" required></textarea>
                      </div>
                      <button type="submit" class="btn btn-info text-white rounded-pill px-4 fw-bold">Submit Comment</button>
                    </form>
                  </div>

                  <h3 class="mb-4 fw-bold">Comments <span class="badge bg-secondary rounded-pill align-middle fs-6 ms-2">${comments.length}</span></h3>
                  
                  <div class="list-group list-group-flush rounded-4 overflow-hidden">
                    ${comments.length > 0 ? comments.map(comment => `
                      <div class="list-group-item bg-body p-4 border-secondary-subtle">
                        <div class="d-flex w-100 justify-content-between mb-2">
                          <h6 class="mb-1 fw-bold text-info">${comment.author}</h6>
                          <small class="text-body-secondary text-nowrap">${comment.date}</small>
                        </div>
                        <p class="mb-1 text-light small">${comment.text}</p>
                      </div>
                    `).join('') : '<div class="list-group-item bg-body p-4 text-center text-muted">No comments yet. Be the first to share your thoughts!</div>'}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    `;
  } catch (error) {
    return `
      ${renderHeader()}
      <main class="container">
        ${renderError("Content Unavailable", `We couldn't load this post. It might have been removed or the server is down.`)}
      </main>
    `;
  }
}

function loadAbout() {
  return `
    ${renderHeader()}
    <main class="container py-5 text-center">
      <div class="row justify-content-center">
        <div class="col-lg-8">
           <i class="bi bi-people-fill display-1 text-info mb-4"></i>
           <h1 class="fw-bold mb-4">About Us</h1>
           <p class="lead text-body-secondary mb-5">
             Welcome to Modern Tech Blog. We are passionate about the latest in web development, 
             sharing insights on PWA, Vite, React, and more. Our mission is to help developers 
             stay ahead of the curve.
           </p>
           <a href="/" class="btn btn-outline-info rounded-pill px-4" data-link>Browse Articles</a>
        </div>
      </div>
    </main>
  `;
}

function loadAdmin() {
  return `
    ${renderHeader()}
    <main class="container mb-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow-lg border-0 bg-body-tertiary">
            <div class="card-body p-5">
              <h2 class="card-title fw-bold mb-4 text-center"><i class="bi bi-pencil-square me-2 text-info"></i>Create New Post</h2>
              <form id="create-post-form">
                <div class="mb-3">
                  <label for="title" class="form-label">Title</label>
                  <input type="text" class="form-control bg-body text-white" id="title" required>
                </div>
                
                <div class="mb-3">
                  <label for="excerpt" class="form-label">Excerpt</label>
                  <input type="text" class="form-control bg-body text-white" id="excerpt" required>
                </div>
                
                <div class="mb-3">
                  <label for="image" class="form-label">Image URL</label>
                  <input type="url" class="form-control bg-body text-white" id="image" placeholder="https://..." required>
                </div>
                
                <div class="mb-3">
                  <label for="content" class="form-label">Content (HTML allowed)</label>
                  <textarea class="form-control bg-body text-white" id="content" rows="6" required></textarea>
                </div>
                
                <div class="d-grid">
                  <button type="submit" class="btn btn-info text-white fw-bold py-2">Publish Post</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;
}

// Router Logic
async function router() {
  const path = window.location.pathname;

  // Show loading state immediately for async routes (optional optimization)
  if (path === '/' || path.startsWith('/post/')) {
    app.innerHTML = `${renderHeader()}${renderLoading()}`;
  }

  let view = '';

  if (path === '/' || path === '/index.html') {
    view = await loadHome();
  } else if (path.startsWith('/post/')) {
    const id = path.split('/')[2];
    view = await loadPost(id);
  } else if (path === '/about') {
    view = loadAbout();
  } else if (path === '/admin') {
    view = loadAdmin();
  } else {
    // 404 handling or fallback to home
    view = await loadHome();
  }

  app.innerHTML = view;

  // Re-attach event listeners for navigation
  document.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(e.target.getAttribute('href'));

      // Close mobile navbar if open
      const navbarCollapse = document.getElementById('navbarNav');
      if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
        bsCollapse.hide();
      }
    });
  });

  // Attach form listeners
  if (path === '/admin') {
    document.getElementById('create-post-form').addEventListener('submit', handleCreatePost);
  }

  if (path.startsWith('/post/')) {
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
      commentForm.addEventListener('submit', handleAddComment);
    }
  }

  // Re-initialize Install Button state
  initInstallButton();
}

async function handleAddComment(e) {
  e.preventDefault();
  const form = e.target;
  const postId = form.getAttribute('data-post-id');
  const author = document.getElementById('comment-author').value;
  const text = document.getElementById('comment-text').value;

  const newComment = {
    postId: parseInt(postId),
    text,
    author,
    date: new Date().toISOString().split('T')[0]
  };

  try {
    await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment)
    });

    // Refresh the view
    router();
  } catch (error) {
    alert('Error posting comment');
    console.error(error);
  }
}

async function handleCreatePost(e) {
  e.preventDefault();

  const newPost = {
    title: document.getElementById('title').value,
    excerpt: document.getElementById('excerpt').value,
    image: document.getElementById('image').value,
    content: document.getElementById('content').value,
    date: new Date().toISOString().split('T')[0]
  };

  try {
    await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPost)
    });

    alert('Post created successfully!');
    navigateTo('/');
  } catch (error) {
    alert('Error creating post');
    console.error(error);
  }
}

// PWA Install Logic Helper
function initInstallButton() {
  const installBtn = document.getElementById('install-btn');
  if (!installBtn) return;

  if (deferredPrompt) {
    installBtn.style.display = 'inline-block';
    installBtn.onclick = async () => {
      installBtn.style.display = 'none';
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      deferredPrompt = null;
    };
  } else {
    installBtn.style.display = 'none';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  router();

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    initInstallButton();
    console.log('Capture event');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    initInstallButton();
    console.log('PWA was installed');
  });
});

if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // Prompt user to refresh if needed
    },
    onOfflineReady() {
      console.log('App is offline ready');
    }
  });
}
