/* ============================================
   MAJOR WIT — Main JavaScript
   ============================================ */

'use strict';

// ============================================
// WHATSAPP INTEGRATION
// ============================================
const WA_NUMBER = '917025003600';

function openWhatsAppChat(message = 'Hello MAJOR WIT, I would like to book a free demo class.') {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// ============================================
// SCROLL TO FORUM
// ============================================
function scrollToForum() {
  const forum = document.getElementById('forum');
  if (!forum) return;

  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
  const top = forum.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top, behavior: 'smooth' });
}

// ============================================
// TOAST
// ============================================
const Toast = {
  el: null,
  timer: null,
  init() {
    this.el = document.getElementById('toast');
  },
  show(msg, type = 'success') {
    if (!this.el) return;
    this.el.querySelector('.toast__msg').textContent = msg;
    this.el.className = `toast toast--${type} show`;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.hide(), 3200);
  },
  hide() {
    if (this.el) this.el.classList.remove('show');
  }
};

// ============================================
// NAVIGATION
// ============================================
const Nav = {
  nav: null,
  scrolled: false,

  init() {
    this.nav = document.getElementById('mainNav');

    if (!this.nav) return;

    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });
    this.updateActiveLinks();
    window.addEventListener('scroll', this.updateActiveLinks.bind(this), { passive: true });
  },

  onScroll() {
    const scrolled = window.scrollY > 60;
    if (scrolled !== this.scrolled) {
      this.scrolled = scrolled;
      this.nav.classList.toggle('scrolled', scrolled);
    }
  },

  updateActiveLinks() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });

    document.querySelectorAll('.nav__link').forEach(link => {
      const href = link.getAttribute('href') || '';
      link.classList.toggle('active', href === `#${current}`);
    });
  }
};

// ============================================
// SCROLL REVEAL
// ============================================
const ScrollReveal = {
  observer: null,

  init() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Curl underline animation
          const curls = entry.target.querySelectorAll('.curl-underline');
          curls.forEach(c => {
            setTimeout(() => c.classList.add('animated'), 200);
          });
          this.observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => this.observer.observe(el));

    // Also animate curl-underlines in viewport on load
    setTimeout(() => {
      document.querySelectorAll('.visible .curl-underline').forEach(c => c.classList.add('animated'));
    }, 300);
  }
};

// ============================================
// LOGIN MODAL
// ============================================
const LoginModal = {
  init() {},
  open() {
    scrollToForum();
  }
};

