// Tab Switching Function
function switchTab(tabName) {
    // Remove active class from all tabs and sections
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    
    // Add active class to selected tab and section
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== ADMIN LOGIN POPUP FUNCTIONS =====

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'sangat2026';

// Open admin login popup
function openAdminLogin() {
    document.getElementById('adminLoginModal').classList.add('show');
    document.getElementById('popupUsername').focus();
}

// Close admin login popup
function closeAdminLogin() {
    document.getElementById('adminLoginModal').classList.remove('show');
    document.getElementById('adminLoginForm').reset();
    document.getElementById('popupLoginError').classList.remove('show');
}

// Toggle password visibility in popup
function togglePopupPassword() {
    const passwordInput = document.getElementById('popupPassword');
    const toggleBtn = document.querySelector('.admin-toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Handle admin login from popup
function handleAdminLoginPopup(event) {
    event.preventDefault();
    
    const username = document.getElementById('popupUsername').value.trim();
    const password = document.getElementById('popupPassword').value;
    const errorDiv = document.getElementById('popupLoginError');
    
    // Clear previous error
    errorDiv.classList.remove('show');
    errorDiv.textContent = '';
    
    // Verify credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Login successful! Set session and redirect
        sessionStorage.setItem('adminLoggedIn', 'true');
        
        // Show success and redirect
        errorDiv.style.background = '#e6ffe6';
        errorDiv.style.color = '#1a4d2e';
        errorDiv.style.borderLeftColor = '#1a4d2e';
        errorDiv.textContent = '✅ Login successful! Redirecting to dashboard...';
        errorDiv.classList.add('show');
        
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1000);
    } else {
        // Login failed
        errorDiv.textContent = '❌ Invalid username or password. Please try again.';
        errorDiv.classList.add('show');
        document.getElementById('popupPassword').value = '';
        document.getElementById('popupPassword').focus();
    }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('adminLoginModal');
    if (event.target === modal) {
        closeAdminLogin();
    }
}

// ===== END ADMIN LOGIN POPUP FUNCTIONS =====

// ===== IMPORTANT: CONFIGURE YOUR GOOGLE APPS SCRIPT URL HERE =====
// Replace this with your actual Google Apps Script Web App URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwvsvitgZqCrt81gphSS-yo9bUBv2WeHki1cRXfiEIo9vKIacia2OTvSlcjgBYKv0tKXg/exec';
// Example: 'https://script.google.com/macros/s/AKfycby.../exec'
// ==================================================================

// Enrollment Form Submission Handler
async function handleSubmit(event) {
    event.preventDefault();
    

    
    const form = event.target;
    
    // Validate LRN length
    const lrn = form.lrn.value;
    if (lrn.length !== 12) {
        alert('❌ Invalid LRN\n\nLearner Reference Number must be exactly 12 digits.');
        form.lrn.focus();
        return;
    }
    
    // General average validation removed - all students can enroll
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Checking enrollment status...';
    submitBtn.disabled = true;
    
    try {
        // Check if student already enrolled (by LRN)
        const checkResponse = await fetch(SCRIPT_URL + '?action=checkDuplicate&lrn=' + lrn);
        const checkData = await checkResponse.json();
        
        if (checkData.exists) {
            alert('❌ ALREADY ENROLLED\n\nThis LRN is already registered in our system.\n\nYou cannot enroll again for School Year 2026-2027.\n\nIf this is an error, please contact the registrar.');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }
        
    } catch (error) {
        console.log('Could not check duplicate, proceeding...');
    }
    
    submitBtn.innerHTML = '⏳ Submitting enrollment...';
    
    // Get form data
    // Learning modalities removed as per request
    
    
    // Get Special Needs Education data
    const diagnosisCheckboxes = form.querySelectorAll('input[name="diagnosis"]:checked');
    const diagnosis = Array.from(diagnosisCheckboxes).map(cb => cb.value).join(', ') || '';
    
    const manifestationsCheckboxes = form.querySelectorAll('input[name="manifestations"]:checked');
    const manifestations = Array.from(manifestationsCheckboxes).map(cb => cb.value).join(', ') || '';

    const formData = {
        lastName: form.lastName.value,
        firstName: form.firstName.value,
        middleName: form.middleName.value || '',
        extensionName: form.extensionName ? form.extensionName.value : '',
        birthDate: form.birthDate.value,
        age: form.age.value,
        gender: form.gender.value,
        placeOfBirth: form.placeOfBirth.value,
        religion: form.religion.value,
        motherTongue: form.motherTongue.value,
        psaBirthCertNo: form.psaBirthCertNo ? form.psaBirthCertNo.value : '',
        isIndigenous: form.isIndigenous.value,
        ipCommunity: form.ipCommunity ? form.ipCommunity.value : '',
        is4PsBeneficiary: form.is4PsBeneficiary.value,
        fourPsHouseholdId: form.fourPsHouseholdId ? form.fourPsHouseholdId.value : '',
        houseNo: form.houseNo.value,
        streetName: form.streetName.value,
        barangay: form.barangay.value,
        municipality: form.municipality.value,
        province: form.province.value,
        country: form.country.value,
        zipCode: form.zipCode ? form.zipCode.value : '',
        sameAsCurrentAddress: form.sameAsCurrentAddress.checked ? 'Yes' : 'No',
        permanentHouseNo: form.permanentHouseNo ? form.permanentHouseNo.value : '',
        permanentStreetName: form.permanentStreetName ? form.permanentStreetName.value : '',
        permanentBarangay: form.permanentBarangay ? form.permanentBarangay.value : '',
        permanentMunicipality: form.permanentMunicipality ? form.permanentMunicipality.value : '',
        permanentProvince: form.permanentProvince ? form.permanentProvince.value : '',
        permanentCountry: form.permanentCountry ? form.permanentCountry.value : '',
        permanentZipCode: form.permanentZipCode ? form.permanentZipCode.value : '',
        contactNumber: form.contactNumber.value,
        email: form.email.value || '',
        lrn: form.lrn.value,
        generalAverage: form.generalAverage.value,
        gradeLevel: form.gradeLevel.value,
        semester: form.semester ? form.semester.value : 'N/A',
        track: form.track ? form.track.value : 'N/A',
        schoolYear: form.schoolYear.value,
        lastSchool: form.lastSchool.value,
        isSpecialNeeds: form.isSpecialNeeds.value,
        diagnosis: diagnosis,
        manifestations: manifestations,
        hasPWDID: form.hasPWDID ? form.hasPWDID.value : '',
        lastGradeCompleted: form.lastGradeCompleted.value || '',
        lastSchoolYearCompleted: form.lastSchoolYearCompleted.value || '',
        lastSchoolAttended: form.lastSchoolAttended.value || '',
        previousSchoolID: form.previousSchoolID.value || '',
        
        fatherName: form.fatherName.value || '',
        fatherContact: form.fatherContact.value || '',
        fatherEmail: form.fatherEmail.value || '',
        fatherOccupation: form.fatherOccupation.value || '',
        motherName: form.motherName.value || '',
        motherContact: form.motherContact.value || '',
        motherEmail: form.motherEmail.value || '',
        motherOccupation: form.motherOccupation.value || '',
        guardianName: form.guardianName ? form.guardianName.value : '',
        guardianContact: form.guardianContact ? form.guardianContact.value : '',
        guardianEmail: form.guardianEmail ? form.guardianEmail.value : '',
        guardianRelationship: form.guardianRelationship ? form.guardianRelationship.value : '',
        submittedDate: new Date().toLocaleString(),
        timestamp: new Date().toISOString()
    };
    
    try {
        // Send to Google Sheets backend
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // Show success message
        const fullName = `${formData.firstName} ${formData.lastName}`;
        const emailMsg = formData.email 
            ? `\n\n📧 A confirmation email with your INTERVIEW SCHEDULE has been sent to:\n${formData.email}` 
            : '';
        
        alert(`✅ ENROLLMENT SUCCESSFUL!\n\nCongratulations, ${fullName}!\n\nYour enrollment for Grade ${formData.gradeLevel}${formData.track !== 'N/A' ? ' - ' + formData.track : ''} has been accepted.\n\nGeneral Average: ${formData.generalAverage}%\nLRN: ${formData.lrn}${emailMsg}\n\nIMPORTANT: You cannot enroll again for SY 2026-2027.\n\nPlease check your email for interview details.\n\nSee you soon at Sangat National High School!`);
        
        // Reset form
        form.reset();
        
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
    } catch (error) {
        console.error('Error submitting form:', error);
        
        alert(`❌ Submission Failed!\n\nUnable to submit your enrollment.\n\nPlease try again or contact:\n📞 (032) XXX-XXXX\n📧 registrar@sangatnhs.edu.ph`);
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Contact Form Submission Handler
async function handleContactSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = document.getElementById('contactSubmitBtn');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '⏳ Sending...';
    submitBtn.disabled = true;
    

    
    // Get form data
    
    // Get Special Needs Education data
    const diagnosisCheckboxes = form.querySelectorAll('input[name="diagnosis"]:checked');
    const diagnosis = Array.from(diagnosisCheckboxes).map(cb => cb.value).join(', ') || '';
    
    const manifestationsCheckboxes = form.querySelectorAll('input[name="manifestations"]:checked');
    const manifestations = Array.from(manifestationsCheckboxes).map(cb => cb.value).join(', ') || '';

    const formData = {
        action: 'contact',
        name: form.contactName.value,
        email: form.contactEmail.value,
        phone: form.contactPhone.value || '',
        subject: form.contactSubject.value,
        message: form.contactMessage.value,
        timestamp: new Date().toISOString(),
        submittedDate: new Date().toLocaleString()
    };
    
    try {
        // Send to backend
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        // Show success message
        alert(`✅ Message Sent Successfully!\n\nThank you, ${formData.name}!\n\nYour message has been sent to Sangat National High School.\n\nSubject: ${formData.subject}\n\nWe will get back to you as soon as possible at ${formData.email}.`);
        
        // Reset form
        form.reset();
        
    } catch (error) {
        console.error('Error sending contact message:', error);
        alert('❌ Failed to send message.\n\nPlease try again or contact us directly at:\n📞 (032) XXX-XXXX\n📧 registrar@sangatnhs.edu.ph');
    }
    
    // Restore button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
}


// Toggle IP Community field
function toggleIPCommunity() {
    const isIndigenous = document.getElementById('isIndigenous').value;
    const ipCommunityGroup = document.getElementById('ipCommunityGroup');
    const ipCommunityInput = document.getElementById('ipCommunity');
    
    if (isIndigenous === 'yes') {
        ipCommunityGroup.style.display = 'block';
        ipCommunityInput.required = true;
    } else {
        ipCommunityGroup.style.display = 'none';
        ipCommunityInput.required = false;
        ipCommunityInput.value = '';
    }
}

// Toggle 4Ps Household ID field
function toggle4Ps() {
    const is4Ps = document.getElementById('is4PsBeneficiary').value;
    const fourPsGroup = document.getElementById('fourPsGroup');
    const fourPsInput = document.getElementById('fourPsHouseholdId');
    
    if (is4Ps === 'yes') {
        fourPsGroup.style.display = 'block';
        fourPsInput.required = true;
    } else {
        fourPsGroup.style.display = 'none';
        fourPsInput.required = false;
        fourPsInput.value = '';
    }
}

// Toggle permanent address fields


// Toggle Special Needs Education section
function toggleSpecialNeeds() {
    const isSpecialNeeds = document.getElementById('isSpecialNeeds').value;
    const specialNeedsSection = document.getElementById('specialNeedsSection');
    const hasPWDID = document.getElementById('hasPWDID');
    
    if (isSpecialNeeds === 'yes') {
        specialNeedsSection.style.display = 'block';
        hasPWDID.required = true;
    } else {
        specialNeedsSection.style.display = 'none';
        hasPWDID.required = false;
        hasPWDID.value = '';
        // Uncheck all diagnosis and manifestation checkboxes
        document.querySelectorAll('input[name="diagnosis"]').forEach(cb => cb.checked = false);
        document.querySelectorAll('input[name="manifestations"]').forEach(cb => cb.checked = false);
    }
}

function togglePermanentAddress() {
    const checkbox = document.getElementById('sameAsCurrentAddress');
    const permanentFields = document.getElementById('permanentAddressFields');
    
    if (checkbox.checked) {
        permanentFields.style.display = 'none';
        // Clear permanent address fields
        document.getElementById('permanentHouseNo').value = '';
        document.getElementById('permanentStreetName').value = '';
        document.getElementById('permanentBarangay').value = '';
        document.getElementById('permanentMunicipality').value = '';
        document.getElementById('permanentProvince').value = '';
        document.getElementById('permanentCountry').value = 'Philippines';
        document.getElementById('permanentZipCode').value = '';
    } else {
        permanentFields.style.display = 'block';
    }
}

// Toggle SHS Track Selection based on Grade Level and validate average
function toggleTrackAndValidateAverage() {
    const gradeLevel = document.getElementById('gradeLevel').value;
    const trackSelection = document.getElementById('trackSelection');
    const trackSelect = document.getElementById('track');
    const averageInput = document.getElementById('generalAverage');
    const averageHint = document.getElementById('averageHint');
    
    // Show track selection for Grade 11 and 12 only
    if (gradeLevel === '11' || gradeLevel === '12') {
        trackSelection.style.display = 'block';
        trackSelect.required = true;
        averageHint.textContent = 'Enter your general average';
        averageHint.style.color = '#f77f00';
        averageHint.style.fontWeight = 'bold';
    } else {
        trackSelection.style.display = 'none';
        trackSelect.required = false;
        trackSelect.value = ''; // Clear selection
        if (gradeLevel >= '7' && gradeLevel <= '10') {
            averageHint.textContent = 'Enter your general average';
            averageHint.style.color = '#1a4d2e';
            averageHint.style.fontWeight = 'bold';
        } else {
            averageHint.textContent = 'Enter your general average (0-100)';
            averageHint.style.color = '#666';
            averageHint.style.fontWeight = 'normal';
        }
    }
    
    // Just visual feedback for average input
    if (averageInput.value) {
        averageInput.style.borderColor = '#1a4d2e';
        averageInput.style.background = '#e6f7ed';
    }
}

// Calculate age from birth date
function calculateAge() {
    const birthDate = document.getElementById('birthDate').value;
    if (!birthDate) return;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    document.getElementById('age').value = age;
}

// Validate name input (letters only, no numbers)
function validateName(input) {
    // Remove any numbers or special characters except spaces and Ñ/ñ
    input.value = input.value.replace(/[^A-Za-zÑñ\s]/g, '');
    
    // Visual feedback
    if (input.value && /^[A-Za-zÑñ\s]+$/.test(input.value)) {
        input.style.borderColor = '#1a4d2e';
    } else if (input.value) {
        input.style.borderColor = '#dc3545';
    } else {
        input.style.borderColor = '';
    }
}

// Validate LRN input (only numbers, exactly 12 digits)
function validateLRN(input) {
    // Remove non-numeric characters
    input.value = input.value.replace(/[^0-9]/g, '');
    
    // Limit to 12 digits
    if (input.value.length > 12) {
        input.value = input.value.slice(0, 12);
    }
    
    // Visual feedback
    if (input.value.length === 12) {
        input.style.borderColor = '#1a4d2e';
        input.style.background = '#e6f7ed';
    } else {
        input.style.borderColor = '';
        input.style.background = '';
    }
}

// Validation removed - all averages accepted

// Smooth Scroll for Anchor Links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});