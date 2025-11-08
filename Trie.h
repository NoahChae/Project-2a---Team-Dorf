#ifndef TRIE_H
#define TRIE_H
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <cctype>
#include <memory>
#include "Food.h"

class TrieNode {
public:
    static const int ALPHABET_SIZE = 27; // 26 letters + space/special char
    std::unique_ptr<TrieNode> children[ALPHABET_SIZE];
    std::vector<Food> foods; // Store all foods that end at this node
    bool isEndOfWord;

    TrieNode() : isEndOfWord(false) {
        for (int i = 0; i < ALPHABET_SIZE; i++) {
            children[i] = nullptr;
        }
    }

    // Convert character to index (case-insensitive)
    static int charToIndex(char c) {
        c = std::tolower(c);
        if (c >= 'a' && c <= 'z') {
            return c - 'a';
        }
        return 26; // Use index 26 for spaces and special characters
    }
};

class Trie {
private:
    std::unique_ptr<TrieNode> root;

    // Helper function to convert string to lowercase
    std::string toLower(const std::string& str) const {
        std::string result = str;
        std::transform(result.begin(), result.end(), result.begin(),
                      [](unsigned char c) { return std::tolower(c); });
        return result;
    }

    // Helper function for prefix search
    void collectAllFoods(TrieNode* node, std::vector<Food>& results) const {
        if (node == nullptr) return;

        // Add foods at this node
        for (const auto& food : node->foods) {
            results.push_back(food);
        }

        // Recursively collect from all children
        for (int i = 0; i < TrieNode::ALPHABET_SIZE; i++) {
            if (node->children[i] != nullptr) {
                collectAllFoods(node->children[i].get(), results);
            }
        }
    }

public:
    Trie() {
        root = std::make_unique<TrieNode>();
    }

    // Insert a food item
    void insert(const Food& food) {
        std::string key = toLower(food.name);
        TrieNode* current = root.get();

        for (char c : key) {
            int index = TrieNode::charToIndex(c);
            if (current->children[index] == nullptr) {
                current->children[index] = std::make_unique<TrieNode>();
            }
            current = current->children[index].get();
        }

        current->isEndOfWord = true;
        current->foods.push_back(food);
    }

    // Search for exact match
    std::vector<Food> searchExact(const std::string& name) const {
        std::string key = toLower(name);
        TrieNode* current = root.get();

        for (char c : key) {
            int index = TrieNode::charToIndex(c);
            if (current->children[index] == nullptr) {
                return std::vector<Food>(); // Not found
            }
            current = current->children[index].get();
        }

        if (current != nullptr && current->isEndOfWord) {
            return current->foods;
        }
        return std::vector<Food>();
    }

    // Search for prefix matches (efficient in Trie!)
    std::vector<Food> searchPrefix(const std::string& prefix) const {
        std::vector<Food> results;
        std::string key = toLower(prefix);
        TrieNode* current = root.get();

        // Navigate to the prefix node
        for (char c : key) {
            int index = TrieNode::charToIndex(c);
            if (current->children[index] == nullptr) {
                return results; // Prefix not found
            }
            current = current->children[index].get();
        }

        // Collect all foods from this node and its descendants
        collectAllFoods(current, results);
        return results;
    }

    // Search for foods containing the search term anywhere in the name
    // Note: This is not efficient in a Trie (same as HashMap)
    // We'll need to traverse the entire tree
    std::vector<Food> searchContains(const std::string& searchTerm) const {
        std::vector<Food> results;
        std::string lowerTerm = toLower(searchTerm);
        
        // Get all foods and filter
        std::vector<Food> allFoods;
        collectAllFoods(root.get(), allFoods);
        
        for (const auto& food : allFoods) {
            std::string lowerName = toLower(food.name);
            if (lowerName.find(lowerTerm) != std::string::npos) {
                results.push_back(food);
            }
        }
        
        return results;
    }

    // Count total nodes (for statistics)
    int countNodes(TrieNode* node) const {
        if (node == nullptr) return 0;
        
        int count = 1;
        for (int i = 0; i < TrieNode::ALPHABET_SIZE; i++) {
            if (node->children[i] != nullptr) {
                count += countNodes(node->children[i].get());
            }
        }
        return count;
    }

    void printStats() const {
        int totalNodes = countNodes(root.get());
        std::cout << "\n=== Trie Statistics ===" << std::endl;
        std::cout << "Total Nodes: " << totalNodes << std::endl;
    }
};

#endif // TRIE_H
