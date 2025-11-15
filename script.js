// ==========================================
// ENHANCED CONFIGURATION WITH HIERARCHY
// ==========================================

const CONFIG = {
    SHEET_ID: '1gt3LLr9i5Nu888DVSrHyGCZaqHL6uqnDI1X3sMS7Qhg',
    COURSES_SHEET: 'Courses',
    BRANCHES_SHEET: 'Branches',
    SEMESTERS_SHEET: 'Semesters',
    SUBJECTS_SHEET: 'Subjects',
    RESOURCES_SHEET: 'Resources',
    UNIVERSITIES_SHEET: 'Universities',
    
    API_URL: 'https://opensheet.elk.sh/',
    
    // Features
    ENABLE_VOICE_SEARCH: true,
    ENABLE_BREADCRUMBS: true,
    ENABLE_SEO_METADATA: true,
    
    // Analytics
    ENABLE_DOWNLOAD_TRACKING: true
};

// ==========================================
// STATE MANAGEMENT
// ==========================================

const AppState = {
    // Data from sheets
    courses: [],
    branches: [],
    semesters: [],
    subjects: [],
    resources: [],
    universities: [],
    
    // Navigation state
    selectedCourse: null,
    selectedBranch: null,
    selectedSemester: null,
    selectedSubject: null,
    
    // Current view
    currentView: 'course', // course, branch, semester, subject, resource
    
    // Filters
    currentResourceType: 'all',
    currentLanguage: 'all',
    
    // User data
    downloads: JSON.parse(localStorage.getItem('downloads')) || [],
    bookmarks: JSON.parse(localStorage.getItem('bookmarks')) || [],
    
    // Theme
    theme: localStorage.getItem('theme') || 'light',
    
    // Voice
    recognition: null,
    isListening: false,
    
    // Navigation history for breadcrumbs
    navigationHistory: []
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    console.log('%c🎓 JavaSourceCode - Educational Platform ', 'background: linear-gradient(135deg, #4F46E5, #FF9933); color: white; font-size: 18px; padding: 10px 20px; border-radius: 5px; font-weight: bold;');
    
    showEnhancedLoading();
    
    await Promise.all([
        initializeTheme(),
        initializeNavbar(),
        initializeVoiceSearch(),
        fetchAllData(),
        initializeEventListeners()
    ]);
    
    hideEnhancedLoading();
    
    // Show initial view (courses)
    showCourses();
}

// ==========================================
// LOADING SCREEN
// ==========================================

function showEnhancedLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    const percentage = document.getElementById('loadingPercentage');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        percentage.textContent = Math.floor(progress) + '%';
        if (progress >= 100) clearInterval(interval);
    }, 150);
}

function hideEnhancedLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    const percentage = document.getElementById('loadingPercentage');
    percentage.textContent = '100%';
    setTimeout(() => loadingScreen.classList.add('hidden'), 500);
}

// ==========================================
// THEME MANAGEMENT
// ==========================================

function initializeTheme() {
    document.documentElement.setAttribute('data-theme', AppState.theme);
    updateThemeIcon();
}

function toggleTheme() {
    AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', AppState.theme);
    localStorage.setItem('theme', AppState.theme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = AppState.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ==========================================
// NAVBAR
// ==========================================

function initializeNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    mobileToggle?.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggle?.classList.remove('active');
        });
    });
}

// ==========================================
// VOICE SEARCH
// ==========================================

function initializeVoiceSearch() {
    if (!CONFIG.ENABLE_VOICE_SEARCH || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        document.querySelectorAll('.voice-search').forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    AppState.recognition = new SpeechRecognition();
    AppState.recognition.continuous = false;
    AppState.recognition.lang = 'en-US';
    
    AppState.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        handleVoiceSearch(transcript);
        stopVoiceSearch();
    };
    
    AppState.recognition.onerror = () => stopVoiceSearch();
    AppState.recognition.onend = () => stopVoiceSearch();
}