// ============================================
// BOOKING FORM
// ============================================
const BookingForm = {
  init() {
    // Student/Parent toggle
    document.querySelectorAll('.toggle-btn[data-role]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn[data-role]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Slot buttons
    document.querySelectorAll('.slot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Class select → show conditional fields
    const classSelect = document.getElementById('f_class');
    classSelect?.addEventListener('change', () => this.handleClassChange(classSelect.value));

    // Stream select → update subjects
    const streamSelect = document.getElementById('f_stream');
    streamSelect?.addEventListener('change', () => this.handleStreamChange(streamSelect.value));

    // Subjects chips
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => chip.classList.toggle('active'));
    });

    // Form submit
    document.getElementById('bookingFormEl')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submit();
    });
  },

  handleClassChange(val) {
    // Hide all conditional groups
    document.querySelectorAll('.form-conditional').forEach(el => el.classList.remove('visible'));

    if (val === 'school') {
      document.getElementById('cond_syllabus')?.classList.add('visible');
    } else if (val === 'higher') {
      document.getElementById('cond_stream')?.classList.add('visible');
    }
  },

  handleStreamChange(val) {
    document.getElementById('cond_subjects')?.classList.add('visible');
    const subjectGroups = {
      science: ['Mathematics', 'Applied Mathematics', 'Physics', 'Chemistry', 'Biology'],
      commerce: ['Accountancy', 'Business Studies', 'Economics', 'Entrepreneurship'],
      humanities: ['History', 'Political Science', 'Legal Studies', 'Economics']
    };
    const subjects = subjectGroups[val] || [];
    const container = document.getElementById('subjectChips');
    if (container) {
      container.innerHTML = subjects.map(s =>
        `<button type="button" class="chip" data-subject="${s}">${s}</button>`
      ).join('');
      container.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => chip.classList.toggle('active'));
      });
    }
  },

  getFormData() {
    const get = id => document.getElementById(id)?.value.trim() || '';
    const activeRole = document.querySelector('.toggle-btn[data-role].active')?.dataset.role || 'student';
    const activeSlot = document.querySelector('.slot-btn.active')?.dataset.slot || '';
    const selectedSubjects = Array.from(document.querySelectorAll('#subjectChips .chip.active')).map(c => c.dataset.subject);

    return {
      name: get('f_name'),
      phone: get('f_phone'),
      email: get('f_email'),
      role: activeRole,
      class: document.getElementById('f_class')?.value || '',
      syllabus: document.getElementById('f_syllabus')?.value || '',
      stream: document.getElementById('f_stream')?.value || '',
      subjects: selectedSubjects,
      school: get('f_school'),
      slot: activeSlot
    };
  },

  validate(data) {
    if (!data.name) return 'Please enter your full name.';
    if (!data.phone || data.phone.length < 10) return 'Please enter a valid phone number.';
    if (!data.class) return 'Please select your class or programme.';
    return null;
  },

  submit() {
    const data = this.getFormData();
    const error = this.validate(data);
    if (error) { Toast.show(error, 'error'); return; }

    // Build WhatsApp message
    let msg = `Hi MAJOR WIT! 👋 I'd like to book a free demo class.\n\n`;
    msg += `*Name:* ${data.name}\n`;
    msg += `*Phone:* ${data.phone}\n`;
    if (data.email) msg += `*Email:* ${data.email}\n`;
    msg += `*I am a:* ${data.role === 'parent' ? 'Parent' : 'Student'}\n`;
    msg += `*Programme:* ${this.classLabel(data.class)}\n`;
    if (data.syllabus) msg += `*Syllabus:* ${data.syllabus}\n`;
    if (data.stream) msg += `*Stream:* ${data.stream}\n`;
    if (data.subjects.length) msg += `*Subjects:* ${data.subjects.join(', ')}\n`;
    if (data.school) msg += `*Institution:* ${data.school}\n`;
    if (data.slot) msg += `*Preferred Demo Slot:* ${data.slot}\n`;

    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

    // Show success state
    document.getElementById('bookingFormEl')?.classList.add('hidden');
    document.getElementById('formSuccess')?.classList.add('visible');

    // Open WhatsApp
    setTimeout(() => window.open(waUrl, '_blank'), 800);
  },

  classLabel(val) {
    const labels = {
      school: '5th–10th (School Tuition)',
      higher: '11th & 12th',
      ca_foundation: 'CA Foundation',
      ca_inter: 'CA Intermediate',
      ca_final: 'CA Final',
      ielts: 'IELTS',
      pte: 'PTE',
      spoken: 'Spoken English',
      ug_pg: 'UG & PG (B.Com / BBA, etc.)'
    };
    return labels[val] || val;
  }
};

// ============================================
// PROGRAMS TABS
// ============================================
const ProgramsTabs = {
  init() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${target}`)?.classList.add('active');

        // Trigger reveals in new panel
        document.querySelectorAll(`#tab-${target} .reveal`).forEach(el => {
          el.classList.add('visible');
        });
      });
    });
  }
};

