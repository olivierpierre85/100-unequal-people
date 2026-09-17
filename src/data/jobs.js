// Job titles for the 100 profiles in the three site languages.
// Keys are emitted by scripts/generate-profiles.mjs (work.job, work.former).
// French and some Dutch titles are gendered: { m, f } is picked by the
// person's gender; a plain string is used for everyone.

const J = (en, nl, fr) => ({ en, nl, fr })

export const JOBS = {
  student: J('Student', 'Student', { m: 'Étudiant', f: 'Étudiante' }),
  student_job: J('Student with a side job', 'Student met een studentenjob', { m: 'Étudiant avec un job étudiant', f: 'Étudiante avec un job étudiant' }),
  job_seeker: J('Job seeker', 'Werkzoekende', { m: "Demandeur d'emploi", f: "Demandeuse d'emploi" }),
  job_seeker_cohabiting: J('Job seeker, living with family', 'Werkzoekende, woont bij familie', { m: "Demandeur d'emploi, vit en famille", f: "Demandeuse d'emploi, vit en famille" }),
  integration_income: J('Integration income (social welfare)', 'Leefloon van het OCMW', "Revenu d'intégration (CPAS)"),
  integration_income_cohabiting: J('Integration income, living with family', 'Leefloon, woont bij familie', "Revenu d'intégration, vit en famille"),
  homemaker: J('Stay-at-home partner, no income of their own', 'Thuisblijvende partner, zonder eigen inkomen', { m: 'Homme au foyer, sans revenu propre', f: 'Femme au foyer, sans revenu propre' }),
  part_time_cleaner: J('Part-time cleaner', 'Deeltijdse poetshulp', { m: 'Aide-ménager à temps partiel', f: 'Aide-ménagère à temps partiel' }),
  part_time_retail: J('Part-time shop assistant', 'Deeltijdse winkelbediende', { m: 'Vendeur à temps partiel', f: 'Vendeuse à temps partiel' }),
  hairdresser: J('Hairdresser', { m: 'Kapper', f: 'Kapster' }, { m: 'Coiffeur', f: 'Coiffeuse' }),
  part_time_kitchen: J('Part-time kitchen help', 'Deeltijdse keukenhulp', 'Aide de cuisine à temps partiel'),
  temp_worker: J('Agency temp worker', 'Uitzendkracht', 'Intérimaire'),
  cashier: J('Supermarket cashier', { m: 'Kassier in een supermarkt', f: 'Kassierster in een supermarkt' }, { m: 'Caissier de supermarché', f: 'Caissière de supermarché' }),
  delivery_driver: J('Delivery driver', 'Pakjeskoerier', { m: 'Livreur', f: 'Livreuse' }),
  care_assistant: J('Care assistant', 'Zorgkundige', { m: 'Aide-soignant', f: 'Aide-soignante' }),
  warehouse_worker: J('Warehouse worker', 'Magazijnier', { m: 'Magasinier', f: 'Magasinière' }),
  truck_driver: J('Truck driver', 'Vrachtwagenchauffeur', { m: 'Chauffeur poids lourd', f: 'Chauffeuse poids lourd' }),
  admin_assistant: J('Administrative assistant', 'Administratief bediende', { m: 'Employé administratif', f: 'Employée administrative' }),
  childcare_worker: J('Childcare worker', { m: 'Kinderverzorger', f: 'Kinderverzorgster' }, { m: 'Puériculteur', f: 'Puéricultrice' }),
  postal_worker: J('Postal worker', 'Postbode', { m: 'Facteur', f: 'Factrice' }),
  bus_driver: J('Bus driver', 'Buschauffeur', { m: 'Chauffeur de bus', f: 'Chauffeuse de bus' }),
  nurse: J('Nurse', 'Verpleegkundige', { m: 'Infirmier', f: 'Infirmière' }),
  primary_teacher: J('Primary-school teacher', 'Leerkracht lager onderwijs', { m: 'Instituteur', f: 'Institutrice' }),
  electrician: J('Electrician', 'Elektricien', { m: 'Électricien', f: 'Électricienne' }),
  police_officer: J('Police officer', 'Politie-inspecteur', { m: 'Inspecteur de police', f: 'Inspectrice de police' }),
  train_conductor: J('Train conductor', 'Treinbegeleider', { m: 'Accompagnateur de train', f: 'Accompagnatrice de train' }),
  secondary_teacher: J('Secondary-school teacher', 'Leerkracht secundair onderwijs', { m: 'Professeur dans le secondaire', f: 'Professeure dans le secondaire' }),
  accountant: J('Accountant', 'Boekhouder', 'Comptable'),
  civil_servant_fl: J('Flemish government civil servant', 'Ambtenaar bij de Vlaamse overheid', 'Fonctionnaire de la Région flamande'),
  civil_servant_wa: J('Walloon Region civil servant', 'Ambtenaar bij het Waals Gewest', 'Fonctionnaire de la Région wallonne'),
  civil_servant_bxl: J('Brussels municipal civil servant', 'Gemeenteambtenaar in Brussel', { m: 'Fonctionnaire communal à Bruxelles', f: 'Fonctionnaire communale à Bruxelles' }),
  lab_technician: J('Lab technician', 'Laborant', { m: 'Laborantin', f: 'Laborantine' }),
  social_worker: J('Social worker', 'Maatschappelijk werker', { m: 'Assistant social', f: 'Assistante sociale' }),
  it_developer: J('Software developer', 'Softwareontwikkelaar', { m: 'Développeur', f: 'Développeuse' }),
  engineer: J('Engineer', 'Ingenieur', { m: 'Ingénieur', f: 'Ingénieure' }),
  pharmacist: J('Pharmacist', 'Apotheker', { m: 'Pharmacien', f: 'Pharmacienne' }),
  federal_civil_servant: J('Federal civil servant', 'Federaal ambtenaar', { m: 'Fonctionnaire fédéral', f: 'Fonctionnaire fédérale' }),
  project_manager: J('Project manager', 'Projectmanager', { m: 'Chef de projet', f: 'Cheffe de projet' }),
  senior_engineer: J('Senior engineer', 'Senior ingenieur', { m: 'Ingénieur senior', f: 'Ingénieure senior' }),
  plumber_self_employed: J('Self-employed plumber', 'Zelfstandig loodgieter', { m: 'Plombier indépendant', f: 'Plombière indépendante' }),
  university_lecturer: J('University lecturer', 'Docent aan de universiteit', { m: "Chargé de cours à l'université", f: "Chargée de cours à l'université" }),
  it_consultant: J('IT consultant (self-employed)', 'Zelfstandig IT-consultant', { m: 'Consultant IT indépendant', f: 'Consultante IT indépendante' }),
  gp: J('General practitioner', 'Huisarts', 'Médecin généraliste'),
  lawyer: J('Lawyer', 'Advocaat', { m: 'Avocat', f: 'Avocate' }),
  senior_manager: J('Senior manager', 'Senior manager', { m: 'Cadre supérieur', f: 'Cadre supérieure' }),
  architect_self_employed: J('Self-employed architect', 'Zelfstandig architect', { m: 'Architecte indépendant', f: 'Architecte indépendante' }),
  medical_specialist: J('Medical specialist', 'Arts-specialist', 'Médecin spécialiste'),
  mp: J('Member of Parliament', 'Parlementslid', { m: 'Député', f: 'Députée' }),
  notary: J('Notary', 'Notaris', 'Notaire'),
  company_director: J('Company director', 'Bedrijfsleider', { m: "Directeur d'entreprise", f: "Directrice d'entreprise" }),
  company_owner: J('Owner of a family business', 'Eigenaar van een familiebedrijf', "Propriétaire d'une entreprise familiale"),
}

