# Meal Quality Scorer

**Team Dorf**: Noah Chae, Emmett Bradford, Josh Hoeckendorf

A C++ application that helps users evaluate the nutritional quality of their meals using data structures (HashMap and Trie) for efficient food lookups.

## Features

- **Dual Data Structure Implementation**: Compare performance between HashMap and Trie
- **Nutritional Scoring**: Get a 1-10 score for meals based on nutritional content
- **Large Dataset**: Works with 100,000+ food items from USDA FoodData Central
- **Performance Metrics**: Real-time comparison of search speeds
- **Meal Builder**: Add multiple food items and get an overall meal score

## Project Structure

```
├── CMakeLists.txt      # CMake build configuration
├── main.cpp            # Main program with menu system
├── Food.h              # Food data structure and scoring algorithm
├── HashMap.h           # HashMap implementation (chaining)
├── Trie.h              # Trie implementation (prefix tree)
└── CSVReader.h         # CSV parsing utility
```

## How to Build in CLion

1. **Open the project in CLion**:
   - File → Open → Select the project folder

2. **Make sure your CSV file is accessible**:
   - Update the file path in `main.cpp` if needed (currently set to `/mnt/user-data/uploads/nutrition_100k_branded.csv`)

3. **Build the project**:
   - CLion should automatically detect the CMakeLists.txt
   - Click the Build button (hammer icon) or use `Ctrl+F9` (Windows/Linux) or `Cmd+F9` (Mac)

4. **Run the program**:
   - Click the Run button (play icon) or use `Shift+F10` (Windows/Linux) or `Ctrl+R` (Mac)

## Usage

The program provides an interactive menu with the following options:

1. **Search for food**: Compare HashMap vs Trie performance on:
   - Exact match searches
   - Prefix searches (where Trie excels)
   - Contains searches

2. **Add food to meal**: Build a meal by adding food items with custom serving sizes

3. **Calculate meal score**: Get a nutritional score (1-10) for your complete meal

4. **Clear meal**: Start over with a new meal

5. **Display statistics**: View data structure performance metrics

## Nutritional Scoring System

The scoring algorithm is based on the UK Food Standards Agency nutrient profiling system:

**Negative Components** (lower is better):
- Energy (kJ)
- Saturated fat (g/100g)
- Sugars (g/100g)
- Sodium (mg/100g)

**Positive Components** (higher is better):
- Protein (g/100g)
- Fiber (g/100g)

Score = 10 - (negative points - positive points), clamped to 1-10

## Performance Comparison

The project demonstrates key performance differences:

- **HashMap**: O(1) average for exact matches, O(n) for prefix searches
- **Trie**: O(k) for exact matches (k = key length), O(m) for prefix searches (m = matching results)

**Expected Results**:
- Prefix searches: Trie should be significantly faster
- Exact matches: HashMap should be slightly faster
- Build time: HashMap typically faster to construct

## Data Source

USDA FoodData Central - Branded Food Products Database
- ~100,000 food items
- Nutritional data per 100g serving

## Technical Details

- **Language**: C++17
- **Compiler**: g++ (or any C++17 compatible compiler)
- **Build System**: CMake
- **Data Structures**: 
  - HashMap: Array of linked lists with chaining
  - Trie: 27-way tree (26 letters + special chars)

## Future Enhancements

- Add graphical user interface
- Export meal plans
- Track daily/weekly nutrition
- Barcode scanning integration
- Recipe suggestions based on nutrition goals
