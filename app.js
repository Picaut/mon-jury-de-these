"use strict";

const membersContainer = document.querySelector("#members");
const downloadMemberMemoButton = document.querySelector("#download-member-memo");
const loadConfigurationButton = document.querySelector("#load-configuration");
const saveConfigurationButton = document.querySelector("#save-configuration");
const resetConfigurationButton = document.querySelector("#reset-configuration");
const configurationFileInput = document.querySelector("#configuration-file");
const loadSettingsButton = document.querySelector("#load-settings");
const saveSettingsButton = document.querySelector("#save-settings");
const settingsFileInput = document.querySelector("#settings-file");
const juryForm = document.querySelector("#jury-form");
const result = document.querySelector("#result");
const exportPdfButton = document.querySelector("#export-pdf");
const pdfExport = document.querySelector("#pdf-export");
const settingsPanel = document.querySelector("#settings-title").closest(".section-panel");
const doctoralSchoolSearch = document.querySelector("#profile-doctoral-school-search");
const doctoralSchoolValue = document.querySelector("#profile-doctoral-school");
const doctoralSchoolOptions = document.querySelector("#doctoral-school-options");
const doctoralSchoolStatus = document.querySelector("#doctoral-school-status");
const profileInstitution = document.querySelector("#profile-institution");
const institutionStatus = document.querySelector("#institution-status");
const juryInstitutionSuggestions = document.querySelector("#jury-institution-suggestions");
const juryQualitySuggestions = document.querySelector("#jury-quality-suggestions");
const minimumMembersInput = document.querySelector("#minimum-members");
const maximumMembersInput = document.querySelector("#maximum-members");
const minimumMembersValue = document.querySelector("#minimum-members-value");
const maximumMembersValue = document.querySelector("#maximum-members-value");
const memberRange = document.querySelector("#member-range");
const maximumInvitedInput = document.querySelector("#maximum-invited");
const parityModeInput = document.querySelector("#parity-mode");
const parityPercentageSettings = document.querySelector("#parity-percentage-settings");
const minimumGenderPercentageInput = document.querySelector("#minimum-gender-percentage");
const parityTableSettings = document.querySelector("#parity-table-settings");
const womenByTotalInputs = Object.fromEntries(
  [4, 5, 6, 7, 8].map((total) => [total, document.querySelector(`#women-count-${total}`)]),
);

const defaultSettings = Object.freeze({
  minimumMembers: 4,
  maximumMembers: 8,
  maximumInvited: 1,
  csiExaminers: true,
  csiSupervision: false,
  rapporteurExternalUnit: true,
  rapporteurExternalSchool: true,
  rapporteurExternalInstitution: true,
  directorRequired: true,
  directorInternal: false,
  institutionMemberRequired: false,
  emeritusRapporteur: true,
  emeritusPresident: false,
  parityMode: "one-each",
  minimumGenderPercentage: 40,
  womenByTotal: Object.freeze({ 4: 1, 5: 1, 6: 1, 7: 1, 8: 1 }),
});

const defaultMemberRoles = Object.freeze([
  "Directeur.rice",
  "Rapporteur.rice",
  "Rapporteur.rice",
  "Examinateur.trice",
]);

let doctoralSchools = [];
let juryInstitutions = [];
let activeSchoolOption = -1;
let memberFunctionsStatus = "";
let professorQualityValues = new Set();

function updateMemberQualityStatus() {
  document.querySelectorAll(".member-card [id^='jury-quality-status-']").forEach((status) => {
    status.textContent = memberFunctionsStatus;
  });
}

function normalizeSearchText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
}

async function loadDoctoralSchools() {
  doctoralSchoolSearch.disabled = true;
  doctoralSchoolStatus.textContent = "Chargement de l'annuaire des écoles doctorales…";
  try {
    const response = await fetch("./fr-esr-ecoles_doctorales_annuaire.json");
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const records = await response.json();
    if (!Array.isArray(records)) {
      throw new Error("Le format de l'annuaire est invalide.");
    }

    doctoralSchools = records
      .filter((school) =>
        school
        && Number.isFinite(Number(school.numero_ed))
        && typeof school.libelle_ed === "string"
        && typeof school.id_ed === "string",
      )
      .sort((first, second) => Number(first.numero_ed) - Number(second.numero_ed));

    if (doctoralSchools.length === 0) {
      throw new Error("L'annuaire ne contient aucune école doctorale exploitable.");
    }
    juryInstitutions = [...new Set(
      records.flatMap((school) =>
        Array.isArray(school?.tous_etablissements)
          ? school.tous_etablissements.filter((name) => typeof name === "string" && name.trim())
          : [],
      ),
    )].sort((first, second) => first.localeCompare(second, "fr"));
    juryInstitutionSuggestions.replaceChildren(
      ...juryInstitutions.map((institution) => {
        const option = document.createElement("option");
        option.value = institution;
        return option;
      }),
    );
    doctoralSchoolSearch.disabled = false;
    doctoralSchoolStatus.textContent = `${doctoralSchools.length} écoles doctorales disponibles. Recherchez par numéro, sigle ou nom.`;
    return doctoralSchools;
  } catch (error) {
    doctoralSchoolSearch.disabled = true;
    doctoralSchoolStatus.textContent = `Impossible de charger l'annuaire des écoles doctorales : ${error instanceof Error ? error.message : "erreur inconnue"}`;
    return [];
  }
}

const doctoralSchoolsReady = loadDoctoralSchools();

async function loadMemberFunctions() {
  try {
    const response = await fetch("./liste_fonction.json");
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const categories = await response.json();
    if (!categories || typeof categories !== "object" || Array.isArray(categories)) {
      throw new Error("Le format de la liste des fonctions est invalide.");
    }

    const functions = [...new Set(
      Object.values(categories).flatMap((values) =>
        Array.isArray(values)
          ? values.filter((value) => typeof value === "string" && value.trim())
          : [],
      ),
    )].sort((first, second) => first.localeCompare(second, "fr"));

    if (functions.length === 0) {
      throw new Error("La liste ne contient aucune fonction exploitable.");
    }

    professorQualityValues = new Set(
      (categories["Professeur ou assimilé"] ?? [])
        .filter((value) => typeof value === "string")
        .map(normalizeSearchText),
    );
    juryQualitySuggestions.replaceChildren(
      ...functions.map((value) => {
        const option = document.createElement("option");
        option.value = value;
        return option;
      }),
    );
    memberFunctionsStatus = `${functions.length} fonctions disponibles. Vous pouvez aussi saisir une autre fonction.`;
    updateMemberQualityStatus();
    membersContainer.querySelectorAll(".member-card").forEach((card) => {
      applyProfessorStatusFromQuality(card);
      updateMemberCompleteness(card);
    });
  } catch (error) {
    memberFunctionsStatus = `Impossible de charger la liste des fonctions : ${error instanceof Error ? error.message : "erreur inconnue"}. Vous pouvez saisir une fonction librement.`;
    updateMemberQualityStatus();
  }
}

loadMemberFunctions();

function schoolDisplayName(school) {
  const acronym = typeof school.sigle_ed === "string" && school.sigle_ed.trim()
    ? school.sigle_ed.trim()
    : "Sans sigle";
  return `N° ${school.numero_ed} — ${acronym}`;
}

function closeDoctoralSchoolOptions() {
  doctoralSchoolOptions.hidden = true;
  doctoralSchoolSearch.setAttribute("aria-expanded", "false");
  doctoralSchoolSearch.removeAttribute("aria-activedescendant");
  activeSchoolOption = -1;
}

function updateInstitutionOptions(school, selectedInstitution = "") {
  const institutions = Array.isArray(school.tous_etablissements)
    ? school.tous_etablissements.filter((name) => typeof name === "string" && name.trim())
    : [];
  profileInstitution.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = institutions.length > 0
    ? "Choisir un établissement"
    : "Aucun établissement disponible";
  profileInstitution.append(placeholder);

  for (const institution of institutions) {
    const option = document.createElement("option");
    option.value = institution;
    option.textContent = institution;
    profileInstitution.append(option);
  }

  profileInstitution.disabled = institutions.length === 0;
  profileInstitution.value = institutions.includes(selectedInstitution) ? selectedInstitution : "";
  institutionStatus.textContent = institutions.length > 0
    ? `${institutions.length} établissement(s) associé(s) à l'école doctorale sélectionnée.`
    : "L'annuaire ne fournit aucun établissement pour cette école doctorale.";
  return institutions.includes(selectedInstitution);
}

function selectDoctoralSchool(school) {
  doctoralSchoolSearch.value = schoolDisplayName(school);
  doctoralSchoolValue.value = school.id_ed;
  doctoralSchoolStatus.textContent = school.libelle_ed;
  updateInstitutionOptions(school);
  closeDoctoralSchoolOptions();
}

