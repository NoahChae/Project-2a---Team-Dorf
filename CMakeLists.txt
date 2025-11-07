cmake_minimum_required(VERSION 3.10)
project(MealQualityScorer)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add executable
add_executable(MealQualityScorer main.cpp)

# If you want to add warnings
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
    target_compile_options(MealQualityScorer PRIVATE -Wall -Wextra -pedantic)
endif()
