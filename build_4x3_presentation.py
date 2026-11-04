import os
import base64
import subprocess
import pymupdf

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

pdir = r"c:\Users\user\Desktop\SGM Mart\product"

img_0 = get_base64_img(os.path.join(pdir, "0.png"))
img_1 = get_base64_img(os.path.join(pdir, "1.png"))
img_2 = get_base64_img(os.path.join(pdir, "2.png"))
img_3 = get_base64_img(os.path.join(pdir, "3.png"))
img_4 = get_base64_img(os.path.join(pdir, "4.png"))
img_5 = get_base64_img(os.path.join(pdir, "5..png"))
img_6 = get_base64_img(os.path.join(pdir, "6.png"))
img_7 = get_base64_img(os.path.join(pdir, "7.png"))
img_8 = get_base64_img(os.path.join(pdir, "8.png"))
img_9 = get_base64_img(os.path.join(pdir, "9.png"))
img_logo = get_base64_img("sgm_logo.png")

# Legal Documents Base64 Thumbnails
img_gst = get_base64_img("public/legal/gst_thumb.png")
img_fssai = get_base64_img("public/legal/fssai_thumb.png")
img_pan = get_base64_img("public/legal/pan_thumb.png")
img_udyam = get_base64_img("public/legal/udyam_thumb.png")
img_deed = get_base64_img("public/legal/deed_thumb.png")

TOTAL_PAGES = 32

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

css_styles = """
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Outfit', 'Noto Sans Devanagari', -apple-system, sans-serif;
  background-color: #444444;
  color: #2d3748;
  -webkit-font-smoothing: antialiased;
}

@page {
  size: 12in 9in;
  margin: 0;
}

.slide {
  width: 1152px;
  height: 864px;
  position: relative;
  background-color: #f6f4ed;
  page-break-after: always;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.slide-header {
  background-color: #144732;
  padding: 14px 40px 10px 40px;
  color: #ffffff;
  flex-shrink: 0;
}
.header-cat {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #d4a359;
  text-transform: uppercase;
  margin-bottom: 2px;
}
.header-title {
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -0.3px;
  line-height: 1.25;
}

.slide-subheader {
  background-color: #eae5d8;
  padding: 8px 40px;
  font-size: 15.5px;
  font-weight: 700;
  color: #4a5568;
  border-bottom: 1.5px solid #d8d0bf;
  flex-shrink: 0;
}

.slide-body {
  flex: 1;
  padding: 20px 40px 12px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.slide-footer {
  padding: 0 40px 10px 40px;
  background-color: #f6f4ed;
  flex-shrink: 0;
}
.footer-line {
  height: 2.5px;
  background-color: #d4a359;
  width: 100%;
  margin-bottom: 6px;
}
.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13.5px;
  color: #718096;
  font-weight: 600;
}
.footer-right {
  font-weight: 800;
  color: #144732;
  font-size: 14.5px;
}

/* Card Components */
.card-white {
  background: #ffffff;
  border-radius: 26px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.06);
  border: 1px solid #e4dfd3;
  padding: 24px 28px;
  box-sizing: border-box;
}

.border-accent-green {
  border-left: 9px solid #144732 !important;
}

.border-accent-gold {
  border-left: 9px solid #d4a359 !important;
}

.badge-gold {
  background: #fdf5e6;
  border: 1.5px solid #d4a359;
  color: #92580a;
  font-weight: 800;
  border-radius: 12px;
  padding: 6px 14px;
  display: inline-block;
  font-size: 16px;
}

.badge-green {
  background: #eaf5ed;
  border: 1.5px solid #144732;
  color: #144732;
  font-weight: 800;
  border-radius: 12px;
  padding: 6px 14px;
  display: inline-block;
  font-size: 16px;
}

/* Bold Tables */
.bold-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(0,0,0,0.06);
  border: 1px solid #dcd7ca;
}
.bold-table th {
  background-color: #144732;
  color: #ffffff;
  padding: 13px 16px;
  font-weight: 800;
  font-size: 17px;
  text-align: center;
  border-right: 1px solid rgba(255,255,255,0.15);
}
.bold-table th:last-child {
  border-right: none;
}
.bold-table td {
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e7ede9;
  border-right: 1px solid #e7ede9;
  text-align: center;
  font-weight: 700;
  font-size: 17.5px;
  color: #2d3748;
}
.bold-table td:last-child {
  border-right: none;
}
.bold-table tr:nth-child(even) td {
  background-color: #f7faf8;
}
.bold-table tr:last-child td {
  border-bottom: none;
}
.bold-table tr.crown-row td {
  background-color: #144732 !important;
  color: #ffffff !important;
}

.num-badge {
  display: inline-block;
  background: #144732;
  color: #ffffff;
  font-weight: 800;
  border-radius: 8px;
  padding: 3px 10px;
  font-size: 15px;
}
"""

slides_html = []

# ==============================================================================
# SLIDE 1: MASTER BRAND SHOWCASE (product\0.png)
# ==============================================================================
s1 = f"""
<div class="slide" style="padding:0; background:#0e3324; display:flex; flex-direction:column; justify-content:center; align-items:center;">
  <div style="width:100%; height:100%; position:relative; display:flex; justify-content:center; align-items:center; background:#0b2b1e;">
    <img src="{img_0}" style="width:100%; height:100%; object-fit:contain; display:block;" />
  </div>
</div>
"""
slides_html.append(s1)

# ==============================================================================
# SLIDE 2: TITLE & EXECUTIVE COVER SLIDE
# ==============================================================================
s2 = f"""
<div class="slide" style="flex-direction:row; background-color:#144732; padding:36px 44px;">
  <!-- Left Side -->
  <div style="flex:1.2; display:flex; flex-direction:column; justify-content:space-between; padding-right:36px;">
    <div>
      <div style="display:flex; align-items:center; gap:16px;">
        <img src="{img_logo}" style="width:68px; height:68px; background:#fff; border-radius:50%; padding:4px;" />
        <div>
          <div style="font-size:34px; font-weight:900; color:#fff; letter-spacing:0.5px;">SGM MART</div>
          <div style="font-size:15px; font-weight:700; color:#d4a359; letter-spacing:2px;">ONLINE SERVICE PVT. LTD.</div>
        </div>
      </div>
      <div style="height:3px; background:#d4a359; width:100%; margin:20px 0;"></div>
      
      <div style="font-size:15px; font-weight:800; color:#d4a359; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px;">
        BUSINESS OVERVIEW & MLM PLAN | व्यापार योजना
      </div>
      
      <h1 style="font-size:40px; font-weight:900; color:#ffffff; line-height:1.2; margin-bottom:10px;">
        उत्पादों के साथ व्यापार का अवसर
      </h1>
      <div style="font-size:24px; font-weight:700; color:#a3e635; margin-bottom:18px;">
        Unlimited Growth with Quality Products
      </div>
      
      <p style="font-size:18.5px; color:#e2e8f0; line-height:1.5; margin-bottom:20px; font-weight:500;">
        मार्केट रेट पर ऑल मार्केट के ब्रांडेड उत्पाद • 0% इन्वेस्टमेंट रिस्क-फ्री महा-प्लान • घर बैठे असीमित आमदनी
      </p>

      <!-- Slogan Box -->
      <div style="background:rgba(212, 163, 89, 0.15); border-left:8px solid #d4a359; border-radius:16px; padding:16px 20px; margin-bottom:20px;">
        <div style="font-size:24px; font-weight:900; color:#fef08a;">
          “बेरोजगारी और रोग मुक्त हो भारत हमारा”
        </div>
        <div style="font-size:15px; color:#e2e8f0; font-weight:600; margin-top:4px;">
          Disease-Free & Unemployment-Free India Mission
        </div>
      </div>

      <!-- Quick Badges -->
      <div style="display:flex; flex-wrap:wrap; gap:10px;">
        <span style="background:rgba(255,255,255,0.12); color:#fff; font-size:15px; font-weight:700; padding:6px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.25);">
          🛍️ मार्केट रेट प्रोडक्ट्स
        </span>
        <span style="background:rgba(255,255,255,0.12); color:#fff; font-size:15px; font-weight:700; padding:6px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.25);">
          💎 0% इन्वेस्टमेंट
        </span>
        <span style="background:rgba(255,255,255,0.12); color:#fff; font-size:15px; font-weight:700; padding:6px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.25);">
          ⚡ वर्किंग + ऑटोपूल
        </span>
        <span style="background:rgba(255,255,255,0.12); color:#fff; font-size:15px; font-weight:700; padding:6px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.25);">
          💰 डेली क्लोजिंग / वीकली पेआउट
        </span>
      </div>
    </div>

    <!-- Contact line bottom -->
    <div style="border-top:1px solid rgba(255,255,255,0.2); padding-top:14px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:17px; color:#fef08a; font-weight:800;">
        🌐 www.sadgurumart.com
      </div>
      <div style="font-size:16px; color:#ffffff; font-weight:700;">
        ✨ बेरोजगारी और रोग मुक्त हो भारत हमारा
      </div>
    </div>
  </div>

  <!-- Right Side Product Card -->
  <div style="flex:0.8; display:flex; justify-content:center; align-items:center;">
    <div style="background:#ffffff; border-radius:28px; padding:12px; box-shadow:0 18px 40px rgba(0,0,0,0.3); border:4px solid #d4a359; max-width:400px; width:100%;">
      <img src="{img_1}" style="width:100%; height:620px; object-fit:contain; border-radius:20px; display:block;" />
    </div>
  </div>
</div>
"""
slides_html.append(s2)

# ==============================================================================
# SLIDE 3: COMPANY OVERVIEW & STRATEGIC FOCUS
# ==============================================================================
s3 = f"""
<div class="slide">
  {slide_header("01", "कंपनी परिचय", "SGM MART का परिचय", "Company Overview & Mission", "उत्पाद-केंद्रित व्यापार और ग्राहक भरोसे पर आधारित राष्ट्रीय पहल", "Product-Centric Business & Customer-First Foundation")}
  
  <div class="slide-body" style="gap:20px; justify-content:center;">
    <div class="card-white border-accent-green" style="padding:26px 34px;">
      <h2 style="font-size:30px; font-weight:900; color:#144732; margin-bottom:12px;">SGM MART Online Service</h2>
      <p style="font-size:20px; line-height:1.6; color:#2d3748; font-weight:600; margin-bottom:12px;">
        SGM MART का उद्देश्य दैनिक उपयोग, किचन, हेल्थकेयर, पर्सनल केयर, होम केयर और अन्य श्रेणियों के उपयोगी उत्पादों को ग्राहकों तक स्पष्ट कीमत और सही जानकारी के साथ पहुँचाना है।
      </p>
      <p style="font-size:17.5px; line-height:1.5; color:#555; font-weight:500;">
        Our mission is to deliver branded, daily-use, and healthcare products directly to consumers at honest market prices with a 100% risk-free home-based earning platform.
      </p>
    </div>

    <div class="card-white border-accent-gold" style="padding:26px 34px;">
      <h3 style="font-size:24px; font-weight:800; color:#92580a; margin-bottom:14px;">
        हमारा मुख्य फोकस | Strategic Focus Areas
      </h3>
      <div style="display:flex; flex-direction:column; gap:12px; font-size:18.5px; font-weight:700; color:#2d3748;">
        <div>✅ <strong>उत्पाद की गुणवत्ता व सही जानकारी:</strong> Genuine quality, transparent pricing, and comprehensive product information.</div>
        <div>✅ <strong>0% इन्वेस्टमेंट रिस्क:</strong> Zero capital risk — start immediately with daily household needs.</div>
        <div>✅ <strong>वर्किंग एवं नॉन-वर्किंग प्लान:</strong> Dual-earning ecosystem for active leaders and consumers alike.</div>
        <div>✅ <strong>पारदर्शी बिलिंग और नियमित पेआउट:</strong> Daily closing and weekly direct bank withdrawals.</div>
      </div>
    </div>
  </div>

  {slide_footer(3)}
</div>
"""
slides_html.append(s3)

