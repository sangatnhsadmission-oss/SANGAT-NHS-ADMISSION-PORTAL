// ===== IMPORTANT: CONFIGURE YOUR GOOGLE APPS SCRIPT URL HERE =====
// Replace this with your actual Google Apps Script Web App URL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwvsvitgZqCrt81gphSS-yo9bUBv2WeHki1cRXfiEIo9vKIacia2OTvSlcjgBYKv0tKXg/exec';
// Example: 'https://script.google.com/macros/s/AKfycby.../exec'
// ==================================================================

// Global variable to store current filter
let currentFilter = 'all';
let allEnrollments = [];

// ===== CHECK IF USER IS LOGGED IN =====
document.addEventListener('DOMContentLoaded', function() {
    // Check if user logged in from index page
    if (!isLoggedIn()) {
        // Not logged in, redirect back to home
        alert('⚠️ Please login first to access the admin dashboard.');
        window.location.href = ' Sangat Portal.html';
        return;
    }
    
    // User is logged in, load the dashboard
    loadEnrollments();
});

// Check if user is logged in
function isLoggedIn() {
    return sessionStorage.getItem('adminLoggedIn') === 'true';
}

// Logout function
function logoutAdmin() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminLoggedIn');
        window.location.href = ' Sangat Portal.html';
    }
}

// Load enrollments from Google Sheets backend
async function loadEnrollments() {
    const container = document.getElementById('enrollmentsContainer');
    const emptyState = document.getElementById('emptyState');
    

    
    // Show loading state
    container.innerHTML = `
        <div class="empty-state show">
            <div class="empty-icon">⏳</div>
            <h2>Loading Enrollments...</h2>
            <p>Please wait while we fetch the data from the server.</p>
        </div>
    `;
    
    try {
        // Fetch data from Google Sheets
        const response = await fetch(SCRIPT_URL + '?action=getEnrollments');
        const data = await response.json();
        
        if (data.success && data.enrollments) {
            allEnrollments = data.enrollments;
        } else {
            allEnrollments = [];
        }
        
    } catch (error) {
        console.error('Error loading enrollments:', error);
        console.error('SCRIPT_URL being used:', SCRIPT_URL);
        
        container.innerHTML = `
            <div class="empty-state show">
                <div class="empty-icon">⚠️</div>
                <h2>Connection Error</h2>
                <p><strong>Unable to load enrollments from the server.</strong></p>
                
                <div style="background: #fff3cd; padding: 15px; margin: 20px auto; max-width: 600px; border-radius: 8px; text-align: left;">
                    <p style="margin: 0; color: #856404;"><strong>🔍 DEBUG INFO:</strong></p>
                    <p style="margin: 5px 0; color: #856404; font-size: 0.85rem; word-break: break-all;">
                        <strong>URL:</strong> ${SCRIPT_URL}
                    </p>
                    <p style="margin: 5px 0; color: #856404; font-size: 0.85rem;">
                        <strong>Error:</strong> ${error.message || error}
                    </p>
                </div>
                
                <p style="color: #666; margin-top: 15px;">Possible causes:</p>
                <ul style="text-align: left; max-width: 500px; margin: 15px auto; color: #666;">
                    <li>Google Apps Script URL is incorrect</li>
                    <li>Script is not deployed or deployment failed</li>
                    <li>Script permissions not granted</li>
                    <li>Internet connection issue</li>
                    <li>CORS/network restrictions</li>
                </ul>
                <p style="margin-top: 20px;"><strong>What to check:</strong></p>
                <ol style="text-align: left; max-width: 500px; margin: 15px auto;">
                    <li>Verify the SCRIPT_URL in admin-script.js line 3</li>
                    <li>URL should end with /exec</li>
                    <li>Make sure script is deployed as "Anyone" can access</li>
                    <li>Open browser console (Press F12) for detailed errors</li>
                    <li>Try redeploying the Google Apps Script</li>
                </ol>
                <div style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="loadEnrollments()" style="margin: 10px;">🔄 Retry</button>
                    <button class="btn btn-secondary" onclick="window.location.href='portal.html'" style="margin: 10px;">🏠 Back to Home</button>
                </div>
            </div>
        `;
        return;
    }
    
    // Update summary statistics
    updateSummary(allEnrollments);
    
    // Display enrollments
    displayEnrollments(allEnrollments, currentFilter);
}

// Update summary statistics
function updateSummary(enrollments) {
    const total = enrollments.length;
    const juniorHigh = enrollments.filter(e => ['7', '8', '9', '10'].includes(e.gradeLevel)).length;
    const seniorHigh = enrollments.filter(e => ['11', '12'].includes(e.gradeLevel)).length;
    
    document.getElementById('totalEnrollments').textContent = total;
    document.getElementById('juniorHighTotal').textContent = juniorHigh;
    document.getElementById('seniorHighTotal').textContent = seniorHigh;
}

