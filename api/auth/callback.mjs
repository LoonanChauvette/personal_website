// /api/auth/callback — adresse de retour déclarée dans l'application GitHub.
// Même gestionnaire que /api/poll, opération « retour_github ».
import handler from "../poll.mjs";

export default function retourGithub(req, res) {
  req.query = { ...(req.query || {}), op: "retour_github" };
  return handler(req, res);
}