# ==============================================================================
# SLIDE 4: VISION & MISSION
# ==============================================================================
s4 = f"""
<div class="slide">
  {slide_header("02", "दिशा एवं लक्ष्य", "हमारा विज़न और मिशन", "Our Vision & Mission", "दीर्घकालीन भरोसा - गुणवत्ता - जिम्मेदार व्यापार", "Long-Term Trust, Quality & Responsible Direct Selling")}
  
  <div class="slide-body" style="gap:22px; justify-content:center;">
    <div style="display:flex; gap:26px;">
      <!-- Vision Card -->
      <div class="card-white border-accent-green" style="flex:1; padding:28px 30px; display:flex; flex-direction:column; justify-content:space-between; height:470px;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <h2 style="font-size:30px; font-weight:900; color:#144732;">VISION | विज़न</h2>
            <span class="badge-green" style="font-size:16px;">भविष्य दृष्टि</span>
          </div>
          <div style="font-size:21px; font-weight:800; color:#144732; margin-bottom:16px; line-height:1.4;">
            भारत के अधिक से अधिक परिवारों तक उपयोगी उत्पाद उचित मूल्य और विश्वसनीय सेवा के साथ पहुँचाना।
          </div>
          <div style="display:flex; flex-direction:column; gap:12px; font-size:18px; color:#374151; font-weight:600; line-height:1.45;">
            <div>• स्थानीय स्तर पर उत्पाद-आधारित स्वरोजगार को बढ़ावा देना।</div>
            <div>• To empower Indian youth and homemakers with dignified, home-based self-employment.</div>
            <div>• प्रत्येक घर में शुद्ध और प्राकृतिक जीवनशैली का प्रचार-प्रसार करना।</div>
          </div>
        </div>
        <div style="background:#eaf5ed; padding:12px 16px; border-radius:14px; font-size:16.5px; font-weight:800; color:#144732;">
          🌱 दीर्घकालीन संकल्प: स्वस्थ समाज, समृद्ध परिवार और सशक्त आत्मनिर्भर भारत।
        </div>
      </div>

      <!-- Mission Card -->
      <div class="card-white border-accent-gold" style="flex:1; padding:28px 30px; display:flex; flex-direction:column; justify-content:space-between; height:470px;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <h2 style="font-size:30px; font-weight:900; color:#92580a;">MISSION | मिशन</h2>
            <span class="badge-gold" style="font-size:16px;">कार्यवाई लक्ष्य</span>
          </div>
          <div style="font-size:21px; font-weight:800; color:#92580a; margin-bottom:16px; line-height:1.4;">
            ग्राहकों को स्पष्ट product information, सही कीमत और बेहतर सहायता प्रदान करना।
          </div>
          <div style="display:flex; flex-direction:column; gap:12px; font-size:18px; color:#374151; font-weight:600; line-height:1.45;">
            <div>• हर बिक्री का पक्का रिकॉर्ड रखना, पारदर्शी प्रोत्साहन प्रदान करना।</div>
            <div>• To build an honest direct-selling ecosystem driven by genuine consumer demand.</div>
            <div>• 0% इन्वेस्टमेंट के साथ हर नागरिक को असीमित आय अर्जित करने का अवसर देना।</div>
          </div>
        </div>
        <div style="background:#fdf5e6; padding:12px 16px; border-radius:14px; font-size:16.5px; font-weight:800; color:#92580a;">
          ⚖️ हमारा नियम: पहले ग्राहक, फिर उत्पाद, और हमेशा पारदर्शिता।
        </div>
      </div>
    </div>

    <!-- Bottom Mission Banner -->
    <div style="background:#144732; color:#ffffff; border-radius:18px; padding:14px 28px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:21px; font-weight:900; color:#fef08a;">
        “S G M Mart का एक ही नारा — बेरोजगारी और रोग मुक्त हो भारत हमारा”
      </div>
      <div style="font-size:16px; font-weight:700; color:#e2e8f0;">
        Healthy, Wealthy & Self-Reliant India
      </div>
    </div>
  </div>

  {slide_footer(4)}
</div>
"""
slides_html.append(s4)

# ==============================================================================
# SLIDE 5: 9 PRODUCT CATEGORIES OVERVIEW
# ==============================================================================
cat_data = [
    ("01", "हेल्थ केयर", "Health Care", "तुलसी ड्रॉप्स, बेरी जूस, सप्लीमेंट्स"),
    ("02", "होम केयर", "Home Care", "प्रीमियम अगरबत्ती, धूप, होम एसेंशियल्स"),
    ("03", "किचन केयर", "Kitchen Care", "शाही इलायची चाय, अमृततुल्य चाय व रसोई उत्पाद"),
    ("04", "पर्सनल केयर", "Personal Care", "दंत बुट्टी हर्बल पेस्ट, 21 हर्ब्स हेयर ऑयल"),
    ("05", "ब्यूटी केयर", "Beauty Care", "केसर फेस वॉश, अनियन शैम्पू, 7-इन-1 फेस क्रीम"),
    ("06", "कपड़े", "Apparel & Garments", "दैनिक व फैशनेबल परिधान संग्रह"),
    ("07", "ज्वेलरी", "Fashion Jewellery", "आधुनिक व पारंपरिक डिजाइनर आभूषण"),
    ("08", "एग्रीकल्चर", "Agriculture Care", "जैविक खाद, पौध पोषण एवं फसल सुरक्षा उत्पाद"),
    ("09", "इलेक्ट्रॉनिक्स", "Smart Electronics", "स्मार्ट गैजेट्स, मोबाइल एक्सेसरीज व अप्लायंसेज")
]

cat_boxes_html = ""
for num, hi, en, desc in cat_data:
    cat_boxes_html += f"""
    <div class="card-white" style="padding:16px 20px; border-radius:18px; display:flex; align-items:center; gap:16px; border-left:7px solid #144732;">
      <div class="num-badge" style="font-size:18px; padding:6px 12px; border-radius:10px;">{num}</div>
      <div style="flex:1;">
        <div style="font-size:20px; font-weight:900; color:#144732;">{hi} <span style="font-size:15px; font-weight:600; color:#4a5568;">| {en}</span></div>
        <div style="font-size:14.5px; font-weight:600; color:#718096; margin-top:2px;">{desc}</div>
      </div>
    </div>
"""

s5 = f"""
<div class="slide">
  {slide_header("03", "उत्पाद श्रेणियाँ", "एक ही प्लेटफ़ॉर्म पर 9 प्रमुख कैटेगरी", "9 Comprehensive Product Segments", "मार्केट रेट में ऑल मार्केट के ब्रांडेड प्रोडक्ट्स", "Branded Products for Daily Life at Market Competitive Prices")}
  
  <div class="slide-body" style="justify-content:center;">
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:18px;">
      {cat_boxes_html}
    </div>
    
    <div style="margin-top:20px; text-align:center; font-size:16.5px; font-weight:700; color:#4a5568;">
      💡 <em>नोट: सभी श्रेणियों के विस्तृत SKU, पैक साइज और कीमतें आधिकारिक पोर्टल <span style="color:#144732; font-weight:900;">www.sadgurumart.com</span> पर उपलब्ध हैं।</em>
    </div>
  </div>

  {slide_footer(5)}
</div>
"""
slides_html.append(s5)

# ==============================================================================
# HELPER FUNCTION FOR SINGLE PRODUCT SLIDES (1 PAGE = 1 PRODUCT)
# ==============================================================================
def make_single_product_slide(page_num, prod_num, prod_hi, prod_en, cat_name, img_src, pack_options, details_list, badge_text, highlight_box):
    packs_html = ""
    for p_title, p_price, p_pv in pack_options:
        packs_html += f"""
        <div style="background:#f7faf8; border:1.5px solid #b7e1cd; border-radius:14px; padding:10px 18px; flex:1; text-align:center;">
          <div style="font-size:15.5px; font-weight:700; color:#555;">{p_title}</div>
          <div style="font-size:26px; font-weight:900; color:#144732; margin-top:2px;">{p_price} <span style="font-size:16px; color:#d4a359; font-weight:800;">({p_pv})</span></div>
        </div>
"""
    
    bullets_html = ""
    for b in details_list:
        bullets_html += f"<div style='margin-bottom:8px;'>• {b}</div>"

    return f"""
<div class="slide">
  {slide_header(f"04.{prod_num}", cat_name, f"{prod_num}. {prod_hi}", prod_en, "100% शुद्ध एवं प्रमाणित उत्पाद | 100% Pure & Certified Quality", "Authentic Direct Selling Product From SGM MART")}
  
  <div class="slide-body" style="flex-direction:row; gap:36px; align-items:center; justify-content:center;">
    <!-- Left: Big Product Image -->
    <div style="flex:0.85; display:flex; justify-content:center;">
      <div class="card-white" style="padding:16px; border-radius:28px; width:100%; max-width:420px; display:flex; justify-content:center; align-items:center; background:#ffffff;">
        <img src="{img_src}" style="max-width:100%; height:540px; object-fit:contain; border-radius:20px; display:block;" />
      </div>
    </div>

    <!-- Right: Single Column Product Details -->
    <div style="flex:1.15; display:flex; flex-direction:column; gap:18px;">
      <div class="card-white border-accent-green" style="padding:26px 30px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <div style="font-size:14px; font-weight:800; color:#d4a359; letter-spacing:1px; text-transform:uppercase;">{cat_name}</div>
            <h2 style="font-size:32px; font-weight:900; color:#144732; line-height:1.2;">{prod_hi}</h2>
            <div style="font-size:18px; font-weight:700; color:#4a5568;">{prod_en}</div>
          </div>
          <span class="badge-green" style="font-size:16px;">{badge_text}</span>
        </div>

        <!-- Pricing & PV Row -->
        <div style="display:flex; gap:14px; margin:14px 0;">
          {packs_html}
        </div>

        <!-- Details & Benefits -->
        <div style="font-size:17.5px; line-height:1.55; color:#2d3748; font-weight:600; margin-top:14px;">
          {bullets_html}
        </div>
      </div>

      <!-- Highlight Banner -->
      <div style="background:#144732; border-radius:18px; padding:14px 24px; display:flex; justify-content:space-between; align-items:center; color:#ffffff;">
        <div style="font-size:18px; font-weight:900; color:#fef08a;">
          {highlight_box}
        </div>
        <div class="badge-gold" style="font-size:15px; padding:4px 12px;">100% ओरिजिनल</div>
      </div>
    </div>
  </div>

  {slide_footer(page_num)}
</div>
"""

# ==============================================================================
# SLIDES 6 TO 14: 9 INDIVIDUAL PRODUCT SLIDES (1 PAGE PER PRODUCT)
# ==============================================================================

