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

    // --- Part 2: Logic for the Analysis Form ---
    const modeSelect = document.getElementById('mode-select');
    const skinFields = document.getElementById('skin-analyzer-fields');
    const makeupFields = document.getElementById('makeup-artist-fields');
    const analysisForm = document.getElementById('analysis-form');
    const loader = document.getElementById('loader');
    const resultContainer = document.getElementById('result-container');
    // Assuming historyPanel is not active yet, but keeping the reference if needed later
    // const historyPanel = document.getElementById('history-panel');

    // Function to toggle display of skin/makeup fields based on selection
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

    // Attach event listener for mode selection change
    if (modeSelect) {
        modeSelect.addEventListener('change', handleModeChange);
    }
    handleModeChange(); // Call once on load to set initial state

    // --- Part 3: Form Submission Logic ---
    if (analysisForm) {
        analysisForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            if (loader) loader.classList.remove('hidden'); // Show loader (assuming 'hidden' class hides it)
            if (resultContainer) resultContainer.innerHTML = ''; // Clear previous results

            const formData = new FormData(analysisForm);

            try {
                // Send form data to the backend API
                const response = await fetch('/api/vision', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    // Handle server errors
                    const errorDetails = await response.text();
                    throw new Error(`Server error: ${response.statusText}. Details: ${errorDetails}`);
                }

                const result = await response.json(); // Parse the JSON response from the server

                console.log("--- DEBUGGING Frontend Output ---");
                console.log("1. Received full response object from server:", result);

                const analysisText = result.analysisText; // Extract the main analysis markdown
                const skinConcerns = result.skinConcerns; // Extract skin concerns (will be undefined for makeup mode)

                console.log("2. Extracted analysisText:", analysisText);
                console.log("3. Extracted skinConcerns (if any):", skinConcerns);

                if (resultContainer && analysisText) {
                    console.log("4. Found result container and analysis text is not empty.");

                    let outputHtml = '';

                    // If skin concerns are present (only for skin-analyzer mode), generate their HTML
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

                    // Append the main analysis markdown, parsed into HTML
                    // IMPORTANT CHANGE HERE: prose class applied to an inner div for better layout control
                    outputHtml += `
                        <div class="result-card p-6 bg-white shadow-lg rounded-xl">
                            <div class="prose max-w-full">
                                ${marked.parse(analysisText)}
                            </div>
                        </div>
                    `;

                    resultContainer.innerHTML = outputHtml; // Inject generated HTML into the result container
                    console.log("6. Successfully updated the page with the final result.");

                } else {
                    console.error("4. ERROR: Could not find result container or analysis text was empty from AI response.");
                    resultContainer.innerHTML = `<div class="text-red-500">No analysis text received from AI.</div>`;
                }

            } catch (error) {
                console.error('ERROR during analysis:', error);
                if (resultContainer) {
                    resultContainer.innerHTML = `<div class="text-red-500 p-4 border border-red-300 rounded-lg">An error occurred during analysis: ${error.message}. Please try again, and ensure your photo is clear!</div>`;
                }
            } finally {
                if (loader) loader.classList.add('hidden'); // Hide loader
                console.log("--- DEBUGGING END ---");
            }
        });
    }
});