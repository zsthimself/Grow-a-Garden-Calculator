// best-crops.js

document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.getElementById('crop-table-body');
    const sortProfitPerMinuteBtn = document.getElementById('sort-profit-per-minute');
    const sortRawProfitBtn = document.getElementById('sort-raw-profit');
    const sortCostBtn = document.getElementById('sort-cost');
    const sortButtons = [sortProfitPerMinuteBtn, sortRawProfitBtn, sortCostBtn];

    // 1. First, process the data to include our calculated metrics
    const processedCrops = gameData.crops.map(crop => {
        const rawProfit = crop.sell - crop.cost;
        const profitPerMinute = crop.time > 0 ? rawProfit / crop.time : 0;
        return {
            ...crop, // spread operator to include all original crop data
            rawProfit: rawProfit,
            profitPerMinute: profitPerMinute
        };
    });

    // 2. Function to render the table rows
    function renderTable(crops) {
        tableBody.innerHTML = ''; // Clear existing table rows
        crops.forEach(crop => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${crop.icon}" class="table-icon">${crop.name}</td>
                <td>$${crop.cost.toLocaleString()}</td>
                <td>$${crop.sell.toLocaleString()}</td>
                <td>${crop.time}</td>
                <td>$${crop.rawProfit.toLocaleString()}</td>
                <td>$${crop.profitPerMinute.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 3. Add event listeners to sort buttons
    function setActiveButton(activeBtn) {
        sortButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    sortProfitPerMinuteBtn.addEventListener('click', () => {
        processedCrops.sort((a, b) => b.profitPerMinute - a.profitPerMinute);
        renderTable(processedCrops);
        setActiveButton(sortProfitPerMinuteBtn);
    });

    sortRawProfitBtn.addEventListener('click', () => {
        processedCrops.sort((a, b) => b.rawProfit - a.rawProfit);
        renderTable(processedCrops);
        setActiveButton(sortRawProfitBtn);
    });

    sortCostBtn.addEventListener('click', () => {
        processedCrops.sort((a, b) => a.cost - b.cost);
        renderTable(processedCrops);
        setActiveButton(sortCostBtn);
    });

    // 4. Initial render (sorted by profit per minute by default)
    sortProfitPerMinuteBtn.click();
});