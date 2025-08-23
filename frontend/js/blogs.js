// const api='http://localhost:3001/api/students';
// document.getElementById('create-blog')?.addEventListener('click',()=>{
//             window.location.href='createBlog.html';
//         })
//         document.getElementById('my-blogs').addEventListener('click',()=>{
//             window.location.href='myBlogs.html';
//         })
// const getAll=async()=>{
//     const res=await fetch(`${api}/blogs/allBlogs`);
//     const data= await res.json();
//     const main=document.getElementById('main-tag');
//     main.innerHTML='';
//     data.forEach(students => {
//         main.innerHTML+=`
//         <div class="blog-card">
//     <div class="card-header">
//     <h2 class="blog-title">${students.title}</h2>
//     <p class="blog-desc">${students.description}</p>
//   </div>

//   <div class="card-body">
//     <p class="blog-content">
//       ${students.content}
// </p>
//   </div>

//   <div class="card-meta">
//     <span class="author">${students.author}</span>
//     <span class="date">${students.created_at}</span>
//   </div>

//   <div class="card-footer">
//     <div class="comment-section">
//       <input type="text" placeholder="Add a comment..." class="comment-input" />
//       <button class="comment-btn">Post</button>
//     </div>
//     <div class="like-section">
//       <button class="like-btn">❤️ Like</button>
//       <span class="like-count">12</span>
//     </div>
//   </div>
// </div>
// `
//     });
// }
// document.getElementById('search')?.addEventListener('submit',async(e)=>{
//     e.preventDefault();
//     const author=document.getElementById('search-bar').value;
//     if(author.trim().length===0){
//         alert('Enter the name of author');
//         return;
//     }
//     try{
//     const res=await fetch(`${api}/blogs/${author}`);
//     const data= await res.json();
//     const main=document.getElementById('main-tag');
//     main.innerHTML='';
//     data.forEach(students => {
//         main.innerHTML+=`
//         <div class="blog-card">
//     <div class="card-header">
//     <h2 class="blog-title">${students.title}</h2>
//     <p class="blog-desc">${students.description}</p>
//   </div>

//   <div class="card-body">
//     <p class="blog-content">
//       ${students.content}
// </p>
//   </div>

//   <div class="card-meta">
//     <span class="author">${students.author}</span>
//     <span class="date">${students.created_at}</span>
//   </div>

//   <div class="card-footer">
//     <div class="comment-section">
//       <input type="text" placeholder="Add a comment..." class="comment-input" />
//       <button class="comment-btn">Post</button>
//     </div>
//     <div class="like-section">
//       <button class="like-btn">❤️ Like</button>
//       <span class="like-count">12</span>
//     </div>
//   </div>
// </div>
// `
//     });
// }catch(err){
//     alert("author does not exists");
//     console.log("error",err);
//     return;

// }
// })
// window.onload=getAll;
const api = 'http://localhost:3001/api/students';

window.onload = () => {
  getAllBlogs();
};

document.getElementById('create-blog')?.addEventListener('click', () => {
  window.location.href = 'createBlog.html';
});

document.getElementById('my-blogs')?.addEventListener('click', async() => {
  window.location.href = 'myBlogs.html';
  
});

document.getElementById('search')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const author = document.getElementById('search-bar').value.trim();
  if (!author) {
    alert('Enter the name of the author');
    return;
  }

  try {
    const res = await fetch(`${api}/blogs/${author}`);
    const data = await res.json();
    renderBlogs(data);
  } catch (err) {
    alert('Author does not exist');
    console.error('Error:', err);
  }
});

async function getAllBlogs() {
  try {
    const res = await fetch(`${api}/blogs/allBlogs`);
    const data = await res.json();
    renderBlogs(data);
  } catch (err) {
    console.error('Failed to fetch blogs:', err);
  }
}
function renderBlogs(blogs) {
  const main = document.getElementById('main-tag');
  const emptyState = document.getElementById('empty-state');
  main.innerHTML = '';

  if (!Array.isArray(blogs) || blogs.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  blogs.forEach(blog => {
    main.innerHTML += `
      <div class="blog-card" data-blog-id="${blog.b_id}">
        <div class="card-header">
          <h2 class="blog-title">${blog.title}</h2>
          <p class="blog-desc">${blog.description}</p>
        </div>
        <div class="card-body">
          <p class="blog-content">${blog.content}</p>
        </div>
        <div class="card-meta">
          <span class="author">✍️ ${blog.author}</span>
          <span class="date">📅 ${blog.created_at}</span>
        </div>
        <div class="card-footer">
          <div class="comment-preview" id="preview-${blog.b_id}">
            <p>💬 Loading comments...</p>
          </div>
          <div class="comment-section">
            <input type="text" placeholder="Add a comment..." class="comment-input" />
            <button class="comment-btn" data-blog-id="${blog.b_id}">Post</button>
          </div>
          <div class="like-section">
            <button class="like-btn" data-blog-id="${blog.b_id}">❤️ Like</button>
            <span class="like-count">${blog.likes || 0}</span>
          </div>
        </div>
      </div>
    `;

    loadCommentPreview(blog.b_id);
  });

  attachCommentListeners();
  attachLikeListeners();
  attachShowAllListeners();
}
const attachLikeListeners = () => {
  document.querySelectorAll('.like-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to like blogs.');
        window.location.href = 'login.html';
        return;
      }

      const blogId = btn.dataset.blogId;

      const res = await fetch(`${api}/blogs/likes/${blogId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const updated = await res.json();
        btn.nextElementSibling.textContent = updated.likes;
      } else {
        alert('Failed to like blog(you already liked it).');
      }
    });
  });
};
async function loadCommentPreview(blogId) {
  try {
    const res = await fetch(`${api}/comments/${blogId}`);
    const comments = await res.json();
    const container = document.getElementById(`preview-${blogId}`);
    container.innerHTML = '';

    // comments.slice(0, 2).forEach(c => {
    //   const el = document.createElement('p');
    //   el.textContent = `User ${c.user_id}: ${c.comment_text}`;
    //   container.appendChild(el);
    // });

    // if (comments.length > 2) {
      const btn = document.createElement('button');
      btn.textContent = 'Show all comments';
      btn.className = 'show-comments-btn';
      btn.setAttribute('data-blog-id', blogId);
      container.appendChild(btn);
    // }
  } catch (err) {
    console.error('Error loading comments:', err);
  }
}
function attachCommentListeners() {
  document.querySelectorAll('.comment-btn').forEach(btn => {
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
        loadCommentPreview(blogId); // Refresh preview
      } else {
        alert('Failed to post comment.');
      }
    });
  });
}
function attachShowAllListeners() {
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('show-comments-btn')) {
      const blogId = e.target.getAttribute('data-blog-id');
      const container = document.getElementById(`preview-${blogId}`);

      try {
        const res = await fetch(`${api}/comments/${blogId}`);
        const comments = await res.json();

        container.innerHTML = comments.map(c => `
          <p><strong>User ${c.user_id}</strong>: ${c.comment_text}</p>
        `).join('');
      } catch (err) {
        container.innerHTML = `<p>⚠️ Failed to load comments.</p>`;
        console.error(err);
      }
    }
  });
}