function renderDoctoralSchoolOptions() {
  const query = normalizeSearchText(doctoralSchoolSearch.value);
  activeSchoolOption = -1;
  doctoralSchoolOptions.replaceChildren();

  if (!query) {
    closeDoctoralSchoolOptions();
    return;
  }

  const matches = doctoralSchools.filter((school) =>
    [String(school.numero_ed), school.sigle_ed ?? "", school.libelle_ed]
      .some((value) => normalizeSearchText(value).includes(query)),
  ).slice(0, 50);

  if (matches.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "school-no-results";
    emptyMessage.textContent = "Aucune école doctorale trouvée.";
    doctoralSchoolOptions.append(emptyMessage);
  } else {
    matches.forEach((school, index) => {
      const option = document.createElement("button");
      option.type = "button";
      option.id = `doctoral-school-option-${index}`;
      option.className = "school-option";
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");

      const identifier = document.createElement("strong");
      identifier.textContent = schoolDisplayName(school);
      const label = document.createElement("span");
      label.textContent = school.libelle_ed;
      option.append(identifier, label);
      option.addEventListener("mouseenter", () => setActiveSchoolOption(index));
      option.addEventListener("click", () => selectDoctoralSchool(school));
      doctoralSchoolOptions.append(option);
    });
  }

  doctoralSchoolOptions.hidden = false;
  doctoralSchoolSearch.setAttribute("aria-expanded", "true");
  doctoralSchoolStatus.textContent = matches.length > 50
    ? "Plus de 50 résultats. Affinez votre recherche."
    : `${matches.length} résultat${matches.length > 1 ? "s" : ""}.`;
}

function setActiveSchoolOption(index) {
  const options = [...doctoralSchoolOptions.querySelectorAll('[role="option"]')];
  if (options.length === 0) {
    return;
  }
  activeSchoolOption = (index + options.length) % options.length;
  options.forEach((option, optionIndex) => {
    const active = optionIndex === activeSchoolOption;
    option.setAttribute("aria-selected", String(active));
    if (active) {
      doctoralSchoolSearch.setAttribute("aria-activedescendant", option.id);
      option.scrollIntoView({ block: "nearest" });
    }
  });
}

doctoralSchoolSearch.addEventListener("input", () => {
  doctoralSchoolValue.value = "";
  profileInstitution.replaceChildren(new Option("Choisissez d'abord une école doctorale", ""));
  profileInstitution.disabled = true;
  institutionStatus.textContent = "";
  renderDoctoralSchoolOptions();
});

doctoralSchoolSearch.addEventListener("keydown", (event) => {
  const options = doctoralSchoolOptions.querySelectorAll('[role="option"]');
  if (event.key === "ArrowDown" && !doctoralSchoolOptions.hidden) {
    event.preventDefault();
    setActiveSchoolOption(activeSchoolOption + 1);
  } else if (event.key === "ArrowUp" && !doctoralSchoolOptions.hidden) {
    event.preventDefault();
    setActiveSchoolOption(activeSchoolOption - 1);
  } else if (event.key === "Enter" && activeSchoolOption >= 0) {
    event.preventDefault();
    options[activeSchoolOption].click();
  } else if (event.key === "Escape") {
    closeDoctoralSchoolOptions();
  }
});

doctoralSchoolSearch.addEventListener("focus", () => {
  if (doctoralSchoolSearch.value) {
    renderDoctoralSchoolOptions();
  }
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".school-combobox")) {
    closeDoctoralSchoolOptions();
  }
});

function updateMemberRange(activeRange) {
  const minimum = Number(minimumMembersInput.value);
  const maximum = Number(maximumMembersInput.value);

  minimumMembersInput.max = String(maximum);
  maximumMembersInput.min = String(minimum);
  minimumMembersValue.value = String(minimum);
  maximumMembersValue.value = String(maximum);

  const start = ((minimum - 4) / 4) * 100;
  const end = ((maximum - 4) / 4) * 100;
  memberRange.style.setProperty("--range-start", `${start}%`);
  memberRange.style.setProperty("--range-end", `${end}%`);

  if (minimum === maximum) {
    minimumMembersInput.style.zIndex = activeRange === minimumMembersInput ? "3" : "2";
    maximumMembersInput.style.zIndex = activeRange === maximumMembersInput ? "3" : "2";
  } else {
    minimumMembersInput.style.zIndex = "2";
    maximumMembersInput.style.zIndex = "2";
  }
}

minimumMembersInput.addEventListener("input", () => updateMemberRange(minimumMembersInput));
maximumMembersInput.addEventListener("input", () => updateMemberRange(maximumMembersInput));
minimumMembersInput.addEventListener("focus", () => updateMemberRange(minimumMembersInput));
maximumMembersInput.addEventListener("focus", () => updateMemberRange(maximumMembersInput));
updateMemberRange();

function settingEnabled(name) {
  return document.querySelector(`input[name="${name}"]:checked`).value === "Oui";
}

function updateParitySettingsVisibility() {
  const percentageMode = parityModeInput.value === "percentage";
  const tableMode = parityModeInput.value === "table";
  parityPercentageSettings.hidden = !percentageMode;
  minimumGenderPercentageInput.required = percentageMode;
  parityTableSettings.hidden = !tableMode;
  for (const [total, input] of Object.entries(womenByTotalInputs)) {
    input.required = tableMode;
    input.max = total;
  }
}

parityModeInput.addEventListener("change", updateParitySettingsVisibility);
updateParitySettingsVisibility();

function isProfessorQuality(value) {
  return professorQualityValues.has(normalizeSearchText(value));
}

function applyProfessorStatusFromQuality(card, setNonProfessor = false) {
  const quality = card.querySelector('[name="quality"]').value;
  if (!quality.trim()) {
    return;
  }
  const professor = isProfessorQuality(quality);
  if (!professor && !setNonProfessor) {
    return;
  }
  card.querySelector(`input[data-field="memberStatus"][value="${professor ? "Oui" : "Non"}"]`).checked = true;
}

document.querySelectorAll(".section-panel-summary .help").forEach((help) => {
  help.addEventListener("click", (event) => event.preventDefault());
});

let memberCount = 0;
const CSI_AFFILIATION = "Membre du CSI";

const memberFields = [
  "name",
  "gender",
  "institution",
  "quality",
  "memberStatus",
  "csiMember",
  "hdr",
  "emeritus",
  "role",
  "affiliation",
];

function alignFieldControls(fields) {
  const fieldElements = [...fields.children].filter((element) => element.classList.contains("field"));
  const entries = fieldElements.flatMap((field) => {
    const label = field.querySelector(":scope > label, :scope > .field-label-row, :scope > legend");
    if (!label) {
      return [];
    }
    label.style.height = "";
    label.style.minHeight = "";
    return [{ field, label }];
  });

  void fields.offsetHeight;

  if (getComputedStyle(fields).gridTemplateColumns.split(" ").length < 2) {
    return;
  }

  const rows = new Map();
  for (const entry of entries) {
    const rowTop = Math.round(entry.field.getBoundingClientRect().top);
    const row = rows.get(rowTop) ?? [];
    row.push(entry.label);
    rows.set(rowTop, row);
  }

  for (const labels of rows.values()) {
    const rowLabelHeight = Math.ceil(Math.max(...labels.map((label) => {
      const content = [...label.children];
      return content.length > 0
        ? Math.max(...content.map((child) => child.getBoundingClientRect().height))
        : label.getBoundingClientRect().height;
    })));
    labels.forEach((label) => {
      label.style.height = `${rowLabelHeight}px`;
    });
  }
}

function alignAllFieldControls() {
  document.querySelectorAll(".fields").forEach(alignFieldControls);
}

let fieldAlignmentFrame = 0;

function scheduleFieldControlAlignment() {
  cancelAnimationFrame(fieldAlignmentFrame);
  fieldAlignmentFrame = requestAnimationFrame(alignAllFieldControls);
}

window.addEventListener("resize", scheduleFieldControlAlignment);
document.querySelectorAll("details").forEach((panel) => {
  panel.addEventListener("toggle", () => {
    if (panel.open) {
      scheduleFieldControlAlignment();
    }
  });
});

function updateMemberCardSummary(card) {
  const name = card.querySelector('[name="name"]').value.trim();
  card.querySelector(".member-card-summary").textContent = name ? `— ${name}` : "";
  card.querySelector(".member-card-summary").title = name;
}

const requiredMemberFields = memberFields;

function updateMemberCompleteness(card) {
  const filled = requiredMemberFields.filter((fieldName) => getMemberFieldValue(card, fieldName).trim()).length;
  const total = requiredMemberFields.length;
  const badge = card.querySelector(".member-card-completeness");
  badge.textContent = filled === total ? "✓ Complet" : `${filled} champ(s) sur ${total} renseigné(s)`;
  badge.dataset.state = filled === total ? "complete" : filled === 0 ? "empty" : "partial";
  badge.title = `${filled} information(s) obligatoire(s) renseignée(s) sur ${total}`;
}

function updateMemberCards() {
  const cards = [...membersContainer.querySelectorAll(".member-card")];

  cards.forEach((card, index) => {
    card.id = `member-card-${index + 1}`;
    card.querySelector("h3").textContent = `Membre ${index + 1}`;
    const checkButton = card.querySelector(".button-member-check");
    checkButton.setAttribute("aria-label", `Vérifier le jury depuis le membre ${index + 1}`);
    card.querySelector(".button-remove").disabled = cards.length === 1;
  });
}

