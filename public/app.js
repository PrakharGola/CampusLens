const API = '/api'
let state = {
  token: localStorage.getItem('token'),
  user: null,
  currentRoute: 'dashboard'
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (state.token) headers.Authorization = `Bearer ${state.token}`
  const res = await fetch(API + path, { ...options, headers })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error?.message || 'Request failed')
  return json.data
}

async function apiUpload(path, formData) {
  const headers = {}
  if (state.token) headers.Authorization = `Bearer ${state.token}`
  const res = await fetch(API + path, { method: 'POST', headers, body: formData })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.error?.message || 'Upload failed')
  return json.data
}

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag)
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') node.className = v
    else if (k === 'onclick') node.onclick = v
    else if (k === 'html') node.innerHTML = v
    else if (k.startsWith('data-')) node.setAttribute(k, v)
    else node[k] = v
  })
  children.flat().forEach(c => {
    if (c == null) return
    node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c)
  })
  return node
}

function render(node) {
  const app = document.getElementById('app')
  app.innerHTML = ''
  app.appendChild(node)
}

function renderUserArea() {
  const area = document.getElementById('userArea')
  area.innerHTML = ''
  if (state.user) {
    area.appendChild(el('span', { class: 'hint' }, state.user.name))
    area.appendChild(el('button', { class: 'btn btn-ghost btn-sm', onclick: logout }, 'Logout'))
  } else {
    area.appendChild(el('button', { class: 'btn btn-primary btn-sm', onclick: () => go('login') }, 'Sign In'))
  }
}

function logout() {
  localStorage.removeItem('token')
  state.token = null
  state.user = null
  renderUserArea()
  go('dashboard')
}

async function loadMe() {
  if (!state.token) return
  try {
    state.user = await api('/auth/me')
  } catch {
    state.token = null
    localStorage.removeItem('token')
  }
  renderUserArea()
}

function go(route, params = {}) {
  state.currentRoute = route
  state.routeParams = params
  if (route === 'dashboard') renderDashboard()
  else if (route === 'events') renderEvents()
  else if (route === 'event') renderEventDetails(params.id)
  else if (route === 'login') renderLogin()
  else if (route === 'my-photos') renderMyPhotos()
  else if (route === 'notifications') renderNotifications()
  else if (route === 'favorites') renderFavorites()
  else if (route === 'search') renderSearch(params.q)
}

async function renderDashboard() {
  try {
    const events = await api('/events')
    render(el('section', {},
      el('div', { class: 'page-header' },
        el('h2', {}, 'CampusLens'),
        el('p', {}, 'Centralized event media platform for campus clubs and societies.')
      ),
      renderSearchBar(),
      el('h3', { class: 'section-title' }, 'Recent Events'),
      renderEventGrid(events.slice(0, 6))
    ))
  } catch (e) {
    render(el('p', { class: 'empty-state' }, 'Failed to load: ' + e.message))
  }
}

const CATEGORIES = ['All', 'Cultural', 'Technical', 'Sports', 'Outdoor', 'Workshop']
let activeCategory = 'All'

async function renderEvents() {
  const params = activeCategory !== 'All' ? `?category=${activeCategory}` : ''
  const events = await api('/events' + params)

  const filterBar = el('div', { class: 'filter-bar' },
    ...CATEGORIES.map(cat =>
      el('button', {
        class: `filter-btn ${activeCategory === cat ? 'active' : ''}`,
        onclick: () => { activeCategory = cat; renderEvents() }
      }, cat)
    )
  )

  render(el('section', {},
    el('div', { class: 'page-header' },
      el('h2', {}, 'Events'),
      el('p', {}, 'Browse public and club-specific event albums.')
    ),
    renderSearchBar(),
    filterBar,
    renderEventGrid(events)
  ))
}

