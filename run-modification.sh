#!/bin/bash

# Array of files to run
files=("csv.js" "csv1.js" "csv2.js" "csv3.js" "csv4.js" "csv5.js" "csv6.js" "csv7.js")

# Loop through each file and run it in sequence
for file in "${files[@]}"
do
    echo "Pokretanje $file..."
    node $file
    if [ $? -ne 0 ]; then
        echo "Greska u $file. Stop."
        exit 1
    fi
    echo "$file odradjen."
done

echo "Sve je zavresno uspesno, cestitamoooo."
