// BASE_URL se define en js/config.js
// solo cambia el valor si railway se cae.


// Helper genérico que lanza fetch, parsea JSON y maneja errores HTTP.
// Lanza un Error con el mensaje del servidor si el status no es ok.
async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  // 204 No Content no tiene body
  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    // El backend devuelve { error: "..." } en errores
    throw new Error(data.error || `Error ${res.status}`);
  }

  return data;
}

// Pilotos 
// GET /piloto lista paginada con búsqueda y ordenamiento.
// @param {Object} params - { page, limit, q, sort, order }
async function getPilotos({ page = 1, limit = 12, q = '', sort = 'id', order = 'ASC' } = {}) {
  const qs = new URLSearchParams({ page, limit, sort, order });
  if (q) qs.set('q', q);
  return request(`/piloto?${qs}`);
}

// GET /piloto/:id obtener un piloto por ID.
async function getPilotoById(id) {
  return request(`/piloto/${id}`);
}

// POST /piloto crear un piloto nuevo.
// @param {Object} body - { name, team, nationality, number, championships, description, image_path }
async function createPiloto(body) {
  return request('/piloto', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// PUT /piloto/:id editar un piloto existente.
async function updatePiloto(id, body) {
  return request(`/piloto/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// DELETE /piloto/:id elimina un piloto.
// Devuelve null o un error 204
async function deletePiloto(id) {
  return request(`/piloto/${id}`, { method: 'DELETE' });
}

// Ratings

// GET /piloto/:id/rating obtiene ratings y promedio.
async function getRatings(pilotoId) {
  return request(`/piloto/${pilotoId}/rating`);
}

// POST /piloto/:id/rating envía un rating.
// @param {Object} body - { score, comment }
async function createRating(pilotoId, body) {
  return request(`/piloto/${pilotoId}/rating`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