function renderEventGrid(events) {
  if (!events.length) return el('p', { class: 'empty-state' }, 'No events yet.')
  return el('div', { class: 'card-grid' },
    ...events.map(ev => {
      const card = el('div', { class: 'event-card', onclick: () => go('event', { id: ev.id }) })
      if (ev.cover_image_url) {
        const img = el('img', { class: 'event-cover', src: ev.cover_image_url, alt: ev.title })
        card.appendChild(img)
      }
      card.appendChild(el('div', { class: 'event-info' },
        el('span', { class: 'event-category' }, ev.category),
        el('h4', {}, ev.title),
        el('p', {}, ev.club_name || ev.club?.name || ''),
        el('p', {}, new Date(ev.event_date).toLocaleDateString('en-IN')),
        el('span', { class: `badge ${ev.visibility === 'PUBLIC' ? 'badge-green' : 'badge-amber'}` }, ev.visibility)
      ))
      return card
    })
  )
}

async function renderEventDetails(eventId) {
  try {
    const event = await api(`/events/${eventId}`)
    const albumId = event.albums[0]?.id
    const media = albumId ? (await api(`/media?albumId=${albumId}`)).items : []

    const section = el('section', {},
      el('div', { class: 'page-header' },
        el('span', { class: 'event-category' }, event.category),
        el('h2', {}, event.title),
        el('p', {}, event.club_name),
        event.description && el('p', {}, event.description),
        el('p', {}, `${new Date(event.event_date).toLocaleDateString('en-IN')}${event.venue ? ' · ' + event.venue : ''}`),
        el('span', { class: `badge ${event.visibility === 'PUBLIC' ? 'badge-green' : 'badge-amber'}` }, event.visibility)
      ),
      el('div', { class: 'album-tabs' },
        ...event.albums.map(a =>
          el('button', { class: 'album-tab active' }, `${a.title} (${a.media_count})`)
        )
      )
    )

    if (state.user && albumId) {
      section.appendChild(renderUploadZone(albumId, () => go('event', { id: eventId })))
    }

    section.appendChild(renderMediaGrid(media))
    render(section)
  } catch (e) {
    render(el('p', { class: 'empty-state' }, 'Failed to load event: ' + e.message))
  }
}

function renderMediaGrid(media) {
  if (!media.length) return el('p', { class: 'empty-state' }, 'No media yet.')
  return el('div', { class: 'media-grid' },
    ...media.map(renderMediaCard)
  )
}

function renderMediaCard(m) {
  const card = el('div', { class: 'media-card' })
  card.appendChild(el('img', {
    class: 'media-thumb',
    src: m.file_url,
    alt: m.caption || m.original_filename,
    loading: 'lazy'
  }))

  const body = el('div', { class: 'media-body' })
  if (m.caption) body.appendChild(el('p', { class: 'media-caption' }, m.caption))

  const tagsEl = el('div', { class: 'media-tags' },
    ...(m.tags || []).slice(0, 4).map(t => el('span', { class: 'tag' }, t.tag))
  )
  body.appendChild(tagsEl)

  body.appendChild(el('div', { class: 'media-meta' },
    el('span', {}, m.uploader_name || ''),
    el('span', {}, m.match_score ? `Match ${(m.match_score * 100).toFixed(0)}%` : '')
  ))

  const likeBtn = el('button', {
    class: `action-btn ${m.user_liked ? 'active' : ''}`,
    onclick: async () => {
      if (!state.user) return go('login')
      const res = await api(`/media/${m.id}/likes`, { method: 'POST' })
      likeBtn.textContent = `♥ ${res.count}`
      likeBtn.classList.toggle('active', res.liked)
    }
  }, `♥ ${m.like_count || 0}`)

  const commentBtn = el('button', {
    class: 'action-btn',
    onclick: () => openComments(m.id)
  }, `💬 ${m.comment_count || 0}`)

  const favBtn = el('button', {
    class: `action-btn ${m.user_favorited ? 'active' : ''}`,
    onclick: async () => {
      if (!state.user) return go('login')
      const res = await api(`/media/${m.id}/favorite`, { method: 'POST' })
      favBtn.textContent = res.favorited ? '★' : '☆'
      favBtn.classList.toggle('active', res.favorited)
    }
  }, m.user_favorited ? '★' : '☆')

  const downloadBtn = el('button', {
    class: 'action-btn',
    onclick: async () => {
      const res = await api(`/media/${m.id}/download`, { method: 'POST' })
      alert(`Download ready.\nWatermark: ${res.watermark}`)
      window.open(res.downloadUrl, '_blank')
    }
  }, '↓')

  body.appendChild(el('div', { class: 'media-actions' }, likeBtn, commentBtn, favBtn, downloadBtn))
  card.appendChild(body)
  return card
}

