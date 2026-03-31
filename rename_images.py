import os
import glob
import shutil

dirs_to_fix = [
    r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web\static",
    r"c:\Users\wilson\.gemini\antigravity\scratch\static"
]

for d in dirs_to_fix:
    print(f"\nFixing directory: {d}")
    for filepath in glob.glob(os.path.join(d, "*.png")):
        filename = os.path.basename(filepath)
        # Check if it has an underscore followed by a long number
        if "_177" in filename:
            # e.g., location_karen_1774705225668.png -> location_karen.png
            base = filename.split("_177")[0] + ".png"
            new_path = os.path.join(d, base)
            if os.path.exists(new_path):
                os.remove(new_path)
            os.rename(filepath, new_path)
            print(f"Renamed: {filename} -> {base}")

# Also copy the overhauled HTML back to scratch/templates so Vercel gets the fix too
import glob
for f in glob.glob(r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web\*.html"):
    shutil.copy2(f, r"c:\Users\wilson\.gemini\antigravity\scratch\templates")
    
print("\nDone renaming AI images and syncing to Vercel templates.")
