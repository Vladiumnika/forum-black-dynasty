const categoriesContainer = document.getElementById("categories");
const topicsContainer = document.getElementById("topics");
const commentsContainer = document.getElementById("comments");

function htmlEscape(str) {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s]));
}

async function loadCategories() {
  if (!categoriesContainer) return;
  const res = await fetch(api("/api/forum/categories"));
  const categories = await res.json();
  categoriesContainer.innerHTML = categories.map(cat => `
    <div class="topic-item" onclick="window.location.href='topic.html?categoryId=${cat._id}'">
      <div class="topic-info">
        <h3>${htmlEscape(cat.name)}</h3>
        <p>${htmlEscape(cat.description || '')}</p>
      </div>
      <button class="btn">Открыть</button>
    </div>
  `).join("");
}

async function loadTopics(categoryId, page = 1, limit = 20) {
  if (!topicsContainer) return;
  const res = await fetch(api(`/api/forum/categories/${categoryId}/topics?page=${page}&limit=${limit}`));
  const data = await res.json();
  const { items = [], total = 0, page: cur = 1, pageSize = limit } = data;
  topicsContainer.innerHTML = items.length ? items.map(t => `
    <div class="comment card" onclick="window.location.href='topic.html?topicId=${t._id}'">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;">
        <h3 style="margin:0;color:#f8fafc;">${htmlEscape(t.title)}</h3>
        ${t.isPinned ? '<span style="background:rgba(99,102,241,0.2);color:#6366f1;padding:0.25rem 0.75rem;border-radius:1rem;font-size:0.875rem;font-weight:500;">Закреплено</span>' : ''}
      </div>
      <p style="color:#cbd5e1;margin-bottom:1rem;line-height:1.6;">${htmlEscape((t.content||'').slice(0,160))}...</p>
      <div style="display:flex;justify-content:space-between;align-items:center;color:#64748b;font-size:0.875rem;">
        <span>Автор: <strong style="color:#6366f1;">${htmlEscape((t.author && t.author.username) || '—')}</strong></span>
        <span>${t.repliesCount||0} ответов • ${t.views||0} просмотров</span>
      </div>
    </div>
  `).join("") : '<div class="message" style="color:#cbd5e1;">Тем в этой категории пока нет. Создайте первую тему.</div>';
  const pag = document.getElementById('topics-pagination');
  if (pag) {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    pag.innerHTML = `
      <button class="btn btn-secondary" ${cur<=1?'disabled':''} id="tp-prev">Назад</button>
      <span style="color:#cbd5e1; align-self:center;">Стр. ${cur} из ${maxPage}</span>
      <button class="btn btn-secondary" ${cur>=maxPage?'disabled':''} id="tp-next">Вперед</button>
    `;
    const prev = document.getElementById('tp-prev');
    const next = document.getElementById('tp-next');
    if (prev) prev.onclick = () => loadTopics(categoryId, cur - 1, pageSize);
    if (next) next.onclick = () => loadTopics(categoryId, cur + 1, pageSize);
  }
}

