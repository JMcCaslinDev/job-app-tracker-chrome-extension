// brings in global variables from config file
const BASE_URL = CONFIG.DEV_MODE ? CONFIG.DEV_BASE_URL : CONFIG.BASE_URL;

console.log(`Running in ${CONFIG.DEV_MODE ? 'development' : 'production'} mode.`);

// Function to add the save job button
function addSaveJobButton() {
    const jobDetailContainer = document.querySelector('.jobsearch-ViewJobLayout--embedded');
    console.log("Checking for jobDetailContainer.");
    if (jobDetailContainer && !jobDetailContainer.querySelector('.save-job-btn')) {
        console.log("Adding 'Save Job' button.");
        const button = document.createElement('button');
        button.textContent = 'Save Job';
        button.classList.add('save-job-btn', 'icl-Button', 'icl-Button--primary', 'icl-Button--sm');
        button.style.margin = '10px';
        button.style.padding = '0px'; // Remove padding to allow line-height to control text alignment
        button.style.width = '80px';  // Specify width to ensure square shape
        button.style.height = '50px'; // Specify height to ensure square shape
        button.style.lineHeight = '50px'; // Set line-height equal to height for vertical centering
        button.style.fontSize = '14px';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.border = 'none';
        button.style.backgroundColor = '#2557a7';
        button.style.color = 'white';
        button.style.textAlign = 'center'; // Ensure text is centered horizontally
        button.onmouseenter = function() {
            this.style.backgroundColor = '#194581';
        };
        button.onmouseleave = function() {
            this.style.backgroundColor = '#2557a7';
        };
        button.onclick = function() {
            console.log("Save Job button clicked.");
            saveJobData(jobDetailContainer);
        };

        const header = jobDetailContainer.querySelector('.jobsearch-HeaderContainer');
        if (header) {
            header.appendChild(button);
            console.log("Button added.");
        } else {
            console.error('Header not found.');
        }
    } else {
        console.log("Button already exists or container not found.");
    }
}

