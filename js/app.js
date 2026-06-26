// Wedding Budget Planner - Main JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    initDarkMode();
    initMobileMenu();
    initBudgetCalculator();
    initExpenseTracker();
    initFAQAccordion();
});

// ===================== DARK MODE =====================
function initDarkMode() {
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('wb-theme');

    // Default to light mode, only use dark if explicitly saved as 'dark'
    if (savedTheme === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
        localStorage.setItem('wb-theme', 'light');
    }

    // All dark mode toggle buttons
    const toggles = document.querySelectorAll('[id^="darkModeToggle"]');
    toggles.forEach(function (btn) {
        btn.addEventListener('click', function () {
            html.classList.toggle('dark');
            const isDark = html.classList.contains('dark');
            localStorage.setItem('wb-theme', isDark ? 'dark' : 'light');
            // Re-render lucide icons after toggle to update icon colors
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    });
}

// ===================== MOBILE MENU =====================
function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    if (btn && menu) {
        btn.addEventListener('click', function () {
            menu.classList.toggle('hidden');
        });
    }
}

// ===================== BUDGET CALCULATOR =====================
function initBudgetCalculator() {
    // Pre-populate if results exist
    const stored = localStorage.getItem('wb-lastCalc');
    if (stored) {
        try {
            const data = JSON.parse(stored);
            if (data.size) document.getElementById('weddingSize').value = data.size;
            if (data.city) document.getElementById('city').value = data.city;
            if (data.style) document.getElementById('weddingStyle').value = data.style;
        } catch (e) { /* ignore */ }
    }
}

// Base multipliers by city
const CITY_MULTIPLIERS = {
    nyc: 1.45,
    la: 1.30,
    chicago: 1.10,
    seattle: 1.15,
    other: 1.00
};

// Style multipliers
const STYLE_MULTIPLIERS = {
    traditional: 1.0,
    outdoor: 0.85,
    destination: 1.35
};

// Base budgets per guest count tier
const BASE_BUDGETS = {
    small:  { min: 8000,  max: 18000, guests: 50 },
    medium: { min: 18000, max: 35000, guests: 100 },
    large:  { min: 35000, max: 70000, guests: 200 }
};

// Category percentages
const CATEGORY_ALLOCATIONS = [
    { name: 'Venue & Rental',         pct: 27 },
    { name: 'Food & Beverage',        pct: 25 },
    { name: 'Photography & Video',    pct: 10 },
    { name: 'Attire & Accessories',   pct: 7  },
    { name: 'Music & Entertainment',  pct: 7  },
    { name: 'Flowers & Decorations',  pct: 7  },
    { name: 'Stationery & Invitations', pct: 3 },
    { name: 'Cake & Desserts',        pct: 3  },
    { name: 'Transportation',         pct: 2  },
    { name: 'Officiant & Legal Fees', pct: 2  },
    { name: 'Bridal Party Gifts',     pct: 1  },
    { name: 'Honeymoon Contribution', pct: 3  },
    { name: 'Contingency Fund',       pct: 3  },
];

function calculateBudget() {
    const size = document.getElementById('weddingSize').value;
    const city = document.getElementById('city').value;
    const style = document.getElementById('weddingStyle').value;

    // Save for persistence
    localStorage.setItem('wb-lastCalc', JSON.stringify({ size: size, city: city, style: style }));

    const base = BASE_BUDGETS[size];
    const cityMult = CITY_MULTIPLIERS[city] || 1.0;
    const styleMult = STYLE_MULTIPLIERS[style] || 1.0;

    // Calculate estimated total (midpoint of range * adjustments)
    const midPoint = (base.min + base.max) / 2;
    const estimatedTotal = Math.round(midPoint * cityMult * styleMult);

    // Display total
    document.getElementById('totalBudget').textContent = '$' + estimatedTotal.toLocaleString();

    // Calculate category breakdown
    const breakdownDiv = document.getElementById('budgetBreakdown');
    const visualDiv = document.getElementById('visualSummary');
    breakdownDiv.innerHTML = '';
    visualDiv.innerHTML = '';

    CATEGORY_ALLOCATIONS.forEach(function (cat, index) {
        const amount = Math.round(estimatedTotal * cat.pct / 100);
        const barWidth = Math.round((amount / estimatedTotal) * 100);

        // Text breakdown
        breakdownDiv.innerHTML +=
            '<div class="flex items-center justify-between py-2">' +
                '<div class="flex items-center gap-3">' +
                    '<div class="w-3 h-3 rounded-full" style="background:hsl(' + (index * 26) + ', 70%, 55%)"></div>' +
                    '<span class="text-sm text-gray-700 dark:text-gray-300">' + cat.name + '</span>' +
                '</div>' +
                '<div class="text-right">' +
                    '<span class="font-semibold text-gray-900 dark:text-white">$' + amount.toLocaleString() + '</span>' +
                    '<span class="text-xs text-gray-500 dark:text-gray-400 ml-1">(' + cat.pct + '%)</span>' +
                '</div>' +
            '</div>';

        // Visual bars
        visualDiv.innerHTML +=
            '<div class="space-y-1">' +
                '<div class="flex justify-between text-xs text-gray-600 dark:text-gray-400">' +
                    '<span>' + cat.name + '</span>' +
                    '<span class="font-semibold">$' + amount.toLocaleString() + '</span>' +
                '</div>' +
                '<div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">' +
                    '<div class="progress-bar h-3 rounded-full" style="width:' + barWidth + '%; background:hsl(' + (index * 26) + ', 70%, 55%)"></div>' +
                '</div>' +
            '</div>';
    });

    // Show results
    const resultsEl = document.getElementById('budgetResults');
    resultsEl.classList.remove('hidden');
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function shareBudget() {
    const total = document.getElementById('totalBudget').textContent;
    const text = 'My estimated wedding budget is ' + total + ' using this free Wedding Budget Calculator!';

    if (navigator.share) {
        navigator.share({
            title: 'Wedding Budget Calculator',
            text: text,
            url: window.location.href
        }).catch(function () { /* share cancelled */ });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text + ' ' + window.location.href).then(function () {
            alert('Copied to clipboard!');
        }).catch(function () {
            alert('Share: ' + text);
        });
    }
}

// ===================== EXPENSE TRACKER =====================
const DEFAULT_CATEGORIES = [
    'Venue & Rental',
    'Food & Beverage',
    'Photography & Video',
    'Attire & Accessories',
    'Music & Entertainment',
    'Flowers & Decorations',
    'Stationery & Invitations',
    'Cake & Desserts',
    'Transportation',
    'Officiant & Legal Fees',
    'Miscellaneous'
];

let trackerCategories = [];

function initExpenseTracker() {
    const stored = localStorage.getItem('wb-tracker');
    if (stored) {
        try {
            trackerCategories = JSON.parse(stored);
        } catch (e) {
            trackerCategories = getDefaultTrackerData();
        }
    } else {
        trackerCategories = getDefaultTrackerData();
    }
    renderTracker();
}

function getDefaultTrackerData() {
    return DEFAULT_CATEGORIES.map(function (name) {
        return { id: Date.now() + Math.random(), name: name, budget: '', spent: '' };
    });
}

function renderTracker() {
    const tbody = document.getElementById('trackerBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    let totalBudget = 0;
    let totalSpent = 0;
    let overBudgetCount = 0;

    trackerCategories.forEach(function (cat, index) {
        const budgetNum = parseFloat(cat.budget) || 0;
        const spentNum = parseFloat(cat.spent) || 0;
        const diff = budgetNum - spentNum;
        const isOver = spentNum > budgetNum && budgetNum > 0;
        const isZeroBudget = budgetNum === 0 && spentNum > 0;
        const statusClass = (isOver || isZeroBudget) ? 'over-budget' : '';
        const statusBadge = isOver
            ? '<span class="px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-full text-xs font-bold">Over by $' + Math.abs(diff).toLocaleString() + '</span>'
            : isZeroBudget
                ? '<span class="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 rounded-full text-xs font-bold">No Budget Set</span>'
                : '<span class="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">On Track</span>';

        totalBudget += budgetNum;
        totalSpent += spentNum;

        tbody.innerHTML +=
            '<tr class="budget-row border-b border-gray-100 dark:border-gray-700 ' + (statusClass || '') + '">' +
                '<td class="py-3 px-4"><span class="text-sm font-medium text-gray-800 dark:text-white">' + cat.name + '</span></td>' +
                '<td class="py-3 px-4"><input type="number" value="' + cat.budget + '" onchange="updateTracker(' + index + ', \'budget\', this.value)" placeholder="0" class="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-pink focus:border-transparent"></td>' +
                '<td class="py-3 px-4"><input type="number" value="' + cat.spent + '" onchange="updateTracker(' + index + ', \'spent\', this.value)" placeholder="0" class="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm focus:ring-2 focus:ring-pink focus:border-transparent"></td>' +
                '<td class="py-3 px-4">' +
                    '<span class="text-sm font-semibold ' + (diff >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') + '">' +
                        (diff >= 0 ? '-' : '+') + '$' + Math.abs(diff).toLocaleString() +
                    '</span>' +
                '</td>' +
                '<td class="py-3 px-4">' + statusBadge + '</td>' +
                '<td class="py-3 px-4"><button onclick="removeCategory(' + index + ')" class="p-1 text-gray-400 hover:text-red-500 transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td>' +
            '</tr>';
    });

    // Update summary cards
    if (document.getElementById('summaryBudget')) {
        document.getElementById('summaryBudget').textContent = '$' + totalBudget.toLocaleString();
        document.getElementById('summarySpent').textContent = '$' + totalSpent.toLocaleString();
        const remaining = totalBudget - totalSpent;
        const remainingEl = document.getElementById('summaryRemaining');
        remainingEl.textContent = (remaining >= 0 ? '' : '-') + '$' + Math.abs(remaining).toLocaleString();
        remainingEl.className = 'text-2xl font-bold ' + (remaining >= 0 ? 'text-purple-800 dark:text-purple-300' : 'text-red-800 dark:text-red-300');

        const percent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
        const progressBar = document.getElementById('overallProgress');
        progressBar.style.width = Math.min(percent, 100) + '%';
        progressBar.className = 'progress-bar h-3 rounded-full ' + (percent > 100 ? 'bg-red-500' : percent > 80 ? 'bg-coral' : 'bg-gradient-to-r from-pink to-coral');
        document.getElementById('progressPercent').textContent = percent + '%';
    }

    // Re-initialize lucide icons for dynamically added elements
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Save to localStorage
    localStorage.setItem('wb-tracker', JSON.stringify(trackerCategories));
}

function updateTracker(index, field, value) {
    trackerCategories[index][field] = value;
    renderTracker();
}

function addCategory() {
    const nameInput = document.getElementById('newCategory');
    const budgetInput = document.getElementById('newBudget');
    const name = nameInput.value.trim();
    const budget = budgetInput.value;

    if (!name) {
        nameInput.focus();
        return;
    }

    trackerCategories.push({
        id: Date.now() + Math.random(),
        name: name,
        budget: budget,
        spent: ''
    });

    nameInput.value = '';
    budgetInput.value = '';
    renderTracker();
}

function removeCategory(index) {
    if (confirm('Remove "' + trackerCategories[index].name + '"?')) {
        trackerCategories.splice(index, 1);
        renderTracker();
    }
}

function resetTracker() {
    if (confirm('Reset all tracker data? This cannot be undone.')) {
        localStorage.removeItem('wb-tracker');
        trackerCategories = getDefaultTrackerData();
        renderTracker();
    }
}

// ===================== FAQ ACCORDION =====================
function initFAQAccordion() {
    // accordion toggler already wired via onclick in HTML
}

function toggleAccordion(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('.faq-icon');

    if (content.classList.contains('active')) {
        content.classList.remove('active');
        content.style.display = 'none';
        if (icon) icon.classList.remove('rotated');
    } else {
        content.classList.add('active');
        content.style.display = 'block';
        if (icon) icon.classList.add('rotated');
    }
}

// ===================== UTILITY =====================
function formatCurrency(amount) {
    return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ===================== EXPORT FUNCTIONS =====================
function exportToCSV() {
    if (trackerCategories.length === 0) {
        alert('No data to export. Add some categories first.');
        return;
    }
    const headers = ['Category', 'Budget ($)', 'Actual Spent ($)', 'Difference ($)'];
    const rows = trackerCategories.map(function(cat) {
        const budget = parseFloat(cat.budget) || 0;
        const spent = parseFloat(cat.spent) || 0;
        const diff = budget - spent;
        return [cat.name, budget, spent, diff];
    });

    // Add totals row
    const totalBudget = rows.reduce(function(sum, row) { return sum + row[1]; }, 0);
    const totalSpent = rows.reduce(function(sum, row) { return sum + row[2]; }, 0);
    rows.push(['TOTAL', totalBudget, totalSpent, totalBudget - totalSpent]);

    const csvContent = headers.join(',') + '\n' + rows.map(function(row) { return row.join(','); }).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wedding_budget_tracker_' + new Date().toISOString().split('T')[0] + '.csv';
    link.click();
}

function exportToJSON() {
    if (trackerCategories.length === 0) {
        alert('No data to export. Add some categories first.');
        return;
    }
    const exportData = {
        exportDate: new Date().toISOString(),
        categories: trackerCategories.map(function(cat) {
            const budget = parseFloat(cat.budget) || 0;
            const spent = parseFloat(cat.spent) || 0;
            return {
                name: cat.name,
                budget: budget,
                spent: spent,
                difference: budget - spent,
                status: spent > budget && budget > 0 ? 'over' : 'on-track'
            };
        }),
        summary: {
            totalBudget: trackerCategories.reduce(function(sum, cat) { return sum + (parseFloat(cat.budget) || 0); }, 0),
            totalSpent: trackerCategories.reduce(function(sum, cat) { return sum + (parseFloat(cat.spent) || 0); }, 0)
        }
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'wedding_budget_tracker_' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
}