# Product 1: Shahi Elaichi Chai (product\1.png)
s6 = make_single_product_slide(
    page_num=6,
    prod_num="1",
    prod_hi="शाही इलायची चाय",
    prod_en="Shahi Elaichi Chai - Premium Assam Tea",
    cat_name="किचन केयर | KITCHEN CARE",
    img_src=img_1,
    pack_options=[
        ("500 ग्राम पैक", "₹ 349 /-", "150 PV"),
        ("1 किलोग्राम पैक", "₹ 649 /-", "300 PV")
    ],
    details_list=[
        "<strong>सामग्री:</strong> असम के चुनिंदा चाय बागानों की कड़क दानेदार चाय और शुद्ध असली हरी इलायची की मनमोहक खुशबू।",
        "<strong>विशेषता:</strong> हर घूंट में ताजगी, शाही स्वाद और स्फूर्ति का बेमिसाल अहसास।",
        "<strong>उपयोगिता:</strong> हर भारतीय घर की सुबह की पहली पसंद - मेहमान नवाजी और दैनिक ऊर्जा हेतु श्रेष्ठ।"
    ],
    badge_text="बेस्ट सेलर",
    highlight_box="☕ स्वाद, ताजगी और इलायची की शाही खुशबू का संगम"
)
slides_html.append(s6)

# Product 2: Amruttulya Chai (product\2.png)
s7 = make_single_product_slide(
    page_num=7,
    prod_num="2",
    prod_hi="अमृत तुल्य चाय",
    prod_en="Amruttulya Special Herbal Tea",
    cat_name="किचन केयर | KITCHEN CARE",
    img_src=img_2,
    pack_options=[
        ("500 ग्राम पैक", "₹ 349 /-", "150 PV"),
        ("1 किलोग्राम पैक", "₹ 699 /-", "300 PV")
    ],
    details_list=[
        "<strong>सामग्री:</strong> पारंपरिक भारतीय मसालों, दालचीनी, सोंठ, लौंग व दुर्लभ जड़ी-बूटियों के अर्क से युक्त।",
        "<strong>विशेषता:</strong> स्वाद के साथ-साथ प्राकृतिक रोग-प्रतिरोधक क्षमता (Immunity) बढ़ाने में अत्यधिक गुणकारी।",
        "<strong>उपयोगिता:</strong> पाचन शक्ति दुरुस्त रखे, थकान दूर करे और शरीर में नई ताजगी भरे।"
    ],
    badge_text="पारंपरिक स्वाद",
    highlight_box="🍃 स्वाद भी और सेहत की सुरक्षा भी - अमृत तुल्य चाय"
)
slides_html.append(s7)

# Product 3: Panch Tulsi Drops (product\3.png)
s8 = make_single_product_slide(
    page_num=8,
    prod_num="3",
    prod_hi="पंच तुलसी ड्रॉप्स",
    prod_en="Panch Tulsi Drops - Herbal Immunity Booster",
    cat_name="हेल्थ केयर | HEALTH CARE",
    img_src=img_3,
    pack_options=[
        ("30 ml पैक (100 PV)", "₹ 150 /-", "100 PV"),
        ("MRP", "₹ 199 /-", "सुलभ मूल्य")
    ],
    details_list=[
        "<strong>घटक:</strong> 5 प्रकार की दुर्लभ पवित्र तुलसी (राम, श्याम, श्वेत, वन, नींबू) का शुद्ध सत्व।",
        "<strong>लाभ:</strong> 200 से अधिक रोगों में लाभकारी - सर्दी, खांसी, जुकाम, फ्लू व एलर्जी से प्राकृतिक सुरक्षा।",
        "<strong>प्रयोग विधि:</strong> प्रतिदिन गुनगुने पानी या चाय में 1-2 बूंद डालकर सेवन करें। रक्त शोधक व इम्युनिटी बूस्टर।"
    ],
    badge_text="100 PV एक्टिवेशन",
    highlight_box="🌿 5 दुर्लभ तुलसियों का महा-अर्क - सम्पूर्ण परिवार का सुरक्षा कवच"
)
slides_html.append(s8)

# Product 4: Mix Berries Juice (product\4.png)
s9 = make_single_product_slide(
    page_num=9,
    prod_num="4",
    prod_hi="मिक्स बेरी जूस",
    prod_en="Mix Berries Juice - 52 Herbal Blend",
    cat_name="हेल्थ केयर | HEALTH CARE",
    img_src=img_4,
    pack_options=[
        ("500 ml पैक (500 PV)", "₹ 750 /-", "500 PV"),
        ("एंटीऑक्सीडेंट फॉर्मूला", "52 हर्ब्स", "एनर्जी बूस्टर")
    ],
    details_list=[
        "<strong>घटक:</strong> 52 शक्तिशाली प्राकृतिक जड़ी-बूटियों और एंटीऑक्सीडेंट से भरपूर दुर्लभ बेरीज का सम्मिश्रण।",
        "<strong>लाभ:</strong> शरीर से विषैले तत्व (Toxins) बाहर निकाले, दिल, दिमाग और लीवर को स्वस्थ रखे।",
        "<strong>ऊर्जा एवं स्फूर्ति:</strong> उम्र के प्रभाव को धीमा करे, त्वचा में चमक लाए और दिनभर ऊर्जावान बनाए रखे।"
    ],
    badge_text="500 PV एक्टिवेशन",
    highlight_box="🍇 52 जड़ी-बूटियों का प्राकृतिक अमृत - ऊर्जा और लंबी उम्र का राज"
)
slides_html.append(s9)

# Product 5: Kashmiri Saffron Face Wash (product\5..png)
s10 = make_single_product_slide(
    page_num=10,
    prod_num="5",
    prod_hi="कश्मीरी केसर फेसवॉश",
    prod_en="Kashmiri Saffron Face Wash - Deep Glow",
    cat_name="ब्यूटी केयर | BEAUTY CARE",
    img_src=img_5,
    pack_options=[
        ("200 ml पैक", "MRP ₹ 280 /-", "ब्यूटी केयर"),
        ("डिस्ट्रिब्यूटर प्राइस", "स्पेशल DP", "हाई मार्जिन")
    ],
    details_list=[
        "<strong>तत्व:</strong> शुद्ध कश्मीरी केसर, एलोवेरा, नीम, हल्दी एवं टी-ट्री ऑयल का प्राकृतिक मिश्रण।",
        "<strong>लाभ:</strong> चेहरे की धूल-मिट्टी और अतिरिक्त तेल हटाकर त्वचा को अंदर से साफ व चमकदार बनाता है।",
        "<strong>विशेषता:</strong> मुंहासों, दाग-धब्बों और टैनिंग को दूर कर चेहरे को देता है कुदरती निखार व ताजगी।"
    ],
    badge_text="नेचुरल स्किन केयर",
    highlight_box="✨ कश्मीरी केसर का प्राकृतिक स्पर्श - हर रोज सोने सा निखार"
)
slides_html.append(s10)

# Product 6: Dant Butti Herbal Toothpaste (product\6.png)
s11 = make_single_product_slide(
    page_num=11,
    prod_num="6",
    prod_hi="दंत बुट्टी हर्बल पेस्ट",
    prod_en="Dant Butti Herbal Toothpaste - 11 Herbs",
    cat_name="पर्सनल केयर | PERSONAL CARE",
    img_src=img_6,
    pack_options=[
        ("100 ग्राम पैक", "MRP ₹ 95 /-", "ओरल केयर"),
        ("100% शाकाहारी", "दैनिक सुरक्षा", "परिवार की पसंद")
    ],
    details_list=[
        "<strong>तत्व:</strong> 11 प्राचीन जड़ी-बूटियों जैसे लौंग, बबूल, तोमर, पुदीना और वज्रदंती का जादुई संगम।",
        "<strong>लाभ:</strong> मसूड़ों से खून आना, दांत दर्द, ठंडा-गर्म लगना और पायरिया की समस्या में अचूक आराम।",
        "<strong>सांसों की ताजगी:</strong> मुंह की दुर्गंध दूर कर दिनभर ताजगी और आत्मविश्वास बनाए रखे।"
    ],
    badge_text="100% हर्बल",
    highlight_box="🦷 11 आयुर्वेदिक जड़ी-बूटियों का सुरक्षा चक्र - मजबूत दांत, स्वस्थ मसूड़े"
)
slides_html.append(s11)

# Product 7: Onion & Ginger Shampoo (product\7.png)
s12 = make_single_product_slide(
    page_num=12,
    prod_num="7",
    prod_hi="अनियन & जिंजर शैम्पू",
    prod_en="Onion & Ginger Anti-Hair Fall Shampoo",
    cat_name="हेयर केयर | HAIR CARE",
    img_src=img_7,
    pack_options=[
        ("300 ml + 30 ml Free = 330 ml", "MRP ₹ 399 /-", "हेयर केयर"),
        ("सल्फेट फ्री", "नेचुरल एक्सट्रैक्ट", "तेज असर")
    ],
    details_list=[
        "<strong>तत्व:</strong> लाल प्याज का रस (Red Onion Extract), शुद्ध अदरक (Ginger) और भृंगराज अर्क।",
        "<strong>लाभ:</strong> बालों का झड़ना (Hair Fall) तुरंत रोके, बालों की जड़ों को मजबूत करे और नए बाल उगाने में सहायक।",
        "<strong>रूसी मुक्ति:</strong> डैंड्रफ और स्कैल्प के संक्रमण को जड़ से मिटाकर बालों को दे रेशमी कोमलता।"
    ],
    badge_text="+30 ml फ्री पैक",
    highlight_box="💆 बालों का गिरना रोके, नए बाल उगाए - प्राकृतिक अनियन शक्ति"
)
slides_html.append(s12)

# Product 8: 21 Herbs Hair Oil (product\8.png)
s13 = make_single_product_slide(
    page_num=13,
    prod_num="8",
    prod_hi="21 हर्ब्स हेयर ऑयल",
    prod_en="21 Herbs Ayurvedic Hair Oil",
    cat_name="हेयर केयर | HAIR CARE",
    img_src=img_8,
    pack_options=[
        ("200 ml + 10 ml Free = 210 ml", "MRP ₹ 499 /-", "प्रीमियम ऑयल"),
        ("21 जड़ी-बूटियां", "डीप रूट थेरेपी", "बाल पोषण")
    ],
    details_list=[
        "<strong>तत्व:</strong> भृंगराज, आंवला, ब्राह्मी, शिकाकाई, जटामांसी समेत 21 दुर्लभ जड़ी-बूटियों का सिद्ध तैल।",
        "<strong>लाभ:</strong> बालों को जड़ों से पोषण दे, असमय सफेद होने से रोके और घने, काले, चमकदार बनाए।",
        "<strong>मानसिक शांति:</strong> सिरदर्द और तनाव से राहत दिलाए, गहरी सुकून भरी नींद लाने में मददगार।"
    ],
    badge_text="+10 ml फ्री पैक",
    highlight_box="🌿 21 जड़ी-बूटियों का संपूर्ण पोषण - घने, काले और मजबूत बाल"
)
slides_html.append(s13)

