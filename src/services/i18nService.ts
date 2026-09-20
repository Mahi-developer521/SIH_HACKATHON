import { Language } from '../types/surveillance';

export const TRANSLATIONS = {
  en: {
    // App Brand & Headers
    brandTitle: 'Pashu-Suraksha AI',
    brandSubtitle: 'Livestock Disease Surveillance & Response Platform',
    nationalSystem: 'National Integrated Animal Health Intelligence System',
    online: 'Online',
    offline: 'Offline Mode (Local Storage)',
    offlineAlert: 'Offline mode active: Case reports will be stored in your local outbox and synced automatically when reconnected.',
    syncNow: 'Sync Outbox Now',
    syncedSuccess: 'Outbox synchronized with central database successfully!',
    outboxCount: 'Queued Reports',
    logout: 'Logout',
    switchRole: 'Switch Role',

    // Roles
    farmer: 'Farmer',
    vet: 'Veterinary Officer',
    fieldWorker: 'Field Worker',
    labStaff: 'Lab Staff',
    flowInspector: 'Master 32-Step Flow',

    // Status
    activeOutbreak: 'Active Outbreak',
    controlled: 'Controlled',
    contained: 'Outbreak Contained',

    // Farmer
    reportSickAnimal: 'Report Sick / Dead Animal',
    reportAnotherCase: 'Report Another Case / Animal',
    myHerd: 'My Animals & Herd',
    myCases: 'My Reported Cases',
    nearbyAlerts: 'Nearby Alerts & Warnings',
    advisories: 'Preventive Advisories',
    species: 'Species',
    totalHerd: 'Total Herd',
    sickCount: 'Number Sick',
    deadCount: 'Number Dead',
    symptomsTitle: 'Observed Symptoms',
    voiceMemo: 'Voice Recording',
    recordVoice: 'Record Voice Memo',
    listening: 'Listening (Speak now)...',
    autoTranscript: 'Automated Speech-to-Text Transcript',
    lesionPhoto: 'Lesion / Animal Photo',
    gpsVerified: 'GPS Verification',
    submitReport: 'Submit Report to AI Surveillance Engine',
    saveOffline: 'Save to Offline Outbox (No Internet)',

    // Camera & Photo Scanner
    cameraUpload: 'Camera & Photo Scanner',
    openCamera: 'Open Live Camera',
    closeCamera: 'Close Camera',
    takeSnapshot: 'Capture Photo',
    uploadPhoto: 'Upload Photo from Device',
    aiVisualDiagnosis: 'AI Visual Lesion Screening',
    reportWithThisPhoto: 'Report Case With This Photo',
    retakePhoto: 'Retake / Choose Another',
    cameraInstructions: 'Point camera at mouth, hooves, or skin lesions. Keep still for sharp AI diagnostic screening.',

    // Symptoms
    symptom_fever: 'High Fever',
    symptom_oralBlisters: 'Blisters / Vesicles on Tongue & Muzzle',
    symptom_hoofBlisters: 'Blisters on Hooves / Coronary Band',
    symptom_drooling: 'Excessive Drooling / Salivation',
    symptom_lameness: 'Severe Lameness / Inability to Stand',
    symptom_nodules: 'Skin Nodules / Lumps (Lumpy Skin Pattern)',
    symptom_respiratory: 'Respiratory Distress / Nasal Discharge',
    symptom_milkDrop: 'Reduced Milk Yield',
    symptom_anorexia: 'Sudden Anorexia / Reduced Feeding',
    symptom_diarrhea: 'Abdominal Pain / Diarrhea',
    symptom_death: 'Unexplained Sudden Death',

    // Vet
    commandCenter: 'Veterinary Epidemiological Command Center',
    aiAlerts: 'AI Alerts & Clusters',
    createMission: 'Investigate & Assign Field Worker',
    authorizeIntervention: 'Authorize Ring Vaccination',
    vaccinationGaps: 'Vaccination Gap Tracking',
    deficitWarning: 'CRITICAL VACCINATION DEFICIT GAP',

    // Field Worker
    fieldDashboard: 'Field Surveillance Worker Dashboard',
    assignedMissions: 'Assigned Response Missions',
    startInvestigation: 'Start On-Site Examination & Sample Collection',
    sampleCollection: 'Biological Sample Collection',
    dispatchToLab: 'Dispatch Sample to Lab',

    // Lab
    labPortal: 'Diagnostic Laboratory Portal',
    sampleQueue: 'Inbound Biological Specimen Queue',
    runAssay: 'Run Diagnostic Assay & Enter Results',
    certifyResult: 'Certify & Transmit Result to Vet Officer',
    positive: 'POSITIVE',
    negative: 'NEGATIVE',
    inconclusive: 'INCONCLUSIVE',

    // GIS
    gisControls: 'GIS Layer Controls',
    riskZones: 'High-Risk Zones',
    diseaseClusters: 'Disease Clusters',
    diseaseCases: 'Reported Disease Cases',
    vaccinationLayer: 'Vaccination Gaps',
    villagesLayer: 'Villages & Demographics',
    farmersLayer: 'Registered Livestock Owners',
    facilitiesLayer: 'Veterinary Hospitals & Clinics',
    labLayer: 'Diagnostic Laboratories (RDDL)',
    weatherLayer: 'Weather & Vector Layer',

    // Common Actions
    close: 'Close',
    details: 'View Details',
    step: 'Step'
  },

  hi: {
    // App Brand & Headers
    brandTitle: 'पशु-सुरक्षा एआई (Pashu-Suraksha AI)',
    brandSubtitle: 'पशु रोग निगरानी एवं त्वरित प्रतिक्रिया प्रणाली',
    nationalSystem: 'राष्ट्रीय एकीकृत पशु स्वास्थ्य बुद्धिमत्ता प्रणाली',
    online: 'ऑनलाइन (सक्रिय)',
    offline: 'ऑफलाइन मोड (स्थानीय संग्रहण)',
    offlineAlert: 'ऑफलाइन मोड सक्रिय: आपकी रिपोर्ट आउटबॉक्स में सुरक्षित है और इंटरनेट जुड़ने पर स्वतः सिंक हो जाएगी।',
    syncNow: 'अभी सिंक करें',
    syncedSuccess: 'आउटबॉक्स की रिपोर्ट केंद्रीय डेटाबेस में सफलतापूर्वक सिंक हो गईं!',
    outboxCount: 'प्रतीक्षारत रिपोर्ट',
    logout: 'लॉगआउट',
    switchRole: 'भूमिका बदलें',

    // Roles
    farmer: '👨‍🌾 किसान',
    vet: '👨‍⚕️ पशु चिकित्सक',
    fieldWorker: '👷 फील्ड कार्यकर्ता',
    labStaff: '🧪 प्रयोगशाला स्टाफ',
    flowInspector: '🧭 32-चरण मास्टर प्रवाह',

    // Status
    activeOutbreak: 'सक्रिय प्रकोप (हाई रिस्क)',
    controlled: 'नियंत्रित',
    contained: 'प्रकोप पूर्णतः नियंत्रित',

    // Farmer
    reportSickAnimal: 'बीमार या मृत पशु की रिपोर्ट करें',
    reportAnotherCase: 'एक और पशु / मामले की रिपोर्ट करें',
    myHerd: 'मेरे पशु और टीकाकरण',
    myCases: 'मेरी दर्ज की गई रिपोर्ट',
    nearbyAlerts: 'आसपास के रोग अलर्ट व चेतावनियां',
    advisories: 'सुरक्षात्मक सलाह व सावधानियां',
    species: 'पशु की प्रजाति',
    totalHerd: 'कुल पशु संख्या',
    sickCount: 'बीमार पशु',
    deadCount: 'मृत पशु',
    symptomsTitle: 'देखे गए लक्षण (क्लिक करें)',
    voiceMemo: 'आवाज रिकॉर्डिंग (बोलकर बताएं)',
    recordVoice: 'वॉयस संदेश रिकॉर्ड करें',
    listening: 'सुन रहे हैं (कृपया बोलें)...',
    autoTranscript: 'स्वचालित वॉयस-टू-टेक्स्ट प्रतिलेख',
    lesionPhoto: 'घाव या फफोले की फोटो',
    gpsVerified: 'जीपीएस स्थान सत्यापन',
    submitReport: 'एआई निगरानी प्रणाली को रिपोर्ट भेजें',
    saveOffline: 'ऑफलाइन आउटबॉक्स में सुरक्षित करें',

    // Camera & Photo Scanner
    cameraUpload: 'कैमरा व फोटो स्कैनर',
    openCamera: 'लाइव कैमरा खोलें',
    closeCamera: 'कैमरा बंद करें',
    takeSnapshot: 'फोटो खींचें',
    uploadPhoto: 'डिवाइस से फोटो अपलोड करें',
    aiVisualDiagnosis: 'एआई दृश्य घाव परीक्षण',
    reportWithThisPhoto: 'इस फोटो के साथ रिपोर्ट दर्ज करें',
    retakePhoto: 'दूसरा फोटो चुनें',
    cameraInstructions: 'कैमरा पशु के मुंह, खुर या त्वचा के घाव पर रखें। स्पष्ट फोटो के लिए स्थिर रखें।',

    // Symptoms
    symptom_fever: 'तेज़ बुखार (High Fever)',
    symptom_oralBlisters: 'मुंह व जीभ में छाले/फफोले (Mouth Blisters)',
    symptom_hoofBlisters: 'खुरों में छाले व घाव (Hoof Blisters)',
    symptom_drooling: 'मुंह से अत्यधिक लार गिरना (Drooling)',
    symptom_lameness: 'गंभीर लंगड़ापन / चलने में असमर्थ (Lameness)',
    symptom_nodules: 'त्वचा पर गांठें (लम्पी स्किन पैटर्न)',
    symptom_respiratory: 'सांस लेने में कठिनाई / नाक बहना',
    symptom_milkDrop: 'दूध उत्पादन में भारी गिरावट',
    symptom_anorexia: 'चारा न खाना / सुस्ती',
    symptom_diarrhea: 'पेट दर्द / दस्त',
    symptom_death: 'अचानक अस्पष्टीकृत मृत्यु',

    // Vet
    commandCenter: 'पशु चिकित्सा महामारी नियंत्रण केंद्र',
    aiAlerts: 'एआई रोग अलर्ट एवं क्लस्टर',
    createMission: 'फील्ड कार्यकर्ता को जांच कार्य सौंपें',
    authorizeIntervention: 'घेरा टीकाकरण (रिंग वैक्सीनेशन) अधिकृत करें',
    vaccinationGaps: 'टीकाकरण अंतराल निगरानी',
    deficitWarning: 'अत्यंत गंभीर टीकाकरण अंतर (खतरा)',

    // Field Worker
    fieldDashboard: 'फील्ड जांच एवं नमूना संग्रहण पोर्टल',
    assignedMissions: 'सौंपे गए जांच मिशन',
    startInvestigation: 'मौके पर जांच एवं नमूना संग्रहण शुरू करें',
    sampleCollection: 'जैविक नमूना संग्रहण (ब्लड/स्वैब)',
    dispatchToLab: 'नमूना प्रयोगशाला को भेजें',

    // Lab
    labPortal: 'क्षेत्रीय रोग निदान प्रयोगशाला (RDDL)',
    sampleQueue: 'आगमन जैविक नमूना परीक्षण कतार',
    runAssay: 'आरटी-पीसीआर / एलिसा परीक्षण करें',
    certifyResult: 'प्रमाणित रिपोर्ट पशु चिकित्सक को भेजें',
    positive: 'पॉजिटिव (संक्रमित)',
    negative: 'नेगेटिव (असंक्रमित)',
    inconclusive: 'अस्पष्ट',

    // GIS
    gisControls: 'जीआईएस मानचित्र परतें',
    riskZones: 'उच्च जोखिम वाले क्षेत्र (लाल जोन)',
    diseaseClusters: 'रोग क्लस्टर (CL-001)',
    diseaseCases: 'दर्ज किए गए रोग के मामले',
    vaccinationLayer: 'टीकाकरण अंतराल (44% चेतावनी)',
    villagesLayer: 'गांव एवं जनसंख्या',
    farmersLayer: 'पंजीकृत पशुपालक किसान',
    facilitiesLayer: 'पशु चिकित्सालय एवं औषधालय',
    labLayer: 'निदान प्रयोगशालाएं',
    weatherLayer: 'मौसम एवं कीट जोखिम परत',

    // Common Actions
    close: 'बंद करें',
    details: 'विवरण देखें',
    step: 'चरण'
  },

  mr: {
    // App Brand & Headers
    brandTitle: 'पशू-सुरक्षा एआय (Pashu-Suraksha AI)',
    brandSubtitle: 'पशू रोग पाळत व जलद प्रतिसाद प्रणाली',
    nationalSystem: 'राष्ट्रीय एकात्मिक पशू आरोग्य बुद्धिमत्ता प्रणाली',
    online: 'ऑनलाइन (सक्रिय)',
    offline: 'ऑफलाइन मोड (स्थानिक साठवण)',
    offlineAlert: 'ऑफलाइन मोड सक्रिय: आपली नोंद स्थानिक आउटबॉक्समध्ये जतन केली जाईल व इंटरनेट पूर्ववत झाल्यावर आपोआप सिंक होईल.',
    syncNow: 'आता सिंक करा',
    syncedSuccess: 'आउटबॉक्समधील प्रकरणे मुख्य डेटाबेसमध्ये यशस्वीपणे सिंक झाली!',
    outboxCount: 'प्रलंबित नोंदी',
    logout: 'लॉगआउट',
    switchRole: 'भूमिका बदला',

    // Roles
    farmer: '👨‍🌾 शेतकरी / पशुपालक',
    vet: '👨‍⚕️ पशुवैद्यकीय अधिकारी',
    fieldWorker: '👷 क्षेत्र तपासणी अधिकारी',
    labStaff: '🧪 प्रयोगशाळा कर्मचारी',
    flowInspector: '🧭 ३२-टप्पे संपूर्ण प्रवाह',

    // Status
    activeOutbreak: 'सक्रिय उद्रेक (धोकादायक)',
    controlled: 'नियंत्रणात',
    contained: 'उद्रेक पूर्णपणे आटोक्यात',

    // Farmer
    reportSickAnimal: 'आजारी / मृत जनावराची नोंद करा',
    reportAnotherCase: 'आणखी एका जनावराची नोंद करा',
    myHerd: 'माझी जनावरे व लसीकरण स्थिती',
    myCases: 'माझ्या नोंदवलेल्या केसेस',
    nearbyAlerts: 'परिसरातील रोग अलर्ट व इशारे',
    advisories: 'प्रतिबंधक सल्ला व मार्गदर्शक सूचना',
    species: 'जनावराचा प्रकार',
    totalHerd: 'एकूण जनावरे',
    sickCount: 'आजारी संख्या',
    deadCount: 'मृत संख्या',
    symptomsTitle: 'दिसून आलेली लक्षणे (निवडा)',
    voiceMemo: 'आवाज रेकॉर्डिंग (बोलून सांगा)',
    recordVoice: 'आवाज संदेश रेकॉर्ड करा',
    listening: 'ऐकत आहे (कृपया बोला)...',
    autoTranscript: 'स्वयंचलित मजकूर (स्पीच-टू-टेक्स्ट)',
    lesionPhoto: 'जखमेचा किंवा फोडांचा फोटो',
    gpsVerified: 'जीपीएस स्थान पडताळणी',
    submitReport: 'एआई पाळत प्रणालीकडे नोंद सादर करा',
    saveOffline: 'ऑफलाइन जतन करा (इंटरनेटशिवाय)',

    // Camera & Photo Scanner
    cameraUpload: 'कॅमेरा व फोटो स्कॅनर',
    openCamera: 'थेट कॅमेरा सुरू करा',
    closeCamera: 'कॅमेरा बंद करा',
    takeSnapshot: 'फोटो काढा',
    uploadPhoto: 'डिव्हाइसवरून फोटो अपलोड करा',
    aiVisualDiagnosis: 'एआय दृश्य व्रण तपासणी',
    reportWithThisPhoto: 'या फोटोसह नोंद करा',
    retakePhoto: 'दुसरा फोटो निवडा',
    cameraInstructions: 'जनावराच्या तोंडातील फोड, खूर किंवा त्वचेवरील जखमांवर कॅमेरा धरा. स्पष्ट फोटोसाठी स्थिर ठेवा.',

    // Symptoms
    symptom_fever: 'तीव्र ताप (High Fever)',
    symptom_oralBlisters: 'तोंडातील व जिभेवरील फोड (Mouth Blisters)',
    symptom_hoofBlisters: 'खुरांमधील फोड व जखमा (Hoof Blisters)',
    symptom_drooling: 'तोंडातून सतत लाळ गळणे (Drooling)',
    symptom_lameness: 'गंभीर लंगडणे / उभे राहता न येणे (Lameness)',
    symptom_nodules: 'त्वचेवर गाठी (लम्पी स्किन पॅटर्न)',
    symptom_respiratory: 'श्वास घेण्यास त्रास / नाकातून स्त्राव',
    symptom_milkDrop: 'दूध उत्पादनात अचानक मोठी घट',
    symptom_anorexia: 'चारा न खाणे / भूक मंदावणे',
    symptom_diarrhea: 'पोटदुखी / पातळ शौचास होणे',
    symptom_death: 'अचानक संशयास्पद मृत्यू',

    // Vet
    commandCenter: 'पशुवैद्यकीय साथरोग नियंत्रण कक्ष',
    aiAlerts: 'एआय रोग अलर्ट व क्लस्टर्स',
    createMission: 'क्षेत्र कर्मचाऱ्यास तपासणी नेमून द्या',
    authorizeIntervention: 'रिंग लसीकरण व क्वारंटाईन मंजूर करा',
    vaccinationGaps: 'लसीकरण तूट व अंतर नियंत्रण',
    deficitWarning: 'गंभीर लसीकरण तूट (धोका)',

    // Field Worker
    fieldDashboard: 'क्षेत्र तपासणी व नमुना संकलन कक्ष',
    assignedMissions: 'नेमून दिलेले तपासणी मिशन',
    startInvestigation: 'घटनास्थळी प्रत्यक्ष तपासणी व नमुना संकलन',
    sampleCollection: 'जैविक नमुना संकलन (रक्त/स्वॅब)',
    dispatchToLab: 'नमुना प्रयोगशाळेकडे रवाना करा',

    // Lab
    labPortal: 'प्रादेशिक रोग निदान प्रयोगशाळा (RDDL)',
    sampleQueue: 'प्राप्त जैविक नमुने तपासणी रांग',
    runAssay: 'आरटी-पीसीआर / एलिसा चाचणी करा',
    certifyResult: 'प्रमाणित अहवाल पशुवैद्यकास पाठवा',
    positive: 'पॉझिटिव्ह (संसर्ग आढळला)',
    negative: 'निगेटिव्ह (संसर्ग नाही)',
    inconclusive: 'अनिर्णित',

    // GIS
    gisControls: 'जीआयएस नकाशा स्तर',
    riskZones: 'उच्च-धोका क्षेत्र (लाल वर्तुळ)',
    diseaseClusters: 'रोग क्लस्टर (CL-001)',
    diseaseCases: 'नोंदवलेली रोग प्रकरणे',
    vaccinationLayer: 'लसीकरण तूट स्तर (४४% इशारा)',
    villagesLayer: 'गावे व लोकसंख्या',
    farmersLayer: 'नोंदणीकृत पशुपालक',
    facilitiesLayer: 'पशुवैद्यकीय रुग्णालये व दवाखाने',
    labLayer: 'निदान प्रयोगशाळा (RDDL)',
    weatherLayer: 'हवामान व कीटक प्रादुर्भाव स्तर',

    // Common Actions
    close: 'बंद करा',
    details: 'तपशील पहा',
    step: 'टप्पा'
  }
};

export class I18nService {
  static get(lang: Language, key: keyof typeof TRANSLATIONS['en']): string {
    const langDict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return (langDict as any)[key] || (TRANSLATIONS.en as any)[key] || key;
  }
}
