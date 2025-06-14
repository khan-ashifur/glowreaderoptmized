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
    const analysisForm = document.getElementById('analysis-form'); // Reference to the form itself
    const loaderOverlay = document.getElementById('loader-overlay'); // Reference to the new loader overlay
    const loaderMessageText = document.getElementById('loader-message-text');
    const resultContainer = document.getElementById('result-container');

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

        loaderMessageText.textContent = messages[currentMessageIndex] + ' '; // Set initial message

        if (loaderInterval) {
            clearInterval(loaderInterval); // Clear any existing interval
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

    // --- Part 3: Form Submission Logic ---
    if (analysisForm) {
        analysisForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Hide the form and show the loader overlay
            analysisForm.classList.add('hidden');
            resultContainer.innerHTML = ''; // Clear previous results
            resultContainer.classList.add('hidden'); // Hide results until ready
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

                console.log("--- DEBUGGING Frontend Output ---");
                console.log("1. Received full response object from server:", result);

                const analysisText = result.analysisText;
                const skinConcerns = result.skinConcerns;

                let outputHtml = '';

                // Handle skin concerns (if any) - this part appears instantly
                if (skinConcerns && Object.keys(skinConcerns).length > 0) {
                    console.log("5. Generating HTML for skin concerns progress bars.");
                    outputHtml += `
                        <div class="result-card mb-6 p-6 bg-white shadow-lg rounded-xl">
                            <h2 class="text-2xl font-bold text-pink-600 mb-4">Your Skin Concerns at a Glance!</h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    `;
                    for (const concernName in skinConcerns) {
                        if (Object.hasOwnProperty.call(skinConcerns, concernName)) {
                            const percentage = skinConcerns[concernName];
                            outputHtml += `
                                <div class="form-control mb-2">
                                    <label class="label">
                                        <span class="label-text text-gray-700 font-medium">${concernName}</span>
                                        <span class="label-text-alt text-pink-500 font-semibold">${percentage}%</span>
                                    </label>
                                    <progress class="progress progress-primary w-full" value="${percentage}" max="100"></progress>
                                </div>
                            `;
                        }
                    }
                    outputHtml += `
                            </div>
                        </div>
                    `;
                } else {
                    console.log("5. No skin concerns data found or not in skin-analyzer mode.");
                }

                // Append the main analysis markdown, parsed into HTML instantly
                outputHtml += `
                    <div class="result-card p-6 bg-white shadow-lg rounded-xl">
                        <div class="prose max-w-full">
                            ${marked.parse(analysisText)}
                        </div>
                    </div>
                `;

                resultContainer.innerHTML = outputHtml; // Inject generated HTML
                resultContainer.classList.remove('hidden'); // Show results
                console.log("6. Analysis output displayed instantly.");


            } catch (error) {
                console.error('ERROR during analysis:', error);
                if (resultContainer) {
                    resultContainer.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded-lg">An error occurred during analysis: ${error.message}. Please try again, and ensure your photo is clear!</div>`;
                    resultContainer.classList.remove('hidden'); // Show error message
                }
            } finally {
                loaderOverlay.classList.add('hidden'); // Hide the full-screen loader
                stopLoaderMessages(); // Stop personalized loader messages
                console.log("--- DEBUGGING END ---");
            }
        });
    }
});