import os
import base64
import subprocess
import fitz

def get_base64_img(filename):
    if not os.path.exists(filename):
        return ""
    ext = os.path.splitext(filename)[1].lower().replace(".", "")
    if ext == "jpg":
        ext = "jpeg"
    with open(filename, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    return f"data:image/{ext};base64,{data}"

img_tea = get_base64_img("1.jpeg")
img_tulsi = get_base64_img("2.jpeg")
img_facewash = get_base64_img("3.jpeg")
img_paste = get_base64_img("4.jpeg")
img_shampoo = get_base64_img("5.jpeg")
img_oil = get_base64_img("6.jpeg")
img_berries = get_base64_img("7.jpeg")
img_agarbatti_crop = get_base64_img("9_cropped.jpeg")
img_agarbatti_full = get_base64_img("10.jpeg")
img_logo = get_base64_img("sgm_logo.png")

TOTAL_PAGES = 25

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
  background-color: #555555;
  color: #2d3748;
  -webkit-font-smoothing: antialiased;
}

@page {
  size: 16in 9in;
  margin: 0;
}

.slide {
  width: 1536px;
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
  padding: 16px 48px 12px 48px;
  color: #ffffff;
  flex-shrink: 0;
}
.header-cat {
  font-size: 14.5px;
  font-weight: 800;
  letter-spacing: 2.2px;
  color: #d4a359;
  text-transform: uppercase;
  margin-bottom: 2px;
}
.header-title {
  font-size: 33px;
  font-weight: 900;
  letter-spacing: -0.3px;
  line-height: 1.25;
}

.slide-subheader {
  background-color: #eae5d8;
  padding: 10px 48px;
  font-size: 17px;
  font-weight: 700;
  color: #4a5568;
  border-bottom: 1.5px solid #d8d0bf;
  flex-shrink: 0;
}

.slide-body {
  flex: 1;
  padding: 24px 48px 14px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.slide-footer {
  padding: 0 48px 12px 48px;
  background-color: #f6f4ed;
  flex-shrink: 0;
}
.footer-line {
  height: 2.5px;
  background-color: #d4a359;
  width: 100%;
  margin-bottom: 8px;
}
.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #718096;
  font-weight: 600;
}
.footer-right {
  font-weight: 800;
  color: #144732;
  font-size: 15px;
}

/* Card Components */
.card-white {
  background: #ffffff;
  border-radius: 28px;
  box-shadow: 0 14px 32px rgba(0,0,0,0.06);
  border: 1px solid #e4dfd3;
  padding: 28px 32px;
  box-sizing: border-box;
}

.border-accent-green {
  border-left: 10px solid #144732 !important;
}

.border-accent-gold {
  border-left: 10px solid #d4a359 !important;
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
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 28px rgba(0,0,0,0.06);
  border: 1px solid #dcd7ca;
}
.bold-table th {
  background-color: #144732;
  color: #ffffff;
  padding: 15px 20px;
  font-weight: 800;
  font-size: 18px;
  text-align: center;
  border-right: 1px solid rgba(255,255,255,0.15);
}
.bold-table th:last-child {
  border-right: none;
}
.bold-table td {
  padding: 14px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e7ede9;
  border-right: 1px solid #e7ede9;
  text-align: center;
  font-weight: 700;
  font-size: 18px;
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
  padding: 4px 12px;
  font-size: 16px;
}
"""

slides_html = []

# ==============================================================================
# SLIDE 1: COVER SLIDE
# ==============================================================================
s1 = f"""
<div class="slide" style="flex-direction:row; background-color:#144732; padding:44px 56px;">
  <!-- Left Side -->
  <div style="flex:1.15; display:flex; flex-direction:column; justify-content:space-between; padding-right:48px;">
    <div>
      <div style="display:flex; align-items:center; gap:18px;">
        <img src="{img_logo}" style="width:72px; height:72px; background:#fff; border-radius:50%; padding:4px;" />
        <div>
          <div style="font-size:36px; font-weight:900; color:#fff; letter-spacing:0.5px;">SGM MART</div>
          <div style="font-size:16px; font-weight:700; color:#d4a359; letter-spacing:2px;">ONLINE SERVICE PVT. LTD.</div>
        </div>
      </div>
      <div style="height:3px; background:#d4a359; width:100%; margin:24px 0;"></div>
      
      <div style="font-size:16px; font-weight:800; color:#d4a359; letter-spacing:2.5px; text-transform:uppercase; margin-bottom:8px;">
        BUSINESS OVERVIEW & MLM PLAN | व्यापार योजना
      </div>
      
      <h1 style="font-size:46px; font-weight:900; color:#ffffff; line-height:1.2; margin-bottom:10px;">
        उत्पादों के साथ व्यापार का अवसर
      </h1>
      <div style="font-size:26px; font-weight:700; color:#a3e635; margin-bottom:20px;">
        Unlimited Growth with Quality Daily Products
      </div>
      
      <p style="font-size:20px; color:#e2e8f0; line-height:1.5; margin-bottom:24px; font-weight:500;">
        मार्केट रेट पर ऑल मार्केट के ब्रांडेड उत्पाद • 0% इन्वेस्टमेंट रिस्क-फ्री महा-प्लान • घर बैठे असीमित आमदनी
      </p>

      <!-- Slogan Box -->
      <div style="background:rgba(212, 163, 89, 0.15); border-left:8px solid #d4a359; border-radius:18px; padding:18px 24px; margin-bottom:24px;">
        <div style="font-size:26px; font-weight:900; color:#fef08a;">
          “बेरोजगारी और रोग मुक्त हो भारत हमारा”
        </div>
        <div style="font-size:16px; color:#e2e8f0; font-weight:600; margin-top:4px;">
          Disease-Free & Unemployment-Free India Mission
        </div>
      </div>

      <!-- Quick Badges -->
      <div style="display:flex; flex-wrap:wrap; gap:12px;">
        <span style="background:rgba(255,255,255,0.12); color:#fff; font-size:16px; font-weight:700; padding:8px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.25);">
          🛍️ मार्केट रेट प्रोडक्ट्स
        </span>
        <span style="background:rgba(255,255,255,0.12); color:#fff; font-size:16px; font-weight:700; padding:8px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.25);">
          💎 0% इन्वेस्टमेंट
        </span>
        <span style="background:rgba(255,255,255,0.12); color:#fff; font-size:16px; font-weight:700; padding:8px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.25);">
          ⚡ वर्किंग + ऑटोपूल
        </span>
        <span style="background:rgba(255,255,255,0.12); color:#fff; font-size:16px; font-weight:700; padding:8px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.25);">
          💰 डेली क्लोजिंग / वीकली पेआउट
        </span>
      </div>
    </div>

    <!-- Contact line bottom -->
    <div style="border-top:1px solid rgba(255,255,255,0.2); padding-top:16px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:18px; color:#fef08a; font-weight:800;">
        🌐 www.sadgurumart.com
      </div>
      <div style="font-size:17px; color:#ffffff; font-weight:700;">
        📞 6267392508 &nbsp;|&nbsp; 💬 7611148925
      </div>
    </div>
  </div>

  <!-- Right Side Product Card -->
  <div style="flex:0.85; display:flex; justify-content:center; align-items:center;">
    <div style="background:#ffffff; border-radius:32px; padding:16px; box-shadow:0 20px 45px rgba(0,0,0,0.3); border:4px solid #d4a359; max-width:480px; width:100%;">
      <img src="{img_tea}" style="width:100%; height:690px; object-fit:cover; border-radius:24px; display:block;" />
    </div>
  </div>
</div>
"""
slides_html.append(s1)

# ==============================================================================
# SLIDE 2: COMPANY OVERVIEW & IDENTITY
# ==============================================================================
s2 = f"""
<div class="slide">
  {slide_header("01", "कंपनी परिचय", "SGM MART का परिचय", "Company Overview & Mission", "उत्पाद-केंद्रित व्यापार और ग्राहक भरोसे पर आधारित राष्ट्रीय पहल", "Product-Centric Business & Customer-First Foundation")}
  
  <div class="slide-body" style="flex-direction:row; gap:40px; align-items:center;">
    <!-- Left column text -->
    <div style="flex:1.15; display:flex; flex-direction:column; gap:24px;">
      <div class="card-white border-accent-green" style="padding:28px 36px;">
        <h2 style="font-size:32px; font-weight:900; color:#144732; margin-bottom:12px;">SGM MART Online Service</h2>
        <p style="font-size:21px; line-height:1.6; color:#2d3748; font-weight:600; margin-bottom:12px;">
          SGM MART का उद्देश्य दैनिक उपयोग, किचन, हेल्थकेयर, पर्सनल केयर, होम केयर और अन्य श्रेणियों के उपयोगी उत्पादों को ग्राहकों तक स्पष्ट कीमत और सही जानकारी के साथ पहुँचाना है।
        </p>
        <p style="font-size:18px; line-height:1.5; color:#555; font-weight:500;">
          Our mission is to deliver branded, daily-use, and healthcare products directly to consumers at honest market prices with a 100% risk-free home-based earning platform.
        </p>
      </div>

      <div class="card-white border-accent-gold" style="padding:26px 36px;">
        <h3 style="font-size:24px; font-weight:800; color:#92580a; margin-bottom:14px;">
          हमारा मुख्य फोकस | Strategic Focus Areas
        </h3>
        <div style="display:flex; flex-direction:column; gap:12px; font-size:19px; font-weight:700; color:#2d3748;">
          <div>✅ <strong>उत्पाद की गुणवत्ता व सही जानकारी:</strong> Genuine quality, transparent pricing, and comprehensive product information.</div>
          <div>✅ <strong>0% इन्वेस्टमेंट रिस्क:</strong> Zero capital risk — start immediately with daily household needs.</div>
          <div>✅ <strong>वर्किंग एवं नॉन-वर्किंग प्लान:</strong> Dual-earning ecosystem for active leaders and consumers alike.</div>
          <div>✅ <strong>पारदर्शी बिलिंग और नियमित पेआउट:</strong> Daily closing and weekly direct bank withdrawals.</div>
        </div>
      </div>
    </div>

    <!-- Right Column Photo -->
    <div style="flex:0.85; display:flex; justify-content:center;">
      <div class="card-white" style="padding:14px; border-radius:32px; width:100%; max-width:460px;">
        <img src="{img_tea}" style="width:100%; height:550px; object-fit:cover; border-radius:24px; display:block;" />
      </div>
    </div>
  </div>

  {slide_footer(2)}
