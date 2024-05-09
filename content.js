console.log("Script starting.");

// Function to add the save job button
function addSaveJobButton() {
    const jobDetailContainer = document.querySelector('.jobsearch-ViewJobLayout--embedded');
    if (jobDetailContainer && !jobDetailContainer.querySelector('.save-job-btn')) {
        console.log("Adding button.");
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
    const safeTextContent = (selector) => {
        const element = jobContainer.querySelector(selector);
        return element ? element.textContent.trim() : '';
    };

    // Basic job info
    const jobTitle = safeTextContent('.jobsearch-JobInfoHeader-title').replace(/\s-\sjob\spost$/, '');
    const jobCompany = safeTextContent('[data-testid="inlineHeader-companyName"]');
    const jobLocation = safeTextContent('[data-testid="inlineHeader-companyLocation"]');

    // Pay from the top row
    const topRowPay = safeTextContent('#salaryInfoAndJobType');
    const topRowPayRange = topRowPay.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)\s*-\s*\$(\d+(?:,\d+)*(?:\.\d+)?)/i);
    const topRowMinPay = topRowPayRange ? topRowPayRange[1] : '';
    const topRowMaxPay = topRowPayRange ? topRowPayRange[2] : '';

    // Employment type from the top row
    const topRowEmploymentType = topRowPay.match(/(Full-time|Part-time|Contract|Temporary|Internship)/i);

    // Pay and employment type from the job details section
    const jobDetails = jobContainer.querySelector('#jobDetails');
    const payElement = jobDetails ? jobDetails.querySelector('[data-testid="detailSalary"]') : null;
    const payText = payElement ? payElement.textContent.trim() : '';
    const payRange = payText.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)\s*-\s*\$(\d+(?:,\d+)*(?:\.\d+)?)/i);
    const minPay = payRange ? payRange[1] : '';
    const maxPay = payRange ? payRange[2] : '';

    const employmentTypeElement = jobDetails ? jobDetails.querySelector('[data-testid="detailJobType"]') : null;
    const employmentType = employmentTypeElement ? employmentTypeElement.textContent.trim() : '';

    const workSettingElement = jobDetails ? jobDetails.querySelector('[data-testid="detailWorkSetting"]') : null;
    const workSetting = workSettingElement ? workSettingElement.textContent.trim() : '';

    // Determine the pay amount and type
    const minPayAmount = topRowMinPay || minPay;
    const maxPayAmount = topRowMaxPay || maxPay;
    const pay = minPayAmount && maxPayAmount ? `${minPayAmount} - ${maxPayAmount}` : minPayAmount || maxPayAmount || 'Not specified';
    const payType = minPayAmount && maxPayAmount ? 'Salary' : 'Not specified';

    const finalEmploymentType = topRowEmploymentType ? topRowEmploymentType[1] : employmentType || 'Not specified';

    const jobDescriptionElement = jobContainer.querySelector('.jobsearch-jobDescriptionText');
    const jobDescriptionText = jobDescriptionElement ? jobDescriptionElement.innerText : '';

    // Build job posting URL
    const jobPostingUrl = window.location.href;

    const jobData = {
        account_id: "default_account_id",
        company_name: jobCompany,
        job_title: jobTitle,
        application_status: "To Apply",
        date_applied: new Date().toISOString(),
        job_description: jobDescriptionText,
        notes: "",
        application_method: "Indeed",
        pay_amount: pay,
        job_posting_url: jobPostingUrl,
        pay_type: payType,
        employment_type: finalEmploymentType,
        work_location_mode: workSetting || 'Not specified',
        location: jobLocation,
        experience_level: "Not Specified",
        pinned: false
    };

    console.log("Job Data to be saved:", jobData);
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
