#include <iostream>
#include <iomanip>
#include <chrono>
#include <algorithm>
#include <vector>
#include <string>
#include <limits>
#include "Food.h"
#include "HashMap.h"
#include "Trie.h"
#include "CSVReader.h"

using namespace std;
using namespace chrono;

struct SavedMeal {
    long long id;
    string name;
    int score;
    string feedback;
    vector<Food> items;
    Food total;
};

class MealQualityScorer {
    HashMap hashMap;
    Trie trie;
    vector<Food> mealItems;
    vector<SavedMeal> mealHistory;
    Food mealTotal;
public:
    void loadData(const string& filename) {
        cout << "\n========================================" << endl;
        cout << "   MEAL QUALITY SCORER - DATA LOADING" << endl;
        cout << "========================================\n" << endl;

        vector<Food> foods = CSVReader::loadFromCSV(filename);

        if (foods.empty()) {
            cout << "Error: No data loaded!" << endl;
            return;
        }
        cout << "\nLoading into HashMap..." << endl;
        auto start = high_resolution_clock::now();
        for (const auto& food : foods) {
            hashMap.insert(food);
        }
        auto end = high_resolution_clock::now();
        auto hashMapTime = duration_cast<milliseconds>(end - start).count();
        cout << "HashMap build time: " << hashMapTime << " ms" << endl;

        cout << "\nLoading into Trie..." << endl;
        start = high_resolution_clock::now();
        for (const auto& food : foods) {
            trie.insert(food);
        }
        end = high_resolution_clock::now();
        auto trieTime = duration_cast<milliseconds>(end - start).count();
        cout << "Trie build time: " << trieTime << " ms" << endl;

        cout << "\nData loaded successfully!" << endl;
        cout << "========================================\n" << endl;
    }

    void displayResults(const vector<Food>& results, int maxDisplay = 10) {
        if (results.empty()) {
            cout << "No results found." << endl;
            return;
        }

        cout << "\nFound " << results.size() << " results";
        if (results.size() > static_cast<size_t>(maxDisplay)) {
            cout << " (showing first " << maxDisplay << ")";
        }
        cout << ":\n" << endl;

        int count = 0;
        for (const auto& food : results) {
            if (count >= maxDisplay) break;
            cout << (count + 1) << ". " << food.name << endl;
            cout << "   Score: " << food.calculateScore() << "/10 - "
                 << food.getFeedback() << endl;
            count++;
        }
    }

    void searchFood() {
        cout << "\n========================================" << endl;
        cout << "         SEARCH FOR FOOD ITEMS" << endl;
        cout << "========================================\n" << endl;

        cout << "Enter search term: ";
        string searchTerm;
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        getline(cin, searchTerm);

        if (searchTerm.empty()) {
            cout << "Search term cannot be empty." << endl;
            return;
        }

        cout << "\nSelect search type:" << endl;
        cout << "1. Exact match" << endl;
        cout << "2. Prefix search (starts with)" << endl;
        cout << "3. Contains search" << endl;
        cout << "Choice: ";

        int choice;
        cin >> choice;

        vector<Food> hashMapResults, trieResults;
        auto hashMapTime = 0LL, trieTime = 0LL;

        auto start = high_resolution_clock::now();
        if (choice == 1) {
            hashMapResults = hashMap.searchExact(searchTerm);
        } else if (choice == 2) {
            hashMapResults = hashMap.searchPrefix(searchTerm);
        } else if (choice == 3) {
            hashMapResults = hashMap.searchContains(searchTerm);
        }
        auto end = high_resolution_clock::now();
        hashMapTime = duration_cast<microseconds>(end - start).count();

        start = high_resolution_clock::now();
        if (choice == 1) {
            trieResults = trie.searchExact(searchTerm);
        } else if (choice == 2) {
            trieResults = trie.searchPrefix(searchTerm);
        } else if (choice == 3) {
            trieResults = trie.searchContains(searchTerm);
        }
        end = high_resolution_clock::now();
        trieTime = duration_cast<microseconds>(end - start).count();

        cout << "\n--- HashMap Results ---" << endl;
        displayResults(hashMapResults);
        cout << "Search time: " << hashMapTime << " microseconds" << endl;

        cout << "\n--- Trie Results ---" << endl;
        displayResults(trieResults);
        cout << "Search time: " << trieTime << " microseconds" << endl;

        cout << "\n--- Performance Comparison ---" << endl;
        if (trieTime < hashMapTime) {
            cout << "Trie was faster by " << (hashMapTime - trieTime) << " microseconds" << endl;
        } else if (hashMapTime < trieTime) {
            cout << "HashMap was faster by " << (trieTime - hashMapTime) << " microseconds" << endl;
        } else {
            cout << "Both performed equally!" << endl;
        }
    }

