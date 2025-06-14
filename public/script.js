document.addEventListener('DOMContentLoaded', () => {

    // --- Part 1: Logic for the Welcome Screen (Popup) ---
    const welcomeModal = document.getElementById('welcome-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Show modal on page load immediately as a flex container to center it
    if (welcomeModal) {
        welcomeModal.style.display = 'flex';
    }

    // Event listener to close the modal when the "Let's Glow!" button is clicked
    if (closeModalBtn && welcomeModal) {
        closeModalBtn.addEventListener('click', () => {
            welcomeModal.style.display = 'none'; // Hide the modal
        });
    }

    // --- Part 2: References to UI Elements ---
    const modeSelect = document.getElementById('mode-select');
    const skinFields = document.getElementById('skin-analyzer-fields');
    const makeupFields = document.getElementById('makeup-artist-fields');
    const analysisForm = document.getElementById('analysis-form');
    const loaderOverlay = document.getElementById('loader-overlay');
    const loaderMessageText = document.getElementById('loader-message-text');
    const resultContainer = document.getElementById('result-container');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const uploadedImageDisplay = document.getElementById('uploaded-image-display'); // Reference to image display div


    const historyPanel = document.getElementById('history-panel');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const toggleHistoryBtn = document.getElementById('toggle-history-btn');

    let loaderInterval; // To store the interval ID for clearing
    const HISTORY_KEY = 'glowreader_analysis_history'; // Key for localStorage

    // --- History Functions ---
    function getHistory() {
        try {
            const history = localStorage.getItem(HISTORY_KEY);
            return history ? JSON.parse(history) : [];
        } catch (e) {
            console.error("Error loading history from localStorage:", e);
            return [];
        }
    }

    function saveAnalysis(mode, inputs, analysisSummary, fullAnalysisHtml, imageDataUrl) { // Added imageDataUrl
        const history = getHistory();
        const newEntry = {
            id: Date.now(), // Unique ID for the entry
            timestamp: new Date().toISOString(),
            mode: mode,
            inputs: inputs, // Store a copy of the form inputs
            analysisSummary: analysisSummary, // A brief summary text
            fullAnalysisHtml: fullAnalysisHtml, // Full HTML of the analysis for re-display
            imageDataUrl: imageDataUrl // Save the image data URL
        };
        history.unshift(newEntry); // Add to the beginning (most recent first)
        // Limit history to, say, 10 items
        if (history.length > 10) {
            history.pop();
        }
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
            console.log("Analysis saved to history:", newEntry.id);
        } catch (e) {
            console.error("Error saving history to localStorage:", e);
        }
    }

    function renderHistoryItem(item) {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.dataset.id = item.id; // Store ID for lookup

        const date = new Date(item.timestamp).toLocaleString();
        const modeText = item.mode === 'skin-analyzer' ? 'Skin Analysis' : 'Makeup Tutorial';

        let imagePreview = '';
        if (item.imageDataUrl) {
            imagePreview = `<img src="${item.imageDataUrl}" alt="Analysis Preview" class="history-item-img-preview" />`;
        }

        li.innerHTML = `
            <div class="history-item-header">
                <span class="history-item-mode">${modeText}</span>
                <span class="history-item-date">${date}</span>
            </div>
            <div class="flex items-center mt-2">
                ${imagePreview}
                <p class="history-item-summary ${imagePreview ? 'ml-3' : ''}">${item.analysisSummary}</p>
            </div>
        `;

        li.addEventListener('click', () => {
            displayHistoricalAnalysis(item);
        });
        return li;
    }

    function loadHistory() {
        const history = getHistory();
        historyList.innerHTML = ''; // Clear current list
        if (history.length === 0) {
            const emptyMsg = document.createElement('li');
            emptyMsg.textContent = 'No past analyses yet. Start a new one!';
            emptyMsg.className = 'text-gray-500 italic p-4';
            historyList.appendChild(emptyMsg);
        } else {
            history.forEach(item => {
                historyList.appendChild(renderHistoryItem(item));
            });
        }
        console.log("History loaded and rendered.");
    }

    function displayHistoricalAnalysis(item) {
        // Hide current UI
        analysisForm.classList.add('hidden'); // Use class for consistency
        historyPanel.classList.add('hidden'); // Hide history panel
        loaderOverlay.classList.add('hidden'); // Ensure loader is hidden
        
        // Show result container and populate
        resultContainer.innerHTML = ''; // Clear current results
        resultContainer.classList.remove('hidden'); // Show result container

        // Display historical image
        uploadedImageDisplay.innerHTML = '';
        if (item.imageDataUrl) {
            const img = document.createElement('img');
            img.src = item.imageDataUrl;
            img.alt = 'Uploaded profile picture for analysis';
            img.classList.add('uploaded-analysis-image');
            uploadedImageDisplay.appendChild(img);
            resultContainer.appendChild(uploadedImageDisplay); // Append image container
        }

        const mainAnalysisProseWrapper = document.createElement('div');
        mainAnalysisProseWrapper.className = 'result-card p-6 bg-white shadow-lg rounded-xl';
        
        const proseContentContainer = document.createElement('div');
        proseContentContainer.className = 'prose max-w-full';
        proseContentContainer.innerHTML = item.fullAnalysisHtml; // Use saved HTML directly
        
        mainAnalysisProseWrapper.appendChild(proseContentContainer);
        resultContainer.appendChild(mainAnalysisProseWrapper);

        // For historical display, make all sections instantly visible
        Array.from(proseContentContainer.querySelectorAll('.fade-in-section')).forEach(section => {
            section.classList.add('is-visible');
            section.style.opacity = 1;
            section.style.transform = 'translateY(0)';
        });
        
        backToMenuBtn.classList.remove('hidden');
        console.log("Historical analysis displayed:", item.id);
    }


    function clearHistory() {
        if (confirm('Are you sure you want to clear all your past analyses? This cannot be undone.')) {
            localStorage.removeItem(HISTORY_KEY);
            loadHistory(); // Reloads with empty message
            console.log("History cleared.");
        }
    }

    function toggleHistoryPanel() {
        if (historyPanel.classList.contains('hidden')) {
            historyPanel.classList.remove('hidden');
            analysisForm.classList.add('hidden'); // Hide form
            resultContainer.classList.add('hidden'); // Hide results
            backToMenuBtn.classList.add('hidden'); // Hide back button
            loaderOverlay.classList.add('hidden'); // Ensure loader is hidden
            loadHistory(); // Load history fresh each time it's opened
        } else {
            historyPanel.classList.add('hidden');
            analysisForm.classList.remove('hidden'); // Show form
        }
    }

    // --- Loader Functions ---
    function startLoaderMessages(mode, formData) {
        let messages = [];
        let currentMessageIndex = 0;

        if (mode === 'skin-analyzer') {
            const skinType = formData.get('skinType') || 'your skin';
            const skinProblem = formData.get('skinProblem') || 'its concerns';
            const ageGroup = formData.get('ageGroup') || 'your age group';
            messages = [
                `Analyzing your ${skinType} skin for ${skinProblem}... Aura is on it! ✨`,
                `Deep diving into solutions for ${skinProblem} based on ${ageGroup} needs...`,
                `Crafting your personalized skincare roadmap with cutting-edge AI insights!`,
                `Getting ready to reveal your radiant skin secrets... Almost there!`,
                `Just a moment while Aura formulates your perfect glow-up plan!`
            ];
        } else if (mode === 'makeup-artist') {
            const eventType = formData.get('eventType') || 'your event';
            const dressColor = formData.get('dressColor') || 'your outfit';
            const userStylePreference = formData.get('userStylePreference') || 'your style';
            messages = [
                `Designing your dazzling look for ${eventType}... Aura is bringing the glam! 💄`,
                `Selecting the perfect shades to complement your ${dressColor} outfit and ${userStylePreference} style...`,
                `Aura's virtual brushes are at work, creating your custom makeup tutorial!`,
                `Almost ready to unveil your stunning transformation for ${eventType}!`,
                `Mixing and matching the perfect products for your ultimate glam moment...`
            ];
        } else {
            messages = [`Analyzing... Please wait, Aura is crafting your magic! ✨`];
        }

        loaderMessageText.textContent = messages[currentMessageIndex] + ' ';

        if (loaderInterval) {
            clearInterval(loaderInterval);
        }

        loaderInterval = setInterval(() => {
            currentMessageIndex = (currentMessageIndex + 1) % messages.length;
            loaderMessageText.textContent = messages[currentMessageIndex] + ' ';
        }, 3000); // Change message every 3 seconds
    }

    function stopLoaderMessages() {
        if (loaderInterval) {
            clearInterval(loaderInterval);
            loaderInterval = null;
        }
        loaderMessageText.textContent = 'Analyzing... Please wait, Aura is crafting your magic! ✨'; // Reset to default
    }

    // --- Fix: Changed to function declaration for hoisting ---
    function handleModeChange() { // Changed from const handleModeChange = () => { ... }
        if (!modeSelect || !skinFields || !makeupFields) return;
        if (modeSelect.value === 'skin-analyzer') {
            skinFields.style.display = 'block';
            makeupFields.style.display = 'none';
        } else {
            skinFields.style.display = 'none';
            makeupFields.style.display = 'block';
        }
    }


    // --- Initial setup on DOMContentLoaded ---
    loadHistory(); // Load history when the page loads

    // --- Event Listeners for History UI ---
    if (toggleHistoryBtn) {
        toggleHistoryBtn.addEventListener('click', toggleHistoryPanel);
    }
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearHistory);
    }

    // --- Standard UI Interaction (Mode Change) ---
    if (modeSelect) {
        modeSelect.addEventListener('change', handleModeChange);
    }
    handleModeChange(); // Call once on load to set initial state


    // --- Form Submission Logic with Section-by-Section Animation ---
    if (analysisForm) {
        analysisForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Hide form and results, show loader overlay
            analysisForm.classList.add('hidden'); // Use class for consistency
            resultContainer.classList.add('hidden');
            resultContainer.innerHTML = ''; // Clear previous results
            uploadedImageDisplay.innerHTML = ''; // Clear previous image
            backToMenuBtn.classList.add('hidden');
            historyPanel.classList.add('hidden'); // Ensure history panel is hidden
            loaderOverlay.classList.remove('hidden');

            const formData = new FormData(analysisForm);
            const selectedMode = formData.get('mode');

            // Get uploaded image data for display and history saving
            let imageDataUrl = ''; // Define outside reader.onloadend
            const photoFile = formData.get('photo');
            if (photoFile) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    imageDataUrl = reader.result;
                    const img = document.createElement('img');
                    img.src = imageDataUrl;
                    img.alt = 'Uploaded profile picture for analysis';
                    img.classList.add('uploaded-analysis-image');
                    uploadedImageDisplay.appendChild(img);
                    resultContainer.prepend(uploadedImageDisplay); // Prepend image container
                };
                reader.readAsDataURL(photoFile);
            }

            startLoaderMessages(selectedMode, formData);

            try {
                const response = await fetch('/api/vision', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorDetails = await response.text();
                    throw new Error(`Server error: ${response.statusText}. Details: ${errorDetails}`);
                }

                const result = await response.json();

                stopLoaderMessages();
                loaderOverlay.classList.add('hidden');

                console.log("--- DEBUGGING Frontend Output ---");
                console.log("1. Received full response object from server:", result);

                const analysisText = result.analysisText;
                const skinConcerns = result.skinConcerns;

                // Prepare content for history and display
                const analysisSummary = selectedMode === 'skin-analyzer'
                    ? `Skin analysis for ${formData.get('skinType')} skin, concern: ${formData.get('skinProblem')}`
                    : `Makeup tutorial for ${formData.get('eventType')} event (${formData.get('dressColor')} outfit)`;
                
                const inputsForHistory = {};
                for (const pair of formData.entries()) {
                    inputsForHistory[pair[0]] = pair[1];
                }
                const fullAnalysisHtmlContent = marked.parse(analysisText || '');

                // Save to history before displaying (imageDataUrl will be available due to reader.onloadend)
                // Use a slight delay or ensure imageDataUrl is ready if this causes issues
                // For now, assuming it's quick enough or img is already prepended
                // If imageDataUrl is not immediately available, saveAnalysis might get an empty string.
                // A better approach would be to wait for reader.onloadend to call saveAnalysis,
                // but that adds complexity to the main flow.
                saveAnalysis(selectedMode, inputsForHistory, analysisSummary, fullAnalysisHtmlContent, imageDataUrl);


                // --- Display Analysis Content with Animation ---
                // 1. Handle skin concerns (if any) - this part appears instantly
                if (selectedMode === 'skin-analyzer' && skinConcerns && Object.keys(skinConcerns).length > 0) {
                    console.log("Generating HTML for skin concerns progress bars.");
                    const skinConcernsCard = document.createElement('div');
                    skinConcernsCard.className = 'skin-concerns-card fade-in-section'; // Use new class and mb-6 (margin controlled by this style)
                    
                    let concernsHtml = `<h2 class="skin-concerns-title">Your Skin Concerns at a Glance!</h2><div class="concerns-grid">`;
                    
                    // Emojis for icons
                    const simpleIcons = {
                        "Hydration": "💧",
                        "Oiliness": "✨",
                        "Pores": "🔎",
                        "Redness": "🔴",
                        "Elasticity": "💪",
                        "Dark Spots": "🎯",
                        "Wrinkles": "〰️",
                        "Acne Breakouts": "💥"
                    };

                    Object.keys(skinConcerns).forEach(concernKey => {
                        const percentage = skinConcerns[concernKey];
                        concernsHtml += `
                            <div class="concern-item">
                                <span class="concern-label">${simpleIcons[concernKey] || ''} ${concernKey}</span>
                                <div class="progress-bar-container">
                                    <div class="progress-bar" style="width: ${percentage}%;"></div>
                                </div>
                                <span class="concern-percentage">${percentage}%</span>
                            </div>
                        `;
                    });
                    concernsHtml += `</div>`;
                    skinConcernsCard.innerHTML = concernsHtml;
                    resultContainer.appendChild(skinConcernsCard);
                    setTimeout(() => skinConcernsCard.classList.add('is-visible'), 50); // Small initial delay
                }


                const mainAnalysisProseWrapper = document.createElement('div');
                mainAnalysisProseWrapper.className = 'result-card mb-6 p-6 bg-white shadow-lg rounded-xl'; // Main card for prose content
                // resultContainer.appendChild(mainAnalysisProseWrapper); // Appended later after skin concerns card

                const proseContentContainer = document.createElement('div');
                proseContentContainer.className = 'prose max-w-full';
                mainAnalysisProseWrapper.appendChild(proseContentContainer);

                // Start DOM manipulation for section animation
                try {
                    const tempProcessorDiv = document.createElement('div');
                    tempProcessorDiv.innerHTML = fullAnalysisHtmlContent;
                    
                    let currentSectionGroup = []; // Collects elements for the current section to be animated
                    const sectionDelay = 200; // Milliseconds between each section appearing
                    let currentAnimationDelay = (selectedMode === 'skin-analyzer' && skinConcerns && Object.keys(skinConcerns).length > 0) ? sectionDelay + 100 : 0; // Delay after skin concerns card if present

                    Array.from(tempProcessorDiv.children).forEach(child => {
                        // Start a new animated section if it's a major heading (H1, H3, H4, H5) or an HR
                        // AND we've already collected some content for the *current* section.
                        if (['H1', 'H3', 'H4', 'H5', 'HR'].includes(child.tagName) && currentSectionGroup.length > 0) {
                            const sectionWrapper = document.createElement('div');
                            sectionWrapper.className = 'fade-in-section';
                            sectionWrapper.style.marginBottom = '2rem'; // Spacing between animated sections
                            sectionWrapper.style.padding = '0 1.5rem'; // Padding for content within the section
                            sectionWrapper.style.maxWidth = '100%';
                            
                            currentSectionGroup.forEach(elHtml => sectionWrapper.innerHTML += elHtml);
                            proseContentContainer.appendChild(sectionWrapper);
                            
                            setTimeout(() => {
                                sectionWrapper.classList.add('is-visible');
                            }, currentAnimationDelay);
                            currentAnimationDelay += sectionDelay;

                            currentSectionGroup = [];
                        }
                        currentSectionGroup.push(child.outerHTML);
                    });

                    // Append the very last section after the loop finishes
                    if (currentSectionGroup.length > 0) {
                        const sectionWrapper = document.createElement('div');
                        sectionWrapper.className = 'fade-in-section';
                        sectionWrapper.style.marginBottom = '2rem';
                        sectionWrapper.style.padding = '0 1.5rem';
                        sectionWrapper.style.maxWidth = '100%';
                        currentSectionGroup.forEach(elHtml => sectionWrapper.innerHTML += elHtml);
                        proseContentContainer.appendChild(sectionWrapper);
                        setTimeout(() => {
                            sectionWrapper.classList.add('is-visible');
                        }, currentAnimationDelay);
                    }
                    
                    // Only append mainAnalysisProseWrapper here AFTER all its content is processed
                    resultContainer.appendChild(mainAnalysisProseWrapper);


                    // Show results and back button after animations are scheduled
                    resultContainer.classList.remove('hidden');
                    backToMenuBtn.classList.remove('hidden');
                    console.log('DEBUG: Result container and back button should now be visible.');

                } catch (domError) {
                    console.error('CRITICAL DOM MANIPULATION ERROR during section animation:', domError);
                    resultContainer.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded-lg">A critical error occurred while preparing analysis content: ${domError.message}. Please try again.</div>`;
                    resultContainer.classList.remove('hidden');
                    backToMenuBtn.classList.remove('hidden');
                }

            } catch (error) { // Catch for fetch errors
                console.error('ERROR during analysis fetch:', error);
                if (resultContainer) {
                    resultContainer.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded-lg">An error occurred during analysis: ${error.message}. Please try again, and ensure your photo is clear!</div>`;
                    resultContainer.classList.remove('hidden');
                    backToMenuBtn.classList.remove('hidden');
                }
            } finally {
                analysisForm.classList.add('hidden'); // Use class for consistency
                loaderOverlay.classList.add('hidden');
                stopLoaderMessages();
            }
        });
    }

    // ATTACH LISTENER FOR backToMenuBtn *AFTER* all other DOM elements are guaranteed to be present and available.
    // This listener must be at the very end of DOMContentLoaded to ensure the element exists.
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            console.log('DEBUG: backToMenuBtn clicked!');
            resultContainer.classList.add('hidden'); // Hide the analysis results
            resultContainer.innerHTML = ''; // Clear results content
            backToMenuBtn.classList.add('hidden'); // Hide the back button itself
            analysisForm.classList.remove('hidden'); // Use class for consistency
            analysisForm.reset(); // Optionally reset all form fields
            handleModeChange(); // Ensure correct fields are visible for the default mode
            console.log('DEBUG: UI reset complete.');
        });
    } else {
        console.error('ERROR: backToMenuBtn element not found on DOMContentLoaded!');
    }

});