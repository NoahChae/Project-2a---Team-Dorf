// ---------- State ----------
let foodData = [];
let mealItems = [];
let currentSearchResults = [];
let isDataLoaded = false;

// ---------- Bootstrap ----------
window.addEventListener('DOMContentLoaded', async () => {
  bindNav();
  bindActions();
  showLoading(true);
  await loadFoodData('data/nutrition_100k_branded.csv');
  isDataLoaded = true;
  showLoading(false);
  updateMealCount();
});

// ---------- UI helpers ----------
function showLoading(show) {
  const el = document.getElementById('loadingIndicator');
  if (el) el.classList.toggle('active', !!show);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');

  // Populate statistics when entering the stats screen
  if (id === 'statsScreen') {
    displayStatistics();
  }
}

function updateMealCount() {
  const el = document.getElementById('mealCount');
  if (el) el.textContent = mealItems.length;
}

// ---------- Navigation & actions ----------
function bindNav() {
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => showScreen(btn.dataset.nav));
  });
}

function bindActions() {
  const byId = id => document.getElementById(id);

  byId('btn-search')?.addEventListener('click', searchFood);
  byId('btn-search-add')?.addEventListener('click', searchForAdd);
  byId('btn-clear')?.addEventListener('click', clearMeal);
  byId('btn-calc')?.addEventListener('click', calculateMealScore);

  // Global event delegation for dynamically created Add buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add-index]');
    if (!btn) return;
    e.preventDefault();
    const idx = parseInt(btn.dataset.addIndex, 10);
    if (Number.isInteger(idx)) addFoodToMeal(idx);
  });

  // Event delegation for Remove buttons on the score screen
  const mealList = byId('mealItems');
  if (mealList) {
    mealList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-index]');
      if (!btn) return;
      const idx = parseInt(btn.dataset.removeIndex, 10);
      if (Number.isInteger(idx)) removeMealItem(idx);
    });
  }
}

// ---------- Data loading ----------
async function loadFoodData(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const text = await resp.text();
    foodData = parseCSV(text);
    if (!foodData.length) throw new Error('Parsed 0 rows');
  } catch (e) {
    console.error(e);
    alert(
        `Error loading food data: ${e.message}\n\n` +
        `Make sure you're serving from a local server and the CSV exists at ${url}`
    );
  }
}

// Minimal CSV parser (assumes no quoted commas)
function parseCSV(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const out = [];
  for (let i = 1; i < lines.length; i++) { // skip header
    const p = lines[i].split(',');
    if (p.length >= 9) {
      out.push({
        name: p[0],
        kcal: +p[1] || 0,
        protein: +p[2] || 0,
        fat: +p[3] || 0,
        carbs: +p[4] || 0,
        sugar: +p[5] || 0,
        fiber: +p[6] || 0,
        satfat: +p[7] || 0,
        sodium: +p[8] || 0
      });
    }
  }
  return out;
}

// ---------- Search (view-only) ----------
function searchFood() {
  if (!isDataLoaded) return alert('Please wait for data to finish loading...');
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!q) return alert('Please enter a search term');

  const results = [];
  for (const f of foodData) {
    if (f.name.toLowerCase().includes(q)) {
      results.push(f);
      if (results.length >= 50) break; // keep UI fast
    }
  }

  const div = document.getElementById('searchResults');
  div.innerHTML = results.length
      ? `<h3>Results:</h3>${results.map(renderFoodCard).join('')}`
      : '<p>No results found.</p>';
}

function renderFoodCard(food) {
  const s = scoreOf(food);
  const cls = s >= 7 ? 'score-high' : s >= 4 ? 'score-medium' : 'score-low';
  return `
    <div class="food-card">
      <h4>${food.name}</h4>
      <span class="food-score ${cls}">Score: ${s}/10</span>
      <div class="food-nutrients">
        <div><strong>Protein:</strong> ${food.protein.toFixed(1)}g</div>
        <div><strong>Carbs:</strong> ${food.carbs.toFixed(1)}g</div>
        <div><strong>Fat:</strong> ${food.fat.toFixed(1)}g</div>
        <div><strong>Calories:</strong> ${food.kcal.toFixed(0)} kcal</div>
      </div>
    </div>`;
}

