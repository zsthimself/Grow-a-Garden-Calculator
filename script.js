// script.js - Final Corrected Version with All Features

document.addEventListener('DOMContentLoaded', function() {
    // --- STATE MANAGEMENT ---
    let gardenList = []; // This array will hold all the items in our list

    // --- GET ALL HTML ELEMENTS ---
    const petSelect = document.getElementById('pet-select');
    const profitResultEl = document.getElementById('profit-result');
    const profitPerMinuteResultEl = document.getElementById('profit-per-minute-result');
    const cropWrapper = document.getElementById('crop-select-wrapper');
    const cropTrigger = cropWrapper.querySelector('.custom-select-trigger');
    const cropOptions = cropWrapper.querySelector('.custom-options');
    const quantityInput = document.getElementById('quantity-input');
    const friendBoostInput = document.getElementById('friend-boost-input');
    const gamepassToggle = document.getElementById('gamepass-toggle');
    const mutationGrid = document.getElementById('mutation-grid');
    const mutationSearchInput = document.getElementById('mutation-search');
    const sortAlphaBtn = document.getElementById('sort-alpha-btn');
    const sortValueBtn = document.getElementById('sort-value-btn');
    const addToListBtn = document.getElementById('add-to-list-btn');
    const gardenListUL = document.getElementById('garden-list');
    const gardenTotalValueEl = document.getElementById('garden-total-value');
    const clearListBtn = document.getElementById('clear-list-btn');
    const recommendationList = document.getElementById('recommendation-list');

    // --- RECOMMENDATION ENGINE ---
    function updateRecommendations() {
        const selectedPetId = petSelect.value;
        const friendCount = parseInt(friendBoostInput.value) || 0;
        const isGamePassActive = gamepassToggle.checked;
        const pet = gameData.pets.find(p => p.id === selectedPetId);
        if (!pet) return;
        const friendBoostMultiplier = 1 + (friendCount * 0.05);
        const gamePassMultiplier = isGamePassActive ? 2 : 1;

        const cropProfitability = gameData.crops.map(crop => {
            const baseProfit = (crop.sell * pet.multiplier * friendBoostMultiplier) - crop.cost;
            const finalProfit = baseProfit * gamePassMultiplier;
            const profitPerMinute = crop.time > 0 ? finalProfit / crop.time : 0;
            return { id: crop.id, name: crop.name, profitPerMinute: profitPerMinute };
        });

        cropProfitability.sort((a, b) => b.profitPerMinute - a.profitPerMinute);
        const top3Crops = cropProfitability.slice(0, 3);

        recommendationList.innerHTML = '';
        top3Crops.forEach(crop => {
            const li = document.createElement('li');
            li.dataset.id = crop.id;
            li.innerHTML = `<span class="rec-name">${crop.name}</span><span class="rec-value">$${crop.profitPerMinute.toFixed(2)}/min</span>`;
            recommendationList.appendChild(li);
        });
    }

    // --- CORE CALCULATE FUNCTION ---
    function calculate() {
        const selectedCropId = cropTrigger.dataset.value;
        const selectedPetId = petSelect.value;
        const quantity = parseInt(quantityInput.value) || 1;
        const friendCount = parseInt(friendBoostInput.value) || 0;
        const isGamePassActive = gamepassToggle.checked;
        const crop = gameData.crops.find(c => c.id === selectedCropId);
        const pet = gameData.pets.find(p => p.id === selectedPetId);
        if (!crop || !pet) return;

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

        const friendBoostMultiplier = 1 + (friendCount * 0.05);
        const gamePassMultiplier = isGamePassActive ? 2 : 1;
        const singleSellPrice = crop.sell * pet.multiplier * finalMutationMultiplier * friendBoostMultiplier;
        const totalSellValue = singleSellPrice * quantity;
        const totalCost = crop.cost * quantity;
        let finalProfit = totalSellValue - totalCost;
        finalProfit = finalProfit * gamePassMultiplier;
        const profitPerMinute = crop.time > 0 ? finalProfit / crop.time : 0;
        profitResultEl.textContent = '$' + Math.round(finalProfit).toLocaleString();
        profitPerMinuteResultEl.textContent = '$' + profitPerMinute.toFixed(2) + '/min';
    }

    // --- GARDEN LIST FUNCTIONS ---
    function renderGardenList() {
        gardenListUL.innerHTML = '';
        let totalValue = 0;
        gardenList.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="item-name">${item.name}</span><span class="item-value">$${item.profit.toLocaleString()}</span><button class="remove-btn" data-id="${item.id}">X</button>`;
            gardenListUL.appendChild(li);
            totalValue += item.profit;
        });
        gardenTotalValueEl.textContent = '$' + totalValue.toLocaleString();
    }

    function handleAddItem() {
        const currentProfitText = profitResultEl.textContent.replace(/\$|,/g, '');
        const currentProfit = parseInt(currentProfitText);
        if (currentProfit <= 0) return;
        const cropName = cropTrigger.querySelector('span').textContent;
        const checkedMutations = Array.from(document.querySelectorAll('.mutation-checkbox:checked'));
        let mutationNames = checkedMutations.map(cb => {
            const label = document.querySelector(`label[for="${cb.id}"]`);
            return label.textContent.split(' ')[0];
        });
        let itemName = `${quantityInput.value}x ${cropName}`;
        if (mutationNames.length > 0) {
            itemName += ` (${mutationNames.join(', ')})`;
        }
        const newItem = { id: Date.now(), name: itemName, profit: currentProfit };
        gardenList.push(newItem);
        renderGardenList();
    }

    function handleListClick(e) {
        if (e.target.classList.contains('remove-btn')) {
            const itemId = parseInt(e.target.dataset.id);
            gardenList = gardenList.filter(item => item.id !== itemId);
            renderGardenList();
        }
    }

    function handleClearList() {
        gardenList = [];
        renderGardenList();
    }

    // --- INITIALIZE UI AND EVENT LISTENERS ---
    
    // Populate UI Elements
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

    // Add Event Listeners
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

    petSelect.addEventListener('change', () => { calculate(); updateRecommendations(); });
    friendBoostInput.addEventListener('input', () => { calculate(); updateRecommendations(); });
    gamepassToggle.addEventListener('change', () => { calculate(); updateRecommendations(); });
    
    quantityInput.addEventListener('input', calculate);
    allMutationCheckboxes.forEach(checkbox => checkbox.addEventListener('change', calculate));

    mutationSearchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        allMutationItems.forEach(item => {
            const itemName = item.dataset.name.toLowerCase();
            item.classList.toggle('hidden', !itemName.includes(searchTerm));
        });
    });
    
    function sortMutationGrid(compareFunction) {
        const itemsArray = Array.from(allMutationItems);
        itemsArray.sort(compareFunction);
        itemsArray.forEach(item => mutationGrid.appendChild(item));
    }
    sortAlphaBtn.addEventListener('click', () => sortMutationGrid((a, b) => a.dataset.name.localeCompare(b.dataset.name)));
    sortValueBtn.addEventListener('click', () => sortMutationGrid((a, b) => b.dataset.multiplier - a.dataset.multiplier));

    addToListBtn.addEventListener('click', handleAddItem);
    gardenListUL.addEventListener('click', handleListClick);
    clearListBtn.addEventListener('click', handleClearList);

    recommendationList.addEventListener('click', function(e) {
        const clickedLi = e.target.closest('li');
        if (!clickedLi) return;
        const cropId = clickedLi.dataset.id;
        const cropOptionToSelect = cropOptions.querySelector(`.custom-option[data-value="${cropId}"]`);
        if (cropOptionToSelect) {
            cropTrigger.innerHTML = cropOptionToSelect.innerHTML;
            cropTrigger.dataset.value = cropId;
            calculate();
        }
    });

    // --- Initial Calls on Page Load ---
    updateRecommendations();
    calculate();
});