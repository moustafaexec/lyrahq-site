# lyrahq.co

Site statique de LYRA, servi par GitHub Pages sur le domaine lyrahq.co.

- `index.html` : la landing, en anglais. Le film passe une fois, coupe au noir, LYRA apparaît, puis le film repart
  en boucle, flou, et se refait net sur SIGN HERE. Le bouton ouvre le formulaire de demande d'invitation : la demande
  part vers le script Google de LYRA (feuille « LYRA, demandes d'invitation » et notification à moustafa@lyrahq.co).
- `fr/index.html` : la même landing en français. lyrahq.fr y renvoie (redirection réglée chez GoDaddy).
- `assets/site.js` et `assets/site.css` : l'animation et la mise en page de la landing.
- `media/` : les deux films (16/9 en paysage, vertical en portrait) et leurs affiches.
- `legal/`, `privacy/`, `data-deletion/` : pages légales en anglais. `fr/` : les mêmes en français.
- `demo/index.html` : la page d'accès de la démo cliquable, en anglais, en un seul fichier. Elle demande un mot de
  passe. La démo est dans la page, chiffrée : sans le mot de passe, rien n'en est lisible. Hors index (`noindex`) et
  hors `sitemap.xml`. Le mot de passe n'est écrit dans aucun fichier de ce dépôt.
  Elle sort du build de la démo (`04-Demo-US/acces.html`), elle ne s'édite pas ici : on remplace le fichier entier.
  Une fois ouverte, `lyrahq.co/demo/` montre le split sheet. Un parcours s'ouvre par son adresse, par exemple
  `lyrahq.co/demo/#getting-started`.
- `demo-believe/index.html` : la page d'accès de la démo Believe, sur le même modèle, avec un autre mot de passe. Le
  premier message demande la langue : en français le parcours Believe, en anglais le parcours américain. Elle sort du
  build de la démo Believe (`04-Demo/acces.html`) et se remplace en entier.
- `believe/index.html` : l'ancienne adresse de la démo Believe. Elle renvoie vers `lyrahq.co/demo-believe/` en gardant
  la fin du lien, pour qu'un lien déjà envoyé continue de marcher.
- `og.jpg` : l'image qui s'affiche quand on partage le lien.
- `CNAME` : le domaine. Ne pas supprimer.

Vérification du domaine par Meta : coller la balise `facebook-domain-verification` dans le `<head>` de `index.html`,
à l'endroit marqué.

Police : Libre Franklin, licence SIL Open Font License (assets/fonts/OFL.txt).
