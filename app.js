// Global state
let foodData = [];
let mealItems = [];
let hashMap = null;
let trie = null;
let isDataLoaded = false;

// Initialize app
window.addEventListener('DOMContentLoaded', async () => {
    showLoading(true);
    await loadFoodData();
    isDataLoaded = true;
    showLoading(false);
    updateMealCount();
});

// Show/Hide loading indicator
function showLoading(show) {
    const indicator = document.getElementById('loadingIndicator');
    if (show) {
        indicator.classList.add('active');
    } else {
        indicator.classList.remove('active');
    }
}

// Screen navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Load food data from CSV
async function loadFoodData() {
    try {
        console.log('Attempting to load CSV...');
        
        // Try different possible paths
        const possiblePaths = [
            'nutrition_100k_branded.csv',
            './nutrition_100k_branded.csv',
            '../nutrition_100k_branded.csv'
        ];
        
        let csvText = null;
        let successPath = null;
        
        for (const path of possiblePaths) {
            try {
                console.log(`Trying path: ${path}`);
                const response = await fetch(path);
                if (response.ok) {
                    csvText = await response.text();
                    successPath = path;
                    console.log(`Successfully loaded from: ${path}`);
                    break;
                }
            } catch (e) {
                console.log(`Failed to load from ${path}:`, e.message);
            }
        }
        
        if (!csvText) {
            throw new Error('Could not load CSV from any path');
        }
        
        foodData = parseCSV(csvText);
        
        if (foodData.length === 0) {
            throw new Error('CSV parsed but no data found');
        }
        
        // Build HashMap and Trie
        console.log('Building HashMap...');
        hashMap = buildHashMap(foodData);
        console.log('Building Trie...');
        trie = buildTrie(foodData);
        
        console.log(`✓ Successfully loaded ${foodData.length} food items from ${successPath}`);
    } catch (error) {
        console.error('Error loading data:', error);
        alert(`Error loading food data: ${error.message}\n\nMake sure:\n1. You're running a web server (not opening file directly)\n2. nutrition_100k_branded.csv is in the same directory\n3. Check browser console for details`);
    }
}

// Parse CSV
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const foods = [];
    
    for (let i = 1; i < lines.length; i++) { // Skip header
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(',');
        if (parts.length >= 9) {
            foods.push({
                name: parts[0],
                kcal: parseFloat(parts[1]) || 0,
                protein: parseFloat(parts[2]) || 0,
                fat: parseFloat(parts[3]) || 0,
                carbs: parseFloat(parts[4]) || 0,
                sugar: parseFloat(parts[5]) || 0,
                fiber: parseFloat(parts[6]) || 0,
                satfat: parseFloat(parts[7]) || 0,
                sodium: parseFloat(parts[8]) || 0
            });
        }
    }
    
    return foods;
}

// Simple HashMap implementation (for demo)
function buildHashMap(foods) {
    const map = new Map();
    foods.forEach(food => {
        const key = food.name.toLowerCase();
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key).push(food);
    });
    return map;
}

// Simple Trie implementation (for demo)
function buildTrie(foods) {
    const trie = { children: {}, foods: [] };
    
    foods.forEach(food => {
        let node = trie;
        const key = food.name.toLowerCase();
        
        for (const char of key) {
            if (!node.children[char]) {
                node.children[char] = { children: {}, foods: [] };
            }
            node = node.children[char];
        }
        node.foods.push(food);
    });
    
    return trie;
}

