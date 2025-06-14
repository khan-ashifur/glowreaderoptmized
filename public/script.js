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

    let loaderInterval; // To store the interval ID for clearing

    const handleModeChange = () => {
        if (!modeSelect || !skinFields || !makeupFields) return;
        if (modeSelect.value === 'skin-analyzer') {
            skinFields.style.display = 'block';
            makeupFields.style.display = 'none';
        } else {
            skinFields.style.display = 'none';
            makeupFields.style.display = 'block';
        }
    };

    if (modeSelect) {
        modeSelect.addEventListener('change', handleModeChange);
    }
    handleModeChange(); // Call once on load to set initial state

    // Function to cycle through personalized loader messages
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

    // --- Back to Main Menu Button Functionality ---
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            resultContainer.classList.add('hidden'); // Hide the analysis results
            resultContainer.innerHTML = ''; // Clear results content
            backToMenuBtn.classList.add('hidden'); // Hide the back button itself
            analysisForm.classList.remove('hidden'); // Show the form again
            analysisForm.reset(); // Optionally reset all form fields
            handleModeChange(); // Ensure correct fields are visible for the default mode
        });
    }

    // --- Part 3: Form Submission Logic with Section-by-Section Animation ---
    if (analysisForm) {
        analysisForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Hide the form and show the loader overlay
            analysisForm.classList.add('hidden');
            resultContainer.innerHTML = ''; // Clear previous results
            resultContainer.classList.add('hidden'); // Hide results until ready
            backToMenuBtn.classList.add('hidden'); // Ensure back button is hidden initially
            loaderOverlay.classList.remove('hidden'); // Show the full-screen loader

            const formData = new FormData(analysisForm);
            const selectedMode = formData.get('mode');

            startLoaderMessages(selectedMode, formData); // Start personalized loader messages

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

                stopLoaderMessages(); // Stop loader messages once response is received
                loaderOverlay.classList.add('hidden'); // Hide the full-screen loader

                console.log("--- DEBUGGING Frontend Output ---");
                console.log("1. Received full response object from server:", result);

                const analysisText = result.analysisText;
                const skinConcerns = result.skinConcerns;

                // --- Build HTML and Animate Sections ---

                // 1. Handle skin concerns (if any) - this part appears instantly
                if (skinConcerns && Object.keys(skinConcerns).length > 0) {
                    console.log("Generating HTML for skin concerns progress bars.");
                    const skinConcernsCard = document.createElement('div');
                    skinConcernsCard.className = 'result-card mb-6 p-6 bg-white shadow-lg rounded-xl fade-in-section';
                    let concernsHtml = `<h2 class="text-2xl font-bold text-pink-600 mb-4">Your Skin Concerns at a Glance!</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-4">`;
                    for (const concernName in skinConcerns) {
                        if (Object.hasOwnProperty.call(skinConcerns, concernName)) {
                            const percentage = skinConcerns[concernName];
                            concernsHtml += `<div class="form-control mb-2"><label class="label"><span class="label-text text-gray-700 font-medium">${concernName}</span><span class="label-text-alt text-pink-500 font-semibold">${percentage}%</span></label><progress class="progress progress-primary w-full" value="${percentage}" max="100"></progress></div>`;
                        }
                    }
                    concernsHtml += `</div>`;
                    skinConcernsCard.innerHTML = concernsHtml;
                    resultContainer.appendChild(skinConcernsCard);
                    setTimeout(() => skinConcernsCard.classList.add('is-visible'), 50); // Small initial delay
                }

                // 2. Process and animate main analysis text section by section
                const mainAnalysisProseWrapper = document.createElement('div');
                mainAnalysisProseWrapper.className = 'result-card p-6 bg-white shadow-lg rounded-xl'; // Apply outer card styling here

                // Create a temporary div to parse markdown and then extract its children
                const tempProcessorDiv = document.createElement('div');
                tempProcessorDiv.innerHTML = marked.parse(analysisText || ''); // Parse all markdown to HTML here

                const proseContentContainer = document.createElement('div'); // This will hold the animated sections
                proseContentContainer.className = 'prose max-w-full'; // Apply prose styles to this container
                mainAnalysisProseWrapper.appendChild(proseContentContainer); // Append to main card wrapper

                let currentSectionElements = [];
                const sectionDelay = 200; // Milliseconds between each section appearing
                let currentAnimationDelay = 0; // Cumulative delay

                // Loop through the children of the parsed markdown
                Array.from(tempProcessorDiv.children).forEach(child => {
                    // Check if we need to start a NEW animated section.
                    // A new section starts if:
                    // 1. It's a major heading (H1, H3, H4, H5) or an HR
                    // AND
                    // 2. We've already collected some content for the *current* section (to avoid empty wrappers)
                    // OR
                    // 3. It's the very first element (currentSectionElements is empty) and it's not a direct heading of a new block.
                    // This logic is simplified: just group until a new heading/HR is hit.

                    if (['H1', 'H3', 'H4', 'H5', 'HR'].includes(child.tagName) && currentSectionElements.length > 0) {
                        // If we have collected elements for the previous section, create a wrapper for it
                        const sectionWrapper = document.createElement('div');
                        sectionWrapper.className = 'fade-in-section'; // Add animation class
                        sectionWrapper.style.marginBottom = '2rem'; // Spacing between animated sections
                        sectionWrapper.style.padding = '0 1.5rem'; // Add padding inside this animated section
                        sectionWrapper.style.maxWidth = '100%'; // Ensure it fills container
                        
                        currentSectionElements.forEach(elHtml => sectionWrapper.innerHTML += elHtml); // Add collected HTML to wrapper
                        proseContentContainer.appendChild(sectionWrapper); // Append to the main prose container
                        
                        setTimeout(() => {
                            sectionWrapper.classList.add('is-visible');
                        }, currentAnimationDelay);
                        currentAnimationDelay += sectionDelay; // Increment delay for next section

                        currentSectionElements = []; // Reset for the new section
                    }
                    currentSectionElements.push(child.outerHTML); // Collect current element's HTML (as string)
                });

                // After the loop, append any remaining elements as the last section
                if (currentSectionElements.length > 0) {
                    const sectionWrapper = document.createElement('div');
                    sectionWrapper.className = 'fade-in-section';
                    sectionWrapper.style.marginBottom = '2rem';
                    sectionWrapper.style.padding = '0 1.5rem';
                    sectionWrapper.style.maxWidth = '100%';
                    currentSectionElements.forEach(elHtml => sectionWrapper.innerHTML += elHtml);
                    proseContentContainer.appendChild(sectionWrapper);
                    setTimeout(() => {
                        sectionWrapper.classList.add('is-visible');
                    }, currentAnimationDelay);
                }

                resultContainer.appendChild(mainAnalysisProseWrapper); // Append the main analysis card after all sections are processed

                resultContainer.classList.remove('hidden'); // Show results container
                backToMenuBtn.classList.remove('hidden'); // Show the back button

            } catch (error) {
                console.error('ERROR during analysis:', error);
                if (resultContainer) {
                    resultContainer.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded-lg">An error occurred during analysis: ${error.message}. Please try again, and ensure your photo is clear!</div>`;
                    resultContainer.classList.remove('hidden'); // Show error message
                }
            } finally {
                // Ensure form is visible if error or for retrying, hide loader
                analysisForm.classList.remove('hidden');
                loaderOverlay.classList.add('hidden');
                stopLoaderMessages();
            }
        });
    }
});