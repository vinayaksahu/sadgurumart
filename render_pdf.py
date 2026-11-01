import os
import subprocess
import fitz  # PyMuPDF

html_path = os.path.abspath("Sadguru_Mart_MLM_Plan_Executive.html")
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

print("Running Chrome to generate PDF...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Chrome exit code:", res.returncode)

if os.path.exists(pdf_path):
    print(f"PDF generated: {os.path.getsize(pdf_path)} bytes")
    os.makedirs("slides_final_preview", exist_ok=True)
    doc = fitz.open(pdf_path)
    print(f"Total pages: {len(doc)}")
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=150)
        out_png = os.path.join("slides_final_preview", f"slide_{i+1:02d}.png")
        pix.save(out_png)
    print("All slides saved to slides_final_preview/")
else:
    print("PDF generation failed.")
