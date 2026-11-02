# Conditions vérifiées par l'application

Les membres dont le rôle est « Membre invité » ne sont comptés dans aucune condition, sauf dans celle qui limite leur propre nombre (C1 des règles complémentaires) et dans le contrôle des champs obligatoires.

**Niveaux de gravité**

- **Bloquant** : le jury est déclaré non conforme.
- **Avertissement** : message affiché sans empêcher la conformité du jury.

## 1. Règles issues de l'arrêté du 25 mai 2016

| # | Condition | Détail du contrôle | Gravité |
|---|-----------|--------------------|---------|
| A1 | Nombre de membres | Le jury compte entre 4 et 8 personnes. L'école doctorale peut restreindre cette plage (voir C8). | Bloquant |
| A2 | Membres extérieurs | Au moins la moitié des membres est extérieure à l'unité de recherche, à l'école doctorale et à l'établissement d'inscription (lien « Membre extérieur »). Si le réglage C5 est à « Oui », la direction de thèse n'est pas comptée comme extérieure. | Bloquant |
| A3 | Parité | Représentation équilibrée des femmes et des hommes. Le mode se règle dans les paramètres : au moins un membre de chaque genre (par défaut), pourcentage minimal de chaque genre (40 % par défaut, arrondi à l'entier supérieur) ou nombre minimal de femmes selon l'effectif. | Bloquant |
| A4 | Professeurs ou assimilés | Au moins la moitié du jury est composée de professeurs, de personnels assimilés ou d'enseignants de rang équivalent. | Bloquant |
| A5 | Nombre de rapporteurs | Le jury compte deux ou trois rapporteurs. | Bloquant |
| A6 | HDR des rapporteurs | Chaque rapporteur est titulaire de l'HDR ou d'une équivalence. | Bloquant |
| A7 | Encadrement et rapporteurs | Une personne de l'encadrement de la thèse (direction, co-direction, co-encadrement) ne peut pas être rapporteur. Comme une même personne ne peut figurer qu'une fois dans le jury, ce cas est détecté par le rapprochement des noms décrit en T3. | Bloquant |
| A8 | CSI et rapporteurs | Un membre du CSI ne peut pas être rapporteur. | Bloquant |
| A9 | Président | Le président du jury est professeur, assimilé ou enseignant de rang équivalent. | Bloquant |
| A10 | Élection du président | Le président doit être élu par les membres du jury. | Avertissement |

## 2. Règles complémentaires de l'école doctorale (paramétrables)

| # | Condition | Valeur par défaut | Détail du contrôle | Gravité |
|---|-----------|-------------------|--------------------|---------|
| C1 | Nombre maximal d'invités | 1 | Le nombre de « Membre invité » ne dépasse pas le maximum fixé (de 0 à 4). | Bloquant |
| C2 | Membres du CSI examinateurs | Oui | Si « Non », un membre du CSI ne peut pas avoir le rôle d'examinateur. | Bloquant |
| C3 | Rapporteurs extérieurs à l'unité de recherche | Oui | Si « Oui », un rapporteur ne peut pas être membre de l'unité de recherche. | Bloquant |
| C4 | Rapporteurs extérieurs à l'école doctorale | Oui | Si « Oui », un rapporteur ne peut pas être membre de l'école doctorale d'inscription. | Bloquant |
| C5 | Rapporteurs extérieurs à l'établissement | Oui | Si « Oui », un rapporteur ne peut pas être membre de l'établissement d'inscription. | Bloquant |
| C6 | Direction de thèse obligatoire | Oui | Si « Oui », une personne « Directeur.rice » fait partie du jury. | Bloquant |
| C7 | Direction toujours interne | Non | Si « Oui », un directeur déclaré « Membre extérieur » est signalé. Ce réglage modifie aussi le calcul de A2. | Bloquant |
| C8 | Plage du nombre de membres | 4 à 8 | Le minimum ne dépasse pas le maximum, et l'effectif est compris dans la plage choisie (affine A1). | Bloquant |
| C9 | Membre de l'établissement d'inscription | Non | Si « Oui », au moins un membre du jury appartient à l'établissement d'inscription. | Bloquant |
| C10 | Émérite rapporteur | Oui | Si « Non », un membre émérite ne peut pas être rapporteur. | Bloquant |
| C11 | Émérite président | Non | Si « Non », un membre émérite ne peut pas présider le jury. | Bloquant |
| C12 | Validité des paramètres | — | Les nombres saisis dans les paramètres respectent les limites indiquées. | Bloquant |

## 3. Contrôles techniques de saisie

| # | Condition | Détail du contrôle | Gravité |
|---|-----------|--------------------|---------|
| T1 | Champs obligatoires | Pour chaque membre, y compris les invités, tous les champs sont renseignés, sauf « Membre du CSI » qui est facultatif. | Bloquant |
| T2 | Cohérence « Professeur ou assimilé » | Signale un membre marqué « Professeur ou assimilé » dont la fonction n'appartient pas à cette catégorie dans la liste des fonctions. | Avertissement |
| T3 | Personne unique | Une même personne ne peut être déclarée qu'une seule fois dans le jury, qu'elle soit membre ou invitée. Les fiches sont rapprochées sur le nom et prénom, sans tenir compte des majuscules, des accents, de l'ordre du nom et du prénom ni des tirets. Une faute de frappe ou une initiale à la place du prénom n'est pas détectée. | Bloquant |
