import { ChatMessage, Language, UserProfile } from '../types/index';

export interface ClinicalResponse {
  text: string;
  assessment: {
    severity: 'mild' | 'moderate' | 'urgent';
    summary: string;
    steps: string[];
    emergencyWarning: string;
    suggestedAction: 'call_doctor' | 'find_hospital' | 'home_care';
  };
}

// Utility: pick random item from array
function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Utility: pick N unique items from array
function pickMultipleRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Dynamic keyword parser and real-time medical simulation engine.
 * Parses user input, detects symptoms, modifiers, and language,
 * and dynamically synthesizes a customized, randomized clinical response.
 */
export async function sendChatMessageToGemini(
  query: string,
  history: ChatMessage[],
  userProfile: UserProfile,
  currentLanguage: Language
): Promise<ClinicalResponse> {
  // Simulate natural typing delay (450ms - 750ms) for responsive presentation feel
  const delayMs = 450 + Math.floor(Math.random() * 300);
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  const q = query.toLowerCase().trim();
  const userName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'Victor';
  const age = userProfile?.age || 28;
  const gender = userProfile?.gender || 'Male';
  const chronicList = userProfile?.chronicConditions || ['None'];
  const hasSickleCell = chronicList.includes('Sickle Cell');
  const hasHypertension = chronicList.includes('Hypertension');
  const hasDiabetes = chronicList.includes('Diabetes');
  const hasAsthma = chronicList.includes('Asthma');
  const hasHiv = chronicList.includes('HIV');

  // 1. Language Detection (Detect Swahili if user explicitly typed Swahili terms or language toggle is SW)
  const isSwahili =
    currentLanguage === 'SW' ||
    q.includes('swahili') ||
    q.includes('habari') ||
    q.includes('homa') ||
    q.includes('kichwa') ||
    q.includes('tumbo') ||
    q.includes('dawa') ||
    q.includes('mtoto') ||
    q.includes('kifua') ||
    q.includes('pumzi') ||
    q.includes('kuhara') ||
    q.includes('kutapika') ||
    q.includes('nina') ||
    q.includes('naomba') ||
    q.includes('maumivu') ||
    q.includes('mwili') ||
    q.includes('asante');

  // 2. Keyword & Symptom Intent Extraction
  const hasChest = q.includes('chest') || q.includes('kifua') || q.includes('heart') || q.includes('moyo') || q.includes('angina');
  const hasBreath = q.includes('breath') || q.includes('pumzi') || q.includes('asthma') || q.includes('pumu') || q.includes('wheez') || q.includes('kukohoa');
  const hasMalaria = q.includes('malaria') || q.includes('mrdt') || q.includes('chills') || q.includes('shiver') || q.includes('baridi') || (q.includes('fever') && q.includes('headache'));
  const hasFever = q.includes('fever') || q.includes('homa') || q.includes('joto') || q.includes('temperature') || q.includes('39') || q.includes('38');
  const hasHeadache = q.includes('headache') || q.includes('kichwa') || q.includes('migraine') || q.includes('head pain');
  const hasStomach = q.includes('stomach') || q.includes('tumbo') || q.includes('diarrhea') || q.includes('kuhara') || q.includes('vomit') || q.includes('kutapika') || q.includes('nausea') || q.includes('typhoid') || q.includes('chafuka');
  const hasChild = q.includes('child') || q.includes('mtoto') || q.includes('baby') || q.includes('infant') || q.includes('chanjo') || q.includes('immuniz') || q.includes('vaccin') || q.includes('surua') || q.includes('rch');
  const hasBp = q.includes('bp') || q.includes('pressure') || q.includes('presha') || q.includes('hypertension');
  const hasSugar = q.includes('sugar') || q.includes('sukari') || q.includes('glucose') || q.includes('diabetes') || q.includes('insulin') || q.includes('metformin');
  const hasCough = q.includes('cough') || q.includes('kikohozi') || q.includes('flu') || q.includes('mafua') || q.includes('throat') || q.includes('koo');
  const hasSkin = q.includes('skin') || q.includes('ngozi') || q.includes('rash') || q.includes('vipele') || q.includes('itch') || q.includes('washa') || q.includes('allergy');
  const hasSevere = q.includes('severe') || q.includes('makali') || q.includes('sana') || q.includes('high') || q.includes('bad') || q.includes('acute') || q.includes('danger');

  // Determine Primary Category
  let category: 'cardiac' | 'malaria_fever' | 'headache' | 'gastro' | 'pediatric' | 'hypertension' | 'diabetes' | 'respiratory' | 'dermatology' | 'general' = 'general';
  if (hasChest || (hasBreath && hasSevere)) category = 'cardiac';
  else if (hasMalaria || (hasFever && hasHeadache)) category = 'malaria_fever';
  else if (hasHeadache) category = 'headache';
  else if (hasStomach) category = 'gastro';
  else if (hasChild) category = 'pediatric';
  else if (hasBp) category = 'hypertension';
  else if (hasSugar) category = 'diabetes';
  else if (hasCough || hasBreath) category = 'respiratory';
  else if (hasSkin) category = 'dermatology';

  // Determine Severity
  let severity: 'mild' | 'moderate' | 'urgent' = 'mild';
  if (category === 'cardiac' || hasSevere && (hasFever || hasHeadache || hasBreath)) {
    severity = 'urgent';
  } else if (category === 'malaria_fever' || category === 'gastro' || hasHypertension || hasSickleCell) {
    severity = 'moderate';
  }

  // Determine Suggested Action
  let suggestedAction: 'call_doctor' | 'find_hospital' | 'home_care' = 'home_care';
  if (severity === 'urgent') suggestedAction = 'find_hospital';
  else if (severity === 'moderate' || category === 'pediatric') suggestedAction = 'call_doctor';

  // ==========================================
  // DYNAMIC TEXT SYNTHESIS (RANDOMIZED PHRASING)
  // ==========================================

  let greeting = '';
  let empathyPhrase = '';
  let clinicalAssessment = '';
  let chronicNote = '';
  let steps: string[] = [];
  let emergencyWarning = '';
  let summary = '';

  if (isSwahili) {
    // SWAHILI DYNAMIC PHRASING
    greeting = pickRandom([
      `Habari ${userName}. Nimepokea maelezo yako ya kiafya kwa umakini mkubwa.`,
      `Habari ya wakati huu, ndugu ${userName}. Mfumo wetu wa Vanguard umeanza kuchambua dalili ulizozitaja.`,
      `Pole sana ${userName} kwa changamoto hii ya kiafya unayopitia hivi sasa.`,
      `Jambo ${userName}. Nipo hapa kukupa mwongozo sahihi wa kitabibu unaozingatia mazingira yetu ya Tanzania.`,
      `Habari ${userName}. Nimepokea taarifa zako na niko tayari kukusaidia kutathmini afya yako leo.`,
    ]);

    empathyPhrase = pickRandom([
      `Kuhisi dalili kama hizi (${query}) huleta usumbufu mkubwa na wasiwasi katika shughuli za kila siku.`,
      `Dalili hizi ulizoeleza zinahitaji uangalizi wa haraka ili kutofautisha kati ya maambukizi ya kawaida na yale yanayohitaji matibabu maalumu.`,
      `Mwili unapotoa ishara hizi, ni wito wa wazi wa kupata mapumziko na kuchukua hatua za kuzuia madhara zaidi.`,
      `Katika uchunguzi wa awali kwa mgonjwa mwenye umri wa miaka ${age} (${gender}), dalili hizi zinaashiria mwitikio wa mfumo wako wa kinga.`,
    ]);

    // Chronic condition dynamic modifier
    if (hasSickleCell) {
      chronicNote = pickRandom([
        `\n• ⚠️ ANGALIZO LA SELIMUNDU (SICKLE CELL): Kwa kuwa una Selimundu, mabadiliko haya ya mwili yanaweza kuchochea 'sickle crisis'. Zingatia unywaji wa maji mengi na epuka baridi kali au msongo wa mawazo.`,
        `\n• ⚠️ TAHADHARI YA SELIMUNDU: Mgonjwa wa Sickle Cell anapopata dalili hizi anahitaji ufuatiliaji wa karibu ili kuzuia upungufu wa damu au maumivu makali kwenye viungo.`,
      ]);
    } else if (hasHypertension) {
      chronicNote = pickRandom([
        `\n• ⚠️ ANGALIZO LA SHINIKIZO LA DAMU (HYPERTENSION): Kwa kuwa una rekodi ya BP, hakikisha unapima shinikizo lako leo kabla ya kutumia dawa yoyote ya kutuliza maumivu.`,
        `\n• ⚠️ TAHADHARI YA BP: Maumivu au mshtuko huu unaweza kupandisha shinikizo la damu. Epuka chumvi na pima BP yako sasa.`,
      ]);
    } else if (hasDiabetes) {
      chronicNote = pickRandom([
        `\n• ⚠️ ANGALIZO LA KISUKARI (DIABETES): Fuatilia kiwango chako cha sukari (Glucometer check) ili kuhakikisha kiko kati ya 4.0 - 7.0 mmol/L kabla ya kula.`,
        `\n• ⚠️ TAHADHARI YA GLUCOSE: Epuka dawa zenye sukari au syrup bila maelekezo ya daktari.`,
      ]);
    } else if (hasAsthma) {
      chronicNote = pickRandom([
        `\n• ⚠️ ANGALIZO LA PUMU (ASTHMA): Hakikisha una kifaa chako cha kusaidia kupumua (Inhaler) karibu na epuka vumbi, moshi, au hewa kavu ya baridi.`,
      ]);
    }

    // Category specific synthesis
    if (category === 'cardiac') {
      clinicalAssessment = pickRandom([
        `Maumivu au mgandamizo kifuani unaweza kutokana na mkazo wa misuli ya kifua, mfumo wa upumuaji, au mzunguko wa damu kwenye moyo (Coronary Circulation). Hali hii inahitaji uchunguzi wa haraka ili kulinda afya ya moyo.`,
        `Kujisikia kubana kifuani ni dalili ya kipaumbele cha juu cha kitabibu inayohitaji kupimwa kwa kifaa cha moyo (ECG) na shinikizo la damu mara moja.`,
      ]);
      steps = pickMultipleRandom([
        'Kaa chini mara moja ukiwa umenyooka nusu-wima (semi-upright posture)',
        'Fungua vifungo vya nguo kifuani na shingoni kuruhusu hewa ya kutosha kuingia',
        'Usifanye shughuli yoyote nzito au mazoezi ya nguvu kwa sasa',
        'Fika kwenye kituo chenye huduma za dharura (kama Muhimbili, JKCI, au Aga Khan)',
        'Wasiliana na mtu wa karibu wa dharura akutangulie kusaidia usafiri',
      ], 3);
      emergencyWarning = pickRandom([
        '⚠️ TAHADHARI YA DHARURA / CRITICAL ALERT: Ikiwa maumivu yanasambaa kwenye mkono wa kushoto, shingo, au una jasho jembamba la baridi na upungufu wa pumzi, piga 112 / 115 au fika Taasisi ya Moyo JKCI mara moja!',
        '⚠️ ILANI YA HARAKA: Maumivu makali ya kifua yanayoambatana na kizunguzungu au kubanwa pumzi yanahitaji chumba cha dharura bila kuchelewa dakika moja.',
      ]);
      summary = 'Uchunguzi wa haraka wa mfumo wa moyo na upumuaji unahitajika.';
    } else if (category === 'malaria_fever') {
      clinicalAssessment = pickRandom([
        `Katika ukanda wa Dar es Salaam na Pwani, homa ya ghafla inayoambatana na baridi (rigors) au kichwa kuuma mara nyingi huashiria maambukizi ya vimelea vya Malaria (Plasmodium falciparum) au maambukizi ya bakteria.`,
        `Homa na maumivu ya mwili ni mwitikio wa mwili kupambana na vimelea. Ni muhimu kuthibitisha kwa kipimo cha damu badala ya kumeza dawa kiholela.`,
        `Kiwango cha joto kikipanda kinasababisha mwili kupoteza maji kwa kasi, jambo linaloweza kuleta udhaifu na maumivu ya viungo.`,
      ]);
      steps = pickMultipleRandom([
        'Kunywa maji safi ya kutosha au pakiti ya ORS (lita 2.5 kwa siku) kuzuia upungufu wa maji mwilini',
        'Fanya kipimo cha haraka cha mRDT au hadubini (BS for MPS) kwenye zahanati/maabara iliyo karibu ndani ya masaa 2',
        'Tumia Paracetamol kupunguza joto (epuka Aspirin au Brufen kabla ya kuthibitisha ugonjwa)',
        'Futa mwili kwa kitambaa cha maji ya vuguvugu (tepid sponging) ili kusaidia kupunguza joto kwa upole',
        'Wasiliana na Daktari wetu hewani wa Vanguard kwa ajili ya kupitia majibu ya kipimo chako',
      ], 3);
      emergencyWarning = pickRandom([
        '⚠️ TAHADHARI YA DHARURA / EMERGENCY TRIAGE: Kama mgonjwa anatapika kila anachokunywa, ana degedege (convulsions), njano machoni, au kupoteza fahamu, nenda Hospitali ya Taifa Muhimbili mara moja!',
        '⚠️ ILANI YA DHARURA: Degedege kwa watoto au mtu mzima kulegea kabisa ni dalili ya Malaria Kali (Cerebral Malaria). Piga 112 au fika kituo cha dharura.',
      ]);
      summary = 'Uchunguzi wa haraka wa Malaria (mRDT/BS) na kurejesha maji mwilini.';
    } else if (category === 'headache') {
      clinicalAssessment = pickRandom([
        `Maumivu ya kichwa yanaweza kusababishwa na msongo wa mawazo (tension headache), uchovu wa macho kutokana na simu/kompyuta, upungufu wa maji, au kupanda kwa shinikizo la damu.`,
        `Kichwa kuuma mara nyingi hutokana na kubana kwa mishipa ya damu au misuli ya shingo na paji la uso.`,
        `Ikiwa maumivu yameambatana na homa au kizunguzungu, ni kiashiria cha maambukizi ya awali yanayohitaji mapumziko na uchunguzi.`,
      ]);
      steps = pickMultipleRandom([
        'Pumzika kwa dakika 30-45 kwenye chumba chenye utulivu na giza au mwanga hafifu',
        'Kunywa glasi 2 za maji safi mara moja kurudisha unyevu kwenye mishipa ya fahamu',
        'Punguza matumizi ya simu na skrini zenye mwangaza mkali unaoumiza macho',
        'Pima shinikizo la damu (BP) kuhakikisha halijapanda ghafla',
        'Ongea na daktari wa Vanguard Tele-Clinic iwapo maumivu hayapungui baada ya saa moja',
      ], 3);
      emergencyWarning = pickRandom([
        '⚠️ TAHADHARI YA DHARURA / RED FLAG: Ikiwa maumivu ya kichwa yameambatana na shingo kukakamaa (stiff neck), kutoona vizuri, udhaifu upande mmoja wa mwili, au kutapika kwa nguvu, fika hospitali mara moja!',
        '⚠️ TAHADHARI: Maumivu makali yasiyowahi kutokea maishani (thunderclap headache) yanahitaji dharura ya hospitali mara moja.',
      ]);
      summary = 'Tathmini ya maumivu ya kichwa na udhibiti wa shinikizo la damu.';
    } else if (category === 'gastro') {
      clinicalAssessment = pickRandom([
        `Mchafuko wa tumbo, kuhara, au kutapika mara nyingi husababishwa na vimelea vya chakula (food poisoning), ameba, au maambukizi ya Salmonella (Typhoid). Hatari kubwa zaidi ni mwili kupoteza maji na madini (electrolytes).`,
        `Kuhara au tumbo kukata ni mwitikio wa mfumo wa mmeng'enyo kujisafisha dhidi ya sumu au bakteria wa chakula.`,
      ]);
      steps = pickMultipleRandom([
        'Changanya pakiti moja ya ORS kwenye lita 1 ya maji safi yaliyochemshwa na kupoa, kunywa kikombe kimoja kila baada ya kutoa choo cha maji',
        'Kula vyakula laini visivyo na mafuta mengi kama supu nyepesi, uji wa chumvi, au ndizi mbivu',
        'Epuka kumeza dawa za kuzuia choo (kama Loperamide) kama kuna homa au choo chenye damu',
        'Fanya kipimo cha choo (stool analysis) na hadubini ya damu kama maumivu yataendelea zaidi ya masaa 24',
        'Nawa mikono kwa sabuni na maji tiririka kabla ya kula na baada ya choo',
      ], 3);
      emergencyWarning = pickRandom([
        '⚠️ TAHADHARI YA DHARURA: Ikiwa unatapika mfululizo kiasi cha kushindwa kunywa maji, una choo chenye damu, au macho yamelegea na kukauka kabisa mate, fika kituo cha afya mara moja!',
        '⚠️ ILANI YA DHARURA: Upungufu mkubwa wa maji (severe dehydration) unahitaji drip ya haraka hospitalini. Piga 112 au fika kituo cha dharura.',
      ]);
      summary = 'Urejeshaji wa maji (ORS) na matunzo ya mfumo wa mmeng\'enyo.';
    } else if (category === 'pediatric') {
      clinicalAssessment = pickRandom([
        `Afya na chanjo za mtoto ndio msingi thabiti wa ukuaji. Ratiba ya Taifa ya Chanjo ya Wizara ya Afya (EPI) inamlinda mwanao dhidi ya magonjwa hatari kama Surua, Rubella, Polio, na Nimonia.`,
        `Katika umri wa utotoni, mfumo wa kinga hujengwa kupitia chanjo kwa wakati na lishe bora ya maziwa ya mama. Homa ndogo baada ya chanjo ni dalili ya mwili kujenga kinga.`,
      ]);
      steps = pickMultipleRandom([
        'Hakikisha unatembelea kliniki ya RCH ukiwa na kadi ya mtoto (RCH-1 Card)',
        'Endelea kumnyonyesha mtoto mara kwa mara kumpa maji, nguvu, na kinga ya asili',
        'Mvalishe nguo nyepesi za pamba iwapo ana joto kidogo; epuka kumfunika kupita kiasi',
        'Wasiliana na Daktari Bingwa wa Watoto Dr. Josephat Shirima kupitia mfumo wetu wa Vanguard kwa ushauri binafsi',
        'Fuata ratiba ya dozi ya miezi 9 (Surua/Rubella) na miezi 18 bila kuruka',
      ], 3);
      emergencyWarning = pickRandom([
        '⚠️ TAHADHARI YA DHARURA: Kama mtoto anapata degedege (convulsions), analia bila kukoma zaidi ya masaa 3, anavimba uso au anashindwa kunyonya kabisa, fika hospitali ya CCBRT au Muhimbili mara moja!',
        '⚠️ ILANI YA MTOTO: Mtoto kulegea ghafla au kushindwa kupumua ni dharura kubwa inayohitaji kuonwa na daktari wa watoto papo hapo.',
      ]);
      summary = 'Mwongozo wa chanjo na matunzo ya mtoto kulingana na miongozo ya MoH.';
    } else {
      // General dynamic query
      clinicalAssessment = pickRandom([
        `Nimechambua hoja yako ya kiafya: "${query}". Kwa mazingira yetu, ni muhimu kuangazia sababu za msingi badala ya kuficha dalili pekee.`,
        `Kuhusu "${query}", mwili unapotoa ishara hizi unahitaji uwiano wa mapumziko, lishe sahihi, na ufuatiliaji wa kina.`,
        `Kama mshauri wako wa Vanguard, nimepima maelezo yako sambamba na wasifu wako wa afya ili kukuongoza vyema.`,
      ]);
      steps = pickMultipleRandom([
        'Weka kumbukumbu ya dalili na muda wake kwenye ukurasa wa Kumbukumbu za Afya',
        'Hakikisha unapata mapumziko ya kutosha na kunywa maji safi lita 2.5 kwa siku',
        'Ongea moja kwa moja na Daktari Mkuu au Bingwa kupitia mfumo wa simu ya dakika 30 (TZS 1,000)',
        'Epuka kutumia mchanganyiko wa dawa bila ushauri wa kitaalamu wa mfamasia au daktari',
        'Tembelea kituo cha afya kilicho karibu kwa uchunguzi iwapo hali itaendelea zaidi ya masaa 24',
      ], 3);
      emergencyWarning = pickRandom([
        '⚠️ TAHADHARI YA DHARURA: Dalili zikibadilika na kuwa kali ghafla kama kupumua kwa shida au kupoteza fahamu, piga 112 / 115 au fika hospitali kubwa mara moja.',
        '⚠️ ILANI YA DHARURA: Katika dharura yoyote ya kiafya, usisite kufika kituo cha afya kilicho karibu au kupiga 112.',
      ]);
      summary = 'Ushauri wa jumla wa kliniki na ufuatiliaji wa dalili.';
    }

    const responseText = `${greeting}

Tathmini ya Kliniki:
• ${empathyPhrase}
• ${clinicalAssessment}${chronicNote}

Mwongozo wa Hatua kwa Hatua:
${steps.map((st, i) => `${i + 1}. ${st}`).join('\n')}

${emergencyWarning}`;

    return {
      text: responseText,
      assessment: {
        severity,
        summary,
        steps,
        emergencyWarning,
        suggestedAction,
      },
    };
  } else {
    // ENGLISH DYNAMIC PHRASING
    greeting = pickRandom([
      `Hello ${userName}. Thank you for reaching out to Vanguard MedTech.`,
      `Good day ${userName}. I have received and carefully analyzed your health inquiry.`,
      `Hello ${userName}. I am sorry to hear you are dealing with these symptoms today.`,
      `Greetings ${userName}. As your Vanguard clinical companion, I am actively reviewing your inquiry.`,
      `Hello ${userName}. Let's look closely into what you've described and formulate a clear clinical action plan.`,
    ]);

    empathyPhrase = pickRandom([
      `Experiencing symptoms like "${query}" can be physically distressing and warrants structured evaluation.`,
      `Your report of "${query}" indicates an active physical response that should be methodically monitored.`,
      `Physical discomforts of this nature disrupt daily routines and require timely clinical attention.`,
      `Evaluating this symptom presentation alongside your profile (Age: ${age}, Gender: ${gender}) helps guide safe next steps.`,
    ]);

    if (hasSickleCell) {
      chronicNote = pickRandom([
        `\n• ⚠️ SICKLE CELL ALERT: With documented sickle cell history, prompt hydration and early medical assessment are critical to prevent acute vaso-occlusive crisis or hemolytic stress.`,
        `\n• ⚠️ SICKLE CELL PROTOCOL: Monitor temperature and fluid intake strictly; avoid exposure to cold drafts or intense physical exertion.`,
      ]);
    } else if (hasHypertension) {
      chronicNote = pickRandom([
        `\n• ⚠️ CARDIOVASCULAR / BP ALERT: With documented hypertension, please record your blood pressure immediately using a digital cuff before taking any pain relief medications.`,
        `\n• ⚠️ HYPERTENSION SURVEILLANCE: Physical distress or pain can trigger acute blood pressure elevations. Check your readings in the Vanguard Health Tracker.`,
      ]);
    } else if (hasDiabetes) {
      chronicNote = pickRandom([
        `\n• ⚠️ DIABETES MONITORING: Check your capillary blood glucose reading (target fasting: 4.0 - 7.0 mmol/L). Avoid sugary syrups or over-the-counter sweetened cough mixtures.`,
        `\n• ⚠️ GLYCEMIC ALERT: Stay well-hydrated to support renal clearance of excess glucose and metabolic metabolites.`,
      ]);
    } else if (hasAsthma) {
      chronicNote = pickRandom([
        `\n• ⚠️ ASTHMA CARE: Keep your fast-acting rescue inhaler (Salbutamol) readily accessible and steer clear of dust, smoke, or sudden cold air exposure.`,
      ]);
    }

    if (category === 'cardiac') {
      clinicalAssessment = pickRandom([
        `Chest discomfort, tightness, or pressure radiating into the arm, neck, or back requires high-priority triage to rule out acute cardiac ischemia or pulmonary distress.`,
        `Retrosternal pressure is a vital red flag symptom that demands immediate diagnostic verification via 12-lead ECG and cardiac enzyme evaluation.`,
      ]);
      steps = pickMultipleRandom([
        'Assume a seated, supported upright or semi-reclined resting position immediately',
        'Loosen restrictive clothing around collar, neck, and chest to facilitate easy breathing',
        'Avoid any physical exertion, walking upstairs, or self-driving to a health facility',
        'Dispatch emergency transport to a 24/7 center with cardiac diagnostics (such as JKCI or Muhimbili)',
        'Alert a family member or emergency contact to assist with immediate transit',
      ], 3);
      emergencyWarning = pickRandom([
        '⚠️ EMERGENCY TRIAGE WARNING / TAHADHARI YA DHARURA: If you experience crushing pressure, cold perspiration, dizziness, or cyanosis (bluish lips), dial 112 / 115 immediately or report to Jakaya Kikwete Cardiac Institute (JKCI) or Muhimbili Emergency!',
        '⚠️ CRITICAL RED FLAG: Acute chest pain accompanied by breathlessness warrants immediate emergency resuscitation dispatch. Do not wait.',
      ]);
      summary = 'High-priority cardiovascular and respiratory triage protocol activated.';
    } else if (category === 'malaria_fever') {
      clinicalAssessment = pickRandom([
        `In Tanzania and the East African coastal basin, acute fever accompanied by chills, rigors, or body aches strongly points toward Plasmodium falciparum malaria or bacterial infection.`,
        `Febrile illness with rigors indicates a systemic immune response. Diagnostic verification via blood testing is clinically required before initiating antimalarial therapy.`,
        `Elevated body temperature accelerates fluid and electrolyte depletion, resulting in fatigue, headaches, and muscle aches.`,
      ]);
      steps = pickMultipleRandom([
        'Drink 2.5 to 3 liters of safe fluids daily (water, Oral Rehydration Salts, or coconut water) to prevent dehydration',
        'Obtain a certified rapid diagnostic test (mRDT) or blood smear (BS for MPS) at a nearby clinic within 2 hours',
        'Take Paracetamol for thermal relief as directed (avoid Aspirin or NSAIDs until dengue is excluded)',
        'Apply lukewarm water sponge cloths (tepid sponging) to forehead, armpits, and groin to assist gradual cooling',
        'Consult our Vanguard on-call General Practitioner to verify prescription once your lab results are ready',
      ], 3);
      emergencyWarning = pickRandom([
        '⚠️ EMERGENCY TRIAGE WARNING / TAHADHARI YA DHARURA: If you experience persistent vomiting (inability to retain fluids for >6 hours), altered consciousness, convulsions, or jaundice (yellow eyes), proceed immediately to Muhimbili National Hospital Emergency!',
        '⚠️ RED FLAG ALERT: Convulsions (degedege) or extreme lethargy in a febrile patient requires immediate hospital admission for severe malaria management.',
      ]);
      summary = 'Acute febrile syndrome investigation (mRDT / blood smear) and fluid replacement.';
    } else if (category === 'headache') {
      clinicalAssessment = pickRandom([
        `Headaches often arise from tension, cervical muscle strain, dehydration, excessive digital screen exposure, or secondary to vascular blood pressure elevations.`,
        `Cephalea can stem from cranial vasodilation or stress-related muscular contraction around the temples and occiput.`,
        `When accompanied by fever or fatigue, a headache can be an early prodromal sign of tropical infection or dehydration.`,
      ]);
      steps = pickMultipleRandom([
        'Rest in a quiet, dark, well-ventilated room for 30 to 45 minutes to relieve sensory strain',
        'Drink two full glasses of clean water immediately to counteract acute vascular dehydration',
        'Reduce exposure to bright smartphone or computer screens and LED glare',
        'Measure your blood pressure with a digital cuff to ensure readings are within normal range',
        'Book a 15-minute consultation with a Vanguard doctor if pain persists above 6/10 on the pain scale',
      ], 3);
      emergencyWarning = pickRandom([
        '⚠️ EMERGENCY TRIAGE WARNING / TAHADHARI YA DHARURA: If the headache is sudden and explosively severe ("thunderclap"), or accompanied by stiff neck, confusion, high fever, or facial weakness, seek immediate emergency care!',
        '⚠️ RED FLAG: Neurological symptoms like speech changes or limb weakness require urgent hospital assessment.',
      ]);
      summary = 'Acute cephalea evaluation, hydration, and cardiovascular baseline check.';
    } else if (category === 'gastro') {
      clinicalAssessment = pickRandom([
        `Gastrointestinal distress, loose stools, or vomiting commonly result from food-borne enteropathogens, amoebiasis, or Salmonella (Typhoid). The primary clinical risk is hypovolemic dehydration.`,
        `Gastroenteritis causes accelerated fluid and electrolyte loss that must be promptly replenished to maintain renal perfusion.`,
      ]);
      steps = pickMultipleRandom([
        'Dissolve 1 packet of WHO-standard ORS into 1 liter of safe drinking water and consume 200mL after each loose stool',
        'Follow a bland, low-fat diet (bananas, rice, clear bone broth, or toast) and avoid dairy products temporarily',
        'Avoid antimotility medications (like Loperamide) if you have high fever or notice blood in your stool',
        'Submit a stool sample for microscopy and culture at a nearby laboratory if symptoms exceed 24 hours',
        'Practice rigorous hand hygiene with soap and running water before food handling',
      ], 3);
      emergencyWarning = pickRandom([
        '⚠️ EMERGENCY TRIAGE WARNING: If you cannot keep any oral fluids down for over 8 hours, notice blood in your stool, or experience intense localized right lower abdomen pain, go to a 24/7 clinic immediately!',
        '⚠️ RED FLAG: Signs of severe dehydration (sunken eyes, dry mouth, absence of urination) require emergency IV fluid resuscitation.',
      ]);
      summary = 'Acute gastroenteritis management, oral electrolyte rehydration, and stool diagnostics.';
    } else if (category === 'pediatric') {
      clinicalAssessment = pickRandom([
        `Childhood immunization and routine monitoring form the bedrock of early developmental health. The Tanzania Ministry of Health (MoH / EPI) schedule protects against measles, rubella, pneumonia, and polio.`,
        `Pediatric immune development requires timely vaccines and adequate maternal nutrition. Mild reactive fever post-immunization is a benign sign of antibody formation.`,
      ]);
      steps = pickMultipleRandom([
        'Always bring the Reproductive and Child Health card (RCH-1) to every clinic appointment',
        'Continue frequent breastfeeding to supply antibodies, fluid hydration, and comfort',
        'Dress the child in lightweight cotton clothing; avoid heavy wrapping if they feel warm',
        'Consult our lead pediatrician Dr. Josephat Shirima on Vanguard Tele-Clinic for personalized growth checks',
        'Ensure the 9-month Measles/Rubella (MR1) and 18-month MR2 booster milestones are strictly observed',
      ], 3);
      emergencyWarning = pickRandom([
        '⚠️ EMERGENCY TRIAGE WARNING: If the infant has continuous high-pitched crying for >3 hours, convulsions, facial swelling, or refusal to breastfeed, proceed to CCBRT or Muhimbili Emergency immediately!',
        '⚠️ PEDIATRIC RED FLAG: Stridor, chest indrawing, or extreme lethargy requires instant emergency room attention.',
      ]);
      summary = 'Pediatric immunization guidance and post-vaccine clinical monitoring.';
    } else {
      clinicalAssessment = pickRandom([
        `I have reviewed your clinical inquiry: "${query}". In primary care, investigating root lifestyle and infectious triggers is essential for long-term health.`,
        `Regarding "${query}", taking structured early steps helps avoid complications and promotes prompt physical recovery.`,
        `Your query has been evaluated against your patient profile to provide safe, actionable health guidance.`,
      ]);
      steps = pickMultipleRandom([
        'Record the progression and duration of your symptoms in the Vanguard Health Tracker',
        'Ensure restorative rest and maintain hydration by drinking at least 2.5 liters of clean water daily',
        'Connect directly with our licensed on-call General Practitioner for a private 30-minute consultation (TZS 1,000)',
        'Avoid unverified over-the-counter combinations without professional pharmacist or physician review',
        'Visit a nearby certified health facility if symptoms persist or intensify over the next 24 hours',
      ], 3);
      emergencyWarning = pickRandom([
        '⚠️ EMERGENCY TRIAGE WARNING / TAHADHARI YA DHARURA: If you experience acute breathlessness, sudden severe pain, or loss of consciousness, dial 112 / 115 immediately or visit nearest emergency facility.',
        '⚠️ RED FLAG: In any life-threatening emergency, proceed directly to Muhimbili National Hospital or Aga Khan Emergency.',
      ]);
      summary = 'Primary clinical advisory and symptom surveillance.';
    }

    const responseText = `${greeting}

Clinical Assessment:
• ${empathyPhrase}
• ${clinicalAssessment}${chronicNote}

Step-by-Step Care Guide:
${steps.map((st, i) => `${i + 1}. ${st}`).join('\n')}

${emergencyWarning}`;

    return {
      text: responseText,
      assessment: {
        severity,
        summary,
        steps,
        emergencyWarning,
        suggestedAction,
      },
    };
  }
}