function saveJobData(jobContainer) {
    try {
        // Check if the jobContainer is still in the DOM
        if (!document.body.contains(jobContainer)) {
            throw new Error("Extension context invalidated or DOM element not found.");
        }

        console.log("Starting to save job data.");

        const safeTextContent = (selector) => {
            const element = jobContainer.querySelector(selector);
            return element ? element.textContent.trim() : '';
        };

        // Extract job title and company
        const jobTitle = safeTextContent('.jobsearch-JobInfoHeader-title').replace(/\s-\sjob\spost$/, '');
        console.log("\njobTitle: ", jobTitle, "\n");
        const jobCompany = safeTextContent('[data-company-name="true"]');
        console.log("\njobCompany: ", jobCompany, "\n");

        // Extract job location and determine work mode
        const jobLocation = safeTextContent('[data-testid="inlineHeader-companyLocation"]');
        let workLocationMode = 'On-site';
        if (jobLocation.toLowerCase().includes('hybrid')) {
            workLocationMode = 'Hybrid';
        } else if (jobLocation.toLowerCase().includes('remote')) {
            workLocationMode = 'Remote';
        }
        console.log("\nworkLocationMode: ", workLocationMode, "\n");

        const cleanedJobLocation = jobLocation.replace(/•|hybrid\s*work|remote\s*work|-/gi, '').trim();
        console.log("\ncleanedJobLocation: ", cleanedJobLocation, "\n");

        // Extract pay information
        let basePay = null;
        let maxPay = null;
        let payType = 'Not specified';

        const payElements = jobContainer.querySelectorAll('[data-testid="detailSalary"], #salaryInfoAndJobType');
        for (const payElement of payElements) {
            const payText = payElement.textContent.trim();
            const payMatch = payText.match(/(?:From\s+)?\$(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:an?\s+hour|a\s+year)?(?:\s*[-–]\s*\$(\d+(?:,\d+)*(?:\.\d+)?)(?:\s*an?\s+hour|\s*a\s+year)?)?/i);
            if (payMatch) {
                basePay = parseFloat(payMatch[1].replace(/,/g, ''));
                if (payMatch[2]) {
                    maxPay = parseFloat(payMatch[2].replace(/,/g, ''));
                }
                payType = payText.toLowerCase().includes('hour') ? 'Hourly' : 'Salary';
                break;
            }
        }
        console.log("\nbasePay: ", basePay, "\n");
        console.log("\nmaxPay: ", maxPay, "\n");
        console.log("\npayType: ", payType, "\n");

        // Extract employment type
        let employmentType = 'Not specified';
        const employmentTypeElements = jobContainer.querySelectorAll('[data-testid="detailJobType"], #salaryInfoAndJobType');
        for (const employmentTypeElement of employmentTypeElements) {
            const typeText = employmentTypeElement.textContent.trim();
            const typeMatch = typeText.match(/(Full-time|Part-time|Contract|Temporary|Internship)/i);
            if (typeMatch) {
                employmentType = typeMatch[1];
                break;
            }
        }
        console.log("\nemploymentType: ", employmentType, "\n");

        // Extract experience level
        let experienceLevel = 'Not specified';
        const experienceLevelElement = jobContainer.querySelector('[data-testid="detailExperienceRequirements"]');
        if (experienceLevelElement) {
            const levelText = experienceLevelElement.textContent.trim();
            const levelMatch = levelText.match(/(Entry level|Mid level|Senior level)/i);
            if (levelMatch) {
                experienceLevel = levelMatch[1];
            }
        }
        console.log("\nexperienceLevel: ", experienceLevel, "\n");

        // Extract job description
        const jobDescriptionElement = jobContainer.querySelector('.jobsearch-jobDescriptionText') || jobContainer.querySelector('#jobDescriptionText');
        const jobDescriptionText = jobDescriptionElement ? jobDescriptionElement.innerText : '';

        // Build job posting URL
        const jobPostingUrl = window.location.href;
        console.log("\njobPostingUrl: ", jobPostingUrl, "\n");

        // Prepare job data object
        const jobData = {
            account_id: "default_account_id", // This should be dynamically set based on user browser storage extension_token
            company_name: jobCompany,
            job_title: jobTitle,
            application_status: "Applied",
            date_applied: new Date().toISOString(),
            job_description: jobDescriptionText,
            notes: "",
            application_method: "Indeed",
            base_pay: basePay,
            max_pay: maxPay,
            job_posting_url: jobPostingUrl,
            pay_type: payType,
            employment_type: employmentType,
            work_location_mode: workLocationMode,
            location: cleanedJobLocation,
            experience_level: experienceLevel,
            pinned: false
        };

        console.log("Extracted job data:", jobData);

        // Fetch token from chrome.storage.local
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get('extension_token', function(data) {
                if (!data.extension_token) {
                    console.error('Token not found in chrome.storage.local');
                    chrome.tabs.create({ url: `${BASE_URL}/dashboard` });
                    return;
                }
                const token = data.extension_token;
                console.log("Token found:", token);

                // Send job data to server
                fetch(`${BASE_URL}/chromeExtension/api/jobs`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(jobData),
                })
                .then(response => {
                    console.log("Server response received, status:", response.status);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Job saved successfully:', data);
                })
                .catch(error => {
                    console.error('Error saving job:', error);
                });
            });
        } else {
            console.error('chrome.storage.local is not available. Make sure you are running this within a Chrome extension.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Mutation observer to react to changes in the DOM
const observer = new MutationObserver((mutations, obs) => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && (node.matches('.jobsearch-ViewJobLayout--embedded') || node.querySelector('.jobsearch-ViewJobLayout--embedded'))) {
                    console.log("Detected changes in job details area.");
                    addSaveJobButton();
                }
            });
        }
    });
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log("Observer set up. Monitoring for changes.");