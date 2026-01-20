import './style.css'

const API_URL = 'http://localhost:3000';
const app = document.querySelector('#app');

// Navigation Helper
const navigateTo = (url) => {
  history.pushState(null, null, url);
  router();
};

window.addEventListener('popstate', router);

function renderHeader() {
  return `
    <header>
      <a href="/" class="logo" data-link>TechBlog</a>
      <nav>
        <a href="/" data-link>Home</a>
        <a href="/about" data-link>About</a>
        <a href="/admin" data-link>New Post</a>
      </nav>
    </header>
  `;
}

async function loadHome() {
  try {
    const response = await fetch(`${API_URL}/posts`);
    const posts = await response.json();

    return `
      ${renderHeader()}
      <main>
        <h1>Latest Articles</h1>
        <div class="blog-grid">
          ${posts.map(post => `
            <div class="card" onclick="window.history.pushState(null, null, '/post/${post.id}'); window.dispatchEvent(new PopStateEvent('popstate'));">
              <img src="${post.image}" alt="${post.title}" class="card-image" loading="lazy">
              <div class="card-content">
                <div class="card-date">${post.date}</div>
                <h2 class="card-title">${post.title}</h2>
                <p class="card-excerpt">${post.excerpt}</p>
                <span class="read-more">Read Article &rarr;</span>
              </div>
            </div>
          `).join('')}
        </div>
      </main>
    `;
  } catch (error) {
    return `<div class="error">Error loading posts. Is the JSON server running?</div>`;
  }
}

async function loadPost(id) {
  try {
    const [postRes, commentsRes] = await Promise.all([
      fetch(`${API_URL}/posts/${id}`),
      fetch(`${API_URL}/comments?postId=${id}`)
    ]);

    if (!postRes.ok) throw new Error('Post not found');

    const post = await postRes.json();
    const comments = await commentsRes.json();

    return `
      ${renderHeader()}
      <main class="single-post">
        <a href="/" class="btn-back" data-link>&larr; Back to Home</a>
        
        <img src="${post.image}" alt="${post.title}" class="post-header-image">
        
        <div class="post-period">
          <h1>${post.title}</h1>
          <p class="card-date">${post.date}</p>
        </div>
        
        <div class="post-content">
          ${post.content}
        </div>
        
        <div class="comments-section">
          <h3>Comments (${comments.length})</h3>
          <ul class="comments-list">
            ${comments.length > 0 ? comments.map(comment => `
              <li class="comment">
                <div class="comment-author">${comment.author} <span class="comment-date">${comment.date}</span></div>
                <div class="comment-text">${comment.text}</div>
              </li>
            `).join('') : '<p>No comments yet.</p>'}
          </ul>
        </div>
      </main>
    `;
  } catch (error) {
    return `
      ${renderHeader()}
      <div class="error">Error loading post: ${error.message}</div>
    `;
  }
}

function loadAbout() {
  return `
    ${renderHeader()}
    <main class="about-container">
      <h1>About Us</h1>
      <p>
        Welcome to Modern Tech Blog. We are passionate about the latest in web development, 
        sharing insights on PWA, Vite, React, and more. Our mission is to help developers 
        stay ahead of the curve.
      </p>
    </main>
  `;
}

function loadAdmin() {
  return `
    ${renderHeader()}
    <main class="single-post"> <!-- Reusing container style -->
      <h1>Create New Post</h1>
      <form id="create-post-form">
        <div class="form-group">
          <label for="title">Title</label>
          <input type="text" id="title" required>
        </div>
        
        <div class="form-group">
          <label for="excerpt">Excerpt</label>
          <input type="text" id="excerpt" required>
        </div>
        
        <div class="form-group">
          <label for="image">Image URL</label>
          <input type="url" id="image" placeholder="https://..." required>
        </div>
        
        <div class="form-group">
          <label for="content">Content (HTML allowed)</label>
          <textarea id="content" rows="6" required></textarea>
        </div>
        
        <button type="submit" class="btn">Publish Post</button>
      </form>
    </main>
  `;
}

// Router Logic
async function router() {
  const path = window.location.pathname;
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
    });
  });

  // Attach form listener if on admin page
  if (path === '/admin') {
    document.getElementById('create-post-form').addEventListener('submit', handleCreatePost);
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  router();
});

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      // Prompt user to refresh
    },
    onOfflineReady() {
      console.log('App is offline ready');
    }
  });
}
