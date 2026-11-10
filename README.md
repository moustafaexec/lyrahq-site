# lyrahq.co

Site statique de LYRA, servi par GitHub Pages sur le domaine lyrahq.co.

- `index.html` : la landing, en anglais. Le film passe une fois, coupe au noir, LYRA apparaît, puis le film repart
  en boucle, flou, et se refait net sur SIGN HERE. Le bouton ouvre le formulaire de demande d'invitation : la demande
  part vers le script Google de LYRA (feuille « LYRA, demandes d'invitation » et notification à moustafa@lyrahq.co).
- `fr/index.html` : la même landing en français. lyrahq.fr y renvoie (redirection réglée chez GoDaddy).
- `assets/site.js` et `assets/site.css` : l'animation et la mise en page de la landing.
- `media/` : les deux films (16/9 en paysage, vertical en portrait) et leurs affiches.
- `legal/`, `privacy/`, `data-deletion/` : pages légales en anglais. `fr/` : les mêmes en français.
- `og.jpg` : l'image qui s'affiche quand on partage le lien.
- `CNAME` : le domaine. Ne pas supprimer.

Vérification du domaine par Meta : coller la balise `facebook-domain-verification` dans le `<head>` de `index.html`,
à l'endroit marqué.

Police : Libre Franklin, licence SIL Open Font License (assets/fonts/OFL.txt).