// ============================================
// REVIEWS FILTER
// ============================================
const ReviewsFilter = {
  init() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        document.querySelectorAll('.review-card').forEach(card => {
          const show = filter === 'all' || card.dataset.cat === filter;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }
};

// ============================================
// COUNTER ANIMATION
// ============================================
const Counters = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('[data-count]').forEach(el => {
            this.animateCount(el);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stats-row').forEach(el => observer.observe(el));
  },

  animateCount(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  }
};

// ============================================
// REGISTER MODAL + WIZARD
// ============================================
function openRegisterModal() {
  RegisterWizard.open();
}

const RegisterWizard = {
  modal: null,
  stepElements: null,
  state: {
    attendance: null,
    rating: null,
    gender: '',
    classGrade: '',
    board: '',
    boardOther: '',
    stream: '',
    subjects: [],
    preferredBatch: '',
    declarationDate: ''
  },

  init() {
    this.modal = document.getElementById('registerModal');
    this.stepElements = Array.from(this.modal?.querySelectorAll('.modal__step') || []);
    this.bindSubjectCheckboxes();
  },

  open() {
    if (this.isRateLimited()) {
      Toast.show('Application already sent. Please try again after 30 minutes.', 'error');
      return;
    }
    this.reset();
    this.modal?.classList.add('open');
    document.body.classList.add('modal-open');
    document.documentElement.classList.add('modal-open');
    this.goToStep(1);
  },

  close() {
    this.modal?.classList.remove('open');
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
  },

  reset() {
    this.state = {
      attendance: null,
      rating: null,
      gender: '',
      classGrade: '',
      board: '',
      boardOther: '',
      stream: '',
      subjects: [],
      preferredBatch: '',
      declarationDate: ''
    };
    this.stepElements.forEach(el => el.classList.remove('active'));

    const clearIds = [
      'wizardName','wizardDob','wizardSchoolName','wizardClassGrade','wizardBoard','wizardBoardOther',
      'wizardStream','wizardSubjectOther','wizardPrevExam','wizardPreferredTiming','wizardAdmissionDate',
      'wizardParentName','wizardRelationship','wizardOccupation','wizardGuardianPhone','wizardAltPhone',
      'wizardGuardianEmail','wizardAltEmail','wizardAddress','wizardCity','wizardDistrict','wizardState',
      'wizardPin','wizardEmergencyName','wizardEmergencyRelation','wizardEmergencyPhone'
    ];
    clearIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const genderField = document.getElementById('wizardGender');
    if (genderField) genderField.value = '';
    const batchField = document.getElementById('wizardPreferredBatch');
    if (batchField) batchField.value = '';
    document.querySelectorAll('#registerModal input[type="checkbox"]')?.forEach(cb => cb.checked = false);
    document.querySelectorAll('#registerModal .form-checkbox')?.forEach(label => label.classList.remove('active'));
    document.querySelectorAll('#registerModal .modal__option-grid button')?.forEach(btn => btn.classList.remove('active'));
    this.handleClassGradeChange('');
    this.handleBoardChange('');
    this.updateGenderButtons();
    this.updatePreferredBatchButtons();
  },

  goToStep(step) {
    this.stepElements.forEach(el => {
      el.classList.toggle('active', parseInt(el.dataset.step, 10) === step);
    });
    if (step === 7) {
      const today = new Date().toISOString().slice(0, 10);
      const decl = document.getElementById('wizardDeclarationDate');
      if (decl) decl.value = today;
      this.state.declarationDate = today;
    }
  },

  handleAttendance(answer) {
    if (answer === 'no') {
      this.close();
      scrollToForum();
      return;
    }
    this.state.attendance = 'yes';
    this.goToStep(2);
  },

  handleRating(value) {
    this.state.rating = value;
    this.goToStep(3);
  },

  nextFromStudentInfo() {
    const name = document.getElementById('wizardName')?.value.trim();
    const dob = document.getElementById('wizardDob')?.value;
    const gender = this.state.gender;
    if (!name) { Toast.show('Please enter the student name.', 'error'); return; }
    if (!dob) { Toast.show('Please enter the date of birth.', 'error'); return; }
    if (!gender) { Toast.show('Please select gender.', 'error'); return; }
    this.goToStep(4);
  },

  nextFromEducation() {
    const classGrade = document.getElementById('wizardClassGrade')?.value;
    const board = document.getElementById('wizardBoard')?.value;
    const boardOther = document.getElementById('wizardBoardOther')?.value.trim();
    if (!classGrade) { Toast.show('Please select class or grade.', 'error'); return; }
    if (!board) { Toast.show('Please select board.', 'error'); return; }
    if (board === 'Other' && !boardOther) { Toast.show('Please specify the other board.', 'error'); return; }
    if (classGrade === '11th & 12th' && !document.getElementById('wizardStream')?.value) {
      Toast.show('Please select your stream.', 'error'); return;
    }
    this.state.classGrade = classGrade;
    this.state.board = board;
    this.state.boardOther = boardOther;
    this.state.stream = document.getElementById('wizardStream')?.value || '';
    this.goToStep(5);
  },

  nextFromFamily() {
    const guardianPhone = document.getElementById('wizardGuardianPhone')?.value.trim();
    if (!guardianPhone || guardianPhone.length < 10) { Toast.show('Please enter a valid guardian WhatsApp number.', 'error'); return; }
    this.goToStep(6);
  },

  nextFromLocation() {
    const address = document.getElementById('wizardAddress')?.value.trim();
    const city = document.getElementById('wizardCity')?.value.trim();
    const district = document.getElementById('wizardDistrict')?.value.trim();
    const state = document.getElementById('wizardState')?.value.trim();
    const pin = document.getElementById('wizardPin')?.value.trim();
    const emergencyName = document.getElementById('wizardEmergencyName')?.value.trim();
    const emergencyPhone = document.getElementById('wizardEmergencyPhone')?.value.trim();
    if (!address || !city || !district || !state || !pin) { Toast.show('Please complete your address details.', 'error'); return; }
    if (!emergencyName || !emergencyPhone) { Toast.show('Please provide emergency contact details.', 'error'); return; }
    this.goToStep(7);
  },

  setGender(value) {
    this.state.gender = value;
    const field = document.getElementById('wizardGender');
    if (field) field.value = value;
    this.updateGenderButtons();
  },

  updateGenderButtons() {
    document.querySelectorAll('.modal__step[data-step="3"] .modal__option-grid button').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.trim() === this.state.gender);
    });
  },

  handleClassGradeChange(value) {
    this.state.classGrade = value;
    const streamField = document.getElementById('wizardStreamField');
    const subjectsGroup = document.getElementById('wizardSubjectsGroup');
    const subjectOther = document.getElementById('wizardSubjectOther');
    const shouldShowSubjects = value === 'School (5–10)' || value === '11th & 12th';

    if (streamField) streamField.style.display = value === '11th & 12th' ? '' : 'none';
    if (subjectsGroup) subjectsGroup.style.display = shouldShowSubjects ? '' : 'none';

    if (!shouldShowSubjects) {
      document.querySelectorAll('#registerModal .form-checkbox-grid input[type="checkbox"]')?.forEach(cb => {
        cb.checked = false;
      });
      document.querySelectorAll('#registerModal .form-checkbox')?.forEach(label => {
        label.classList.remove('active');
      });
      if (subjectOther) subjectOther.value = '';
      this.state.subjects = [];
    }
  },

  handleBoardChange(value) {
    this.state.board = value;
    const boardOtherField = document.getElementById('wizardBoardOtherField');
    if (boardOtherField) boardOtherField.style.display = value === 'Other' ? '' : 'none';
  },

  setPreferredBatch(value) {
    this.state.preferredBatch = value;
    const field = document.getElementById('wizardPreferredBatch');
    if (field) field.value = value;
    this.updatePreferredBatchButtons();
  },

  updatePreferredBatchButtons() {
    document.querySelectorAll('.modal__step[data-step="4"] .modal__option-grid button').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.trim() === this.state.preferredBatch);
    });
  },

  bindSubjectCheckboxes() {
    document.querySelectorAll('.form-checkbox-grid input[type="checkbox"]').forEach(input => {
      const label = input.closest('.form-checkbox');
      if (label) label.classList.toggle('active', input.checked);

      input.addEventListener('change', () => {
        if (label) label.classList.toggle('active', input.checked);

        const value = input.value;
        if (input.checked) {
          if (!this.state.subjects.includes(value)) this.state.subjects.push(value);
        } else {
          this.state.subjects = this.state.subjects.filter(s => s !== value);
        }
      });
    });
  },

  submit(event) {
    event.preventDefault();
    if (this.isRateLimited()) {
      Toast.show('You can submit again after 30 minutes.', 'error');
      return;
    }

    const name = document.getElementById('wizardName')?.value.trim();
    const dob = document.getElementById('wizardDob')?.value;
    const gender = this.state.gender;
    const schoolName = document.getElementById('wizardSchoolName')?.value.trim();
    const classGrade = document.getElementById('wizardClassGrade')?.value;
    const boardValue = this.state.board === 'Other' ? document.getElementById('wizardBoardOther')?.value.trim() : this.state.board;
    const board = boardValue || 'N/A';
    const stream = document.getElementById('wizardStream')?.value || 'N/A';
    const selectedSubjects = Array.from(document.querySelectorAll('.form-checkbox-grid input[type="checkbox"]:checked')).map(i => i.value);
    const subjectOther = document.getElementById('wizardSubjectOther')?.value.trim();
    if (subjectOther) selectedSubjects.push(subjectOther);
    const subjects = selectedSubjects.length ? selectedSubjects.join(', ') : 'N/A';
    const prevExam = document.getElementById('wizardPrevExam')?.value.trim() || 'N/A';
    const preferredBatch = this.state.preferredBatch || 'N/A';
    const preferredTiming = document.getElementById('wizardPreferredTiming')?.value.trim() || 'N/A';
    const admissionDate = document.getElementById('wizardAdmissionDate')?.value || 'N/A';
    const guardianName = document.getElementById('wizardParentName')?.value.trim() || 'N/A';
    const relationship = document.getElementById('wizardRelationship')?.value.trim() || 'N/A';
    const occupation = document.getElementById('wizardOccupation')?.value.trim() || 'N/A';
    const guardianPhone = document.getElementById('wizardGuardianPhone')?.value.trim();
    const altPhone = document.getElementById('wizardAltPhone')?.value.trim() || 'N/A';
    const guardianEmail = document.getElementById('wizardGuardianEmail')?.value.trim() || 'N/A';
    const altEmail = document.getElementById('wizardAltEmail')?.value.trim() || 'N/A';
    const address = document.getElementById('wizardAddress')?.value.trim() || 'N/A';
    const city = document.getElementById('wizardCity')?.value.trim() || 'N/A';
    const district = document.getElementById('wizardDistrict')?.value.trim() || 'N/A';
    const state = document.getElementById('wizardState')?.value.trim() || 'N/A';
    const pin = document.getElementById('wizardPin')?.value.trim() || 'N/A';
    const emergencyName = document.getElementById('wizardEmergencyName')?.value.trim() || 'N/A';
    const emergencyRelation = document.getElementById('wizardEmergencyRelation')?.value.trim() || 'N/A';
    const emergencyPhone = document.getElementById('wizardEmergencyPhone')?.value.trim() || 'N/A';
    const declarationDate = document.getElementById('wizardDeclarationDate')?.value || new Date().toISOString().slice(0, 10);

    if (!name || !dob || !gender || !guardianPhone || guardianPhone.length < 10) {
      Toast.show('Please complete the required fields before submitting.', 'error');
      return;
    }

    const message = [
      'ADMISSION FORM',
      `Attended free demo class: ${this.state.attendance === 'yes' ? 'Yes' : 'No'}`,
      `Review: ${this.state.rating || 'N/A'}`,
      '',
      'Student Information',
      `Student Name: ${name}`,
      `Date of Birth: ${dob}`,
      `Gender: ${gender}`,
      '',
      'Education Details',
      `School Name: ${schoolName || 'N/A'}`,
      `Class/Grade: ${classGrade || 'N/A'}`,
      `Board: ${board}`,
      `Subjects Required: ${subjects}`,
      `Previous Exam Percentage/Grade: ${prevExam}`,
      `Preferred Batch: ${preferredBatch}`,
      `Preferred Timing: ${preferredTiming}`,
      `Date of Admission: ${admissionDate}`,
      `Stream: ${stream}`,
      '',
      'Parent/Guardian Information',
      `Parent/Guardian Name: ${guardianName}`,
      `Relationship: ${relationship}`,
      `Occupation: ${occupation}`,
      `Mobile Number (WhatsApp): ${guardianPhone}`,
      `Alternate Number: ${altPhone}`,
      `Email: ${guardianEmail}`,
      `Alternate Email: ${altEmail}`,
      '',
      'Address',
      `House No./Street: ${address}`,
      `City: ${city}`,
      `District: ${district}`,
      `State: ${state}`,
      `PIN Code: ${pin}`,
      '',
      'Emergency Contact',
      `Name: ${emergencyName}`,
      `Relationship: ${emergencyRelation}`,
      `Mobile Number: ${emergencyPhone}`,
      '',
      'Declaration',
      `Date: ${declarationDate}`
    ].join('\n');

    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
    localStorage.setItem('majorwit_registration_sent', Date.now().toString());
    this.close();
    Toast.show('Your Application has been sent please check your whatsapp for Confirmation', 'success');
  },

  isRateLimited() {
    const timestamp = parseInt(localStorage.getItem('majorwit_registration_sent') || '0', 10);
    return !!timestamp && (Date.now() - timestamp) < 30 * 60 * 1000;
  }
};

