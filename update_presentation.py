import os

script_path = "build_4x3_presentation.py"
with open(script_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update TOTAL_PAGES and add legal thumbnails
target_top = 'img_logo = get_base64_img("sgm_logo.png")\n\nTOTAL_PAGES = 31'
if target_top not in content:
    target_top = 'img_logo = get_base64_img("sgm_logo.png")\r\n\r\nTOTAL_PAGES = 31'

replacement_top = '''img_logo = get_base64_img("sgm_logo.png")

# Legal Documents Base64 Thumbnails
img_gst = get_base64_img("public/legal/gst_thumb.png")
img_fssai = get_base64_img("public/legal/fssai_thumb.png")
img_pan = get_base64_img("public/legal/pan_thumb.png")
img_udyam = get_base64_img("public/legal/udyam_thumb.png")
img_deed = get_base64_img("public/legal/deed_thumb.png")

TOTAL_PAGES = 32'''

content = content.replace(target_top, replacement_top)

# 2. Add Slide 30 (Legal Documents) and update subsequent slide numbers
legal_slide_code = '''
# ==============================================================================
# SLIDE 30: LEGAL CERTIFICATES & GOVERNMENT COMPLIANCE
# ==============================================================================
s30_legal = f"""
<div class="slide">
  {slide_header("16.A", "वैधानिक दस्तावेज", "कंपनी के कानूनी रजिस्ट्रेशन प्रमाणपत्र", "Official Government Certificates & Legal Licenses", "100% भारत सरकार के प्रत्यक्ष बिक्री नियम 2021 के अनुरूप पंजीकृत", "Fully Compliant with Direct Selling Rules 2021, GST, FSSAI & MSME")}
  
  <div class="slide-body" style="padding:18px 40px; justify-content:space-between;">
    <!-- Top Row: 3 Documents (GST, FSSAI, PAN) -->
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:16px;">
      <!-- Doc 1: GST -->
      <div class="card-white" style="border:2px solid #144732; border-radius:16px; padding:12px; display:flex; gap:12px; align-items:center;">
        <img src="{img_gst}" style="width:75px; height:95px; object-fit:contain; border-radius:6px; border:1px solid #cbd5e1; background:#fff; flex-shrink:0;" />
        <div style="flex:1; min-width:0;">
          <div style="font-size:11px; font-weight:800; color:#144732; text-transform:uppercase;">FORM GST REG-06</div>
          <div style="font-size:16px; font-weight:900; color:#0f172a; line-height:1.2;">GST रजिस्ट्रेशन</div>
          <div style="font-family:monospace; font-size:12.5px; font-weight:900; color:#0b2b1e; background:#f0fdf4; padding:3px 6px; border-radius:6px; margin:4px 0; border:1px solid #bbf7d0;">
            22AGCFS2395A1ZC
          </div>
          <div style="font-size:11px; color:#64748b; font-weight:600;">Government of India</div>
        </div>
      </div>

      <!-- Doc 2: FSSAI -->
      <div class="card-white" style="border:2px solid #d4a359; border-radius:16px; padding:12px; display:flex; gap:12px; align-items:center;">
        <img src="{img_fssai}" style="width:75px; height:95px; object-fit:contain; border-radius:6px; border:1px solid #cbd5e1; background:#fff; flex-shrink:0;" />
        <div style="flex:1; min-width:0;">
          <div style="font-size:11px; font-weight:800; color:#92580a; text-transform:uppercase;">FSS ACT, 2006</div>
          <div style="font-size:16px; font-weight:900; color:#0f172a; line-height:1.2;">FSSAI खाद्य सुरक्षा</div>
          <div style="font-family:monospace; font-size:13px; font-weight:900; color:#92580a; background:#fefce8; padding:3px 6px; border-radius:6px; margin:4px 0; border:1px solid #fef08a;">
            20526059000322
          </div>
          <div style="font-size:11px; color:#64748b; font-weight:600;">Govt. of Chhattisgarh</div>
        </div>
      </div>

      <!-- Doc 3: PAN -->
      <div class="card-white" style="border:2px solid #144732; border-radius:16px; padding:12px; display:flex; gap:12px; align-items:center;">
        <img src="{img_pan}" style="width:75px; height:95px; object-fit:contain; border-radius:6px; border:1px solid #cbd5e1; background:#fff; flex-shrink:0;" />
        <div style="flex:1; min-width:0;">
          <div style="font-size:11px; font-weight:800; color:#144732; text-transform:uppercase;">INCOME TAX DEPT</div>
          <div style="font-size:16px; font-weight:900; color:#0f172a; line-height:1.2;">आयकर पैन कार्ड</div>
          <div style="font-family:monospace; font-size:14px; font-weight:900; color:#0b2b1e; background:#f0fdf4; padding:3px 6px; border-radius:6px; margin:4px 0; border:1px solid #bbf7d0;">
            AGCFS2395A
          </div>
          <div style="font-size:11px; color:#64748b; font-weight:600;">Govt. of India</div>
        </div>
      </div>
    </div>

    <!-- Bottom Row: 2 Wider Cards (MSME + Partnership Deed) -->
    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:16px; margin-top:14px;">
      <!-- Doc 4: MSME Udyam -->
      <div class="card-white" style="border:2px solid #92580a; border-radius:16px; padding:12px 18px; display:flex; gap:16px; align-items:center;">
        <img src="{img_udyam}" style="width:80px; height:100px; object-fit:contain; border-radius:6px; border:1px solid #cbd5e1; background:#fff; flex-shrink:0;" />
        <div style="flex:1; min-width:0;">
          <div style="display:inline-block; font-size:10px; font-weight:800; color:#92580a; text-transform:uppercase; background:#fefce8; padding:2px 8px; border-radius:4px; margin-bottom:3px;">
            MINISTRY OF MSME, GOVT. OF INDIA
          </div>
          <div style="font-size:17px; font-weight:900; color:#0f172a;">उद्यम रजिस्ट्रेशन प्रमाणपत्र (Udyam)</div>
          <div style="font-family:monospace; font-size:13px; font-weight:900; color:#144732; background:#f8fafc; padding:3px 8px; border-radius:6px; margin:4px 0; border:1px solid #e2e8f0;">
            UDYAM-CG-09-0021023
          </div>
          <div style="font-size:11px; color:#475569; font-weight:700;">
            Enterprise Type: <strong>Micro</strong> • Manufacturing & Direct Services
          </div>
        </div>
      </div>

      <!-- Doc 5: Partnership Deed -->
      <div class="card-white" style="border:2px solid #144732; border-radius:16px; padding:12px 18px; display:flex; gap:16px; align-items:center;">
        <img src="{img_deed}" style="width:80px; height:100px; object-fit:contain; border-radius:6px; border:1px solid #cbd5e1; background:#fff; flex-shrink:0;" />
        <div style="flex:1; min-width:0;">
          <div style="display:inline-block; font-size:10px; font-weight:800; color:#144732; text-transform:uppercase; background:#f0fdf4; padding:2px 8px; border-radius:4px; margin-bottom:3px;">
            REGISTERED LEGAL FIRM
          </div>
          <div style="font-size:17px; font-weight:900; color:#0f172a;">पार्टनरशिप डीड (Partnership Deed)</div>
          <div style="font-family:monospace; font-size:13px; font-weight:900; color:#0b2b1e; background:#f8fafc; padding:3px 8px; border-radius:6px; margin:4px 0; border:1px solid #e2e8f0;">
            S G M MART ONLINE SERVICE
          </div>
          <div style="font-size:11px; color:#475569; font-weight:700;">
            पंजीकृत व्यावसायिक फर्म • छ.ग. शासन क्षेत्राधिकार • 100% पारदर्शी
          </div>
        </div>
      </div>
    </div>

    <!-- Assurance Banner -->
    <div style="margin-top:14px; background:#144732; border-radius:16px; padding:12px 24px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 8px 20px rgba(20,71,50,0.25);">
      <div style="font-size:17px; font-weight:900; color:#fef08a; display:flex; align-items:center; gap:8px;">
        <span>🛡️</span>
        <span>उपभोक्ता संरक्षण (प्रत्यक्ष बिक्री) नियम 2021 के तहत 100% अनुपालन एवं सरकारी टैक्स (TDS/GST) भुगतान</span>
      </div>
      <div style="font-size:14px; font-weight:700; color:#ffffff; font-family:monospace;">
        www.sadgurumart.com
      </div>
    </div>
  </div>

  {slide_footer(30)}
</div>
"""
slides_html.append(s30_legal)
'''

# Find Slide 30 in content and prepend legal_slide_code
slide_30_marker = '# SLIDE 30: TERMS & CONDITIONS'
if slide_30_marker in content:
    content = content.replace(slide_30_marker, legal_slide_code + '\n# SLIDE 31: TERMS & CONDITIONS')
    # Update s30 to s31 and page 30 to 31
    content = content.replace('slide_header("16"', 'slide_header("16.B"')
    content = content.replace('{slide_footer(30)}', '{slide_footer(31)}')
    content = content.replace('{slide_footer(31)}', '{slide_footer(32)}')
    content = content.replace('# SLIDE 31: THANK YOU', '# SLIDE 32: THANK YOU')

with open(script_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated build_4x3_presentation.py successfully!")
