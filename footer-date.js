// Affiche la date de dernière modification du document renvoyée par le serveur
// (date de déploiement sur GitHub Pages). Sans date fiable, le texte statique est conservé.
(() => {
  const element = document.querySelector("time[data-last-modified]");
  const modified = new Date(document.lastModified);
  if (!element || Number.isNaN(modified.getTime()) || modified.getFullYear() < 2020) {
    return;
  }
  element.dateTime = modified.toISOString().slice(0, 10);
  element.textContent = modified.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
})();