# Product 9: Premium Agarbatti (product\9.png)
s14 = make_single_product_slide(
    page_num=14,
    prod_num="9",
    prod_hi="प्रीमियम सुगंधित अगरबत्ती",
    prod_en="Premium Fragrant Incense Sticks (Rose, Mogra, Chandan)",
    cat_name="होम केयर | HOME CARE",
    img_src=img_9,
    pack_options=[
        ("गुलाब, मोगरा, चंदन वेरिएंट्स", "MRP ₹ 80 – ₹ 90 /-", "होम केयर"),
        ("चारकोल मुक्त", "प्राकृतिक सुगंध", "लंबी अवधि")
    ],
    details_list=[
        "<strong>सुगंध वेरिएंट्स:</strong> 🌹 गुलाब (मनमोहक), 🌼 मोगरा (ताजगी भरा पुष्प), 🪵 चंदन (दिव्य आध्यात्मिक शांति)।",
        "<strong>विशेषता:</strong> 100% चारकोल-मुक्त, कम धुआं और लंबे समय तक महकने वाली पवित्र प्राकृतिक सुगंध।",
        "<strong>वातावरण:</strong> घर, मंदिर और कार्यस्थल को सकारात्मक ऊर्जा, शांति और भक्तिमय वातावरण से भर दे।"
    ],
    badge_text="दिव्य सुगंध",
    highlight_box="🪔 मन को शांति, घर में पावनता - गुलाब, मोगरा और चंदन की महक"
)
slides_html.append(s14)

# ==============================================================================
# SLIDE 15: ACTIVATION PACKAGES - PART 1 (PACKAGES 1 TO 5: ₹150 TO ₹550)
# ==============================================================================
packages_p1 = [
    ("01", "₹ 150 /-", "100 PV", "🌿 पंच तुलसी ड्रॉप्स (30 ml)"),
    ("02", "₹ 299 /-", "150 PV", "🦷 दन्त बुटी टूथपेस्ट (100 gm) + 🧴 कश्मीरी केसर फेसवॉश (200 ml)"),
    ("03", "₹ 349 /-", "150 PV", "☕ इलायची चाय (500 gm)"),
    ("04", "₹ 349 /-", "150 PV", "🍃 अमृत तुल्य चाय (500 gm)"),
    ("05", "₹ 550 /-", "200 PV", "✨ 7-इन-1 फेस क्रीम (50 gm) + 🧅 ओनियन जिंजर शैम्पू (330 ml)")
]

pkg_rows_1 = ""
for num, prc, pv, desc in packages_p1:
    pkg_rows_1 += f"""
    <tr>
      <td><span class="num-badge">{num}</span></td>
      <td style="font-size:24px; font-weight:900; color:#144732;">{prc}</td>
      <td><span class="badge-green" style="font-size:18px;">{pv}</span></td>
      <td style="text-align:left; padding-left:24px; font-size:19px; font-weight:800;">{desc}</td>
    </tr>
"""

s15 = f"""
<div class="slide">
  {slide_header("05.A", "एक्टीवेशन पैकेज", "बिजनेस शुरुआत पैकेज (भाग-1: ₹150 से ₹550)", "Activation Packages (Part 1: Sorted Low to High Price)", "सुलभ शुरुआत मात्र ₹150 से - 100% उपयोगी उत्पादों के साथ सीधा बिजनेस अवसर", "Accessible Starting Points from ₹150 with Full Product Value")}
  
  <div class="slide-body" style="justify-content:center;">
    <table class="bold-table">
      <thead>
        <tr>
          <th style="width:10%;">क्र. सं.</th>
          <th style="width:24%;">पैकेज मूल्य (Price)</th>
          <th style="width:18%;">बिजनेस पॉइंट (PV)</th>
          <th style="width:48%; text-align:left; padding-left:24px;">शामिल उत्पाद विवरण (Included Products)</th>
        </tr>
      </thead>
      <tbody>
        {pkg_rows_1}
      </tbody>
    </table>

    <div style="margin-top:20px; background:#ffffff; border-radius:18px; border-left:8px solid #d4a359; padding:14px 26px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 8px 20px rgba(0,0,0,0.04);">
      <div style="font-size:18px; font-weight:700; color:#2d3748;">
        ✅ किसी भी एक पैकेज के साथ आईडी एक्टिवेट कर सभी 16 प्रकार की आमदनी प्राप्त करने की पात्रता मिलती है।
      </div>
      <div class="badge-gold" style="font-size:16px;">अगले पेज पर देखें: प्रीमियम पैकेज 👉</div>
    </div>
  </div>

  {slide_footer(15)}
</div>
"""
slides_html.append(s15)

# ==============================================================================
# SLIDE 16: ACTIVATION PACKAGES - PART 2 (PACKAGES 6 TO 9: ₹649 TO ₹1099)
# ==============================================================================
packages_p2 = [
    ("06", "₹ 649 /-", "300 PV", "☕ इलायची चाय (1 किलोग्राम पैक)"),
    ("07", "₹ 699 /-", "300 PV", "🍃 अमृत तुल्य चाय (1 किलोग्राम पैक)"),
    ("08", "₹ 750 /-", "500 PV", "🍇 मिक्स बेरी जूस (500 ml प्रीमियम सिरप)"),
    ("09", "₹ 1,099 /-", "500 PV", "✨ 7-1 फेस क्रीम (50g) + 🧅 शैम्पू (330ml) + 🌿 21 हर्ब्स तेल (210ml) + 🧴 केसर फेसवॉश (200ml)")
]

pkg_rows_2 = ""
for num, prc, pv, desc in packages_p2:
    is_combo = (num == "09")
    pkg_rows_2 += f"""
    <tr {'style="background:#fdfcf7;"' if is_combo else ''}>
      <td><span class="num-badge" style="{'background:#d4a359; color:#144732;' if is_combo else ''}">{num}</span></td>
      <td style="font-size:24px; font-weight:900; color:{'#92580a' if is_combo else '#144732'};">{prc}</td>
      <td><span class="badge-green" style="font-size:18px; {'border-color:#d4a359;' if is_combo else ''}">{pv}</span></td>
      <td style="text-align:left; padding-left:24px; font-size:18.5px; font-weight:800;">{desc}</td>
    </tr>
"""

s16 = f"""
<div class="slide">
  {slide_header("05.B", "एक्टीवेशन पैकेज", "बिजनेस शुरुआत पैकेज (भाग-2: ₹649 से ₹1,099)", "Activation Packages (Part 2: Premium & Mega Combo Bundles)", "बड़ी बचत, अतिरिक्त PV और संपूर्ण फैमिली केयर कॉम्बो पैक", "High-Value Bundles for Accelerated Business Activation")}
  
  <div class="slide-body" style="justify-content:center;">
    <table class="bold-table">
      <thead>
        <tr>
          <th style="width:10%;">क्र. सं.</th>
          <th style="width:24%;">पैकेज मूल्य (Price)</th>
          <th style="width:18%;">बिजनेस पॉइंट (PV)</th>
          <th style="width:48%; text-align:left; padding-left:24px;">शामिल उत्पाद विवरण (Included Products)</th>
        </tr>
      </thead>
      <tbody>
        {pkg_rows_2}
      </tbody>
    </table>

    <div style="margin-top:20px; background:#144732; border-radius:18px; padding:16px 28px; display:flex; justify-content:space-between; align-items:center; color:#ffffff; box-shadow:0 10px 24px rgba(20,71,50,0.2);">
      <div style="font-size:19px; font-weight:800; color:#fef08a;">
        🌟 मेगा कॉम्बो पैकेज (₹1,099 / 500 PV) से सीधे टॉप एक्टिवेशन और अधिकतम टीम बेनिफिट!
      </div>
      <div class="badge-gold" style="font-size:16px;">100% प्रोडक्ट वैल्यू</div>
    </div>
  </div>

  {slide_footer(16)}
</div>
"""
slides_html.append(s16)

# ==============================================================================
# SLIDE 17: PRE-LAUNCHING MEGA BOOSTER OFFER
# ==============================================================================
s17 = f"""
<div class="slide">
  {slide_header("06", "धमाका ऑफर", "प्री-लॉन्चिंग स्पेशल बम्पर ऑफर", "Pre-Launching Special Booster Offer", "शुरुआती लीडर्स एवं तेज नेटवर्क निर्माताओं के लिए विशेष उपहार", "Limited-Time Special Privilege for Visionary Network Builders")}
  
  <div class="slide-body" style="align-items:center; justify-content:center;">
    <div class="card-white" style="width:100%; max-width:1020px; padding:36px 44px; border-radius:32px; border:3px dashed #d4a359; background:linear-gradient(180deg, #ffffff 0%, #fffdf8 100%); text-align:center; box-shadow:0 16px 40px rgba(212,163,89,0.15);">
      
      <div style="font-size:28px; margin-bottom:8px;">🔥 🌹 🔥</div>
      
      <div class="badge-gold" style="font-size:18px; padding:6px 20px; border-radius:30px; margin-bottom:16px;">
        सीमित समय हेतु विशेष महा-अवसर | LIMITED TIME SPECIAL PROMOTION
      </div>

      <h1 style="font-size:42px; font-weight:900; color:#92580a; margin-bottom:14px;">
        प्री-लॉन्चिंग स्पेशल ऑफर | Pre-Launching Offer
      </h1>

      <div style="background:#144732; color:#ffffff; border-radius:24px; padding:26px 36px; margin:20px 0; box-shadow:0 10px 25px rgba(20,71,50,0.25);">
        <div style="font-size:26px; font-weight:700; color:#e2e8f0; margin-bottom:6px;">
          मात्र <span style="color:#fef08a; font-size:36px; font-weight:900;">600 PV</span> का डायरेक्ट बिजनेस करने पर
        </div>
        <div style="font-size:42px; font-weight:900; color:#fef08a; letter-spacing:0.5px;">
          👉 1 ID बिल्कुल FREE एक्टिवेशन! 👈
        </div>
        <div style="font-size:18px; color:#cbd5e1; font-weight:600; margin-top:6px;">
          Get 1 Direct ID Free Activation on 600 Direct PV Achievement
        </div>
      </div>

      <div style="display:flex; justify-content:center; gap:28px; margin-top:22px;">
        <div style="background:#f7faf8; border:1.5px solid #b7e1cd; border-radius:16px; padding:14px 24px; font-size:18.5px; font-weight:800; color:#144732;">
          ⚡ तेजी से टीम निर्माण का सुनहरा मौका
        </div>
        <div style="background:#fdfaf3; border:1.5px solid #f3d9a2; border-radius:16px; padding:14px 24px; font-size:18.5px; font-weight:800; color:#92580a;">
          🚀 डायरेक्ट स्पॉन्सर इनकम में 100% वृद्धि
        </div>
      </div>
    </div>
  </div>

  {slide_footer(17)}
</div>
"""
slides_html.append(s17)

# ==============================================================================
# SLIDE 18: 16 INCOMES OVERVIEW - PART 1 (INCOMES 1 TO 8)
# ==============================================================================
incomes_p1 = [
    ("01", "रिटेल प्रॉफिट", "Retail Profit", "5% – 50%", "MRP पर भारी बचत व रिटेल मुनाफा"),
    ("02", "डायरेक्ट इनकम", "Direct Referral", "10% PV", "प्रत्येक सीधी जॉइनिंग के PV पर"),
    ("03", "मैचिंग इनकम", "Binary Matching", "10%", "लेफ्ट व राइट टीम मैचिंग पर"),
    ("04", "डायरेक्ट स्पॉन्सर", "Sponsor Royalty", "10%", "डायरेक्ट साथियों की मैचिंग आय पर"),
    ("05", "अवार्ड & रिवार्ड्स", "Awards & Rewards", "3% Pool", "आकर्षक उपहार, टूर्स, बाइक व कार"),
    ("06", "लीडरशिप इनकम", "Leadership Pool", "5% CTO", "3000 PV डायरेक्ट बिजनेस पर"),
    ("07", "कंपनी CTO रॉयल्टी", "Company Turnover", "5% CTO", "5000 PV डायरेक्ट बिजनेस पर आजीवन"),
    ("08", "ऑटोपूल इनकम", "Universal Auto Pool", "₹13.19 Cr+", "2x2 ग्लोबल नॉन-वर्किंग मैट्रिक्स")
]