// Search food
function searchFood() {
    if (!isDataLoaded || foodData.length === 0) {
        alert('Please wait for data to finish loading...');
        return;
    }
    
    const query = document.getElementById('searchInput').value.trim().toLowerCase();
    const searchType = document.getElementById('searchType').value;
    const dataStructure = document.getElementById('dataStructure').value;
    
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<h3>Results:</h3>';
    
    let hashMapResults = [];
    let trieResults = [];
    let hashMapTime = 0;
    let trieTime = 0;
    
    // HashMap search
    if (dataStructure === 'both' || dataStructure === 'hashmap') {
        const start = performance.now();
        hashMapResults = searchInHashMap(query, searchType);
        hashMapTime = (performance.now() - start).toFixed(3);
    }
    
    // Trie search
    if (dataStructure === 'both' || dataStructure === 'trie') {
        const start = performance.now();
        trieResults = searchInTrie(query, searchType);
        trieTime = (performance.now() - start).toFixed(3);
    }
    
    // Display results
    if (dataStructure === 'both') {
        resultsDiv.innerHTML += `
            <div class="performance-comparison">
                <h4>HashMap Results (${hashMapTime}ms)</h4>
                ${displayFoodResults(hashMapResults, 'hashmap')}
                
                <h4 style="margin-top: 30px;">Trie Results (${trieTime}ms)</h4>
                ${displayFoodResults(trieResults, 'trie')}
                
                <div class="feedback" style="margin-top: 20px;">
                    <h4>Performance Comparison</h4>
                    <p>${comparePerformance(hashMapTime, trieTime)}</p>
                </div>
            </div>
        `;
    } else if (dataStructure === 'hashmap') {
        resultsDiv.innerHTML += `
            <p>Search time: ${hashMapTime}ms</p>
            ${displayFoodResults(hashMapResults, 'hashmap')}
        `;
    } else {
        resultsDiv.innerHTML += `
            <p>Search time: ${trieTime}ms</p>
            ${displayFoodResults(trieResults, 'trie')}
        `;
    }
}

// Search in HashMap
function searchInHashMap(query, searchType) {
    const results = [];
    
    if (searchType === 'exact') {
        const found = hashMap.get(query);
        if (found) results.push(...found);
    } else if (searchType === 'prefix') {
        for (const [key, foods] of hashMap.entries()) {
            if (key.startsWith(query)) {
                results.push(...foods);
            }
        }
    } else { // contains
        for (const [key, foods] of hashMap.entries()) {
            if (key.includes(query)) {
                results.push(...foods);
            }
        }
    }
    
    return results.slice(0, 20); // Limit to 20 results
}

// Search in Trie
function searchInTrie(query, searchType) {
    if (searchType === 'exact') {
        return searchTrieExact(trie, query);
    } else if (searchType === 'prefix') {
        return searchTriePrefix(trie, query);
    } else {
        // Contains search is not efficient in Trie, fall back to linear
        return foodData.filter(food => 
            food.name.toLowerCase().includes(query)
        ).slice(0, 20);
    }
}

function searchTrieExact(node, query) {
    for (const char of query) {
        if (!node.children[char]) return [];
        node = node.children[char];
    }
    return node.foods;
}

function searchTriePrefix(node, query) {
    for (const char of query) {
        if (!node.children[char]) return [];
        node = node.children[char];
    }
    
    // Collect all foods from this node and descendants
    const results = [];
    collectAllFoods(node, results);
    return results.slice(0, 20);
}

function collectAllFoods(node, results) {
    results.push(...node.foods);
    for (const char in node.children) {
        collectAllFoods(node.children[char], results);
    }
}

// Compare performance
function comparePerformance(hashMapTime, trieTime) {
    const diff = Math.abs(hashMapTime - trieTime);
    if (hashMapTime < trieTime) {
        const speedup = (trieTime / hashMapTime).toFixed(2);
        return `HashMap was faster by ${diff.toFixed(3)}ms (${speedup}x faster)`;
    } else if (trieTime < hashMapTime) {
        const speedup = (hashMapTime / trieTime).toFixed(2);
        return `Trie was faster by ${diff.toFixed(3)}ms (${speedup}x faster)`;
    } else {
        return 'Both data structures performed equally!';
    }
}

