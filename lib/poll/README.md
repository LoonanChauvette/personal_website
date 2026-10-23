Sondage en classe (`/q`). Source : ~/Projects/live-poll.

- `lib/poll/core.mjs` est une copie exacte de `public/q/core.js` : le navigateur et la fonction partagent la même logique de validation. Node 20 exige l'extension `.mjs` côté serveur, car ce dépôt n'est pas `"type": "module"`.
- Après une modification dans live-poll, recopiez les fichiers et vérifiez :
  `cmp public/q/core.js lib/poll/core.mjs`
- Variables Vercel : `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `POLL_TEACHER_KEY`.