inc1_boxes = ""
for num, hi, en, pct, desc in incomes_p1:
    inc1_boxes += f"""
    <div class="card-white" style="padding:16px 20px; border-radius:18px; border-left:7px solid #144732; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
          <span class="num-badge" style="font-size:15px; padding:3px 8px;">{num}</span>
          <div style="font-size:20px; font-weight:900; color:#144732;">{hi}</div>
        </div>
        <div style="font-size:15px; font-weight:700; color:#4a5568;">{en}</div>
        <div style="font-size:13.5px; font-weight:600; color:#718096; margin-top:2px;">{desc}</div>
      </div>
      <div class="badge-gold" style="font-size:17px; font-weight:900; padding:6px 14px;">
        {pct}
      </div>
    </div>
"""

s18 = f"""
<div class="slide">
  {slide_header("07.A", "आय के प्रकार", "16 प्रकार की महा इनकम (इनकम 1 से 8)", "16 Lucrative Income Streams (Heads 1 to 8)", "वर्किंग और नॉन-वर्किंग का संतुलित महा-प्लान", "Comprehensive Balanced Earning Ecosystem")}
  
  <div class="slide-body" style="justify-content:center;">
    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:18px;">
      {inc1_boxes}
    </div>
  </div>

  {slide_footer(18)}
</div>
"""
slides_html.append(s18)

# ==============================================================================
# SLIDE 19: 16 INCOMES OVERVIEW - PART 2 (INCOMES 9 TO 16)
# ==============================================================================
incomes_p2 = [
    ("09", "परचेस इनकम", "Self Purchase Cashback", "10% BV", "स्वयं की खरीदारी पर सीधा कैशबैक"),
    ("10", "रीपरचेस इनकम", "Team Repurchase Bonus", "10% Team", "टीम की हर खरीदारी पर स्थायी बोनस"),
    ("11", "मोबाइल फंड", "Mobile Fund Royalty", "2% CTO", "स्मार्टफोन व गैजेट्स हेतु मासिक फंड"),
    ("12", "बाइक फंड", "Bike Fund Royalty", "2% CTO", "दोपहिया वाहन हेतु समर्पित फंड"),
    ("13", "कार फंड", "Car Fund Royalty", "2% CTO", "सपनों की कार हेतु लाइफस्टाइल फंड"),
    ("14", "हाउस फंड", "House Fund Royalty", "2% CTO", "आलीशान घर निर्माण हेतु स्थायी फंड"),
    ("15", "मोबाइल रिचार्ज", "Mobile Recharge Cashback", "2.50%", "सभी ऑपरेटर रिचार्ज पर फ्लैट बचत"),
    ("16", "डीटीएच रिचार्ज", "DTH Recharge Cashback", "2.50%", "टीवी व केबल रिचार्ज पर तुरंत कैशबैक")
]

inc2_boxes = ""
for num, hi, en, pct, desc in incomes_p2:
    inc2_boxes += f"""
    <div class="card-white" style="padding:16px 20px; border-radius:18px; border-left:7px solid #d4a359; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:4px;">
          <span class="num-badge" style="background:#92580a; font-size:15px; padding:3px 8px;">{num}</span>
          <div style="font-size:20px; font-weight:900; color:#92580a;">{hi}</div>
        </div>
        <div style="font-size:15px; font-weight:700; color:#4a5568;">{en}</div>
        <div style="font-size:13.5px; font-weight:600; color:#718096; margin-top:2px;">{desc}</div>
      </div>
      <div class="badge-green" style="font-size:17px; font-weight:900; padding:6px 14px;">
        {pct}
      </div>
    </div>
"""

s19 = f"""
<div class="slide">
  {slide_header("07.B", "आय के प्रकार", "16 प्रकार की महा इनकम (इनकम 9 से 16)", "16 Lucrative Income Streams (Heads 9 to 16)", "रीपरचेस, लाइफस्टाइल फंड्स एवं यूटिलिटी रिचार्ज", "Repurchase, 4 Lifestyle Funds & Utility Recharge Cashbacks")}
  
  <div class="slide-body" style="justify-content:center;">
    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:18px;">
      {inc2_boxes}
    </div>
  </div>

  {slide_footer(19)}
</div>
"""
slides_html.append(s19)

# ==============================================================================
# SLIDE 20: RETAIL PROFIT & DIRECT REFERRAL INCOME
# ==============================================================================
s20 = f"""
<div class="slide">
  {slide_header("08", "प्राथमिक आमदनी", "रिटेल प्रॉफिट एवं डायरेक्ट इनकम", "Retail Profit & Direct Referral Income", "शुरुआती स्तर से ही मजबूत एवं तुरंत नकद आमदनी का साधन", "Immediate Cash Flow & Instant Direct Referral Bonuses")}
  
  <div class="slide-body" style="flex-direction:row; gap:32px; justify-content:center; align-items:center;">
    <!-- Retail Profit Card -->
    <div class="card-white border-accent-green" style="flex:1; padding:30px 32px; display:flex; flex-direction:column; justify-content:space-between; height:500px; border-radius:30px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h2 style="font-size:28px; font-weight:900; color:#144732;">1. रिटेल प्रॉफिट | Retail</h2>
          <span class="badge-green" style="font-size:16px;">खुदरा मुनाफा</span>
        </div>
        
        <div style="background:#f7faf8; border:2px solid #b7e1cd; border-radius:20px; padding:18px; text-align:center; margin-bottom:18px;">
          <div style="font-size:52px; font-weight:900; color:#144732; line-height:1;">5% – 50%</div>
          <div style="font-size:16px; font-weight:700; color:#555; margin-top:6px;">प्रस्तावित खुदरा लाभ मार्जिन (Retail Margin on MRP)</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; font-size:17.5px; font-weight:600; color:#374151;">
          <div>• उत्पाद डिस्काउंटेड डिस्ट्रीब्यूटर प्राइस (DP) पर मिलते हैं।</div>
          <div>• उत्पादों को MRP पर बेचकर 5% से 50% तक सीधा नकद लाभ कमाएं।</div>
          <div>• अपनी व्यक्तिगत जरूरतों पर भी हर महीने भारी बचत।</div>
        </div>
      </div>

      <div style="background:#eaf5ed; padding:12px; border-radius:14px; font-size:16.5px; font-weight:800; color:#144732; text-align:center;">
        💡 उत्पाद इस्तेमाल करें, पसंद आए तो दूसरों को बताएं और मुनाफा कमाएं!
      </div>
    </div>

    <!-- Direct Referral Card -->
    <div class="card-white border-accent-gold" style="flex:1; padding:30px 32px; display:flex; flex-direction:column; justify-content:space-between; height:500px; border-radius:30px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h2 style="font-size:28px; font-weight:900; color:#92580a;">2. डायरेक्ट इनकम | Bonus</h2>
          <span class="badge-gold" style="font-size:16px;">रेफरल बोनस</span>
        </div>

        <div style="background:#fdfaf3; border:2px solid #f3d9a2; border-radius:20px; padding:18px; text-align:center; margin-bottom:18px;">
          <div style="font-size:52px; font-weight:900; color:#92580a; line-height:1;">10% PV</div>
          <div style="font-size:16px; font-weight:700; color:#555; margin-top:6px;">प्रत्येक डायरेक्ट स्पॉन्सर के एक्टिवेशन PV पर</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; font-size:17.5px; font-weight:600; color:#374151;">
          <div>• जितने साथियों को सीधे जोड़ेंगे, उनके पैकेज PV का 10% तुरंत मिलेगा।</div>
          <div>• <strong>अनलिमिटेड डायरेक्ट:</strong> कोई लिमिट नहीं, जितने चाहें उतने साथी जोड़ें।</div>
          <div>• 500 PV पैकेज से जॉइन कराने पर ₹50 तुरंत वॉलेट में क्रेडिट।</div>
        </div>
      </div>

      <div style="background:#fdf5e6; padding:12px; border-radius:14px; font-size:16.5px; font-weight:800; color:#92580a; text-align:center;">
        ⚡ जितनी बड़ी डायरेक्ट टीम, उतनी बड़ी रोज की सीधी इनकम!
      </div>
    </div>
  </div>

  {slide_footer(20)}
</div>
"""
slides_html.append(s20)

# ==============================================================================
# SLIDE 21: MATCHING INCOME & SPONSOR ROYALTY
# ==============================================================================
s21 = f"""
<div class="slide">
  {slide_header("09", "टीम वर्किंग आय", "मैचिंग इनकम एवं स्पॉन्सर रॉयल्टी", "Binary Matching & Sponsor Matching Royalty", "मजबूत 2-लेग बाइनरी संरचना और अनलिमिटेड टीम डेप्थ का लाभ", "High-Velocity Binary Matching with Unlimited Depth & Daily Closing")}
  
  <div class="slide-body" style="flex-direction:row; gap:32px; justify-content:center; align-items:center;">
    <!-- Matching Income Card -->
    <div class="card-white border-accent-green" style="flex:1; padding:30px 32px; display:flex; flex-direction:column; justify-content:space-between; height:500px; border-radius:30px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h2 style="font-size:28px; font-weight:900; color:#144732;">3. मैचिंग इनकम | Matching</h2>
          <span class="badge-green" style="font-size:16px;">10% मैचिंग</span>
        </div>

        <div style="background:#f7faf8; border:2px solid #b7e1cd; border-radius:20px; padding:18px; text-align:center; margin-bottom:18px;">
          <div style="font-size:48px; font-weight:900; color:#144732; line-height:1;">10% (1:1 Ratio)</div>
          <div style="font-size:16px; font-weight:700; color:#555; margin-top:6px;">लेफ्ट व राइट टीम बिजनेस मैचिंग पर</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; font-size:17.5px; font-weight:600; color:#374151;">
          <div>• <strong>रेश्यो:</strong> पहला पेयर 1:2 या 2:1, उसके बाद 1:1 के अनुपात में।</div>
          <div>• <strong>अनलिमिटेड डेप्थ:</strong> टीम में किसी भी गहराई पर बिजनेस से लाभ।</div>
          <div>• <strong>डेली क्लोजिंग:</strong> हर रात 12:00 बजे हिसाब व तुरंत वॉलेट ट्रांसफर।</div>
        </div>
      </div>

      <div style="background:#eaf5ed; padding:12px; border-radius:14px; font-size:16.5px; font-weight:800; color:#144732; text-align:center;">
        ⚖️ दोनों टीमों का समान संतुलन बनाएं और रोज मैचिंग का लाभ पाएं!
      </div>
    </div>

    <!-- Sponsor Matching Royalty Card -->
    <div class="card-white border-accent-gold" style="flex:1; padding:30px 32px; display:flex; flex-direction:column; justify-content:space-between; height:500px; border-radius:30px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h2 style="font-size:28px; font-weight:900; color:#92580a;">4. डायरेक्ट स्पॉन्सर इनकम</h2>
          <span class="badge-gold" style="font-size:16px;">10% रॉयल्टी</span>
        </div>

        <div style="background:#fdfaf3; border:2px solid #f3d9a2; border-radius:20px; padding:18px; text-align:center; margin-bottom:18px;">
          <div style="font-size:48px; font-weight:900; color:#92580a; line-height:1;">10% रॉयल्टी</div>
          <div style="font-size:16px; font-weight:700; color:#555; margin-top:6px;">डायरेक्ट साथियों की मैचिंग आमदनी पर</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; font-size:17.5px; font-weight:600; color:#374151;">
          <div>• आपके सीधे स्पॉन्सर किए गए साथी जितनी मैचिंग कमाएंगे...</div>
          <div>• उनकी कुल मैचिंग कमाई का <strong>10% अतिरिक्त बोनस</strong> आपको मिलेगा।</div>
          <div>• 10 डायरेक्ट साथी ₹1 लाख कमाते हैं तो आपको सीधे ₹10,000 मिलेंगे!</div>
        </div>
      </div>

      <div style="background:#fdf5e6; padding:12px; border-radius:14px; font-size:16.5px; font-weight:800; color:#92580a; text-align:center;">
        🤝 साथियों को जिताओ, खुद भी बड़ा पैसा कमाओ!
      </div>
    </div>
  </div>

  {slide_footer(21)}
</div>
"""
slides_html.append(s21)

