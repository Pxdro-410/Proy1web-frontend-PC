// Lógica del modal de rating 

let _currentRatingPilot = null;
let _selectedScore = 0;

async function openRatingModal(pilot) {
  _currentRatingPilot = pilot;
  _selectedScore = 0;

  document.getElementById('rating-pilot-id').value = pilot.id;
  document.getElementById('rating-pilot-name').textContent = pilot.name;
  document.getElementById('rating-pilot-team').textContent = pilot.team;

  const img = document.getElementById('rating-pilot-img');
  if (pilot.image_path) { img.src = pilot.image_path; img.alt = pilot.name; img.style.display = 'block'; }
  else { img.style.display = 'none'; }

  document.getElementById('rating-comment').value = '';
  document.getElementById('err-rating').textContent = '';
  document.getElementById('rating-score-text').textContent = 'Selecciona una puntuación';
  renderStars(0);

  document.getElementById('modal-rating').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  await loadRatings(pilot.id);
}

function closeRatingModal() {
  document.getElementById('modal-rating').classList.add('hidden');
  document.body.style.overflow = '';
  _currentRatingPilot = null;
  _selectedScore = 0;
}

function buildStars() {
  const container = document.getElementById('rating-stars');
  container.innerHTML = '';

  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'star-btn';
    btn.textContent = '★';
    btn.dataset.score = i;
    container.appendChild(btn);
  }

  // Un solo listener delegado en el contenedor sin la necesidad de reconstruir el DOM
  container.addEventListener('click', e => {
    const btn = e.target.closest('.star-btn');
    if (!btn) return;
    const score = parseInt(btn.dataset.score, 10);
    _selectedScore = score;
    highlightStars(score);
    const labels = ['', 'Terrible', 'Muy malo', 'Malo', 'Regular', 'Mediocre',
      'Aceptable', 'Bueno', 'Muy bueno', 'Excelente', '¡Perfecto!'];
    document.getElementById('rating-score-text').textContent =
      `${score}/10 — ${labels[score]}`;
  });

  container.addEventListener('mouseover', e => {
    const btn = e.target.closest('.star-btn');
    if (btn) highlightStars(parseInt(btn.dataset.score, 10));
  });

  container.addEventListener('mouseleave', () => {
    highlightStars(_selectedScore);
  });
}

// sin tocar el DOM, actualiza solo las clases CSS
function highlightStars(active) {
  document.querySelectorAll('#rating-stars .star-btn').forEach((s, idx) => {
    s.classList.toggle('active', idx + 1 <= active);
  });
}

// llama a buildstars y maneja el resaltado de estrellas para el rating
function renderStars(active) {
  buildStars();
  highlightStars(active);
}

// obtiene los ratings del piloto desde la api
async function loadRatings(pilotoId) {
  const list = document.getElementById('ratings-list');
  list.innerHTML = '<p class="ratings-empty">Cargando...</p>';
  try {
    const data = await getRatings(pilotoId);
    const circle = document.getElementById('avg-score-circle');
    const count = document.getElementById('avg-score-count');
    if (data.count > 0) {
      circle.textContent = data.average.toFixed(1);
      count.textContent = `${data.count} rating${data.count !== 1 ? 's' : ''}`;
    } else {
      circle.textContent = '–';
      count.textContent = 'Sin ratings aún';
    }
    if (!data.ratings || data.ratings.length === 0) {
      list.innerHTML = '<p class="ratings-empty">Aún no hay ratings para este piloto.</p>';
      return;
    }
    list.innerHTML = data.ratings.map(r => `
      <div class="rating-item">
        <div class="rating-item-score">★ ${r.score}/10</div>
        ${r.comment ? `<div class="rating-item-comment">${r.comment.replace(/</g, '&lt;')}</div>` : ''}
        <div class="rating-item-date">${new Date(r.created_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </div>`).join('');
  } catch (err) {
    list.innerHTML = '<p class="ratings-empty">Error al cargar ratings.</p>';
  }
}

// maneja el envio del rating
async function handleRatingSubmit(e) {
  e.preventDefault();
  const errEl = document.getElementById('err-rating');
  errEl.textContent = '';
  if (_selectedScore < 1 || _selectedScore > 10) {
    errEl.textContent = 'Por favor selecciona una puntuación (1–10).';
    return;
  }
  const pilotoId = _currentRatingPilot.id;
  const comment = document.getElementById('rating-comment').value.trim();
  const btn = document.getElementById('btn-submit-rating');
  btn.disabled = true; btn.textContent = 'Enviando...';
  try {
    await createRating(pilotoId, { score: _selectedScore, comment });
    showToast('¡Rating enviado!', 'success');
    _selectedScore = 0;
    renderStars(0);
    document.getElementById('rating-score-text').textContent = 'Selecciona una puntuación';
    document.getElementById('rating-comment').value = '';
    await loadRatings(pilotoId);
  } catch (err) {
    errEl.textContent = err.message;
  } finally {
    btn.disabled = false; btn.textContent = 'Enviar Rating';
  }
}

document.getElementById('modal-rating-close').addEventListener('click', closeRatingModal);
document.getElementById('form-rating').addEventListener('submit', handleRatingSubmit);
document.getElementById('modal-rating').addEventListener('click', e => { if (e.target === e.currentTarget) closeRatingModal(); });
