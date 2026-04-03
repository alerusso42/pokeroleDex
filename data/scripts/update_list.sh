#!/bin/bash

dirs=("Ability" "Item" "Move" "Nature" "Pokemon");
file="../list.txt";

rm -f file
for dir in "${dirs[@]}"; do
	printf "--%s--\n", dir >> file
	path = "../"dir
	printf $(ls dir) | sed "s/.json//g" >> file
done
