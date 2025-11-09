# Meal Quality Scorer

**Team Dorf**: Noah Chae, Emmett Bradford, Josh Hoeckendorf

A hybrid **C++** and **JavaScript** project that helps users evaluate the nutritional quality of their meals using efficient data structures and an interactive web interface.

---

## Features

- **Dual Interface**: C++ command-line version and browser-based web GUI  
- **Efficient Search**: Uses HashMap and Trie for fast lookups and prefix searches  
- **Nutritional Scoring**: Calculates a 1–10 health score based on meal composition  
- **Large Dataset**: Works with 100,000+ branded food items  
- **Performance Insights**: Demonstrates search and build time differences between data structures  
- **Meal Builder**: Add multiple foods, adjust serving sizes, and calculate an overall meal score  
- **Meal History**: Save, view, load, and delete past meals in both the C++ and Web versions  

---

## Project Structure

```
MealQualityScorer/
│
├── cpp/
│   ├── CMakeLists.txt      # Build configuration
│   ├── main.cpp            # CLI entry point and menu
│   ├── Food.h              # Food class and scoring algorithm
│   ├── HashMap.h           # Custom HashMap (chaining)
│   ├── Trie.h              # Trie (prefix tree for fast search)
│   └── CSVReader.h         # CSV parsing utility
│
├── web/
│   ├── index.html          # Web interface
│   ├── js/
│   │   └── app.js          # Web application logic
│   ├── assets/
│   │   └── styles.css      # Green and white theme
│   └── data/
│       └── nutrition_100k_branded.csv
```

---

## How to Build (C++ Version)

1. **Open the project in CLion or terminal**  
   - File → Open → Select the `cpp/` folder  

2. **Make sure your CSV file is accessible**  
   - The default path is set to `../../web/data/nutrition_100k_branded.csv`  

3. **Build and run**  
   ```bash
   mkdir build && cd build
   cmake ..
   make
   ./MealQualityScorer
   ```

---

## How to Run the Web Version

1. Open the `web/` folder in a terminal  
2. Start a simple local web server:
   ```python3 -m http.server 8080
   ```
3. Visit [http://localhost:8080](http://localhost:8080) in your browser  

You can now search foods, add them to a meal, and view your overall nutrition score interactively.

---

## Usage

### Command-Line (C++)
1. **Search for food** — Compare Trie vs HashMap speed  
2. **Add food to meal** — Add multiple items and serving sizes  
3. **Calculate meal score** — Get a final nutritional grade (1–10)  
4. **Clear meal** — Reset your meal data  
5. **Save Current Meal** — Save your current meal to history  
6. **View Meal History** — Load or delete previously saved meals  
7. **Display statistics** — Compare data structure performance  

### Web GUI
- **Search**: Type a food name to find results  
- **Add Food**: Add foods and customize serving size  
- **Meal Score**: View nutrient breakdown and overall score  
- **Statistics**: Educational summary of data structure efficiency  
- **History**: View, load, or delete saved meals from your browser's local storage  

---

## Nutritional Scoring System

Based on the UK Food Standards Agency’s nutrient profiling system:

**Negative Components** (lower is better):  
- Energy (kJ) s 
- Saturated fat (g)  
- Sugars (g)  
- Sodium (mg)  

**Positive Components** (higher is better):  
- Protein (g)  
- Fiber (g)  

**Formula**:
```
Score = 10 - (negative points - positive points)
```
Clamped between **1 (poor)** and **10 (excellent)**.

---

## Data Source

**USDA FoodData Central - Branded Food Products Database**  
Contains ~100,000 food items with nutritional data per 100g serving.

---

## Technical Details

- **Languages**: C++17, JavaScript, HTML, CSS  
- **Build System**: CMake  
- **Data Structures**:  
  - HashMap (O(1) average for exact matches)  
  - Trie (O(k) for prefix searches)  
- **Web Interface**: Responsive UI, modern styling, green/white palettes 

---

## Future Enhancements

- Add user accounts  
- Export nutrition summaries as PDF  
- Barcode scanner support  
- Mobile layout improvements  
- Integrate with health APIs for recommendations
