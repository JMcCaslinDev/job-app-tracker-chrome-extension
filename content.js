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

// Function to save job data
function saveJobData(jobContainer) {
    const jobTitle = jobContainer.querySelector('.jobsearch-JobInfoHeader-title').textContent;
    const jobCompany = jobContainer.querySelector('[data-testid="inlineHeader-companyName"]').textContent;
    const jobLocation = jobContainer.querySelector('[data-testid="inlineHeader-companyLocation"]').textContent;
    console.log(`Saving Job: ${jobTitle.trim()}, ${jobCompany.trim()}, ${jobLocation.trim()}`);
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
