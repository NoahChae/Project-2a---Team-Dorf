#ifndef CSV_READER_H
#define CSV_READER_H

#include <string>
#include <vector>
#include <fstream>
#include <sstream>
#include <iostream>
#include "Food.h"

class CSVReader {
public:
    static std::vector<std::string> parseLine(const std::string& line) {
        std::vector<std::string> result;
        std::string current;
        bool inQuotes = false;

        for (size_t i = 0; i < line.length(); i++) {
            char c = line[i];
            
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                result.push_back(current);
                current.clear();
            } else {
                current += c;
            }
        }
        result.push_back(current);
        
        return result;
    }

    // Convert string to double, handling empty strings
    static double toDouble(const std::string& str) {
        if (str.empty()) return 0.0;
        try {
            return std::stod(str);
        } catch (...) {
            return 0.0;
        }
    }

    // Load foods from CSV file
    static std::vector<Food> loadFromCSV(const std::string& filename) {
        std::vector<Food> foods;
        std::ifstream file(filename);
        
        if (!file.is_open()) {
            std::cerr << "Error: Could not open file " << filename << std::endl;
            return foods;
        }

        std::string line;
        bool firstLine = true;

        std::cout << "Loading data from " << filename << "..." << std::endl;
        
        while (std::getline(file, line)) {
            if (firstLine) {
                firstLine = false;
                continue;
            }

            if (line.empty()) continue;

            std::vector<std::string> fields = parseLine(line);
            
            // CSV format: name,kcal,protein,fat,carbs,sugar,fiber,satfat,sodium
            if (fields.size() >= 9) {
                Food food(
                    fields[0],              // name
                    toDouble(fields[1]),    // kcal
                    toDouble(fields[2]),    // protein
                    toDouble(fields[3]),    // fat
                    toDouble(fields[4]),    // carbs
                    toDouble(fields[5]),    // sugar
                    toDouble(fields[6]),    // fiber
                    toDouble(fields[7]),    // satfat
                    toDouble(fields[8])     // sodium
                );
                foods.push_back(food);
            }
        }

        file.close();
        std::cout << "Loaded " << foods.size() << " food items." << std::endl;
        return foods;
    }
};

#endif // CSV_READER_H
