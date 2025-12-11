const { useState, useEffect } = React;
const { AlertCircle, Phone, User, Calendar, Clock, FileText, Edit3, Lock, LogOut } = lucide;

const DentalTriageApp = () => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [isDoctor, setIsDoctor] = useState(false);
  const [patientData, setPatientData] = useState({
    personalInfo: {},
    answers: {},
    score: 0,
    status: 'pending',
    id: null
  });
  const [formData, setFormData] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentRoute, setCurrentRoute] = useState(null);
  const [showStimulusQuestion, setShowStimulusQuestion] = useState(false);
  const [allAnswers, setAllAnswers] = useState({});
  const [selectedHealthConditions, setSelectedHealthConditions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescriptionNumber, setPrescriptionNumber] = useState('');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const triageData = {
    personalInformation: [
      { id: 'national_id', label: 'رقم الهوية', type: 'text', placeholder: '10 أرقام' },
      { id: 'full_name', label: 'الاسم الثلاثي', type: 'text', placeholder: 'الاسم الأول الأب العائلة' },
      { id: 'age', label: 'العمر', type: 'number' },
      { id: 'mobile', label: 'رقم الجوال', type: 'tel', placeholder: '05XXXXXXXX' },
      { id: 'gender', label: 'الجنس', type: 'radio', options: [{ value: 'male', label: 'ذكر' }, { value: 'female', label: 'أنثى' }] }
    ],
    criticalQuestion: {
      question: 'هل تعاني من أياً من هذه الأعراض الآن؟',
      options: [
        { id: 1, text: 'صعوبة شديدة ومفاجئة في التنفس والبلع', value: 'breathing', emergency: true },
        { id: 2, text: 'نزيف لا يتوقف بالضغط لمدة 10 دقائق', value: 'bleeding', emergency: true },
        { id: 3, text: 'تورم كبير ينتشر إلى الرقبة أو العين', value: 'swelling', emergency: true },
        { id: 4, text: 'لا، أخرى', value: 'none', emergency: false }
      ]
    },
    mainProblem: {
      question: 'ما هي المشكلة الرئيسية؟',
      options: [
        { id: 1, text: 'ألم شديد', value: 'pain', route: 'pain' },
        { id: 2, text: 'تورم / خراج', value: 'swelling', route: 'swelling' },
        { id: 3, text: 'كسر بالأسنان', value: 'fracture', route: 'fracture' },
        { id: 4, text: 'سقوط حشوة أو تركيبة', value: 'filling', route: 'filling' },
        { id: 5, text: 'أخرى', value: 'other', route: 'other' }
      ]
    },
    routes: {
      pain: [
        { id: 'pain_location', text: 'هل يمكنك تحديد مكان الألم بوضوح؟', options: [
          { text: 'نعم، سن محدد', value: 'specific', score: 0 },
          { text: 'لا، ألم عام في الفك أو الوجه', value: 'general', score: 3 },
          { text: 'ألم ينتشر من سن إلى الرأس/الأذن', value: 'radiating', score: 5 }
        ]},
        { id: 'pain_severity', text: 'مدى شدة الألم؟', options: [
          { text: 'خفيف', value: 'mild', score: 3 },
          { text: 'متوسط', value: 'moderate', score: 6 },
          { text: 'شديد', value: 'severe', score: 9 }
        ]},
        { id: 'pain_stimulus', text: 'هل الألم بسبب المحفزات (ماء بارد، قهوة ساخنة، هواء) يزول بسرعة؟', options: [
          { text: 'يزول الألم فوراً أو بعد ثوانٍ قليلة', value: 'immediate', score: 3 },
          { text: 'يستمر الألم طويلاً (أكثر من دقيقة)', value: 'prolonged', score: 7 },
          { text: 'الألم مستمر في جميع الأوقات', value: 'constant', score: 10 }
        ]},
        { id: 'pain_sleep', text: 'هل الألم يوقظك من النوم؟', options: [
          { text: 'نعم', value: 'yes', score: 8 },
          { text: 'لا', value: 'no', score: 0 }
        ]}
      ],
      swelling: [
        { id: 'swelling_fever', text: 'هل لديك ارتفاع في درجة الحرارة (حمى)؟', options: [
          { text: 'نعم', value: 'yes', score: 10 },
          { text: 'لا', value: 'no', score: 0 }
        ]},
        { id: 'swelling_impact', text: 'هل التورم يؤثر على فتح فمك أو البلع؟', options: [
          { text: 'نعم', value: 'yes', score: 9 },
          { text: 'لا', value: 'no', score: 0 }
        ]},
        { id: 'swelling_location', text: 'هل التورم يقع داخل الفم (بالقرب من اللثة أو الأسنان) أم على جلد الوجه أو الرقبة؟', options: [
          { text: 'داخل الفم فقط', value: 'intraoral', score: 5 },
          { text: 'خارج الفم (على الوجه أو الرقبة)', value: 'extraoral', score: 10 }
        ]},
        { id: 'swelling_consistency', text: 'هل الانتفاخ طري ويمكن الضغط عليه (كأنه يحوي سائلاً) أم صلب؟', options: [
          { text: 'طري', value: 'soft', score: 6 },
          { text: 'صلب', value: 'hard', score: 8 }
        ]}
      ],
      fracture: [
        { id: 'fracture_blood', text: 'هل تشاهد بقعة حمراء أو دموية صغيرة في الكسر؟', options: [
          { text: 'نعم', value: 'yes', score: 8 },
          { text: 'لا', value: 'no', score: 0 }
        ]},
        { id: 'fracture_sensitivity', text: 'هل الكسر يسبب حساسية فورية ومؤلمة جداً عند تعرضه للهواء أو الماء؟', options: [
          { text: 'نعم', value: 'yes', score: 7 },
          { text: 'لا', value: 'no', score: 0 }
        ]},
        { id: 'fracture_pain', text: 'هل الكسر مصحوب بألم مستمر شديد (حتى بدون لمس)؟', options: [
          { text: 'نعم', value: 'yes', score: 9 },
          { text: 'لا', value: 'no', score: 0 }
        ]}
      ],
      filling: [
        { id: 'filling_type', text: 'ما الذي سقط تحديداً؟', options: [
          { text: 'حشوة بسيطة', value: 'simple_filling', score: 3 },
          { text: 'تاج (غطاء) سن', value: 'crown', score: 5 },
          { text: 'جسر أو تركيبة طويلة', value: 'bridge', score: 6 }
        ]},
        { id: 'filling_pain', text: 'هل هذا مصحوب بألم أو بدون ألم؟', options: [
          { text: 'مع ألم', value: 'with_pain', score: 5 },
          { text: 'بدون ألم', value: 'no_pain', score: 0 }
        ]}
      ],
      other: []
    },
    healthConditions: [
      { text: 'حساسية من دواء أو مضاد', value: 'allergy', score: 5 },
      { text: 'مشاكل صحية مزمنة', value: 'chronic', score: 5 },
      { text: 'أتناول أدوية مسيلة للدم', value: 'blood_thinners', score: 8 },
      { text: 'حامل', value: 'pregnant', score: 7, femaleOnly: true },
      { text: 'لا يوجد', value: 'none', score: 0 }
    ]
  };

  useEffect(() => {
    const savedPatients = JSON.parse(localStorage.getItem('dentalPatients') || '[]');
    setPatients(savedPatients);
  }, []);

  const savePatient = (data) => {
    const savedPatients = JSON.parse(localStorage.getItem('dentalPatients') || '[]');
    const newPatient = {
      ...data,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    savedPatients.push(newPatient);
    localStorage.setItem('dentalPatients', JSON.stringify(savedPatients));
    setPatients(savedPatients);
    return newPatient.id;
  };

  const updatePatient = (id, updates) => {
    const savedPatients = JSON.parse(localStorage.getItem('dentalPatients') || '[]');
    const updatedPatients = savedPatients.map(p => 
      p.id === id ? { ...p, ...updates, status: 'reviewed' } : p
    );
    localStorage.setItem('dentalPatients', JSON.stringify(updatedPatients));
    setPatients(updatedPatients);
  };

  const handleLogin = () => {
    if (loginForm.username === 'doctor' && loginForm.password === '1234') {
      setIsDoctor(true);
      setCurrentStep('doctor_dashboard');
    } else {
      alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const handlePersonalInfo = () => {
    if (Object.keys(formData).length >= 5) {
      setPatientData(prev => ({ ...prev, personalInfo: formData }));
      setCurrentStep('critical_question');
    } else {
      alert('يرجى ملء جميع الحقول');
    }
  };

  const handleCriticalQuestion = (option) => {
    if (option.emergency) {
      setCurrentStep('emergency');
    } else {
      setCurrentStep('main_problem');
    }
  };

  const handleMainProblem = (option) => {
    setPatientData(prev => ({ ...prev, mainProblem: option.value }));
    if (option.route === 'other') {
      setCurrentStep('health_conditions');
    } else {
      setCurrentRoute(option.route);
      setCurrentQuestionIndex(0);
      setCurrentStep('route_questions');
    }
  };

  const handleRouteAnswer = (option) => {
    const currentQuestion = triageData.routes[currentRoute][currentQuestionIndex];
    
    setAllAnswers(prev => ({ ...prev, [currentQuestion.id]: option.value }));
    setPatientData(prev => ({ 
      ...prev, 
      score: prev.score + (option.score || 0),
      answers: { ...prev.answers, [currentQuestion.id]: option.value }
    }));

    if (currentRoute === 'pain' && currentQuestionIndex === 0) {
      if (option.value === 'specific') {
        setShowStimulusQuestion(true);
      } else {
        setShowStimulusQuestion(false);
      }
    }

    const nextIndex = currentQuestionIndex + 1;
    const routeQuestions = triageData.routes[currentRoute];

    if (nextIndex < routeQuestions.length) {
      if (currentRoute === 'pain' && nextIndex === 2 && !showStimulusQuestion) {
        if (nextIndex + 1 < routeQuestions.length) {
          setCurrentQuestionIndex(nextIndex + 1);
        } else {
          setCurrentStep('health_conditions');
        }
      } else {
        setCurrentQuestionIndex(nextIndex);
      }
    } else {
      setCurrentStep('health_conditions');
    }
  };

  const submitHealthConditions = () => {
    let additionalScore = 0;
    selectedHealthConditions.forEach(condition => {
      const data = triageData.healthConditions.find(c => c.value === condition);
      if (data?.score) additionalScore += data.score;
    });
    
    const finalData = {
      ...patientData,
      score: patientData.score + additionalScore,
      healthConditions: selectedHealthConditions
    };
    
    const patientId = savePatient(finalData);
    setPatientData(prev => ({ ...prev, id: patientId }));
    setCurrentStep('waiting_review');
  };

  const checkPatientStatus = () => {
    const savedPatients = JSON.parse(localStorage.getItem('dentalPatients') || '[]');
    const patient = savedPatients.find(p => p.id === patientData.id);
    if (patient && patient.status === 'reviewed') {
      setPatientData(patient);
      setCurrentStep('patient_results');
    }
  };

  const resetApp = () => {
    setCurrentStep('welcome');
    setPatientData({ personalInfo: {}, answers: {}, score: 0, status: 'pending', id: null });
    setFormData({});
    setAllAnswers({});
    setSelectedHealthConditions([]);
    setCurrentRoute(null);
    setCurrentQuestionIndex(0);
    setShowStimulusQuestion(false);
  };

‎  // باقي الكود في الرد التالي...
  
  return React.createElement('div', { className: 'app' }, 'جاري التحميل...');
};

ReactDOM.render(React.createElement(DentalTriageApp), document.getElementById('root'));