</div>
"""
slides_html.append(s2)

# ==============================================================================
# SLIDE 3: VISION & MISSION
# ==============================================================================
s3 = f"""
<div class="slide">
  {slide_header("02", "दिशा एवं लक्ष्य", "हमारा विज़न और मिशन", "Our Vision & Mission", "दीर्घकालीन भरोसा - गुणवत्ता - जिम्मेदार व्यापार", "Long-Term Trust, Quality & Responsible Direct Selling")}
  
  <div class="slide-body" style="flex-direction:column; gap:26px; justify-content:center;">
    <div style="display:flex; gap:36px; height:470px;">
      <!-- Vision Card -->
      <div class="card-white border-accent-green" style="flex:1; display:flex; flex-direction:column; justify-content:space-between; padding:36px 40px; border-radius:36px;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
            <h2 style="font-size:36px; font-weight:900; color:#144732;">VISION | विज़न</h2>
            <span class="badge-green" style="font-size:18px;">भविष्य दृष्टि</span>
          </div>
          <div style="font-size:24px; font-weight:800; color:#144732; margin-bottom:20px; line-height:1.4;">
            भारत के अधिक से अधिक परिवारों तक उपयोगी उत्पाद उचित मूल्य और विश्वसनीय सेवा के साथ पहुँचाना।
          </div>
          <div style="display:flex; flex-direction:column; gap:16px; font-size:20px; color:#374151; font-weight:600; line-height:1.5;">
            <div>• स्थानीय स्तर पर उत्पाद-आधारित स्वरोजगार और जिम्मेदार रिटेलिंग को बढ़ावा देना।</div>
            <div>• To empower Indian youth and homemakers with dignified, home-based self-employment.</div>
            <div>• प्रत्येक घर में शुद्ध, मिलावट-रहित और प्राकृतिक जीवनशैली का प्रचार-प्रसार करना।</div>
          </div>
        </div>
        <div style="background:#eaf5ed; padding:14px 20px; border-radius:16px; font-size:18px; font-weight:800; color:#144732;">
          🌱 दीर्घकालीन संकल्प: स्वस्थ समाज, समृद्ध परिवार और सशक्त आत्मनिर्भर भारत।
        </div>
      </div>

      <!-- Mission Card -->
      <div class="card-white border-accent-gold" style="flex:1; display:flex; flex-direction:column; justify-content:space-between; padding:36px 40px; border-radius:36px;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
            <h2 style="font-size:36px; font-weight:900; color:#92580a;">MISSION | मिशन</h2>
            <span class="badge-gold" style="font-size:18px;">कार्यवाई लक्ष्य</span>
          </div>
          <div style="font-size:24px; font-weight:800; color:#92580a; margin-bottom:20px; line-height:1.4;">
            ग्राहकों को स्पष्ट product information, सही कीमत और बेहतर सहायता प्रदान करना।
          </div>
          <div style="display:flex; flex-direction:column; gap:16px; font-size:20px; color:#374151; font-weight:600; line-height:1.5;">
            <div>• हर बिक्री का पक्का रिकॉर्ड रखना, पार्टनर्स को पारदर्शी प्रोत्साहन प्रदान करना।</div>
            <div>• To build an honest direct-selling ecosystem driven by genuine consumer demand.</div>
            <div>• 0% इन्वेस्टमेंट के साथ हर नागरिक को असीमित आय अर्जित करने का सुरक्षित अवसर देना।</div>
          </div>
        </div>
        <div style="background:#fdf5e6; padding:14px 20px; border-radius:16px; font-size:18px; font-weight:800; color:#92580a;">
          ⚖️ हमारा नियम: पहले ग्राहक, फिर उत्पाद, और हमेशा पारदर्शिता।
        </div>
      </div>
    </div>

    <!-- Bottom Mission Banner -->
    <div style="background:#144732; color:#ffffff; border-radius:20px; padding:16px 36px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:24px; font-weight:900; color:#fef08a;">
        “S G M Mart का एक ही नारा — बेरोजगारी और रोग मुक्त हो भारत हमारा”
      </div>
      <div style="font-size:18px; font-weight:700; color:#e2e8f0;">
        A Mission for a Healthy, Prosperous & Self-Reliant India
      </div>
    </div>
  </div>

  {slide_footer(3)}
</div>
"""
slides_html.append(s3)

# ==============================================================================
# SLIDE 4: 9 PRODUCT CATEGORIES
# ==============================================================================
categories_data = [
    ("01", "हेल्थ केयर", "Health Care", "तुलसी ड्रॉप्स, बेरी जूस, वेलनेस सप्लीमेंट्स"),
    ("02", "होम केयर", "Home Care", "प्रीमियम अगरबत्ती, धूप, होम एसेंशियल्स"),
    ("03", "किचन केयर", "Kitchen Care", "शाही इलायची चाय, अमृततुल्य चाय व रसोई उत्पाद"),
    ("04", "पर्सनल केयर", "Personal Care", "दंत बुट्टी हर्बल पेस्ट, 21 हर्ब्स हेयर ऑयल"),
    ("05", "ब्यूटी केयर", "Beauty Care", "केसर फेस वॉश, अनियन शैम्पू, 7-इन-1 फेस क्रीम"),
    ("06", "कपड़े", "Apparel & Garments", "दैनिक व फैशनेबल परिधान संग्रह"),
    ("07", "ज्वेलरी", "Fashion Jewellery", "आधुनिक व पारंपरिक डिजाइनर आभूषण"),
    ("08", "एग्रीकल्चर", "Agriculture Care", "जैविक खाद, पौध पोषण एवं फसल सुरक्षा उत्पाद"),
    ("09", "इलेक्ट्रॉनिक्स", "Smart Electronics", "स्मार्ट गैजेट्स, मोबाइल एक्सेसरीज व अप्लायंसेज")
]

cat_boxes = ""
for num, hi, en, desc in categories_data:
    cat_boxes += f"""
    <div class="card-white" style="padding:22px 24px; border-radius:24px; display:flex; align-items:center; gap:20px; border-left:8px solid #144732;">
      <div class="num-badge" style="font-size:22px; padding:8px 16px; border-radius:12px;">{num}</div>
      <div style="flex:1;">
        <div style="font-size:23px; font-weight:900; color:#144732;">{hi} <span style="font-size:18px; font-weight:600; color:#4a5568;">| {en}</span></div>
        <div style="font-size:16px; font-weight:600; color:#718096; margin-top:4px;">{desc}</div>
      </div>
    </div>
"""

s4 = f"""
<div class="slide">
  {slide_header("03", "उत्पाद श्रेणियाँ", "एक ही प्लेटफ़ॉर्म पर 9 प्रमुख कैटेगरी", "9 Comprehensive Product Segments", "मार्केट रेट में ऑल मार्केट के ब्रांडेड प्रोडक्ट्स", "Branded Products for Daily Life at Market Competitive Prices")}
  
  <div class="slide-body" style="justify-content:center;">
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:22px;">
      {cat_boxes}
    </div>
    
    <div style="margin-top:24px; text-align:center; font-size:17px; font-weight:700; color:#4a5568;">
      💡 <em>नोट: सभी श्रेणियों के विस्तृत SKU, पैक साइज और कीमतें आधिकारिक पोर्टल <span style="color:#144732; font-weight:900;">www.sadgurumart.com</span> पर उपलब्ध हैं।</em>
    </div>
  </div>

  {slide_footer(4)}
</div>
"""
slides_html.append(s4)

# ==============================================================================
# SLIDE 5: PREMIUM TEA & KITCHEN CARE
# ==============================================================================
s5 = f"""
<div class="slide">
  {slide_header("04", "किचन केयर उत्पाद", "प्रीमियम चाय उत्पाद श्रृंखला", "Premium Tea & Kitchen Care Range", "असम की चुनिंदा पत्तियों और प्राकृतिक इलायची का शाही स्वाद", "Select Assam Tea Leaves Infused with Pure Cardamom")}
  
  <div class="slide-body" style="flex-direction:row; gap:40px; align-items:center;">
    <!-- Left: Big Photo -->
    <div style="flex:0.9; display:flex; justify-content:center;">
      <div class="card-white" style="padding:14px; border-radius:32px; max-width:440px; width:100%;">
        <img src="{img_tea}" style="width:100%; height:550px; object-fit:cover; border-radius:24px; display:block;" />
      </div>
    </div>

    <!-- Right: Product Info Cards -->
    <div style="flex:1.1; display:flex; flex-direction:column; gap:24px;">
      <!-- Card 1: Shahi Elaichi Chai -->
      <div class="card-white border-accent-green" style="padding:28px 32px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h2 style="font-size:28px; font-weight:900; color:#144732;">शाही इलायची चाय | Shahi Elaichi Chai</h2>
          <span class="badge-green">बेस्ट सेलर</span>
        </div>
        <p style="font-size:19px; color:#4a5568; font-weight:600; line-height:1.5; margin-bottom:18px;">
          असम के प्रीमियम चाय बागानों की कड़क दानेदार चाय और असली हरी इलायची की मनमोहक खुशबू। स्वाद, ताजगी और ऊर्जा का बेमिसाल संगम।
        </p>
        <div style="display:flex; gap:16px;">
          <div style="background:#f7faf8; border:1.5px solid #b7e1cd; border-radius:14px; padding:12px 20px; flex:1;">
            <div style="font-size:16px; font-weight:700; color:#555;">500 ग्राम पैक</div>
            <div style="font-size:24px; font-weight:900; color:#144732;">₹ 349 /- <span style="font-size:16px; color:#d4a359;">(150 PV)</span></div>
          </div>
          <div style="background:#f7faf8; border:1.5px solid #b7e1cd; border-radius:14px; padding:12px 20px; flex:1;">
            <div style="font-size:16px; font-weight:700; color:#555;">1 किलोग्राम पैक</div>
            <div style="font-size:24px; font-weight:900; color:#144732;">₹ 649 /- <span style="font-size:16px; color:#d4a359;">(300 PV)</span></div>
          </div>
        </div>
      </div>

      <!-- Card 2: Amruttulya Chai -->
      <div class="card-white border-accent-gold" style="padding:28px 32px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h2 style="font-size:28px; font-weight:900; color:#92580a;">अमृत तुल्य चाय | Amruttulya Special Tea</h2>
          <span class="badge-gold">पारंपरिक स्वाद</span>
        </div>
        <p style="font-size:19px; color:#4a5568; font-weight:600; line-height:1.5; margin-bottom:18px;">
          पारंपरिक भारतीय मसालों और जड़ी-बूटियों के साथ तैयार अमृत तुल्य चाय। हर घूंट में ताजगी, रोग-प्रतिरोधक क्षमता और अनोखा स्वाद।
        </p>
        <div style="display:flex; gap:16px;">
          <div style="background:#fdfaf3; border:1.5px solid #f3d9a2; border-radius:14px; padding:12px 20px; flex:1;">
            <div style="font-size:16px; font-weight:700; color:#555;">500 ग्राम पैक</div>
            <div style="font-size:24px; font-weight:900; color:#92580a;">₹ 349 /- <span style="font-size:16px; color:#144732;">(150 PV)</span></div>
          </div>
          <div style="background:#fdfaf3; border:1.5px solid #f3d9a2; border-radius:14px; padding:12px 20px; flex:1;">
            <div style="font-size:16px; font-weight:700; color:#555;">1 किलोग्राम पैक</div>
            <div style="font-size:24px; font-weight:900; color:#92580a;">₹ 699 /- <span style="font-size:16px; color:#144732;">(300 PV)</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {slide_footer(5)}
