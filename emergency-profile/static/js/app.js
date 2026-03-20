document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const submitBtn = document.getElementById('submit-btn');
    const uploadForm = document.getElementById('upload-form');
    
    // Sections
    const uploadSection = document.getElementById('upload-section');
    const loadingSection = document.getElementById('loading-section');
    const resultsSection = document.getElementById('results-section');
    const errorSection = document.getElementById('error-section');
    
    // Results elements
    const resName = document.getElementById('res-name');
    const resAge = document.getElementById('res-age');
    const resBlood = document.getElementById('res-blood');
    const resWarningsContainer = document.getElementById('critical-warnings-container');
    const resWarnings = document.getElementById('res-warnings');
    const resAllergies = document.getElementById('res-allergies');
    const resConditions = document.getElementById('res-conditions');
    const resMedications = document.getElementById('res-medications');
    const resContacts = document.getElementById('res-contacts');
    
    let currentFiles = [];

    // Drag and Drop Events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        handleFiles(dt.files);
    }, false);

    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        const newFiles = Array.from(files);
        currentFiles = [...currentFiles, ...newFiles];
        updateFileList();
        
        if (currentFiles.length > 0) {
            submitBtn.classList.remove('disabled');
        }
    }

    function updateFileList() {
        if (currentFiles.length === 0) {
            fileList.classList.add('hidden');
            return;
        }
        
        fileList.classList.remove('hidden');
        fileList.innerHTML = '';
        
        currentFiles.forEach((file, index) => {
            const size = (file.size / 1024 / 1024).toFixed(2);
            fileList.innerHTML += `
                <div class="file-item">
                    <span>📄 ${file.name}</span>
                    <span style="color: var(--text-muted)">${size} MB</span>
                </div>
            `;
        });
    }

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (currentFiles.length === 0) return;

        // Switch UI to loading
        showSection(loadingSection);

        const formData = new FormData();
        currentFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('/api/extract', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to extract data');
            }

            const data = await response.json();
            populateResults(data);
            showSection(resultsSection);
            
        } catch (error) {
            console.error(error);
            document.getElementById('error-message').innerText = error.message;
            showSection(errorSection);
        }
    });

    function populateResults(data) {
        resName.textContent = data.name || 'Unknown';
        resAge.textContent = data.age || 'Unknown';
        resBlood.textContent = data.blood_type || 'Unknown';

        // Critical Warnings
        if (data.critical_warnings && data.critical_warnings.length > 0) {
            resWarningsContainer.classList.remove('hidden');
            resWarnings.innerHTML = data.critical_warnings.map(w => `<li>${w}</li>`).join('');
        } else {
            resWarningsContainer.classList.add('hidden');
        }

        // Allergies
        if (data.allergies && data.allergies.length > 0) {
            resAllergies.classList.remove('empty');
            resAllergies.innerHTML = data.allergies.map(a => `<li>${a}</li>`).join('');
        } else {
            resAllergies.classList.add('empty');
            resAllergies.innerHTML = '<li>None known</li>';
        }

        // Conditions
        resConditions.innerHTML = data.chronic_conditions && data.chronic_conditions.length > 0 
            ? data.chronic_conditions.map(c => `<li>${c}</li>`).join('')
            : '<li style="color:#999">None discovered</li>';

        // Medications
        resMedications.innerHTML = data.current_medications && data.current_medications.length > 0 
            ? data.current_medications.map(m => `<li>${m}</li>`).join('')
            : '<li style="color:#999">None discovered</li>';

        // Contacts
        resContacts.innerHTML = data.emergency_contacts && data.emergency_contacts.length > 0 
            ? data.emergency_contacts.map(c => `<li>${c}</li>`).join('')
            : '<li style="color:#999">None discovered</li>';
    }

    function showSection(sectionElement) {
        [uploadSection, loadingSection, resultsSection, errorSection].forEach(sec => {
            if (sec === sectionElement) {
                sec.classList.remove('hidden');
            } else {
                sec.classList.add('hidden');
            }
        });
    }

    document.getElementById('reset-btn').addEventListener('click', () => {
        currentFiles = [];
        updateFileList();
        submitBtn.classList.add('disabled');
        fileInput.value = '';
        showSection(uploadSection);
    });

    document.getElementById('retry-btn').addEventListener('click', () => {
        showSection(uploadSection);
    });
});
