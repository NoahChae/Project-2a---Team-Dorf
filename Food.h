#ifndef FOOD_H
#define FOOD_H

#include <string>
#include <iomanip>
#include <sstream>

struct Food {
    std::string name;
    double kcal;      // Energy in kJ
    double protein;   // g/100g
    double fat;       // g/100g
    double carbs;     // g/100g
    double sugar;     // g/100g
    double fiber;     // g/100g
    double satfat;    // Saturated fat g/100g
    double sodium;    // mg/100g

    Food() : kcal(0), protein(0), fat(0), carbs(0), sugar(0), 
             fiber(0), satfat(0), sodium(0) {}

    Food(std::string n, double k, double p, double f, double c, 
         double sg, double fb, double sf, double sd)
        : name(n), kcal(k), protein(p), fat(f), carbs(c), 
          sugar(sg), fiber(fb), satfat(sf), sodium(sd) {}
    // Convert kcal to kJ (1 kcal = 4.184 kJ)
    double getEnergyKJ() const {
        return kcal * 4.184;
    }

    // Calculate nutrition score based on the scoring tables
    int calculateScore() const {
        int negativePoints = calculateNegativePoints();
        int positivePoints = calculatePositivePoints();
        
        // Final score: 10 - (negative - positive), clamped to 1-10
        int score = 10 - (negativePoints - positivePoints);
        if (score < 1) score = 1;
        if (score > 10) score = 10;
        
        return score;
    }

    // Calculate negative points (energy, sat fat, sugars, sodium)
    int calculateNegativePoints() const {
        int points = 0;
        double energyKJ = getEnergyKJ();
        
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
        
        // Saturated fat points
        if (satfat <= 1) points += 0;
        else if (satfat <= 2) points += 1;
        else if (satfat <= 3) points += 2;
        else if (satfat <= 4) points += 3;
        else if (satfat <= 5) points += 4;
        else if (satfat <= 6) points += 5;
        else if (satfat <= 7) points += 6;
        else if (satfat <= 8) points += 7;
        else if (satfat <= 9) points += 8;
        else if (satfat <= 10) points += 9;
        else points += 10;
        
        // Sugar points
        if (sugar <= 4.5) points += 0;
        else if (sugar <= 9) points += 1;
        else if (sugar <= 13.5) points += 2;
        else if (sugar <= 18) points += 3;
        else if (sugar <= 22.5) points += 4;
        else if (sugar <= 27) points += 5;
        else if (sugar <= 31) points += 6;
        else if (sugar <= 36) points += 7;
        else if (sugar <= 40) points += 8;
        else if (sugar <= 45) points += 9;
        else points += 10;
        
        // Sodium points
        if (sodium <= 90) points += 0;
        else if (sodium <= 180) points += 1;
        else if (sodium <= 270) points += 2;
        else if (sodium <= 360) points += 3;
        else if (sodium <= 450) points += 4;
        else if (sodium <= 540) points += 5;
        else if (sodium <= 630) points += 6;
        else if (sodium <= 720) points += 7;
        else if (sodium <= 810) points += 8;
        else if (sodium <= 900) points += 9;
        else points += 10;
        
        return points;
    }

    // Calculate positive points (protein, fiber)
    int calculatePositivePoints() const {
        int points = 0;
        
        // Protein points
        if (protein <= 1.6) points += 0;
        else if (protein <= 3.2) points += 1;
        else if (protein <= 4.8) points += 2;
        else if (protein <= 6.4) points += 3;
        else if (protein <= 8.0) points += 4;
        else points += 5;
        
        // Fiber points
        if (fiber <= 0.9) points += 0;
        else if (fiber <= 1.9) points += 1;
        else if (fiber <= 2.8) points += 2;
        else if (fiber <= 3.7) points += 3;
        else if (fiber <= 4.7) points += 4;
        else points += 5;
        
        return points;
    }

    // Get feedback based on score
    std::string getFeedback() const {
        int score = calculateScore();
        if (score >= 9) return "Excellent! Very nutritious choice.";
        else if (score >= 7) return "Good! This is a healthy option.";
        else if (score >= 5) return "Moderate. Could be balanced with healthier foods.";
        else if (score >= 3) return "Below average. Consider healthier alternatives.";
        else return "Poor nutritional value. Try to limit consumption.";
    }

    // Display nutritional info
    void display() const {
        std::cout << "\n=== " << name << " ===" << std::endl;
        std::cout << std::fixed << std::setprecision(2);
        std::cout << "Energy: " << kcal << " kcal (" << getEnergyKJ() << " kJ)" << std::endl;
        std::cout << "Protein: " << protein << "g" << std::endl;
        std::cout << "Fat: " << fat << "g (Saturated: " << satfat << "g)" << std::endl;
        std::cout << "Carbs: " << carbs << "g (Sugars: " << sugar << "g)" << std::endl;
        std::cout << "Fiber: " << fiber << "g" << std::endl;
        std::cout << "Sodium: " << sodium << "mg" << std::endl;
    }
};

#endif // FOOD_H