</div>
"""
slides_html.append(s5)

# ==============================================================================
# SLIDE 6: WELLNESS & IMMUNITY PRODUCTS
# ==============================================================================
s6 = f"""
<div class="slide">
  {slide_header("05", "हेल्थ केयर उत्पाद", "वेलनेस एवं इम्युनिटी बूस्टर उत्पाद", "Immunity & Wellness Healthcare Range", "आयुर्वेदिक जड़ी-बूटियों का प्राकृतिक संगम - रोगमुक्त जीवन का आधार", "Natural Ayurvedic Formulas for Robust Daily Health")}
  
  <div class="slide-body" style="flex-direction:row; gap:40px; justify-content:center; align-items:center;">
    <!-- Product 1: Tulsi Drops -->
    <div class="card-white border-accent-green" style="flex:1; padding:28px 32px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:32px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h2 style="font-size:28px; font-weight:900; color:#144732;">पंच तुलसी ड्रॉप्स | Tulsi Drops</h2>
          <span class="badge-green">100 PV</span>
        </div>
        <div style="display:flex; gap:20px; margin-bottom:18px; align-items:center;">
          <div style="background:#f7faf8; border-radius:18px; padding:10px; border:1px solid #dcd7ca;">
            <img src="{img_tulsi}" style="height:210px; width:150px; object-fit:contain; border-radius:12px;" />
          </div>
          <div style="flex:1; font-size:18px; color:#374151; font-weight:600; line-height:1.5;">
            <div>• <strong>मात्रा:</strong> 30 ml लिक्विड</div>
            <div>• <strong>घटक:</strong> 5 प्रकार की दुर्लभ तुलसी का अर्क (श्याम, राम, श्वेत, वन, नींबू)</div>
            <div>• <strong>लाभ:</strong> सर्दी, जुकाम, फ्लू व एलर्जी से प्राकृतिक सुरक्षा। रक्त शोधन में सहायक।</div>
          </div>
        </div>
      </div>
      <div style="background:#eaf5ed; border:1.5px solid #144732; border-radius:18px; padding:16px 24px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:15px; font-weight:700; color:#555;">एक्टिवेशन मूल्य | Joining Price</div>
          <div style="font-size:32px; font-weight:900; color:#144732;">₹ 150 /- मात्र</div>
        </div>
        <div class="badge-gold" style="font-size:18px;">PV: 100</div>
      </div>
    </div>

    <!-- Product 2: Mix Berries Juice -->
    <div class="card-white border-accent-gold" style="flex:1; padding:28px 32px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:32px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h2 style="font-size:28px; font-weight:900; color:#92580a;">मिक्स बेरी जूस | Mix Berries Juice</h2>
          <span class="badge-gold">500 PV</span>
        </div>
        <div style="display:flex; gap:20px; margin-bottom:18px; align-items:center;">
          <div style="background:#fdfaf3; border-radius:18px; padding:10px; border:1px solid #dcd7ca;">
            <img src="{img_berries}" style="height:210px; width:150px; object-fit:contain; border-radius:12px;" />
          </div>
          <div style="flex:1; font-size:18px; color:#374151; font-weight:600; line-height:1.5;">
            <div>• <strong>मात्रा:</strong> 500 ml प्रीमियम सिरप</div>
            <div>• <strong>घटक:</strong> 52 शक्तिशाली प्राकृतिक जड़ी-बूटियों और एंटीऑक्सीडेंट बेरीज का अर्क</div>
            <div>• <strong>लाभ:</strong> ऊर्जा, स्टैमिना और सम्पूर्ण रोग-प्रतिरोधक क्षमता (Immunity) को बढ़ावा।</div>
          </div>
        </div>
      </div>
      <div style="background:#fdf5e6; border:1.5px solid #92580a; border-radius:18px; padding:16px 24px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:15px; font-weight:700; color:#555;">एक्टिवेशन मूल्य | Joining Price</div>
          <div style="font-size:32px; font-weight:900; color:#92580a;">₹ 750 /- मात्र</div>
        </div>
        <div class="badge-green" style="font-size:18px;">PV: 500</div>
      </div>
    </div>
  </div>

  {slide_footer(6)}
</div>
"""
slides_html.append(s6)

# ==============================================================================
# SLIDE 7: PERSONAL CARE & BEAUTY (FACE WASH & TOOTHPASTE)
# ==============================================================================
s7 = f"""
<div class="slide">
  {slide_header("06", "पर्सनल केयर उत्पाद", "दैनिक सौंदर्य एवं ओरल केयर", "Daily Personal Care & Oral Hygiene Range", "100% प्राकृतिक तत्व - दैनिक उपयोग में अद्वितीय सुरक्षा व ताजगी", "Natural Daily Essentials for Skin Radiance & Dental Protection")}
  
  <div class="slide-body" style="flex-direction:row; gap:40px; justify-content:center; align-items:center;">
    <!-- Saffron Face Wash -->
    <div class="card-white border-accent-green" style="flex:1; padding:28px 32px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:32px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h2 style="font-size:27px; font-weight:900; color:#144732;">कश्मीरी केसर फेस वॉश | Face Wash</h2>
          <span class="badge-green">ब्यूटी केयर</span>
        </div>
        <div style="display:flex; gap:20px; margin-bottom:18px; align-items:center;">
          <div style="background:#f7faf8; border-radius:18px; padding:10px; border:1px solid #dcd7ca;">
            <img src="{img_facewash}" style="height:210px; width:150px; object-fit:contain; border-radius:12px;" />
          </div>
          <div style="flex:1; font-size:18px; color:#374151; font-weight:600; line-height:1.5;">
            <div>• <strong>पैक:</strong> 200 ml बॉटल</div>
            <div>• <strong>तत्व:</strong> कश्मीरी केसर, नीम, एलोवेरा, हल्दी व टी ट्री ऑयल।</div>
            <div>• <strong>लाभ:</strong> चेहरे की गहरी सफाई, मुंहासों से मुक्ति, प्राकृतिक निखार व ताजगी।</div>
          </div>
        </div>
      </div>
      <div style="background:#eaf5ed; border:1.5px solid #144732; border-radius:18px; padding:16px 24px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:15px; font-weight:700; color:#555;">अधिकतम खुदरा मूल्य (MRP)</div>
          <div style="font-size:32px; font-weight:900; color:#144732;">₹ 280 /-</div>
        </div>
        <div class="badge-gold" style="font-size:17px;">नेचुरल ग्लो फॉर्मूला</div>
      </div>
    </div>

    <!-- Dant Butti Herbal Toothpaste -->
    <div class="card-white border-accent-gold" style="flex:1; padding:28px 32px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:32px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h2 style="font-size:27px; font-weight:900; color:#92580a;">दंत बुट्टी हर्बल पेस्ट | Toothpaste</h2>
          <span class="badge-gold">डेंटल केयर</span>
        </div>
        <div style="display:flex; gap:20px; margin-bottom:18px; align-items:center;">
          <div style="background:#fdfaf3; border-radius:18px; padding:10px; border:1px solid #dcd7ca;">
            <img src="{img_paste}" style="height:210px; width:150px; object-fit:contain; border-radius:12px;" />
          </div>
          <div style="flex:1; font-size:18px; color:#374151; font-weight:600; line-height:1.5;">
            <div>• <strong>पैक:</strong> 100 ग्राम पैक</div>
            <div>• <strong>तत्व:</strong> 11 दुर्लभ आयुर्वेदिक जड़ी-बूटियों का जादुई मिश्रण।</div>
            <div>• <strong>लाभ:</strong> मसूड़ों की मजबूती, दांत दर्द व पायरिया से सुरक्षा, दिनभर सांसों की ताजगी।</div>
          </div>
        </div>
      </div>
      <div style="background:#fdf5e6; border:1.5px solid #92580a; border-radius:18px; padding:16px 24px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:15px; font-weight:700; color:#555;">अधिकतम खुदरा मूल्य (MRP)</div>
          <div style="font-size:32px; font-weight:900; color:#92580a;">₹ 95 /- मात्र</div>
        </div>
        <div class="badge-green" style="font-size:17px;">100% शाकाहारी</div>
      </div>
    </div>
  </div>

  {slide_footer(7)}
</div>
"""
slides_html.append(s7)

# ==============================================================================
# SLIDE 8: HAIR CARE & SKIN SPECIALS
# ==============================================================================
s8 = f"""
<div class="slide">
  {slide_header("07", "हेयर केयर उत्पाद", "प्रीमियम हेयर केयर एवं त्वचा पोषण", "Premium Hair Care & Skin Nourishment Range", "बालों का झड़ना रोके, जड़ों को मजबूत बनाए एवं स्वाभाविक चमक दे", "Root Strengthening & Complete Follicle Nourishment")}
  
  <div class="slide-body" style="flex-direction:row; gap:40px; justify-content:center; align-items:center;">
    <!-- Onion & Ginger Shampoo -->
    <div class="card-white border-accent-green" style="flex:1; padding:28px 32px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:32px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h2 style="font-size:26px; font-weight:900; color:#144732;">अनियन & जिंजर शैम्पू | Shampoo</h2>
          <span class="badge-green">+30 ml Free</span>
        </div>
        <div style="display:flex; gap:20px; margin-bottom:18px; align-items:center;">
          <div style="background:#f7faf8; border-radius:18px; padding:10px; border:1px solid #dcd7ca;">
            <img src="{img_shampoo}" style="height:210px; width:150px; object-fit:contain; border-radius:12px;" />
          </div>
          <div style="flex:1; font-size:18px; color:#374151; font-weight:600; line-height:1.5;">
            <div>• <strong>पैक:</strong> 300 ml + 30 ml फ्री = 330 ml</div>
            <div>• <strong>तत्व:</strong> लाल प्याज, अदरक अर्क एवं कंडीशनिंग हर्ब्स।</div>
            <div>• <strong>लाभ:</strong> हेयर फॉल कंट्रोल, डैंड्रफ मुक्ति, बालों की तेज ग्रोथ व मजबूती।</div>
          </div>
        </div>
      </div>
      <div style="background:#eaf5ed; border:1.5px solid #144732; border-radius:18px; padding:16px 24px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:15px; font-weight:700; color:#555;">अधिकतम खुदरा मूल्य (MRP)</div>
          <div style="font-size:32px; font-weight:900; color:#144732;">₹ 399 /-</div>
        </div>
        <div class="badge-gold" style="font-size:17px;">सल्फेट व पैराबेन फ्री</div>
      </div>
    </div>

    <!-- 21 Herbs Hair Oil -->
    <div class="card-white border-accent-gold" style="flex:1; padding:28px 32px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:32px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
          <h2 style="font-size:26px; font-weight:900; color:#92580a;">21 हर्ब्स हेयर ऑयल | Hair Oil</h2>
          <span class="badge-gold">+10 ml Free</span>
        </div>
        <div style="display:flex; gap:20px; margin-bottom:18px; align-items:center;">
          <div style="background:#fdfaf3; border-radius:18px; padding:10px; border:1px solid #dcd7ca;">
            <img src="{img_oil}" style="height:210px; width:150px; object-fit:contain; border-radius:12px;" />
          </div>
          <div style="flex:1; font-size:18px; color:#374151; font-weight:600; line-height:1.5;">
            <div>• <strong>पैक:</strong> 200 ml + 10 ml फ्री = 210 ml</div>
            <div>• <strong>तत्व:</strong> भृंगराज, ब्राह्मी, आंवला, शिकाकाई व 21 जड़ी-बूटियां।</div>
            <div>• <strong>लाभ:</strong> बालों को जड़ों से पोषण, घने व चमकदार बाल, मानसिक शांति।</div>
          </div>
        </div>
      </div>
      <div style="background:#fdf5e6; border:1.5px solid #92580a; border-radius:18px; padding:16px 24px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:15px; font-weight:700; color:#555;">अधिकतम खुदरा मूल्य (MRP)</div>
          <div style="font-size:32px; font-weight:900; color:#92580a;">₹ 499 /-</div>
        </div>
        <div class="badge-green" style="font-size:17px;">प्योर हर्बल एक्सट्रैक्ट</div>
      </div>
    </div>
  </div>

  {slide_footer(8)}
</div>
"""
slides_html.append(s8)

# ==============================================================================
# SLIDE 9: HOME CARE & AGARBATTI
# ==============================================================================
s9 = f"""
<div class="slide">
  {slide_header("08", "होम केयर उत्पाद", "सुगंधित अगरबत्ती एवं पूजा सामग्री", "Fragrant Incense Sticks & Spiritual Home Care", "गुलाब, मोगरा और चंदन की मनमोहक सुगंध - घर और मंदिर में शांति का वास", "Divine Rose, Mogra & Sandalwood Fragrances for Sacred Atmosphere")}
  
  <div class="slide-body" style="flex-direction:row; gap:40px; justify-content:center; align-items:center;">
    <!-- Agarbatti Pack -->
    <div class="card-white border-accent-green" style="flex:1.1; padding:32px 36px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:32px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <h2 style="font-size:30px; font-weight:900; color:#144732;">प्रीमियम सुगंधित अगरबत्ती | Incense Sticks</h2>
          <span class="badge-green">होम केयर</span>
        </div>
        <p style="font-size:20px; line-height:1.6; color:#2d3748; font-weight:600; margin-bottom:20px;">
          शुद्ध प्राकृतिक तेलों एवं चारकोल-मुक्त मिश्रण से तैयार अगरबत्तियां। घर, दुकान और मंदिर के वातावरण को पवित्र, शांत और सकारात्मक ऊर्जा से भर देती हैं।
        </p>
        <div style="display:flex; flex-direction:column; gap:14px; font-size:19px; font-weight:700; color:#374151;">
          <div>🌹 <strong>गुलाब (Rose):</strong> मनमोहक व चित्त को प्रसन्न करने वाली सौम्य खुशबू।</div>
          <div>🌼 <strong>मोगरा (Mogra):</strong> ताजगी भरी प्राकृतिक पुष्प सुगंध।</div>
          <div>🪵 <strong>चंदन (Chandan):</strong> आध्यात्मिक शांति और एकाग्रता बढ़ाने वाला चंदन अर्क।</div>
        </div>
      </div>
      
      <div style="background:#eaf5ed; border:1.5px solid #144732; border-radius:18px; padding:16px 24px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:15px; font-weight:700; color:#555;">उपलब्ध वेरिएंट्स पैक मूल्य</div>
          <div style="font-size:30px; font-weight:900; color:#144732;">MRP: ₹ 80 – ₹ 90 /-</div>
        </div>
        <div class="badge-gold" style="font-size:17px;">100% प्राकृतिक सुगंध</div>
      </div>
    </div>

    <!-- Right: Agarbatti Photo -->
    <div style="flex:0.9; display:flex; justify-content:center;">
      <div class="card-white" style="padding:14px; border-radius:32px; width:100%; max-width:440px;">
        <img src="{img_agarbatti_crop}" style="width:100%; height:530px; object-fit:cover; border-radius:24px; display:block;" />
      </div>
    </div>
  </div>

  {slide_footer(9)}