async function openComments(mediaId) {
  if (!state.user) return go('login')
  const comments = await api(`/media/${mediaId}/comments`)

  const list = el('div', {},
    ...(comments.length
      ? comments.map(c => el('div', { class: 'comment-item' },
          el('strong', {}, c.user_name),
          el('p', {}, c.body)
        ))
      : [el('p', { class: 'empty-state' }, 'No comments yet.')])
  )

  const input = el('input', { class: 'input', placeholder: 'Write a comment...' })
  const postBtn = el('button', {
    class: 'btn btn-primary',
    onclick: async () => {
      if (!input.value.trim()) return
      const c = await api(`/media/${mediaId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: input.value.trim() })
      })
      list.appendChild(el('div', { class: 'comment-item' },
        el('strong', {}, c.user_name),
        el('p', {}, c.body)
      ))
      input.value = ''
    }
  }, 'Post')

  showModal('Comments',
    list,
    el('div', { class: 'form', style: 'margin-top: 16px' }, input, postBtn)
  )
}

function renderUploadZone(albumId, onDone) {
  const zone = el('div', { class: 'upload-zone' },
    el('p', {}, '📤 Click or drop photos here to upload'),
    el('p', { class: 'hint' }, 'You can select multiple files')
  )

  const fileInput = el('input', { type: 'file', multiple: true, accept: 'image/*,video/*', style: 'display:none' })

  async function handleFiles(files) {
    if (!files.length) return
    zone.innerHTML = '<p>Uploading ' + files.length + ' files...</p>'
    const formData = new FormData()
    formData.append('albumId', albumId)
    Array.from(files).forEach(f => formData.append('files', f))
    try {
      await apiUpload('/media/upload', formData)
      zone.innerHTML = '<p>✓ Upload complete</p>'
      setTimeout(onDone, 800)
    } catch (e) {
      zone.innerHTML = '<p class="error-text">Upload failed: ' + e.message + '</p>'
    }
  }

  zone.onclick = () => fileInput.click()
  fileInput.onchange = e => handleFiles(e.target.files)
  zone.ondragover = e => { e.preventDefault(); zone.classList.add('dragging') }
  zone.ondragleave = () => zone.classList.remove('dragging')
  zone.ondrop = e => { e.preventDefault(); zone.classList.remove('dragging'); handleFiles(e.dataTransfer.files) }

  const wrapper = el('div', {}, zone, fileInput)
  return wrapper
}

function renderLogin() {
  const emailInput = el('input', { class: 'input', type: 'email', placeholder: 'Email', value: 'admin@campuslens.dev' })
  const passInput = el('input', { class: 'input', type: 'password', placeholder: 'Password', value: 'campus123' })
  const errEl = el('p', { class: 'error-text' })

  const form = el('form', {
    class: 'form',
    onsubmit: async e => {
      e.preventDefault()
      errEl.textContent = ''
      try {
        const res = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: emailInput.value, password: passInput.value })
        })
        state.token = res.token
        state.user = res.user
        localStorage.setItem('token', res.token)
        renderUserArea()
        go('dashboard')
      } catch (e) {
        errEl.textContent = e.message
      }
    }
  },
    emailInput, passInput, errEl,
    el('button', { class: 'btn btn-primary', type: 'submit' }, 'Sign In')
  )

  render(el('div', { class: 'auth-card' },
    el('h2', {}, 'Sign in to CampusLens'),
    el('p', {}, 'Access your club albums and event media'),
    form,
    el('p', { class: 'hint' }, 'Demo: admin@campuslens.dev / campus123')
  ))
}

async function renderMyPhotos() {
  if (!state.user) return go('login')

  const section = el('section', {},
    el('div', { class: 'page-header' },
      el('h2', {}, 'My Photos'),
      el('p', {}, 'Photos discovered using your selfie reference.')
    )
  )

  const fileInput = el('input', { type: 'file', accept: 'image/*', style: 'display:none' })
  const statusEl = el('p', { class: 'hint' })
  const uploadBtn = el('button', {
    class: 'btn btn-primary',
    onclick: () => fileInput.click()
  }, 'Upload / Update Selfie')

  fileInput.onchange = async e => {
    const file = e.target.files[0]
    if (!file) return
    statusEl.textContent = 'Processing selfie...'
    try {
      const fd = new FormData()
      fd.append('selfie', file)
      await apiUpload('/me/face-profile', fd)
      statusEl.textContent = '✓ Selfie saved. Loading matches...'
      loadMatches()
    } catch (err) {
      statusEl.textContent = 'Error: ' + err.message
    }
  }

  section.appendChild(el('div', { class: 'form' }, uploadBtn, statusEl, fileInput))
  const gridContainer = el('div', {})
  section.appendChild(gridContainer)
  render(section)

  async function loadMatches() {
    try {
      const matches = await api('/me/face-matches')
      gridContainer.innerHTML = ''
      gridContainer.appendChild(renderMediaGrid(matches))
    } catch (e) {
      gridContainer.innerHTML = ''
      gridContainer.appendChild(el('p', { class: 'empty-state' }, e.message))
    }
  }

  loadMatches()
}

async function renderNotifications() {
  if (!state.user) return go('login')
  const { notifications, unreadCount } = await api('/notifications')

  render(el('section', {},
    el('div', { class: 'page-header' },
      el('h2', {}, `Notifications ${unreadCount ? `(${unreadCount} new)` : ''}`)
    ),
    el('div', { class: 'notification-list' },
      ...(notifications.length
        ? notifications.map(n => el('div', {
            class: `notification-item ${n.is_read ? '' : 'unread'}`,
            onclick: async () => {
              if (!n.is_read) {
                await api(`/notifications/${n.id}/read`, { method: 'PATCH' })
                renderNotifications()
              }
            }
          },
            el('div', { class: 'notification-body' },
              el('strong', {}, n.title),
              el('p', {}, n.message)
            ),
            el('span', { class: 'hint' }, new Date(n.created_at).toLocaleDateString('en-IN'))
          ))
        : [el('p', { class: 'empty-state' }, 'No notifications.')])
    )
  ))
}

async function renderFavorites() {
  if (!state.user) return go('login')
  const { items } = await api('/me/favorites/favorites')

  render(el('section', {},
    el('div', { class: 'page-header' },
      el('h2', {}, 'Favorites'),
      el('p', {}, 'Your saved photos.')
    ),
    renderMediaGrid(items)
  ))
}

async function renderSearch(q) {
  const media = await api(`/search/media?q=${encodeURIComponent(q)}`)
  const events = await api(`/search/events?q=${encodeURIComponent(q)}`)

  render(el('section', {},
    el('div', { class: 'page-header' }, el('h2', {}, `Search: "${q}"`)),
    renderSearchBar(q),
    events.length ? el('h3', { class: 'section-title' }, 'Events') : null,
    events.length ? renderEventGrid(events) : null,
    media.length ? el('h3', { class: 'section-title' }, 'Media') : null,
    media.length ? renderMediaGrid(media) : null,
    !media.length && !events.length ? el('p', { class: 'empty-state' }, 'No results.') : null
  ))
}

function renderSearchBar(value = '') {
  const input = el('input', { class: 'input', placeholder: 'Search events, tags, photos...', value })
  const btn = el('button', {
    class: 'btn btn-primary',
    onclick: () => input.value.trim() && go('search', { q: input.value.trim() })
  }, 'Search')
  input.onkeydown = e => { if (e.key === 'Enter') btn.click() }
  return el('div', { class: 'search-bar' }, input, btn)
}

function showModal(title, ...children) {
  const root = document.getElementById('modalRoot')
  root.innerHTML = ''
  const overlay = el('div', {
    class: 'modal-overlay',
    onclick: e => { if (e.target === overlay) root.innerHTML = '' }
  },
    el('div', { class: 'modal' },
      el('h3', {}, title),
      ...children
    )
  )
  root.appendChild(overlay)
}

document.querySelectorAll('[data-route]').forEach(link => {
  link.onclick = e => { e.preventDefault(); go(link.getAttribute('data-route')) }
})

loadMe().then(() => go('dashboard'))