function appendValidationMessage(list, message) {
  const item = document.createElement("li");
  const memberReference = message.match(/^(Avertissement : )?Membre (\d+)(.*)$/);
  if (!memberReference) {
    item.textContent = message;
    list.append(item);
    return;
  }

  const [, warningPrefix = "", memberNumber, remainingText] = memberReference;
  item.append(document.createTextNode(warningPrefix));
  const link = document.createElement("a");
  link.href = `#member-card-${memberNumber}`;
  const referencedCard = document.querySelector(`#member-card-${memberNumber}`);
  const memberName = referencedCard?.querySelector('[name="name"]').value.trim();
  link.textContent = memberName ? `Membre ${memberNumber} (${memberName})` : `Membre ${memberNumber}`;
  link.setAttribute("aria-label", `Aller à la fiche du membre ${memberNumber}${memberName ? `, ${memberName}` : ""}`);
  link.addEventListener("click", () => {
    const targetCard = document.querySelector(`#member-card-${memberNumber}`);
    if (targetCard) {
      targetCard.open = true;
    }
  });
  item.append(link, document.createTextNode(remainingText));
  list.append(item);
}

function addMember(memberData = {}, { focus = true } = {}) {
  memberCount += 1;

  const card = document.createElement("details");
  card.className = "member-card";
  card.open = true;
  card.innerHTML = `
    <summary class="member-card-header">
      <h3></h3>
      <span class="member-card-summary"></span>
      <span class="member-card-completeness" role="status"></span>
    </summary>
    <div class="member-card-content">
    <div class="member-card-actions">
      <button class="button button-secondary button-add-member" type="button"><span aria-hidden="true">+</span> Ajouter un membre</button>
      <button class="button button-primary button-member-check" type="submit">Vérifier le jury</button>
      <button class="button button-remove" type="button">Supprimer</button>
    </div>
    <div class="fields">
      <div class="field">
        <div class="field-label-row">
          <label for="member-name-${memberCount}">Nom et prénom</label>
        </div>
        <input id="member-name-${memberCount}" name="name" autocomplete="off" required>
      </div>
      <fieldset class="field toggle-field">
        <legend>Genre</legend>
        <div class="toggle-options">
          <label class="toggle-option">
            <input id="member-gender-man-${memberCount}" name="gender-${memberCount}" data-field="gender" type="radio" value="Homme" required>
            <span>Homme</span>
          </label>
          <label class="toggle-option">
            <input id="member-gender-woman-${memberCount}" name="gender-${memberCount}" data-field="gender" type="radio" value="Femme" required>
            <span>Femme</span>
          </label>
        </div>
      </fieldset>
      <div class="field">
        <div class="field-label-row">
          <label for="member-institution-${memberCount}">Établissement/organisme de rattachement</label>
          <span class="help">
            <span class="help-icon" aria-hidden="true">?</span>
            <span class="help-text" role="tooltip">Indiquez le nom de l'établissement/organisme auquel le membre est rattaché, et sélectionnez dans une liste. Si l'établissement n'est pas indiqué, saisir le nom de l'organisme.</span>
          </span>
        </div>
        <input id="member-institution-${memberCount}" name="institution" list="jury-institution-suggestions" autocomplete="organization" placeholder="Rechercher ou saisir un autre établissement" required>
      </div>
      <div class="field">
        <div class="field-label-row">
          <label for="member-quality-${memberCount}">Fonction ou qualité dans l'établissement/organisme</label>
          <span class="help">
            <span class="help-icon" aria-hidden="true">?</span>
            <span class="help-text" role="tooltip">Précisez le titre ou la fonction exercée par le membre dans cet établissement ou organisme. Par exemple : Professeur.e d'université, Directeur.e de Recherche CNRS, Ingénieur-Docteur... </span>
          </span>
        </div>
        <input id="member-quality-${memberCount}" name="quality" list="jury-quality-suggestions" placeholder="Choisir ou saisir une autre fonction" required>
        <p id="jury-quality-status-${memberCount}" class="field-hint" role="status" aria-live="polite"></p>
      </div>
      <fieldset class="field toggle-field">
        <legend class="field-label-row">
          <span>Professeur.e ou assimilé ou rang équivalent</span>
          <span class="help">
            <span class="help-icon" aria-hidden="true">?</span>
            <span class="help-text" role="tooltip">Professeur.e ou personnel assimilé au sens de l'article 6 du décret n° 92-70 relatif au Conseil national des universités et de l'article 5 du décret n° 87-31 pour les disciplines de santé, ou enseignants de rang équivalent qui ne relèvent pas du ministère chargé de l'enseignement supérieur et de la recherche.</span>
          </span>
          <span class="info">
            <span class="info-icon" aria-hidden="true">i</span>
            <span class="info-text" role="tooltip">
              <span>Sont assimilés aux professeur.es des universités, pour l'application des
                <a href="https://www.legifrance.gouv.fr/affichTexteArticle.do?cidTexte=JORFTEXT000000344860&amp;idArticle=LEGIARTI000006439703&amp;dateTexte=&amp;categorieLien=cid" target="_blank" rel="noopener noreferrer">articles 4</a>
                et
                <a href="https://www.legifrance.gouv.fr/affichTexteArticle.do?cidTexte=JORFTEXT000000344860&amp;idArticle=LEGIARTI000006439704&amp;dateTexte=&amp;categorieLien=cid" target="_blank" rel="noopener noreferrer">5 du décret du 16 janvier 1992</a>
                susvisé, les personnels titulaires appartenant aux corps ci-après énumérés :
              </span>
              <ul>
                <li>Les professeur.es et les sous-directeurs de laboratoire du Collège de France ;</li>
                <li>Les professeur.es du Muséum national d'histoire naturelle ;</li>
                <li>Les professeurs et les sous-directeurs de laboratoire du Conservatoire national des arts et métiers ;</li>
                <li>Les directeur.rices d'études de l'Ecole des hautes études en sciences sociales ;</li>
                <li>Les directeur.rices d'études de l'Ecole pratique des hautes études, de l'Ecole nationale des chartes et de l'Ecole française d'Extrême-Orient ;</li>
                <li>Les professeur.es de l'Institut national des langues et civilisations orientales ;</li>
                <li>Les sous-directeurs d'écoles normales supérieures ;</li>
                <li>Les astronomes et physicien.ne.s régis par le <a href="https://www.legifrance.gouv.fr/affichTexte.do?cidTexte=JORFTEXT000000337517&amp;categorieLien=cid" target="_blank" rel="noopener noreferrer">décret n° 86-434 du 12 mars 1986</a> modifié portant statuts du corps des astronomes et physiciens et du corps des astronomes adjoints et physiciens adjoints ;</li>
                <li>Les astronomes titulaires et les astronomes adjoint.es régis par le décret du 31 juillet 1936 relatif au statut des observatoires astronomiques ;</li>
                <li>Les physicien.ne.s titulaires et les physicien.ne.s adjoint.es régis par le décret du 25 septembre 1936 relatif au statut des instituts et observatoires de physique du globe ;</li>
                <li>Les professeur.es de première et de deuxième catégorie de l'Ecole centrale des arts et manufactures ;</li>
                <li>Les directeur.rices de recherche relevant du décret n° 83-1260 du 30 décembre 1983 fixant les dispositions statutaires communes aux corps des fonctionnaires des établissements publics scientifiques et technologiques.</li>
              </ul>
            </span>
          </span>
        </legend>
        <div class="toggle-options">
          <label class="toggle-option">
            <input id="member-status-yes-${memberCount}" name="memberStatus-${memberCount}" data-field="memberStatus" type="radio" value="Oui" required>
            <span>Oui</span>
          </label>
          <label class="toggle-option">
            <input id="member-status-no-${memberCount}" name="memberStatus-${memberCount}" data-field="memberStatus" type="radio" value="Non" required>
            <span>Non</span>
          </label>
        </div>
      </fieldset>
      <fieldset class="field toggle-field">
        <legend>Membre du CSI</legend>
        <div class="toggle-options">
          <label class="toggle-option">
            <input id="member-csi-yes-${memberCount}" name="csiMember-${memberCount}" data-field="csiMember" type="radio" value="Oui" required>
            <span>Oui</span>
          </label>
          <label class="toggle-option">
            <input id="member-csi-no-${memberCount}" name="csiMember-${memberCount}" data-field="csiMember" type="radio" value="Non" required>
            <span>Non</span>
          </label>
        </div>
      </fieldset>
      <fieldset class="field toggle-field">
        <legend class="field-label-row">
          <span>Titulaire de l'HDR</span>
          <span class="help">
            <span class="help-icon" aria-hidden="true">?</span>
            <span class="help-text" role="tooltip">Indiquez si le membre est titulaire de l'habilitation à diriger des recherches (HDR). Pour un membre étranger, vous pouvez sélectionner "Equivalent" sous réserve de validation par l'école doctorale</span>
          </span>
        </legend>
        <div class="toggle-options">
          <label class="toggle-option">
            <input id="member-hdr-yes-${memberCount}" name="hdr-${memberCount}" data-field="hdr" type="radio" value="Oui" required>
            <span>Oui</span>
          </label>
          <label class="toggle-option">
            <input id="member-hdr-no-${memberCount}" name="hdr-${memberCount}" data-field="hdr" type="radio" value="Non" required>
            <span>Non</span>
          </label>
          <label class="toggle-option">
            <input id="member-hdr-equivalence-${memberCount}" name="hdr-${memberCount}" data-field="hdr" type="radio" value="Équivalence" required>
            <span>Équivalence</span>
          </label>
        </div>
      </fieldset>
      <fieldset class="field toggle-field">
        <legend class="field-label-row">
          <span>Titulaire de l'éméritat</span>
        </legend>
        <div class="toggle-options">
          <label class="toggle-option">
            <input id="member-emeritus-yes-${memberCount}" name="emeritus-${memberCount}" data-field="emeritus" type="radio" value="Oui" required>
            <span>Oui</span>
          </label>
          <label class="toggle-option">
            <input id="member-emeritus-no-${memberCount}" name="emeritus-${memberCount}" data-field="emeritus" type="radio" value="Non" required>
            <span>Non</span>
          </label>
        </div>
      </fieldset>
      <div class="field">
        <div class="field-label-row">
          <label for="member-role-${memberCount}">Rôle dans le jury</label>
        </div>
        <select id="member-role-${memberCount}" name="role" required>
          <option value="">Choisir un rôle</option>
          <option value="Président.e">Président.e</option>
          <option value="Directeur.rice">Directeur.rice de thèse</option>
          <option value="co-Directeur.rice">co-Directeur.rice de thèse</option>
          <option value="co-Encadrant.e">co-Encadrant.e de thèse</option>
          <option value="Rapporteur.rice">Rapporteur.rice</option>
          <option value="Examinateur.trice">Examinateur.trice</option>
          <option value="Membre invité">Membre invité</option>
          </select>
      </div>
      <div class="field">
        <div class="field-label-row">
          <label for="member-affiliation-${memberCount}">Lien avec l'établissement</label>
        </div>
        <select id="member-affiliation-${memberCount}" name="affiliation" required>
          <option value="">Choisir une option</option>
          <option value="Membre de l'unité de recherche">Membre de l'unité de recherche</option>
          <option value="Membre de l'école doctorale d'inscription">Membre de l'école doctorale d'inscription</option>
          <option value="Membre de l'établissement d'inscription">Membre de l'établissement d'inscription</option>
          <option value="Membre extérieur">Membre extérieur</option>
          <option value="Membre du CSI">Membre du CSI</option>
        </select>
      </div>
    </div>
    </div>
  `;

  card.querySelector(".button-remove").addEventListener("click", () => {
    card.remove();
    updateMemberCards();
  });
  card.querySelector(".button-add-member").addEventListener("click", () => addMember());
  card.addEventListener("toggle", () => {
    if (card.open) {
      scheduleFieldControlAlignment();
    }
  });
  card.querySelector('[name="name"]').addEventListener("input", () => updateMemberCardSummary(card));
  card.addEventListener("input", () => updateMemberCompleteness(card));

  const qualityInput = card.querySelector('[name="quality"]');
  qualityInput.addEventListener("input", () => applyProfessorStatusFromQuality(card, true));
  qualityInput.addEventListener("change", () => applyProfessorStatusFromQuality(card, true));

  for (const fieldName of memberFields) {
    const radioGroup = card.querySelectorAll(`input[type="radio"][data-field="${fieldName}"]`);
    if (radioGroup.length > 0) {
      const selectedRadio = [...radioGroup].find((radio) => radio.value === memberData[fieldName]);
      if (selectedRadio) {
        selectedRadio.checked = true;
      }
      continue;
    }

    const field = getMemberFieldControl(card, fieldName);
    if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
      field.value = memberData[fieldName] ?? "";
    }
  }

  card.addEventListener("change", (event) => {
    const target = event.target;
    if (target.matches?.('select[name="affiliation"]')) {
      if (target.value === CSI_AFFILIATION) {
        setCsiMember(card, "Oui");
      } else if (getMemberFieldValue(card, "csiMember") === "Oui") {
        setCsiMember(card, "Non");
      }
    } else if (target.matches?.('input[data-field="csiMember"]')) {
      const affiliationSelect = getMemberFieldControl(card, "affiliation");
      if (target.value === "Oui") {
        affiliationSelect.value = CSI_AFFILIATION;
      } else if (affiliationSelect.value === CSI_AFFILIATION) {
        affiliationSelect.value = "";
      }
    }
    updateMemberCompleteness(card);
  });
  if (getMemberFieldValue(card, "affiliation") === CSI_AFFILIATION) {
    setCsiMember(card, "Oui");
  }

  applyProfessorStatusFromQuality(card);
  updateMemberCardSummary(card);
  updateMemberCompleteness(card);
  membersContainer.append(card);
  card.querySelector(`[id^="jury-quality-status-"]`).textContent = memberFunctionsStatus;
  updateMemberCards();
  scheduleFieldControlAlignment();
  if (focus) {
    card.querySelector("input").focus();
  }
  result.hidden = true;
}

