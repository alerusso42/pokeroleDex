#!/bin/bash

dirs=("Ability" "Item" "Move" "Nature" "Pokemon");
list="../list";
version="2.0"

mkdir -p $list
for dir in "${dirs[@]}"; do
	file="$list/$dir"".txt";
	rm -f file
	echo "--- $dir ---" > "$file"
	path="../v$version/"$dir
	ls -1 "$path" | sed "s/\.json//g" > "$file"
done
