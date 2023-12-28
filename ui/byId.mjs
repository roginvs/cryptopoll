/**
 *
 * @param {string} id
 */
export function byId(id) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Element ${id} not found!`);
  }
  return el;
}
