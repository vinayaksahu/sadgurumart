import re

with open("build_4x3_presentation.py", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update TOTAL_PAGES to 34
text = re.sub(r"TOTAL_PAGES\s*=\s*\d+", "TOTAL_PAGES = 34", text)

# 2. Slice up to slides_html.append(s29)
marker = "slides_html.append(s29)"
idx = text.find(marker)
if idx == -1:
    print("Marker s29 not found!")
    exit(1)

base_part = text[:idx + len(marker)]

new_tail = '''

# ==============================================================================
# LEGAL DOC CARD HELPER
# ==============================================================================
def make_doc_card(badge_text, badge_color, title_hi, title_en, img_data, reg_label, reg_val, authority, val_color="#144732", border_color="#144732"):
    return f"""
    <div style="flex:1; background:#ffffff; border:2.5px solid {border_color}; border-radius:24px; padding:18px 22px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 8px 24px rgba(0,0,0,0.06); height:100%; box-sizing:border-box;">
      <!-- Card Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #f1f5f9; padding-bottom:10px;">
        <div>
          <div style="font-size:21px; font-weight:900; color:#0f172a; line-height:1.2;">{title_hi}</div>
          <div style="font-size:12.5px; font-weight:700; color:#64748b; margin-top:2px;">{title_en}</div>
        </div>
        <span style="font-size:11px; font-weight:800; font-family:monospace; background:{badge_color}18; color:{badge_color}; border:1.5px solid {badge_color}55; padding:4px 10px; border-radius:8px; text-transform:uppercase;">
          {badge_text}
        </span>
      </div>

      <!-- Large Certificate Image Preview (Fits comfortably with clear border) -->
      <div style="flex:1; margin:12px 0; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:16px; overflow:hidden; display:flex; align-items:center; justify-content:center; padding:10px; box-shadow:inset 0 2px 6px rgba(0,0,0,0.04);">
        <img src="{img_data}" style="max-height:380px; max-width:100%; width:auto; height:auto; object-fit:contain; border-radius:8px; box-shadow:0 4px 18px rgba(0,0,0,0.15);" />
      </div>

      <!-- Registration Value Box -->
      <div style="background:#faf8f4; border:1.5px solid #e2e8f0; border-radius:14px; padding:10px 16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:10.5px; font-weight:800; text-transform:uppercase; color:#64748b; letter-spacing:0.5px;">{reg_label}</div>
          <div style="font-family:monospace; font-size:19px; font-weight:900; color:{val_color}; margin-top:2px;">{reg_val}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#64748b;">सत्यापित प्राधिकरण</div>
          <div style="font-size:12.5px; font-weight:800; color:#0f172a; margin-top:2px;">{authority}</div>
        </div>
      </div>
    </div>
"""

# ==============================================================================
# SLIDE 30: LEGAL DOCS PART 1 (GST & FSSAI - MAX 2 DOCS)
# ==============================================================================
s30 = f"""
<div class="slide">
  {slide_header("16.A", "वैधानिक दस्तावेज (भाग-1)", "जीएसटी एवं खाद्य सुरक्षा प्रमाणपत्र", "GST & FSSAI Central Registration Certificates", "100% भारत सरकार एवं खाद्य संरक्षा मानक अधिनियम 2006 के तहत पंजीकृत", "Officially Registered Under Form GST REG-06 and Food Safety Act 2006")}
  
  <div class="slide-body" style="padding:16px 36px; display:flex; gap:22px; height:680px; box-sizing:border-box;">
    {make_doc_card("GST CERTIFIED", "#144732", "GST रजिस्ट्रेशन प्रमाणपत्र", "Form GST REG-06 • Government of India", img_gst, "GSTIN रजिस्ट्रेशन नंबर", "22AGCFS2395A1ZC", "भारत सरकार (Govt. of India)", "#144732", "#144732")}
    {make_doc_card("FSSAI FOOD SAFETY", "#92580a", "FSSAI खाद्य सुरक्षा प्रमाणपत्र", "Food Safety and Standards Act, 2006", img_fssai, "FSSAI पंजीकरण संख्या", "20526059000322", "छ.ग. खाद्य एवं औषधि प्रशासन", "#92580a", "#d4a359")}
  </div>

  {slide_footer(30)}
</div>
"""
slides_html.append(s30)

# ==============================================================================
# SLIDE 31: LEGAL DOCS PART 2 (PAN & MSME UDYAM - MAX 2 DOCS)
# ==============================================================================
s31 = f"""
<div class="slide">
  {slide_header("16.B", "वैधानिक दस्तावेज (भाग-2)", "कंपनी पैन कार्ड एवं उद्यम रजिस्ट्रेशन", "Income Tax PAN Card & MSME Udyam Certificate", "आयकर विभाग भारत सरकार एवं सूक्ष्म, लघु व मध्यम उद्यम मंत्रालय द्वारा प्रमाणित", "Certified by Income Tax Dept. and Ministry of MSME, Govt. of India")}
  
  <div class="slide-body" style="padding:16px 36px; display:flex; gap:22px; height:680px; box-sizing:border-box;">
    {make_doc_card("INCOME TAX DEPT", "#144732", "आयकर पैन कार्ड (e-PAN)", "Permanent Account Number • Govt. of India", img_pan, "पैन कार्ड नंबर (PAN)", "AGCFS2395A", "आयकर विभाग (Income Tax)", "#144732", "#144732")}
    {make_doc_card("MSME UDYAM", "#92580a", "एमएसएमई उद्यम रजिस्ट्रेशन", "Ministry of MSME, Government of India", img_udyam, "उद्यम रजिस्ट्रेशन संख्या", "UDYAM-CG-09-0021023", "सूक्ष्म एवं लघु उद्योग मंत्रालय", "#92580a", "#d4a359")}
  </div>

  {slide_footer(31)}
</div>
"""
slides_html.append(s31)

# ==============================================================================
# SLIDE 32: LEGAL DOCS PART 3 (PARTNERSHIP DEED & COMPLIANCE - MAX 2 ITEMS)
# ==============================================================================
s32 = f"""
<div class="slide">
  {slide_header("16.C", "वैधानिक दस्तावेज (भाग-3)", "पार्टनरशिप डीड एवं वैधानिक अनुपालन", "Registered Partnership Deed & Direct Selling 2021 Compliance", "कानूनी पंजीकृत व्यावसायिक इकाई एवं उपभोक्ता संरक्षण नियमों का 100% अनुपालन", "Legally Formed Partnership Firm & Consumer Protection Direct Selling Compliance")}
  
  <div class="slide-body" style="padding:16px 36px; display:flex; gap:22px; height:680px; box-sizing:border-box;">
    {make_doc_card("REGISTERED ENTITY", "#144732", "पार्टनरशिप डीड (Deed)", "Registered Legal Partnership Document", img_deed, "पंजीकृत व्यावसायिक नाम", "S G M MART ONLINE SERVICE", "छ.ग. राज्य क्षेत्राधिकार", "#144732", "#144732")}

    <!-- Compliance Checklist Card -->
    <div style="flex:1; background:#ffffff; border:2.5px solid #d4a359; border-radius:24px; padding:22px 24px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 8px 24px rgba(0,0,0,0.06); height:100%; box-sizing:border-box;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #f1f5f9; padding-bottom:12px; margin-bottom:16px;">
          <div>
            <div style="font-size:22px; font-weight:900; color:#144732;">100% लीगल डायरेक्ट सेलिंग</div>
            <div style="font-size:12px; font-weight:700; color:#64748b; margin-top:2px;">Direct Selling Rules 2021 Compliant</div>
          </div>
          <span style="font-size:11px; font-weight:800; font-family:monospace; background:#14473215; color:#144732; border:1.5px solid #14473255; padding:4px 10px; border-radius:8px;">
            100% VERIFIED
          </span>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="background:#f0fdf4; border-left:5px solid #144732; border-radius:10px; padding:11px 14px;">
            <div style="font-size:15px; font-weight:800; color:#144732;">✔ 100% उत्पाद-आधारित प्रत्यक्ष बिक्री मॉडल</div>
            <div style="font-size:12px; color:#475569; font-weight:600; margin-top:2px;">प्रत्येक खरीद पर वास्तविक गुणवत्तायुक्त प्रोडक्ट, नो मनी सर्कुलेशन।</div>
          </div>

          <div style="background:#fefce8; border-left:5px solid #92580a; border-radius:10px; padding:11px 14px;">
            <div style="font-size:15px; font-weight:800; color:#92580a;">✔ 5% TDS + 5% Admin Charge विधिवत कटौती</div>
            <div style="font-size:12px; color:#475569; font-weight:600; margin-top:2px;">पैन कार्ड आधारित सरकारी टैक्स भुगतान एवं पारदर्शी लेजर।</div>
          </div>

          <div style="background:#f0fdf4; border-left:5px solid #144732; border-radius:10px; padding:11px 14px;">
            <div style="font-size:15px; font-weight:800; color:#144732;">✔ बैंक खाता व पैन आधारित अनिवार्य KYC</div>
            <div style="font-size:12px; color:#475569; font-weight:600; margin-top:2px;">1 पैन पर अधिकतम 3 आईडी नियम, सुरक्षित डायरेक्ट बैंक ट्रांसफर।</div>
          </div>

          <div style="background:#fefce8; border-left:5px solid #92580a; border-radius:10px; padding:11px 14px;">
            <div style="font-size:15px; font-weight:800; color:#92580a;">✔ 24×7 उपभोक्ता संरक्षण एवं शिकायत निवारण</div>
            <div style="font-size:12px; color:#475569; font-weight:600; margin-top:2px;">ऑनलाइन टिकट सपोर्ट, समर्पित शिकायत अधिकारी एवं पारदर्शी नीतियां।</div>
          </div>
        </div>
      </div>

      <!-- Trust Stamp Box -->
      <div style="background:#0b2b1e; border-radius:14px; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; color:#ffffff;">
        <div>
          <div style="font-size:14px; font-weight:800; color:#fef08a;">सद्गुरु मार्ट: भरोसा • गुणवत्ता • आत्मनिर्भरता</div>
          <div style="font-size:11px; color:#cbd5e1; font-weight:600;">S G M MART ONLINE SERVICE • Bilaspur & Kabirdham, CG</div>
        </div>
        <div style="font-family:monospace; font-size:13px; font-weight:900; color:#a3e635;">
          sadgurumart.com
        </div>
      </div>
    </div>
  </div>

  {slide_footer(32)}
</div>
"""
slides_html.append(s32)

# ==============================================================================
# SLIDE 33: TERMS & CONDITIONS
# ==============================================================================
s33 = f"""
<div class="slide">
  {slide_header("17", "नियम एवं शर्तें", "नियम व शर्तें (Terms & Conditions)", "System Rules, Weekly Withdrawal & Deductions", "100% पारदर्शी, सुरक्षित और समय पर भुगतान व्यवस्था", "Transparent, Safe and On-Time Banking Settlements")}
  
  <div class="slide-body" style="justify-content:center;">
    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:22px;">
      <!-- Rule 1: Minimum Withdrawal -->
      <div class="card-white border-accent-green" style="padding:24px 28px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="font-size:44px;">🌴</div>
          <div>
            <div style="font-size:25px; font-weight:900; color:#144732; margin-bottom:4px;">
              मिनिमम विड्रॉल 100
            </div>
            <div style="font-size:16.5px; color:#4a5568; font-weight:700;">
              Minimum Withdrawal: मात्र ₹ 100/- होते ही बैंक विड्रॉल मान्य।
            </div>
          </div>
        </div>
        <div class="badge-green" style="font-size:20px; font-weight:900; padding:8px 16px;">
          ₹ 100
        </div>
      </div>

      <!-- Rule 2: Daily Closing Weekly Withdrawal -->
      <div class="card-white border-accent-gold" style="padding:24px 28px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="font-size:44px;">👉</div>
          <div>
            <div style="font-size:25px; font-weight:900; color:#92580a; margin-bottom:4px;">
              डेली क्लोजिंग विकली विड्रॉल
            </div>
            <div style="font-size:16.5px; color:#4a5568; font-weight:700;">
              Daily Closing (रात 12 बजे) & Weekly Bank Withdrawal
            </div>
          </div>
        </div>
        <div class="badge-gold" style="font-size:18px; font-weight:900; padding:8px 14px;">
          साप्ताहिक
        </div>
      </div>

      <!-- Rule 3: Admin & TDS -->
      <div class="card-white border-accent-green" style="padding:24px 28px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="font-size:44px;">👉</div>
          <div>
            <div style="font-size:25px; font-weight:900; color:#144732; margin-bottom:4px;">
              एडमिन चार्ज 5% TDS 5%
            </div>
            <div style="font-size:16.5px; color:#4a5568; font-weight:700;">
              Statutory Deductions: 5% Admin Fee + 5% Government TDS
            </div>
          </div>
        </div>
        <div class="badge-green" style="font-size:18px; font-weight:900; padding:8px 16px;">
          5% + 5%
        </div>
      </div>

      <!-- Rule 4: KYC & Bank Safety -->
      <div class="card-white border-accent-gold" style="padding:24px 28px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="font-size:44px;">🔒</div>
          <div>
            <div style="font-size:25px; font-weight:900; color:#92580a; margin-bottom:4px;">
              केवाईसी एवं सुरक्षा (KYC)
            </div>
            <div style="font-size:16.5px; color:#4a5568; font-weight:700;">
              बैंक खाता व पैन अनिवार्य • एक पैन कार्ड पर 3 मुख्य आईडी (Max 3 IDs)
            </div>
          </div>
        </div>
        <div class="badge-gold" style="font-size:18px; font-weight:900; padding:8px 14px;">
          100% सेफ
        </div>
      </div>
    </div>

    <!-- Assurance Banner -->
    <div style="margin-top:20px; background:#144732; border-radius:18px; padding:16px 30px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 10px 24px rgba(20,71,50,0.25);">
      <div style="font-size:20px; font-weight:900; color:#fef08a;">
        ✔ सद्गुरु मार्ट की वचनबद्धता: सुरक्षित सिस्टम • समय पर पेआउट • 100% लीगल प्रक्रिया
      </div>
      <div style="font-size:17px; font-weight:700; color:#ffffff;">
        🌐 www.sadgurumart.com
      </div>
    </div>
  </div>

  {slide_footer(33)}
</div>
"""
slides_html.append(s33)

# ==============================================================================
# SLIDE 34: THANK YOU & CONTACT DETAILS
# ==============================================================================
s34 = f"""
<div class="slide" style="flex-direction:row; background-color:#144732; padding:36px 44px;">
  <!-- Left Side Contact -->
  <div style="flex:1.2; display:flex; flex-direction:column; justify-content:space-between; padding-right:36px;">
    <div>
      <h1 style="font-size:46px; font-weight:900; color:#ffffff; line-height:1.2; margin-bottom:4px;">
        धन्यवाद!
      </h1>
      <div style="font-size:23px; font-weight:700; color:#d4a359; margin-bottom:16px;">
        Thank You for Exploring SGM MART
      </div>
      <div style="height:3px; background:#d4a359; width:100%; margin-bottom:24px;"></div>
      
      <div style="font-size:28px; font-weight:900; color:#ffffff; margin-bottom:10px;">
        SGM MART Online Service
      </div>
      <p style="font-size:19px; color:#e2e8f0; font-weight:600; margin-bottom:26px; line-height:1.5;">
        अधिक जानकारी और बिज़नेस पार्टनरशिप के लिए आज ही संपर्क करें:
      </p>

      <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:26px;">
        <!-- Sponsor Contact Box -->
        <div style="background:rgba(255,255,255,0.08); border-left:7px solid #a3e635; border-radius:16px; padding:18px 20px;">
          <div style="font-size:14px; font-weight:800; color:#a3e635; letter-spacing:1.5px; text-transform:uppercase;">
            JOIN TODAY | आज ही शुरुआत करें
          </div>
          <div style="font-size:26px; font-weight:900; color:#ffffff; margin-top:4px; line-height:1.3;">
            अपने रेफरल स्पॉन्सर से संपर्क करें
          </div>
          <div style="font-size:14px; color:#cbd5e1; font-weight:600; margin-top:3px;">
            Contact the person who shared this plan presentation with you
          </div>
        </div>

        <!-- Official Portal Box -->
        <div style="background:rgba(255,255,255,0.08); border-left:7px solid #22c55e; border-radius:16px; padding:18px 20px;">
          <div style="font-size:14px; font-weight:800; color:#22c55e; letter-spacing:1.5px; text-transform:uppercase;">
            OFFICIAL WEBSITE | आधिकारिक पोर्टल
          </div>
          <div style="font-size:28px; font-weight:900; color:#fef08a; letter-spacing:1px; margin-top:4px;">
            www.sadgurumart.com
          </div>
          <div style="font-size:14px; color:#cbd5e1; font-weight:600; margin-top:3px;">
            24×7 Member Portal & Online Shopping
          </div>
        </div>
      </div>

      <!-- Website Box -->
      <div style="font-size:20px; font-weight:800; color:#ffffff;">
        ✨ ग्राहक पहले • पारदर्शिता हमेशा • 100% लीगल डायरेक्ट सेलिंग
      </div>
    </div>

    <div style="font-size:14px; color:#94a3b8; font-weight:600; border-top:1px solid rgba(255,255,255,0.2); padding-top:14px;">
      SGM MART ONLINE SERVICE • ALL RIGHTS RESERVED
    </div>
  </div>

  <!-- Right Side Split Card -->
  <div style="flex:0.8; display:flex; justify-content:center; align-items:center;">
    <div style="background:#0b2b1e; border:3px solid #d4a359; border-radius:30px; padding:36px 30px; width:100%; max-width:400px; height:620px; display:flex; flex-direction:column; justify-content:space-between; align-items:center; text-align:center; box-shadow:0 20px 45px rgba(0,0,0,0.4);">
      
      <div>
        <img src="{img_logo}" style="width:115px; height:115px; background:#fff; border-radius:50%; padding:6px; margin-bottom:16px; box-shadow:0 10px 20px rgba(0,0,0,0.3);" />
        <div style="font-size:36px; font-weight:900; color:#fff; letter-spacing:1px;">SGM MART</div>
        <div style="font-size:18px; font-weight:800; color:#d4a359; letter-spacing:2.5px; margin-top:4px;">ONLINE SERVICE</div>
      </div>

      <div style="background:rgba(212,163,89,0.15); border:1.5px solid #d4a359; border-radius:20px; padding:20px 16px; width:100%;">
        <div style="font-size:24px; font-weight:900; color:#fef08a; line-height:1.4;">
          “बेरोजगारी और रोग मुक्त हो भारत हमारा”
        </div>
        <div style="font-size:15px; color:#e2e8f0; font-weight:600; margin-top:6px;">
          Healthy, Prosperous & Self-Reliant India
        </div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.2); width:100%; padding-top:14px;">
        <div style="font-size:18px; font-weight:800; color:#ffffff;">
          ग्राहक पहले • पारदर्शिता हमेशा
        </div>
        <div style="font-size:14px; color:#cbd5e1; font-weight:600; margin-top:3px;">
          Customer First • Always Transparent
        </div>
      </div>

    </div>
  </div>
</div>
"""
slides_html.append(s34)

full_html = f"""<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>SGM Mart MLM Business Plan - 4:3 Executive Presentation</title>
  <style>
{css_styles}
  </style>
</head>
<body>
{''.join(slides_html)}
</body>
</html>
"""

html_out = "Sadguru_Mart_MLM_Plan_4x3.html"
with open(html_out, "w", encoding="utf-8") as f:
    f.write(full_html)
print(f"Generated {html_out} with {len(slides_html)} slides.")
'''

with open("build_4x3_presentation.py", "w", encoding="utf-8") as f:
    f.write(base_part + new_tail)

print("build_4x3_presentation.py updated successfully with 34 slides!")