</div>
"""
slides_html.append(s9)

# ==============================================================================
# SLIDE 10: ACTIVATION PACKAGES
# ==============================================================================
s10 = f"""
<div class="slide">
  {slide_header("09", "एक्टीवेशन पैकेज", "बिजनेस शुरुआत पैकेज एवं PV विवरण", "Transparent Joining Packages & Business PV", "सुलभ शुरुआत मात्र ₹150 से - हर परिवार की पसंद के अनुकूल उपयोगी उत्पाद", "Accessible Starting from Just ₹150 with Full Product Value")}
  
  <div class="slide-body" style="justify-content:center;">
    <table class="bold-table">
      <thead>
        <tr>
          <th style="width:10%;">क्र. सं.</th>
          <th style="width:25%;">पैकेज मूल्य (Package Price)</th>
          <th style="width:20%;">बिजनेस पॉइंट (PV)</th>
          <th style="width:45%; text-align:left; padding-left:30px;">उत्पाद विवरण (Product Details)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="num-badge">01</span></td>
          <td style="font-size:22px; font-weight:900; color:#144732;">₹ 349 /-</td>
          <td><span class="badge-green" style="font-size:18px;">150 PV</span></td>
          <td style="text-align:left; padding-left:30px; font-size:20px; font-weight:800;">☕ इलायची चाय (500 gm)</td>
        </tr>
        <tr>
          <td><span class="num-badge">02</span></td>
          <td style="font-size:22px; font-weight:900; color:#144732;">₹ 649 /-</td>
          <td><span class="badge-green" style="font-size:18px;">300 PV</span></td>
          <td style="text-align:left; padding-left:30px; font-size:20px; font-weight:800;">☕ इलायची चाय (1 Kg)</td>
        </tr>
        <tr>
          <td><span class="num-badge">03</span></td>
          <td style="font-size:22px; font-weight:900; color:#144732;">₹ 349 /-</td>
          <td><span class="badge-green" style="font-size:18px;">150 PV</span></td>
          <td style="text-align:left; padding-left:30px; font-size:20px; font-weight:800;">🍃 अमृत तुल्य चाय (500 gm)</td>
        </tr>
        <tr>
          <td><span class="num-badge">04</span></td>
          <td style="font-size:22px; font-weight:900; color:#144732;">₹ 699 /-</td>
          <td><span class="badge-green" style="font-size:18px;">300 PV</span></td>
          <td style="text-align:left; padding-left:30px; font-size:20px; font-weight:800;">🍃 अमृत तुल्य चाय (1 Kg)</td>
        </tr>
        <tr>
          <td><span class="num-badge">05</span></td>
          <td style="font-size:22px; font-weight:900; color:#144732;">₹ 150 /-</td>
          <td><span class="badge-green" style="font-size:18px;">100 PV</span></td>
          <td style="text-align:left; padding-left:30px; font-size:20px; font-weight:800;">🌿 पंच तुलसी ड्रॉप्स (30 ml)</td>
        </tr>
        <tr>
          <td><span class="num-badge">06</span></td>
          <td style="font-size:22px; font-weight:900; color:#144732;">₹ 750 /-</td>
          <td><span class="badge-green" style="font-size:18px;">500 PV</span></td>
          <td style="text-align:left; padding-left:30px; font-size:20px; font-weight:800;">🍇 मिक्स बेरी जूस (500 ml)</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:24px; background:#ffffff; border-radius:20px; border-left:8px solid #d4a359; padding:16px 28px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 8px 20px rgba(0,0,0,0.04);">
      <div style="font-size:19px; font-weight:700; color:#2d3748;">
        ✅ <strong>नोट:</strong> किसी भी एक पैकेज के साथ आईडी एक्टिवेट कर सभी 16 प्रकार की आमदनी प्राप्त करने की पात्रता मिलती है।
      </div>
      <div class="badge-gold" style="font-size:17px;">100% प्रोडक्ट वैल्यू</div>
    </div>
  </div>

  {slide_footer(10)}
</div>
"""
slides_html.append(s10)

# ==============================================================================
# SLIDE 11: PRE-LAUNCHING MEGA OFFER
# ==============================================================================
s11 = f"""
<div class="slide">
  {slide_header("10", "धमाका ऑफर", "प्री-लॉन्चिंग स्पेशल बम्पर ऑफर", "Pre-Launching Special Booster Offer", "शुरुआती लीडर्स एवं तेज नेटवर्क निर्माताओं के लिए विशेष उपहार", "Limited-Time Special Privilege for Visionary Network Builders")}
  
  <div class="slide-body" style="align-items:center; justify-content:center;">
    <div class="card-white" style="width:100%; max-width:1200px; padding:44px 56px; border-radius:36px; border:3px dashed #d4a359; background:linear-gradient(180deg, #ffffff 0%, #fffdf8 100%); text-align:center; box-shadow:0 18px 45px rgba(212,163,89,0.15);">
      
      <div style="font-size:32px; margin-bottom:12px;">🔥 🌹 🔥</div>
      
      <div class="badge-gold" style="font-size:20px; padding:8px 24px; border-radius:30px; margin-bottom:20px;">
        सीमित समय हेतु विशेष महा-अवसर | LIMITED TIME SPECIAL PROMOTION
      </div>

      <h1 style="font-size:48px; font-weight:900; color:#92580a; margin-bottom:18px;">
        प्री-लॉन्चिंग स्पेशल ऑफर | Pre-Launching Offer
      </h1>

      <div style="background:#144732; color:#ffffff; border-radius:28px; padding:30px 40px; margin:24px 0; box-shadow:0 12px 30px rgba(20,71,50,0.25);">
        <div style="font-size:28px; font-weight:700; color:#e2e8f0; margin-bottom:8px;">
          मात्र <span style="color:#fef08a; font-size:38px; font-weight:900;">600 PV</span> का डायरेक्ट बिजनेस करने पर
        </div>
        <div style="font-size:46px; font-weight:900; color:#fef08a; letter-spacing:0.5px;">
          👉 1 ID बिल्कुल FREE एक्टिवेशन! 👈
        </div>
        <div style="font-size:20px; color:#cbd5e1; font-weight:600; margin-top:8px;">
          Get 1 Direct ID Free Activation on 600 Direct PV Achievement
        </div>
      </div>

      <div style="display:flex; justify-content:center; gap:36px; margin-top:28px;">
        <div style="background:#f7faf8; border:1.5px solid #b7e1cd; border-radius:18px; padding:16px 28px; font-size:20px; font-weight:800; color:#144732;">
          ⚡ तेजी से टीम निर्माण का सुनहरा मौका
        </div>
        <div style="background:#fdfaf3; border:1.5px solid #f3d9a2; border-radius:18px; padding:16px 28px; font-size:20px; font-weight:800; color:#92580a;">
          🚀 डायरेक्ट स्पॉन्सर इनकम में 100% वृद्धि
        </div>
      </div>
    </div>
  </div>

  {slide_footer(11)}
</div>
"""
slides_html.append(s11)

# ==============================================================================
# SLIDE 12: 16 INCOMES OVERVIEW - PART 1 (INCOMES 1 TO 8)
# ==============================================================================
incomes_part1 = [
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
for num, hi, en, pct, desc in incomes_part1:
    inc1_boxes += f"""
    <div class="card-white" style="padding:22px 24px; border-radius:24px; border-left:8px solid #144732; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:6px;">
          <span class="num-badge" style="font-size:16px; padding:4px 10px;">{num}</span>
          <div style="font-size:22px; font-weight:900; color:#144732;">{hi}</div>
        </div>
        <div style="font-size:16px; font-weight:700; color:#4a5568;">{en}</div>
        <div style="font-size:14.5px; font-weight:600; color:#718096; margin-top:4px;">{desc}</div>
      </div>
      <div class="badge-gold" style="font-size:18px; font-weight:900; padding:8px 16px;">
        {pct}
      </div>
    </div>
"""

s12 = f"""
<div class="slide">
  {slide_header("11", "आय के प्रकार (भाग-1)", "16 प्रकार की महा इनकम (इनकम 1 से 8)", "16 Lucrative Income Streams (Heads 1 to 8)", "वर्किंग और नॉन-वर्किंग का संतुलित महा-प्लान", "Comprehensive Balanced Earning Ecosystem")}
  
  <div class="slide-body" style="justify-content:center;">
    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:22px;">
      {inc1_boxes}
    </div>
  </div>

  {slide_footer(12)}
</div>
"""
slides_html.append(s12)

# ==============================================================================
# SLIDE 13: 16 INCOMES OVERVIEW - PART 2 (INCOMES 9 TO 16)
# ==============================================================================
incomes_part2 = [
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
for num, hi, en, pct, desc in incomes_part2:
    inc2_boxes += f"""
    <div class="card-white" style="padding:22px 24px; border-radius:24px; border-left:8px solid #d4a359; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:6px;">
          <span class="num-badge" style="background:#92580a; font-size:16px; padding:4px 10px;">{num}</span>
          <div style="font-size:22px; font-weight:900; color:#92580a;">{hi}</div>
        </div>
        <div style="font-size:16px; font-weight:700; color:#4a5568;">{en}</div>
        <div style="font-size:14.5px; font-weight:600; color:#718096; margin-top:4px;">{desc}</div>
      </div>
      <div class="badge-green" style="font-size:18px; font-weight:900; padding:8px 16px;">
        {pct}
      </div>
    </div>
"""

s13 = f"""
<div class="slide">
  {slide_header("12", "आय के प्रकार (भाग-2)", "16 प्रकार की महा इनकम (इनकम 9 से 16)", "16 Lucrative Income Streams (Heads 9 to 16)", "रीपरचेस, लाइफस्टाइल फंड्स एवं यूटिलिटी रिचार्ज", "Repurchase, 4 Lifestyle Funds & Utility Recharge Cashbacks")}
  
  <div class="slide-body" style="justify-content:center;">
    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:22px;">
      {inc2_boxes}
    </div>
  </div>

  {slide_footer(13)}