function startVoiceSearch() {
    if (!AppState.recognition) return;
    AppState.isListening = true;
    AppState.recognition.start();
    document.querySelectorAll('.voice-search').forEach(btn => btn.classList.add('active'));
}

function stopVoiceSearch() {
    if (!AppState.recognition) return;
    AppState.isListening = false;
    AppState.recognition.stop();
    document.querySelectorAll('.voice-search').forEach(btn => btn.classList.remove('active'));
}

function handleVoiceSearch(query) {
    // Simple voice command handling
    if (query.includes('btech') || query.includes('b tech')) {
        const btechCourse = AppState.courses.find(c => c.CourseName.toLowerCase().includes('btech'));
        if (btechCourse) selectCourse(btechCourse.ID);
    } else if (query.includes('bca')) {
        const bcaCourse = AppState.courses.find(c => c.CourseName.toLowerCase().includes('bca'));
        if (bcaCourse) selectCourse(bcaCourse.ID);
    }
    // Add more voice commands as needed
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initializeEventListeners() {
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    document.getElementById('voiceSearch')?.addEventListener('click', () => {
        AppState.isListening ? stopVoiceSearch() : startVoiceSearch();
    });
    
    // Resource type filters
    document.querySelectorAll('.resource-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.resource-filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            AppState.currentResourceType = btn.dataset.type;
            filterResources();
        });
    });
    
    // Language filter
    document.getElementById('languageFilter')?.addEventListener('change', (e) => {
        AppState.currentLanguage = e.target.value;
        filterResources();
    });
}

// ==========================================
// FETCH ALL DATA FROM GOOGLE SHEETS
// ==========================================

async function fetchAllData() {
    try {
        const baseUrl = `${CONFIG.API_URL}${CONFIG.SHEET_ID}`;
        
        const [courses, branches, semesters, subjects, resources, universities] = await Promise.all([
            fetch(`${baseUrl}/${CONFIG.COURSES_SHEET}`).then(r => r.json()),
            fetch(`${baseUrl}/${CONFIG.BRANCHES_SHEET}`).then(r => r.json()),
            fetch(`${baseUrl}/${CONFIG.SEMESTERS_SHEET}`).then(r => r.json()),
            fetch(`${baseUrl}/${CONFIG.SUBJECTS_SHEET}`).then(r => r.json()),
            fetch(`${baseUrl}/${CONFIG.RESOURCES_SHEET}`).then(r => r.json()),
            fetch(`${baseUrl}/${CONFIG.UNIVERSITIES_SHEET}`).then(r => r.json())
        ]);
        
        AppState.courses = courses;
        AppState.branches = branches;
        AppState.semesters = semesters;
        AppState.subjects = subjects;
        AppState.resources = resources;
        AppState.universities = universities;
        
        console.log('✅ All data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading data:', error);
        showError('Unable to load data. Please check your Sheet ID and configuration.');
    }
}