// ---------- Add flow ----------
function searchForAdd() {
  if (!isDataLoaded) return alert('Please wait for data to finish loading...');
  const q = document.getElementById('addFoodInput').value.trim().toLowerCase();
  if (!q) return alert('Please enter a food name');

  const results = [];
  for (const f of foodData) {
    if (f.name.toLowerCase().includes(q)) {
      results.push(f);
      if (results.length >= 30) break;
    }
  }
  currentSearchResults = results;

  const div = document.getElementById('addFoodResults');
  if (!results.length) {
    div.innerHTML = '<p>No foods found.</p>';
    return;
  }

  // No inline onclick; use data-add-index for delegated handler
  div.innerHTML = `
    <h4>Select a food to add:</h4>
    ${results.map((food, i) => `
      <div class="food-card">
        <h4>${food.name}</h4>
        <span class="food-score ${scoreOf(food) >= 7 ? 'score-high' : 'score-medium'}">
          Score: ${scoreOf(food)}/10
        </span>
        <div class="serving-size-input">
          <label>Serving size:</label>
          <input type="number" id="serving-${i}" value="100" min="1" max="1000">
          <span>grams</span>
        </div>
        <button type="button"
                class="add-food-btn btn btn-success"
                data-add-index="${i}">
          Add to Meal
        </button>
      </div>
    `).join('')}
  `;
}

function addFoodToMeal(index) {
  if (index < 0 || index >= currentSearchResults.length) return;
  const food = currentSearchResults[index];
  const input = document.getElementById(`serving-${index}`);
  const grams = Math.max(1, parseFloat(input?.value) || 100);
  const m = grams / 100;

  mealItems.push({
    name: food.name,
    kcal: food.kcal * m,
    protein: food.protein * m,
    fat: food.fat * m,
    carbs: food.carbs * m,
    sugar: food.sugar * m,
    fiber: food.fiber * m,
    satfat: food.satfat * m,
    sodium: food.sodium * m,
    servingSize: grams
  });

  updateMealCount();
  alert(`Added ${food.name} (${grams}g) to your meal!`);
}

// ---------- Score screen ----------
function calculateMealScore() {
  if (!mealItems.length) return alert('Please add some foods first!');

  // Totals
  const total = { kcal:0, protein:0, fat:0, carbs:0, sugar:0, fiber:0, satfat:0, sodium:0 };
  for (const f of mealItems) for (const k in total) total[k] += f[k];

  // Meal contents list
  const list = document.getElementById('mealItems');
  list.innerHTML = `
    <h4>Meal Contents:</h4>
    ${mealItems.map((f, i) => `
      <div class="meal-item">
        <span class="meal-item-name">${f.name} (${f.servingSize}g)</span>
        <button class="meal-item-remove btn btn-secondary" data-remove-index="${i}">Remove</button>
      </div>
    `).join('')}
  `;

  // Score circle
  const score = scoreOf(total);
  const circle = document.getElementById('scoreCircle');
  const value  = document.getElementById('scoreValue');
  value.textContent = score;
  circle.style.background = score >= 7 ? '#16a34a' : score >= 4 ? '#facc15' : '#dc2626';
  circle.style.color      = score >= 4 && score < 7 ? '#111' : '#fff';

  // Nutrition breakdown
  document.getElementById('nutritionPanel').innerHTML = `
    <h4>Macronutrients</h4>
    <div class="macronutrients">
      ${nutrientItem('Protein', total.protein, 'g')}
      ${nutrientItem('Carbohydrates', total.carbs, 'g')}
      ${nutrientItem('Fat', total.fat, 'g')}
    </div>
    <h4>Micronutrients</h4>
    <div class="micronutrients">
      ${nutrientItem('Fiber', total.fiber, 'g')}
      ${nutrientItem('Sugar', total.sugar, 'g')}
      ${nutrientItem('Sodium', total.sodium, 'mg', 0)}
    </div>
  `;

  // Feedback
  document.getElementById('scoreFeedback').innerHTML = `
    <h4>Here's why this is your score:</h4>
    <p>${feedbackOf(score)}</p>
  `;

  showScreen('scoreScreen');
}