// Display food results
function displayFoodResults(foods, source) {
    if (foods.length === 0) {
        return '<p>No results found.</p>';
    }
    
    return `
        <p>Found ${foods.length} results:</p>
        ${foods.map(food => createFoodCard(food)).join('')}
    `;
}

// Create food card HTML
function createFoodCard(food) {
    const score = calculateScore(food);
    const scoreClass = score >= 7 ? 'score-high' : score >= 4 ? 'score-medium' : 'score-low';
    
    return `
        <div class="food-card">
            <h4>${food.name}</h4>
            <span class="food-score ${scoreClass}">Score: ${score}/10</span>
            <div class="food-nutrients">
                <div class="nutrient">
                    <span class="nutrient-label">Protein:</span> ${food.protein.toFixed(1)}g
                </div>
                <div class="nutrient">
                    <span class="nutrient-label">Carbs:</span> ${food.carbs.toFixed(1)}g
                </div>
                <div class="nutrient">
                    <span class="nutrient-label">Fat:</span> ${food.fat.toFixed(1)}g
                </div>
                <div class="nutrient">
                    <span class="nutrient-label">Calories:</span> ${food.kcal.toFixed(0)} kcal
                </div>
            </div>
        </div>
    `;
}

// Calculate nutrition score
function calculateScore(food) {
    const negativePoints = calculateNegativePoints(food);
    const positivePoints = calculatePositivePoints(food);
    let score = 10 - (negativePoints - positivePoints);
    return Math.max(1, Math.min(10, score));
}

function calculateNegativePoints(food) {
    let points = 0;
    const energyKJ = food.kcal * 4.184;
    
    // Energy points
    if (energyKJ <= 335) points += 0;
    else if (energyKJ <= 670) points += 1;
    else if (energyKJ <= 1005) points += 2;
    else if (energyKJ <= 1340) points += 3;
    else if (energyKJ <= 1675) points += 4;
    else if (energyKJ <= 2010) points += 5;
    else if (energyKJ <= 2345) points += 6;
    else if (energyKJ <= 2680) points += 7;
    else if (energyKJ <= 3015) points += 8;
    else if (energyKJ <= 3350) points += 9;
    else points += 10;
    
    // Saturated fat
    if (food.satfat <= 1) points += 0;
    else if (food.satfat <= 2) points += 1;
    else if (food.satfat <= 3) points += 2;
    else if (food.satfat <= 4) points += 3;
    else if (food.satfat <= 5) points += 4;
    else if (food.satfat <= 6) points += 5;
    else if (food.satfat <= 7) points += 6;
    else if (food.satfat <= 8) points += 7;
    else if (food.satfat <= 9) points += 8;
    else if (food.satfat <= 10) points += 9;
    else points += 10;
    
    // Sugar
    if (food.sugar <= 4.5) points += 0;
    else if (food.sugar <= 9) points += 1;
    else if (food.sugar <= 13.5) points += 2;
    else if (food.sugar <= 18) points += 3;
    else if (food.sugar <= 22.5) points += 4;
    else if (food.sugar <= 27) points += 5;
    else if (food.sugar <= 31) points += 6;
    else if (food.sugar <= 36) points += 7;
    else if (food.sugar <= 40) points += 8;
    else if (food.sugar <= 45) points += 9;
    else points += 10;
    
    // Sodium
    if (food.sodium <= 90) points += 0;
    else if (food.sodium <= 180) points += 1;
    else if (food.sodium <= 270) points += 2;
    else if (food.sodium <= 360) points += 3;
    else if (food.sodium <= 450) points += 4;
    else if (food.sodium <= 540) points += 5;
    else if (food.sodium <= 630) points += 6;
    else if (food.sodium <= 720) points += 7;
    else if (food.sodium <= 810) points += 8;
    else if (food.sodium <= 900) points += 9;
    else points += 10;
    
    return points;
}