// Display enrollments grouped by grade level
function displayEnrollments(enrollments, filter = 'all') {
    const container = document.getElementById('enrollmentsContainer');
    const emptyState = document.getElementById('emptyState');
    
    // Clear container
    container.innerHTML = '';
    
    // Show empty state if no enrollments
    if (enrollments.length === 0) {
        emptyState.classList.add('show');
        return;
    } else {
        emptyState.classList.remove('show');
    }
    
    // Filter enrollments
    let filteredEnrollments = enrollments;
    if (filter !== 'all') {
        filteredEnrollments = enrollments.filter(e => e.gradeLevel === filter);
    }
    
    // If filtered results are empty
    if (filteredEnrollments.length === 0) {
        container.innerHTML = `
            <div class="empty-state show">
                <div class="empty-icon">🔍</div>
                <h2>No Students Found</h2>
                <p>There are no enrollments for Grade ${filter}.</p>
            </div>
        `;
        return;
    }
    
    // Group by grade level
    const gradeGroups = {
        '7': [],
        '8': [],
        '9': [],
        '10': [],
        '11': [],
        '12': []
    };
    
    filteredEnrollments.forEach(enrollment => {
        if (gradeGroups[enrollment.gradeLevel]) {
            gradeGroups[enrollment.gradeLevel].push(enrollment);
        }
    });
    
    // Display each grade group
    Object.keys(gradeGroups).forEach(grade => {
        if (gradeGroups[grade].length > 0) {
            const gradeSection = createGradeSection(grade, gradeGroups[grade]);
            container.appendChild(gradeSection);
        }
    });
}

// Create a grade section with student cards
function createGradeSection(grade, students) {
    const section = document.createElement('div');
    section.className = 'grade-section';
    
    const header = document.createElement('div');
    header.className = 'grade-header';
    header.innerHTML = `
        <h2>Grade ${grade}</h2>
        <span class="student-count">${students.length} Student${students.length !== 1 ? 's' : ''}</span>
    `;
    
    const studentsGrid = document.createElement('div');
    studentsGrid.className = 'students-grid';
    
    students.forEach(student => {
        const studentCard = createStudentCard(student);
        studentsGrid.appendChild(studentCard);
    });
    
    section.appendChild(header);
    section.appendChild(studentsGrid);
    
    return section;
}

