scripts and logic are made for a specific project and cannot be used without modification on other files/projects, scripts are built in node js

add UMS, ONBOARDING and USERS .csv files in the same folder where scripts is
make sure to change files names to NG User Data - USERS_NG.csv , NG User Data - UMS.csv , NG User Data - ONBOARDING_NG.csv

make sure all packages are installed (csv parser, csv writer, fast csv, fs, faker)
cd {to-your-scripts-folder-path}
to run all scripts in bash //  chmod +x run-modification.sh   ------>   ./run-modification.sh
to run one by one // node {name_of_script}.js, (make sure you follow the order of scripts by number)