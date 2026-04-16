/**
 * Собирает тело запроса (Readable Stream) в JSON объект
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<Object>}
 */
export async function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

/**
 * Унифицированный ответ сервера
 */
export function sendJson(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}