downloadMemberMemoButton.addEventListener("click", () => {
  const memo = [
    "MÉMO — INFORMATIONS À FOURNIR POUR CHAQUE MEMBRE DU JURY",
    "",
    "[ ] Nom et prénom",
    "[ ] Genre : femme ou homme",
    "[ ] Établissement ou organisme de rattachement",
    "[ ] Fonction ou qualité dans cet établissement ou organisme",
    "[ ] Professeur·e, assimilé·e ou de rang équivalent : oui ou non",
    "[ ] Membre du CSI : oui ou non (obligatoire)",
    "[ ] Habilitation à diriger des recherches (HDR) : oui, non ou équivalence",
    "[ ] Titulaire de l’éméritat : oui ou non",
    "[ ] Rôle dans le jury : président·e, directeur·rice de thèse, co-directeur·rice, co-encadrant·e, rapporteur·rice, examinateur·rice ou membre invité",
    "[ ] Lien avec l’établissement d’inscription : membre de l’unité de recherche, de l’école doctorale, de l’établissement d’inscription, membre extérieur ou membre du CSI",
    "",

  ].join("\r\n");
  const file = new Blob(["\uFEFF", memo], { type: "text/plain;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "memo-informations-membre-jury.txt";
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
  showResult("success", "Mémo téléchargé", "Le fichier memo-informations-membre-jury.txt a été téléchargé sur votre appareil.");
});

function getMemberFieldValue(card, fieldName) {
  const radioGroup = card.querySelectorAll(`input[type="radio"][data-field="${fieldName}"]`);
  if (radioGroup.length > 0) {
    return [...radioGroup].find((radio) => radio.checked)?.value ?? "";
  }
  return getMemberFieldControl(card, fieldName).value;
}

function setCsiMember(card, value) {
  const radio = card.querySelector(`input[type="radio"][data-field="csiMember"][value="${value}"]`);
  if (radio) {
    radio.checked = true;
  }
}

function getMemberFieldControl(card, fieldName) {
  return card.querySelector(`[data-field="${fieldName}"]`) ?? card.querySelector(`[name="${fieldName}"]`);
}

function showResult(state, title, message) {
  result.replaceChildren();
  result.dataset.state = state;
  const heading = document.createElement("h2");
  heading.textContent = title;
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  result.append(heading, paragraph);
  result.hidden = false;
}

function addPdfProfileItem(container, label, value) {
  if (!value) {
    return;
  }
  const item = document.createElement("p");
  const term = document.createElement("strong");
  term.textContent = `${label} : `;
  item.append(term, document.createTextNode(value));
  container.append(item);
}

function createPdfCell(row, value, className = "") {
  const cell = document.createElement("td");
  if (className) {
    cell.className = className;
  }
  cell.textContent = value || "—";
  row.append(cell);
}

function createPdfMemberCell(row, memberNumber, card) {
  const cell = document.createElement("td");
  const personName = document.createElement("div");
  personName.className = "pdf-person-name";
  personName.textContent = getMemberFieldValue(card, "name") || `Membre ${memberNumber}`;
  const institution = document.createElement("div");
  institution.className = "pdf-person-detail";
  institution.textContent = getMemberFieldValue(card, "institution") || "Établissement/organisme non renseigné";
  const quality = document.createElement("div");
  quality.className = "pdf-person-detail";
  quality.textContent = getMemberFieldValue(card, "quality") || "Fonction ou qualité non renseignée";
  cell.append(personName, institution, quality);
  row.append(cell);
}

function populatePdfExport() {
  pdfExport.replaceChildren();

  const title = document.createElement("h1");
  title.id = "pdf-export-title";
  title.textContent = "Synthèse du jury de thèse";
  pdfExport.append(title);

  const profileHeading = document.createElement("h2");
  profileHeading.textContent = "Informations sur le doctorant ou la doctorante";
  pdfExport.append(profileHeading);

  const profile = document.createElement("div");
  profile.className = "pdf-profile";
  addPdfProfileItem(profile, "Doctorant·e", document.querySelector('[name="doctorant"]').value.trim());
  addPdfProfileItem(profile, "Titre de la thèse", document.querySelector('[name="thesisTitle"]').value.trim());
  const school = doctoralSchools.find((entry) => entry.id_ed === doctoralSchoolValue.value);
  const schoolName = school
    ? `${doctoralSchoolSearch.value.trim()} — ${school.libelle_ed}`
    : doctoralSchoolSearch.value.trim();
  addPdfProfileItem(profile, "École doctorale", schoolName);
  addPdfProfileItem(profile, "Établissement d’inscription", profileInstitution.value.trim());
  const defenseDate = document.querySelector('[name="defenseDate"]').value;
  addPdfProfileItem(
    profile,
    "Date prévisionnelle de soutenance",
    defenseDate ? new Intl.DateTimeFormat("fr-FR").format(new Date(`${defenseDate}T00:00:00`)) : "",
  );
  pdfExport.append(profile);

  const membersHeading = document.createElement("h2");
  membersHeading.textContent = "Composition du jury";
  pdfExport.append(membersHeading);

  const table = document.createElement("table");
  table.className = "pdf-members";
  const headers = [
    "Nom, établissement de rattachement et fonction",
    "Femme",
    "Homme",
    "Professeur·e ou assimilé·e",
    "CSI",
    "HDR",
    "Émérite",
    "Lien avec l’établissement",
    "Rôle",
  ];
  const tableHead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headers.forEach((label, index) => {
    const header = document.createElement("th");
    header.scope = "col";
    header.textContent = label;
    if (index >= 1 && index <= 6) {
      header.className = "pdf-mark";
    }
    headerRow.append(header);
  });
  tableHead.append(headerRow);
  table.append(tableHead);

  const tableBody = document.createElement("tbody");
  const memberCards = [...membersContainer.querySelectorAll(".member-card")];
  memberCards.forEach((card, index) => {
    const row = document.createElement("tr");
    createPdfMemberCell(row, index + 1, card);
    createPdfCell(row, getMemberFieldValue(card, "gender") === "Femme" ? "OUI" : "", "pdf-mark");
    createPdfCell(row, getMemberFieldValue(card, "gender") === "Homme" ? "OUI" : "", "pdf-mark");
    createPdfCell(row, getMemberFieldValue(card, "memberStatus") === "Oui" ? "OUI" : "", "pdf-mark");
    createPdfCell(row, getMemberFieldValue(card, "csiMember") === "Oui" ? "OUI" : "", "pdf-mark");
    const hdr = getMemberFieldValue(card, "hdr");
    createPdfCell(row, hdr === "Oui" ? "OUI" : hdr === "Équivalence" ? "Équiv." : "", "pdf-mark");
    createPdfCell(row, getMemberFieldValue(card, "emeritus") === "Oui" ? "OUI" : "", "pdf-mark");
    createPdfCell(row, getMemberFieldValue(card, "affiliation"));
    createPdfCell(row, getMemberFieldValue(card, "role"));
    tableBody.append(row);
  });
  table.append(tableBody);
  pdfExport.append(table);

  const legend = document.createElement("p");
  legend.className = "pdf-legend";
  legend.textContent = "« OUI » indique une option sélectionnée. « Équiv. » indique une équivalence à l’HDR.";
  pdfExport.append(legend);

  const verificationHeading = document.createElement("h2");
  verificationHeading.textContent = "Synthèse de la vérification";
  pdfExport.append(verificationHeading);
  const verification = document.createElement("div");
  verification.className = "pdf-verification";
  verification.append(...[...result.childNodes].map((node) => node.cloneNode(true)));
  pdfExport.append(verification);
}

exportPdfButton.addEventListener("click", () => {
  juryForm.requestSubmit();
  pdfExport.hidden = false;
  window.addEventListener("afterprint", () => {
    pdfExport.hidden = true;
  }, { once: true });
  window.print();
});

function collectConfiguration() {
  const profile = {
    doctorant: document.querySelector('[name="doctorant"]').value,
    thesisTitle: document.querySelector('[name="thesisTitle"]').value,
    doctoralSchool: doctoralSchoolValue.value,
    doctoralSchoolSearch: doctoralSchoolSearch.value,
    institution: profileInstitution.value,
    defenseDate: document.querySelector('[name="defenseDate"]').value,
  };
  const settings = {
    minimumMembers: Number(minimumMembersInput.value),
    maximumMembers: Number(maximumMembersInput.value),
    maximumInvited: Number(maximumInvitedInput.value),
    csiExaminers: settingEnabled("csi-examiners"),
    csiSupervision: settingEnabled("csi-supervision"),
    rapporteurExternalUnit: settingEnabled("rapporteur-external-unit"),
    rapporteurExternalSchool: settingEnabled("rapporteur-external-school"),
    rapporteurExternalInstitution: settingEnabled("rapporteur-external-institution"),
    directorRequired: settingEnabled("director-required"),
    directorInternal: settingEnabled("director-internal"),
    institutionMemberRequired: settingEnabled("institution-member-required"),
    emeritusRapporteur: settingEnabled("emeritus-rapporteur"),
    emeritusPresident: settingEnabled("emeritus-president"),
    parityMode: parityModeInput.value,
    minimumGenderPercentage: Number(minimumGenderPercentageInput.value),
    womenByTotal: Object.fromEntries(
      Object.entries(womenByTotalInputs).map(([total, input]) => [
        total,
        input.value === "" ? null : Number(input.value),
      ]),
    ),
  };
  const members = [...membersContainer.querySelectorAll(".member-card")].map((card) =>
    Object.fromEntries(
      memberFields.map((fieldName) => [fieldName, getMemberFieldValue(card, fieldName)]),
    ),
  );

  return { format: "jury-these", version: 2, profile, settings, members };
}

function validateConfiguration(data) {
  if (
    data === null
    || typeof data !== "object"
    || Array.isArray(data)
    || data.format !== "jury-these"
    || ![1, 2].includes(data.version)
    || !Array.isArray(data.members)
    || data.members.length < 1
    || data.members.length > 100
  ) {
    throw new Error("Le fichier ne correspond pas au format attendu ou contient un nombre de membres invalide.");
  }

  const rawSettings = data.settings === undefined ? defaultSettings : data.settings;
  if (rawSettings === null || typeof rawSettings !== "object" || Array.isArray(rawSettings)) {
    throw new Error("Les paramètres de la configuration sont invalides.");
  }
  const rawMinimumGenderPercentage = rawSettings.minimumGenderPercentage
    ?? rawSettings.minimumWomenPercentage
    ?? defaultSettings.minimumGenderPercentage;
  if (
    rawSettings.womenByTotal !== undefined
    && (rawSettings.womenByTotal === null
      || typeof rawSettings.womenByTotal !== "object"
      || Array.isArray(rawSettings.womenByTotal))
  ) {
    throw new Error("Le tableau de parité dans la configuration est invalide.");
  }
  const settings = {
    ...defaultSettings,
    ...rawSettings,
    minimumGenderPercentage: rawMinimumGenderPercentage,
    womenByTotal: {
      ...defaultSettings.womenByTotal,
      ...rawSettings.womenByTotal,
    },
  };
  if (
    !Number.isInteger(settings.minimumMembers)
    || settings.minimumMembers < 4
    || settings.minimumMembers > 8
    || !Number.isInteger(settings.maximumMembers)
    || settings.maximumMembers < settings.minimumMembers
    || settings.maximumMembers > 8
    || !Number.isInteger(settings.maximumInvited)
    || settings.maximumInvited < 0
    || settings.maximumInvited > 4
    || typeof settings.csiExaminers !== "boolean"
    || typeof settings.csiSupervision !== "boolean"
    || typeof settings.rapporteurExternalUnit !== "boolean"
    || typeof settings.rapporteurExternalSchool !== "boolean"
    || typeof settings.rapporteurExternalInstitution !== "boolean"
    || typeof settings.directorRequired !== "boolean"
    || typeof settings.directorInternal !== "boolean"
    || typeof settings.institutionMemberRequired !== "boolean"
    || typeof settings.emeritusRapporteur !== "boolean"
    || typeof settings.emeritusPresident !== "boolean"
    || !["one-each", "percentage", "table"].includes(settings.parityMode)
    || typeof settings.minimumGenderPercentage !== "number"
    || !Number.isFinite(settings.minimumGenderPercentage)
    || settings.minimumGenderPercentage < 0
    || settings.minimumGenderPercentage > 50
  ) {
    throw new Error("Les paramètres de la configuration dépassent les limites autorisées ou sont mal formés.");
  }
  for (const [total, value] of Object.entries(settings.womenByTotal)) {
    if (value !== null && (!Number.isInteger(value) || value < 0 || value > Number(total))) {
      throw new Error(`Le nombre minimal de femmes pour un jury de ${total} membres est invalide.`);
    }
  }
  if (
    settings.parityMode === "table"
    && Object.values(settings.womenByTotal).some((value) => value === null)
  ) {
    throw new Error("Complétez le tableau de parité pour les jurys de 4 à 8 membres.");
  }

  const rawProfile = data.profile === undefined ? {} : data.profile;
  if (rawProfile === null || typeof rawProfile !== "object" || Array.isArray(rawProfile)) {
    throw new Error("Les informations du profil dans la configuration sont invalides.");
  }
  const profile = {};
  for (const fieldName of ["doctorant", "thesisTitle", "doctoralSchool", "institution", "defenseDate"]) {
    const value = rawProfile[fieldName] === undefined ? "" : rawProfile[fieldName];
    if (typeof value !== "string" || value.length > 500) {
      throw new Error(`Le champ « ${fieldName} » du profil est invalide.`);
    }
    profile[fieldName] = value;
  }
  profile.doctoralSchoolSearch = rawProfile.doctoralSchoolSearch === undefined
    ? ""
    : rawProfile.doctoralSchoolSearch;
  if (typeof profile.doctoralSchoolSearch !== "string" || profile.doctoralSchoolSearch.length > 500) {
    throw new Error("La recherche d'école doctorale du profil est invalide.");
  }
  if (profile.defenseDate) {
    const parsedDate = new Date(`${profile.defenseDate}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(profile.defenseDate)
      || Number.isNaN(parsedDate.valueOf())
      || parsedDate.toISOString().slice(0, 10) !== profile.defenseDate
    ) {
      throw new Error("La date prévisionnelle de soutenance du profil est invalide.");
    }
  }

  const allowedValues = {
    gender: ["", "Homme", "Femme"],
    memberStatus: ["", "Oui", "Non"],
    csiMember: ["", "Oui", "Non"],
    hdr: ["", "Oui", "Non", "Équivalence"],
    emeritus: ["", "Oui", "Non"],
    role: [
      "",
      "Président.e",
      "Directeur.rice",
      "co-Directeur.rice",
      "co-Encadrant.e",
      "Rapporteur.rice",
      "Examinateur.trice",
      "Membre invité",
    ],
    affiliation: [
      "",
      "Membre de l'unité de recherche",
      "Membre de l'école doctorale d'inscription",
      "Membre de l'établissement d'inscription",
      "Membre extérieur",
      "Membre du CSI",
    ],
  };
  const members = data.members.map((member, index) => {
    if (member === null || typeof member !== "object" || Array.isArray(member)) {
      throw new Error(`Les informations du membre ${index + 1} sont invalides.`);
    }

    const validatedMember = {};
    const legacyCsiRole = member.role === "Membre du CSI";
    for (const fieldName of memberFields) {
      let value = member[fieldName] === undefined
        ? fieldName === "csiMember" && legacyCsiRole ? "Oui" : ""
        : member[fieldName];
      if (fieldName === "role" && value === "Membre") {
        value = typeof member.quality === "string" && member.quality.toLocaleLowerCase("fr").includes("invité")
          ? "Membre invité"
          : "Examinateur.trice";
      }
      if (fieldName === "role" && value === "Membre examinateur") {
        value = "Examinateur.trice";
      }
      if (fieldName === "role" && value === "Membre du CSI") {
        value = "Examinateur.trice";
      }
      if (typeof value !== "string" || value.length > 500) {
        throw new Error(`Le champ « ${fieldName} » du membre ${index + 1} est invalide.`);
      }
      if (allowedValues[fieldName] && !allowedValues[fieldName].includes(value)) {
        throw new Error(`La valeur du champ « ${fieldName} » du membre ${index + 1} n'est pas reconnue.`);
      }
      validatedMember[fieldName] = value;
    }
    return validatedMember;
  });

  return { profile, settings, members };
}