// "Retired, formerly a …" — what pensioners used to do.
export const FORMER = {
  factory_worker: J('factory worker', 'fabrieksarbeider', { m: "ouvrier d'usine", f: "ouvrière d'usine" }),
  shop_assistant: J('shop assistant', 'winkelbediende', { m: 'vendeur', f: 'vendeuse' }),
  farm_worker: J('farm worker', 'landarbeider', { m: 'ouvrier agricole', f: 'ouvrière agricole' }),
  textile_worker: J('textile worker', 'textielarbeider', { m: 'ouvrier du textile', f: 'ouvrière du textile' }),
  postal_worker: J('postal worker', 'postbode', { m: 'facteur', f: 'factrice' }),
  nurse: J('nurse', 'verpleegkundige', { m: 'infirmier', f: 'infirmière' }),
  mechanic: J('mechanic', 'mecanicien', { m: 'mécanicien', f: 'mécanicienne' }),
  secretary: J('secretary', 'secretariaatsmedewerker', 'secrétaire'),
  teacher: J('teacher', 'leerkracht', { m: 'enseignant', f: 'enseignante' }),
  civil_servant: J('civil servant', 'ambtenaar', 'fonctionnaire'),
  train_driver: J('train driver', 'treinbestuurder', { m: 'conducteur de train', f: 'conductrice de train' }),
  bank_clerk: J('bank clerk', 'bankbediende', { m: 'employé de banque', f: 'employée de banque' }),
  company_manager: J('company manager', 'bedrijfsleider', { m: "directeur d'entreprise", f: "directrice d'entreprise" }),
  doctor: J('doctor', 'arts', 'médecin'),
  notary: J('notary', 'notaris', 'notaire'),
  senior_civil_servant: J('senior civil servant', 'topambtenaar', { m: 'haut fonctionnaire', f: 'haute fonctionnaire' }),
}

