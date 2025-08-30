// API base URL
const api = "https://your-backend-url.onrender.com";

// Run on page load
window.onload = async () => {
  await getAll();           // Fetch and render all blogs
  updateAuthButton();       // Update login/logout button based on token
};

// Update login/logout button based on token presence
function updateAuthButton() {
  const token = localStorage.getItem('token');
  const authBtn = document.getElementById('login-btn');

  if (token) {
    authBtn.textContent = 'Logout';
    authBtn.onclick = () => {
      localStorage.removeItem('token');
      window.location.reload();
    };
  } else {
    authBtn.textContent = 'Login';
    authBtn.onclick = () => {
      window.location.href = 'login.html';
    };
  }
}

// Blog navigation with auth check
document.getElementById('blog')?.addEventListener('click', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You are not logged in. Please login first!');
    window.location.href = 'login.html';
  } else {
    window.location.href = 'blogs.html';
  }
});

// Admin panel access control
document.getElementById('admin-button')?.addEventListener('click', (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first!');
    window.location.href = 'login.html';
    return;
  }

  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    if (decoded.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      alert('Access denied. Admins only.');
    }
  } catch (err) {
    console.error('Invalid token:', err);
    alert('Session expired. Please login again.');
    window.location.href = 'login.html';
  }
});

// Search blogs by author name
document.getElementById('search')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const author = document.getElementById('search-bar').value.trim();
  if (!author) {
    alert('Enter the name of the author');
    return;
  }

  try {
    const res = await fetch(`${api}/blogs/search/${author}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      alert("Oops! No blogs found for this author.");
      return;
    }
    renderBlogs(data);
  } catch (err) {
    alert('Author does not exist');
    console.error('Error:', err);
  }
});

// Fetch all blogs
const getAll = async () => {
  const res = await fetch(`${api}/blogs/allBlogs`);
  const data = await res.json();
  renderBlogs(data);
};

// Render all blogs to the main section
const renderBlogs = (blogs) => {
  const main = document.getElementById('main-tag');
  main.innerHTML = '';

  blogs.forEach((blog) => {
    main.innerHTML += `
  <div class="blog-card" data-blog-id="${blog.b_id}">
    <div class="card-clickable" data-blog-id="${blog.b_id}">
      <div class="card-content">
        <h2 class="blog-title">${blog.title}</h2>
        <p class="blog-desc">${blog.description}</p>
        <div class="card-tags">
          ${(blog.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="card-meta">
          <span class="author">✍️ ${blog.author}</span>
          <span class="date">📅 ${blog.created_at}</span>
        </div>
      </div>
    </div>

    <div class="comment-section">
      <input type="text" placeholder="Add a comment..." class="comment-input" />
      <button class="comment-btn" data-blog-id="${blog.b_id}">Post</button>
    </div>

    <div class="like-section">
      <button class="like-btn" data-blog-id="${blog.b_id}">❤️ Like</button>
      <span class="like-count">${blog.likes}</span>
    </div>

    <div class="card-footer">
      <div class="comment-preview" id="preview-${blog.b_id}">
        <p>💬 Loading comments...</p>
      </div>
    </div>
  </div>
`;


    // Load preview comments for each blog
    loadCommentPreview(blog.b_id);
  });
document.addEventListener('click', (e) => {
  const card = e.target.closest('.card-clickable');
  if (card) {
    const blogId = card.getAttribute('data-blog-id');
    window.location.href = `blogs.html?blogId=${blogId}`;
  }
});

  // Attach listeners after rendering
  attachLikeListeners();
  attachCommentListeners();
};

// Load preview (first 2) comments and show "Show all" button if needed
async function loadCommentPreview(blogId) {
  try {
    const res = await fetch(`${api}/comments/${blogId}`);
    const comments = await res.json();

    const previewContainer = document.getElementById(`preview-${blogId}`);
    previewContainer.innerHTML = '';

      const moreBtn = document.createElement('button');
      moreBtn.className='showComments';
      moreBtn.textContent = 'Show comments';
      moreBtn.onclick = async () => {
        try {
          const res = await fetch(`${api}/comments/${blogId}`);
          const allComments = await res.json();
          previewContainer.innerHTML = allComments.map(c => `
            <p><strong>User ${c.user_id}</strong>: ${c.comment_text}</p>
          `).join('');
        } catch (err) {
          console.error('Error loading full comments:', err);
          previewContainer.innerHTML = `<p>⚠️ Failed to load comments.</p>`;
        }
      };
      previewContainer.appendChild(moreBtn);
    // }
  } catch (err) {
    console.error('Error loading comments:', err);
  }
}

// Like button logic
const attachLikeListeners = () => {
 
  document.querySelectorAll('.like-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const blogId = btn.dataset.blogId;
    const token=localStorage.getItem('token');
    if(!token){
      alert('you should be log in to like the blog');
      return;
    }
    try {
      const res = await fetch(`${api}/blogs/likes/${blogId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization:`Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.status === 200) {
        btn.disabled = true;
        btn.textContent = '❤️ Liked';
        // Optionally update like count
      } else if (res.status === 409) {
        alert('You’ve already liked this blog.');
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  });
});

};

// Comment posting logic
const attachCommentListeners = () => {
  document.querySelectorAll('.comment-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const blogId = btn.dataset.blogId;
      const input = btn.previousElementSibling;
      const commentText = input.value.trim();
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please login to comment.');
        window.location.href = 'login.html';
        return;
      }

      if (!commentText) {
        alert('Comment cannot be empty.');
        return;
      }

      const res = await fetch(`${api}/comments/${blogId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: commentText }),
      });

      if (res.ok) {
        input.value = '';
        alert('Comment posted!');
      } else {
        alert('Failed to post comment.');
      }
    });
  });
};
document.getElementById('blog-page')?.addEventListener('click',(e)=>{
  e.preventDefault();
  const token=localStorage.getItem('token');
  if(!token){
    alert('login please');
    return;
  }
  window.location.href='blogs.html';
})
document.getElementById('admin-page').addEventListener('click',(e)=>{
  e.preventDefault();
   const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first!');
    window.location.href = 'login.html';
    return;
  }

  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    if (decoded.role === 'admin') {
      window.location.href = 'admin.html';
    } else {
      alert('Access denied. Admins only.');
    }
  } catch (err) {
    console.error('Invalid token:', err);
    alert('Session expired. Please login again.');
    window.location.href = 'login.html';
  }
});