// Create a student card
function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    card.setAttribute('data-id', student.id);
    
    const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;
    
    card.innerHTML = `
        <div class="student-header">
            <div>
                <div class="student-name">${fullName}</div>
                <div class="student-id">LRN: ${student.lrn || 'N/A'}</div>
            </div>
            <div class="student-grade-badge">Grade ${student.gradeLevel}${student.track && student.track !== 'N/A' ? ' - ' + student.track : ''}</div>
        </div>
        
        <div class="student-details">
            <div class="detail-group">
                <span class="detail-label">📅 Date of Birth</span>
                <span class="detail-value">${student.birthDate} (Age: ${student.age})</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">⚧ Gender</span>
                <span class="detail-value">${capitalizeFirst(student.gender)}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">📍 Place of Birth</span>
                <span class="detail-value">${student.placeOfBirth || 'N/A'}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">✝️ Religion</span>
                <span class="detail-value">${student.religion || 'N/A'}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">🗣️ Mother Tongue</span>
                <span class="detail-value">${student.motherTongue || 'N/A'}</span>
            </div>
            ${student.psaBirthCertNo ? `
            <div class="detail-group">
                <span class="detail-label">📄 PSA Birth Cert No</span>
                <span class="detail-value">${student.psaBirthCertNo}</span>
            </div>
            ` : ''}
            <div class="detail-group">
                <span class="detail-label">👥 Indigenous Peoples</span>
                <span class="detail-value">${student.isIndigenous === 'yes' ? 'Yes - ' + (student.ipCommunity || 'N/A') : 'No'}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">💰 4Ps Beneficiary</span>
                <span class="detail-value">${student.is4PsBeneficiary === 'yes' ? 'Yes - ' + (student.fourPsHouseholdId || 'N/A') : 'No'}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">🏠 Current Address</span>
                <span class="detail-value">${student.houseNo || ''} ${student.streetName || ''}, ${student.barangay || ''}, ${student.municipality || ''}, ${student.province || ''} ${student.zipCode || ''}</span>
            </div>
            ${student.sameAsCurrentAddress !== 'Yes' && student.permanentHouseNo ? `
            <div class="detail-group">
                <span class="detail-label">🏠 Permanent Address</span>
                <span class="detail-value">${student.permanentHouseNo} ${student.permanentStreetName}, ${student.permanentBarangay}, ${student.permanentMunicipality}, ${student.permanentProvince} ${student.permanentZipCode}</span>
            </div>
            ` : ''}
            <div class="detail-group">
                <span class="detail-label">📞 Contact Number</span>
                <span class="detail-value">${student.contactNumber}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">📧 Email</span>
                <span class="detail-value">${student.email || 'N/A'}</span>
            </div>
            <div class="detail-group">
                <span class="detail-label">📊 General Average</span>
                <span class="detail-value" style="color: #1a4d2e; font-weight: bold;">${student.generalAverage}%</span>
            </div>
            ${student.semester && student.semester !== 'N/A' ? `
            <div class="detail-group">
                <span class="detail-label">📅 Semester</span>
                <span class="detail-value">${student.semester}</span>
            </div>
            ` : ''}
            ${student.track && student.track !== 'N/A' ? `
            <div class="detail-group">
                <span class="detail-label">🎓 Track/Strand</span>
                <span class="detail-value">${student.track}</span>
            </div>
            ` : ''}
            <div class="detail-group">
                <span class="detail-label">🏫 Last School</span>
                <span class="detail-value">${student.lastSchool}</span>
            </div>
            ${student.isSpecialNeeds === 'yes' ? `
            <div class="detail-group">
                <span class="detail-label">🧩 Special Needs Education</span>
                <span class="detail-value">Yes</span>
            </div>
            ${student.diagnosis ? `
            <div class="detail-group">
                <span class="detail-label">📋 Diagnosis</span>
                <span class="detail-value">${student.diagnosis}</span>
            </div>
            ` : ''}
            ${student.manifestations ? `
            <div class="detail-group">
                <span class="detail-label">🔍 Manifestations</span>
                <span class="detail-value">${student.manifestations}</span>
            </div>
            ` : ''}
            ${student.hasPWDID ? `
            <div class="detail-group">
                <span class="detail-label">🆔 PWD ID</span>
                <span class="detail-value">${student.hasPWDID === 'yes' ? 'Yes' : 'No'}</span>
            </div>
            ` : ''}
            ` : ''}
            ${student.lastGradeCompleted ? `
            <div class="detail-group">
                <span class="detail-label">📚 Last Grade Completed</span>
                <span class="detail-value">${student.lastGradeCompleted}</span>
            </div>
            ` : ''}
            ${student.lastSchoolYearCompleted ? `
            <div class="detail-group">
                <span class="detail-label">📅 Last School Year</span>
                <span class="detail-value">${student.lastSchoolYearCompleted}</span>
            </div>
            ` : ''}
            ${student.lastSchoolAttended ? `
            <div class="detail-group">
                <span class="detail-label">🏫 Previous School</span>
                <span class="detail-value">${student.lastSchoolAttended}</span>
            </div>
            ` : ''}
            <div class="detail-group">
                <span class="detail-label">📚 School Year</span>
                <span class="detail-value">${student.schoolYear}</span>
            </div>
            ${student.learningModalities ? `
            <div class="detail-group">
                <span class="detail-label">💻 Learning Modalities</span>
                <span class="detail-value">${student.learningModalities}</span>
            </div>
            ` : ''}
        </div>
        
        <div class="parent-info-section">
            <h4 style="color: var(--primary); margin-bottom: 1rem; font-size: 1rem;">👨‍👩‍👧 Parent/Guardian Information</h4>
            <div class="parent-grid">
                <div class="parent-column">
                    <strong style="color: var(--primary);">👨 Father:</strong>
                    <p>${student.fatherName || 'N/A'}</p>
                    <p>📱 ${student.fatherContact || 'N/A'}</p>
                    <p>📧 ${student.fatherEmail || 'N/A'}</p>
                    ${student.fatherOccupation ? `<p>💼 ${student.fatherOccupation}</p>` : ''}
                </div>
                <div class="parent-column">
                    <strong style="color: var(--primary);">👩 Mother:</strong>
                    <p>${student.motherName || 'N/A'}</p>
                    <p>📱 ${student.motherContact || 'N/A'}</p>
                    <p>📧 ${student.motherEmail || 'N/A'}</p>
                    ${student.motherOccupation ? `<p>💼 ${student.motherOccupation}</p>` : ''}
                </div>
            </div>
            ${student.guardianName ? `
            <div style="margin-top: 1rem; padding: 1rem; background: white; border-radius: 6px; border-left: 3px solid #f77f00;">
                <strong style="color: var(--primary);">👤 Guardian: ${student.guardianRelationship ? '(' + student.guardianRelationship + ')' : ''}</strong>
                <p>${student.guardianName}</p>
                <p>📱 ${student.guardianContact || 'N/A'}</p>
                <p>📧 ${student.guardianEmail || 'N/A'}</p>
            </div>
            ` : ''}
        </div>
        
        <div class="student-footer">
            <span class="submitted-date">Submitted: ${student.submittedDate}</span>
            <button class="delete-btn" onclick="deleteEnrollment(${student.id})">🗑️ Delete</button>
        </div>
    `;
    
    return card;
}

