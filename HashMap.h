#ifndef HASHMAP_H
#define HASHMAP_H

#include <string>
#include <vector>
#include <list>
#include <algorithm>
#include <cctype>
#include "Food.h"
#include <iostream>

class HashMap {
    static const int TABLE_SIZE = 100000;
    std::vector<std::list<Food>> table;

    // Hash function for strings
    int hashFunction(const std::string& key) const {
        unsigned long hash = 5381;
        for (char c : key) {
            hash = ((hash << 5) + hash) + std::tolower(c);
        }
        return hash % TABLE_SIZE;
    }
    //make lowercase
    std::string toLower(const std::string& str) const {
        std::string result = str;
        std::transform(result.begin(), result.end(), result.begin(),
                      [](unsigned char c) { return std::tolower(c); });
        return result;
    }

public:
    HashMap() : table(TABLE_SIZE) {}
    // Insert food item
    void insert(const Food& food) {
        int index = hashFunction(food.name);
        table[index].push_back(food);
    }
    //exact match
    std::vector<Food> searchExact(const std::string& name) const {
        std::vector<Food> results;
        int index = hashFunction(name);
        std::string lowerName = toLower(name);

        for (const auto& food : table[index]) {
            if (toLower(food.name) == lowerName) {
                results.push_back(food);
            }
        }
        return results;
    }
    // Search for prefix matches
    std::vector<Food> searchPrefix(const std::string& prefix) const {
        std::vector<Food> results;
        std::string lowerPrefix = toLower(prefix);

        for (const auto& bucket : table) {
            for (const auto& food : bucket) {
                std::string lowerName = toLower(food.name);
                if (lowerName.find(lowerPrefix) == 0) { // Check if starts with prefix
                    results.push_back(food);
                }
            }
        }
        return results;
    }

    // Search for foods containing the search term anywhere in the name
    std::vector<Food> searchContains(const std::string& searchTerm) const {
        std::vector<Food> results;
        std::string lowerTerm = toLower(searchTerm);

        for (const auto& bucket : table) {
            for (const auto& food : bucket) {
                std::string lowerName = toLower(food.name);
                if (lowerName.find(lowerTerm) != std::string::npos) {
                    results.push_back(food);
                }
            }
        }
        return results;
    }

    // Get statistics about the hash table
    void printStats() const {
        int nonEmptyBuckets = 0;
        int maxChainLength = 0;
        int totalItems = 0;

        for (const auto& bucket : table) {
            if (!bucket.empty()) {
                nonEmptyBuckets++;
                int chainLength = bucket.size();
                totalItems += chainLength;
                if (chainLength > maxChainLength) {
                    maxChainLength = chainLength;
                }
            }
        }

        std::cout << "\n=== HashMap Statistics ===" << std::endl;
        std::cout << "Table Size: " << TABLE_SIZE << std::endl;
        std::cout << "Total Items: " << totalItems << std::endl;
        std::cout << "Non-empty Buckets: " << nonEmptyBuckets << std::endl;
        std::cout << "Load Factor: " << (double)totalItems / TABLE_SIZE << std::endl;
        std::cout << "Max Chain Length: " << maxChainLength << std::endl;
    }
};

#endif // HASHMAP_H