function nutrientItem(label, value, unit, digits = 1) {
  return `
    <div class="nutrient-item">
      <div class="label">${label}</div>
      <div class="value">${value.toFixed(digits)}<span class="unit">${unit}</span></div>
    </div>
  `;
}

function removeMealItem(index) {
  if (index < 0 || index >= mealItems.length) return;
  mealItems.splice(index, 1);
  updateMealCount();
  if (document.getElementById('scoreScreen')?.classList.contains('active')) {
    calculateMealScore(); // refresh totals & list
  }
}

function clearMeal() {
  if (!mealItems.length) return alert('Meal is already empty!');
  if (confirm('Clear your meal?')) {
    mealItems = [];
    updateMealCount();
    alert('Meal cleared!');
  }
}

// ---------- Statistics (educational summary) ----------
function displayStatistics() {
  const total = foodData.length || 0;

  document.getElementById('hashMapStats').innerHTML = `
    <h3>HashMap Statistics</h3>
    <div class="stat-item"><span class="stat-label">Total Items:</span><span class="stat-value">${total}</span></div>
    <div class="stat-item"><span class="stat-label">Build Time:</span><span class="stat-value">~70ms</span></div>
    <div class="stat-item"><span class="stat-label">Structure:</span><span class="stat-value">Chaining</span></div>
  `;

  document.getElementById('trieStats').innerHTML = `
    <h3>Trie Statistics</h3>
    <div class="stat-item"><span class="stat-label">Total Items:</span><span class="stat-value">${total}</span></div>
    <div class="stat-item"><span class="stat-label">Build Time:</span><span class="stat-value">~294ms</span></div>
    <div class="stat-item"><span class="stat-label">Structure:</span><span class="stat-value">Prefix Tree</span></div>
  `;

  document.getElementById('perfStats').innerHTML = `
    <h3>Performance Comparison</h3>
    <p><strong>HashMap:</strong> Best for exact or substring (“contains”) searches.</p>
    <p><strong>Trie:</strong> Best for prefix/autocomplete searches.</p>
    <p style="margin-top:8px;font-size:.9em;color:#666;">
      Try the Search vs Add screens to see the practical difference.
    </p>
  `;
}

// ---------- Scoring ----------
function scoreOf(f) {
  const neg = negPoints(f), pos = posPoints(f);
  return Math.max(1, Math.min(10, 10 - (neg - pos)));
}
function negPoints(f) {
  let p = 0;
  const kJ = (f.kcal || 0) * 4.184;
  p += kJ<=335?0:kJ<=670?1:kJ<=1005?2:kJ<=1340?3:kJ<=1675?4:kJ<=2010?5:kJ<=2345?6:kJ<=2680?7:kJ<=3015?8:kJ<=3350?9:10;
  const s = f.satfat || 0; p += s<=1?0:s<=2?1:s<=3?2:s<=4?3:s<=5?4:s<=6?5:s<=7?6:s<=8?7:s<=9?8:s<=10?9:10;
  const g = f.sugar  || 0; p += g<=4.5?0:g<=9?1:g<=13.5?2:g<=18?3:g<=22.5?4:g<=27?5:g<=31?6:g<=36?7:g<=40?8:g<=45?9:10;
  const na= f.sodium || 0; p += na<=90?0:na<=180?1:na<=270?2:na<=360?3:na<=450?4:na<=540?5:na<=630?6:na<=720?7:na<=810?8:na<=900?9:10;
  return p;
}
function posPoints(f) {
  let p = 0;
  const pr = f.protein || 0, fb = f.fiber || 0;
  p += pr<=1.6?0:pr<=3.2?1:pr<=4.8?2:pr<=6.4?3:pr<=8?4:5;
  p += fb<=0.9?0:fb<=1.9?1:fb<=2.8?2:fb<=3.7?3:fb<=4.7?4:5;
  return p;
}
function feedbackOf(s) {
  return s>=9 ? "Excellent! Very nutritious choice. Your meal is well-balanced."
      : s>=7 ? "Good! Healthy overall with decent balance."
          : s>=5 ? "Moderate. Improve with more fiber/protein and less sugar/sat fat/sodium."
              : s>=3 ? "Below average. Consider healthier alternatives."
                  : "Poor nutritional value. Try to rebalance with whole foods.";
}
