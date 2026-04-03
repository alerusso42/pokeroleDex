#!/bin/bash

dirs=("Ability" "Item" "Move" "Nature" "Pokemon");
list="../list.txt";

rm -f $list
for dir in "${dirs[@]}"; do
	echo "--- $dir ---" >> $list
	path="../v3.0/"$dir
	ls -1 "$path" | sed "s/\.json//g" >> $list
done
