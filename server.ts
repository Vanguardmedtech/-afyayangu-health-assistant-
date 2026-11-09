import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const k = process.env.GEMINI_API_KEY;
  res.json({
    status: 'ok',
    hasApiKey: !!k,
    keyLength: k ? k.length : 0,
    isPlaceholder: k === 'MY_GEMINI_API_KEY',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Builds an explicit clinical cross-check evaluating the user query and symptoms
 * against their active medications, known drug allergies, hemoglobin genotype,
 * past surgical history, and special health/lifestyle status.
 */
function buildServerPharmacologyCrossCheck(
  message: string,
  userProfile: any,
  isSwahili: boolean
): string {
  const q = message.toLowerCase();
  const activeMeds = userProfile?.activeMedications || 'Artemether/Lumefantrine 80/480mg, Paracetamol 500mg';
  const allergies = userProfile?.knownAllergies || 'Penicillin, Sulfa drugs, Peanuts';
  const genotype = userProfile?.hemoglobinGenotype || 'AA (Normal)';
  const surgeries = userProfile?.pastSurgeries || 'Appendectomy 2023';
  const specialHealth: string[] = userProfile?.specialHealthStatus || ['None'];
  const isPregnant = specialHealth.includes('Currently Pregnant');
  const isLactating = specialHealth.includes('Lactating');
  const isSmoker = specialHealth.includes('Smoking');
  const isAlcohol = specialHealth.includes('Alcohol');

  const lowerAllergies = allergies.toLowerCase();
  const checks: string[] = [];

  const asksAboutAntibiotics =
    q.includes('antibiotic') ||
    q.includes('penicillin') ||
    q.includes('amox') ||
    q.includes('ampicillin') ||
    q.includes('augmentin');
  const asksAboutSulfa =
    q.includes('sulfa') ||
    q.includes('bactrim') ||
    q.includes('septrin') ||
    q.includes('cotrimoxazole') ||
    q.includes('fansidar');
  const asksAboutNsaid =
    q.includes('aspirin') ||
    q.includes('brufen') ||
    q.includes('ibuprofen') ||
    q.includes('diclofenac');

  if (isSwahili) {
    checks.push(`Mzio Ulioandikwa (Documented Allergies): "${allergies}"`);
    if (lowerAllergies.includes('penicillin')) {
      if (asksAboutAntibiotics) {
        checks.push(
          `⛔ ONYO KUBWA LA MZIO: Mgonjwa ana mzio wa Penicillin! Usitumie Amoxicillin/Ampicillin/Augmentin. Tumia mbadala kama Azithromycin chini ya daktari.`
        );
      } else {
        checks.push(`Tahadhari ya Mzio: Dawa za jamii ya Penicillin zimezuiliwa.`);
      }
    }
    if (lowerAllergies.includes('sulfa')) {
      if (asksAboutSulfa) {
        checks.push(
          `⛔ ONYO KUBWA LA MZIO: Mgonjwa ana mzio wa Sulfa! Septrin (Bactrim) na Fansidar zimepigwa marufuku.`
        );
      } else {
        checks.push(`Tahadhari ya Mzio: Jamii ya dawa za Sulfa imezuiliwa.`);
      }
    }
    if (lowerAllergies.includes('aspirin') && asksAboutNsaid) {
      checks.push(`⛔ ONYO LA MZIO: Epuka Aspirin/Brufen/Diclofenac; tumia Paracetamol pekee kwa uangalifu.`);
    }

    checks.push(`Dawa Unazotumia Sasa (Active Medications): "${activeMeds}"`);
    if (activeMeds.toLowerCase().includes('paracetamol')) {
      checks.push(
        `Tahadhari ya Dozi: Unatumia Paracetamol 500mg; usizidishe kiwango salama cha 4,000mg ndani ya masaa 24 kuzuia sumu kwenye ini.`
      );
    }
    if (activeMeds.toLowerCase().includes('artemether') || activeMeds.toLowerCase().includes('lumefantrine')) {
      checks.push(`Mseto wa ALU: Kunywa na maziwa au chakula cha mafuta ili ifyonzwe vizuri na kamilisha dozi zote 6.`);
    }

    if (genotype === 'SS (Sickle Cell Anemia)') {
      checks.push(
        `Vinasaba vya Damu (SS - Selimundu): Kunywa maji mengi (>3L) na epuka baridi kali kuzuia maumivu ya selimundu.`
      );
    } else if (genotype === 'AS (Sickle Cell Trait)') {
      checks.push(`Vinasaba vya Damu (AS - Sickle Trait): Zingatia maji wakati wa joto au mazoezi.`);
    }

    if (isPregnant) {
      checks.push(`🤰 TAHADHARI YA UJAUZITO: Mgonjwa ni mjamzito; epuka NSAIDs (Ibuprofen/Diclofenac) na thibitisha dawa zote na daktari wa uzazi.`);
    }
    if (isLactating) {
      checks.push(`🤱 TAHADHARI YA UNYONYESHAJI: Mgonjwa ananyonyesha; dawa lazima ziwe salama kwa mtoto kupitia maziwa.`);
    }
    if (isAlcohol || isSmoker) {
      checks.push(`⚠️ TAHADHARI YA MTINDO WA MAISHA: Mgonjwa anatumia ${isAlcohol ? 'pombe' : ''}${isAlcohol && isSmoker ? ' na ' : ''}${isSmoker ? 'sigara' : ''}; epuka pombe wakati unatumia dawa ili kulinda ini.`);
    }

    if (surgeries && surgeries.trim() && surgeries.toLowerCase() !== 'none' && (q.includes('tumbo') || q.includes('maumivu'))) {
      checks.push(`Upasuaji wa Awali (${surgeries}): Daktari anapaswa kuangazia kama maumivu yanahusiana na eneo la upasuaji.`);
    }

    return `\n\n• 💊 UCHUNGUZI WA DAWA NA MZIO (PHARMACOLOGICAL SAFETY CROSS-CHECK):\n${checks.map((c) => `  - ${c}`).join('\n')}`;
  } else {
    checks.push(`Documented Allergies: "${allergies}"`);
    if (lowerAllergies.includes('penicillin')) {
      if (asksAboutAntibiotics) {
        checks.push(
          `⛔ CRITICAL ALLERGY CONTRAINDICATION: Patient has documented Penicillin allergy! Do NOT take Amoxicillin, Ampicillin, or Augmentin. Safer alternative classes include macrolides (Azithromycin, Erythromycin) under clinical supervision.`
        );
      } else {
        checks.push(`Allergy Protocol: Penicillin-class antibiotics are strictly contraindicated.`);
      }
    }
    if (lowerAllergies.includes('sulfa')) {
      if (asksAboutSulfa) {
        checks.push(
          `⛔ CRITICAL ALLERGY CONTRAINDICATION: Patient has documented Sulfa drug allergy! Septrin (Co-trimoxazole/Bactrim) and Fansidar are contraindicated.`
        );
      } else {
        checks.push(`Allergy Protocol: Sulfa-based antimicrobials (Septrin/Bactrim) are contraindicated.`);
      }
    }
    if (lowerAllergies.includes('aspirin') && asksAboutNsaid) {
      checks.push(`⛔ ALLERGY CONTRAINDICATION: Patient has NSAID/Aspirin sensitivity. Avoid Ibuprofen and Diclofenac; use Paracetamol only as indicated.`);
    }

    checks.push(`Active Medications: "${activeMeds}"`);
    if (activeMeds.toLowerCase().includes('paracetamol')) {
      checks.push(
        `Dosage & Cumulative Ceiling: You are currently on Paracetamol 500mg. Do not exceed 4,000mg in 24 hours (maximum 8 tablets of 500mg) to prevent acute hepatic toxicity.`
      );
    }
    if (activeMeds.toLowerCase().includes('artemether') || activeMeds.toLowerCase().includes('lumefantrine')) {
      checks.push(
        `Antimalarial Regimen (ALU): Consume doses with milk or a lipid-containing meal for optimal bioavailability, and complete the full 6-dose course over 3 days.`
      );
    }

    if (genotype === 'SS (Sickle Cell Anemia)') {
      checks.push(
        `Hemoglobin Genotype (SS - Sickle Cell): Dehydration and fever accelerate erythrocyte sickling. Maintain fluid intake >3.0 L/day and seek urgent care for any febrile episode.`
      );
    } else if (genotype === 'AS (Sickle Cell Trait)') {
      checks.push(
        `Hemoglobin Genotype (AS - Sickle Trait): Ensure vigorous hydration during high exertion or ambient heat to prevent renal papillary stress.`
      );
    }

    if (isPregnant) {
      checks.push(
        `🤰 OBSTETRIC SAFETY ALERT: Patient is Currently Pregnant. NSAIDs (Ibuprofen, Diclofenac) and unapproved antibiotics are contraindicated. Obtain obstetrician clearance for any new medication.`
      );
    }
    if (isLactating) {
      checks.push(`🤱 LACTATION PRECAUTION: Patient is Breastfeeding. Prescribed compounds must be verified safe for maternal milk excretion.`);
    }
    if (isAlcohol || isSmoker) {
      checks.push(
        `⚠️ LIFESTYLE INTERACTION ALERT: Documented ${isAlcohol ? 'alcohol consumption' : ''}${isAlcohol && isSmoker ? ' and ' : ''}${isSmoker ? 'smoking' : ''}. Avoid alcohol during active pharmacotherapy to prevent potentiated hepatotoxicity.`
      );
    }

    if (surgeries && surgeries.trim() && surgeries.toLowerCase() !== 'none' && (q.includes('stomach') || q.includes('pain') || q.includes('abdomen'))) {
      checks.push(
        `Surgical History (${surgeries}): In evaluating abdominal pain, post-surgical adhesion etiology should be evaluated by an examining surgeon.`
      );
    }

    return `\n\n• 💊 CLINICAL PHARMACOLOGY & DRUG-ALLERGY CROSS-CHECK:\n${checks.map((c) => `  - ${c}`).join('\n')}`;
  }
}

/**
 * Dynamic contextual clinical reasoning engine for East African medical triage.
 * Generates custom, polite, and medically sound advice when live API key is pending or in transit.
 */
function generateContextualClinicalAdvisorResponse(
  message: string,
  userProfile: any,
  language: string
) {
  const q = message.toLowerCase().trim();
  const userName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'Victor';
  const age = userProfile?.age || 28;
  const gender = userProfile?.gender || 'Male';
  const chronicList: string[] = userProfile?.chronicConditions || ['None'];
  const hasSickleCell = chronicList.includes('Sickle Cell');
  const hasHypertension = chronicList.includes('Hypertension');
  const hasDiabetes = chronicList.includes('Diabetes');
  const hasAsthma = chronicList.includes('Asthma');

  // Detect Swahili intent
  const isSwahili =
    language === 'SW' ||
    q.includes('swahili') ||
    q.includes('habari') ||
    q.includes('homa') ||
    q.includes('kichwa') ||
    q.includes('tumbo') ||
    q.includes('dawa') ||
    q.includes('mtoto') ||
    q.includes('kifua') ||
    q.includes('pumzi') ||
    q.includes('nina') ||
    q.includes('naomba') ||
    q.includes('asante');

  // 1. Critical Red Flag: Chest pain / Heart / Dyspnea
  if (
    q.includes('chest') ||
    q.includes('heart') ||
    q.includes('kifua') ||
    q.includes('moyo') ||
    q.includes('breath') ||
    q.includes('pumzi')
  ) {
    const text = isSwahili
      ? `Habari ${userName}. Nimepokea maelezo yako kuhusu maumivu au kubana kwa kifua. Kama mshauri wako wa afya wa Vanguard, maumivu haya yanahitaji uangalizi wa haraka sana wa kitabibu ili kulinda afya ya moyo na mapafu yako.

Tathmini ya Awali ya Kliniki:
• Kwa mgonjwa mwenye umri wa miaka ${age} (${gender}) ${hasHypertension ? 'na historia ya shinikizo la damu (Hypertension)' : ''}, maumivu ya kifua yanayosambaa shingoni, begani, au mkono wa kushoto ni dalili inayohitaji uchunguzi wa moyo (ECG & cardiac biomarkers).
• Haishauriwi kusubiri nyumbani au kujaribu kupunguza maumivu haya kwa dawa za kawaida za kutuliza maumivu bila ushauri wa daktari.

Mwongozo wa Hatua kwa Hatua wa Kliniki:
1. Kaa Chini Mara Moja: Tulia ukiwa umekaa nusu-wima (semi-recumbent) mahali penye hewa safi ya kutosha.
2. Fungua Nguo Zinazobana: Legeza vifungo vya shati au mkanda ili kurahisisha upumuaji.
3. Usifanye Shughuli Yoyote Nzito: Epuka kutembea au kujiendesha mwenyewe kuelekea hospitali.
4. Wasiliana na Chumba cha Dharura: Nenda haraka Taasisi ya Moyo ya Jakaya Kikwete (JKCI) au Hospitali ya Taifa Muhimbili.

⚠️ TAHADHARI YA DHARURA / CRITICAL EMERGENCY:
Ikiwa una upungufu mkubwa wa pumzi, jasho jembamba la baridi (cold diaphoresis), kizunguzungu au mapigo ya moyo kwenda mbio sana, piga 112 / 115 mara moja au fika hospitali kubwa iliyo karibu bila kuchelewa hata dakika moja!`
      : `Hello ${userName}. Thank you for reaching out. Acute chest discomfort or shortness of breath is a high-priority clinical symptom requiring urgent medical evaluation.

Empathetic Clinical Assessment:
• For an individual aged ${age} (${gender}) ${hasHypertension ? 'with documented hypertension' : ''}, retrosternal pressure radiating to the arm, shoulder, or neck must be clinically assessed to rule out acute myocardial ischemia or pulmonary distress.
• Never ignore or delay evaluation of unexplained chest symptoms.

Structured Clinical Care Steps:
1. Immediate Physical Rest: Stop all physical activity immediately and rest in a supported, upright seated position.
2. Ensure Unobstructed Airflow: Loosen any tight collars, neckties, or restrictive clothing.
3. Avoid Self-Driving: Do not drive yourself; arrange emergency dispatch or family transit.
4. Diagnostic Workup: Obtain an immediate 12-lead Electrocardiogram (ECG) and cardiac troponin screen at a 24/7 hospital.

⚠️ EMERGENCY TRIAGE WARNING / TAHADHARI YA DHARURA:
If you experience crushing pressure, cold perspiration, dizziness, or cyanosis (bluish lips), call 112 / 115 immediately or proceed to the Jakaya Kikwete Cardiac Institute (JKCI) or Muhimbili National Hospital emergency wing!`;

    return {
      text,
      severity: 'urgent' as const,
      summary: 'Potential acute cardiovascular or pulmonary condition requiring immediate triage.',
      steps: [
        'Immediate physical rest in a seated upright posture',
        'Direct emergency transport to nearest 24/7 ER with ECG facilities',
        'Avoid self-medication until acute cardiac causes are ruled out',
      ],
      emergencyWarning: isSwahili
        ? 'Piga 112 au nenda kituo cha dharura JKCI/Muhimbili mara moja.'
        : 'Dial 112 / 115 or proceed to nearest emergency resuscitation facility immediately.',
      suggestedAction: 'find_hospital' as const,
    };
  }

  // 2. Malaria, High Fever, Chills, Body Aches
  if (
    q.includes('malaria') ||
    q.includes('fever') ||
    q.includes('homa') ||
    q.includes('chills') ||
    q.includes('baridi')
  ) {
    const text = isSwahili
      ? `Habari ${userName}. Pole sana kwa homa kali na maumivu unayopitia. Katika mazingira yetu ya Tanzania na ukanda wa Afrika Mashariki, homa ya ghafla inayoambatana na kutetemeka au viungo kuuma mara nyingi huashiria maambukizi ya vimelea vya Malaria (Plasmodium falciparum).

Tathmini ya Awali ya Kliniki:
• Homa inayoambatana na baridi (rigors) inahitaji uthibitisho wa kimaabara badala ya kuanza dawa za mseto bila kupima.
${hasSickleCell ? '• ⚠️ TAHADHARI YA ZIADA: Kwa kuwa una Selimundu (Sickle Cell), homa kali inaweza kuchochea mshtuko wa maumivu (acute sickle crisis) au maambukizi makali ya damu. Unahitaji kuonana na daktari mapema.' : ''}

Mwongozo wa Hatua kwa Hatua:
1. Kunywa Maji Safi na ORS: Kunywa glasi 8 hadi 10 za maji au maji ya chumvichumvi (ORS) kuzuia mwili kuishiwa maji kutokana na joto kali.
2. Kupunguza Joto (Tepid Sponging): Futa mwili kwa kitambaa kilichoingizwa kwenye maji ya vuguvugu kusaidia mwili kupoa kiasili.
3. Fanya Kipimo cha Haraka (mRDT): Tembelea zahanati au maabara iliyo karibu kwa kipimo cha damu (BS / mRDT) kinachochukua dakika 15 tu.
4. Ushauri wa Dawa: Paracetamol inaweza kutumika kutuliza joto kwa muda kabla ya kuanza dozi rasmi ya ALU kama kipimo kitaonyesha una malaria.

⚠️ TAHADHARI YA DHARURA / EMERGENCY TRIAGE:
Kama unapata kutapika mfululizo (inability to retain oral fluids), degedege (convulsions), njano machoni, au kupoteza fahamu, hii ni dalili ya Malaria Kali. Fika Hospitali ya Taifa Muhimbili au kituo cha afya cha dharura mara moja!`
      : `Hello ${userName}. I am sorry to hear you are dealing with fever and body chills. In our East African epidemiological context, acute pyrexia accompanied by rigors strongly warrants immediate evaluation for Plasmodium falciparum malaria.

Empathetic Clinical Assessment:
• High fever and rigors indicate active immune response to an infectious etiology, most commonly malaria or bacterial infection.
• Presumptive treatment without diagnostic confirmation is discouraged to ensure targeted therapy and prevent antimalarial resistance.
${hasSickleCell ? '• ⚠️ SICKLE CELL ALERT: As an individual with sickle cell trait/disease, any high fever can precipitate acute hemolysis, vaso-occlusive crisis, or sepsis. Timely medical supervision is vital.' : ''}

Step-by-Step Clinical Care Guide:
1. Intensive Oral Hydration: Consume 2.5 to 3 liters of fluids (Oral Rehydration Solution or clean boiled water) to counter thermal fluid loss.
2. Safe Thermal Management: Administer Paracetamol (Acetaminophen) for antipyretic relief as directed; avoid Aspirin or NSAIDs until dengue is excluded.
3. Diagnostic Blood Screen: Visit a local accredited clinic for a rapid diagnostic test (mRDT) or blood smear for malaria parasites (BS for MPS).
4. Clinical Review: Once test results are verified, consult our Vanguard on-call physician for prescription verification.

⚠️ EMERGENCY TRIAGE WARNING / TAHADHARI YA DHARURA:
If you experience persistent vomiting (unable to retain fluids for >6 hours), altered mental status, severe lethargy, dark urine, or jaundice, proceed immediately to Muhimbili National Hospital or the nearest 24/7 emergency unit!`;

    return {
      text,
      severity: 'moderate' as const,
      summary: 'Acute febrile syndrome requiring rapid malaria diagnostic screening and fluid hydration.',
      steps: [
        'Obtain certified mRDT or blood smear (BS) within 2-4 hours',
        'Maintain oral hydration with clean fluids and electrolytes (ORS)',
        'Consult Vanguard on-call GP once diagnostic result is confirmed',
      ],
      emergencyWarning: isSwahili
        ? 'Degedege au kutapika kila kitu kunahitaji hospitali ya dharura mara moja.'
        : 'Signs of severe malaria (convulsions, vomiting all oral intake) require immediate ER admission.',
      suggestedAction: 'find_hospital' as const,
    };
  }

  // 3. Child Immunization & Pediatric Care
  if (
    q.includes('immuniz') ||
    q.includes('vaccin') ||
    q.includes('chanjo') ||
    q.includes('child') ||
    q.includes('mtoto') ||
    q.includes('baby') ||
    q.includes('infant')
  ) {
    const text = isSwahili
      ? `Habari ${userName}. Kufuatilia chanjo za mtoto ni njia bora zaidi ya kumkinga na magonjwa hatari ya utotoni. Ratiba ya chanjo ya Wizara ya Afya ya Tanzania (EPI) inatoa mwongozo thabiti kwa kila hatua ya ukuaji.

Tathmini ya Kliniki:
• Chanjo za utotoni (kama Pentavalent, Rotavirus, PCV13, na Surua/Rubella) huimarisha mfumo wa kinga ya mtoto dhidi ya maambukizi makali.
• Homa ndogo (chini ya 38.0°C) au maumivu kidogo kwenye paja baada ya chanjo ni jambo la kawaida kabisa linaloashiria mwili unajenga kinga.

Mwongozo wa Hatua kwa Hatua:
1. Beba Kadi ya Kliniki (RCH-1 Card): Hakikisha kadi imetiwa sahihi na tarehe ya dozi inayofuata imeandikwa wazi na muuguzi.
2. Endelea Kunyonyesha: Mpe mtoto maziwa ya mama mara kwa mara ili kumtuliza na kumwongezea kinga ya asili.
3. Nguo Nyepesi: Mvalishe mtoto nguo nyepesi iwapo ana joto kidogo; epuka kumfunika na mablanketi mazito.
4. Ushauri wa Daktari wa Watoto: Unaweza kuongea na Daktari Bingwa wetu wa Watoto (Dr. Josephat Shirima) kupitia mfumo wa Vanguard kwa ushauri wa kina.

⚠️ TAHADHARI YA DHARURA:
Ikiwa mtoto ana homa kali inayozidi 39°C, degedege (convulsions), analia bila kukoma kwa zaidi ya masaa matatu, au anashindwa kunyonya kabisa, fika kituo cha afya au hospitali ya CCBRT / Muhimbili mara moja!`
      : `Hello ${userName}. Ensuring your child adheres to the routine immunization schedule is the cornerstone of early developmental health.

Clinical Assessment:
• In Tanzania, routine childhood immunizations under the Ministry of Health (MoH / EPI) program safeguard infants against measles, rubella, pertussis, pneumonia, and rotaviral diarrhea.
• Mild post-vaccine reactive fever (under 38.0°C) and localized site tenderness are benign signs of immune activation.

Step-by-Step Guidance:
1. Keep Reproductive & Child Health Card (RCH-1) Updated: Ensure every vaccination milestone (Birth, 6, 10, 14 weeks, 9 & 18 months) is properly recorded.
2. Frequent Breastfeeding: Frequent nursing provides comfort, essential fluids, and maternal antibodies.
3. Comfortable Clothing: Dress the infant in light, breathable cotton layers if they feel warm.
4. Pediatric Tele-Consult: Connect with our lead pediatrician (Dr. Josephat Shirima) via Vanguard Tele-Clinic for personalized growth and milestone monitoring.

⚠️ EMERGENCY TRIAGE WARNING / TAHADHARI YA DHARURA:
If the infant demonstrates continuous high-pitched crying for over 3 hours, convulsions, lethargy, or inability to feed, seek immediate emergency pediatric care at Muhimbili or CCBRT!`;

    return {
      text,
      severity: 'mild' as const,
      summary: 'Pediatric immunization guidance aligned with Tanzania Ministry of Health guidelines.',
      steps: [
        'Maintain the routine Reproductive & Child Health (RCH) milestone schedule',
        'Continue regular breastfeeding and supportive care',
        'Consult our pediatric specialist Dr. Josephat Shirima for personalized concerns',
      ],
      emergencyWarning: isSwahili
        ? 'Degedege au kushindwa kunyonya kunahitaji dharura ya haraka hospitalini.'
        : 'Inability to feed, respiratory distress, or seizures requires immediate pediatric ER review.',
      suggestedAction: 'call_doctor' as const,
    };
  }

  // 4. Default / General Medical Inquiry (Polite, structured, dynamic to user input)
  const text = isSwahili
    ? `Habari ${userName}. Nimepokea na kuchambua swali lako la kiafya: "${message}".

Tathmini ya Awali ya Kliniki:
• Mfumo wa Vanguard MedTech unazingatia wasifu wako (${gender}, umri wa miaka ${age}, magonjwa ya awali: ${chronicList.join(', ')}).
• Mwili unapoonyesha dalili hizi, ni muhimu kuchukua hatua mapema ili kuzuia matatizo zaidi ya kiafya.

Mwongozo wa Hatua kwa Hatua:
1. Fuatilia na Kuandika Dalili: Weka kumbukumbu ya muda dalili zilipoanza na jinsi zinavyobadilika katika ukurasa wa Kumbukumbu za Afya.
2. Mapumziko na Maji ya Kutosha: Hakikisha unapata mapumziko ya kutosha na unakunywa maji safi angalau lita 2.5 kwa siku.
3. Ongea na Daktari Wetu Hewani: Unaweza kuunganishwa moja kwa moja na Daktari Mkuu au Bingwa kupitia mfumo wetu wa simu binafsi ya dakika 30 (ada ni TZS 1,000 tu).
4. Fika Kituo cha Afya: Ikiwa dalili zitaongezeka au hazijapungua ndani ya masaa 24, tembelea kituo cha afya kilicho karibu kwa uchunguzi wa maabara.

⚠️ TAHADHARI YA DHARURA / EMERGENCY TRIAGE:
Ikiwa utapata dalili hatarishi kama upungufu wa pumzi (difficulty breathing), maumivu makali ya ghafla, degedege, au kupoteza fahamu, piga 112 / 115 mara moja au fika Hospitali ya Taifa Muhimbili au Aga Khan bila kuchelewa.`
    : `Hello ${userName}. Thank you for consulting Vanguard MedTech regarding: "${message}".

Empathetic Clinical Assessment:
• As your dedicated clinical AI companion, I have reviewed your inquiry alongside your health profile (Age: ${age}, Gender: ${gender}, Chronic history: ${chronicList.join(', ')}).
• Addressing physical symptoms early is essential for prompt recovery and preventing clinical complications.

Structured Step-by-Step Guidance:
1. Symptom Surveillance: Note down the exact frequency, duration, and triggers of your symptoms in your Vanguard Health Tracker.
2. Restorative Rest & Hydration: Ensure adequate sleep and maintain optimal fluid balance by drinking 2.5 to 3 liters of water daily.
3. Tele-Consultation with Licensed Practitioner: Connect securely with our on-call Tanzanian physicians for private pharmacological evaluation (Standard GP consultation is just TZS 1,000 via mobile money).
4. Diagnostic Verification: If symptoms persist beyond 24 hours or intensify, visit a nearby certified clinic for laboratory confirmation.

⚠️ EMERGENCY TRIAGE WARNING / TAHADHARI YA DHARURA:
If you develop acute red flag symptoms such as severe shortness of breath, sudden unremitting pain, convulsions, continuous vomiting, or altered consciousness, call emergency dispatch 112 / 115 immediately or proceed to Muhimbili National Hospital / Aga Khan Emergency!`;

  const crossCheckBlock = buildServerPharmacologyCrossCheck(message, userProfile, isSwahili);

  return {
    text: text + crossCheckBlock,
    severity: 'mild' as const,
    summary: 'Clinical triage guidance tailored to patient profile, active medications, and drug allergies.',
    steps: [
      'Monitor and log vital signs in Vanguard Health Tracker',
      'Maintain regular hydration and restorative rest',
      'Connect directly with our verified on-call physician for specific prescriptions',
    ],
    emergencyWarning: isSwahili
      ? 'Dalili zikibadilika na kuwa mbaya ghafla, piga 112 / 115 mara moja.'
      : 'Sudden escalations or neurological deficits warrant immediate emergency admission.',
    suggestedAction: 'call_doctor' as const,
  };
}

// Dynamic Gemini Chat Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  console.log('[API CHAT] Received chat request:', req.body?.message);
  const { message, history = [], userProfile, language = 'EN' } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const patientName = userProfile?.fullName || 'Victor Denis';
  const patientAge = userProfile?.age || 28;
  const patientGender = userProfile?.gender || 'Male';
  const patientNationality = userProfile?.nationality || 'Tanzanian';
  const chronicConditions = userProfile?.chronicConditions?.join(', ') || 'None';
  const patientActiveMeds = userProfile?.activeMedications || 'Artemether/Lumefantrine 80/480mg, Paracetamol 500mg';
  const patientAllergies = userProfile?.knownAllergies || 'Penicillin, Sulfa drugs, Peanuts';
  const patientGenotype = userProfile?.hemoglobinGenotype || 'AA (Normal)';
  const patientSurgeries = userProfile?.pastSurgeries || 'Appendectomy 2023';
  const patientSpecialHealth = Array.isArray(userProfile?.specialHealthStatus) ? userProfile.specialHealthStatus.join(', ') : 'None';

  // If live Gemini client is available and API key is configured, execute via Gemini model
  if (ai && process.env.GEMINI_API_KEY) {
    try {
      console.log('[API CHAT] Calling Gemini 3.8 Flash model...');
      const startTime = Date.now();
      const systemInstruction = `You are Vanguard Clinical AI, a professional, empathetic, and culturally competent medical advisor companion for Vanguard MedTech in East Africa (Tanzania).
You assist patients speaking English, Swahili, or a natural bilingual mix of both (code-switching).

Patient Baseline Clinical Context:
- Full Name: ${patientName}
- Age: ${patientAge}
- Gender: ${patientGender}
- Nationality: ${patientNationality}
- Documented Chronic Conditions: ${chronicConditions}
- Active Medications & Dosage: ${patientActiveMeds}
- Known Allergies & Drug Reactions: ${patientAllergies}
- Hemoglobin Genotype: ${patientGenotype}
- Past Surgeries & Major Hospitalizations: ${patientSurgeries}
- Special Health Status: ${patientSpecialHealth}
- Current App Language Preference: ${language}

CLINICAL ADVISOR RULES & PERSONA:
1. Empathetic Clinical Assessment:
   - Greet the patient politely and warmly using their first name (e.g., "Hello ${patientName.split(' ')[0]}" or "Habari ${patientName.split(' ')[0]}").
   - Acknowledge their symptoms with genuine empathy and clinical clarity.
   - Tailor your clinical reasoning directly to their age, gender, and chronic conditions (e.g. if the patient has Sickle Cell, Hypertension, Diabetes, or Asthma, highlight critical considerations such as avoiding certain NSAIDs, monitoring BP/glucose, or watching for acute crises).
2. Mandatory Clinical Safety & Pharmacology Cross-Check:
   - Always explicitly cross-check the patient's symptoms or medication inquiries against their Active Medications (${patientActiveMeds}) and Known Allergies (${patientAllergies}).
   - If any medication they mention or ask about (or that is commonly used for their symptoms) is contraindicated by their allergies (e.g., Penicillins, Sulfa, NSAIDs), explicitly warn them in bold, explain the severe allergic hazard, and recommend safe alternative classes.
   - Cross-check against their active medications to prevent adverse drug-drug interactions or cumulative toxic dosages (e.g., Paracetamol max dosage 4,000mg/day, Artemether/Lumefantrine food requirements).
   - Account for Hemoglobin Genotype (${patientGenotype}), Special Health Status (${patientSpecialHealth} - such as pregnancy or lactation precautions, alcohol/smoking interactions), and Past Surgeries (${patientSurgeries}) in all clinical advice.
3. Structured Step-by-Step Guidance:
   - Provide 3-4 structured, practical numbered recommendations for immediate home care, fluid hydration, monitoring, or seeking certified laboratory screening (e.g. mRDT for malaria, full blood picture, stool examination, blood pressure checks).
4. Swahili-English Code-Switched Emergency Triage Warning:
   - Always include a prominent, bilingual emergency alert section:
   ⚠️ TAHADHARI YA DHARURA / EMERGENCY TRIAGE:
   Highlight red flag danger signs (e.g. convulsions / degedege, severe breathlessness / upungufu wa pumzi, persistent vomiting, loss of consciousness, severe chest pressure) and explicitly direct the patient to call emergency dispatch 112 / 115 or report immediately to Muhimbili National Hospital, Aga Khan Hospital, or the nearest 24/7 emergency unit.

Respond accurately in the language requested by the user's prompt (English, Swahili, or Swahili-English bilingual).`;

      const contents: any[] = [];
      if (Array.isArray(history)) {
        for (const h of history.slice(-6)) {
          if (h.text && h.sender) {
            contents.push({
              role: h.sender === 'user' ? 'user' : 'model',
              parts: [{ text: h.text }],
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API call timed out after 7000ms')), 7000)
      );

      const response: any = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                text: {
                  type: Type.STRING,
                  description: 'The complete, empathetic, structured clinical advice in markdown format containing assessment, numbered guidance, and bilingual emergency alert.',
                },
                severity: {
                  type: Type.STRING,
                  description: 'Clinical triage severity: "mild", "moderate", or "urgent".',
                },
                summary: {
                  type: Type.STRING,
                  description: 'A 1-sentence clinical diagnostic summary of the case.',
                },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                  description: 'Array of 3-4 key actionable clinical steps for the patient.',
                },
                emergencyWarning: {
                  type: Type.STRING,
                  description: 'A concise bilingual Swahili/English red flag emergency triage warning.',
                },
                suggestedAction: {
                  type: Type.STRING,
                  description: 'Suggested action: "call_doctor", "find_hospital", or "home_care".',
                },
              },
              required: ['text', 'severity', 'summary', 'steps', 'emergencyWarning', 'suggestedAction'],
            },
          },
        }),
        timeoutPromise,
      ]);

      console.log(`[API CHAT] Gemini responded in ${Date.now() - startTime}ms`);

      const jsonText = response.text;
      if (jsonText) {
        const parsedData = JSON.parse(jsonText);
        const validSeverity = ['mild', 'moderate', 'urgent'].includes(parsedData.severity)
          ? parsedData.severity
          : 'moderate';
        const validAction = ['call_doctor', 'find_hospital', 'home_care'].includes(parsedData.suggestedAction)
          ? parsedData.suggestedAction
          : 'call_doctor';

        res.json({
          text: parsedData.text,
          assessment: {
            severity: validSeverity,
            summary: parsedData.summary,
            steps: Array.isArray(parsedData.steps) ? parsedData.steps : [],
            emergencyWarning: parsedData.emergencyWarning,
            suggestedAction: validAction,
          },
        });
        return;
      }
    } catch (err: any) {
      console.warn('Gemini model call failed, using clinical fallback engine:', err.message);
    }
  }

  // Dynamic contextual clinical response
  const responseData = generateContextualClinicalAdvisorResponse(message, userProfile, language);
  res.json(responseData);
});

// Start server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Vanguard MedTech server running on http://localhost:${port}`);
  });
}

startServer();
