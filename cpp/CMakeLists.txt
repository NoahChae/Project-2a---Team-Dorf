cmake_minimum_required(VERSION 3.10)
project(MealQualityScorerCLI)

# Use C++17
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add executable
add_executable(MealQualityScorer
        src/main.cpp
)

# Include headers
target_include_directories(MealQualityScorer PRIVATE
        ${CMAKE_SOURCE_DIR}/include
)

# Compiler warnings
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
  target_compile_options(MealQualityScorer PRIVATE -Wall -Wextra -pedantic)
endif()