# ==============================================================================
# SLIDE 22: LEADERSHIP & COMPANY CTO ROYALTY
# ==============================================================================
s22 = f"""
<div class="slide">
  {slide_header("10", "रॉयल्टी आमदनी", "लीडरशिप एवं कंपनी CTO रॉयल्टी", "Leadership Royalty & Company Turnover Pool", "कंपनी के कुल टर्नओवर में स्थायी पार्टनरशिप और सम्मान", "Permanent Stakeholder Status in Company-Wide Monthly Turnover")}
  
  <div class="slide-body" style="flex-direction:row; gap:32px; justify-content:center; align-items:center;">
    <!-- Leadership Income Card -->
    <div class="card-white border-accent-green" style="flex:1; padding:30px 32px; display:flex; flex-direction:column; justify-content:space-between; height:500px; border-radius:30px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h2 style="font-size:28px; font-weight:900; color:#144732;">6. लीडरशिप इनकम | Leadership</h2>
          <span class="badge-green" style="font-size:16px;">3000 PV</span>
        </div>

        <div style="background:#f7faf8; border:2px solid #b7e1cd; border-radius:20px; padding:18px; text-align:center; margin-bottom:18px;">
          <div style="font-size:48px; font-weight:900; color:#144732; line-height:1;">5% CTO Pool</div>
          <div style="font-size:16px; font-weight:700; color:#555; margin-top:6px;">3000 PV डायरेक्ट बिजनेस पूरा करने पर</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; font-size:17.5px; font-weight:600; color:#374151;">
          <div>• डायरेक्ट आईडी से कुल <strong>3000 PV</strong> डायरेक्ट बिजनेस करने पर।</div>
          <div>• कंपनी के 5% लीडरशिप रॉयल्टी क्लब में आजीवन शामिल।</div>
          <div>• कुल मासिक टर्नओवर का 5% सभी योग्य लीडर्स में समान वितरण।</div>
        </div>
      </div>

      <div style="background:#eaf5ed; padding:12px; border-radius:14px; font-size:16.5px; font-weight:800; color:#144732; text-align:center;">
        👑 अपनी लीडरशिप साबित करें और हर महीने स्थायी रॉयल्टी पाएं!
      </div>
    </div>

    <!-- Company CTO Partner Card -->
    <div class="card-white border-accent-gold" style="flex:1; padding:30px 32px; display:flex; flex-direction:column; justify-content:space-between; height:500px; border-radius:30px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h2 style="font-size:28px; font-weight:900; color:#92580a;">7. कंपनी CTO इनकम | Lifetime</h2>
          <span class="badge-gold" style="font-size:16px;">5000 PV</span>
        </div>

        <div style="background:#fdfaf3; border:2px solid #f3d9a2; border-radius:20px; padding:18px; text-align:center; margin-bottom:18px;">
          <div style="font-size:48px; font-weight:900; color:#92580a; line-height:1;">5% CTO Lifetime</div>
          <div style="font-size:16px; font-weight:700; color:#555; margin-top:6px;">5000 PV डायरेक्ट बिजनेस पूरा करने पर</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; font-size:17.5px; font-weight:600; color:#374151;">
          <div>• डायरेक्ट आईडी से कुल <strong>5000 PV</strong> डायरेक्ट बिजनेस करने पर।</div>
          <div>• कंपनी के सर्वोच्च <strong>CTO (Company Total Turnover) पार्टनर</strong>।</div>
          <div>• कंपनी कुल टर्नओवर का 5% आजीवन बैंक खाते में नियमित क्रेडिट।</div>
        </div>
      </div>

      <div style="background:#fdf5e6; padding:12px; border-radius:14px; font-size:16.5px; font-weight:800; color:#92580a; text-align:center;">
        🏛️ कंपनी के लाइफटाइम टर्नओवर पार्टनर बनने का ऐतिहासिक अवसर!
      </div>
    </div>
  </div>

  {slide_footer(22)}
</div>
"""
slides_html.append(s22)

# ==============================================================================
# SLIDE 23: GLOBAL AUTO POOL MASTER PLAN (7 LEVELS)
# ==============================================================================
autopool_data = [
    ("L1", "2 × ₹100", "₹ 200", "₹ 125", "₹ 75"),
    ("L2", "4 × ₹125", "₹ 500", "₹ 300", "₹ 200"),
    ("L3", "8 × ₹300", "₹ 2,400", "₹ 1,000", "₹ 1,400"),
    ("L4", "16 × ₹1,000", "₹ 16,000", "₹ 6,000", "₹ 10,000"),
    ("L5", "32 × ₹6,000", "₹ 1,92,000", "₹ 75,000", "₹ 1,17,000"),
    ("L6", "64 × ₹75,000", "₹ 48,00,000", "₹ 10,00,000", "₹ 38,00,000"),
    ("L7", "128 × ₹10,00,000", "₹ 12,80,00,000", "NIL (0)", "₹ 12,80,00,000")
]

ap_rows = ""
for lvl, calc, tot, upg, net in autopool_data:
    is_l7 = (lvl == "L7")
    row_cls = 'class="crown-row"' if is_l7 else ''
    net_st = 'style="font-size:20px; font-weight:900; color:#fef08a;"' if is_l7 else 'style="font-size:19px; font-weight:900; color:#144732;"'
    ap_rows += f"""
    <tr {row_cls}>
      <td><span class="num-badge" style="{'background:#d4a359; color:#144732;' if is_l7 else ''}">{lvl}</span></td>
      <td style="font-size:18.5px; font-weight:800;">{calc}</td>
      <td style="font-size:18.5px; font-weight:800;">{tot}</td>
      <td style="font-size:18.5px; font-weight:800; color:{'#ffffff' if is_l7 else '#dc2626'};">{upg}</td>
      <td {net_st}>{net}</td>
    </tr>
"""

s23 = f"""
<div class="slide">
  {slide_header("11", "ऑटोपूल योजना", "नॉन-वर्किंग महा ऑटोपूल इनकम", "Global 2x2 Auto Pool Matrix - Complete 7 Levels", "ऑल इंडिया ऑटो-प्लेसमेंट द्वारा ₹13.19 करोड़ से अधिक की कुल संभावित आमदनी", "Systematic Universal Spillover Matrix with Automatic Upgrade Model")}
  
  <div class="slide-body" style="justify-content:center;">
    <table class="bold-table">
      <thead>
        <tr>
          <th style="width:12%;">लेवल</th>
          <th style="width:25%;">मैट्रिक्स गणना (Matrix Formula)</th>
          <th style="width:21%;">कुल राशि (Total Amount)</th>
          <th style="width:21%;">अपग्रेड कटौती (Upgrade Deduction)</th>
          <th style="width:21%;">नेट आमदनी (Net Income)</th>
        </tr>
      </thead>
      <tbody>
        {ap_rows}
      </tbody>
    </table>

    <div style="margin-top:18px; background:#144732; border-radius:18px; padding:16px 30px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 10px 25px rgba(20,71,50,0.25);">
      <div style="font-size:20px; font-weight:800; color:#ffffff;">
        🏆 <strong>कुल संभावित ऑटोपूल आय (Total Net Income):</strong>
      </div>
      <div style="font-size:32px; font-weight:900; color:#fef08a;">
        ₹ 13,19,28,675 /- <span style="font-size:18px; color:#ffffff;">(तेरह करोड़ उन्नीस लाख रुपये से अधिक)</span>
      </div>
    </div>
  </div>

  {slide_footer(23)}
</div>
"""
slides_html.append(s23)

# ==============================================================================
# SLIDE 24: AUTO POOL WORKING RULES & MECHANICS
# ==============================================================================
s24 = f"""
<div class="slide">
  {slide_header("12", "ऑटोपूल नियम", "ऑटोपूल प्रणाली कैसे काम करती है?", "How the Global 2x2 Auto Pool Matrix Functions", "पारदर्शी, स्व-चालित एवं तकनीक-संचालित ग्लोबल नॉन-वर्किंग सिस्टम", "Fully Automated Universal Spillover & Automatic Level Upgrades")}
  
  <div class="slide-body" style="flex-direction:row; gap:26px; justify-content:center; align-items:center;">
    <!-- Step 1 -->
    <div class="card-white border-accent-green" style="flex:1; padding:26px 24px; display:flex; flex-direction:column; justify-content:space-between; height:500px; border-radius:26px;">
      <div>
        <div class="num-badge" style="font-size:18px; padding:6px 14px; margin-bottom:12px;">चरण 1</div>
        <h2 style="font-size:23px; font-weight:900; color:#144732; margin-bottom:10px;">ग्लोबल ऑटो-प्लेसमेंट</h2>
        <div style="font-size:14.5px; font-weight:700; color:#d4a359; margin-bottom:12px;">Universal Spillover Engine</div>
        <p style="font-size:17.5px; line-height:1.55; color:#374151; font-weight:600;">
          पूरे भारत से कंपनी में किसी भी लीडर द्वारा एक्टिवेट होने वाली सभी नई आईडियां ऑटोमैटिकली 2 के मैट्रिक्स में ऊपर से नीचे, बाएं से दाएं प्लेस होती हैं। किसी को व्यक्तिगत सदस्य जोड़ना अनिवार्य नहीं है।
        </p>
      </div>
      <div style="background:#eaf5ed; padding:12px; border-radius:12px; font-size:16px; font-weight:800; color:#144732; text-align:center;">
        🌐 100% ऑटोमेटेड ग्लोबल मैट्रिक्स
      </div>
    </div>

    <!-- Step 2 -->
    <div class="card-white border-accent-gold" style="flex:1; padding:26px 24px; display:flex; flex-direction:column; justify-content:space-between; height:500px; border-radius:26px;">
      <div>
        <div class="num-badge" style="background:#92580a; font-size:18px; padding:6px 14px; margin-bottom:12px;">चरण 2</div>
        <h2 style="font-size:23px; font-weight:900; color:#92580a; margin-bottom:10px;">सिस्टम अपग्रेड कटौती</h2>
        <div style="font-size:14.5px; font-weight:700; color:#144732; margin-bottom:12px;">Smart Re-Investment Model</div>
        <p style="font-size:17.5px; line-height:1.55; color:#374151; font-weight:600;">
          प्रत्येक लेवल पर आने वाली कुल राशि में से निर्धारित अपग्रेड राशि स्वतः अगले बड़े लेवल के लिए कट जाती है और शेष <strong>शुद्ध आमदनी (Net Income)</strong> तुरंत आपके विड्रॉल वॉलेट में ट्रांसफर हो जाती है।
        </p>
      </div>
      <div style="background:#fdf5e6; padding:12px; border-radius:12px; font-size:16px; font-weight:800; color:#92580a; text-align:center;">
        ⚡ पारदर्शी स्व-चालित अपग्रेड प्रक्रिया
      </div>
    </div>

    <!-- Step 3 -->
    <div class="card-white border-accent-green" style="flex:1; padding:26px 24px; display:flex; flex-direction:column; justify-content:space-between; height:500px; border-radius:26px;">
      <div>
        <div class="num-badge" style="font-size:18px; padding:6px 14px; margin-bottom:12px;">चरण 3</div>
        <h2 style="font-size:23px; font-weight:900; color:#144732; margin-bottom:10px;">7वें लेवल पर महा-पेआउट</h2>
        <div style="font-size:14.5px; font-weight:700; color:#d4a359; margin-bottom:12px;">Zero Upgrade at Final Level</div>
        <p style="font-size:17.5px; line-height:1.55; color:#374151; font-weight:600;">
          7वें और अंतिम लेवल पर पूरे 128 सदस्यों से ₹10 लाख प्रति सदस्य के हिसाब से पूरे <strong>₹ 12.80 करोड़ रुपये</strong> बिना किसी अपग्रेड कटौती के 100% आपके बैंक खाते में विड्रॉल के लिए उपलब्ध होते हैं।
        </p>
      </div>
      <div style="background:#eaf5ed; padding:12px; border-radius:12px; font-size:16px; font-weight:800; color:#144732; text-align:center;">
        💰 ऐतिहासिक ₹12.80 करोड़ का अंतिम पेआउट
      </div>
    </div>
  </div>

  {slide_footer(24)}
</div>
"""
slides_html.append(s24)