</div>
"""
slides_html.append(s13)

# ==============================================================================
# SLIDE 14: RETAIL PROFIT & DIRECT INCOME
# ==============================================================================
s14 = f"""
<div class="slide">
  {slide_header("13", "प्राथमिक आमदनी", "रिटेल प्रॉफिट एवं डायरेक्ट इनकम", "Retail Profit & Direct Referral Income", "शुरुआती स्तर से ही मजबूत एवं तुरंत नकद आमदनी का साधन", "Immediate Cash Flow & Instant Direct Referral Bonuses")}
  
  <div class="slide-body" style="flex-direction:row; gap:40px; justify-content:center; align-items:center;">
    <!-- Retail Profit Card -->
    <div class="card-white border-accent-green" style="flex:1; padding:36px 40px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:36px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <h2 style="font-size:32px; font-weight:900; color:#144732;">1. रिटेल प्रॉफिट | Retail Profit</h2>
          <span class="badge-green" style="font-size:18px;">खुदरा मुनाफा</span>
        </div>
        
        <div style="background:#f7faf8; border:2px solid #b7e1cd; border-radius:24px; padding:24px; text-align:center; margin-bottom:24px;">
          <div style="font-size:60px; font-weight:900; color:#144732; line-height:1;">5% – 50%</div>
          <div style="font-size:18px; font-weight:700; color:#555; margin-top:8px;">प्रस्तावित खुदरा लाभ मार्जिन (Retail Margin on MRP)</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px; font-size:19px; font-weight:600; color:#374151;">
          <div>• हर सदस्य को उत्पाद डिस्काउंटेड डिस्ट्रीब्यूटर प्राइस (DP) पर मिलते हैं।</div>
          <div>• उत्पादों को MRP पर बेचकर आप 5% से लेकर 50% तक सीधा नकद लाभ कमा सकते हैं।</div>
          <div>• अपनी व्यक्तिगत जरूरतों के सामान पर भी हर महीने भारी बचत होती है।</div>
        </div>
      </div>

      <div style="background:#eaf5ed; padding:14px 20px; border-radius:16px; font-size:18px; font-weight:800; color:#144732; text-align:center;">
        💡 उत्पाद इस्तेमाल करें, पसंद आए तो दूसरों को बताएं और मुनाफा कमाएं!
      </div>
    </div>

    <!-- Direct Referral Card -->
    <div class="card-white border-accent-gold" style="flex:1; padding:36px 40px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:36px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <h2 style="font-size:32px; font-weight:900; color:#92580a;">2. डायरेक्ट इनकम | Direct Bonus</h2>
          <span class="badge-gold" style="font-size:18px;">रेफरल बोनस</span>
        </div>

        <div style="background:#fdfaf3; border:2px solid #f3d9a2; border-radius:24px; padding:24px; text-align:center; margin-bottom:24px;">
          <div style="font-size:60px; font-weight:900; color:#92580a; line-height:1;">10% PV</div>
          <div style="font-size:18px; font-weight:700; color:#555; margin-top:8px;">प्रत्येक डायरेक्ट स्पॉन्सर के एक्टिवेशन PV पर</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px; font-size:19px; font-weight:600; color:#374151;">
          <div>• आप जितने भी लोगों को सीधे सिस्टम में लाते हैं, उनके पैकेज PV का 10% तुरंत आपको मिलता है।</div>
          <div>• <strong>अनलिमिटेड डायरेक्ट:</strong> कोई सीमा नहीं, आप जितने चाहें उतने साथियों को सीधे जोड़ सकते हैं।</div>
          <div>• उदाहरण: 500 PV पैकेज से जॉइन कराने पर ₹50 तुरंत वॉलेट में क्रेडिट।</div>
        </div>
      </div>

      <div style="background:#fdf5e6; padding:14px 20px; border-radius:16px; font-size:18px; font-weight:800; color:#92580a; text-align:center;">
        ⚡ जितनी बड़ी डायरेक्ट टीम, उतनी बड़ी रोज की सीधी इनकम!
      </div>
    </div>
  </div>

  {slide_footer(14)}
</div>
"""
slides_html.append(s14)

# ==============================================================================
# SLIDE 15: MATCHING INCOME & SPONSOR ROYALTY
# ==============================================================================
s15 = f"""
<div class="slide">
  {slide_header("14", "टीम वर्किंग आय", "मैचिंग इनकम एवं स्पॉन्सर रॉयल्टी", "Binary Matching & Sponsor Matching Royalty", "मजबूत 2-लेग बाइनरी संरचना और अनलिमिटेड टीम डेप्थ का लाभ", "High-Velocity Binary Matching with Unlimited Depth & Daily Closing")}
  
  <div class="slide-body" style="flex-direction:row; gap:40px; justify-content:center; align-items:center;">
    <!-- Matching Income Card -->
    <div class="card-white border-accent-green" style="flex:1; padding:36px 40px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:36px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <h2 style="font-size:32px; font-weight:900; color:#144732;">3. मैचिंग इनकम | Matching</h2>
          <span class="badge-green" style="font-size:18px;">10% मैचिंग</span>
        </div>

        <div style="background:#f7faf8; border:2px solid #b7e1cd; border-radius:24px; padding:22px; text-align:center; margin-bottom:24px;">
          <div style="font-size:56px; font-weight:900; color:#144732; line-height:1;">10% (1:1 Ratio)</div>
          <div style="font-size:18px; font-weight:700; color:#555; margin-top:8px;">लेफ्ट व राइट टीम बिजनेस मैचिंग पर</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px; font-size:19px; font-weight:600; color:#374151;">
          <div>• <strong>मैचिंग अनुपात:</strong> पहला पेयर 1:2 या 2:1, उसके बाद 1:1 के अनुपात में आजीवन।</div>
          <div>• <strong>अनलिमिटेड डेप्थ:</strong> टीम में किसी भी गहराई पर बिजनेस आने पर मैचिंग का लाभ।</div>
          <div>• <strong>डेली क्लोजिंग:</strong> हर रात 12:00 बजे मैचिंग की गणना व तुरंत वॉलेट ट्रांसफर।</div>
        </div>
      </div>

      <div style="background:#eaf5ed; padding:14px 20px; border-radius:16px; font-size:18px; font-weight:800; color:#144732; text-align:center;">
        ⚖️ दोनों टीमों का समान संतुलन बनाएं और रोज मैचिंग का लाभ पाएं!
      </div>
    </div>

    <!-- Sponsor Matching Royalty Card -->
    <div class="card-white border-accent-gold" style="flex:1; padding:36px 40px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:36px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <h2 style="font-size:32px; font-weight:900; color:#92580a;">4. डायरेक्ट स्पॉन्सर इनकम</h2>
          <span class="badge-gold" style="font-size:18px;">10% रॉयल्टी</span>
        </div>

        <div style="background:#fdfaf3; border:2px solid #f3d9a2; border-radius:24px; padding:22px; text-align:center; margin-bottom:24px;">
          <div style="font-size:56px; font-weight:900; color:#92580a; line-height:1;">10% रॉयल्टी</div>
          <div style="font-size:18px; font-weight:700; color:#555; margin-top:8px;">डायरेक्ट साथियों की मैचिंग आमदनी पर</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px; font-size:19px; font-weight:600; color:#374151;">
          <div>• आपके सीधे स्पॉन्सर किए गए साथी जितनी भी <strong>मैचिंग इनकम</strong> कमाएंगे...</div>
          <div>• उनकी कुल मैचिंग कमाई का <strong>10% अतिरिक्त बोनस</strong> आजीवन आपको मिलेगा।</div>
          <div>• उदाहरण: यदि आपके 10 डायरेक्ट साथी मिलकर ₹1 लाख कमाते हैं, तो आपको सीधे ₹10,000 मिलेंगे!</div>
        </div>
      </div>

      <div style="background:#fdf5e6; padding:14px 20px; border-radius:16px; font-size:18px; font-weight:800; color:#92580a; text-align:center;">
        🤝 साथियों को जिताओ, खुद भी बड़ा पैसा कमाओ!
      </div>
    </div>
  </div>

  {slide_footer(15)}
</div>
"""
slides_html.append(s15)

# ==============================================================================
# SLIDE 16: LEADERSHIP & COMPANY CTO ROYALTY
# ==============================================================================
s16 = f"""
<div class="slide">
  {slide_header("15", "रॉयल्टी आमदनी", "लीडरशिप एवं कंपनी CTO रॉयल्टी", "Leadership Royalty & Company Turnover Pool", "कंपनी के कुल टर्नओवर में स्थायी पार्टनरशिप और सम्मान", "Permanent Stakeholder Status in Company-Wide Monthly Turnover")}
  
  <div class="slide-body" style="flex-direction:row; gap:40px; justify-content:center; align-items:center;">
    <!-- Leadership Income Card -->
    <div class="card-white border-accent-green" style="flex:1; padding:36px 40px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:36px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <h2 style="font-size:32px; font-weight:900; color:#144732;">6. लीडरशिप इनकम | Leadership</h2>
          <span class="badge-green" style="font-size:18px;">3000 PV</span>
        </div>

        <div style="background:#f7faf8; border:2px solid #b7e1cd; border-radius:24px; padding:22px; text-align:center; margin-bottom:24px;">
          <div style="font-size:56px; font-weight:900; color:#144732; line-height:1;">5% CTO Pool</div>
          <div style="font-size:18px; font-weight:700; color:#555; margin-top:8px;">3000 PV डायरेक्ट बिजनेस पूरा करने पर</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px; font-size:19px; font-weight:600; color:#374151;">
          <div>• जब आपकी डायरेक्ट आईडी से कुल <strong>3000 PV</strong> का बिजनेस पूरा हो जाता है।</div>
          <div>• आप कंपनी के 5% लीडरशिप रॉयल्टी क्लब में शामिल हो जाते हैं।</div>
          <div>• कंपनी के कुल मासिक टर्नओवर का 5% सभी योग्य लीडर्स में समान रूप से बांटा जाता है।</div>
        </div>
      </div>

      <div style="background:#eaf5ed; padding:14px 20px; border-radius:16px; font-size:18px; font-weight:800; color:#144732; text-align:center;">
        👑 अपनी लीडरशिप साबित करें और हर महीने स्थायी रॉयल्टी पाएं!
      </div>
    </div>

    <!-- Company CTO Partner Card -->
    <div class="card-white border-accent-gold" style="flex:1; padding:36px 40px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:36px;">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <h2 style="font-size:32px; font-weight:900; color:#92580a;">7. कंपनी CTO इनकम | Lifetime</h2>
          <span class="badge-gold" style="font-size:18px;">5000 PV</span>
        </div>

        <div style="background:#fdfaf3; border:2px solid #f3d9a2; border-radius:24px; padding:22px; text-align:center; margin-bottom:24px;">
          <div style="font-size:56px; font-weight:900; color:#92580a; line-height:1;">5% CTO Lifetime</div>
          <div style="font-size:18px; font-weight:700; color:#555; margin-top:8px;">5000 PV डायरेक्ट बिजनेस पूरा करने पर</div>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px; font-size:19px; font-weight:600; color:#374151;">
          <div>• अपनी डायरेक्ट आईडी से कुल <strong>5000 PV</strong> का डायरेक्ट बिजनेस करने पर।</div>
          <div>• आप कंपनी के सर्वोच्च <strong>CTO (Company Total Turnover) पार्टनर</strong> बन जाते हैं।</div>
          <div>• कंपनी के कुल टर्नओवर का 5% आजीवन आपके बैंक खाते में नियमित क्रेडिट होता है।</div>
        </div>
      </div>

      <div style="background:#fdf5e6; padding:14px 20px; border-radius:16px; font-size:18px; font-weight:800; color:#92580a; text-align:center;">
        🏛️ कंपनी के लाइफटाइम टर्नओवर पार्टनर बनने का ऐतिहासिक अवसर!
      </div>
    </div>
  </div>

  {slide_footer(16)}
