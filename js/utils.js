// utils.js
// Fonctions utilitaires

/**
 * Centre le pivot d'un objet 3D
 * @param {THREE.Object3D} object - L'objet à centrer
 */
function centerPivot(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  box.getCenter(center);
  object.position.sub(center);
}