function validateSettingsConfiguration(data) {
  if (
    data === null
    || typeof data !== "object"
    || Array.isArray(data)
    || data.format !== "jury-these-settings"
    || data.version !== 1
  ) {
    throw new Error("Le fichier ne correspond pas au format attendu pour les règles de l'école doctorale.");
  }

  const member = Object.fromEntries(memberFields.map((fieldName) => [fieldName, ""]));
  const { settings } = validateConfiguration({
    format: "jury-these",
    version: 2,
    settings: data.settings,
    profile: {},
    members: [member],
  });
  return settings;
}

function applySettings(settings) {
  minimumMembersInput.max = "8";
  maximumMembersInput.min = "4";
  minimumMembersInput.value = String(settings.minimumMembers);
  maximumMembersInput.value = String(settings.maximumMembers);
  maximumInvitedInput.value = String(settings.maximumInvited);
  document.querySelector(`input[name="csi-examiners"][value="${settings.csiExaminers ? "Oui" : "Non"}"]`).checked = true;
  document.querySelector(`input[name="csi-supervision"][value="${settings.csiSupervision ? "Oui" : "Non"}"]`).checked = true;
  document.querySelector(`input[name="rapporteur-external-unit"][value="${settings.rapporteurExternalUnit ? "Oui" : "Non"}"]`).checked = true;
  document.querySelector(`input[name="rapporteur-external-school"][value="${settings.rapporteurExternalSchool ? "Oui" : "Non"}"]`).checked = true;
  document.querySelector(`input[name="rapporteur-external-institution"][value="${settings.rapporteurExternalInstitution ? "Oui" : "Non"}"]`).checked = true;
  document.querySelector(`input[name="director-required"][value="${settings.directorRequired ? "Oui" : "Non"}"]`).checked = true;
  document.querySelector(`input[name="director-internal"][value="${settings.directorInternal ? "Oui" : "Non"}"]`).checked = true;
  document.querySelector(`input[name="institution-member-required"][value="${settings.institutionMemberRequired ? "Oui" : "Non"}"]`).checked = true;
  document.querySelector(`input[name="emeritus-rapporteur"][value="${settings.emeritusRapporteur ? "Oui" : "Non"}"]`).checked = true;
  document.querySelector(`input[name="emeritus-president"][value="${settings.emeritusPresident ? "Oui" : "Non"}"]`).checked = true;
  parityModeInput.value = settings.parityMode;
  minimumGenderPercentageInput.value = String(settings.minimumGenderPercentage);
  for (const [total, input] of Object.entries(womenByTotalInputs)) {
    const value = settings.womenByTotal[total];
    input.value = value === null ? "" : String(value);
  }
  updateParitySettingsVisibility();
  updateMemberRange();
}