</div>
"""
slides_html.append(s16)

# ==============================================================================
# SLIDE 17: AUTO POOL MASTER PLAN
# ==============================================================================
autopool_rows = [
    ("L1", "2 × ₹100", "₹ 200", "₹ 125", "₹ 75"),
    ("L2", "4 × ₹125", "₹ 500", "₹ 300", "₹ 200"),
    ("L3", "8 × ₹300", "₹ 2,400", "₹ 1,000", "₹ 1,400"),
    ("L4", "16 × ₹1,000", "₹ 16,000", "₹ 6,000", "₹ 10,000"),
    ("L5", "32 × ₹6,000", "₹ 1,92,000", "₹ 75,000", "₹ 1,17,000"),
    ("L6", "64 × ₹75,000", "₹ 48,00,000", "₹ 10,00,000", "₹ 38,00,000"),
    ("L7", "128 × ₹10,00,000", "₹ 12,80,00,000", "NIL (0)", "₹ 12,80,00,000")
]

ap_table_rows = ""
for lvl, calc, tot, upg, net in autopool_rows:
    is_l7 = (lvl == "L7")
    row_style = 'class="crown-row"' if is_l7 else ''
    net_style = 'style="font-size:22px; font-weight:900; color:#fef08a;"' if is_l7 else 'style="font-size:20px; font-weight:900; color:#144732;"'
    ap_table_rows += f"""
    <tr {row_style}>
      <td><span class="num-badge" style="{'background:#d4a359; color:#144732;' if is_l7 else ''}">{lvl}</span></td>
      <td style="font-size:20px; font-weight:800;">{calc}</td>
      <td style="font-size:20px; font-weight:800;">{tot}</td>
      <td style="font-size:20px; font-weight:800; color:{'#ffffff' if is_l7 else '#dc2626'};">{upg}</td>
      <td {net_style}>{net}</td>
    </tr>
"""

s17 = f"""
<div class="slide">
  {slide_header("16", "ऑटोपूल योजना", "नॉन-वर्किंग महा ऑटोपूल इनकम", "Global 2x2 Auto Pool Matrix - Complete 7 Levels", "ऑल इंडिया ऑटो-प्लेसमेंट द्वारा ₹13.19 करोड़ से अधिक की कुल संभावित आमदनी", "Systematic Universal Spillover Matrix with Automatic Upgrade Model")}
  
  <div class="slide-body" style="justify-content:center;">
    <table class="bold-table">
      <thead>
        <tr>
          <th style="width:12%;">लेवल (Level)</th>
          <th style="width:25%;">मैट्रिक्स गणना (Matrix Formula)</th>
          <th style="width:21%;">कुल राशि (Total Amount)</th>
          <th style="width:21%;">अपग्रेड कटौती (Upgrade Deduction)</th>
          <th style="width:21%;">नेट आमदनी (Net Income)</th>
        </tr>
      </thead>
      <tbody>
        {ap_table_rows}
      </tbody>
    </table>

    <div style="margin-top:20px; background:#144732; border-radius:20px; padding:18px 36px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 12px 28px rgba(20,71,50,0.25);">
      <div style="font-size:22px; font-weight:800; color:#ffffff;">
        🏆 <strong>कुल संभावित ऑटोपूल आय (Total Net Income):</strong>
      </div>
      <div style="font-size:36px; font-weight:900; color:#fef08a;">
        ₹ 13,19,28,675 /- <span style="font-size:20px; color:#ffffff;">(तेरह करोड़ उन्नीस लाख रुपये से अधिक)</span>
      </div>
    </div>
  </div>

  {slide_footer(17)}
</div>
"""
slides_html.append(s17)

# ==============================================================================
# SLIDE 18: AUTO POOL SYSTEM & MECHANICS
# ==============================================================================
s18 = f"""
<div class="slide">
  {slide_header("17", "ऑटोपूल नियम", "ऑटोपूल प्रणाली कैसे काम करती है?", "How the Global 2x2 Auto Pool Matrix Functions", "पारदर्शी, स्व-चालित एवं तकनीक-संचालित ग्लोबल नॉन-वर्किंग सिस्टम", "Fully Automated Universal Spillover & Automatic Level Upgrades")}
  
  <div class="slide-body" style="flex-direction:row; gap:36px; justify-content:center; align-items:center;">
    <!-- Step 1 Card -->
    <div class="card-white border-accent-green" style="flex:1; padding:32px 30px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:32px;">
      <div>
        <div class="num-badge" style="font-size:22px; padding:8px 16px; margin-bottom:16px;">चरण 1</div>
        <h2 style="font-size:26px; font-weight:900; color:#144732; margin-bottom:14px;">ग्लोबल 2x2 ऑटो-प्लेसमेंट</h2>
        <div style="font-size:16px; font-weight:700; color:#d4a359; margin-bottom:14px;">Universal Spillover Engine</div>
        <p style="font-size:19px; line-height:1.6; color:#374151; font-weight:600;">
          पूरे भारत से कंपनी में किसी भी लीडर द्वारा एक्टिवेट होने वाली सभी नई आईडियां ऑटोमैटिकली 2 के मैट्रिक्स में ऊपर से नीचे, बाएं से दाएं प्लेस होती हैं। किसी को व्यक्तिगत रूप से सदस्य जोड़ना अनिवार्य नहीं है।
        </p>
      </div>
      <div style="background:#eaf5ed; padding:14px; border-radius:14px; font-size:17px; font-weight:800; color:#144732; text-align:center;">
        🌐 100% ऑटोमेटेड ग्लोबल मैट्रिक्स
      </div>
    </div>

    <!-- Step 2 Card -->
    <div class="card-white border-accent-gold" style="flex:1; padding:32px 30px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:32px;">
      <div>
        <div class="num-badge" style="background:#92580a; font-size:22px; padding:8px 16px; margin-bottom:16px;">चरण 2</div>
        <h2 style="font-size:26px; font-weight:900; color:#92580a; margin-bottom:14px;">सिस्टम अपग्रेड कटौती</h2>
        <div style="font-size:16px; font-weight:700; color:#144732; margin-bottom:14px;">Smart Re-Investment Model</div>
        <p style="font-size:19px; line-height:1.6; color:#374151; font-weight:600;">
          प्रत्येक लेवल पर आने वाली कुल राशि में से निर्धारित अपग्रेड राशि स्वतः अगले बड़े लेवल के लिए कट जाती है और शेष <strong>शुद्ध आमदनी (Net Income)</strong> तुरंत आपके विड्रॉल वॉलेट में ट्रांसफर हो जाती है।
        </p>
      </div>
      <div style="background:#fdf5e6; padding:14px; border-radius:14px; font-size:17px; font-weight:800; color:#92580a; text-align:center;">
        ⚡ पारदर्शी स्व-चालित अपग्रेड प्रक्रिया
      </div>
    </div>

    <!-- Step 3 Card -->
    <div class="card-white border-accent-green" style="flex:1; padding:32px 30px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:32px;">
      <div>
        <div class="num-badge" style="font-size:22px; padding:8px 16px; margin-bottom:16px;">चरण 3</div>
        <h2 style="font-size:26px; font-weight:900; color:#144732; margin-bottom:14px;">7वें लेवल पर महा-पेआउट</h2>
        <div style="font-size:16px; font-weight:700; color:#d4a359; margin-bottom:14px;">Zero Upgrade at Final Level</div>
        <p style="font-size:19px; line-height:1.6; color:#374151; font-weight:600;">
          7वें और अंतिम लेवल पर पूरे 128 सदस्यों से ₹10 लाख प्रति सदस्य के हिसाब से पूरे <strong>₹ 12.80 करोड़ रुपये</strong> बिना किसी अपग्रेड कटौती के 100% आपके बैंक खाते में विड्रॉल के लिए उपलब्ध होते हैं।
        </p>
      </div>
      <div style="background:#eaf5ed; padding:14px; border-radius:14px; font-size:17px; font-weight:800; color:#144732; text-align:center;">
        💰 ऐतिहासिक ₹12.80 करोड़ का अंतिम पेआउट
      </div>
    </div>
  </div>

  {slide_footer(18)}
</div>
"""
slides_html.append(s18)

# ==============================================================================
# SLIDE 19: RANK & REWARDS - STAR CLUB (RANKS 1 TO 5)
# ==============================================================================
s19 = f"""
<div class="slide">
  {slide_header("18", "सम्मान एवं पुरस्कार (1-5)", "रैंक एवं लाइफस्टाइल रिवार्ड्स - स्टार क्लब", "Rank & Lifestyle Rewards - Star Club (Ranks 1 to 5)", "3% रिवार्ड फंड से आपके नेतृत्व का हर कदम पर भव्य सम्मान", "Dedicated 3% Lifestyle Reward Pool for Initial Milestones")}
  
  <div class="slide-body" style="justify-content:center;">
    <table class="bold-table">
      <thead>
        <tr>
          <th style="width:10%;">क्र.</th>
          <th style="width:28%; text-align:left; padding-left:25px;">रैंक पदनाम (Rank Designation)</th>
          <th style="width:18%;">लेफ्ट (Left RP)</th>
          <th style="width:18%;">राइट (Right RP)</th>
          <th style="width:26%;">शानदार रिवॉर्ड / नकद पुरस्कार</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="num-badge">01</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">⭐ 1- स्टार (1-Star)</td>
          <td style="font-size:20px; font-weight:800;">30 RP</td>
          <td style="font-size:20px; font-weight:800;">30 RP</td>
          <td style="font-size:22px; font-weight:900; color:#144732;">₹ 100 /- नकद</td>
        </tr>
        <tr>
          <td><span class="num-badge">02</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">⭐⭐ 2- स्टार (2-Star)</td>
          <td style="font-size:20px; font-weight:800;">150 RP</td>
          <td style="font-size:20px; font-weight:800;">150 RP</td>
          <td style="font-size:22px; font-weight:900; color:#144732;">⌚ आकर्षक कलाई घड़ी (Watch)</td>
        </tr>
        <tr>
          <td><span class="num-badge">03</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">⭐⭐⭐ 3- स्टार (3-Star)</td>
          <td style="font-size:20px; font-weight:800;">500 RP</td>
          <td style="font-size:20px; font-weight:800;">500 RP</td>
          <td style="font-size:22px; font-weight:900; color:#144732;">₹ 1,500 /- नकद</td>
        </tr>
        <tr>
          <td><span class="num-badge">04</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">🥈 सिल्वर (Silver)</td>
          <td style="font-size:20px; font-weight:800;">3,000 RP</td>
          <td style="font-size:20px; font-weight:800;">3,000 RP</td>
          <td style="font-size:22px; font-weight:900; color:#92580a;">🕌 जगन्नाथ पुरी टूर (Puri Tour)</td>
        </tr>
        <tr>
          <td><span class="num-badge">05</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">🥇 गोल्ड (Gold)</td>
          <td style="font-size:20px; font-weight:800;">5,000 RP</td>
          <td style="font-size:20px; font-weight:800;">5,000 RP</td>
          <td style="font-size:22px; font-weight:900; color:#92580a;">📱 ब्रांडेड 5G स्मार्टफोन (Mobile)</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:20px; background:#ffffff; border-radius:18px; border-left:8px solid #144732; padding:14px 28px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:18px; font-weight:700; color:#2d3748;">
        * RP (रिवार्ड पॉइंट्स) की गणना 1:1 लेफ्ट एवं राइट बिजनेस मैचिंग पर की जाती है।
      </div>
      <div class="badge-gold" style="font-size:16px;">अगले पेज पर देखें: लीडरशिप क्लब (रैंक 6-10) 👉</div>
    </div>
  </div>

  {slide_footer(19)}
