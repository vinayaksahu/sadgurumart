import os
import base64
import subprocess
import pymupdf

def get_base64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")
    return ""

def get_png_base64(path):
    if os.path.exists(path):
        with open(path, "rb") as f:
            return "data:image/png;base64," + base64.b64encode(f.read()).decode("utf-8")
    return ""

img_logo = get_png_base64("sgm_logo.png")
img_chai = get_base64("1.jpeg")
img_face = get_base64("2.jpeg")
img_dant = get_base64("3.jpeg")
img_tulsi = get_base64("4.jpeg")
img_shampoo = get_base64("5.jpeg")
img_cream = get_base64("6.jpeg")
img_agarbatti = get_base64("7.jpeg")
img_berry = get_base64("9_cropped.jpeg")
img_oil = get_base64("10.jpeg")

html_content = f"""<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="utf-8">
<title>SGM MART - Official Business Plan Presentation</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600;700&family=Poppins:wght@500;600;700;800;900&display=swap" rel="stylesheet">
<style>
  @page {{
    size: 16in 9in;
    margin: 0;
  }}
  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}
  body {{
    font-family: 'Poppins', 'Hind', sans-serif;
    background-color: #f6f4ed;
    color: #2d3748;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    overflow: hidden;
  }}
  
  .slide {{
    width: 16in;
    height: 9in;
    position: relative;
    page-break-after: always;
    break-after: page;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background-color: #f6f4ed;
    padding: 0;
  }}

  /* Forest Green Top Header Banner */
  .slide-header {{
    background-color: #144732;
    color: #ffffff;
    padding: 18px 45px 16px 45px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    position: relative;
    z-index: 2;
  }}
  .header-idx {{
    font-size: 13px;
    font-weight: 700;
    color: #d4a359;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 3px;
  }}
  .header-title {{
    font-size: 28px;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.2;
    display: flex;
    align-items: center;
    gap: 12px;
  }}
  .header-title .en-sub {{
    color: #e2e8f0;
    font-weight: 600;
    font-size: 23px;
  }}

  /* Subtitle bar on cream background */
  .slide-subheader {{
    padding: 10px 45px 0 45px;
    font-size: 14px;
    font-weight: 600;
    color: #556270;
  }}

  /* Slide Body Content */
  .slide-body {{
    flex: 1;
    padding: 16px 45px 12px 45px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    z-index: 2;
  }}

  /* White Floating Cards */
  .card {{
    background: #ffffff;
    border: 1px solid #e7e4dc;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    padding: 20px;
    position: relative;
  }}
  .card-bordered-green {{
    border-left: 5px solid #144732;
  }}
  .card-bordered-gold {{
    border-left: 5px solid #c8973e;
  }}

  /* Footer Bar */
  .slide-footer {{
    padding: 8px 45px 12px 45px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    position: relative;
    z-index: 2;
  }}
  .footer-line {{
    height: 1.5px;
    background: linear-gradient(90deg, #d4a359 0%, #144732 50%, #d4a359 100%);
    opacity: 0.7;
    width: 100%;
  }}
  .footer-content {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12.5px;
    color: #718096;
    font-weight: 600;
  }}
  .footer-left {{
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}
  .footer-left strong {{
    color: #144732;
  }}
  .footer-right {{
    font-weight: 700;
    color: #4a5568;
  }}

  /* Grid Layouts */
  .grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    height: 100%;
  }}
  .grid-3 {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
  }}
  .grid-4 {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }}

  /* Table Style matching compliance draft */
  .clean-table {{
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 12px;
    overflow: hidden;
    font-size: 14.5px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    border: 1px solid #d5ded8;
  }}
  .clean-table th {{
    background-color: #144732;
    color: #ffffff;
    font-weight: 700;
    padding: 13px 16px;
    text-align: center;
    border-right: 1px solid rgba(255, 255, 255, 0.12);
    font-size: 14.5px;
  }}
  .clean-table th:last-child {{
    border-right: none;
  }}
  .clean-table td {{
    padding: 11px 16px;
    background-color: #ffffff;
    border-bottom: 1px solid #e7ede9;
    border-right: 1px solid #e7ede9;
    text-align: center;
    font-weight: 600;
    color: #2d3748;
  }}
  .clean-table td:last-child {{
    border-right: none;
  }}
  .clean-table tr:nth-child(even) td {{
    background-color: #f7faf8;
  }}
  .clean-table tr:last-child td {{
    border-bottom: none;
  }}
  .clean-table .highlight-val {{
    color: #144732;
    font-weight: 800;
  }}
  .clean-table .gold-val {{
    color: #a16207;
    font-weight: 800;
  }}
  .clean-table .num-badge {{
    display: inline-block;
    background: #144732;
    color: #ffffff;
    font-weight: 800;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 13px;
  }}
  .clean-table tr.crown-row td {{
    background-color: #144732 !important;
    color: #ffffff !important;
  }}

  /* Badges & Pills */
  .pill-green {{
    background-color: #e6f4ea;
    border: 1px solid #b7e1cd;
    color: #137333;
    font-weight: 700;
    border-radius: 20px;
    padding: 3px 12px;
    font-size: 12.5px;
    display: inline-block;
  }}
  .pill-gold {{
    background-color: #fdf6ea;
    border: 1px solid #f3d9a2;
    color: #8c5b16;
    font-weight: 700;
    border-radius: 20px;
    padding: 3px 12px;
    font-size: 12.5px;
    display: inline-block;
  }}
  .bottom-banner-green {{
    background: #144732;
    color: #ffffff;
    padding: 12px 24px;
    border-radius: 12px;
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    box-shadow: 0 4px 14px rgba(20, 71, 50, 0.2);
  }}

  /* Product Cards */
  .product-box {{
    background: #ffffff;
    border: 1px solid #e7e4dc;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    padding: 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }}
  .product-img-wrapper {{
    height: 195px;
    background-color: #fcfbf9;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 8px;
    margin-bottom: 10px;
  }}
  .product-img-wrapper img {{
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
  }}
  .product-title {{
    font-size: 16px;
    font-weight: 800;
    color: #144732;
    line-height: 1.25;
    margin-bottom: 4px;
  }}
  .product-sub {{
    font-size: 12px;
    color: #718096;
    line-height: 1.35;
    margin-bottom: 8px;
  }}
  .product-bottom-row {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    border-top: 1px solid #edf2f7;
  }}

</style>
</head>
<body>

<!-- ============================================================== -->
<!-- SLIDE 1: COVER PAGE (Exact Compliance Draft Split Style) -->
<!-- ============================================================== -->
<div class="slide" style="flex-direction: row; background: #144732;">
  
  <!-- Left Side: Dark Forest Green -->
  <div style="flex: 1.15; padding: 50px 50px 40px 55px; display: flex; flex-direction: column; justify-content: space-between; color: #ffffff;">
    <div>
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
        <img src="{img_logo}" style="width: 58px; height: 58px; object-fit: contain; background: white; border-radius: 50%; padding: 4px;" alt="SGM Logo">
        <div>
          <h1 style="font-size: 42px; font-weight: 900; letter-spacing: 0.5px; line-height: 1; color: #ffffff;">SGM MART</h1>
          <p style="font-size: 14px; font-weight: 700; color: #d4a359; letter-spacing: 1.5px; text-transform: uppercase;">ONLINE SERVICE PVT. LTD.</p>
        </div>
      </div>

      <div style="height: 2px; width: 100%; background: #d4a359; margin: 15px 0 20px 0; opacity: 0.85;"></div>

      <div style="font-size: 14px; font-weight: 700; color: #d4a359; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px;">
        BUSINESS OVERVIEW & MLM PLAN | व्यापार योजना
      </div>

      <h2 style="font-size: 34px; font-weight: 800; line-height: 1.25; color: #ffffff; margin-bottom: 14px;">
        उत्पादों के साथ व्यापार का अवसर<br>
        <span style="font-size: 24px; font-weight: 600; color: #a7f3d0;">Unlimited Growth with Quality Products</span>
      </h2>

      <p style="font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 6px;">
        S G M MART Online Service
      </p>
      <p style="font-size: 15px; color: #cbd5e1; font-weight: 500; margin-bottom: 18px;">
        मार्केट रेट पर उपयोगी उत्पाद - पारदर्शी जानकारी - 0% इन्वेस्टमेंट महा-प्लान
      </p>

      <!-- Slogan Box -->
      <div style="background: rgba(212, 163, 89, 0.15); border-left: 4px solid #d4a359; padding: 12px 18px; border-radius: 0 10px 10px 0; margin-bottom: 22px;">
        <p style="font-size: 21px; font-weight: 800; color: #fef08a; font-family: 'Hind', sans-serif;">
          “बेरोजगारी और रोग मुक्त हो भारत हमारा”
        </p>
        <p style="font-size: 13px; color: #e2e8f0; font-weight: 500;">
          Disease-Free & Unemployment-Free India Mission
        </p>
      </div>

      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <span style="background: rgba(255,255,255,0.12); padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;">🛍️ मार्केट रेट प्रोडक्ट्स</span>
        <span style="background: rgba(255,255,255,0.12); padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;">💎 0% इन्वेस्टमेंट</span>
        <span style="background: rgba(255,255,255,0.12); padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;">⚡ वर्किंग + ऑटोपूल</span>
        <span style="background: rgba(255,255,255,0.12); padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;">💰 डेली क्लोजिंग / वीकली पेआउट</span>
      </div>
    </div>

    <!-- Bottom contact in cover -->
    <div>
      <div style="font-size: 16px; font-weight: 700; color: #d4a359; margin-bottom: 4px;">
        🌐 www.sadgurumart.online
      </div>
      <div style="font-size: 13.5px; color: #cbd5e1;">
        📞 कॉल: <strong>6267392508</strong> &nbsp;|&nbsp; 💬 व्हाट्सऐप: <strong>7611148925</strong>
      </div>
      <div style="font-size: 11px; color: #94a3b8; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
        OFFICIAL BUSINESS PRESENTATION • HINDI & ENGLISH EDITION
      </div>
    </div>
  </div>

  <!-- Right Side: Flagship Tea Poster in White Frame -->
  <div style="flex: 0.85; background: #f6f4ed; padding: 25px; display: flex; align-items: center; justify-content: center;">
    <div style="width: 100%; height: 100%; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; padding: 8px;">
      <img src="{img_chai}" style="max-height: 100%; max-width: 100%; object-fit: contain; border-radius: 14px;" alt="SGM Chai Creative">
    </div>
  </div>

</div>

<!-- ============================================================== -->
<!-- SLIDE 2: 01 | COMPANY OVERVIEW (SGM MART का परिचय) -->
<!-- ============================================================== -->
<div class="slide">
  <div class="slide-header">
    <div class="header-idx">01 | परिचय | OVERVIEW</div>
    <div class="header-title">
      SGM MART का परिचय <span class="en-sub">| Company Overview & Mission</span>
    </div>
  </div>

  <div class="slide-subheader">
    उत्पाद-केंद्रित व्यापार और ग्राहक भरोसे पर आधारित पहल | Product-Centric Business & Customer-First Opportunity
  </div>

  <div class="slide-body">
    <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 24px; align-items: stretch; height: 100%;">
      
      <!-- Left Content -->
      <div style="display: flex; flex-direction: column; justify-content: space-between;">
        <div class="card card-bordered-green" style="padding: 20px;">
          <h3 style="font-size: 22px; font-weight: 800; color: #144732; margin-bottom: 8px;">
            SGM MART Online Service
          </h3>
          <p style="font-size: 15.5px; line-height: 1.6; color: #2d3748; font-family: 'Hind', sans-serif;">
            <strong>SGM MART</strong> का उद्देश्य दैनिक उपयोग, किचन, हेल्थकेयर, पर्सनल केयर, होम केयर और अन्य श्रेणियों के उपयोगी उत्पादों को ग्राहकों तक स्पष्ट कीमत और सही जानकारी के साथ पहुँचाना है।
          </p>
          <p style="font-size: 14px; line-height: 1.5; color: #4a5568; margin-top: 6px;">
            Our mission is to deliver branded, daily-use, and healthcare products directly to consumers at honest market prices with a 100% risk-free home-based earning platform.
          </p>
        </div>

        <div class="card" style="padding: 20px;">
          <h4 style="font-size: 18px; font-weight: 800; color: #144732; margin-bottom: 12px;">
            हमारा फोकस | Strategic Focus Areas
          </h4>
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: #2d3748;">
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <span style="color: #144732; font-weight: 800;">✔</span>
              <span><strong>उत्पाद की गुणवत्ता व सही जानकारी:</strong> Genuine quality, transparent pricing, and comprehensive product information.</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <span style="color: #144732; font-weight: 800;">✔</span>
              <span><strong>0% इन्वेस्टमेंट रिस्क:</strong> Zero capital risk—anyone can start and earn from home.</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <span style="color: #144732; font-weight: 800;">✔</span>
              <span><strong>वर्किंग एवं नॉन-वर्किंग प्लान:</strong> Dual-earning system for both active leaders and consumers.</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <span style="color: #144732; font-weight: 800;">✔</span>
              <span><strong>पारदर्शी बिलिंग और नियमित पेआउट:</strong> Daily closing and weekly direct bank withdrawals.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Visual Image -->
      <div class="card" style="padding: 12px; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
        <div style="width: 100%; height: 350px; background: #fcfbf9; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          <img src="{img_chai}" style="max-height: 100%; max-width: 100%; object-fit: contain; border-radius: 10px;" alt="SGM Chai">
        </div>
        <div style="width: 100%; margin-top: 10px; background: #e6f4ea; border: 1px solid #b7e1cd; padding: 10px; border-radius: 10px; text-align: center;">
          <span style="font-size: 13.5px; font-weight: 800; color: #137333; text-transform: uppercase; letter-spacing: 0.5px;">
            PRODUCT-FIRST • CUSTOMER-FOCUSED • ZERO RISK
          </span>
        </div>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.online</div>
      <div class="footer-right">02 / 15</div>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- SLIDE 3: 02 | VISION & MISSION (हमारा विज़न और मिशन) -->
<!-- ============================================================== -->
<div class="slide">
  <div class="slide-header">
    <div class="header-idx">02 | दिशा | DIRECTION & GOALS</div>
    <div class="header-title">
      हमारा विज़न और मिशन <span class="en-sub">| Vision & Mission</span>
    </div>
  </div>

  <div class="slide-subheader">
    दीर्घकालीन भरोसा - गुणवत्ता - जिम्मेदार व्यापार | Long-Term Trust, Quality & Responsible Business
  </div>

  <div class="slide-body">
    <div class="grid-2" style="align-items: stretch; margin-bottom: 16px;">
      
      <!-- VISION CARD -->
      <div class="card card-bordered-green" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 24px; font-weight: 800; color: #144732;">
              VISION | विज़न
            </h3>
            <span class="pill-green">भविष्य दृष्टि</span>
          </div>
          
          <p style="font-size: 16px; font-weight: 700; color: #144732; line-height: 1.5; margin-bottom: 14px; font-family: 'Hind', sans-serif;">
            भारत के अधिक से अधिक परिवारों तक उपयोगी उत्पाद उचित मूल्य और विश्वसनीय सेवा के साथ पहुँचाना।
          </p>

          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 14px; color: #4a5568;">
            <div>• स्थानीय स्तर पर उत्पाद-आधारित स्वरोजगार और जिम्मेदार रिटेलिंग को बढ़ावा देना।</div>
            <div>• To empower Indian youth and homemakers with dignified, home-based self-employment.</div>
            <div>• प्रत्येक घर में शुद्ध, मिलावट-रहित और प्राकृतिक जीवनशैली का प्रचार-प्रसार करना।</div>
          </div>
        </div>

        <div style="background: #f7faf8; border: 1px solid #d5ded8; padding: 10px 14px; border-radius: 8px; margin-top: 14px;">
          <span style="font-size: 13px; font-weight: 700; color: #144732;">दीर्घकालीन संकल्प:</span>
          <span style="font-size: 13px; color: #4a5568;"> स्वस्थ समाज, समृद्ध परिवार और सशक्त आत्मनिर्भर भारत।</span>
        </div>
      </div>

      <!-- MISSION CARD -->
      <div class="card card-bordered-gold" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="font-size: 24px; font-weight: 800; color: #a16207;">
              MISSION | मिशन
            </h3>
            <span class="pill-gold">कार्रवाई लक्ष्य</span>
          </div>

          <p style="font-size: 16px; font-weight: 700; color: #a16207; line-height: 1.5; margin-bottom: 14px; font-family: 'Hind', sans-serif;">
            ग्राहकों को स्पष्ट product information, सही कीमत और बेहतर सहायता देना।
          </p>

          <div style="display: flex; flex-direction: column; gap: 10px; font-size: 14px; color: #4a5568;">
            <div>• हर बिक्री का पक्का रिकॉर्ड रखना, पार्टनर्स को पारदर्शी प्रोत्साहन प्रदान करना।</div>
            <div>• To build an honest direct-selling ecosystem driven by genuine consumer demand.</div>
            <div>• 0% इन्वेस्टमेंट के साथ हर नागरिक को असीमित आय अर्जित करने का अवसर देना।</div>
          </div>
        </div>

        <div style="background: #fdfaf3; border: 1px solid #f3d9a2; padding: 10px 14px; border-radius: 8px; margin-top: 14px;">
          <span style="font-size: 13px; font-weight: 700; color: #8c5b16;">हमारा नियम:</span>
          <span style="font-size: 13px; color: #4a5568;"> पहले ग्राहक, फिर उत्पाद, और हमेशा पारदर्शिता।</span>
        </div>
      </div>

    </div>

    <!-- Bottom Green Motto Bar -->
    <div class="bottom-banner-green">
      “S G M Mart का एक ही नारा — बेरोजगारी और रोग मुक्त हो भारत हमारा” | A Mission for a Healthy & Wealthy India
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.online</div>
      <div class="footer-right">03 / 15</div>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- SLIDE 4: 03 | 9 PRODUCT CATEGORIES (एक ही प्लेटफॉर्म पर 9 कैटेगरी) -->
<!-- ============================================================== -->
<div class="slide">
  <div class="slide-header">
    <div class="header-idx">03 | उत्पाद श्रेणियाँ | PRODUCT CATEGORIES</div>
    <div class="header-title">
      एक ही प्लेटफॉर्म पर 9 प्रमुख कैटेगरी <span class="en-sub">| 9 Comprehensive Segments</span>
    </div>
  </div>

  <div class="slide-subheader">
    मार्केट रेट में ऑल मार्केट के ब्रांडेड प्रोडक्ट्स | Branded Products for Daily Life at Market Competitive Prices
  </div>

  <div class="slide-body">
    <div class="grid-3" style="gap: 16px;">
      
      <!-- 01 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px;">
        <div style="background: #144732; color: #d4a359; font-weight: 900; font-size: 18px; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          01
        </div>
        <div>
          <h4 style="font-size: 17px; font-weight: 800; color: #144732;">हेल्थ केयर | Health Care</h4>
          <p style="font-size: 12px; color: #718096;">तुलसी ड्रॉप्स, बेरी जूस, वेलनेस सप्लीमेंट्स</p>
        </div>
      </div>

      <!-- 02 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px;">
        <div style="background: #144732; color: #d4a359; font-weight: 900; font-size: 18px; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          02
        </div>
        <div>
          <h4 style="font-size: 17px; font-weight: 800; color: #144732;">होम केयर | Home Care</h4>
          <p style="font-size: 12px; color: #718096;">प्रीमियम अगरबत्ती, धूप, होम एसेंशियल्स</p>
        </div>
      </div>

      <!-- 03 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px;">
        <div style="background: #144732; color: #d4a359; font-weight: 900; font-size: 18px; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          03
        </div>
        <div>
          <h4 style="font-size: 17px; font-weight: 800; color: #144732;">किचन केयर | Kitchen Care</h4>
          <p style="font-size: 12px; color: #718096;">शाही इलायची चाय, अमृततुल्य चाय व रसोई उत्पाद</p>
        </div>
      </div>

      <!-- 04 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px;">
        <div style="background: #144732; color: #d4a359; font-weight: 900; font-size: 18px; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          04
        </div>
        <div>
          <h4 style="font-size: 17px; font-weight: 800; color: #144732;">पर्सनल केयर | Personal Care</h4>
          <p style="font-size: 12px; color: #718096;">दंत बुट्टी हर्बल पेस्ट, 21 हर्ब्स हेयर ऑयल</p>
        </div>
      </div>

      <!-- 05 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px;">
        <div style="background: #144732; color: #d4a359; font-weight: 900; font-size: 18px; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          05
        </div>
        <div>
          <h4 style="font-size: 17px; font-weight: 800; color: #144732;">ब्यूटी केयर | Beauty Care</h4>
          <p style="font-size: 12px; color: #718096;">केसर फेस वॉश, अनियन शैम्पू, 7-इन-1 फेस क्रीम</p>
        </div>
      </div>

      <!-- 06 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px;">
        <div style="background: #144732; color: #d4a359; font-weight: 900; font-size: 18px; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          06
        </div>
        <div>
          <h4 style="font-size: 17px; font-weight: 800; color: #144732;">कपड़े | Apparel / Garments</h4>
          <p style="font-size: 12px; color: #718096;">दैनिक व फैशनेबल परिधान संग्रह</p>
        </div>
      </div>

      <!-- 07 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px;">
        <div style="background: #144732; color: #d4a359; font-weight: 900; font-size: 18px; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          07
        </div>
        <div>
          <h4 style="font-size: 17px; font-weight: 800; color: #144732;">ज्वेलरी | Fashion Jewellery</h4>
          <p style="font-size: 12px; color: #718096;">आधुनिक व पारंपरिक डिजाइनर आभूषण</p>
        </div>
      </div>

      <!-- 08 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px;">
        <div style="background: #144732; color: #d4a359; font-weight: 900; font-size: 18px; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          08
        </div>
        <div>
          <h4 style="font-size: 17px; font-weight: 800; color: #144732;">एग्रीकल्चर | Agriculture</h4>
          <p style="font-size: 12px; color: #718096;">जैविक खाद, पौध पोषण एवं फसल सुरक्षा उत्पाद</p>
        </div>
      </div>

      <!-- 09 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px;">
        <div style="background: #144732; color: #d4a359; font-weight: 900; font-size: 18px; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          09
        </div>
        <div>
          <h4 style="font-size: 17px; font-weight: 800; color: #144732;">इलेक्ट्रॉनिक्स | Electronics</h4>
          <p style="font-size: 12px; color: #718096;">स्मार्ट गैजेट्स, मोबाइल एक्सेसरीज व अप्लायंसेज</p>
        </div>
      </div>

    </div>

    <div style="margin-top: 14px; text-align: center; font-size: 13px; color: #718096;">
      नोट: सभी श्रेणियों के विस्तृत SKU, पैक साइज और कीमतें अधिकृत पोर्टल पर लगातार अपडेट की जाती हैं।
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.online</div>
      <div class="footer-right">04 / 15</div>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- SLIDE 5: 04 | PRODUCT GALLERY 1 (पर्सनल केयर और ब्यूटी केयर) -->
<!-- ============================================================== -->
<div class="slide">
  <div class="slide-header">
    <div class="header-idx">04 | प्रोडक्ट गैलरी | PRODUCT SHOWCASE</div>
    <div class="header-title">
      पर्सनल केयर और ब्यूटी केयर <span class="en-sub">| Personal Care & Beauty Range</span>
    </div>
  </div>

  <div class="slide-subheader">
    100% शुद्ध आयुर्वेदिक एवं दैनिक सौंदर्य उत्पाद | 100% Ayurvedic Skin & Hair Solutions
  </div>

  <div class="slide-body">
    <div class="grid-4" style="gap: 16px;">
      
      <!-- Product 1: Kashmiri Face Wash -->
      <div class="product-box">
        <div class="product-img-wrapper">
          <img src="{img_face}" alt="Kashmiri Saffron Face Wash">
        </div>
        <div>
          <div class="product-title">Kashmiri Saffron Face Wash</div>
          <div style="font-size: 13px; font-weight: 700; color: #a16207;">कश्मीरी केसर फेस वॉश</div>
          <div class="product-sub">
            200 ml | Neem, Aloe Vera, Turmeric & Tea Tree Oil. Reduces pimples & gives natural glow.
          </div>
        </div>
        <div class="product-bottom-row">
          <span style="font-size: 12px; color: #718096;">200 ml</span>
          <span class="pill-gold">MRP ₹280</span>
        </div>
      </div>

      <!-- Product 2: Dant Butti -->
      <div class="product-box">
        <div class="product-img-wrapper">
          <img src="{img_dant}" alt="Dant Butti Toothpaste">
        </div>
        <div>
          <div class="product-title">Dant Butti Herbal Toothpaste</div>
          <div style="font-size: 13px; font-weight: 700; color: #144732;">दंत बुट्टी हर्बल पेस्ट</div>
          <div class="product-sub">
            100g | Magic of 11 Herbs. Cavity protection, strong enamel & tooth pain relief.
          </div>
        </div>
        <div class="product-bottom-row">
          <span style="font-size: 12px; color: #718096;">100 g</span>
          <span class="pill-green">MRP ₹95</span>
        </div>
      </div>

      <!-- Product 3: Onion Shampoo -->
      <div class="product-box">
        <div class="product-img-wrapper">
          <img src="{img_shampoo}" alt="Onion & Ginger Shampoo">
        </div>
        <div>
          <div class="product-title">Onion & Ginger Shampoo</div>
          <div style="font-size: 13px; font-weight: 700; color: #dc2626;">अनियन & जिंजर शैम्पू</div>
          <div class="product-sub">
            300 ml + 30 ml Free | Stops hair fall, accelerates hair growth, 100% natural.
          </div>
        </div>
        <div class="product-bottom-row">
          <span style="font-size: 12px; color: #718096;">330 ml</span>
          <span class="pill-gold">MRP ₹399</span>
        </div>
      </div>

      <!-- Product 4: 21 Herbs Hair Oil -->
      <div class="product-box">
        <div class="product-img-wrapper">
          <img src="{img_oil}" alt="21 Herbs Hair Oil">
        </div>
        <div>
          <div class="product-title">21 Herbs Hair Oil</div>
          <div style="font-size: 13px; font-weight: 700; color: #144732;">21 हर्ब्स हेयर ऑयल</div>
          <div class="product-sub">
            200 ml + 10 ml Free | Bhringraj, Amla, Brahmi, Hibiscus. Strengthens hair roots.
          </div>
        </div>
        <div class="product-bottom-row">
          <span style="font-size: 12px; color: #718096;">210 ml</span>
          <span class="pill-gold">MRP ₹499</span>
        </div>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.online</div>
      <div class="footer-right">05 / 15</div>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- SLIDE 6: 05 | PRODUCT GALLERY 2 (दैनिक उपयोग और हेल्थ केयर उत्पाद) -->
<!-- ============================================================== -->
<div class="slide">
  <div class="slide-header">
    <div class="header-idx">05 | प्रोडक्ट गैलरी | PRODUCT SHOWCASE</div>
    <div class="header-title">
      दैनिक उपयोग और हेल्थ केयर उत्पाद <span class="en-sub">| Wellness & Kitchen Essentials</span>
    </div>
  </div>

  <div class="slide-subheader">
    उपलब्ध तस्वीरों के आधार पर SGM MART कैटलॉग | Authentic Product Catalog Highlights
  </div>

  <div class="slide-body">
    <div class="grid-4" style="gap: 16px;">
      
      <!-- Product 1: Shahi Elaichi Chai -->
      <div class="product-box">
        <div class="product-img-wrapper">
          <img src="{img_chai}" alt="Shahi Elaichi Chai">
        </div>
        <div>
          <div class="product-title">Shahi Elaichi Chai</div>
          <div style="font-size: 13px; font-weight: 700; color: #144732;">SGM शाही इलायची चाय</div>
          <div class="product-sub">
            असम की चाय पत्ती और असली हरी इलायची। स्वाद, ताजगी और स्फूर्ति का बेमिसाल संगम।
          </div>
        </div>
        <div class="product-bottom-row">
          <span style="font-size: 12px; color: #718096;">500g / 1 Kg</span>
          <span class="pill-green">150-300 PV</span>
        </div>
      </div>

      <!-- Product 2: Tulsi Drops -->
      <div class="product-box">
        <div class="product-img-wrapper">
          <img src="{img_tulsi}" alt="Tulsi Drops">
        </div>
        <div>
          <div class="product-title">Immunity Tulsi Drops</div>
          <div style="font-size: 13px; font-weight: 700; color: #144732;">पंच तुलसी ड्रॉप्स</div>
          <div class="product-sub">
            30 ml | 5 दुर्लभ तुलसी का अर्क। सर्दी, जुकाम, फ्लू व एलर्जी से प्राकृतिक सुरक्षा।
          </div>
        </div>
        <div class="product-bottom-row">
          <span style="font-size: 12px; color: #718096;">100 PV</span>
          <span class="pill-green">₹150 मात्र</span>
        </div>
      </div>

      <!-- Product 3: Premium Agarbatti -->
      <div class="product-box">
        <div class="product-img-wrapper">
          <img src="{img_agarbatti}" alt="Premium Agarbatti">
        </div>
        <div>
          <div class="product-title">Premium Agarbatti</div>
          <div style="font-size: 13px; font-weight: 700; color: #a16207;">सुगंधित अगरबत्ती</div>
          <div class="product-sub">
            गुलाब, मोगरा और चंदन वेरिएंट्स। घर व मंदिर में शांतिपूर्ण आध्यात्मिक वातावरण दे।
          </div>
        </div>
        <div class="product-bottom-row">
          <span style="font-size: 12px; color: #718096;">Home Care</span>
          <span class="pill-gold">MRP ₹80-90</span>
        </div>
      </div>

      <!-- Product 4: Mix Berries Juice -->
      <div class="product-box">
        <div class="product-img-wrapper">
          <img src="{img_berry}" alt="Mix Berries Juice">
        </div>
        <div>
          <div class="product-title">Mix Berries Juice</div>
          <div style="font-size: 13px; font-weight: 700; color: #ec4899;">मिक्स बेरी जूस</div>
          <div class="product-sub">
            500 ml | 52 शक्तिशाली जड़ी-बूटियों का प्राकृतिक मिश्रण। ऊर्जा व इम्युनिटी बूस्टर।
          </div>
        </div>
        <div class="product-bottom-row">
          <span style="font-size: 12px; color: #718096;">500 PV</span>
          <span class="pill-gold">₹750 मात्र</span>
        </div>
      </div>

    </div>

    <!-- Secondary note on cream & other products -->
    <div style="margin-top: 10px; font-size: 12.5px; color: #718096; text-align: center;">
      अतिरिक्त उपलब्ध उत्पाद: <strong>bVeda 7-in-1 फेस क्रीम (50 gm)</strong> | सभी उत्पाद 100% प्राकृतिक एवं सुरक्षित।
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.online</div>
      <div class="footer-right">06 / 15</div>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- SLIDE 7: 06 | ACTIVATION PACKAGES & PRE-LAUNCH OFFER -->
<!-- ============================================================== -->
<div class="slide">
  <div class="slide-header">
    <div class="header-idx">06 | पैकेज विवरण | ACTIVATION PACKAGES</div>
    <div class="header-title">
      उत्पाद पैकेज और PV विवरण <span class="en-sub">| Joining Packages & Special Offer</span>
    </div>
  </div>

  <div class="slide-subheader">
    सुलभ शुरुआत मात्र ₹150 से | Transparent Product Bundles with Instant Business PV
  </div>

  <div class="slide-body">
    <div style="display: grid; grid-template-columns: 1.35fr 0.85fr; gap: 24px; align-items: center;">
      
      <!-- Table of 6 Packages -->
      <div>
        <table class="clean-table">
          <thead>
            <tr>
              <th style="width: 12%;">क्रम | S.N.</th>
              <th style="width: 25%;">पैकेज मूल्य | Price</th>
              <th style="width: 20%;">पी वी | PV</th>
              <th style="width: 43%;">उत्पाद पैकेज | Product Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="num-badge">01</span></td>
              <td class="highlight-val" style="font-size: 16px;">₹ 349 /-</td>
              <td><span class="pill-green">150 PV</span></td>
              <td style="text-align: left; font-weight: 700;">☕ इलायची चाय (500 gm)</td>
            </tr>
            <tr>
              <td><span class="num-badge">02</span></td>
              <td class="highlight-val" style="font-size: 16px;">₹ 649 /-</td>
              <td><span class="pill-green">300 PV</span></td>
              <td style="text-align: left; font-weight: 700;">☕ इलायची चाय (1 Kg)</td>
            </tr>
            <tr>
              <td><span class="num-badge">03</span></td>
              <td class="highlight-val" style="font-size: 16px;">₹ 349 /-</td>
              <td><span class="pill-green">150 PV</span></td>
              <td style="text-align: left; font-weight: 700;">🍃 अमृत तुल्य चाय (500 gm)</td>
            </tr>
            <tr>
              <td><span class="num-badge">04</span></td>
              <td class="highlight-val" style="font-size: 16px;">₹ 699 /-</td>
              <td><span class="pill-green">300 PV</span></td>
              <td style="text-align: left; font-weight: 700;">🍃 अमृत तुल्य चाय (1 Kg)</td>
            </tr>
            <tr>
              <td><span class="num-badge">05</span></td>
              <td class="highlight-val" style="font-size: 16px; color: #15803d;">₹ 150 /-</td>
              <td><span class="pill-green">100 PV</span></td>
              <td style="text-align: left; font-weight: 700; color: #15803d;">🌿 तुलसी ड्रॉप्स (30 ml)</td>
            </tr>
            <tr>
              <td><span class="num-badge">06</span></td>
              <td class="highlight-val" style="font-size: 16px;">₹ 750 /-</td>
              <td><span class="pill-gold">500 PV</span></td>
              <td style="text-align: left; font-weight: 700;">🍇 मिक्स बेरी जूस (500 ml)</td>
            </tr>
          </tbody>
        </table>
        <p style="font-size: 12.5px; color: #718096; margin-top: 8px;">
          * किसी भी एक पैकेज के साथ आईडी एक्टिवेट कर सभी 16 प्रकार की आमदनी प्राप्त करने की योग्यता मिलती है।
        </p>
      </div>

      <!-- Pre-launching Special Offer Card -->
      <div class="card card-bordered-gold" style="padding: 24px; text-align: center; background: #fffcf5;">
        <div style="font-size: 28px; margin-bottom: 6px;">🔥 🌹 🔥</div>
        <span class="pill-gold" style="font-size: 12px; font-weight: 800; margin-bottom: 8px;">सीमित समय हेतु विशेष अवसर</span>
        
        <h3 style="font-size: 23px; font-weight: 900; color: #a16207; margin: 8px 0;">
          प्री-लॉन्चिंग स्पेशल ऑफर
        </h3>
        <p style="font-size: 13px; color: #8c5b16; font-weight: 600; text-transform: uppercase;">
          Pre-Launching Booster Offer
        </p>

        <div style="background: #ffffff; border: 2px dashed #c8973e; padding: 16px; border-radius: 12px; margin: 14px 0;">
          <p style="font-size: 18px; font-weight: 800; color: #2d3748; font-family: 'Hind', sans-serif;">
            मात्र <span style="color: #a16207; font-size: 26px;">600 PV</span> का डायरेक्ट बिजनेस करने पर
          </p>
          <p style="font-size: 21px; font-weight: 900; color: #144732; margin-top: 4px;">
            👉 1 ID बिल्कुल FREE एक्टिवेशन! 👈
          </p>
        </div>

        <p style="font-size: 13px; color: #718096; line-height: 1.4;">
          अपनी टीम तेजी से बनाएं और प्री-लॉन्चिंग ऑफर के तहत अधिकतम फ्री एक्टिवेशन का लाभ लें!
        </p>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.online</div>
      <div class="footer-right">07 / 15</div>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- SLIDE 8: 07 | 16 TYPES OF INCOME (16 प्रकार की महा इनकम) -->
<!-- ============================================================== -->
<div class="slide">
  <div class="slide-header">
    <div class="header-idx">07 | आय योजना | 16 INCOME HEADS</div>
    <div class="header-title">
      16 प्रकार की महा इनकम <span class="en-sub">| 16 Lucrative Income Streams</span>
    </div>
  </div>

  <div class="slide-subheader">
    वर्किंग और नॉन-वर्किंग का संतुलित महा-प्लान | Comprehensive Balanced Earning Ecosystem
  </div>

  <div class="slide-body">
    <div class="grid-4" style="gap: 12px;">
      
      <!-- 1 -->
      <div class="card card-bordered-green" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">01</span>
          <span class="pill-green" style="font-size: 11px; padding: 2px 8px;">5% - 50%</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #144732; margin-top: 3px;">1. रिटेल प्रॉफिट</h4>
        <p style="font-size: 11.5px; color: #718096;">Retail Profit on MRP</p>
      </div>

      <!-- 2 -->
      <div class="card card-bordered-gold" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">02</span>
          <span class="pill-gold" style="font-size: 11px; padding: 2px 8px;">10% PV</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #a16207; margin-top: 3px;">2. डायरेक्ट इनकम</h4>
        <p style="font-size: 11.5px; color: #718096;">Direct Referral Income</p>
      </div>

      <!-- 3 -->
      <div class="card card-bordered-green" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">03</span>
          <span class="pill-green" style="font-size: 11px; padding: 2px 8px;">10% Match</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #144732; margin-top: 3px;">3. मैचिंग इनकम</h4>
        <p style="font-size: 11.5px; color: #718096;">Binary Pair Matching</p>
      </div>

      <!-- 4 -->
      <div class="card card-bordered-gold" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">04</span>
          <span class="pill-gold" style="font-size: 11px; padding: 2px 8px;">10%</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #a16207; margin-top: 3px;">4. डायरेक्ट स्पॉन्सर</h4>
        <p style="font-size: 11.5px; color: #718096;">Sponsor Matching Royalty</p>
      </div>

      <!-- 5 -->
      <div class="card card-bordered-green" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">05</span>
          <span class="pill-green" style="font-size: 11px; padding: 2px 8px;">3% Pool</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #144732; margin-top: 3px;">5. अवार्ड & रिवार्ड्स</h4>
        <p style="font-size: 11.5px; color: #718096;">Awards & Rewards</p>
      </div>

      <!-- 6 -->
      <div class="card card-bordered-gold" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">06</span>
          <span class="pill-gold" style="font-size: 11px; padding: 2px 8px;">5% (3k PV)</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #a16207; margin-top: 3px;">6. लीडरशिप इनकम</h4>
        <p style="font-size: 11.5px; color: #718096;">Leadership Royalty Pool</p>
      </div>

      <!-- 7 -->
      <div class="card card-bordered-green" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">07</span>
          <span class="pill-green" style="font-size: 11px; padding: 2px 8px;">5% (5k PV)</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #144732; margin-top: 3px;">7. कंपनी CTO इनकम</h4>
        <p style="font-size: 11.5px; color: #718096;">Company Turnover Royalty</p>
      </div>

      <!-- 8 -->
      <div class="card card-bordered-gold" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">08</span>
          <span class="pill-gold" style="font-size: 11px; padding: 2px 8px;">₹12.80 Cr</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #a16207; margin-top: 3px;">8. ऑटोपूल इनकम</h4>
        <p style="font-size: 11.5px; color: #718096;">7-Level Universal Pool</p>
      </div>

      <!-- 9 -->
      <div class="card card-bordered-green" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">09</span>
          <span class="pill-green" style="font-size: 11px; padding: 2px 8px;">10% BV</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #144732; margin-top: 3px;">9. परचेस इनकम</h4>
        <p style="font-size: 11.5px; color: #718096;">Self Purchase Cashback</p>
      </div>

      <!-- 10 -->
      <div class="card card-bordered-gold" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">10</span>
          <span class="pill-gold" style="font-size: 11px; padding: 2px 8px;">10% Team</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #a16207; margin-top: 3px;">10. रीपरचेस इनकम</h4>
        <p style="font-size: 11.5px; color: #718096;">Team Repurchase Income</p>
      </div>

      <!-- 11 -->
      <div class="card card-bordered-green" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">11</span>
          <span class="pill-green" style="font-size: 11px; padding: 2px 8px;">2% CTO</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #144732; margin-top: 3px;">11. मोबाइल फंड</h4>
        <p style="font-size: 11.5px; color: #718096;">Mobile Fund Royalty</p>
      </div>

      <!-- 12 -->
      <div class="card card-bordered-gold" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">12</span>
          <span class="pill-gold" style="font-size: 11px; padding: 2px 8px;">2% CTO</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #a16207; margin-top: 3px;">12. बाइक फंड</h4>
        <p style="font-size: 11.5px; color: #718096;">Bike Fund Royalty</p>
      </div>

      <!-- 13 -->
      <div class="card card-bordered-green" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">13</span>
          <span class="pill-green" style="font-size: 11px; padding: 2px 8px;">2% CTO</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #144732; margin-top: 3px;">13. कार फंड</h4>
        <p style="font-size: 11.5px; color: #718096;">Car Fund Royalty</p>
      </div>

      <!-- 14 -->
      <div class="card card-bordered-gold" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">14</span>
          <span class="pill-gold" style="font-size: 11px; padding: 2px 8px;">2% CTO</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #a16207; margin-top: 3px;">14. हाउस फंड</h4>
        <p style="font-size: 11.5px; color: #718096;">House Fund Royalty</p>
      </div>

      <!-- 15 -->
      <div class="card card-bordered-green" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">15</span>
          <span class="pill-green" style="font-size: 11px; padding: 2px 8px;">2.50%</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #144732; margin-top: 3px;">15. मोबाइल रिचार्ज</h4>
        <p style="font-size: 11.5px; color: #718096;">Mobile Recharge Cashback</p>
      </div>

      <!-- 16 -->
      <div class="card card-bordered-gold" style="padding: 12px 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 11px; font-weight: 800; color: #718096;">16</span>
          <span class="pill-gold" style="font-size: 11px; padding: 2px 8px;">2.50%</span>
        </div>
        <h4 style="font-size: 15px; font-weight: 800; color: #a16207; margin-top: 3px;">16. डीटीएच रिचार्ज</h4>
        <p style="font-size: 11.5px; color: #718096;">DTH Recharge Cashback</p>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.online</div>
      <div class="footer-right">08 / 15</div>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- SLIDE 9: 08 | WORKING INCOMES DETAIL -->
<!-- ============================================================== -->
<div class="slide">
  <div class="slide-header">
    <div class="header-idx">08 | वर्किंग प्लान | WORKING INCOMES</div>
    <div class="header-title">
      सक्रिय वर्किंग इनकम विवरण <span class="en-sub">| Core Working Income Streams</span>
    </div>
  </div>

  <div class="slide-subheader">
    डायरेक्ट, मैचिंग, स्पॉन्सर, लीडरशिप एवं कंपनी CTO रॉयल्टी | Direct, Matching & Leadership Pools
  </div>

  <div class="slide-body">
    <div class="grid-2" style="gap: 24px; align-items: stretch;">
      
      <!-- Left Column: Direct, Matching & Sponsor -->
      <div style="display: flex; flex-direction: column; gap: 14px;">
        
        <div class="card card-bordered-green" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <h4 style="font-size: 17px; font-weight: 800; color: #144732;">1. डायरेक्ट इनकम | Direct Income</h4>
            <span class="pill-green">10% PV</span>
          </div>
          <p style="font-size: 13.5px; color: #2d3748; line-height: 1.45;">
            प्रत्येक नए साथी को सीधे स्पॉन्सर करने पर उनके पैकेज PV का <strong>10%</strong> तुरंत। अनलिमिटेड डायरेक्ट स्पॉन्सर करें।<br>
            <span style="font-size: 12px; color: #718096;">Earn 10% on PV of every directly enrolled business partner.</span>
          </p>
        </div>

        <div class="card card-bordered-gold" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <h4 style="font-size: 17px; font-weight: 800; color: #a16207;">2. मैचिंग इनकम | Matching Income</h4>
            <span class="pill-gold">10% (1:1 Ratio)</span>
          </div>
          <p style="font-size: 13.5px; color: #2d3748; line-height: 1.45;">
            लेफ्ट व राइट टीम बिजनेस मैचिंग पर <strong>10%</strong> मैचिंग इनकम। पहला पेयर 1:2 या 2:1, बाद में 1:1 अनलिमिटेड डेप्थ।<br>
            <span style="font-size: 12px; color: #718096;">10% binary team volume matching with daily closing.</span>
          </p>
        </div>

        <div class="card card-bordered-green" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <h4 style="font-size: 17px; font-weight: 800; color: #144732;">3. डायरेक्ट स्पॉन्सर इनकम | Sponsor Royalty</h4>
            <span class="pill-green">10% Royalty</span>
          </div>
          <p style="font-size: 13.5px; color: #2d3748; line-height: 1.45;">
            आपके डायरेक्ट स्पॉन्सर साथी जितनी भी मैचिंग इनकम कमाएंगे, उनकी कुल कमाई का <strong>10%</strong> आपको आजीवन प्राप्त होगा।<br>
            <span style="font-size: 12px; color: #718096;">Receive 10% matching bonus of your personally sponsored team's earnings.</span>
          </p>
        </div>

      </div>

      <!-- Right Column: Leadership & Company CTO -->
      <div style="display: flex; flex-direction: column; gap: 14px;">
        
        <div class="card card-bordered-gold" style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h4 style="font-size: 19px; font-weight: 800; color: #a16207;">👑 4. लीडरशिप इनकम | Leadership</h4>
            <span class="pill-gold">5% Pool (3000 PV)</span>
          </div>
          <p style="font-size: 14px; color: #2d3748; line-height: 1.5; font-family: 'Hind', sans-serif;">
            जब आपकी डायरेक्ट आईडी से कुल <strong>3000 PV</strong> का डायरेक्ट बिजनेस पूरा हो जाता है, तो आप कंपनी के 5% लीडरशिप पूल में शामिल हो जाते हैं। यह 5% कंपनी टर्नओवर सभी योग्य लीडर्स में मासिक वितरित होता है।
          </p>
          <div style="margin-top: 6px; font-size: 12px; color: #718096;">
            Achieve 3000 direct PV to qualify for 5% company monthly turnover leadership pool.
          </div>
        </div>

        <div class="card card-bordered-green" style="padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <h4 style="font-size: 19px; font-weight: 800; color: #144732;">🏛️ 5. कंपनी CTO रॉयल्टी | Company CTO</h4>
            <span class="pill-green">5% Lifetime (5000 PV)</span>
          </div>
          <p style="font-size: 14px; color: #2d3748; line-height: 1.5; font-family: 'Hind', sans-serif;">
            जब आपका डायरेक्ट बिजनेस <strong>5000 PV</strong> का हो जाता है, तो आप कंपनी के सर्वोच्च <strong>CTO (Company Total Turnover) पार्टनर</strong> बन जाते हैं। कंपनी कुल टर्नओवर से 5% रॉयल्टी आजीवन आपके खाते में जमा होती है।
          </p>
          <div style="margin-top: 6px; font-size: 12px; color: #718096;">
            Achieve 5000 direct PV to earn 5% permanent company total turnover (CTO) royalty.
          </div>
        </div>

      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.online</div>
      <div class="footer-right">09 / 15</div>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- SLIDE 10: 09 | AUTOPOOL PLAN (7 LEVELS - ₹13.19 CRORE) -->
<!-- ============================================================== -->
<div class="slide">
  <div class="slide-header">
    <div class="header-idx">09 | ऑटोपूल योजना | AUTO POOL SYSTEM</div>
    <div class="header-title">
      नॉन-वर्किंग महा ऑटोपूल इनकम <span class="en-sub">| Global 2x2 Auto Pool Matrix</span>
    </div>
  </div>

  <div class="slide-subheader">
    ऑल इंडिया ऑटो-प्लेसमेंट द्वारा ₹13.19 करोड़ से अधिक की कुल आय | Systematic 7-Level Universal Matrix
  </div>

  <div class="slide-body">
    <div style="display: grid; grid-template-columns: 1.45fr 0.75fr; gap: 24px; align-items: center;">
      
      <!-- Table of 7 Levels -->
      <div>
        <table class="clean-table">
          <thead>
            <tr>
              <th style="width: 12%;">लेवल</th>
              <th style="width: 28%;">मैट्रिक्स गणना | Matrix</th>
              <th style="width: 20%;">कुल राशि | Total</th>
              <th style="width: 20%;">अपग्रेड | Upgrade</th>
              <th style="width: 20%;">नेट इनकम | Net Income</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="num-badge">L1</span></td>
              <td style="font-family: monospace; font-size: 15px; font-weight: 700;">2 × ₹100</td>
              <td>₹ 200</td>
              <td style="color: #c53030;">₹ 125</td>
              <td class="highlight-val">₹ 75</td>
            </tr>
            <tr>
              <td><span class="num-badge">L2</span></td>
              <td style="font-family: monospace; font-size: 15px; font-weight: 700;">4 × ₹125</td>
              <td>₹ 500</td>
              <td style="color: #c53030;">₹ 300</td>
              <td class="highlight-val">₹ 200</td>
            </tr>
            <tr>
              <td><span class="num-badge">L3</span></td>
              <td style="font-family: monospace; font-size: 15px; font-weight: 700;">8 × ₹300</td>
              <td>₹ 2,400</td>
              <td style="color: #c53030;">₹ 1,000</td>
              <td class="highlight-val">₹ 1,400</td>
            </tr>
            <tr>
              <td><span class="num-badge">L4</span></td>
              <td style="font-family: monospace; font-size: 15px; font-weight: 700;">16 × ₹1,000</td>
              <td>₹ 16,000</td>
              <td style="color: #c53030;">₹ 6,000</td>
              <td class="highlight-val">₹ 10,000</td>
            </tr>
            <tr>
              <td><span class="num-badge">L5</span></td>
              <td style="font-family: monospace; font-size: 15px; font-weight: 700;">32 × ₹6,000</td>
              <td>₹ 1,92,000</td>
              <td style="color: #c53030;">₹ 75,000</td>
              <td class="highlight-val">₹ 1,17,000</td>
            </tr>
            <tr>
              <td><span class="num-badge">L6</span></td>
              <td style="font-family: monospace; font-size: 15px; font-weight: 700;">64 × ₹75,000</td>
              <td>₹ 48,00,000</td>
              <td style="color: #c53030;">₹ 10,00,000</td>
              <td class="highlight-val">₹ 38,00,000</td>
            </tr>
            <tr style="background-color: #e6f4ea;">
              <td><span class="num-badge" style="background:#15803d;">L7</span></td>
              <td style="font-family: monospace; font-size: 15px; font-weight: 800;">128 × ₹10,00,000</td>
              <td style="font-weight: 800; color: #144732;">₹ 12,80,00,000</td>
              <td style="color: #15803d; font-weight: 700;">NIL (0)</td>
              <td class="highlight-val" style="font-size: 17px; color: #144732;">₹ 12.80 करोड़</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Autopool Explanatory Card -->
      <div class="card card-bordered-green" style="padding: 22px; text-align: center;">
        <div style="font-size: 32px; margin-bottom: 8px;">🌐 ⚡ 💰</div>
        <h3 style="font-size: 20px; font-weight: 800; color: #144732; margin-bottom: 8px;">
          ऑटोपूल प्रणाली कैसे काम करती है?
        </h3>
        <p style="font-size: 13.5px; color: #4a5568; line-height: 1.5; font-family: 'Hind', sans-serif; text-align: left;">
          • पूरे भारत से कंपनी में एक्टिवेट होने वाली आईडिया ऑटोमैटिकली 2x2 मैट्रिक्स में प्लेस होती हैं।<br><br>
          • हर लेवल पूरा होने पर तय अपग्रेड राशि काटकर बाकी राशि <strong>तुरंत आपके विड्रॉल वॉलेट</strong> में जमा हो जाती है।<br><br>
          • 7वें लेवल पर बिना किसी अपग्रेड कटौती के पूरे <strong>12.80 करोड़ रुपये</strong> की ऐतिहासिक आय प्राप्त होती है।
        </p>

        <div style="margin-top: 14px; padding: 12px; background: #fdfaf3; border: 1px solid #f3d9a2; border-radius: 10px;">
          <div style="font-size: 11.5px; color: #8c5b16; text-transform: uppercase; font-weight: 700;">कुल संभावित ऑटोपूल इनकम | Total Income</div>
          <div style="font-size: 22px; font-weight: 900; color: #a16207;">₹ 13,19,28,675/-</div>
          <div style="font-size: 11.5px; color: #144732; font-weight: 700;">(तेरह करोड़ उन्नीस लाख रुपये से अधिक)</div>
        </div>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.online</div>
      <div class="footer-right">10 / 15</div>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- SLIDE 11: 10 | RANK & REWARDS - PART 1 (RANKS 1 TO 7) -->
<!-- ============================================================== -->
<div class="slide">
  <div class="slide-header">
    <div class="header-idx">10 | पहचान और सम्मान | RECOGNITION LADDER (1 - 7)</div>
    <div class="header-title">
      रैंक एवं लाइफस्टाइल रिवार्ड्स <span class="en-sub">| Rank & Rewards (Ranks 1 to 7)</span>
    </div>
  </div>

  <div class="slide-subheader">
    3% रिवार्ड फंड से आपके नेतृत्व का हर कदम पर सम्मान | Dedicated 3% Lifestyle Reward Pool
  </div>

  <div class="slide-body">
    <table class="clean-table" style="font-size: 15px;">
      <thead>
        <tr>
          <th style="width: 10%;">क्र. | S.N.</th>
          <th style="width: 25%;">रैंक पदनाम | Rank Designation</th>
          <th style="width: 18%;">लेफ्ट | Left RP</th>
          <th style="width: 18%;">राइट | Right RP</th>
          <th style="width: 29%;">शानदार रिवार्ड / कैश प्राइज | Reward</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="num-badge">01</span></td>
          <td style="font-weight: 800; color: #144732; text-align: left; padding-left: 25px;">⭐ 1 - स्टार (1-Star)</td>
          <td>30 RP</td>
          <td>30 RP</td>
          <td class="gold-val" style="font-size: 16px;">₹ 100 /- कैश</td>
        </tr>
        <tr>
          <td><span class="num-badge">02</span></td>
          <td style="font-weight: 800; color: #144732; text-align: left; padding-left: 25px;">⭐⭐ 2 - स्टार (2-Star)</td>
          <td>150 RP</td>
          <td>150 RP</td>
          <td class="highlight-val" style="font-size: 16px;">⌚ आकर्षक स्मार्ट रिस्ट वॉच (Watch)</td>
        </tr>
        <tr>
          <td><span class="num-badge">03</span></td>
          <td style="font-weight: 800; color: #144732; text-align: left; padding-left: 25px;">⭐⭐⭐ 3 - स्टार (3-Star)</td>
          <td>500 RP</td>
          <td>500 RP</td>
          <td class="gold-val" style="font-size: 16px;">₹ 1,500 /- कैश</td>
        </tr>
        <tr style="background-color: #f7faf8;">
          <td><span class="num-badge">04</span></td>
          <td style="font-weight: 800; color: #144732; text-align: left; padding-left: 25px;">🥈 सिल्वर (Silver)</td>
          <td style="font-weight: 800;">3,000 RP</td>
          <td style="font-weight: 800;">3,000 RP</td>
          <td class="highlight-val" style="font-size: 16px;">🛕 जगन्नाथ पुरी टूर (Puri Tour)</td>
        </tr>
        <tr style="background-color: #fdfaf3;">
          <td><span class="num-badge" style="background:#a16207;">05</span></td>
          <td style="font-weight: 800; color: #a16207; text-align: left; padding-left: 25px;">🥇 गोल्ड (Gold)</td>
          <td style="font-weight: 800; color: #a16207;">5,000 RP</td>
          <td style="font-weight: 800; color: #a16207;">5,000 RP</td>
          <td class="gold-val" style="font-size: 16px;">📱 ब्रांडेड 5G स्मार्टफोन (Mobile)</td>
        </tr>
        <tr>
          <td><span class="num-badge">06</span></td>
          <td style="font-weight: 800; color: #144732; text-align: left; padding-left: 25px;">💎 रूबी (Ruby)</td>
          <td style="font-weight: 800;">10,000 RP</td>
          <td style="font-weight: 800;">10,000 RP</td>
          <td class="gold-val" style="font-size: 16px;">₹ 30,000 /- कैश प्राइज</td>
        </tr>
        <tr style="background-color: #f7faf8;">
          <td><span class="num-badge">07</span></td>
          <td style="font-weight: 800; color: #144732; text-align: left; padding-left: 25px;">🏆 प्लेटिनम (Platinum)</td>
          <td style="font-weight: 800;">20,000 RP</td>
          <td style="font-weight: 800;">20,000 RP</td>
          <td class="highlight-val" style="font-size: 16px;">🏝️ भव्य रामेश्वरम टूर (Rameshwaram Tour)</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 14px; display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 12px 20px; border-radius: 10px; border: 1px solid #e7e4dc;">
      <span style="font-size: 13.5px; color: #4a5568;">* RP (रिवार्ड पॉइंट्स) की गणना 1:1 लेफ्ट एवं राइट बिजनेस मैचिंग पर की जाती है।</span>
      <span style="font-size: 13.5px; font-weight: 800; color: #144732;">अगले पेज पर देखें: सुपर लक्ज़री बाइक, कार एवं करोड़ों के रिवॉर्ड्स! 👉</span>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.online</div>
      <div class="footer-right">11 / 15</div>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- SLIDE 12: 11 | RANK & REWARDS - PART 2 (RANKS 8 TO 15) -->
<!-- ============================================================== -->
<div class="slide">
  <div class="slide-header">
    <div class="header-idx">11 | करोड़पति क्लब | PRESTIGE LADDER (8 - 15)</div>
    <div class="header-title">
      महा लक्ज़री रिवार्ड्स <span class="en-sub">| Super Luxury Cars, Bikes & Multi-Crore Rewards</span>
    </div>
  </div>

  <div class="slide-subheader">
    शीर्ष नेतृत्व और करोड़पति क्लब के भव्य पुरस्कार | Supreme Recognition for High Achievers
  </div>

  <div class="slide-body">
    <table class="clean-table" style="font-size: 14.5px;">
      <thead>
        <tr>
          <th style="width: 8%;">क्र.</th>
          <th style="width: 25%;">रैंक पदनाम | Rank</th>
          <th style="width: 18%;">लेफ्ट | Left RP</th>
          <th style="width: 18%;">राइट | Right RP</th>
          <th style="width: 31%;">भव्य रिवार्ड / नगद उपहार | Reward</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="num-badge">08</span></td>
          <td style="font-weight: 800; color: #144732; text-align: left; padding-left: 20px;">🟢 एमराल्ड (Emerald)</td>
          <td>40,000 RP</td>
          <td>40,000 RP</td>
          <td class="highlight-val" style="font-size: 15.5px;">🏍️ ब्रांड न्यू बाइक (Motorcycle)</td>
        </tr>
        <tr>
          <td><span class="num-badge">09</span></td>
          <td style="font-weight: 800; color: #144732; text-align: left; padding-left: 20px;">💎 डायमंड (Diamond)</td>
          <td>1,00,000 RP</td>
          <td>1,00,000 RP</td>
          <td class="gold-val" style="font-size: 15.5px;">💵 ₹ 3,00,000 /- (3 लाख कैश)</td>
        </tr>
        <tr style="background-color: #fdfaf3;">
          <td><span class="num-badge" style="background:#a16207;">10</span></td>
          <td style="font-weight: 800; color: #a16207; text-align: left; padding-left: 20px;">💎💎 डबल डायमंड (Double Diamond)</td>
          <td style="font-weight: 800; color: #a16207;">5,00,000 RP</td>
          <td style="font-weight: 800; color: #a16207;">5,00,000 RP</td>
          <td class="gold-val" style="font-size: 16px;">🚗 शानदार चमचमाती कार (Car)</td>
        </tr>
        <tr>
          <td><span class="num-badge">11</span></td>
          <td style="font-weight: 800; color: #144732; text-align: left; padding-left: 20px;">💎💎💎 ट्रिपल डायमंड (Triple Diamond)</td>
          <td>10,00,000 RP</td>
          <td>10,00,000 RP</td>
          <td class="gold-val" style="font-size: 15.5px;">💵 ₹ 30,00,000 /- (30 लाख कैश)</td>
        </tr>
        <tr>
          <td><span class="num-badge">12</span></td>
          <td style="font-weight: 800; color: #144732; text-align: left; padding-left: 20px;">👑 कोहिनूर (Kohinoor)</td>
          <td>20,00,000 RP</td>
          <td>20,00,000 RP</td>
          <td class="gold-val" style="font-size: 15.5px;">💵 ₹ 60,00,000 /- (60 लाख कैश)</td>
        </tr>
        <tr style="background-color: #e6f4ea;">
          <td><span class="num-badge" style="background:#15803d;">13</span></td>
          <td style="font-weight: 800; color: #144732; text-align: left; padding-left: 20px;">🏛️ अम्बेडकर (Ambassador)</td>
          <td style="font-weight: 800;">40,00,000 RP</td>
          <td style="font-weight: 800;">40,00,000 RP</td>
          <td class="highlight-val" style="font-size: 17px; color: #144732;">💰 ₹ 1,00,00,000 /- (1 करोड़)</td>
        </tr>
        <tr style="background-color: #fdfaf3;">
          <td><span class="num-badge" style="background:#a16207;">14</span></td>
          <td style="font-weight: 800; color: #a16207; text-align: left; padding-left: 20px;">👑 रॉयल एम्बेसडर (Royal Ambassador)</td>
          <td style="font-weight: 800; color: #a16207;">80,00,000 RP</td>
          <td style="font-weight: 800; color: #a16207;">80,00,000 RP</td>
          <td class="gold-val" style="font-size: 17px;">💰 ₹ 2,00,00,000 /- (2 करोड़)</td>
        </tr>
        <tr class="crown-row" style="background-color: #144732; color: #ffffff;">
          <td><span class="num-badge" style="background:#d4a359; color:#144732;">15</span></td>
          <td style="font-weight: 900; color: #ffffff; text-align: left; padding-left: 20px;">👑👑 क्राउन एम्बेसडर (Crown Ambassador)</td>
          <td style="font-weight: 900; color: #ffffff;">2 करोड़ RP</td>
          <td style="font-weight: 900; color: #ffffff;">2 करोड़ RP</td>
          <td style="color: #fef08a; font-size: 18px; font-weight: 900;">🏆 ₹ 3,00,00,000 /- (3 करोड़)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.online</div>
      <div class="footer-right">12 / 15</div>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- SLIDE 13: 12 | FUNDS & UTILITIES (फंड्स, रीपरचेस एवं यूटिलिटी रिचार्ज) -->
<!-- ============================================================== -->
<div class="slide">
  <div class="slide-header">
    <div class="header-idx">12 | लाइफस्टाइल व सेवाएं | RESIDUAL FUNDS & UTILITIES</div>
    <div class="header-title">
      लक्ज़री फंड्स, रीपरचेस एवं यूटिलिटी रिचार्ज <span class="en-sub">| Residual Income & Utility Cashback</span>
    </div>
  </div>

  <div class="slide-subheader">
    कंपनी टर्नओवर रॉयल्टी एवं रोजमर्रा की सेवाओं से लाइफटाइम इनकम | Lifetime Dividends on Essential Activities
  </div>

  <div class="slide-body">
    <div class="grid-3" style="gap: 20px; align-items: stretch;">
      
      <!-- 4 Life Funds -->
      <div class="card card-bordered-gold" style="padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <span style="font-size: 28px;">🏦</span>
            <h3 style="font-size: 19px; font-weight: 800; color: #a16207;">4 लक्ज़री लाइफ फंड्स</h3>
          </div>
          <p style="font-size: 13px; color: #4a5568; margin-bottom: 14px;">
            कंपनी टर्नओवर (CTO) से हर महीने योग्य लीडर्स में 2% रॉयल्टी का समान वितरण:
          </p>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fdfaf3; border: 1px solid #f3d9a2; padding: 8px 12px; border-radius: 8px;">
              <span style="font-weight: 700; color: #2d3748; font-size: 13.5px;">📱 मोबाइल फंड (Mobile Fund)</span>
              <span class="pill-gold">2% CTO</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fdfaf3; border: 1px solid #f3d9a2; padding: 8px 12px; border-radius: 8px;">
              <span style="font-weight: 700; color: #2d3748; font-size: 13.5px;">🏍️ बाइक फंड (Bike Fund)</span>
              <span class="pill-gold">2% CTO</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fdfaf3; border: 1px solid #f3d9a2; padding: 8px 12px; border-radius: 8px;">
              <span style="font-weight: 700; color: #2d3748; font-size: 13.5px;">🚗 कार फंड (Car Fund)</span>
              <span class="pill-gold">2% CTO</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fdfaf3; border: 1px solid #f3d9a2; padding: 8px 12px; border-radius: 8px;">
              <span style="font-weight: 700; color: #2d3748; font-size: 13.5px;">🏠 हाउस फंड (House Fund)</span>
              <span class="pill-gold">2% CTO</span>
            </div>
          </div>
        </div>

        <p style="font-size: 11.5px; color: #718096; margin-top: 10px;">
          * Monthly pool payout based on rank achievement.
        </p>
      </div>

      <!-- Purchase & Repurchase -->
      <div class="card card-bordered-green" style="padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <span style="font-size: 28px;">🔄</span>
            <h3 style="font-size: 19px; font-weight: 800; color: #144732;">परचेस & रीपरचेस इनकम</h3>
          </div>
          <p style="font-size: 13px; color: #4a5568; margin-bottom: 14px;">
            स्वयं एवं टीम की बार-बार की खरीदारी पर स्थायी मासिक आय:
          </p>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="background: #f7faf8; border: 1px solid #d5ded8; padding: 12px; border-radius: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <h4 style="font-size: 15px; font-weight: 800; color: #144732;">परचेस इनकम (Self Purchase)</h4>
                <span class="pill-green">10% BV</span>
              </div>
              <p style="font-size: 12px; color: #4a5568;">अपनी हर व्यक्तिगत खरीद पर 10% इंस्टेंट बेनिफिट।</p>
            </div>

            <div style="background: #f7faf8; border: 1px solid #d5ded8; padding: 12px; border-radius: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <h4 style="font-size: 15px; font-weight: 800; color: #144732;">रीपरचेस इनकम (Team Repurchase)</h4>
                <span class="pill-green">10% Team</span>
              </div>
              <p style="font-size: 12px; color: #4a5568;">आपकी पूरी टीम द्वारा की गई हर खरीदारी पर 10% टीम बोनस।</p>
            </div>
          </div>
        </div>

        <p style="font-size: 11.5px; color: #718096; margin-top: 10px;">
          * No demotion, continuous business accumulation.
        </p>
      </div>

      <!-- Utility Cashback -->
      <div class="card card-bordered-green" style="padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <span style="font-size: 28px;">📶</span>
            <h3 style="font-size: 19px; font-weight: 800; color: #144732;">यूटिलिटी रिचार्ज कैशबैक</h3>
          </div>
          <p style="font-size: 13px; color: #4a5568; margin-bottom: 14px;">
            SGM Mart पोर्टल से मोबाइल व टीवी रिचार्ज पर फ्लैट बचत:
          </p>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-size: 14.5px; font-weight: 800; color: #144732;">📱 मोबाइल रिचार्ज</span>
                <span class="pill-green">2.50%</span>
              </div>
              <p style="font-size: 12px; color: #718096;">Jio, Airtel, Vi, BSNL आदि सभी मोबाइल रिचार्ज पर।</p>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-size: 14.5px; font-weight: 800; color: #a16207;">📺 डीटीएच (DTH) रिचार्ज</span>
                <span class="pill-gold">2.50%</span>
              </div>
              <p style="font-size: 12px; color: #718096;">Tata Play, Dish TV, Airtel DTH आदि सभी पर।</p>
            </div>
          </div>
        </div>

        <p style="font-size: 11.5px; color: #718096; margin-top: 10px;">
          * Instant automatic wallet cashback on every recharge.
        </p>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.online</div>
      <div class="footer-right">13 / 15</div>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- SLIDE 14: 13 | TERMS & CONDITIONS (नियम एवं शर्तें) -->
<!-- ============================================================== -->
<div class="slide">
  <div class="slide-header">
    <div class="header-idx">13 | नियम एवं शर्तें | POLICY & SETTLEMENT</div>
    <div class="header-title">
      सिस्टम नियम एवं विड्रॉल प्रक्रिया <span class="en-sub">| Terms, Settlement & Conditions</span>
    </div>
  </div>

  <div class="slide-subheader">
    100% पारदर्शी, सुरक्षित एवं कानूनी व्यवस्था | Fair, Compliant & Transparent Banking Operations
  </div>

  <div class="slide-body">
    <div class="grid-2" style="gap: 26px; align-items: center;">
      
      <!-- Left side rules list -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        
        <div class="card card-bordered-green" style="padding: 15px; display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 28px;">💵</div>
          <div>
            <h4 style="font-size: 17px; font-weight: 800; color: #144732;">न्यूनतम विड्रॉल | Minimum Withdrawal</h4>
            <p style="font-size: 14px; color: #2d3748; font-family: 'Hind', sans-serif;">
              मात्र <strong style="color: #a16207; font-size: 16px;">₹ 100 /-</strong> होते ही आप अपने बैंक खाते में सीधे विड्रॉल ले सकते हैं।
            </p>
          </div>
        </div>

        <div class="card card-bordered-gold" style="padding: 15px; display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 28px;">⏰</div>
          <div>
            <h4 style="font-size: 17px; font-weight: 800; color: #a16207;">क्लोजिंग एवं भुगतान | Closing & Payout</h4>
            <p style="font-size: 14px; color: #2d3748; font-family: 'Hind', sans-serif;">
              <strong>डेली क्लोजिंग (Daily Closing)</strong> रात्रि 12:00 बजे एवं <strong>साप्ताहिक विड्रॉल (Weekly Withdrawal)</strong> बैंक ट्रांसफर।
            </p>
          </div>
        </div>

        <div class="card card-bordered-green" style="padding: 15px; display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 28px;">⚖️</div>
          <div>
            <h4 style="font-size: 17px; font-weight: 800; color: #144732;">वैधानिक कटौती | Statutory Deductions</h4>
            <p style="font-size: 14px; color: #2d3748; font-family: 'Hind', sans-serif;">
              प्रत्येक विड्रॉल पर <strong>5% एडमिन चार्ज</strong> एवं सरकारी नियमानुसार <strong>5% TDS</strong> लागू।
            </p>
          </div>
        </div>

        <div class="card card-bordered-gold" style="padding: 15px; display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 28px;">🔒</div>
          <div>
            <h4 style="font-size: 17px; font-weight: 800; color: #a16207;">केवाईसी एवं सुरक्षा | KYC & Security</h4>
            <p style="font-size: 14px; color: #2d3748; font-family: 'Hind', sans-serif;">
              विड्रॉल हेतु बैंक खाता व पैन विवरण अनिवार्य। एक पैन कार्ड पर मान्य आईडी रजिस्ट्रेशन।
            </p>
          </div>
        </div>

      </div>

      <!-- Right side assurance card -->
      <div class="card card-bordered-green" style="padding: 26px; text-align: center; background: #ffffff;">
        <div style="width: 65px; height: 65px; margin: 0 auto 12px auto; background: #e6f4ea; border: 2px solid #144732; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px;">
          ✓
        </div>
        <h3 style="font-size: 22px; font-weight: 800; color: #144732; margin-bottom: 6px;">
          सद्गुरु मार्ट की वचनबद्धता
        </h3>
        <p style="font-size: 14.5px; color: #a16207; font-weight: 700; margin-bottom: 16px;">
          “सुरक्षित सिस्टम • समय पर पेआउट • 100% लीगल प्रक्रिया”
        </p>

        <div style="text-align: left; background: #f7faf8; padding: 16px; border-radius: 12px; font-size: 13.5px; color: #4a5568; display: flex; flex-direction: column; gap: 8px; font-family: 'Hind', sans-serif; border: 1px solid #d5ded8;">
          <div>✔ 24×7 स्वचालित डिजिटल पोर्टल एवं त्वरित सपोर्ट।</div>
          <div>✔ 100% शुद्ध आयुर्वेदिक व प्रमाणित दैनिक उत्पाद।</div>
          <div>✔ आपकी मेहनत की प्रत्येक पाई का पारदर्शी हिसाब।</div>
          <div>✔ भारत सरकार के डायरेक्ट सेलिंग नियमों का पूर्ण अनुपालन।</div>
        </div>

        <div style="margin-top: 16px; font-size: 12.5px; color: #718096;">
          हेल्पलाइन: <strong>6267392508</strong> | व्हाट्सऐप: <strong>7611148925</strong>
        </div>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-line"></div>
    <div class="footer-content">
      <div class="footer-left">SGM MART | <strong>BUSINESS OVERVIEW & MLM PLAN</strong> | sadgurumart.online</div>
      <div class="footer-right">14 / 15</div>
    </div>
  </div>
</div>

<!-- ============================================================== -->
<!-- SLIDE 15: THANK YOU & CONTACT US (Matching Compliance Draft Page 14) -->
<!-- ============================================================== -->
<div class="slide" style="flex-direction: row; background: #144732;">
  
  <!-- Left Side: Forest Green Contact Details -->
  <div style="flex: 1.15; padding: 50px 50px 40px 55px; display: flex; flex-direction: column; justify-content: space-between; color: #ffffff;">
    <div>
      <h1 style="font-size: 52px; font-weight: 900; line-height: 1.1; color: #ffffff; margin-bottom: 6px;">
        धन्यवाद!
      </h1>
      <p style="font-size: 24px; font-weight: 700; color: #d4a359; margin-bottom: 15px;">
        Thank You for Exploring SGM MART
      </p>

      <div style="height: 2px; width: 100%; background: #d4a359; margin: 10px 0 24px 0; opacity: 0.85;"></div>

      <h2 style="font-size: 30px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">
        SGM MART Online Service
      </h2>
      <p style="font-size: 16px; color: #e2e8f0; margin-bottom: 26px;">
        अधिक जानकारी और बिज़नेस पार्टनरशिप के लिए आज ही संपर्क करें:
      </p>

      <!-- Contact Info Boxes -->
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <div>
          <div style="font-size: 13px; font-weight: 700; color: #d4a359; text-transform: uppercase; letter-spacing: 1px;">
            CALL US | कॉल करें
          </div>
          <div style="font-size: 32px; font-weight: 900; color: #ffffff; line-height: 1.1;">
            6267392508
          </div>
        </div>

        <div>
          <div style="font-size: 13px; font-weight: 700; color: #d4a359; text-transform: uppercase; letter-spacing: 1px;">
            WHATSAPP SUPPORT | व्हाट्सऐप
          </div>
          <div style="font-size: 32px; font-weight: 900; color: #a7f3d0; line-height: 1.1;">
            7611148925
          </div>
        </div>

        <div>
          <div style="font-size: 13px; font-weight: 700; color: #d4a359; text-transform: uppercase; letter-spacing: 1px;">
            OFFICIAL WEBSITE | आधिकारिक वेबसाइट
          </div>
          <div style="font-size: 24px; font-weight: 800; color: #fef08a; line-height: 1.2;">
            www.sadgurumart.online
          </div>
        </div>
      </div>
    </div>

    <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">
      SGM MART ONLINE SERVICE • ALL RIGHTS RESERVED
    </div>
  </div>

  <!-- Right Side: Green Card with Slogan -->
  <div style="flex: 0.85; background: #f6f4ed; padding: 35px; display: flex; align-items: center; justify-content: center;">
    <div style="width: 100%; height: 100%; background: #144732; border-radius: 24px; padding: 40px 30px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center; color: #ffffff; box-shadow: 0 10px 30px rgba(20, 71, 50, 0.25);">
      
      <div>
        <img src="{img_logo}" style="width: 100px; height: 100px; object-fit: contain; background: white; border-radius: 50%; padding: 6px; margin-bottom: 15px;" alt="SGM Logo">
        <h2 style="font-size: 38px; font-weight: 900; color: #ffffff;">SGM</h2>
        <h3 style="font-size: 26px; font-weight: 800; color: #d4a359; letter-spacing: 2px;">MART</h3>
        <div style="height: 2px; width: 60px; background: #d4a359; margin: 15px auto;"></div>
      </div>

      <div>
        <p style="font-size: 25px; font-weight: 800; color: #fef08a; line-height: 1.45; font-family: 'Hind', sans-serif;">
          “बेरोजगारी और रोग मुक्त<br>हो भारत हमारा”
        </p>
        <p style="font-size: 14px; color: #a7f3d0; margin-top: 8px;">
          Healthy & Prosperous India
        </p>
      </div>

      <div style="border-top: 1px solid rgba(255,255,255,0.2); width: 100%; padding-top: 15px; font-size: 14px; color: #e2e8f0; font-weight: 600;">
        ग्राहक पहले • पारदर्शिता हमेशा<br>
        <span style="font-size: 12px; color: #cbd5e1;">Customer First • Always Transparent</span>
      </div>

    </div>
  </div>

</div>

</body>
</html>
"""

with open("Sadguru_Mart_MLM_Plan_Executive.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("Saved Sadguru_Mart_MLM_Plan_Executive.html successfully.")