function applyProfile(profile, school) {
  document.querySelector('[name="doctorant"]').value = profile.doctorant;
  document.querySelector('[name="thesisTitle"]').value = profile.thesisTitle;
  document.querySelector('[name="defenseDate"]').value = profile.defenseDate;

  if (school) {
    selectDoctoralSchool(school);
    profileInstitution.value = profile.institution;
    return;
  }

  doctoralSchoolSearch.value = profile.doctoralSchoolSearch;
  doctoralSchoolValue.value = "";
  profileInstitution.replaceChildren(new Option("Choisissez d'abord une école doctorale", ""));
  profileInstitution.disabled = true;
  institutionStatus.textContent = "";
  doctoralSchoolStatus.textContent = doctoralSchools.length > 0
    ? `${doctoralSchools.length} écoles doctorales disponibles. Recherchez par numéro, sigle ou nom.`
    : "";
}

function resetConfiguration() {
  applySettings(defaultSettings);
  applyProfile({
    doctorant: "",
    thesisTitle: "",
    doctoralSchool: "",
    doctoralSchoolSearch: "",
    institution: "",
    defenseDate: "",
  });
  closeDoctoralSchoolOptions();
  initializeDefaultMembers();
  scheduleFieldControlAlignment();
  result.hidden = true;
  document.querySelector("#settings-title").closest("details").open = false;
  document.querySelector("#profile-title").closest("details").open = true;
  document.querySelector("#members-title").closest("details").open = true;
}

function initializeDefaultMembers() {
  membersContainer.replaceChildren();
  for (const role of defaultMemberRoles) {
    addMember({ role }, { focus: false });
  }
}

loadSettingsButton.addEventListener("click", () => settingsFileInput.click());

settingsFileInput.addEventListener("change", async () => {
  const file = settingsFileInput.files[0];
  if (!file) {
    return;
  }

  try {
    if (file.size > 1_000_000) {
      throw new Error("Le fichier dépasse la taille maximale de 1 Mo.");
    }

    const settings = validateSettingsConfiguration(JSON.parse(await file.text()));
    applySettings(settings);
    result.hidden = true;
    showResult("success", "Règles chargées", "Les règles de l'école doctorale ont été restaurées. Le profil et les membres du jury n'ont pas été modifiés.");
  } catch (error) {
    showResult("error", "Chargement des règles impossible", error instanceof Error ? error.message : "Le fichier n'a pas pu être lu.");
  } finally {
    settingsFileInput.value = "";
  }
});

saveSettingsButton.addEventListener("click", () => {
  try {
    if (parityModeInput.value === "percentage" && !minimumGenderPercentageInput.value) {
      throw new Error("Indiquez le pourcentage minimal d'hommes et de femmes afin de sauvegarder les règles.");
    }
    const settings = validateSettingsConfiguration({
      format: "jury-these-settings",
      version: 1,
      settings: collectConfiguration().settings,
    });
    const file = new Blob([`${JSON.stringify({ format: "jury-these-settings", version: 1, settings }, null, 2)}\n`], {
      type: "application/json",
    });
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "regles-ecole-doctorale.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    showResult("success", "Règles sauvegardées", "Le fichier regles-ecole-doctorale.json a été téléchargé. Il contient uniquement les règles de l'école doctorale.");
  } catch (error) {
    showResult("error", "Sauvegarde des règles impossible", error instanceof Error ? error.message : "Les règles n'ont pas pu être sauvegardées.");
  }
});

loadConfigurationButton.addEventListener("click", () => configurationFileInput.click());

