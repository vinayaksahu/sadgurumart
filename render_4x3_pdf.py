import os
import subprocess
import pymupdf

html_path = os.path.abspath("Sadguru_Mart_MLM_Plan_4x3.html")
pdf_path = os.path.abspath("Sadguru_Mart_MLM_Plan.pdf")
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

url = f"file:///{html_path.replace(os.sep, '/')}"

cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={pdf_path}",
    url
]

print("Rendering 4:3 31-slide presentation to PDF...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Chrome exit code:", res.returncode)

if os.path.exists(pdf_path):
    print(f"PDF generated: {os.path.getsize(pdf_path)} bytes")
    os.makedirs("slides_4x3_preview", exist_ok=True)
    doc = pymupdf.open(pdf_path)
    print(f"Total pages: {len(doc)}")
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        out_png = os.path.join("slides_4x3_preview", f"slide_{i+1:02d}.png")
        pix.save(out_png)
    print("All slides saved to slides_4x3_preview/")
else:
    print("PDF generation failed.")