// Filter enrollments by grade
function filterByGrade(grade) {
    currentFilter = grade;
    
    // Update active tab
    document.querySelectorAll('.grade-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Reload enrollments with filter
    loadEnrollments();
}

// Delete a single enrollment
async function deleteEnrollment(id) {
    if (!confirm('Are you sure you want to delete this enrollment?')) {
        return;
    }
    
    try {
        // Delete from backend
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete',
                id: id
            })
        });
        
        // Reload data
        await loadEnrollments();
        alert('Enrollment deleted successfully.');
        
    } catch (error) {
        console.error('Error deleting enrollment:', error);
        alert('Failed to delete enrollment. Please try again.');
    }
}

// Clear all enrollment data
async function clearAllData() {
    if (!confirm('⚠️ WARNING: This will delete ALL enrollment data permanently. Are you sure?')) {
        return;
    }
    
    if (!confirm('This action cannot be undone. Click OK to confirm deletion.')) {
        return;
    }
    
    try {
        // Clear from backend
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'clearAll'
            })
        });
        
        // Reload
        allEnrollments = [];
        updateSummary(allEnrollments);
        displayEnrollments(allEnrollments, currentFilter);
        
        alert('All enrollment data has been deleted.');
        
    } catch (error) {
        console.error('Error clearing data:', error);
        alert('Failed to clear all data. Please try again.');
    }
}

// Export to CSV
function exportToCSV() {
    const enrollments = allEnrollments;
    
    if (enrollments.length === 0) {
        alert('No data to export!');
        return;
    }
    
    // Group by grade level
    const gradeGroups = {
        '7': [],
        '8': [],
        '9': [],
        '10': [],
        '11': [],
        '12': []
    };
    
    enrollments.forEach(student => {
        if (gradeGroups[student.gradeLevel]) {
            gradeGroups[student.gradeLevel].push(student);
        }
    });
    
    // CSV Headers
    const headers = [
        'Last Name', 'First Name', 'Middle Name', 'Date of Birth', 'Age', 'Gender', 'LRN',
        'Address', 'Contact Number', 'Email', 'Grade Level', 'Track/Strand', 'General Average', 'School Year',
        'Last School', 'Father Name', 'Father Contact', 'Father Email', 'Father Occupation',
        'Mother Name', 'Mother Contact', 'Mother Email', 'Mother Occupation',
        'Guardian Name', 'Guardian Contact', 'Guardian Email', 'Guardian Relationship', 'Submitted Date'
    ];
    
    let filesCreated = 0;
    
    // Create CSV for each grade level
    Object.keys(gradeGroups).forEach(gradeLevel => {
        const students = gradeGroups[gradeLevel];
        
        if (students.length === 0) return; // Skip empty grades
        
        // Create CSV content
        let csvContent = headers.join(',') + '\n';
        
        students.forEach(student => {
            const row = [
                student.lastName,
                student.firstName,
                student.middleName || '',
                student.birthDate,
                student.age || '',
                student.gender,
                student.lrn || '',
                `"${student.address}"`,
                student.contactNumber,
                student.email || '',
                student.gradeLevel,
                student.track || 'N/A',
                student.generalAverage || '',
                student.schoolYear,
                `"${student.lastSchool}"`,
                student.fatherName || '',
                student.fatherContact || '',
                student.fatherEmail || '',
                student.fatherOccupation || '',
                student.motherName || '',
                student.motherContact || '',
                student.motherEmail || '',
                student.motherOccupation || '',
                student.guardianName || '',
                student.guardianContact || '',
                student.guardianEmail || '',
                student.guardianRelationship || '',
                student.submittedDate
            ];
            csvContent += row.join(',') + '\n';
        });
        
        // Create download link for this grade
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const trackInfo = students[0].track && students[0].track !== 'N/A' ? `_${students[0].track}` : '';
        const filename = `Grade_${gradeLevel}${trackInfo}_Enrollments_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        filesCreated++;
    });
    
    if (filesCreated > 0) {
        alert(`✅ Export Successful!\n\n${filesCreated} CSV files downloaded (one per grade level)\n\nEach file contains:\n- All students from that grade\n- Complete enrollment information\n- Parent and guardian details\n\nFiles saved to your Downloads folder.`);
    } else {
        alert('No data available to export.');
    }
}

// Print data
function printData() {
    window.print();
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Helper function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}