const RETIRED = J(
  'Retired, formerly a {former}',
  'Gepensioneerd, vroeger {former}',
  { m: 'Retraité, ancien {former}', f: 'Retraitée, ancienne {former}' },
)

// One emoji per job, used as the person's avatar.
const EMOJI = {
  student: '🎓', student_job: '🎓', job_seeker: '🔍', job_seeker_cohabiting: '🔍',
  integration_income: '🧾', integration_income_cohabiting: '🧾', homemaker: '🏡',
  part_time_cleaner: '🧹', part_time_retail: '🛍️', hairdresser: '✂️', part_time_kitchen: '🍳',
  temp_worker: '📦', cashier: '🛒', delivery_driver: '🚚', care_assistant: '🩹',
  warehouse_worker: '📦', truck_driver: '🚛', admin_assistant: '🗂️', childcare_worker: '🧸',
  postal_worker: '✉️', bus_driver: '🚌', nurse: '💉', primary_teacher: '✏️', electrician: '🔌',
  police_officer: '🚔', train_conductor: '🚆', secondary_teacher: '📚', accountant: '🧮',
  civil_servant_fl: '🏛️', civil_servant_wa: '🏛️', civil_servant_bxl: '🏛️', lab_technician: '🔬',
  social_worker: '🤝', it_developer: '💻', engineer: '⚙️', pharmacist: '💊',
  federal_civil_servant: '🏛️', project_manager: '📋', senior_engineer: '🛠️',
  plumber_self_employed: '🔧', university_lecturer: '🎓', it_consultant: '💼', gp: '🩺',
  lawyer: '⚖️', senior_manager: '📈', architect_self_employed: '📐', medical_specialist: '🏥',
  mp: '🗳️', notary: '✒️', company_director: '🏢', company_owner: '💎',
}

/** Avatar emoji for a profile. */
export function jobEmoji(person) {
  if (person.work.job === 'retired') return person.demographics.gender === 'Female' ? '👵' : '👴'
  return EMOJI[person.work.job] ?? '🙂'
}

function forGender(value, gender) {
  if (typeof value === 'string') return value
  return value[gender === 'Female' ? 'f' : 'm']
}

/** Localised job title for a profile. */
export function jobTitle(person, locale = 'en') {
  const { gender } = person.demographics
  const { job, former } = person.work
  if (job === 'retired') {
    const what = forGender((FORMER[former] ?? FORMER.civil_servant)[locale], gender)
    return forGender(RETIRED[locale], gender).replace('{former}', what)
  }
  const entry = JOBS[job]
  if (!entry) return job
  return forGender(entry[locale] ?? entry.en, gender)
}
