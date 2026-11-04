import sys, os
sys.stdout.reconfigure(encoding='utf-8')

for f in ['Sadguru_Mart_MLM_Plan.html', 'Sadguru_Mart_MLM_Plan_4x3.html', 'Sadguru_Mart_MLM_Plan_Bold.html', 'Sadguru_Mart_MLM_Plan_Executive.html']:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as fp:
            text = fp.read()
            count = text.count('class="slide"')
            print(f"{f}: {count} slides")