async function loadTopicAndComments(topicId, page = 1, limit = 20) {
  if (!commentsContainer) return;
  const topicRes = await fetch(api(`/api/forum/topics/${topicId}`));
  const topic = await topicRes.json();
  const commentsRes = await fetch(api(`/api/forum/topics/${topicId}/comments?page=${page}&limit=${limit}`));
  const commentsData = await commentsRes.json();
  const list = commentsData.items || [];
  const total = commentsData.total || 0;
  const cur = commentsData.page || 1;
  const pageSize = commentsData.pageSize || limit;

  const header = document.getElementById('topic-header');
  if (header) {
    header.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;"><h2 style="background: linear-gradient(135deg, #6366f1, #4f46e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0;">${htmlEscape(topic.title)}</h2></div>`;
  }

  // Moderation and subscribe/bookmark controls
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('jwt');
  const isModerator = user && (user.role === 'admin' || user.role === 'moderator');
  const modBar = document.getElementById('moderation-bar');
  if (modBar) modBar.style.display = (isModerator || token) ? 'block' : 'none';
  const pinBtn = document.getElementById('pin-btn');
  const lockBtn = document.getElementById('lock-btn');
  const delBtn = document.getElementById('delete-btn');
  const subBtn = document.getElementById('sub-btn');
  const bmBtn = document.getElementById('bm-btn');
  if (pinBtn && isModerator) pinBtn.onclick = async () => { await fetch(api(`/api/forum/topics/${topicId}`), { method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ isPinned: !topic.isPinned }) }); loadTopicAndComments(topicId); };
  if (lockBtn && isModerator) lockBtn.onclick = async () => { await fetch(api(`/api/forum/topics/${topicId}`), { method:'PUT', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ isLocked: !topic.isLocked }) }); loadTopicAndComments(topicId); };
  if (delBtn && isModerator) delBtn.onclick = async () => { if (confirm('Удалить тему?')) { await fetch(api(`/api/forum/topics/${topicId}`), { method:'DELETE', headers:{'Authorization':`Bearer ${token}`}}); window.location.href='index.html'; } };
  if (subBtn && token) subBtn.onclick = async () => { await fetch(api(`/api/forum/topics/${topicId}/subscribe`), { method:'POST', headers:{'Authorization':`Bearer ${token}`}}); };
  if (bmBtn && token) bmBtn.onclick = async () => { await fetch(api(`/api/forum/topics/${topicId}/bookmark`), { method:'POST', headers:{'Authorization':`Bearer ${token}`}}); };

  commentsContainer.innerHTML = list.length ? list.map(c => `
    <div class="comment card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.5rem;">
        <strong style="color:#f8fafc;">${htmlEscape((c.author && c.author.username) || 'Гость')}</strong>
        <span style="color:#64748b;font-size:0.875rem;">${new Date(c.createdAt).toLocaleString()}</span>
      </div>
      <p style="color:#cbd5e1;">${htmlEscape(c.content)}</p>
    </div>
  `).join("") : '<div class="message" style="color:#cbd5e1;">Комментариев пока нет. Будьте первым!</div>';

  const cpag = document.getElementById('comments-pagination');
  if (cpag) {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    cpag.innerHTML = `
      <button class="btn btn-secondary" ${cur<=1?'disabled':''} id="cp-prev">Назад</button>
      <span style="color:#cbd5e1; align-self:center;">Стр. ${cur} из ${maxPage}</span>
      <button class="btn btn-secondary" ${cur>=maxPage?'disabled':''} id="cp-next">Вперед</button>
    `;
    const prev = document.getElementById('cp-prev');
    const next = document.getElementById('cp-next');
    if (prev) prev.onclick = () => loadTopicAndComments(topicId, cur - 1, pageSize);
    if (next) next.onclick = () => loadTopicAndComments(topicId, cur + 1, pageSize);
  }

  // Comment form with JWT
  const commentCard = document.getElementById('comment-form-card');
  if (commentCard) commentCard.style.display = token ? 'block' : 'none';
  const commentForm = document.getElementById('commentForm');
  if (commentForm) {
    commentForm.onsubmit = async (e) => {
      e.preventDefault();
      const content = document.getElementById('comment-content').value.trim();
      if (!content) return;
      try {
        const res = await fetch(api('/api/forum/comments'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ content, topicId }) });
        const result = await res.json();
        if (res.ok) {
          document.getElementById('comment-content').value = '';
          loadTopicAndComments(topicId);
        } else {
          alert(result.message || 'Ошибка добавления комментария');
        }
      } catch (_) { alert('Ошибка сети'); }
    };
  }
}

// Bootstrap per page
(function init() {
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get('categoryId');
  const topicId = params.get('topicId');
  if (categoriesContainer) loadCategories();
  if (topicsContainer && categoryId) loadTopics(categoryId);
  if (commentsContainer && topicId) loadTopicAndComments(topicId);

  // Topic creation when viewing a category
  const topicFormCard = document.getElementById('topic-form-card');
  if (topicFormCard && categoryId) {
    const token = localStorage.getItem('jwt');
    topicFormCard.style.display = token ? 'block' : 'none';
    const topicForm = document.getElementById('topicForm');
    if (topicForm) {
      topicForm.onsubmit = async (e) => {
        e.preventDefault();
        const title = document.getElementById('topic-title').value.trim();
        const content = document.getElementById('topic-content').value.trim();
        if (!title || !content) return alert('Заполните все поля');
        try{
          const res = await fetch(api('/api/forum/topics'), { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ title, content, categoryId }) });
          const data = await res.json();
          if (res.ok) {
            window.location.href = `topic.html?topicId=${data.topic._id}`;
          } else { alert(data.message || 'Ошибка создания темы'); }
        }catch(_){ alert('Ошибка сети'); }
      };
    }
  }
})();
