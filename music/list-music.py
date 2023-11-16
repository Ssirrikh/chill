
import os

WORKING_DIRECTORY = os.getcwd()
OUTPUT_FILE = 'resources.js'

files = []

print('Scanning files in ' + WORKING_DIRECTORY)

for (dirpath, dirnames, filenames) in os.walk(WORKING_DIRECTORY):
    DIRECTORY_PATH = dirpath.replace(WORKING_DIRECTORY,'')
    for filename in filenames:
        FILE_PATH = (DIRECTORY_PATH + '\\' + filename).replace('\\','/')[1:] # [1:] to remove initial '/'
        if FILE_PATH != 'list-music.py' and FILE_PATH != OUTPUT_FILE:
            FILE_INFO = FILE_PATH.split('/').pop().split(' - ')
            files.append('{ path: "' + FILE_PATH + '", composer: "' + FILE_INFO[0] + '", title: "' + FILE_INFO[1].split('.')[0] + '" }')

print('Scanned ' + str(len(files)) + ' files')

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write('let resources = [\n\t')
    f.write(',\n\t'.join(files))
    f.write('\n];')
