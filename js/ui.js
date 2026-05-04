// logica de la interfaz
// estado de la app
const state = {
  page: 1, limit: 12, q: '', sort: 'id', order: 'ASC',
  totalPages: 1, deletingId: null,
};

// toast: mensaje que aparece en la esquina superior derecha
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('leaving');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3500);
}

// renderizado de cards
function renderCard(p) {
  const champ = p.championships > 0
    ? `<div class="card-champ-badge">🏆 ${p.championships}x</div>` : '';
  const img = p.image_path
    ? `<img class="card-image" src="${p.image_path}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" /><div class="card-image-placeholder" style="display:none">🏎️</div>`
    : `<div class="card-image-placeholder">🏎️</div>`;

  return `
    <article class="pilot-card">
      <div class="card-image-wrap">
        ${img}
        <div class="card-number-badge">#${p.number}</div>
        ${champ}
      </div>
      <div class="card-body">
        <h2 class="card-name">${p.name}</h2>
        <div class="card-team"><span class="card-team-dot"></span>${p.team}</div>
        <div class="card-nationality">🌍 ${p.nationality}</div>
        ${p.description ? `<p class="card-description">${p.description}</p>` : ''}
      </div>
      <div class="card-footer">
        <button class="btn-card-rating" onclick="openRatingModal(${JSON.stringify(p).replace(/"/g, '&quot;')})">⭐ Rating</button>
        <button class="btn-card-edit"   onclick="openEditModal(${JSON.stringify(p).replace(/"/g, '&quot;')})"> Editar</button>
        <button class="btn-card-delete" onclick="confirmDelete(${p.id},'${p.name.replace(/'/g, "\\'")}')"> Borrar</button>
      </div>
    </article>`;
}

// renderizado de pilotos
function renderPilots(pilots) {
  const grid = document.getElementById('pilots-grid');
  const empty = document.getElementById('empty-state');
  const loading = document.getElementById('loading-state');

  loading.classList.add('hidden');

  if (!pilots || pilots.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    grid.innerHTML = pilots.map(renderCard).join('');
  }
}

// paginación
function renderPagination(page, totalPages) {
  const nav = document.getElementById('pagination');
  if (totalPages <= 1) { nav.innerHTML = ''; return; }

  const pages = [];
  pages.push({ label: '«', value: page - 1, disabled: page === 1 });

  const range = 2;
  for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
    pages.push({ label: i, value: i, active: i === page });
  }
  if (page + range < totalPages) pages.push({ label: '...', value: null, disabled: true });
  if (page + range < totalPages) pages.push({ label: totalPages, value: totalPages });

  pages.push({ label: '»', value: page + 1, disabled: page === totalPages });

  nav.innerHTML = pages.map(p => `
    <button class="page-btn${p.active ? ' active' : ''}"
      ${p.disabled || p.value === null ? 'disabled' : ''}
      onclick="${p.value ? `goToPage(${p.value})` : ''}">${p.label}</button>
  `).join('');
}

