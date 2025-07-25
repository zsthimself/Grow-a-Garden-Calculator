// script.js - Multi-Mutation Upgrade

document.addEventListener('DOMContentLoaded', function() {
    // --- Get HTML Elements ---
    const petSelect = document.getElementById('pet-select');
    const profitResultEl = document.getElementById('profit-result');
    const profitPerMinuteResultEl = document.getElementById('profit-per-minute-result');
    const cropWrapper = document.getElementById('crop-select-wrapper');
    const cropTrigger = cropWrapper.querySelector('.custom-select-trigger');
    const cropOptions = cropWrapper.querySelector('.custom-options');
    const mutationGrid = document.getElementById('mutation-grid');

    // --- Populate Crop Custom Dropdown ---
    gameData.crops.forEach(crop => {
        const optionEl = document.createElement('div');
        optionEl.classList.add('custom-option');
        optionEl.dataset.value = crop.id;
        optionEl.innerHTML = `<img src="${crop.icon}" class="option-icon" alt="${crop.name}"><span>${crop.name}</span>`;
        cropOptions.appendChild(optionEl);
    });
    const allCropOptions = cropOptions.querySelectorAll('.custom-option');
    cropTrigger.innerHTML = allCropOptions[0].innerHTML;
    cropTrigger.dataset.value = allCropOptions[0].dataset.value;

    // --- Populate Pet Dropdown ---
    gameData.pets.forEach(pet => {
        const option = document.createElement('option');
        option.value = pet.id;
        option.textContent = pet.name;
        petSelect.appendChild(option);
    });
    
    // --- NEW: Populate Mutation Checkbox Grid ---
    gameData.mutations.forEach(mutation => {
        // We don't need a checkbox for "No Mutation"
        if (mutation.id === 'none') return; 

        const itemEl = document.createElement('div');
        itemEl.classList.add('mutation-item');
        
        const checkboxId = `mut-${mutation.id}`;
        
        itemEl.innerHTML = `
            <input type="checkbox" id="${checkboxId}" class="mutation-checkbox" data-id="${mutation.id}">
            <label for="${checkboxId}">${mutation.name}</label>
        `;
        mutationGrid.appendChild(itemEl);
    });
    const allMutationCheckboxes = mutationGrid.querySelectorAll('.mutation-checkbox');


    // --- Calculation Logic (UPGRADED) ---
    function calculate() {
        const selectedCropId = cropTrigger.dataset.value;
        const selectedPetId = petSelect.value;
        
        const crop = gameData.crops.find(c => c.id === selectedCropId);
        const pet = gameData.pets.find(p => p.id === selectedPetId);
        
        if (!crop || !pet) return;

        // NEW: Calculate stacked mutation bonus
        let totalMutationBonus = 0;
        const checkedMutations = document.querySelectorAll('.mutation-checkbox:checked');
        
        checkedMutations.forEach(checkbox => {
            const mutationId = checkbox.dataset.id;
            const mutation = gameData.mutations.find(m => m.id === mutationId);
            if (mutation) {
                // Additive stacking of the BONUS part of the multiplier (e.g., x1.5 is a +0.5 bonus)
                totalMutationBonus += (mutation.multiplier - 1);
            }
        });

        // The final multiplier is 1 (base) + the sum of all bonuses
        const finalMutationMultiplier = 1 + totalMutationBonus;

        // Apply multipliers
        const finalSellPrice = crop.sell * pet.multiplier * finalMutationMultiplier;
        const profit = finalSellPrice - crop.cost;
        const profitPerMinute = crop.time > 0 ? profit / crop.time : 0;

        // Update display
        profitResultEl.textContent = '$' + Math.round(profit).toLocaleString();
        profitPerMinuteResultEl.textContent = '$' + profitPerMinute.toFixed(2) + '/min';
    }

    // --- Event Listeners ---
    // Crop dropdown listeners
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

    // Pet dropdown listener
    petSelect.addEventListener('change', calculate);

    // NEW: Mutation checkbox listeners
    allMutationCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculate);
    });

    // Initial calculation on page load
    calculate();
});