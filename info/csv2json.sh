#!/usr/bin/env bash

while getopts i:o: flag
do
    case "${flag}" in
        i) inputfile=${OPTARG};;
        o) outputfile=${OPTARG};;
    esac
done


cat ${inputfile} | python -c 'import csv, json, sys; print(json.dumps([dict(r) for r in csv.DictReader(sys.stdin)]))' > "${outputfile}"


sed -i '' -e s/\"false\"/false/gi -e s/\"true\"/true/gi  "${outputfile}"