async function goToPage(page) {
  state.page = page;
  await loadPilots();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// carga principal
async function loadPilots() {
  document.getElementById('loading-state').classList.remove('hidden');
  document.getElementById('pilots-grid').innerHTML = '';
  document.getElementById('empty-state').classList.add('hidden');

  try {
    const data = await getPilotos({
      page: state.page, limit: state.limit,
      q: state.q, sort: state.sort, order: state.order,
    });

    state.totalPages = data.total_pages;

    // Info de resultados
    const countEl = document.getElementById('results-count');
    if (data.total > 0) {
      const from = (data.page - 1) * data.limit + 1;
      const to = Math.min(data.page * data.limit, data.total);
      countEl.innerHTML = `Mostrando <strong>${from}–${to}</strong> de <strong>${data.total}</strong> pilotos`;
    } else {
      countEl.innerHTML = '';
    }

    renderPilots(data.data);
    renderPagination(data.page, data.total_pages);

  } catch (err) {
    document.getElementById('loading-state').classList.add('hidden');
    showToast('Error al cargar pilotos: ' + err.message, 'error');
  }
}

// modal crear / editar
function openCreateModal() {
  document.getElementById('modal-pilot-title').textContent = 'Nuevo Piloto';
  document.getElementById('form-pilot').reset();
  document.getElementById('pilot-id').value = '';
  clearFormErrors();
  document.getElementById('modal-pilot').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.getElementById('pilot-name').focus();
}

function openEditModal(pilot) {
  document.getElementById('modal-pilot-title').textContent = 'Editar Piloto';
  document.getElementById('pilot-id').value = pilot.id;
  document.getElementById('pilot-name').value = pilot.name;
  document.getElementById('pilot-team').value = pilot.team;
  document.getElementById('pilot-nationality').value = pilot.nationality;
  document.getElementById('pilot-number').value = pilot.number;
  document.getElementById('pilot-championships').value = pilot.championships;
  document.getElementById('pilot-description').value = pilot.description || '';
  document.getElementById('pilot-image').value = pilot.image_path || '';
  clearFormErrors();
  document.getElementById('modal-pilot').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closePilotModal() {
  document.getElementById('modal-pilot').classList.add('hidden');
  document.body.style.overflow = '';
}

function clearFormErrors() {
  ['err-name', 'err-team', 'err-nationality', 'err-number', 'err-championships', 'form-error']
    .forEach(id => { document.getElementById(id).textContent = ''; });
}

function showFieldError(id, msg) {
  document.getElementById(id).textContent = msg;
}

async function handlePilotSubmit(e) {
  e.preventDefault();
  clearFormErrors();

  const id = document.getElementById('pilot-id').value;
  const body = {
    name: document.getElementById('pilot-name').value.trim(),
    team: document.getElementById('pilot-team').value.trim(),
    nationality: document.getElementById('pilot-nationality').value.trim(),
    number: parseInt(document.getElementById('pilot-number').value, 10),
    championships: parseInt(document.getElementById('pilot-championships').value, 10) || 0,
    description: document.getElementById('pilot-description').value.trim(),
    image_path: document.getElementById('pilot-image').value.trim(),
  };

  // Validación client-side básica
  let valid = true;
  if (!body.name) { showFieldError('err-name', 'El nombre es requerido.'); valid = false; }
  if (!body.team) { showFieldError('err-team', 'El equipo es requerido.'); valid = false; }
  if (!body.nationality) { showFieldError('err-nationality', 'La nacionalidad es requerida.'); valid = false; }
  if (!body.number || body.number < 1 || body.number > 99) {
    showFieldError('err-number', 'El número debe estar entre 1 y 99.'); valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById('btn-submit-pilot');
  btn.disabled = true; btn.textContent = 'Guardando...';

  try {
    if (id) {
      await updatePiloto(id, body);
      showToast('Piloto actualizado correctamente.', 'success');
    } else {
      await createPiloto(body);
      showToast('Piloto creado correctamente.', 'success');
    }
    closePilotModal();
    state.page = 1;
    await loadPilots();
  } catch (err) {
    document.getElementById('form-error').textContent = err.message;
  } finally {
    btn.disabled = false; btn.textContent = 'Guardar';
  }
}

// modal para confirmar el borrado
function confirmDelete(id, name) {
  state.deletingId = id;
  document.getElementById('confirm-pilot-name').textContent = name;
  document.getElementById('modal-confirm').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeConfirmModal() {
  document.getElementById('modal-confirm').classList.add('hidden');
  document.body.style.overflow = '';
  state.deletingId = null;
}

async function handleConfirmDelete() {
  if (!state.deletingId) return;
  const btn = document.getElementById('btn-confirm-delete');
  btn.disabled = true; btn.textContent = 'Eliminando...';
  try {
    await deletePiloto(state.deletingId);
    showToast('Piloto eliminado.', 'success');
    closeConfirmModal();
    state.page = 1;
    await loadPilots();
  } catch (err) {
    showToast('Error al eliminar: ' + err.message, 'error');
  } finally {
    btn.disabled = false; btn.textContent = 'Eliminar';
  }
}

// controles de búsqueda y ordenamiento
let _searchTimer = null;

document.getElementById('input-search').addEventListener('input', e => {
  const val = e.target.value;
  document.getElementById('btn-clear-search').classList.toggle('visible', val.length > 0);
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => {
    state.q = val.trim();
    state.page = 1;
    loadPilots();
  }, 400);
});

document.getElementById('btn-clear-search').addEventListener('click', () => {
  document.getElementById('input-search').value = '';
  document.getElementById('btn-clear-search').classList.remove('visible');
  state.q = ''; state.page = 1;
  loadPilots();
});

document.getElementById('select-sort').addEventListener('change', e => {
  state.sort = e.target.value; state.page = 1; loadPilots();
});

document.getElementById('select-limit').addEventListener('change', e => {
  state.limit = parseInt(e.target.value, 10); state.page = 1; loadPilots();
});

document.getElementById('btn-order').addEventListener('click', () => {
  const btn = document.getElementById('btn-order');
  if (state.order === 'ASC') {
    state.order = 'DESC';
    btn.dataset.order = 'DESC';
    btn.querySelector('.order-text').textContent = 'DESC';
    btn.classList.add('desc');
  } else {
    state.order = 'ASC';
    btn.dataset.order = 'ASC';
    btn.querySelector('.order-text').textContent = 'ASC';
    btn.classList.remove('desc');
  }
  state.page = 1; loadPilots();
});

// listeners globales
document.getElementById('btn-open-create').addEventListener('click', openCreateModal);
document.getElementById('btn-cancel-pilot').addEventListener('click', closePilotModal);
document.getElementById('modal-pilot-close').addEventListener('click', closePilotModal);
document.getElementById('form-pilot').addEventListener('submit', handlePilotSubmit);
document.getElementById('modal-pilot').addEventListener('click', e => { if (e.target === e.currentTarget) closePilotModal(); });

document.getElementById('btn-cancel-delete').addEventListener('click', closeConfirmModal);
document.getElementById('modal-confirm-close').addEventListener('click', closeConfirmModal);
document.getElementById('btn-confirm-delete').addEventListener('click', handleConfirmDelete);
document.getElementById('modal-confirm').addEventListener('click', e => { if (e.target === e.currentTarget) closeConfirmModal(); });

// cerrar modales con escape
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closePilotModal();
  closeRatingModal();
  closeConfirmModal();
});

// inicializacion
loadPilots();