    void addToMeal() {
        cout << "\n========================================" << endl;
        cout << "         ADD FOOD TO YOUR MEAL" << endl;
        cout << "========================================\n" << endl;

        cout << "Enter food name to search: ";
        string searchTerm;
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        getline(cin, searchTerm);

        vector<Food> results = hashMap.searchContains(searchTerm);

        if (results.empty()) {
            cout << "No foods found matching '" << searchTerm << "'" << endl;
            return;
        }

        cout << "\nSelect a food:" << endl;
        int maxDisplay = min(20, (int)results.size());
        for (int i = 0; i < maxDisplay; i++) {
            cout << (i + 1) << ". " << results[i].name << endl;
        }

        cout << "\nEnter number (0 to cancel): ";
        int choice;
        cin >> choice;

        if (choice < 1 || choice > maxDisplay) {
            cout << "Cancelled." << endl;
            return;
        }

        Food selectedFood = results[choice - 1];

        cout << "Enter serving size in grams (default 100g): ";
        double servingSize;
        cin >> servingSize;

        if (servingSize <= 0) servingSize = 100;

        double multiplier = servingSize / 100.0;
        Food adjustedFood = selectedFood;
        adjustedFood.kcal *= multiplier;
        adjustedFood.protein *= multiplier;
        adjustedFood.fat *= multiplier;
        adjustedFood.carbs *= multiplier;
        adjustedFood.sugar *= multiplier;
        adjustedFood.fiber *= multiplier;
        adjustedFood.satfat *= multiplier;
        adjustedFood.sodium *= multiplier;

        mealItems.push_back(adjustedFood);
        mealTotal.name = "";

        cout << "\nAdded to meal: " << selectedFood.name
             << " (" << servingSize << "g)" << endl;
    }

    void calculateMealScore() {
        if (mealItems.empty()) {
            cout << "\nNo items in meal! Add some foods first." << endl;
            return;
        }

        cout << "\n========================================" << endl;
        cout << "         YOUR MEAL SCORE" << endl;
        cout << "========================================\n" << endl;

        mealTotal = Food();
        mealTotal.name = "Your Complete Meal";

        for (const auto& food : mealItems) {
            mealTotal.kcal += food.kcal;
            mealTotal.protein += food.protein;
            mealTotal.fat += food.fat;
            mealTotal.carbs += food.carbs;
            mealTotal.sugar += food.sugar;
            mealTotal.fiber += food.fiber;
            mealTotal.satfat += food.satfat;
            mealTotal.sodium += food.sodium;
        }

        cout << "Meal Contents:" << endl;
        for (size_t i = 0; i < mealItems.size(); i++) {
            cout << (i + 1) << ". " << mealItems[i].name << endl;
        }

        mealTotal.display();

        int score = mealTotal.calculateScore();
        cout << "\n****************************************" << endl;
        cout << "       YOUR MEAL SCORE: " << score << "/10" << endl;
        cout << "****************************************" << endl;
        cout << mealTotal.getFeedback() << endl;
        cout << "========================================\n" << endl;
    }

    void clearMeal() {
        mealItems.clear();
        mealTotal = Food();
        cout << "\nMeal cleared!" << endl;
    }

    void saveCurrentMeal() {
        if (mealItems.empty()) {
            cout << "\nCannot save an empty meal. Add some items first." << endl;
            return;
        }
        if (mealTotal.name.empty()) {
            cout << "\nCalculate the score first before saving." << endl;
            calculateMealScore();
        }

        cout << "\nEnter a name for this meal: ";
        string mealName;
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        getline(cin, mealName);

        SavedMeal newMeal;
        newMeal.id = high_resolution_clock::now().time_since_epoch().count();
        newMeal.name = mealName;
        newMeal.items = mealItems;
        newMeal.total = mealTotal;
        newMeal.score = mealTotal.calculateScore();
        newMeal.feedback = mealTotal.getFeedback();

        mealHistory.push_back(newMeal);
        cout << "\nMeal '" << mealName << "' saved!" << endl;
    }