# ==============================================================================
# SLIDE 25: RANK & REWARDS - STAR CLUB (RANKS 1 TO 5)
# ==============================================================================
s25 = f"""
<div class="slide">
  {slide_header("13.A", "सम्मान एवं पुरस्कार", "रैंक एवं लाइफस्टाइल रिवार्ड्स - स्टार क्लब (रैंक 1 से 5)", "Rank & Lifestyle Rewards - Star Club (Ranks 1 to 5)", "3% रिवार्ड फंड से आपके नेतृत्व का हर कदम पर भव्य सम्मान", "Dedicated 3% Lifestyle Reward Pool for Initial Milestones")}
  
  <div class="slide-body" style="justify-content:center;">
    <table class="bold-table">
      <thead>
        <tr>
          <th style="width:10%;">क्र.</th>
          <th style="width:28%; text-align:left; padding-left:20px;">रैंक पदनाम (Rank)</th>
          <th style="width:18%;">लेफ्ट (Left RP)</th>
          <th style="width:18%;">राइट (Right RP)</th>
          <th style="width:26%;">शानदार रिवॉर्ड / नकद पुरस्कार</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="num-badge">01</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">⭐ 1- स्टार (1-Star)</td>
          <td style="font-size:18.5px; font-weight:800;">30 RP</td>
          <td style="font-size:18.5px; font-weight:800;">30 RP</td>
          <td style="font-size:20px; font-weight:900; color:#144732;">₹ 100 /- नकद</td>
        </tr>
        <tr>
          <td><span class="num-badge">02</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">⭐⭐ 2- स्टार (2-Star)</td>
          <td style="font-size:18.5px; font-weight:800;">150 RP</td>
          <td style="font-size:18.5px; font-weight:800;">150 RP</td>
          <td style="font-size:20px; font-weight:900; color:#144732;">⌚ आकर्षक कलाई घड़ी (Watch)</td>
        </tr>
        <tr>
          <td><span class="num-badge">03</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">⭐⭐⭐ 3- स्टार (3-Star)</td>
          <td style="font-size:18.5px; font-weight:800;">500 RP</td>
          <td style="font-size:18.5px; font-weight:800;">500 RP</td>
          <td style="font-size:20px; font-weight:900; color:#144732;">₹ 1,500 /- नकद</td>
        </tr>
        <tr>
          <td><span class="num-badge">04</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">🥈 सिल्वर (Silver)</td>
          <td style="font-size:18.5px; font-weight:800;">3,000 RP</td>
          <td style="font-size:18.5px; font-weight:800;">3,000 RP</td>
          <td style="font-size:20px; font-weight:900; color:#92580a;">🕌 जगन्नाथ पुरी टूर (Puri Tour)</td>
        </tr>
        <tr>
          <td><span class="num-badge">05</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">🥇 गोल्ड (Gold)</td>
          <td style="font-size:18.5px; font-weight:800;">5,000 RP</td>
          <td style="font-size:18.5px; font-weight:800;">5,000 RP</td>
          <td style="font-size:20px; font-weight:900; color:#92580a;">📱 ब्रांडेड 5G स्मार्टफोन (Mobile)</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:18px; background:#ffffff; border-radius:16px; border-left:7px solid #144732; padding:12px 24px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:17px; font-weight:700; color:#2d3748;">
        * RP (रिवार्ड पॉइंट्स) की गणना 1:1 लेफ्ट एवं राइट बिजनेस मैचिंग पर की जाती है।
      </div>
      <div class="badge-gold" style="font-size:15px;">अगले पेज पर देखें: लीडरशिप क्लब (रैंक 6-10) 👉</div>
    </div>
  </div>

  {slide_footer(25)}
</div>
"""
slides_html.append(s25)

# ==============================================================================
# SLIDE 26: RANK & REWARDS - LEADERSHIP CLUB (RANKS 6 TO 10)
# ==============================================================================
s26 = f"""
<div class="slide">
  {slide_header("13.B", "सम्मान एवं पुरस्कार", "रैंक एवं लाइफस्टाइल रिवार्ड्स - लीडरशिप क्लब (रैंक 6 से 10)", "Rank & Lifestyle Rewards - Leadership Club (Ranks 6 to 10)", "लक्ज़री बाइक, टूर, कार एवं लाखों के नकद पुरस्कार", "Luxury Bikes, Sacred Tours, Brand New Cars & Cash Rewards")}
  
  <div class="slide-body" style="justify-content:center;">
    <table class="bold-table">
      <thead>
        <tr>
          <th style="width:10%;">क्र.</th>
          <th style="width:28%; text-align:left; padding-left:20px;">रैंक पदनाम (Rank)</th>
          <th style="width:18%;">लेफ्ट (Left RP)</th>
          <th style="width:18%;">राइट (Right RP)</th>
          <th style="width:26%;">शानदार रिवॉर्ड / नकद पुरस्कार</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="num-badge">06</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">💎 रूबी (Ruby)</td>
          <td style="font-size:18.5px; font-weight:800;">10,000 RP</td>
          <td style="font-size:18.5px; font-weight:800;">10,000 RP</td>
          <td style="font-size:20px; font-weight:900; color:#144732;">₹ 30,000 /- नकद पुरस्कार</td>
        </tr>
        <tr>
          <td><span class="num-badge">07</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">🏆 प्लेटिनम (Platinum)</td>
          <td style="font-size:18.5px; font-weight:800;">20,000 RP</td>
          <td style="font-size:18.5px; font-weight:800;">20,000 RP</td>
          <td style="font-size:20px; font-weight:900; color:#144732;">🌴 भव्य रामेश्वरम टूर (Tour)</td>
        </tr>
        <tr>
          <td><span class="num-badge">08</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">🟢 एमराल्ड (Emerald)</td>
          <td style="font-size:18.5px; font-weight:800;">40,000 RP</td>
          <td style="font-size:18.5px; font-weight:800;">40,000 RP</td>
          <td style="font-size:20px; font-weight:900; color:#92580a;">🏍️ ब्रांड न्यू बाइक (Motorcycle)</td>
        </tr>
        <tr>
          <td><span class="num-badge">09</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">💠 डायमंड (Diamond)</td>
          <td style="font-size:18.5px; font-weight:800;">1,00,000 RP</td>
          <td style="font-size:18.5px; font-weight:800;">1,00,000 RP</td>
          <td style="font-size:20px; font-weight:900; color:#92580a;">💵 ₹ 3,00,000 /- (3 लाख कैश)</td>
        </tr>
        <tr>
          <td><span class="num-badge">10</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">💠💠 डबल डायमंड</td>
          <td style="font-size:18.5px; font-weight:800;">5,00,000 RP</td>
          <td style="font-size:18.5px; font-weight:800;">5,00,000 RP</td>
          <td style="font-size:20px; font-weight:900; color:#144732;">🚗 शानदार कार (Brand New Car)</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:18px; background:#ffffff; border-radius:16px; border-left:7px solid #d4a359; padding:12px 24px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:17px; font-weight:700; color:#2d3748;">
        * सभी पुरस्कार लाइफटाइम एक्युमुलेटेड (जुड़ते हुए) बिजनेस आधार पर प्रदान किए जाते हैं।
      </div>
      <div class="badge-gold" style="font-size:15px;">अगले पेज पर देखें: करोड़पति क्लब (रैंक 11-15) 👉</div>
    </div>
  </div>

  {slide_footer(26)}
</div>
"""
slides_html.append(s26)

