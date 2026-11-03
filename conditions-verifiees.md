# Conditions vérifiées par l'application

Les membres dont le rôle est « Membre invité » ne sont compté·es dans aucune condition, sauf dans celle qui limite leur nombre (C1 des règles complémentaires) et dans le contrôle des champs obligatoires.

**Niveaux de gravité**

- **Bloquant** : le jury est déclaré non conforme.
- **Avertissement** : message affiché sans empêcher la conformité du jury.

## 1. Règles issues de l'arrêté du 25 mai 2016

| # | Condition | Détail du contrôle | Gravité |
|---|-----------|--------------------|---------|
| A1 | Nombre de membres | Le jury compte entre 4 et 8 personnes. L'école doctorale peut restreindre cette plage (voir C8). | Bloquant |
| A2 | Membres extérieurs | Au moins la moitié des membres est extérieure à l'unité de recherche, à l'école doctorale et à l'établissement d'inscription (lien « Membre extérieur »). Si le réglage C5 est à « Oui », la direction de thèse n'est pas comptée comme extérieure. | Bloquant |
| A3 | Parité | Représentation équilibrée des femmes et des hommes. Le mode se règle dans les paramètres : au moins un membre de chaque genre (par défaut), pourcentage minimal de chaque genre (40 % par défaut, arrondi à l'entier supérieur) ou nombre minimal de femmes selon l'effectif. | Bloquant |
| A4 | Professeur·es ou personnes assimilées | Au moins la moitié du jury est composée de professeur·es, de personnels assimilés ou de membres du corps enseignant de rang équivalent. | Bloquant |
| A5 | Nombre de rapporteur·rices | Le jury compte deux ou trois rapporteur·rices. | Bloquant |
| A6 | HDR des rapporteur·rices | Chaque rapporteur·rice est titulaire de l'HDR ou d'une équivalence. | Bloquant |
| A7 | Encadrement et rapporteur·rices | Une personne de l'encadrement de la thèse (direction, co-direction, co-encadrement) ne peut pas être rapporteur·rice. Comme une même personne ne peut figurer qu'une fois dans le jury, ce cas est détecté par le rapprochement des noms décrit en T3. | Bloquant |
| A8 | CSI et rapporteur·rices | Un·e membre du CSI ne peut pas être rapporteur·rice. | Bloquant |
| A9 | Présidence | La personne qui préside le jury est professeur·e, assimilé·e ou membre du corps enseignant de rang équivalent. | Bloquant |
| A10 | Élection de la présidence | La personne qui préside le jury doit être élue par les membres du jury. | Avertissement |

## 2. Règles complémentaires de l'école doctorale (paramétrables)

| # | Condition | Valeur par défaut | Détail du contrôle | Gravité |
|---|-----------|-------------------|--------------------|---------|
| C1 | Nombre maximal de membres invité·es | 1 | Le nombre de membres ayant le rôle « Membre invité » ne dépasse pas le maximum fixé (de 0 à 4). | Bloquant |
| C2 | Membres du CSI examinateur·rices | Oui | Si « Non », un·e membre du CSI ne peut pas avoir le rôle d'examinateur·rice. | Bloquant |
| C3 | Rapporteur·rices extérieur·es à l'unité de recherche | Oui | Si « Oui », un·e rapporteur·rice ne peut pas être membre de l'unité de recherche. | Bloquant |
| C4 | Rapporteur·rices extérieur·es à l'école doctorale | Oui | Si « Oui », un·e rapporteur·rice ne peut pas être membre de l'école doctorale d'inscription. | Bloquant |
| C5 | Rapporteur·rices extérieur·es à l'établissement | Oui | Si « Oui », un·e rapporteur·rice ne peut pas être membre de l'établissement d'inscription. | Bloquant |
| C6 | Direction de thèse obligatoire | Oui | Si « Oui », la direction de thèse est représentée au jury. | Bloquant |
| C7 | Direction toujours interne | Non | Si « Oui », une personne de la direction de thèse déclarée « Membre extérieur » est signalée. Ce réglage modifie aussi le calcul de A2. | Bloquant |
| C8 | Plage du nombre de membres | 4 à 8 | Le minimum ne dépasse pas le maximum, et l'effectif est compris dans la plage choisie (affine A1). | Bloquant |
| C9 | Membre de l'établissement d'inscription | Non | Si « Oui », au moins un membre du jury appartient à l'établissement d'inscription. | Bloquant |
| C10 | Émérite rapporteur·rice | Oui | Si « Non », un·e membre émérite ne peut pas être rapporteur·rice. | Bloquant |
| C11 | Émérite en présidence | Non | Si « Non », un·e membre émérite ne peut pas présider le jury. | Bloquant |
| C12 | Validité des paramètres | — | Les nombres saisis dans les paramètres respectent les limites indiquées. | Bloquant |

## 3. Contrôles techniques de saisie

| # | Condition | Détail du contrôle | Gravité |
|---|-----------|--------------------|---------|
| T1 | Champs obligatoires | Pour chaque membre, y compris les membres invité·es, tous les champs sont renseignés. | Bloquant |
| T2 | Cohérence « Professeur ou assimilé » | Signale une fiche de membre où « Professeur ou assimilé » est sélectionné alors que la fonction n'appartient pas à cette catégorie dans la liste des fonctions. | Avertissement |
| T3 | Personne unique | Une même personne ne peut figurer qu'une seule fois dans le jury, qu'il s'agisse d'un·e membre ou d'un·e membre invité·e. Les fiches sont rapprochées sur le nom et le prénom, sans tenir compte des majuscules, des accents, de l'ordre du nom et du prénom ni des tirets. Une faute de frappe ou une initiale à la place du prénom n'est pas détectée. | Bloquant |