configurationFileInput.addEventListener("change", async () => {
  const file = configurationFileInput.files[0];
  if (!file) {
    return;
  }

  try {
    if (file.size > 1_000_000) {
      throw new Error("Le fichier dépasse la taille maximale de 1 Mo.");
    }

    const configuration = validateConfiguration(JSON.parse(await file.text()));
    await doctoralSchoolsReady;
    const school = configuration.profile.doctoralSchool
      ? doctoralSchools.find((entry) => entry.id_ed === configuration.profile.doctoralSchool)
      : null;
    if (configuration.profile.doctoralSchool && !school) {
      throw new Error("L'école doctorale de la configuration est introuvable dans l'annuaire actuel.");
    }
    if (
      configuration.profile.institution
      && (!school || !school.tous_etablissements?.includes(configuration.profile.institution))
    ) {
      throw new Error("L'établissement d'inscription de la configuration ne correspond pas à l'école doctorale sélectionnée.");
    }

    applySettings(configuration.settings);
    applyProfile(configuration.profile, school);
    membersContainer.replaceChildren();
    configuration.members.forEach((member) => addMember(member, { focus: false }));
    closeDoctoralSchoolOptions();
    result.hidden = true;
    showResult("success", "Configuration chargée", "Le profil, les paramètres et les membres du jury ont été restaurés.");
  } catch (error) {
    showResult("error", "Chargement impossible", error instanceof Error ? error.message : "Le fichier n'a pas pu être lu.");
  } finally {
    configurationFileInput.value = "";
  }
});

saveConfigurationButton.addEventListener("click", () => {
  try {
    if (parityModeInput.value === "percentage" && !minimumGenderPercentageInput.value) {
      throw new Error("Indiquez le pourcentage minimal pour d'hommes et de femmes afin de sauvegarder cette configuration.");
    }
    const configuration = validateConfiguration(collectConfiguration());
    const file = new Blob([`${JSON.stringify({ ...configuration, format: "jury-these", version: 2 }, null, 2)}\n`], {
      type: "application/json",
    });
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "configuration-jury-these.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    showResult("success", "Configuration sauvegardée", "Le fichier configuration-jury-these.json a été téléchargé sur votre appareil.");
  } catch (error) {
    showResult("error", "Sauvegarde impossible", error instanceof Error ? error.message : "La configuration n'a pas pu être sauvegardée.");
  }
});

resetConfigurationButton.addEventListener("click", () => {
  if (!window.confirm("Réinitialiser le formulaire ? Tous les paramètres, le profil et les membres saisis seront effacés.")) {
    return;
  }
  resetConfiguration();
  showResult("success", "Formulaire réinitialisé", "Les paramètres par défaut ont été restaurés et toutes les données saisies ont été effacées.");
});

juryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const memberCards = [...membersContainer.querySelectorAll(".member-card")];
  const memberFieldLabels = {
    name: "nom et prénom",
    gender: "genre",
    institution: "établissement/organisme de rattachement",
    quality: "fonction ou qualité",
    memberStatus: "statut de personne professeur.e ou assimilé",
    csiMember: "appartenance au CSI",
    hdr: "HDR",
    emeritus: "statut d'éméritat",
    role: "rôle dans le jury",
    affiliation: "lien avec l'établissement",
  };
  const missingFieldsByMember = memberCards.flatMap((card, index) => {
    const missingLabels = memberFields
      .filter((fieldName) => !getMemberFieldValue(card, fieldName).trim())
      .map((fieldName) => memberFieldLabels[fieldName]);
    return missingLabels.length > 0 ? [{ memberNumber: index + 1, missingLabels }] : [];
  });
  const juryCards = memberCards.filter((card) => getMemberFieldValue(card, "role") !== "Membre invité");
  const memberTotal = juryCards.length;
  const issues = [];
  const minimumMembers = Number(minimumMembersInput.value);
  const maximumMembers = Number(maximumMembersInput.value);
  const maximumInvited = Number(maximumInvitedInput.value);
  const settingsInputs = [maximumInvitedInput];
  if (parityModeInput.value === "percentage") {
    settingsInputs.push(minimumGenderPercentageInput);
  } else if (parityModeInput.value === "table") {
    settingsInputs.push(...Object.values(womenByTotalInputs));
  }
  const invalidSettings = settingsInputs.filter((input) => !input.value || !input.checkValidity());
  const invitedTotal = memberCards.filter((card) => getMemberFieldValue(card, "role") === "Membre invité").length;
  const rapporteurCards = memberCards
    .map((card, index) => ({ card, index }))
    .filter(({ card }) => getMemberFieldValue(card, "role") === "Rapporteur.rice");
  const womenTotal = juryCards.filter((card) => getMemberFieldValue(card, "gender") === "Femme").length;
  const menTotal = juryCards.filter((card) => getMemberFieldValue(card, "gender") === "Homme").length;
  const professorTotal = juryCards.filter((card) => getMemberFieldValue(card, "memberStatus") === "Oui").length;
  const supervisionRoles = new Set(["Directeur.rice", "co-Directeur.rice", "co-Encadrant.e"]);
  const csiSupervision = settingEnabled("csi-supervision");
  const isSupervisory = (card) =>
    supervisionRoles.has(getMemberFieldValue(card, "role"))
    || (csiSupervision && getMemberFieldValue(card, "csiMember") === "Oui");
  const supervisoryMemberNames = new Set(
    memberCards
      .filter(isSupervisory)
      .map((card) => normalizeSearchText(getMemberFieldValue(card, "name"))),
  );
  const nonSupervisoryTotal = juryCards.filter((card) => !isSupervisory(card)).length;
  const formatRatio = (count) => {
    const percentage = memberTotal > 0 ? (count / memberTotal) * 100 : 0;
    return `${count}/${memberTotal} (${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(percentage)} %)`;
  };
  const csiExaminersAllowed = settingEnabled("csi-examiners");
  const rapporteursExternalToUnit = settingEnabled("rapporteur-external-unit");
  const rapporteursExternalToSchool = settingEnabled("rapporteur-external-school");
  const rapporteursExternalToInstitution = settingEnabled("rapporteur-external-institution");
  const directorRequired = settingEnabled("director-required");
  const directorsAreInternal = settingEnabled("director-internal");
  const institutionMemberRequired = settingEnabled("institution-member-required");
  const emeritusRapporteurAllowed = settingEnabled("emeritus-rapporteur");
  const emeritusPresidentAllowed = settingEnabled("emeritus-president");
  const professorStatusWarnings = memberCards.flatMap((card, index) => {
    const quality = getMemberFieldValue(card, "quality").trim();
    const isProfessor = isProfessorQuality(quality);
    const isMarkedProfessor = getMemberFieldValue(card, "memberStatus") === "Oui";
    return quality && isMarkedProfessor && !isProfessor
      ? [`Membre ${index + 1} (« ${quality} ») : l'interrupteur « Professeur.e ou assimilé ou rang équivalent » est sur Oui, mais cette fonction n'est pas répertoriée comme relevant de cette catégorie.`]
      : [];
  });
  const presidentElectionWarnings = memberCards.flatMap((card, index) =>
    getMemberFieldValue(card, "role") === "Président.e"
      ? [`Membre ${index + 1} : la personne qui préside le jury doit toutefois être élue par les membres du jury.`]
      : [],
  );
  const directorAffiliationIssues = memberCards.flatMap((card, index) =>
    directorsAreInternal
    && getMemberFieldValue(card, "role") === "Directeur.rice"
    && getMemberFieldValue(card, "affiliation") === "Membre extérieur"
      ? [`Membre ${index + 1} : la personne chargée de la direction de thèse est déclarée extérieure, mais le réglage de l'école doctorale la considère toujours comme membre interne.`]
      : [],
  );
  issues.push(...directorAffiliationIssues);
  const warnings = [...professorStatusWarnings, ...presidentElectionWarnings];

  if (minimumMembers > maximumMembers) {
    invalidSettings.push(minimumMembersInput, maximumMembersInput);
    issues.push("Le nombre minimal de membres ne peut pas dépasser le nombre maximal.");
  }

  if (invalidSettings.length > 0) {
    issues.push("Vérifiez les paramètres de l'école doctorale : les nombres doivent respecter les limites indiquées.");
  } else if (memberTotal < minimumMembers || memberTotal > maximumMembers) {
    issues.push(`Le jury doit compter entre ${minimumMembers} et ${maximumMembers} personnes (actuellement : ${memberTotal}).`);
  }

  if (directorRequired && !juryCards.some((card) => getMemberFieldValue(card, "role") === "Directeur.rice")) {
    issues.push("La personne chargée de la direction de thèse doit faire partie du jury.");
  }

  const minimumProfessorMembers = Math.ceil(memberTotal / 2);
  if (memberTotal > 0 && professorTotal < minimumProfessorMembers) {
    issues.push(`Au moins la moitié du jury doit être composée de professeur.es ou assimilés (minimum ${minimumProfessorMembers}, actuellement ${professorTotal}).`);
  }

  if (rapporteurCards.length < 2 || rapporteurCards.length > 3) {
    issues.push(`Le jury doit compter deux ou trois personnes en qualité de rapporteur·rice (actuellement : ${rapporteurCards.length}).`);
  }
  for (const { card, index } of rapporteurCards) {
    const memberNumber = index + 1;
    if (!["Oui", "Équivalence"].includes(getMemberFieldValue(card, "hdr"))) {
      issues.push(`Membre ${memberNumber} : la personne en qualité de rapporteur·rice doit être titulaire de l'HDR ou d'une équivalence.`);
    }
    if (supervisoryMemberNames.has(normalizeSearchText(getMemberFieldValue(card, "name")))) {
      issues.push(`Membre ${memberNumber} : une personne de l'encadrement de la thèse ne peut pas être en qualité de rapporteur·rice.`);
    }
    if (getMemberFieldValue(card, "csiMember") === "Oui") {
      issues.push(`Membre ${memberNumber} : une personne du CSI ne peut pas être en qualité de rapporteur·rice.`);
    }
    const affiliation = getMemberFieldValue(card, "affiliation");
    if (rapporteursExternalToUnit && affiliation === "Membre de l'unité de recherche") {
      issues.push(`Membre ${memberNumber} : la personne en qualité de rapporteur·rice doit être extérieure à l'unité de recherche.`);
    }
    if (rapporteursExternalToSchool && affiliation === "Membre de l'école doctorale d'inscription") {
      issues.push(`Membre ${memberNumber} : la personne en qualité de rapporteur·rice doit être extérieure à l'école doctorale d'inscription.`);
    }
    if (rapporteursExternalToInstitution && affiliation === "Membre de l'établissement d'inscription") {
      issues.push(`Membre ${memberNumber} : la personne en qualité de rapporteur·rice doit être extérieure à l'établissement d'inscription.`);
    }
  }

  memberCards.forEach((card, index) => {
    if (
      getMemberFieldValue(card, "role") === "Président.e"
      && getMemberFieldValue(card, "memberStatus") !== "Oui"
    ) {
      issues.push(`Membre ${index + 1} : la personne qui préside le jury doit relever de la catégorie des professeur.es, assimilés ou enseignants de rang équivalent.`);
    }
  });

  if (invalidSettings.length === 0 && invitedTotal > maximumInvited) {
    issues.push(`Le jury ne peut pas compter plus de ${maximumInvited} personne(s) invitée(s) (actuellement : ${invitedTotal}).`);
  }

  const examinerRoles = new Set(["Examinateur.trice"]);
  if (!csiExaminersAllowed) {
    memberCards.forEach((card, index) => {
      if (
        getMemberFieldValue(card, "csiMember") === "Oui"
        && examinerRoles.has(getMemberFieldValue(card, "role"))
      ) {
        issues.push(`Membre ${index + 1} : une personne du CSI est désignée en qualité d'examinateur·rice alors que le paramètre de l'école doctorale ne l'autorise pas.`);
      }
    });
  }

  if (!emeritusRapporteurAllowed) {
    memberCards.forEach((card, index) => {
      if (
        getMemberFieldValue(card, "emeritus") === "Oui"
        && getMemberFieldValue(card, "role") === "Rapporteur.rice"
      ) {
        issues.push(`Membre ${index + 1} : une personne émérite est indiquée en qualité de rapporteur·rice alors que le paramètre de l'école doctorale ne l'autorise pas.`);
      }
    });
  }

  if (!emeritusPresidentAllowed) {
    memberCards.forEach((card, index) => {
      if (
        getMemberFieldValue(card, "emeritus") === "Oui"
        && getMemberFieldValue(card, "role") === "Président.e"
      ) {
        issues.push(`Membre ${index + 1} : une personne émérite est indiquée comme présidant le jury alors que le paramètre de l'école doctorale ne l'autorise pas.`);
      }
    });
  }

  const externalMembers = juryCards.filter((card) => {
    const isDirector = getMemberFieldValue(card, "role") === "Directeur.rice";
    const isExternal = getMemberFieldValue(card, "affiliation") === "Membre extérieur";
    return isExternal && !(directorsAreInternal && isDirector);
  }).length;
  const minimumExternalMembers = Math.ceil(memberTotal / 2);
  if (memberTotal > 0 && externalMembers < minimumExternalMembers) {
    issues.push(`Au moins la moitié des personnes du jury doit être extérieure à l'établissement, à l'école doctorale et à l'unité de recherche (minimum ${minimumExternalMembers}, actuellement ${externalMembers}).`);
  }

  if (
    institutionMemberRequired
    && !juryCards.some((card) => getMemberFieldValue(card, "affiliation") === "Membre de l'établissement d'inscription")
  ) {
    issues.push("Au moins une personne du jury doit appartenir à l'établissement d'inscription.");
  }

  const cardsByPerson = new Map();
  memberCards.forEach((card, index) => {
    const personKey = normalizeSearchText(getMemberFieldValue(card, "name"))
      .split(/[\s,;-]+/)
      .filter(Boolean)
      .sort()
      .join(" ");
    if (personKey) {
      cardsByPerson.set(personKey, [...(cardsByPerson.get(personKey) ?? []), index + 1]);
    }
  });
  for (const memberNumbers of cardsByPerson.values()) {
    if (memberNumbers.length > 1) {
      issues.push(`Membre ${memberNumbers[0]} : la même personne est déclarée plusieurs fois (membres ${memberNumbers.join(", ")}). Une personne ne peut figurer qu'une seule fois dans le jury, y compris comme invitée.`);
    }
  }

  for (const { memberNumber, missingLabels } of missingFieldsByMember) {
    issues.push(`Membre ${memberNumber} : renseignez les champs obligatoires suivants : ${missingLabels.join(", ")}.`);
  }

  if (parityModeInput.value === "one-each" && memberTotal > 0 && (womenTotal === 0 || menTotal === 0)) {
    issues.push("Le jury doit compter au moins une personne renseignée comme femme et une personne renseignée comme homme.");
  } else if (parityModeInput.value === "percentage" && !invalidSettings.includes(minimumGenderPercentageInput)) {
    const requiredMembersPerGender = Math.ceil(memberTotal * Number(minimumGenderPercentageInput.value) / 100);
    if (womenTotal < requiredMembersPerGender || menTotal < requiredMembersPerGender) {
      issues.push(`La règle de parité exige au moins ${minimumGenderPercentageInput.value} % de personnes renseignées comme femmes et comme hommes (au moins ${requiredMembersPerGender} personne(s) de chaque catégorie sur ${memberTotal}).`);
    }
  } else if (
    parityModeInput.value === "table"
    && invalidSettings.length === 0
    && womenByTotalInputs[memberTotal]
  ) {
    const requiredWomen = Number(womenByTotalInputs[memberTotal].value);
    if (womenTotal < requiredWomen) {
      issues.push(`Le tableau de parité exige au moins ${requiredWomen} personne(s) renseignée(s) comme femme(s) pour un jury de ${memberTotal} personnes (actuellement ${womenTotal}).`);
    }
  }

  result.replaceChildren();

  const summaryHeading = document.createElement("h2");
  summaryHeading.textContent = "Récapitulatif du jury";
  const summary = document.createElement("dl");
  summary.className = "result-summary";
  const summaryRows = [
    ["Nombre de membres dans le jury", String(memberTotal)],
    ["Nombre de membres invités", String(invitedTotal)],
    ["Nombre de membres renseignés comme femmes", formatRatio(womenTotal)],
    ["Nombre de membres renseignés comme hommes", formatRatio(menTotal)],
    ["Nombre de professeur.es, assimilés ou de rang équivalent", formatRatio(professorTotal)],
    ["Nombre de membres n'appartenant pas à l'encadrement de la thèse", formatRatio(nonSupervisoryTotal)],
  ];
  for (const [label, value] of summaryRows) {
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = value;
    summary.append(term, description);
  }
  result.append(summaryHeading, summary);

  const heading = document.createElement("h2");

  if (issues.length > 0) {
    heading.textContent = "Le jury n'est pas conforme : veuillez vérifier les points suivants :";
    result.dataset.state = "error";
    const list = document.createElement("ul");
    for (const issue of issues) {
      appendValidationMessage(list, issue);
    }
    result.append(heading, list);

    if (warnings.length > 0) {
      const warningList = document.createElement("ul");
      for (const warning of warnings) {
        appendValidationMessage(warningList, `Avertissement : ${warning}`);
      }
      result.append(warningList);
    }

    if (invalidSettings.length > 0) {
      settingsPanel.open = true;
    }
  } else {
    heading.textContent = professorStatusWarnings.length > 0
      ? "Le jury semble conforme, avec un avertissement"
      : "Le jury semble conforme !";
    const message = document.createElement("p");
    message.textContent = `${memberTotal} personne${memberTotal > 1 ? "s" : ""} renseignée${memberTotal > 1 ? "s" : ""}. Ce résultat ne constitue pas une vérification de conformité juridique.`;
    result.dataset.state = professorStatusWarnings.length > 0 ? "warning" : "success";
    result.append(heading, message);

    if (warnings.length > 0) {
      const list = document.createElement("ul");
      for (const warning of warnings) {
        appendValidationMessage(list, `Avertissement : ${warning}`);
      }
      result.append(list);
    }
  }

  result.hidden = false;
  populatePdfExport();
  result.focus({ preventScroll: true });
  result.scrollIntoView({ behavior: "instant", block: "start" });
});

initializeDefaultMembers();
