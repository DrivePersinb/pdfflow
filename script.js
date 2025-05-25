// script.js
document.addEventListener('DOMContentLoaded', () => {
    // ... (all previous const declarations remain the same) ...
    const instrumentGrid = document.getElementById('instrument-grid');
    const categoryFilter = document.getElementById('category-filter');
    const brandFilter = document.getElementById('brand-filter');
    const sortBy = document.getElementById('sort-by');
    const resetFiltersBtn = document.getElementById('reset-filters');

    const buyModal = document.getElementById('buy-modal');
    const buyModalTitle = document.getElementById('buy-modal-title');
    const buyLinksList = document.getElementById('buy-links-list');
    const closeBuyModalBtn = document.getElementById('close-buy-modal');

    const compareSlotsContainer = document.getElementById('compare-slots');
    const compareNowBtn = document.getElementById('compare-now-btn');
    const compareCountSpan = document.getElementById('compare-count');
    const clearCompareBtn = document.getElementById('clear-compare-btn');
    const comparisonModal = document.getElementById('comparison-modal');
    const closeComparisonModalBtn = document.getElementById('close-comparison-modal');
    const comparisonTableContainer = document.getElementById('comparison-table-container');

    const instrumentDetailModal = document.getElementById('instrument-detail-modal');
    const instrumentDetailContent = document.getElementById('instrument-detail-content');
    const closeDetailModalBtn = document.getElementById('close-detail-modal');

    let currentInstruments = [...instrumentsData];
    let comparisonItems = [];
    const MAX_COMPARE_ITEMS = 3;
    const AD_CARD_INTERVAL = 4;

    function formatPrice(price) {
        return `₹${price.toLocaleString('en-IN')}`;
    }

    function populateFilters() {
        const categories = [...new Set(instrumentsData.map(item => item.category))];
        const brands = [...new Set(instrumentsData.map(item => item.brand))];

        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        brands.sort().forEach(brand => {
            const option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            brandFilter.appendChild(option);
        });
    }

    function renderInstruments(instrumentsToRender) {
        instrumentGrid.innerHTML = '';
        if (instrumentsToRender.length === 0) {
            instrumentGrid.innerHTML = '<p>No instruments found matching your criteria.</p>';
            return;
        }
        instrumentsToRender.forEach((instrument, index) => {
            const card = document.createElement('div');
            card.className = 'instrument-card';
            card.dataset.id = instrument.id;
            const isAddedToCompare = comparisonItems.some(item => item.id === instrument.id);
            card.innerHTML = `
                <img src="${instrument.image || 'https://via.placeholder.com/280x180?text=No+Image'}" alt="${instrument.name}" onerror="this.src='https://via.placeholder.com/280x180?text=No+Image'; this.onerror=null;">
                <h3>${instrument.name}</h3>
                <p class="price">${formatPrice(instrument.price)}</p>
                <p class="short-desc">${instrument.short_description || 'No description available.'}</p>
                <div class="actions">
                    <button class="details-btn">View Details</button>
                    <button class="buy-now-btn">Buy Now</button>
                    <button class="compare-btn ${isAddedToCompare ? 'added' : ''}" data-id="${instrument.id}">
                        ${isAddedToCompare ? 'Added ✓' : 'Add to Compare'}
                    </button>
                </div>
            `;
            instrumentGrid.appendChild(card);
            card.querySelector('.details-btn').addEventListener('click', () => showInstrumentDetailModal(instrument));
            card.querySelector('.buy-now-btn').addEventListener('click', () => showBuyModal(instrument));
            card.querySelector('.compare-btn').addEventListener('click', (e) => toggleCompareItem(instrument, e.target));

            if ((index + 1) % AD_CARD_INTERVAL === 0 && index < instrumentsToRender.length -1) {
                const adCard = document.createElement('div');
                adCard.className = 'ad-card';
                adCard.innerHTML = `<div class="ad-placeholder in-grid-ad"><p>In-Grid Ad</p></div>`;
                instrumentGrid.appendChild(adCard);
            }
        });
    }

    function applyFiltersAndSort() {
        let filtered = [...instrumentsData];
        const selectedCategory = categoryFilter.value;
        if (selectedCategory !== 'all') filtered = filtered.filter(item => item.category === selectedCategory);
        const selectedBrand = brandFilter.value;
        if (selectedBrand !== 'all') filtered = filtered.filter(item => item.brand === selectedBrand);
        const sortValue = sortBy.value;
        switch (sortValue) {
            case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
            case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
            case 'name-asc': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': filtered.sort((a, b) => b.name.localeCompare(a.name)); break;
        }
        currentInstruments = filtered;
        renderInstruments(currentInstruments);
    }

    function showBuyModal(instrument) { /* ... (no changes) ... */
        buyModalTitle.textContent = `Buy ${instrument.name} From:`;
        buyLinksList.innerHTML = '';
        if (instrument.buyLinks && instrument.buyLinks.length > 0) {
            instrument.buyLinks.forEach(link => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = link.url;
                a.textContent = link.marketplace;
                a.target = "_blank"; a.rel = "noopener noreferrer";
                li.appendChild(a);
                buyLinksList.appendChild(li);
            });
        } else {
            buyLinksList.innerHTML = '<li>No purchase links available.</li>';
        }
        buyModal.classList.add('show');
    }
    function closeBuyModal() { buyModal.classList.remove('show'); }

    // --- INSTRUMENT DETAIL MODAL (UPDATED) ---
    function showInstrumentDetailModal(instrument) {
        let specsHtml = '';
        if (instrument.specs && instrument.specs.length > 0) {
            instrument.specs.forEach(specItem => {
                if (specItem.category) { // It's a category with sub-items
                    specsHtml += `<tr class="spec-category-header"><td colspan="2">${specItem.category}</td></tr>`;
                    specItem.items.forEach(item => {
                        specsHtml += `
                            <tr class="spec-category-item">
                                <td class="spec-key">${item.key}</td>
                                <td class="spec-value">${item.value}</td>
                            </tr>`;
                    });
                } else { // It's a direct key-value spec
                    specsHtml += `
                        <tr>
                            <td class="spec-key">${specItem.key}</td>
                            <td class="spec-value">${specItem.value}</td>
                        </tr>`;
                }
            });
        } else {
            specsHtml = '<tr><td colspan="2">No specifications listed.</td></tr>';
        }

        let faqsHtml = '';
        if (instrument.faqs && instrument.faqs.length > 0) {
            faqsHtml = `
                <div class="faq-section">
                    <h3>Frequently Asked Questions</h3>
                    ${instrument.faqs.map(faq => `
                        <div class="faq-item">
                            <div class="faq-question">${faq.q}</div>
                            <div class="faq-answer">${faq.a}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        instrumentDetailContent.innerHTML = `
            <img src="${instrument.image || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${instrument.name}" class="detail-img" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'; this.onerror=null;">
            <h2>${instrument.name}</h2>
            <p class="detail-price">${formatPrice(instrument.price)}</p>
            <div class="detail-description">
                <strong>Description:</strong>
                <p>${instrument.detailed_description || instrument.short_description || 'No detailed description available.'}</p>
            </div>
            <div class="specs-section">
                <h3>Specifications</h3>
                <table class="specs-table">
                    <tbody>
                        ${specsHtml}
                    </tbody>
                </table>
            </div>
            ${faqsHtml}
            ${instrument.buyLinks && instrument.buyLinks.length > 0 ? `
            <div class="detail-buy-links">
                <h4>Available At:</h4>
                <ul>
                    ${instrument.buyLinks.map(link => `<li><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.marketplace}</a></li>`).join('')}
                </ul>
            </div>
            ` : '<p>No purchase links available.</p>'}
        `;
        instrumentDetailModal.classList.add('show');
        instrumentDetailModal.querySelector('.modal-content').scrollTop = 0;

        // Add event listeners for FAQ toggles
        instrumentDetailContent.querySelectorAll('.faq-question').forEach(questionElement => {
            questionElement.addEventListener('click', () => {
                const faqItem = questionElement.parentElement;
                faqItem.classList.toggle('open');
            });
        });
    }
    function closeInstrumentDetailModal() { instrumentDetailModal.classList.remove('show'); }

    // --- COMPARISON LOGIC (UPDATED to handle new spec structure) ---
    function toggleCompareItem(instrument, button) { /* ... (no changes) ... */
        const instrumentId = instrument.id;
        const index = comparisonItems.findIndex(item => item.id === instrumentId);
        if (index > -1) {
            comparisonItems.splice(index, 1);
            button.textContent = 'Add to Compare';
            button.classList.remove('added');
        } else {
            if (comparisonItems.length < MAX_COMPARE_ITEMS) {
                comparisonItems.push(instrument);
                button.textContent = 'Added ✓';
                button.classList.add('added');
            } else {
                alert(`You can only compare up to ${MAX_COMPARE_ITEMS} instruments.`);
            }
        }
        updateCompareUI();
    }    
    function removeFromCompareById(instrumentId) { /* ... (no changes) ... */
        comparisonItems = comparisonItems.filter(item => item.id !== instrumentId);
        updateCompareUI();
        const cardButton = instrumentGrid.querySelector(`.instrument-card[data-id="${instrumentId}"] .compare-btn`);
        if (cardButton) {
            cardButton.textContent = 'Add to Compare';
            cardButton.classList.remove('added');
        }
    }
    function updateCompareUI() { /* ... (no changes) ... */
        compareCountSpan.textContent = comparisonItems.length;
        compareNowBtn.disabled = comparisonItems.length < 2;
        compareSlotsContainer.innerHTML = '';
        if (comparisonItems.length === 0) {
            compareSlotsContainer.innerHTML = '<small>Add up to 3 instruments to compare.</small>';
        } else {
            comparisonItems.forEach(item => {
                const slotItem = document.createElement('div');
                slotItem.className = 'compare-slot-item';
                slotItem.innerHTML = `
                    <span>${item.name.substring(0,20)}${item.name.length > 20 ? '...' : ''}</span>
                    <button data-id="${item.id}" title="Remove from comparison">&times;</button>
                `;
                slotItem.querySelector('button').addEventListener('click', () => removeFromCompareById(item.id));
                compareSlotsContainer.appendChild(slotItem);
            });
        }
    }
    function clearComparison() { /* ... (no changes) ... */
        comparisonItems = [];
        updateCompareUI();
        document.querySelectorAll('.instrument-card .compare-btn.added').forEach(btn => {
            btn.textContent = 'Add to Compare';
            btn.classList.remove('added');
        });
    }

    function showComparisonModal() {
        if (comparisonItems.length < 2) {
            alert("Please select at least two instruments to compare.");
            return;
        }
        comparisonTableContainer.innerHTML = '';
        const table = document.createElement('table');
        table.className = 'comparison-table';

        // --- Gather all unique spec keys (flattening categorized specs) ---
        const allSpecKeys = new Set();
        comparisonItems.forEach(item => {
            if (item.specs && Array.isArray(item.specs)) {
                item.specs.forEach(specItem => {
                    if (specItem.category && Array.isArray(specItem.items)) {
                        specItem.items.forEach(subItem => allSpecKeys.add(subItem.key));
                    } else if (specItem.key) {
                        allSpecKeys.add(specItem.key);
                    }
                });
            }
        });
        // For comparison, alphabetical sort of all unique keys is generally better
        const sortedSpecKeys = Array.from(allSpecKeys).sort();


        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        headerRow.insertCell().textContent = 'Feature';
        comparisonItems.forEach(item => {
            const th = document.createElement('th');
            th.innerHTML = `
                <img src="${item.image || 'https://via.placeholder.com/100x75?text=No+Image'}" alt="${item.name}" onerror="this.style.display='none'">
                ${item.name}<br>
                <span class="price">${formatPrice(item.price)}</span>
            `;
            headerRow.appendChild(th);
        });

        const tbody = table.createTBody();
        const buyRow = tbody.insertRow(); // Buy links row
        buyRow.insertCell().textContent = 'Buy Now';
        comparisonItems.forEach(item => {
            const cell = buyRow.insertCell();
            if (item.buyLinks && item.buyLinks.length > 0) {
                item.buyLinks.forEach(link => {
                    const a = document.createElement('a');
                    a.href = link.url; a.textContent = link.marketplace; a.target = "_blank"; a.rel = "noopener noreferrer";
                    Object.assign(a.style, {display: 'block', marginBottom: '5px', padding: '5px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '3px', textAlign: 'center'});
                    cell.appendChild(a);
                });
            } else { cell.textContent = 'N/A'; }
        });

        sortedSpecKeys.forEach(specKey => { // Iterate through sorted unique spec keys
            const row = tbody.insertRow();
            row.insertCell().textContent = specKey;
            comparisonItems.forEach(item => {
                const cell = row.insertCell();
                let specValue = 'N/A';
                if (item.specs && Array.isArray(item.specs)) {
                    // Find the spec value, checking both direct and categorized specs
                    for (const specItem of item.specs) {
                        if (specItem.key === specKey) {
                            specValue = specItem.value;
                            break;
                        } else if (specItem.category && Array.isArray(specItem.items)) {
                            const subItem = specItem.items.find(si => si.key === specKey);
                            if (subItem) {
                                specValue = subItem.value;
                                break;
                            }
                        }
                    }
                }
                cell.textContent = specValue;
            });
        });

        comparisonTableContainer.appendChild(table);
        comparisonModal.classList.add('show');
        comparisonModal.querySelector('.modal-content.large').scrollTop = 0;
    }
    function closeComparisonModal() { comparisonModal.classList.remove('show'); }

    // --- EVENT LISTENERS ---
    categoryFilter.addEventListener('change', applyFiltersAndSort);
    brandFilter.addEventListener('change', applyFiltersAndSort);
    sortBy.addEventListener('change', applyFiltersAndSort);
    resetFiltersBtn.addEventListener('click', () => {
        categoryFilter.value = 'all'; brandFilter.value = 'all'; sortBy.value = 'default';
        applyFiltersAndSort();
    });

    closeBuyModalBtn.addEventListener('click', closeBuyModal);
    buyModal.addEventListener('click', (e) => { if (e.target === buyModal) closeBuyModal(); });

    closeDetailModalBtn.addEventListener('click', closeInstrumentDetailModal);
    instrumentDetailModal.addEventListener('click', (e) => { if (e.target === instrumentDetailModal) closeInstrumentDetailModal(); });

    compareNowBtn.addEventListener('click', showComparisonModal);
    clearCompareBtn.addEventListener('click', clearComparison);
    closeComparisonModalBtn.addEventListener('click', closeComparisonModal);
    comparisonModal.addEventListener('click', (e) => { if (e.target === comparisonModal) closeComparisonModal(); });

    // --- INITIALIZATION ---
    populateFilters();
    applyFiltersAndSort();
    updateCompareUI();
});