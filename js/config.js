// archivo de configuración para la URL base de la API.
// Para PRODUCCIÓN (Netlify): apunta a Railway.
// Para DESARROLLO LOCAL: comenta la línea de producción y descomenta la de localhost.
// esto solo se hace en caso de que se caiga railway dado que se utiliza un plan gratuito. 

// Producción 
const BASE_URL = 'https://proy1web-backend-pc-production.up.railway.app';

// Desarrollo local (docker compose up / go run .) 
// const BASE_URL = 'http://localhost:8080';