function calculatePositivePoints(food) {
    let points = 0;
    
    // Protein
    if (food.protein <= 1.6) points += 0;
    else if (food.protein <= 3.2) points += 1;
    else if (food.protein <= 4.8) points += 2;
    else if (food.protein <= 6.4) points += 3;
    else if (food.protein <= 8.0) points += 4;
    else points += 5;
    
    // Fiber
    if (food.fiber <= 0.9) points += 0;
    else if (food.fiber <= 1.9) points += 1;
    else if (food.fiber <= 2.8) points += 2;
    else if (food.fiber <= 3.7) points += 3;
    else if (food.fiber <= 4.7) points += 4;
    else points += 5;
    
    return points;
}

// Search for adding food
function searchForAdd() {
    if (!isDataLoaded || foodData.length === 0) {
        alert('Please wait for data to finish loading...');
        return;
    }
    
    const query = document.getElementById('addFoodInput').value.trim().toLowerCase();
    
    if (!query) {
        alert('Please enter a food name');
        return;
    }
    
    const results = searchInHashMap(query, 'contains');
    const resultsDiv = document.getElementById('addFoodResults');
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No foods found.</p>';
        return;
    }
    
    resultsDiv.innerHTML = `
        <h4>Select a food to add:</h4>
        ${results.map((food, index) => `
            <div class="food-card">
                <h4>${food.name}</h4>
                <span class="food-score ${calculateScore(food) >= 7 ? 'score-high' : 'score-medium'}">
                    Score: ${calculateScore(food)}/10
                </span>
                <div class="serving-size-input">
                    <label>Serving size:</label>
                    <input type="number" id="serving-${index}" value="100" min="1" max="1000">
                    <span>grams</span>
                </div>
                <button class="add-food-btn" onclick="addFoodToMeal(${index})">Add to Meal</button>
            </div>
        `).join('')}
    `;
    
    // Store results for later
    window.currentSearchResults = results;
}

// Add food to meal
function addFoodToMeal(index) {
    const food = window.currentSearchResults[index];
    const servingSize = parseFloat(document.getElementById(`serving-${index}`).value) || 100;
    const multiplier = servingSize / 100;
    
    const adjustedFood = {
        name: food.name,
        kcal: food.kcal * multiplier,
        protein: food.protein * multiplier,
        fat: food.fat * multiplier,
        carbs: food.carbs * multiplier,
        sugar: food.sugar * multiplier,
        fiber: food.fiber * multiplier,
        satfat: food.satfat * multiplier,
        sodium: food.sodium * multiplier,
        servingSize: servingSize
    };
    
    mealItems.push(adjustedFood);
    updateMealCount();
    
    alert(`Added ${food.name} (${servingSize}g) to your meal!`);
}

// Update meal count
function updateMealCount() {
    document.getElementById('mealCount').textContent = mealItems.length;
}

// Clear meal
function clearMeal() {
    if (mealItems.length === 0) {
        alert('Meal is already empty!');
        return;
    }
    
    if (confirm('Are you sure you want to clear your meal?')) {
        mealItems = [];
        updateMealCount();
        alert('Meal cleared!');
    }
}

