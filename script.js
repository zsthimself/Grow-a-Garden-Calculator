// script.js - Accuracy Upgrade (Quantity, Passes, Friends)

document.addEventListener('DOMContentLoaded', function() {
    // --- Get HTML Elements ---
    const petSelect = document.getElementById('pet-select');
    const profitResultEl = document.getElementById('profit-result');
    const profitPerMinuteResultEl = document.getElementById('profit-per-minute-result');
    const cropWrapper = document.getElementById('crop-select-wrapper');
    const cropTrigger = cropWrapper.querySelector('.custom-select-trigger');
    const cropOptions = cropWrapper.querySelector('.custom-options');
    const mutationGrid = document.getElementById('mutation-grid');
    const mutationSearchInput = document.getElementById('mutation-search');
    const sortAlphaBtn = document.getElementById('sort-alpha-btn');
    const sortValueBtn = document.getElementById('sort-value-btn');

    // --- NEW: Get Global Settings Elements ---
    const quantityInput = document.getElementById('quantity-input');
    const friendBoostInput = document.getElementById('friend-boost-input');
    const gamepassToggle = document.getElementById('gamepass-toggle');


    // --- Populate UI Elements ---
    // (This part remains the same as before)
    gameData.crops.forEach(crop => {
        const optionEl = document.createElement('div');
        optionEl.classList.add('custom-option');
        optionEl.dataset.value = crop.id;
        optionEl.dataset.name = crop.name; // Keep for sorting
        optionEl.innerHTML = `<img src="${crop.icon}" class="option-icon" alt="${crop.name}"><span>${crop.name}</span>`;
        cropOptions.appendChild(optionEl);
    });
    const allCropOptions = cropOptions.querySelectorAll('.custom-option');
    cropTrigger.innerHTML = allCropOptions[0].innerHTML;
    cropTrigger.dataset.value = allCropOptions[0].dataset.value;

    gameData.pets.forEach(pet => {
        const option = document.createElement('option');
        option.value = pet.id;
        option.textContent = pet.name;
        petSelect.appendChild(option);
    });
    
    gameData.mutations.forEach(mutation => {
        if (mutation.id === 'none') return; 
        const itemEl = document.createElement('div');
        itemEl.classList.add('mutation-item');
        itemEl.dataset.name = mutation.name;
        itemEl.dataset.multiplier = mutation.multiplier;
        const checkboxId = `mut-${mutation.id}`;
        itemEl.innerHTML = `<input type="checkbox" id="${checkboxId}" class="mutation-checkbox" data-id="${mutation.id}"><label for="${checkboxId}">${mutation.name}</label>`;
        mutationGrid.appendChild(itemEl);
    });
    const allMutationItems = mutationGrid.querySelectorAll('.mutation-item');
    const allMutationCheckboxes = mutationGrid.querySelectorAll('.mutation-checkbox');


    // --- Calculation Logic (HEAVILY UPGRADED) ---
    function calculate() {
        // 1. Get all input values from the user
        const selectedCropId = cropTrigger.dataset.value;
        const selectedPetId = petSelect.value;
        const quantity = parseInt(quantityInput.value) || 1;
        const friendCount = parseInt(friendBoostInput.value) || 0;
        const isGamePassActive = gamepassToggle.checked;

        // 2. Find the corresponding data objects
        const crop = gameData.crops.find(c => c.id === selectedCropId);
        const pet = gameData.pets.find(p => p.id === selectedPetId);
        if (!crop || !pet) return;

        // 3. Calculate all multipliers
        // Mutation multiplier (stacks additively)
        let totalMutationBonus = 0;
        const checkedMutations = document.querySelectorAll('.mutation-checkbox:checked');
        checkedMutations.forEach(checkbox => {
            const mutationId = checkbox.dataset.id;
            const mutation = gameData.mutations.find(m => m.id === mutationId);
            if (mutation) {
                totalMutationBonus += (mutation.multiplier - 1);
            }
        });
        const finalMutationMultiplier = 1 + totalMutationBonus;

        // Friend boost multiplier (e.g., 5% or 0.05 per friend)
        const friendBoostMultiplier = 1 + (friendCount * 0.05);

        // Game pass multiplier
        const gamePassMultiplier = isGamePassActive ? 2 : 1;
        
        // 4. Calculate final profit
        const singleSellPrice = crop.sell * pet.multiplier * finalMutationMultiplier * friendBoostMultiplier;
        const totalSellValue = singleSellPrice * quantity;
        const totalCost = crop.cost * quantity;
        
        let finalProfit = totalSellValue - totalCost;
        
        // Apply the global x2 multiplier at the end
        finalProfit = finalProfit * gamePassMultiplier;
        
        // 5. Calculate profit per minute
        // Note: Time doesn't increase with quantity. It's the time for one harvest cycle.
        const profitPerMinute = crop.time > 0 ? finalProfit / crop.time : 0;

        // 6. Update display
        profitResultEl.textContent = '$' + Math.round(finalProfit).toLocaleString();
        profitPerMinuteResultEl.textContent = '$' + profitPerMinute.toFixed(2) + '/min';
    }

    // --- Event Listeners ---
    // (The old listeners for crop, pet, and mutations)
    cropTrigger.addEventListener('click', () => cropWrapper.classList.toggle('open'));
    window.addEventListener('click', e => { if (!cropWrapper.contains(e.target)) cropWrapper.classList.remove('open'); });
    allCropOptions.forEach(option => {
        option.addEventListener('click', function() {
            cropTrigger.innerHTML = this.innerHTML;
            cropTrigger.dataset.value = this.dataset.value;
            cropWrapper.classList.remove('open');
            calculate();
        });
    });
    petSelect.addEventListener('change', calculate);
    allMutationCheckboxes.forEach(checkbox => checkbox.addEventListener('change', calculate));

    // (Search and Sort listeners)
    mutationSearchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        allMutationItems.forEach(item => {
            const itemName = item.dataset.name.toLowerCase();
            itemName.includes(searchTerm) ? item.classList.remove('hidden') : item.classList.add('hidden');
        });
    });
    function sortMutationGrid(compareFunction) {
        const itemsArray = Array.from(allMutationItems);
        itemsArray.sort(compareFunction);
        itemsArray.forEach(item => mutationGrid.appendChild(item));
    }
    sortAlphaBtn.addEventListener('click', () => sortMutationGrid((a, b) => a.dataset.name.localeCompare(b.dataset.name)));
    sortValueBtn.addEventListener('click', () => sortMutationGrid((a, b) => b.dataset.multiplier - a.dataset.multiplier));

    // --- NEW: Listeners for Global Settings ---
    quantityInput.addEventListener('input', calculate);
    friendBoostInput.addEventListener('input', calculate);
    gamepassToggle.addEventListener('change', calculate);


    // Initial calculation on page load
    calculate();
});