    void loadMealFromHistory(int index) {
        if (index < 0 || index >= mealHistory.size()) {
            cout << "Invalid selection." << endl;
            return;
        }
        mealItems = mealHistory[index].items;
        mealTotal = mealHistory[index].total;
        cout << "\nMeal '" << mealHistory[index].name << "' loaded!" << endl;
    }

    void deleteMealFromHistory(int index) {
        if (index < 0 || index >= mealHistory.size()) {
            cout << "Invalid selection." << endl;
            return;
        }
        string deletedName = mealHistory[index].name;
        mealHistory.erase(mealHistory.begin() + index);
        cout << "\nMeal '" << deletedName << "' deleted." << endl;
    }

    void viewMealHistory() {
        cout << "\n========================================" << endl;
        cout << "           YOUR SAVED MEALS" << endl;
        cout << "========================================\n" << endl;

        if (mealHistory.empty()) {
            cout << "No meals saved yet." << endl;
            return;
        }

        for (size_t i = 0; i < mealHistory.size(); ++i) {
            cout << (i + 1) << ". " << mealHistory[i].name << endl;
            cout << "   Score: " << mealHistory[i].score << "/10 - " << mealHistory[i].items.size() << " items" << endl;
        }

        cout << "\n----------------------------------------" << endl;
        cout << "Select an action:" << endl;
        cout << "1. Load a meal" << endl;
        cout << "2. Delete a meal" << endl;
        cout << "0. Back to Main Menu" << endl;
        cout << "Choice: ";

        int choice;
        cin >> choice;
        int mealIndex;

        switch (choice) {
            case 1:
                cout << "Enter meal number to load: ";
                cin >> mealIndex;
                loadMealFromHistory(mealIndex - 1);
                break;
            case 2:
                cout << "Enter meal number to delete: ";
                cin >> mealIndex;
                deleteMealFromHistory(mealIndex - 1);
                break;
            case 0:
            default:
                cout << "Returning to main menu." << endl;
                break;
        }
    }

    void displayStats() {
        hashMap.printStats();
        trie.printStats();
    }

    void run() {
        cout << "\n========================================" << endl;
        cout << "   MEAL QUALITY SCORER" << endl;
        cout << "   Created by: Noah Chae, Emmett Bradford, Josh Hoeckendorf" << endl;
        cout << "========================================\n" << endl;

        loadData("../../web/data/nutrition_100k_branded.csv");
        mealTotal.name = "";

        while (true) {
            cout << "\n========================================" << endl;
            cout << "              MAIN MENU" << endl;
            cout << "========================================" << endl;
            cout << "1. Search for food (compare performance)" << endl;
            cout << "2. Add food to meal" << endl;
            cout << "3. Calculate meal score" << endl;
            cout << "4. Clear meal" << endl;
            cout << "5. Save Current Meal" << endl;
            cout << "6. View Meal History" << endl;
            cout << "7. Display data structure statistics" << endl;
            cout << "8. Exit" << endl;
            cout << "========================================" << endl;
            cout << "Current meal items: " << mealItems.size() << endl;
            cout << "\nChoice: ";

            int choice;
            cin >> choice;

            switch (choice) {
                case 1:
                    searchFood();
                    break;
                case 2:
                    addToMeal();
                    break;
                case 3:
                    calculateMealScore();
                    break;
                case 4:
                    clearMeal();
                    break;
                case 5:
                    saveCurrentMeal();
                    break;
                case 6:
                    viewMealHistory();
                    break;
                case 7:
                    displayStats();
                    break;
                case 8:
                    cout << "\nThank you for using Meal Quality Scorer!" << endl;
                    return;
                default:
                    cout << "\nInvalid choice. Please try again." << endl;
                    if (cin.fail()) {
                        cin.clear();
                        cin.ignore(numeric_limits<streamsize>::max(), '\n');
                    }
            }
        }
    }
};

int main() {
    MealQualityScorer scorer;
    scorer.run();
    return 0;
}