function showError(message) {
    const coursesGrid = document.getElementById('coursesGrid');
    if (coursesGrid) {
        coursesGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #EF4444; margin-bottom: 20px;"></i>
                <h3 style="color: var(--text-primary); margin-bottom: 15px;">Error Loading Content</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    <i class="fas fa-redo"></i> Reload Page
                </button>
            </div>
        `;
    }
}

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================

function showCourses() {
    hideAllSteps();
    document.getElementById('courseStep').style.display = 'block';
    AppState.currentView = 'course';
    updateBreadcrumb();
    renderCourses();
}

function selectCourse(courseId) {
    AppState.selectedCourse = AppState.courses.find(c => c.ID == courseId);
    hideAllSteps();
    document.getElementById('branchStep').style.display = 'block';
    AppState.currentView = 'branch';
    updateBreadcrumb();
    renderBranches();
    scrollToTop();
}

function selectBranch(branchId) {
    AppState.selectedBranch = AppState.branches.find(b => b.ID == branchId);
    hideAllSteps();
    document.getElementById('semesterStep').style.display = 'block';
    AppState.currentView = 'semester';
    updateBreadcrumb();
    renderSemesters();
    scrollToTop();
}

function selectSemester(semesterId) {
    AppState.selectedSemester = AppState.semesters.find(s => s.ID == semesterId);
    hideAllSteps();
    document.getElementById('subjectStep').style.display = 'block';
    AppState.currentView = 'subject';
    updateBreadcrumb();
    renderSubjects();
    scrollToTop();
}

function selectSubject(subjectId) {
    AppState.selectedSubject = AppState.subjects.find(s => s.ID == subjectId);
    hideAllSteps();
    document.getElementById('resourceStep').style.display = 'block';
    AppState.currentView = 'resource';
    AppState.currentResourceType = 'all';
    updateBreadcrumb();
    updatePageMeta();
    renderResources();
    scrollToTop();
}

function goBack(to) {
    switch(to) {
        case 'course':
            showCourses();
            break;
        case 'branch':
            selectCourse(AppState.selectedCourse.ID);
            break;
        case 'semester':
            selectBranch(AppState.selectedBranch.ID);
            break;
        case 'subject':
            selectSemester(AppState.selectedSemester.ID);
            break;
    }
}

function hideAllSteps() {
    document.getElementById('courseStep').style.display = 'none';
    document.getElementById('branchStep').style.display = 'none';
    document.getElementById('semesterStep').style.display = 'none';
    document.getElementById('subjectStep').style.display = 'none';
    document.getElementById('resourceStep').style.display = 'none';
}

function scrollToTop() {
    window.scrollTo({ top: document.getElementById('courses').offsetTop - 100, behavior: 'smooth' });
}

// ==========================================
// RENDER FUNCTIONS
// ==========================================

function renderCourses() {
    const grid = document.getElementById('coursesGrid');
    
    grid.innerHTML = AppState.courses.map(course => `
        <div class="course-item glass-morphism" onclick="selectCourse(${course.ID})">
            <div class="course-icon">
                <i class="${course.Icon || 'fas fa-graduation-cap'}"></i>
            </div>
            <h3>${course.CourseName}</h3>
            <p>${course.Description}</p>
        </div>
    `).join('');
}

function renderBranches() {
    const grid = document.getElementById('branchGrid');
    const titleEl = document.getElementById('selectedCourse');
    
    titleEl.textContent = `${AppState.selectedCourse.CourseName} - Select Branch`;
    
    const branches = AppState.branches.filter(b => b.CourseID == AppState.selectedCourse.ID);
    
    if (branches.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No branches available yet.</p>';
        return;
    }
    
    grid.innerHTML = branches.map(branch => `
        <div class="branch-item glass-morphism" onclick="selectBranch(${branch.ID})">
            <h3>${branch.BranchName}</h3>
            <p>${branch.Description}</p>
            <span class="university-badge">${branch.University || 'All Universities'}</span>
        </div>
    `).join('');
}

function renderSemesters() {
    const grid = document.getElementById('semesterGrid');
    const titleEl = document.getElementById('selectedBranch');
    
    titleEl.textContent = `${AppState.selectedBranch.BranchName} - Select Semester`;
    
    const semesters = AppState.semesters.filter(s => s.BranchID == AppState.selectedBranch.ID);
    
    if (semesters.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No semesters available yet.</p>';
        return;
    }
    
    grid.innerHTML = semesters.map(sem => `
        <div class="semester-item glass-morphism" onclick="selectSemester(${sem.ID})">
            <div class="semester-number">${sem.SemesterNumber}</div>
            <h4>${sem.SemesterName}</h4>
        </div>
    `).join('');
}

function renderSubjects() {
    const grid = document.getElementById('subjectGrid');
    const titleEl = document.getElementById('selectedSemester');
    
    titleEl.textContent = `Semester ${AppState.selectedSemester.SemesterNumber} - Select Subject`;
    
    const subjects = AppState.subjects.filter(s => s.SemesterID == AppState.selectedSemester.ID);
    
    if (subjects.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">No subjects available yet.</p>';
        return;
    }
    
    grid.innerHTML = subjects.map(subject => `
        <div class="subject-item glass-morphism" onclick="selectSubject(${subject.ID})">
            <div class="subject-header">
                <span class="subject-code">${subject.SubjectCode}</span>
                <span class="subject-credits">${subject.Credits} Credits</span>
            </div>
            <h3>${subject.SubjectName}</h3>
            <p>${subject.Description}</p>
        </div>
    `).join('');
}

function renderResources() {
    const grid = document.getElementById('resourcesGrid');
    const titleEl = document.getElementById('selectedSubject');
    
    titleEl.textContent = `${AppState.selectedSubject.SubjectName} - Resources`;
    
    filterResources();
}

function filterResources() {
    const grid = document.getElementById('resourcesGrid');
    
    let resources = AppState.resources.filter(r => r.SubjectID == AppState.selectedSubject.ID);
    
    // Filter by type
    if (AppState.currentResourceType !== 'all') {
        resources = resources.filter(r => r.ResourceType === AppState.currentResourceType);
    }
    
    // Filter by language
    if (AppState.currentLanguage !== 'all') {
        resources = resources.filter(r => r.Language === AppState.currentLanguage);
    }
    
    if (resources.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-inbox" style="font-size: 64px; color: var(--text-muted); margin-bottom: 20px;"></i>
                <h3 style="color: var(--text-primary);">No resources found</h3>
                <p style="color: var(--text-secondary);">Try different filters or check back later.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = resources.map(resource => createResourceCard(resource)).join('');
}

function createResourceCard(resource) {
    const badgeClass = resource.ResourceType.toLowerCase();
    const isDownloaded = AppState.downloads.includes(resource.ID);
    
    return `
        <article class="resource-card glass-morphism">
            <span class="resource-type-badge ${badgeClass}">${resource.ResourceType}</span>
            <h3>${resource.Title}</h3>
            <p>${resource.Description}</p>
            
            <div class="resource-meta">
                <span class="resource-meta-item">
                    <i class="fas fa-language"></i>
                    ${resource.Language || 'English'}
                </span>
                <span class="resource-meta-item">
                    <i class="fas fa-university"></i>
                    ${resource.University || 'All'}
                </span>
                <span class="resource-meta-item">
                    <i class="fas fa-calendar"></i>
                    ${resource.Year || '2024'}
                </span>
                <span class="resource-meta-item">
                    <i class="fas fa-download"></i>
                    ${resource.Downloads || '0'} downloads
                </span>
            </div>
            
            <div class="resource-actions">
                <a href="${resource.Link}" 
                   target="_blank" 
                   class="resource-download-btn"
                   onclick="trackDownload(${resource.ID}, '${resource.ResourceType}', '${resource.Title}')">
                    <i class="fas fa-${resource.ResourceType === 'Video' ? 'play' : 'download'}"></i>
                    ${resource.ResourceType === 'Video' ? 'Watch Now' : 'Download'}
                </a>
                <button class="course-btn btn-bookmark ${isDownloaded ? 'bookmarked' : ''}" 
                        onclick="toggleBookmark(${resource.ID})"
                        title="${isDownloaded ? 'Remove from saved' : 'Save for later'}">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        </article>
    `;
}

// ==========================================
// DOWNLOAD TRACKING
// ==========================================

function trackDownload(resourceId, type, title) {
    if (CONFIG.ENABLE_DOWNLOAD_TRACKING) {
        if (!AppState.downloads.includes(resourceId)) {
            AppState.downloads.push(resourceId);
            localStorage.setItem('downloads', JSON.stringify(AppState.downloads));
        }
        
        console.log(`📥 Downloaded: ${type} - ${title}`);
        
        // Update download count in UI
        setTimeout(() => {
            const resource = AppState.resources.find(r => r.ID == resourceId);
            if (resource) {
                resource.Downloads = (parseInt(resource.Downloads) || 0) + 1;
            }
        }, 100);
    }
}

function toggleBookmark(resourceId) {
    const index = AppState.downloads.indexOf(resourceId);
    
    if (index > -1) {
        AppState.downloads.splice(index, 1);
    } else {
        AppState.downloads.push(resourceId);
    }
    
    localStorage.setItem('downloads', JSON.stringify(AppState.downloads));
    
    // Re-render to update UI
    filterResources();
}

// ==========================================
// BREADCRUMB NAVIGATION
// ==========================================

function updateBreadcrumb() {
    if (!CONFIG.ENABLE_BREADCRUMBS) return;
    
    const breadcrumbNav = document.getElementById('breadcrumbNav');
    const breadcrumb = breadcrumbNav?.querySelector('.breadcrumb');
    
    if (!breadcrumb) return;
    
    let items = ['<div class="breadcrumb-item"><a href="#" onclick="showCourses(); return false;"><i class="fas fa-home"></i> Home</a></div>'];
    
    if (AppState.selectedCourse) {
        items.push(`<span class="breadcrumb-separator">›</span>`);
        items.push(`<div class="breadcrumb-item"><a href="#" onclick="selectCourse(${AppState.selectedCourse.ID}); return false;">${AppState.selectedCourse.CourseName}</a></div>`);
    }
    
    if (AppState.selectedBranch) {
        items.push(`<span class="breadcrumb-separator">›</span>`);
        items.push(`<div class="breadcrumb-item"><a href="#" onclick="selectBranch(${AppState.selectedBranch.ID}); return false;">${AppState.selectedBranch.BranchName}</a></div>`);
    }
    
    if (AppState.selectedSemester) {
        items.push(`<span class="breadcrumb-separator">›</span>`);
        items.push(`<div class="breadcrumb-item"><a href="#" onclick="selectSemester(${AppState.selectedSemester.ID}); return false;">Semester ${AppState.selectedSemester.SemesterNumber}</a></div>`);
    }
    
    if (AppState.selectedSubject) {
        items.push(`<span class="breadcrumb-separator">›</span>`);
        items.push(`<div class="breadcrumb-item">${AppState.selectedSubject.SubjectName}</div>`);
    }
    
    breadcrumb.innerHTML = items.join('');
    breadcrumbNav.style.display = items.length > 1 ? 'block' : 'none';
}

// ==========================================
// DYNAMIC SEO META UPDATES
// ==========================================

function updatePageMeta() {
    if (!CONFIG.ENABLE_SEO_METADATA) return;
    
    let title = 'Free BTech BCA Notes, PYQ & Study Material | JavaSourceCode';
    let description = 'Download free engineering notes, previous year questions, and study materials.';
    let keywords = 'btech notes, engineering notes, pyq, study material';
    
    if (AppState.selectedSubject) {
        const subjectName = AppState.selectedSubject.SubjectName;
        const branchName = AppState.selectedBranch.BranchName;
        const semNumber = AppState.selectedSemester.SemesterNumber;
        
        title = `${subjectName} Notes, PYQ & Videos | Sem ${semNumber} ${branchName}`;
        description = `Download ${subjectName} complete notes, previous year questions, solutions & video lectures. ${branchName} Semester ${semNumber}. Free PDF download.`;
        keywords = `${subjectName.toLowerCase()} notes, ${subjectName.toLowerCase()} pyq, ${branchName.toLowerCase()} notes, semester ${semNumber}, ${AppState.selectedSubject.MetaKeywords || ''}`;
    }
    
    document.title = title;
    updateMetaTag('name', 'description', description);
    updateMetaTag('name', 'keywords', keywords);
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
}

function updateMetaTag(attr, key, content) {
    let element = document.querySelector(`meta[${attr}="${key}"]`);
    if (element) {
        element.setAttribute('content', content);
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ==========================================
// CONSOLE BRANDING
// ==========================================

console.log('%c📚 Hierarchical Navigation Ready! ', 'color: #10B981; font-size: 14px; font-weight: bold;');
console.log('%c6 Sheets: Courses → Branches → Semesters → Subjects → Resources', 'color: #64748B; font-size: 12px;');

console.log('%c🔍 SEO Optimized | 🎤 Voice Search | 📊 Download Tracking', 'color: #4F46E5; font-size: 11px;');
