# Vérification de la conformité d'un jury de thèse

## Présentation
Cette application permet de tester la conformité d'un jury dans le cadre de la délivrance du diplôme national du doctorat. Elle doit être utilisée comme une aide à la réflexion sur la composition du jury, pour le ou la doctorant·e et l'équipe qui encadre sa thèse, avant de faire une proposition à son école doctorale. **L'utilisation de cette application ne garantit pas la conformité du jury : elle constitue une aide. L'école doctorale puis l'établissement d'inscription vérifieront *in fine* la conformité de la composition du jury.**

La cas des thèses en co-tutelle n'est actuellement pas géré par cette application.

Cete application est basée sur les élements de l'[Arrêté du 25 mai 2016 fixant le cadre national de la formation et les modalités conduisant à la délivrance du diplôme national de doctorat](https://www.legifrance.gouv.fr/loda/id/JORFTEXT000032587086) concernant la cponstitution d'un Jury.

Les écoles doctorales et les établissements peuvent compléter ces conditions par des éléments complémentaires, notamment le nombre maximal de membres invité·es, la parité de genre ou la limitation de la participation des membres émérites à certains rôles dans le jury. Ces éléments ne remettent pas en cause les conditions de l'arrêté, mais peuvent résulter d'une interprétation des règles et de la mise en œuvre d'une politique doctorale propre à l'école doctorale ou à l'établissement d'inscription.

## Fonctionnement général

### La page web est organisée en plusieurs rubriques

- Paramétrage du jury : 
  - rappel des règles de l'arrêté du doctorat du 20 mai mai 2016;
  - proposition de règles complémentaires que peuvent  imposer l'école doctorale (ED) et l'établissement d'inscription. Les règles par défaut sont assez usuelles;
  - sauvegarde, si besoin, des règles une fois modifiées.
- Identification de la thèse : informations concernant le ou la doctorant·e et le sujet de thèse
- Membres du Jury : cette partie permet de préciser les informations concernant chaque membre du jury et d'associer le rôle au sein du jury
- À la fin de la page, des informations concernant la composition du jury s'affichent lorsque vous cliquez sur le bouton « Vérifier le jury ».

### Procédure générale

1. Rassemblez les informations sur les membres du jury avant d'en vérifier la conformité. Vous pouvez télécharger le mémo avec la liste des éléments à récupérer depuis la rubrique « Membres du jury ».
2. Facultatif : adaptez les paramètres aux règles particulières de votre école doctorale ou de votre établissement d'inscription.
3. Facultatif : renseignez les informations concernant votre projet de thèse.
4. Renseignez les informations sur chaque membre du jury.
5. Vérifiez la conformité du jury et, si nécessaire, corrigez les informations saisies à partir des indications.
6. Une fois votre jury vérifié, poursuivez la procédure de soutenance auprès de votre école doctorale

### Vérification de la conformité du Jury

La procédure de vérification porte sur :
- les règles de l'arrêté ;
- les règles complémentaires de l'ED ;
- des tests de cohérence des informations sur les membres du jury.

Détail des Vérifications :
- Le détail des éléments qui sont vérifiés est donné dans le fichier [conditions-verifiees.md](conditions-verifiees.md)
- Le détail des paramètres complémentaires de l'école doctorale, des informations sur le ou la doctorant·e et la thèse, et des informations sur les membres du jury est donné dans le fichier [elements-a-renseigner.md](elements-a-renseigner.md).
- Le résultat de la vérification s'affiche en bas de page. Il n'est ni enregistré ni envoyé à un serveur. Le détail (récapitulatif du jury, statut, points à corriger et avertissements, effets complémentaires) est donné dans le fichier [informations-verification.md](informations-verification.md).


## Respect de la vie privée

Cette application a été conçue pour respecter la vie privée des personnes qui l'utilisent. Les informations saisies concernent des personnes (doctorant·e, membres du jury) ; elles restent sur votre appareil.

- **Aucune donnée n'est envoyée à un serveur.** Le nom des personnes, leur établissement, leur fonction, leur genre, leur rôle ou toute autre information saisie ne quittent jamais votre navigateur. La vérification du jury est effectuée localement, par la page elle-même.
- **Aucun enregistrement automatique.** Les données ne sont conservées ni dans le navigateur (pas de stockage local, pas de cookie), ni sur un serveur. Sans sauvegarde de votre part, elles sont perdues à l'actualisation ou à la fermeture de la page.
- **Aucun suivi.** L'application n'utilise ni outil de mesure d'audience, ni traceur, ni service tiers. Elle ne charge aucun script ni aucune ressource externe : les seuls fichiers lus sont ceux du site (annuaire des écoles doctorales et liste des fonctions).
- **Vous gardez la maîtrise de vos données.** Une sauvegarde n'est créée que si vous cliquez sur « Sauvegarder » : elle est alors téléchargée sur votre appareil, dans un fichier JSON que vous gérez vous-même. Le bouton « Réinitialiser » efface le profil et les membres saisis.
- **Les exports restent locaux.** Le téléchargement du mémo, la sauvegarde de la configuration et l'export du jury (impression ou PDF) sont produits sur votre appareil.

Un fichier de sauvegarde ou un export contient les informations saisies. Si vous le partagez, notamment avec votre école doctorale, vous partagez ces informations : stockez-le et transmettez-le avec les précautions habituelles pour des données personnelles.

## Utilisation locale sur votre ordinateur

- Télécharger et déposer le code dans un dossier sur votre ordinateur.
- L'application nécessite l'utilisation de Python 3 ; installer le si nécessaire.
- Pour que le navigateur puisse charger les fichiers JSON (annuaire des écoles doctorales et liste des fonctions), servez les fichiers avec un serveur local. Avec Python, lancez `python -m http.server` depuis le dossier du projet puis ouvrez `http://localhost:8000`. Sous Windows, si la commande `python` n'est pas reconnue ou ouvre le Microsoft Store, utilisez `py -m http.server`.
- Aucun paquet supplémentaire n'est requis.
- Le fichier [jury-fictif-8-membres-1-invite.json](./jury-fictif-8-membres-1-invite.json) est un exemple de configuration qui satisfait les contrôles actuels avec huit membres et les paramètres par défaut.

## Licence

Ce projet est diffusé sous licence [GNU GPL-3.0](./LICENSE). Les données de l'annuaire des écoles doctorales et des structures de recherche proviennent du portail [data.enseignementsup-recherche.gouv.fr](https://data.enseignementsup-recherche.gouv.fr/) et sont publiées sous Licence Ouverte (Etalab) ; leurs sources et dates sont détaillées dans la rubrique « Crédits » de la page [mentions-legales.html](./mentions-legales.html).

## Technologies utilisées

Les contenus, le design et l'architecture technique de cette application ont été générés et optimisés avec l'assistance d'outils d'intelligence artificielle, sous la supervision éditoriale et technique de la personne qui en assure la publication. L'ensemble des décisions de publication et de configuration relève de sa responsabilité exclusive.
