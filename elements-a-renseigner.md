# Liste des éléments à renseigner

## Paramétrage complémentaire de la composition du Jury

Ces règles complémentaires peuvent être définies par l'école doctorale dans le panneau « Règles complémentaires de votre école doctorale ».

| # | Paramètre | Type de saisie | Valeurs possibles | Par défaut |
|---|-----------|----------------|-------------------|------------|
| 1 | Nombre de membres du jury (minimum et maximum) | Curseur à deux poignées | De 4 à 8 | 4 à 8 |
| 2 | Nombre maximal de membres invités | Nombre | De 0 à 4 | 1 |
| 3 | Les membres du CSI peuvent être examinateurs | Oui / Non | Oui, Non | Oui |
| 4 | Les rapporteurs doivent être extérieurs à l'unité de recherche | Oui / Non | Oui, Non | Oui |
| 5 | Les rapporteurs doivent être extérieurs à l'école doctorale d'inscription | Oui / Non | Oui, Non | Oui |
| 6 | Les rapporteurs doivent être extérieurs à l'établissement d'inscription | Oui / Non | Oui, Non | Oui |
| 7 | Le directeur ou la directrice de thèse est obligatoirement membre du jury | Oui / Non | Oui, Non | Oui |
| 8 | Le directeur ou la directrice de thèse est toujours considéré·e comme membre interne, même issu·e d'un autre établissement | Oui / Non | Oui, Non | Non |
| 9 | Au moins un membre du jury doit appartenir à l'établissement d'inscription | Oui / Non | Oui, Non | Non |
| 10 | Un membre émérite peut être rapporteur | Oui / Non | Oui, Non | Oui |
| 11 | Un membre émérite peut être président du jury | Oui / Non | Oui, Non | Non |
| 12 | Condition de parité hommes/femmes | Liste déroulante | Voir ci-dessous | Au moins un membre de chaque genre |

Les trois modes de parité (paramètre 12) :

| Mode | Paramètre supplémentaire | Par défaut |
|------|--------------------------|------------|
| Au moins un membre de chaque genre | Aucun | — |
| Pourcentage minimal de femmes et d'hommes | Pourcentage, de 0 à 50 %, sur tous les membres, arrondi à l'entier supérieur | 40 % |
| Nombre minimal de femmes selon l'effectif | Une valeur par effectif de 4 à 8 membres | 1 femme minimum pour chaque effectif |

Ces règles peuvent être sauvegardées et rechargées seules, avec les boutons « Sauvegarder les règles » et « Charger des règles », sans modifier le profil ni les membres. Les membres dont le rôle est « Membre invité » ne sont pas comptés dans les règles liées à l'effectif ou à la parité, sauf pour le paramètre 2, qui porte sur leur propre nombre.

## Informations concernant le doctorant et la thèse

Ces informations se renseignent dans la rubrique « Identification de la thèse ». Elles sont facultatives.

| # | Information | Type de saisie | Contenu attendu | Obligatoire |
|---|-------------|----------------|-----------------|-------------|
| 1 | Nom et prénom du doctorant | Texte libre | Nom et prénom | Non |
| 2 | Titre de la thèse | Texte libre | Titre de la thèse | Non |
| 3 | École doctorale | Recherche avec liste de résultats | Choix dans l'annuaire `fr-esr-ecoles_doctorales_annuaire.json`, par numéro, sigle ou nom. Les résultats affichent le numéro et le sigle (ou « Sans sigle »). | Non |
| 4 | Établissement d'inscription | Liste déroulante | Choix parmi les établissements associés à l'école doctorale sélectionnée. La liste reste désactivée tant qu'aucune école doctorale n'est choisie. | Non |
| 5 | Date de soutenance prévisionnelle | Date | Date au format jour/mois/année | Non |

Ces informations ne sont utilisées dans aucun contrôle du jury. Elles apparaissent dans la synthèse exportée et dans la sauvegarde de la configuration.

## Informations concernant les membres du Jury

Chaque membre dispose d'une fiche. Le bouton « Télécharger le mémo » fournit la liste de ces informations à demander à chaque personne.

| # | Information | Type de saisie | Valeurs possibles | Obligatoire |
|---|-------------|----------------|-------------------|-------------|
| 1 | Nom et prénom | Texte libre | Nom et prénom | Oui |
| 2 | Genre | Oui / Non | Homme, Femme | Oui |
| 3 | Établissement ou organisme de rattachement | Recherche avec saisie libre | Établissements de l'annuaire, ou autre nom saisi librement | Oui |
| 4 | Fonction ou qualité dans l'établissement ou organisme | Recherche avec saisie libre | Fonctions de `liste_fonction.json`, ou autre fonction saisie librement | Oui |
| 5 | Professeur ou assimilé ou rang équivalent | Oui / Non | Oui, Non. Prérempli selon la fonction (Oui si elle relève de cette catégorie, Non sinon), et modifiable. | Oui |
| 6 | Membre du CSI | Oui / Non | Oui, Non. Aucune valeur présélectionnée. | Non |
| 7 | Titulaire de l'HDR | Choix unique | Oui, Non, Équivalence | Oui |
| 8 | Titulaire de l'éméritat | Oui / Non | Oui, Non | Oui |
| 9 | Rôle dans le jury | Liste déroulante | Président.e, Directeur.rice de thèse, co-Directeur.rice de thèse, co-Encadrant.e de thèse, Rapporteur.rice, Examinateur.trice, Membre invité | Oui |
| 10 | Lien avec l'établissement | Liste déroulante | Membre de l'unité de recherche, Membre de l'école doctorale d'inscription, Membre de l'établissement d'inscription, Membre extérieur | Oui |

- Chaque fiche affiche un indicateur de complétude qui compte les informations obligatoires renseignées (9 au total).
- Les membres dont le rôle est « Membre invité » doivent aussi être renseignés, mais ne sont pas comptés dans les conditions du jury, sauf pour la limite de leur nombre.
- Une même personne ne peut figurer qu'une seule fois dans le jury.