</div>
"""
slides_html.append(s19)

# ==============================================================================
# SLIDE 20: RANK & REWARDS - LEADERSHIP CLUB (RANKS 6 TO 10)
# ==============================================================================
s20 = f"""
<div class="slide">
  {slide_header("19", "सम्मान एवं पुरस्कार (6-10)", "रैंक एवं लाइफस्टाइल रिवार्ड्स - लीडरशिप क्लब", "Rank & Lifestyle Rewards - Leadership Club (Ranks 6 to 10)", "लक्ज़री बाइक, टूर, कार एवं लाखों के नकद पुरस्कार", "Luxury Bikes, Sacred Tours, Brand New Cars & Cash Rewards")}
  
  <div class="slide-body" style="justify-content:center;">
    <table class="bold-table">
      <thead>
        <tr>
          <th style="width:10%;">क्र.</th>
          <th style="width:28%; text-align:left; padding-left:25px;">रैंक पदनाम (Rank Designation)</th>
          <th style="width:18%;">लेफ्ट (Left RP)</th>
          <th style="width:18%;">राइट (Right RP)</th>
          <th style="width:26%;">शानदार रिवॉर्ड / नकद पुरस्कार</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="num-badge">06</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">💎 रूबी (Ruby)</td>
          <td style="font-size:20px; font-weight:800;">10,000 RP</td>
          <td style="font-size:20px; font-weight:800;">10,000 RP</td>
          <td style="font-size:22px; font-weight:900; color:#144732;">₹ 30,000 /- नकद पुरस्कार</td>
        </tr>
        <tr>
          <td><span class="num-badge">07</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">🏆 प्लेटिनम (Platinum)</td>
          <td style="font-size:20px; font-weight:800;">20,000 RP</td>
          <td style="font-size:20px; font-weight:800;">20,000 RP</td>
          <td style="font-size:22px; font-weight:900; color:#144732;">🌴 भव्य रामेश्वरम टूर (Tour)</td>
        </tr>
        <tr>
          <td><span class="num-badge">08</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">🟢 एमराल्ड (Emerald)</td>
          <td style="font-size:20px; font-weight:800;">40,000 RP</td>
          <td style="font-size:20px; font-weight:800;">40,000 RP</td>
          <td style="font-size:22px; font-weight:900; color:#92580a;">🏍️ ब्रांड न्यू बाइक (Motorcycle)</td>
        </tr>
        <tr>
          <td><span class="num-badge">09</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">💠 डायमंड (Diamond)</td>
          <td style="font-size:20px; font-weight:800;">1,00,000 RP</td>
          <td style="font-size:20px; font-weight:800;">1,00,000 RP</td>
          <td style="font-size:22px; font-weight:900; color:#92580a;">💵 ₹ 3,00,000 /- (3 लाख कैश)</td>
        </tr>
        <tr>
          <td><span class="num-badge">10</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">💠💠 डबल डायमंड (Double Diamond)</td>
          <td style="font-size:20px; font-weight:800;">5,00,000 RP</td>
          <td style="font-size:20px; font-weight:800;">5,00,000 RP</td>
          <td style="font-size:22px; font-weight:900; color:#144732;">🚗 शानदार कार (Brand New Car)</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:20px; background:#ffffff; border-radius:18px; border-left:8px solid #d4a359; padding:14px 28px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:18px; font-weight:700; color:#2d3748;">
        * सभी पुरस्कार लाइफटाइम एक्युमुलेटेड (जुड़ते हुए) बिजनेस आधार पर प्रदान किए जाते हैं।
      </div>
      <div class="badge-gold" style="font-size:16px;">अगले पेज पर देखें: करोड़पति क्लब (रैंक 11-15) 👉</div>
    </div>
  </div>

  {slide_footer(20)}
</div>
"""
slides_html.append(s20)

# ==============================================================================
# SLIDE 21: RANK & REWARDS - CROREPATI CLUB (RANKS 11 TO 15)
# ==============================================================================
s21 = f"""
<div class="slide">
  {slide_header("20", "सम्मान एवं पुरस्कार (11-15)", "रैंक एवं लाइफस्टाइल रिवार्ड्स - करोड़पति क्लब", "Rank & Lifestyle Rewards - Crorepati Club (Ranks 11 to 15)", "करोड़ों के नकद पुरस्कार एवं सर्वोच्च क्राउन एम्बेसडर सम्मान", "Multi-Crore Cash Rewards & The Ultimate Crown Ambassador Honours")}
  
  <div class="slide-body" style="justify-content:center;">
    <table class="bold-table">
      <thead>
        <tr>
          <th style="width:10%;">क्र.</th>
          <th style="width:28%; text-align:left; padding-left:25px;">रैंक पदनाम (Rank Designation)</th>
          <th style="width:18%;">लेफ्ट (Left RP)</th>
          <th style="width:18%;">राइट (Right RP)</th>
          <th style="width:26%;">शानदार रिवॉर्ड / नकद पुरस्कार</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="num-badge">11</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">💎💎💎 ट्रिपल डायमंड</td>
          <td style="font-size:20px; font-weight:800;">10,00,000 RP</td>
          <td style="font-size:20px; font-weight:800;">10,00,000 RP</td>
          <td style="font-size:22px; font-weight:900; color:#144732;">💵 ₹ 30,00,000 /- (30 लाख)</td>
        </tr>
        <tr>
          <td><span class="num-badge">12</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">👑 कोहिनूर (Kohinoor)</td>
          <td style="font-size:20px; font-weight:800;">20,00,000 RP</td>
          <td style="font-size:20px; font-weight:800;">20,00,000 RP</td>
          <td style="font-size:22px; font-weight:900; color:#144732;">💵 ₹ 60,00,000 /- (60 लाख)</td>
        </tr>
        <tr>
          <td><span class="num-badge">13</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">🏛️ अम्बेडकर (Ambassador)</td>
          <td style="font-size:20px; font-weight:800;">40,00,000 RP</td>
          <td style="font-size:20px; font-weight:800;">40,00,000 RP</td>
          <td style="font-size:22px; font-weight:900; color:#92580a;">💰 ₹ 1,00,00,000 /- (1 करोड़)</td>
        </tr>
        <tr>
          <td><span class="num-badge">14</span></td>
          <td style="text-align:left; padding-left:25px; font-size:21px; font-weight:800;">👑 रॉयल अम्बेडकर (Royal Ambassador)</td>
          <td style="font-size:20px; font-weight:800;">80,00,000 RP</td>
          <td style="font-size:20px; font-weight:800;">80,00,000 RP</td>
          <td style="font-size:22px; font-weight:900; color:#92580a;">💰 ₹ 2,00,00,000 /- (2 करोड़)</td>
        </tr>
        <tr class="crown-row">
          <td><span class="num-badge" style="background:#d4a359; color:#144732;">15</span></td>
          <td style="text-align:left; padding-left:25px; font-size:22px; font-weight:900;">👑👑 क्राउन एम्बेसडर (Crown Ambassador)</td>
          <td style="font-size:21px; font-weight:900;">2 करोड़ RP</td>
          <td style="font-size:21px; font-weight:900;">2 करोड़ RP</td>
          <td style="font-size:24px; font-weight:900; color:#fef08a;">🏆 ₹ 3,00,00,000 /- (3 करोड़)</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:20px; background:#144732; border-radius:18px; padding:16px 36px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:20px; font-weight:900; color:#ffffff;">
        🌟 कुल 15 रैंक रिवार्ड्स की ऐतिहासिक उपलब्धि — आपके हर बड़े सपने को साकार करने का संकल्प!
      </div>
      <div class="badge-gold" style="font-size:16px;">लाइफटाइम रॉयल्टी</div>
    </div>
  </div>

  {slide_footer(21)}
</div>
"""
slides_html.append(s21)

# ==============================================================================
# SLIDE 22: 4 LUXURY LIFESTYLE FUNDS
# ==============================================================================
s22 = f"""
<div class="slide">
  {slide_header("21", "लक्ज़री लाइफ फंड्स", "4 प्रकार के लाइफस्टाइल रॉयल्टी फंड्स", "4 Dedicated Luxury Lifestyle Royalty Funds", "कंपनी टर्नओवर (CTO) से हर महीने योग्य लीडर्स में 2% रॉयल्टी का समान वितरण", "2% Company Turnover Allocated Monthly Across 4 Elite Lifestyle Funds")}
  
  <div class="slide-body" style="justify-content:center;">
    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:26px;">
      <!-- Mobile Fund -->
      <div class="card-white border-accent-green" style="padding:28px 32px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:28px; font-weight:900; color:#144732; margin-bottom:6px;">📱 मोबाइल फंड | Mobile Fund</div>
          <div style="font-size:18px; font-weight:600; color:#4a5568; line-height:1.5;">
            कंपनी टर्नओवर (CTO) का 2% फंड। योग्य लीडर्स को आधुनिक 5G स्मार्टफोन व गैजेट्स हेतु मासिक वितरण।
          </div>
        </div>
        <div class="badge-green" style="font-size:26px; padding:12px 24px; font-weight:900;">2% CTO</div>
      </div>

      <!-- Bike Fund -->
      <div class="card-white border-accent-gold" style="padding:28px 32px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:28px; font-weight:900; color:#92580a; margin-bottom:6px;">🏍️ बाइक फंड | Bike Fund</div>
          <div style="font-size:18px; font-weight:600; color:#4a5568; line-height:1.5;">
            कंपनी टर्नओवर (CTO) का 2% फंड। फील्ड विजिट व तेज नेटवर्किंग हेतु दोपहिया वाहन के लिए मासिक रॉयल्टी।
          </div>
        </div>
        <div class="badge-gold" style="font-size:26px; padding:12px 24px; font-weight:900;">2% CTO</div>
      </div>

      <!-- Car Fund -->
      <div class="card-white border-accent-green" style="padding:28px 32px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:28px; font-weight:900; color:#144732; margin-bottom:6px;">🚗 कार फंड | Car Fund</div>
          <div style="font-size:18px; font-weight:600; color:#4a5568; line-height:1.5;">
            कंपनी टर्नओवर (CTO) का 2% फंड। टॉप लीडर्स को लग्जरी चौपहिया कार खरीदने व मेंटेनेंस हेतु स्थायी मासिक फंड।
          </div>
        </div>
        <div class="badge-green" style="font-size:26px; padding:12px 24px; font-weight:900;">2% CTO</div>
      </div>

      <!-- House Fund -->
      <div class="card-white border-accent-gold" style="padding:28px 32px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-size:28px; font-weight:900; color:#92580a; margin-bottom:6px;">🏠 हाउस फंड | House Fund</div>
          <div style="font-size:18px; font-weight:600; color:#4a5568; line-height:1.5;">
            कंपनी टर्नओवर (CTO) का 2% फंड। अपने सपनों का आलीशान घर बनाने हेतु एलीट अचीवर्स के लिए विशेष फंड।
          </div>
        </div>
        <div class="badge-gold" style="font-size:26px; padding:12px 24px; font-weight:900;">2% CTO</div>
      </div>
    </div>

    <div style="margin-top:24px; background:#ffffff; border-radius:18px; padding:16px 32px; text-align:center; font-size:18px; font-weight:700; color:#374151; border:1px solid #dcd7ca;">
      💡 <em>फंड्स का वितरण कंपनी के मासिक टर्नओवर से सीधे योग्य लीडर्स के वॉलेट में किया जाता है।</em>
    </div>
  </div>

  {slide_footer(22)}
