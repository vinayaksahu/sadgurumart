import os, base64

def get_base64_img(filepath):
    if not os.path.exists(filepath):
        print(f"WARNING: File not found {filepath}")
        return ""
    ext = os.path.splitext(filepath)[1].lower().replace(".", "")
    if ext == "jpg":
        ext = "jpeg"
    with open(filepath, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/{ext};base64,{data}"

img_gst = get_base64_img("public/legal/gst_thumb.png")
img_fssai = get_base64_img("public/legal/fssai_thumb.png")
img_pan = get_base64_img("public/legal/pan_thumb.png")
img_udyam = get_base64_img("public/legal/udyam_thumb.png")
img_deed = get_base64_img("public/legal/deed_thumb.png")

TOTAL_PAGES = 34

def slide_header(cat_num, cat_title, main_hi, main_en, sub_hi, sub_en):
    return f"""
  <div class="slide-header">
    <div class="header-cat">{cat_num} | {cat_title}</div>
    <div class="header-title">{main_hi} <span style="font-weight:400; opacity:0.85;">| {main_en}</span></div>
  </div>
  <div class="slide-subheader">
    {sub_hi} <span style="font-weight:500; opacity:0.85;">| {sub_en}</span>
  </div>
"""

def slide_footer(page_num):
    return f"""
  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.com</div>
      <div class="footer-right">{page_num:02d} / {TOTAL_PAGES:02d}</div>
    </div>
  </div>
"""

def make_doc_card(badge_text, badge_color, title_hi, title_en, img_data, reg_label, reg_val, authority, val_color="#144732", border_color="#144732"):
    return f"""
    <div style="flex:1; background:#ffffff; border:2.5px solid {border_color}; border-radius:22px; padding:18px 20px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 8px 24px rgba(0,0,0,0.06); height:100%; box-sizing:border-box;">
      <!-- Card Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #f1f5f9; padding-bottom:10px;">
        <div>
          <div style="font-size:20px; font-weight:900; color:#0f172a; line-height:1.2;">{title_hi}</div>
          <div style="font-size:12px; font-weight:700; color:#64748b; margin-top:2px;">{title_en}</div>
        </div>
        <span style="font-size:11px; font-weight:800; font-family:monospace; background:{badge_color}18; color:{badge_color}; border:1.5px solid {badge_color}55; padding:4px 10px; border-radius:8px; text-transform:uppercase;">
          {badge_text}
        </span>
      </div>

      <!-- Large Certificate Image Preview -->
      <div style="flex:1; margin:12px 0; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:14px; overflow:hidden; display:flex; align-items:center; justify-content:center; padding:8px; box-shadow:inset 0 2px 6px rgba(0,0,0,0.04);">
        <img src="{img_data}" style="max-height:390px; max-width:100%; width:auto; height:auto; object-fit:contain; border-radius:6px; box-shadow:0 4px 16px rgba(0,0,0,0.15);" />
      </div>

      <!-- Registration Value Box -->
      <div style="background:#faf8f4; border:1.5px solid #e2e8f0; border-radius:14px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:10.5px; font-weight:800; text-transform:uppercase; color:#64748b; letter-spacing:0.5px;">{reg_label}</div>
          <div style="font-family:monospace; font-size:19px; font-weight:900; color:{val_color}; margin-top:2px;">{reg_val}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#64748b;">सत्यापित प्राधिकरण</div>
          <div style="font-size:12px; font-weight:800; color:#0f172a; margin-top:2px;">{authority}</div>
        </div>
      </div>
    </div>
"""

# Slide 30: GST & FSSAI
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

# Slide 31: PAN & MSME Udyam
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

# Slide 32: Partnership Deed & 100% Compliance Checklist
s32 = f"""
<div class="slide">
  {slide_header("16.C", "वैधानिक दस्तावेज (भाग-3)", "पार्टनरशिप डीड एवं वैधानिक अनुपालन", "Registered Partnership Deed & Direct Selling 2021 Compliance", "कानूनी पंजीकृत व्यावसायिक इकाई एवं उपभोक्ता संरक्षण नियमों का 100% अनुपालन", "Legally Formed Partnership Firm & Consumer Protection Direct Selling Compliance")}
  
  <div class="slide-body" style="padding:16px 36px; display:flex; gap:22px; height:680px; box-sizing:border-box;">
    {make_doc_card("REGISTERED ENTITY", "#144732", "पार्टनरशिप डीड (Deed)", "Registered Legal Partnership Document", img_deed, "पंजीकृत व्यावसायिक नाम", "S G M MART ONLINE SERVICE", "छ.ग. राज्य क्षेत्राधिकार", "#144732", "#144732")}

    <!-- Compliance Checklist Card -->
    <div style="flex:1; background:#ffffff; border:2.5px solid #d4a359; border-radius:22px; padding:22px 24px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 8px 24px rgba(0,0,0,0.06); height:100%; box-sizing:border-box;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #f1f5f9; padding-bottom:12px; margin-bottom:14px;">
          <div>
            <div style="font-size:22px; font-weight:900; color:#144732;">100% लीगल डायरेक्ट सेलिंग</div>
            <div style="font-size:12px; font-weight:700; color:#64748b; margin-top:2px;">Direct Selling Rules 2021 Compliant</div>
          </div>
          <span style="font-size:11px; font-weight:800; font-family:monospace; background:#14473215; color:#144732; border:1.5px solid #14473255; padding:4px 10px; border-radius:8px;">
            100% VERIFIED
          </span>
        </div>

        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="background:#f0fdf4; border-left:5px solid #144732; border-radius:10px; padding:10px 14px;">
            <div style="font-size:15px; font-weight:800; color:#144732;">✔ 100% उत्पाद-आधारित प्रत्यक्ष बिक्री मॉडल</div>
            <div style="font-size:12px; color:#475569; font-weight:600; margin-top:2px;">प्रत्येक खरीद पर वास्तविक गुणवत्तायुक्त प्रोडक्ट, नो मनी सर्कुलेशन।</div>
          </div>

          <div style="background:#fefce8; border-left:5px solid #92580a; border-radius:10px; padding:10px 14px;">
            <div style="font-size:15px; font-weight:800; color:#92580a;">✔ 5% TDS + 5% Admin Charge विधिवत कटौती</div>
            <div style="font-size:12px; color:#475569; font-weight:600; margin-top:2px;">पैन कार्ड आधारित सरकारी टैक्स भुगतान एवं पारदर्शी लेजर।</div>
          </div>

          <div style="background:#f0fdf4; border-left:5px solid #144732; border-radius:10px; padding:10px 14px;">
            <div style="font-size:15px; font-weight:800; color:#144732;">✔ बैंक खाता व पैन आधारित अनिवार्य KYC</div>
            <div style="font-size:12px; color:#475569; font-weight:600; margin-top:2px;">1 पैन पर अधिकतम 3 आईडी नियम, सुरक्षित डायरेक्ट बैंक ट्रांसफर।</div>
          </div>

          <div style="background:#fefce8; border-left:5px solid #92580a; border-radius:10px; padding:10px 14px;">
            <div style="font-size:15px; font-weight:800; color:#92580a;">✔ 24×7 उपभोक्ता संरक्षण एवं शिकायत निवारण</div>
            <div style="font-size:12px; color:#475569; font-weight:600; margin-top:2px;">ऑनलाइन टिकट सपोर्ट, समर्पित शिकायत अधिकारी एवं पारदर्शी नीतियां।</div>
          </div>
        </div>
      </div>

      <!-- Trust Stamp Box -->
      <div style="background:#0b2b1e; border-radius:14px; padding:12px 18px; display:flex; justify-content:space-between; align-items:center; color:#ffffff;">
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

print("Generated test code successfully!")