# ==============================================================================
# SLIDE 27: RANK & REWARDS - CROREPATI CLUB (RANKS 11 TO 15)
# ==============================================================================
s27 = f"""
<div class="slide">
  {slide_header("13.C", "सम्मान एवं पुरस्कार", "रैंक एवं लाइफस्टाइल रिवार्ड्स - करोड़पति क्लब (रैंक 11 से 15)", "Rank & Lifestyle Rewards - Crorepati Club (Ranks 11 to 15)", "करोड़ों के नकद पुरस्कार एवं सर्वोच्च क्राउन एम्बेसडर सम्मान", "Multi-Crore Cash Rewards & The Ultimate Crown Ambassador Honours")}
  
  <div class="slide-body" style="justify-content:center;">
    <table class="bold-table">
      <thead>
        <tr>
          <th style="width:10%;">क्र.</th>
          <th style="width:28%; text-align:left; padding-left:20px;">रैंक पदनाम (Rank)</th>
          <th style="width:18%;">लेफ्ट (Left RP)</th>
          <th style="width:18%;">राइट (Right RP)</th>
          <th style="width:26%;">शानदार रिवॉर्ड / नकद पुरस्कार</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="num-badge">11</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">💎💎💎 ट्रिपल डायमंड</td>
          <td style="font-size:18.5px; font-weight:800;">10,00,000 RP</td>
          <td style="font-size:18.5px; font-weight:800;">10,00,000 RP</td>
          <td style="font-size:20px; font-weight:900; color:#144732;">💵 ₹ 30,00,000 /- (30 लाख)</td>
        </tr>
        <tr>
          <td><span class="num-badge">12</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">👑 कोहिनूर (Kohinoor)</td>
          <td style="font-size:18.5px; font-weight:800;">20,00,000 RP</td>
          <td style="font-size:18.5px; font-weight:800;">20,00,000 RP</td>
          <td style="font-size:20px; font-weight:900; color:#144732;">💵 ₹ 60,00,000 /- (60 लाख)</td>
        </tr>
        <tr>
          <td><span class="num-badge">13</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">🏛️ अम्बेडकर (Ambassador)</td>
          <td style="font-size:18.5px; font-weight:800;">40,00,000 RP</td>
          <td style="font-size:18.5px; font-weight:800;">40,00,000 RP</td>
          <td style="font-size:20px; font-weight:900; color:#92580a;">💰 ₹ 1,00,00,000 /- (1 करोड़)</td>
        </tr>
        <tr>
          <td><span class="num-badge">14</span></td>
          <td style="text-align:left; padding-left:20px; font-size:19px; font-weight:800;">👑 रॉयल अम्बेडकर (Royal Ambassador)</td>
          <td style="font-size:18.5px; font-weight:800;">80,00,000 RP</td>
          <td style="font-size:18.5px; font-weight:800;">80,00,000 RP</td>
          <td style="font-size:20px; font-weight:900; color:#92580a;">💰 ₹ 2,00,00,000 /- (2 करोड़)</td>
        </tr>
        <tr class="crown-row">
          <td><span class="num-badge" style="background:#d4a359; color:#144732;">15</span></td>
          <td style="text-align:left; padding-left:20px; font-size:20px; font-weight:900;">👑👑 क्राउन एम्बेसडर (Crown Ambassador)</td>
          <td style="font-size:19px; font-weight:900;">2 करोड़ RP</td>
          <td style="font-size:19px; font-weight:900;">2 करोड़ RP</td>
          <td style="font-size:22px; font-weight:900; color:#fef08a;">🏆 ₹ 3,00,00,000 /- (3 करोड़)</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:18px; background:#144732; border-radius:16px; padding:14px 28px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:18px; font-weight:900; color:#ffffff;">
        🌟 कुल 15 रैंक रिवार्ड्स की ऐतिहासिक उपलब्धि — आपके हर बड़े सपने को साकार करने का संकल्प!
      </div>
      <div class="badge-gold" style="font-size:15px;">लाइफटाइम रॉयल्टी</div>
    </div>
  </div>

  {slide_footer(27)}
</div>
"""
slides_html.append(s27)

# ==============================================================================
# SLIDE 28: 4 LUXURY LIFESTYLE FUNDS
# ==============================================================================
s28 = f"""
<div class="slide">
  {slide_header("14", "लक्ज़री लाइफ फंड्स", "4 प्रकार के लाइफस्टाइल रॉयल्टी फंड्स", "4 Dedicated Luxury Lifestyle Royalty Funds", "कंपनी टर्नओवर (CTO) से हर महीने योग्य लीडर्स में 2% रॉयल्टी का समान वितरण", "2% Company Turnover Allocated Monthly Across 4 Elite Lifestyle Funds")}
  
  <div class="slide-body" style="justify-content:center;">
    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:22px;">
      <!-- Mobile Fund -->
      <div class="card-white border-accent-green" style="padding:24px 28px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:25px; font-weight:900; color:#144732; margin-bottom:4px;">📱 मोबाइल फंड | Mobile</div>
          <div style="font-size:16.5px; font-weight:600; color:#4a5568; line-height:1.45;">
            कंपनी टर्नओवर (CTO) का 2% फंड। योग्य लीडर्स को आधुनिक 5G स्मार्टफोन हेतु मासिक वितरण।
          </div>
        </div>
        <div class="badge-green" style="font-size:22px; padding:10px 18px; font-weight:900;">2% CTO</div>
      </div>

      <!-- Bike Fund -->
      <div class="card-white border-accent-gold" style="padding:24px 28px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:25px; font-weight:900; color:#92580a; margin-bottom:4px;">🏍️ बाइक फंड | Bike</div>
          <div style="font-size:16.5px; font-weight:600; color:#4a5568; line-height:1.45;">
            कंपनी टर्नओवर (CTO) का 2% फंड। फील्ड विजिट व तेज नेटवर्किंग हेतु दोपहिया वाहन के लिए फंड।
          </div>
        </div>
        <div class="badge-gold" style="font-size:22px; padding:10px 18px; font-weight:900;">2% CTO</div>
      </div>

      <!-- Car Fund -->
      <div class="card-white border-accent-green" style="padding:24px 28px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:25px; font-weight:900; color:#144732; margin-bottom:4px;">🚗 कार फंड | Car Fund</div>
          <div style="font-size:16.5px; font-weight:600; color:#4a5568; line-height:1.45;">
            कंपनी टर्नओवर (CTO) का 2% फंड। टॉप लीडर्स को लग्जरी चौपहिया कार खरीदने व मेंटेनेंस हेतु फंड।
          </div>
        </div>
        <div class="badge-green" style="font-size:22px; padding:10px 18px; font-weight:900;">2% CTO</div>
      </div>

      <!-- House Fund -->
      <div class="card-white border-accent-gold" style="padding:24px 28px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:25px; font-weight:900; color:#92580a; margin-bottom:4px;">🏠 हाउस फंड | House</div>
          <div style="font-size:16.5px; font-weight:600; color:#4a5568; line-height:1.45;">
            कंपनी टर्नओवर (CTO) का 2% फंड। अपने सपनों का आलीशान घर बनाने हेतु एलीट अचीवर्स के लिए विशेष फंड।
          </div>
        </div>
        <div class="badge-gold" style="font-size:22px; padding:10px 18px; font-weight:900;">2% CTO</div>
      </div>
    </div>

    <div style="margin-top:20px; background:#ffffff; border-radius:16px; padding:14px 26px; text-align:center; font-size:16.5px; font-weight:700; color:#374151; border:1px solid #dcd7ca;">
      💡 <em>फंड्स का वितरण कंपनी के मासिक टर्नओवर से सीधे योग्य लीडर्स के वॉलेट में किया जाता है।</em>
    </div>
  </div>

  {slide_footer(28)}
</div>
"""
slides_html.append(s28)

# ==============================================================================
# SLIDE 29: REPURCHASE & UTILITY CASHBACK
# ==============================================================================
s29 = f"""
<div class="slide">
  {slide_header("15", "रीपरचेस व रिचार्ज", "रीपरचेस इनकम एवं यूटिलिटी रिचार्ज", "Repurchase Incomes & Instant Utility Recharge Cashbacks", "दैनिक जीवन की आवश्यक सेवाओं से लगातार स्थायी और पैसिव आमदनी", "Residual Lifetime Income from Everyday Essentials & Service Transactions")}
  
  <div class="slide-body" style="flex-direction:row; gap:32px; justify-content:center; align-items:center;">
    <!-- Repurchase Card -->
    <div class="card-white border-accent-green" style="flex:1; padding:30px 30px; display:flex; flex-direction:column; justify-content:space-between; height:500px; border-radius:28px;">
      <div>
        <h2 style="font-size:26px; font-weight:900; color:#144732; margin-bottom:16px;">
          🔄 परचेस & रीपरचेस इनकम
        </h2>
        
        <div style="background:#f7faf8; border:2px solid #b7e1cd; border-radius:18px; padding:16px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:21px; font-weight:900; color:#144732;">9. परचेस इनकम (Self)</div>
              <div style="font-size:15px; color:#555; font-weight:600;">स्वयं की व्यक्तिगत रीपरचेस पर</div>
            </div>
            <div class="badge-green" style="font-size:20px; font-weight:900;">10% BV</div>
          </div>
        </div>

        <div style="background:#fdfaf3; border:2px solid #f3d9a2; border-radius:18px; padding:16px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:21px; font-weight:900; color:#92580a;">10. रीपरचेस इनकम (Team)</div>
              <div style="font-size:15px; color:#555; font-weight:600;">पूरी टीम द्वारा की गई खरीदारी पर</div>
            </div>
            <div class="badge-gold" style="font-size:20px; font-weight:900;">10% Team</div>
          </div>
        </div>

        <p style="font-size:16.5px; line-height:1.5; color:#374151; font-weight:600;">
          चाय, तुलसी, मसाले, साबुन और अगरबत्ती हर महीने खत्म होते हैं और दोबारा खरीदे जाते हैं। हर रीपरचेस पर आजीवन 10% पैसिव इनकम प्राप्त होती है!
        </p>
      </div>

      <div style="background:#eaf5ed; padding:12px; border-radius:14px; font-size:16px; font-weight:800; color:#144732; text-align:center;">
        🛒 नो डिमोशन • बिज़नेस का लगातार एक्युमुलेशन
      </div>
    </div>

    <!-- Recharge Cashback Card -->
    <div class="card-white border-accent-gold" style="flex:1; padding:30px 30px; display:flex; flex-direction:column; justify-content:space-between; height:500px; border-radius:28px;">
      <div>
        <h2 style="font-size:26px; font-weight:900; color:#92580a; margin-bottom:16px;">
          📶 यूटिलिटी रिचार्ज कैशबैक
        </h2>

        <div style="background:#fdfaf3; border:2px solid #f3d9a2; border-radius:18px; padding:16px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:21px; font-weight:900; color:#92580a;">15. मोबाइल रिचार्ज</div>
              <div style="font-size:15px; color:#555; font-weight:600;">Jio, Airtel, Vi, BSNL आदि सभी नेटवर्क</div>
            </div>
            <div class="badge-gold" style="font-size:20px; font-weight:900;">2.50% फ्लैट</div>
          </div>
        </div>

        <div style="background:#f7faf8; border:2px solid #b7e1cd; border-radius:18px; padding:16px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:21px; font-weight:900; color:#144732;">16. डीटीएच (DTH) रिचार्ज</div>
              <div style="font-size:15px; color:#555; font-weight:600;">Tata Play, Dish TV, Airtel DTH आदि</div>
            </div>
            <div class="badge-green" style="font-size:20px; font-weight:900;">2.50% फ्लैट</div>
          </div>
        </div>

        <p style="font-size:16.5px; line-height:1.5; color:#374151; font-weight:600;">
          SGM Mart डिजिटल पोर्टल से जब भी आप या आपके ग्राहक अपना फोन या टीवी रिचार्ज करेंगे, तुरंत 2.50% कैशबैक सीधे आपके वॉलेट में जमा हो जाएगा।
        </p>
      </div>

      <div style="background:#fdf5e6; padding:12px; border-radius:14px; font-size:16px; font-weight:800; color:#92580a; text-align:center;">
        ⚡ 24×7 स्वचालित तुरंत कैशबैक क्रेडिट
      </div>
    </div>
  </div>

  {slide_footer(29)}
</div>
"""
slides_html.append(s29)

# ==============================================================================

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

  {slide_footer(32)}
</div>
"""
slides_html.append(s30_legal)

# SLIDE 31: TERMS & CONDITIONS (THE USER'S 3 KEY TERMS PROMINENTLY HIGHLIGHTED)
# ==============================================================================
s30 = f"""
<div class="slide">
  {slide_header("16.B", "नियम एवं शर्तें", "नियम व शर्तें (Terms & Conditions)", "System Rules, Weekly Withdrawal & Deductions", "100% पारदर्शी, सुरक्षित और समय पर भुगतान व्यवस्था", "Transparent, Safe and On-Time Banking Settlements")}
  
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

  {slide_footer(32)}
</div>
"""
slides_html.append(s30)

# ==============================================================================
# SLIDE 32: THANK YOU & CONTACT DETAILS
# ==============================================================================
s31 = f"""
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
      SGM MART ONLINE SERVICE PVT. LTD. • ALL RIGHTS RESERVED
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
slides_html.append(s31)

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