// Calculate meal score
function calculateMealScore() {
    if (mealItems.length === 0) {
        alert('Please add some foods to your meal first!');
        return;
    }
    
    // Calculate totals
    const total = {
        kcal: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        sugar: 0,
        fiber: 0,
        satfat: 0,
        sodium: 0
    };
    
    mealItems.forEach(food => {
        for (const key in total) {
            total[key] += food[key];
        }
    });
    
    const score = calculateScore(total);
    const feedback = getFeedback(score);
    
    // Display meal items
    const mealItemsDiv = document.getElementById('mealItems');
    mealItemsDiv.innerHTML = `
        <h4>Meal Contents:</h4>
        ${mealItems.map((food, index) => `
            <div class="meal-item">
                <span class="meal-item-name">${food.name} (${food.servingSize}g)</span>
                <button class="meal-item-remove" onclick="removeMealItem(${index})">Remove</button>
            </div>
        `).join('')}
    `;
    
    // Display score
    document.getElementById('scoreValue').textContent = score;
    const scoreCircle = document.getElementById('scoreCircle');
    if (score >= 7) {
        scoreCircle.style.background = 'linear-gradient(135deg, #52C41A 0%, #389E0D 100%)';
    } else if (score >= 4) {
        scoreCircle.style.background = 'linear-gradient(135deg, #FFA940 0%, #FA8C16 100%)';
    } else {
        scoreCircle.style.background = 'linear-gradient(135deg, #F5222D 0%, #CF1322 100%)';
    }
    
    // Display nutrition
    document.getElementById('nutritionPanel').innerHTML = `
        <h4>Macronutrients</h4>
        <div class="macronutrients">
            <div class="nutrient-item">
                <div class="label">Protein</div>
                <div class="value">${total.protein.toFixed(1)}<span class="unit">g</span></div>
            </div>
            <div class="nutrient-item">
                <div class="label">Carbohydrates</div>
                <div class="value">${total.carbs.toFixed(1)}<span class="unit">g</span></div>
            </div>
            <div class="nutrient-item">
                <div class="label">Fat</div>
                <div class="value">${total.fat.toFixed(1)}<span class="unit">g</span></div>
            </div>
        </div>
        
        <h4>Micronutrients</h4>
        <div class="micronutrients">
            <div class="nutrient-item">
                <div class="label">Fiber</div>
                <div class="value">${total.fiber.toFixed(1)}<span class="unit">g</span></div>
            </div>
            <div class="nutrient-item">
                <div class="label">Sugar</div>
                <div class="value">${total.sugar.toFixed(1)}<span class="unit">g</span></div>
            </div>
            <div class="nutrient-item">
                <div class="label">Sodium</div>
                <div class="value">${total.sodium.toFixed(0)}<span class="unit">mg</span></div>
            </div>
        </div>
    `;
    
    // Display feedback
    document.getElementById('scoreFeedback').innerHTML = `
        <h4>Here's why this is your score:</h4>
        <p>${feedback}</p>
    `;
    
    showScreen('scoreScreen');
}

function getFeedback(score) {
    if (score >= 9) return "Excellent! Very nutritious choice. Your meal is well-balanced with great nutritional value.";
    if (score >= 7) return "Good! This is a healthy option. Your meal has good nutritional balance.";
    if (score >= 5) return "Moderate. Could be balanced with healthier foods. Consider adding more vegetables or reducing processed foods.";
    if (score >= 3) return "Below average. Consider healthier alternatives. Try to reduce sugar, saturated fat, and sodium.";
    return "Poor nutritional value. Try to limit consumption. This meal is high in negative nutrients and low in beneficial ones.";
}

function removeMealItem(index) {
    mealItems.splice(index, 1);
    updateMealCount();
    calculateScore(); // Refresh display
}

// Show statistics
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    if (screenId === 'statsScreen') {
        displayStatistics();
    }
}

function displayStatistics() {
    // Mock statistics
    document.getElementById('hashMapStats').innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Total Items:</span>
            <span class="stat-value">${foodData.length}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Build Time:</span>
            <span class="stat-value">~70ms</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Structure:</span>
            <span class="stat-value">Chaining</span>
        </div>
    `;
    
    document.getElementById('trieStats').innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Total Items:</span>
            <span class="stat-value">${foodData.length}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Build Time:</span>
            <span class="stat-value">~294ms</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Structure:</span>
            <span class="stat-value">Prefix Tree</span>
        </div>
    `;
    
    document.getElementById('perfStats').innerHTML = `
        <p><strong>HashMap excels at:</strong> Exact matches, contains searches</p>
        <p><strong>Trie excels at:</strong> Prefix searches (autocomplete)</p>
        <p style="margin-top: 15px; font-size: 0.9em; color: #666;">
            Try different search types to see the performance differences!
        </p>
    `;
}