function updateAuthUI() {
  const navCta = document.getElementById('navCta');

  if (navCta) {
    navCta.innerHTML = `<button class="btn btn--primary" onclick="openRegisterModal()">Register now</button>`;
    navCta.style.cssText = '';
  }
}

function handleLogout() {
  // No logout needed for WhatsApp integration
}

// ============================================
// HERO GET DEMO HANDLER
// ============================================
function handleGetDemo() {
  openRegisterModal();
}

function initHeroSearch() {
  const input = document.getElementById('heroSearch');
  const suggestionsBox = document.getElementById('heroSearchSuggestions');
  const searchBtn = document.getElementById('heroSearchBtn');

  if (!input || !suggestionsBox || !searchBtn) return;

  const suggestions = [
    'Spoken English',
    'IELTS',
    'PTE',
    'CA Foundation',
    'CA Intermediate',
    'CA Final',
    'School Tuition',
    '11th & 12th Commerce',
    '11th & 12th Science',
    '11th & 12th Humanities',
    'IB',
    'IGCSE',
    'AS & A Levels',
    'NIOS',
    'B.Com',
    'BBA',
    'Mathematics',
    'Science',
    'Social Studies',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'Accountancy',
    'Business Studies',
    'Economics',
    'Entrepreneurship',
    'History',
    'Political Science',
    'Legal Studies'
  ];

  const renderSuggestions = () => {
    const value = input.value.trim().toLowerCase();
    const matches = suggestions.filter(item => item.toLowerCase().includes(value));

    if (!value || !matches.length) {
      suggestionsBox.innerHTML = '';
      suggestionsBox.classList.remove('show');
      return;
    }

    suggestionsBox.innerHTML = matches
      .map(item => `<button type="button" class="hero__search-suggestion">${item}</button>`)
      .join('');
    suggestionsBox.classList.add('show');

    suggestionsBox.querySelectorAll('.hero__search-suggestion').forEach(btn => {
      btn.addEventListener('click', () => {
        input.value = btn.textContent.trim();
        suggestionsBox.classList.remove('show');
        input.focus();
      });
    });
  };

  input.addEventListener('input', renderSuggestions);
  input.addEventListener('focus', renderSuggestions);
  input.addEventListener('blur', () => {
    setTimeout(() => suggestionsBox.classList.remove('show'), 120);
  });

  searchBtn.addEventListener('click', () => {
    const query = input.value.trim();
    if (!query) return;

    suggestionsBox.classList.remove('show');
    const programsSection = document.getElementById('programs');
    if (programsSection) {
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
      const top = programsSection.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchBtn.click();
    }
  });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
function initGradientBackground() {
  const canvas = document.getElementById('gradientCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let time = 0;
  const colors = ['#3B2A20', '#6B4226', '#B9793F', '#D4986A', '#F7F1E6'];

  function resize() {
    const ratio = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawLayer(x, y, radius, color, alpha) {
    const gradient = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    gradient.addColorStop(0, `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    const baseGradient = ctx.createLinearGradient(0, 0, width, height);
    baseGradient.addColorStop(0, '#3b2a20');
    baseGradient.addColorStop(0.35, '#6b4226');
    baseGradient.addColorStop(0.7, '#b9793f');
    baseGradient.addColorStop(1, '#f7f1e6');
    ctx.fillStyle = baseGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 4; i += 1) {
      const offsetX = Math.cos(time * 1.1 + i * 1.4) * width * 0.22;
      const offsetY = Math.sin(time * 1.05 + i * 1.7) * height * 0.2;
      const radius = Math.max(width, height) * (0.28 + i * 0.08);
      drawLayer(width * (0.18 + i * 0.2) + offsetX, height * (0.16 + i * 0.18) + offsetY, radius, colors[i % colors.length], 0.14 + i * 0.022);
    }
    ctx.globalCompositeOperation = 'source-over';

    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#f7f1e6';
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i += 1) {
      ctx.beginPath();
      const y = (height / 8) * i + Math.sin(time * 1.6 + i) * 24;
      ctx.moveTo(0, y);
      ctx.quadraticCurveTo(width * 0.5, y + 34, width, y - 10);
      ctx.stroke();
    }
    ctx.restore();

    time += 0.016;
    requestAnimationFrame(render);
  }

  resize();
  render();
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', () => {
    time += window.scrollY * 0.00005;
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ============================================
// CSS SHAKE ANIMATION
// ============================================
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  .shake { animation: shake 0.35s ease-out; }
`;
document.head.appendChild(styleTag);

// ============================================
// INIT ALL ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  Nav.init();
  Toast.init();
  BookingForm.init();
  RegisterWizard.init();
  ProgramsTabs.init();
  ReviewsFilter.init();
  ScrollReveal.init();
  Counters.init();
  initSmoothScroll();
  initHeroSearch();
  updateAuthUI();
  initGradientBackground();

  // Animate initial curl underlines already in view
  setTimeout(() => {
    document.querySelectorAll('.curl-underline').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('animated');
    });
  }, 500);

  // Make WhatsApp helper and actions available globally (called from HTML onclick)
  window.openWhatsAppChat = openWhatsAppChat;
  window.handleGetDemo = handleGetDemo;
  window.scrollToForum = scrollToForum;
  window.Nav = Nav;
});