</div>
"""
slides_html.append(s22)

# ==============================================================================
# SLIDE 23: REPURCHASE & UTILITY CASHBACK
# ==============================================================================
s23 = f"""
<div class="slide">
  {slide_header("22", "रीपरचेस व रिचार्ज", "रीपरचेस इनकम एवं यूटिलिटी रिचार्ज", "Repurchase Incomes & Instant Utility Recharge Cashbacks", "दैनिक जीवन की आवश्यक सेवाओं से लगातार स्थायी और पैसिव आमदनी", "Residual Lifetime Income from Everyday Essentials & Service Transactions")}
  
  <div class="slide-body" style="flex-direction:row; gap:40px; justify-content:center; align-items:center;">
    <!-- Repurchase Card -->
    <div class="card-white border-accent-green" style="flex:1; padding:36px 36px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:36px;">
      <div>
        <h2 style="font-size:30px; font-weight:900; color:#144732; margin-bottom:18px;">
          🔄 परचेस & रीपरचेस इनकम
        </h2>
        
        <div style="background:#f7faf8; border:2px solid #b7e1cd; border-radius:24px; padding:20px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:24px; font-weight:900; color:#144732;">9. परचेस इनकम (Self)</div>
              <div style="font-size:16px; color:#555; font-weight:600;">स्वयं की व्यक्तिगत रीपरचेस पर</div>
            </div>
            <div class="badge-green" style="font-size:22px; font-weight:900;">10% BV</div>
          </div>
        </div>

        <div style="background:#fdfaf3; border:2px solid #f3d9a2; border-radius:24px; padding:20px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:24px; font-weight:900; color:#92580a;">10. रीपरचेस इनकम (Team)</div>
              <div style="font-size:16px; color:#555; font-weight:600;">पूरी टीम द्वारा की गई खरीदारी पर</div>
            </div>
            <div class="badge-gold" style="font-size:22px; font-weight:900;">10% Team</div>
          </div>
        </div>

        <p style="font-size:18px; line-height:1.5; color:#374151; font-weight:600;">
          चाय, तुलसी, मसाले, साबुन और अगरबत्ती हर महीने खत्म होते हैं और दोबारा खरीदे जाते हैं। हर रीपरचेस पर आजीवन 10% पैसिव इनकम प्राप्त होती है!
        </p>
      </div>

      <div style="background:#eaf5ed; padding:14px; border-radius:16px; font-size:17px; font-weight:800; color:#144732; text-align:center;">
        🛒 नो डिमोशन • बिज़नेस का लगातार एक्युमुलेशन
      </div>
    </div>

    <!-- Recharge Cashback Card -->
    <div class="card-white border-accent-gold" style="flex:1; padding:36px 36px; display:flex; flex-direction:column; justify-content:space-between; height:560px; border-radius:36px;">
      <div>
        <h2 style="font-size:30px; font-weight:900; color:#92580a; margin-bottom:18px;">
          📶 यूटिलिटी रिचार्ज कैशबैक
        </h2>

        <div style="background:#fdfaf3; border:2px solid #f3d9a2; border-radius:24px; padding:20px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:24px; font-weight:900; color:#92580a;">15. मोबाइल रिचार्ज</div>
              <div style="font-size:16px; color:#555; font-weight:600;">Jio, Airtel, Vi, BSNL आदि सभी नेटवर्क</div>
            </div>
            <div class="badge-gold" style="font-size:22px; font-weight:900;">2.50% फ्लैट</div>
          </div>
        </div>

        <div style="background:#f7faf8; border:2px solid #b7e1cd; border-radius:24px; padding:20px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:24px; font-weight:900; color:#144732;">16. डीटीएच (DTH) रिचार्ज</div>
              <div style="font-size:16px; color:#555; font-weight:600;">Tata Play, Dish TV, Airtel DTH आदि</div>
            </div>
            <div class="badge-green" style="font-size:22px; font-weight:900;">2.50% फ्लैट</div>
          </div>
        </div>

        <p style="font-size:18px; line-height:1.5; color:#374151; font-weight:600;">
          SGM Mart डिजिटल पोर्टल से जब भी आप या आपके ग्राहक अपना फोन या टीवी रिचार्ज करेंगे, तुरंत 2.50% कैशबैक सीधे आपके वॉलेट में जमा हो जाएगा।
        </p>
      </div>

      <div style="background:#fdf5e6; padding:14px; border-radius:16px; font-size:17px; font-weight:800; color:#92580a; text-align:center;">
        ⚡ 24×7 स्वचालित तुरंत कैशबैक क्रेडिट
      </div>
    </div>
  </div>

  {slide_footer(23)}
</div>
"""
slides_html.append(s23)

# ==============================================================================
# SLIDE 24: TERMS, CLOSING & WITHDRAWAL
# ==============================================================================
s24 = f"""
<div class="slide">
  {slide_header("23", "नियम एवं शर्तें", "नियम व शर्तें (Terms & Conditions)", "System Rules, Weekly Withdrawal & Deductions", "100% पारदर्शी, सुरक्षित और समय पर भुगतान व्यवस्था", "Transparent, Safe and On-Time Banking Settlements")}
  
  <div class="slide-body" style="justify-content:center;">
    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:26px;">
      <!-- Rule 1: Minimum Withdrawal -->
      <div class="card-white border-accent-green" style="padding:28px 32px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:20px;">
          <div style="font-size:46px;">🌴</div>
          <div>
            <div style="font-size:27px; font-weight:900; color:#144732; margin-bottom:6px;">
              मिनिमम विड्रॉल 100
            </div>
            <div style="font-size:17.5px; color:#4a5568; font-weight:700;">
              Minimum Withdrawal: मात्र ₹ 100/- होते ही बैंक विड्रॉल मान्य।
            </div>
          </div>
        </div>
        <div class="badge-green" style="font-size:22px; font-weight:900; padding:10px 18px;">
          ₹ 100
        </div>
      </div>

      <!-- Rule 2: Daily Closing Weekly Withdrawal -->
      <div class="card-white border-accent-gold" style="padding:28px 32px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:20px;">
          <div style="font-size:46px;">👉</div>
          <div>
            <div style="font-size:27px; font-weight:900; color:#92580a; margin-bottom:6px;">
              डेली क्लोजिंग विकली विड्रॉल
            </div>
            <div style="font-size:17.5px; color:#4a5568; font-weight:700;">
              Daily Closing (रात 12 बजे) & Weekly Bank Withdrawal
            </div>
          </div>
        </div>
        <div class="badge-gold" style="font-size:19px; font-weight:900; padding:10px 16px;">
          साप्ताहिक
        </div>
      </div>

      <!-- Rule 3: Admin & TDS -->
      <div class="card-white border-accent-green" style="padding:28px 32px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:20px;">
          <div style="font-size:46px;">👉</div>
          <div>
            <div style="font-size:27px; font-weight:900; color:#144732; margin-bottom:6px;">
              एडमिन चार्ज 5% TDS 5%
            </div>
            <div style="font-size:17.5px; color:#4a5568; font-weight:700;">
              Statutory Deductions: 5% Admin Fee + 5% Government TDS
            </div>
          </div>
        </div>
        <div class="badge-green" style="font-size:20px; font-weight:900; padding:10px 18px;">
          5% + 5%
        </div>
      </div>

      <!-- Rule 4: KYC & Bank Safety -->
      <div class="card-white border-accent-gold" style="padding:28px 32px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:20px;">
          <div style="font-size:46px;">🔒</div>
          <div>
            <div style="font-size:27px; font-weight:900; color:#92580a; margin-bottom:6px;">
              केवाईसी एवं सुरक्षा (KYC)
            </div>
            <div style="font-size:17.5px; color:#4a5568; font-weight:700;">
              बैंक खाता व पैन अनिवार्य • एक पैन कार्ड पर एक मुख्य आईडी
            </div>
          </div>
        </div>
        <div class="badge-gold" style="font-size:19px; font-weight:900; padding:10px 16px;">
          100% सेफ
        </div>
      </div>
    </div>

    <!-- Assurance Banner -->
    <div style="margin-top:24px; background:#144732; border-radius:20px; padding:18px 36px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 12px 25px rgba(20,71,50,0.25);">
      <div style="font-size:22px; font-weight:900; color:#fef08a;">
        ✔ सद्गुरु मार्ट की वचनबद्धता: सुरक्षित सिस्टम • समय पर पेआउट • 100% लीगल प्रक्रिया
      </div>
      <div style="font-size:18px; font-weight:700; color:#ffffff;">
        हेल्पलाइन: 6267392508
      </div>
    </div>
  </div>

  {slide_footer(24)}
</div>
"""
slides_html.append(s24)

# ==============================================================================
# SLIDE 25: THANK YOU & CONTACT DETAILS
# ==============================================================================
s25 = f"""
<div class="slide" style="flex-direction:row; background-color:#144732; padding:44px 56px;">
  <!-- Left Side Contact -->
  <div style="flex:1.15; display:flex; flex-direction:column; justify-content:space-between; padding-right:48px;">
    <div>
      <h1 style="font-size:52px; font-weight:900; color:#ffffff; line-height:1.2; margin-bottom:6px;">
        धन्यवाद!
      </h1>
      <div style="font-size:26px; font-weight:700; color:#d4a359; margin-bottom:20px;">
        Thank You for Exploring SGM MART
      </div>
      <div style="height:3px; background:#d4a359; width:100%; margin-bottom:28px;"></div>
      
      <div style="font-size:32px; font-weight:900; color:#ffffff; margin-bottom:12px;">
        SGM MART Online Service
      </div>
      <p style="font-size:22px; color:#e2e8f0; font-weight:600; margin-bottom:32px; line-height:1.5;">
        अधिक जानकारी और बिज़नेस पार्टनरशिप के लिए आज ही संपर्क करें:
      </p>

      <div style="display:flex; flex-direction:column; gap:20px; margin-bottom:32px;">
        <!-- Call Box -->
        <div style="background:rgba(255,255,255,0.08); border-left:8px solid #a3e635; border-radius:18px; padding:18px 24px;">
          <div style="font-size:15px; font-weight:800; color:#a3e635; letter-spacing:1.5px; text-transform:uppercase;">
            CALL US | कॉल करें
          </div>
          <div style="font-size:36px; font-weight:900; color:#ffffff; letter-spacing:1px; margin-top:2px;">
            6267392508
          </div>
        </div>

        <!-- WhatsApp Box -->
        <div style="background:rgba(255,255,255,0.08); border-left:8px solid #22c55e; border-radius:18px; padding:18px 24px;">
          <div style="font-size:15px; font-weight:800; color:#22c55e; letter-spacing:1.5px; text-transform:uppercase;">
            WHATSAPP SUPPORT | व्हाट्सऐप संपर्क
          </div>
          <div style="font-size:36px; font-weight:900; color:#ffffff; letter-spacing:1px; margin-top:2px;">
            7611148925
          </div>
        </div>
      </div>

      <!-- Website Box -->
      <div style="font-size:24px; font-weight:900; color:#fef08a;">
        🌐 आधिकारिक वेबसाइट: <span style="text-decoration:underline;">www.sadgurumart.com</span>
      </div>
    </div>

    <div style="font-size:15px; color:#94a3b8; font-weight:600; border-top:1px solid rgba(255,255,255,0.2); padding-top:16px;">
      SGM MART ONLINE SERVICE PVT. LTD. • ALL RIGHTS RESERVED
    </div>
  </div>

  <!-- Right Side Split Card -->
  <div style="flex:0.85; display:flex; justify-content:center; align-items:center;">
    <div style="background:#0b2b1e; border:3px solid #d4a359; border-radius:36px; padding:44px 36px; width:100%; max-width:480px; height:680px; display:flex; flex-direction:column; justify-content:space-between; align-items:center; text-align:center; box-shadow:0 24px 50px rgba(0,0,0,0.4);">
      
      <div>
        <img src="{img_logo}" style="width:130px; height:130px; background:#fff; border-radius:50%; padding:8px; margin-bottom:20px; box-shadow:0 10px 25px rgba(0,0,0,0.3);" />
        <div style="font-size:40px; font-weight:900; color:#fff; letter-spacing:1px;">SGM MART</div>
        <div style="font-size:20px; font-weight:800; color:#d4a359; letter-spacing:3px; margin-top:4px;">ONLINE SERVICE</div>
      </div>

      <div style="background:rgba(212,163,89,0.15); border:1.5px solid #d4a359; border-radius:24px; padding:24px 20px; width:100%;">
        <div style="font-size:28px; font-weight:900; color:#fef08a; line-height:1.4;">
          “बेरोजगारी और रोग मुक्त हो भारत हमारा”
        </div>
        <div style="font-size:16px; color:#e2e8f0; font-weight:600; margin-top:8px;">
          Healthy, Prosperous & Self-Reliant India
        </div>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.2); width:100%; padding-top:18px;">
        <div style="font-size:20px; font-weight:800; color:#ffffff;">
          ग्राहक पहले • पारदर्शिता हमेशा
        </div>
        <div style="font-size:15px; color:#cbd5e1; font-weight:600; margin-top:4px;">
          Customer First • Always Transparent
        </div>
      </div>

    </div>
  </div>
</div>
"""
slides_html.append(s25)

full_html = f"""<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>SGM Mart MLM Business Plan - Executive Presentation</title>
  <style>
{css_styles}
  </style>
</head>
<body>
{''.join(slides_html)}
</body>
</html>
"""

html_out = "Sadguru_Mart_MLM_Plan_Bold.html"
with open(html_out, "w", encoding="utf-8") as f:
    f.write(full_html)
print(f"Generated {html_out} with {len(slides_html)} slides.")
