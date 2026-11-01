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
<title>SADGURU MART - Official Business Plan Presentation</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hind:wght@500;600;700&family=Poppins:wght@600;700;800;900&family=Rajdhani:wght@700&display=swap" rel="stylesheet">
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
    background-color: #050b14;
    color: #ffffff;
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
    padding: 0.5in 0.75in 0.42in 0.75in;
    background: radial-gradient(circle at 15% 20%, #0d213f 0%, #081122 55%, #02060f 100%);
  }}

  /* Top Decorative Glow & Border */
  .slide::before {{
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 7px;
    background: linear-gradient(90deg, #10b981 0%, #fbbf24 50%, #10b981 100%);
  }}

  /* Background Glow Circles */
  .bg-circle-1 {{
    position: absolute;
    width: 750px;
    height: 750px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
    top: -220px;
    right: -220px;
    pointer-events: none;
  }}
  .bg-circle-2 {{
    position: absolute;
    width: 650px;
    height: 650px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.07) 0%, transparent 70%);
    bottom: -220px;
    left: -220px;
    pointer-events: none;
  }}

  /* Header Components */
  .slide-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid rgba(255, 255, 255, 0.12);
    padding-bottom: 0.16in;
    margin-bottom: 0.20in;
    position: relative;
    z-index: 2;
  }}
  .header-left {{
    display: flex;
    align-items: center;
    gap: 18px;
  }}
  .header-logo {{
    width: 68px;
    height: 68px;
    object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.45));
  }}
  .header-title-box h2 {{
    font-size: 32px;
    font-weight: 900;
    letter-spacing: -0.3px;
    color: #ffffff;
    line-height: 1.15;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.7);
  }}
  .header-title-box h2 .sub-en {{
    color: #fbbf24;
    font-size: 26px;
    font-weight: 800;
  }}
  .header-title-box p {{
    font-size: 14px;
    font-weight: 700;
    color: #10b981;
    letter-spacing: 1px;
    text-transform: uppercase;
  }}
  .header-badge {{
    background: rgba(16, 185, 129, 0.18);
    border: 1.5px solid rgba(16, 185, 129, 0.6);
    padding: 8px 20px;
    border-radius: 30px;
    font-size: 15px;
    font-weight: 800;
    color: #34d399;
    letter-spacing: 0.5px;
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.25);
  }}

  /* Footer Components */
  .slide-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.14);
    padding-top: 0.12in;
    margin-top: 0.14in;
    font-size: 14px;
    color: #94a3b8;
    position: relative;
    z-index: 2;
  }}
  .footer-web {{
    color: #fbbf24;
    font-weight: 800;
    letter-spacing: 0.5px;
  }}
  .footer-support {{
    font-weight: 700;
    color: #cbd5e1;
  }}
  .footer-support span {{
    color: #34d399;
    font-weight: 800;
  }}
  .footer-tag {{
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 4px 14px;
    border-radius: 12px;
    font-weight: 800;
    color: #f1f5f9;
  }}

  /* Content Body */
  .slide-content {{
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    z-index: 2;
  }}

  /* Utility Cards & Badges */
  .card {{
    background: rgba(13, 25, 48, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 16px;
    padding: 22px;
    backdrop-filter: blur(10px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
  }}
  .card-gold {{
    border-color: rgba(245, 158, 11, 0.5);
    background: linear-gradient(145deg, rgba(28, 38, 56, 0.9) 0%, rgba(18, 26, 44, 0.98) 100%);
  }}
  .card-green {{
    border-color: rgba(16, 185, 129, 0.5);
    background: linear-gradient(145deg, rgba(14, 40, 36, 0.85) 0%, rgba(8, 24, 26, 0.98) 100%);
  }}

  .gold-text {{
    color: #fbbf24;
    font-weight: 800;
  }}
  .green-text {{
    color: #10b981;
    font-weight: 800;
  }}
  .highlight-badge {{
    display: inline-block;
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
  }}
  .badge-yellow {{
    background: #fbbf24;
    color: #000000;
  }}
  .badge-emerald {{
    background: #10b981;
    color: #ffffff;
  }}

  /* Cover Slide Styling */
  .cover-slide {{
    background: radial-gradient(circle at center, #112952 0%, #071224 60%, #02050d 100%);
    justify-content: space-between;
    text-align: center;
    align-items: center;
  }}
  .cover-hero {{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    max-width: 1250px;
    margin: 0 auto;
  }}
  .cover-logo-wrapper {{
    position: relative;
    margin-bottom: 4px;
  }}
  .cover-logo {{
    width: 140px;
    height: 140px;
    object-fit: contain;
    filter: drop-shadow(0 0 35px rgba(16, 185, 129, 0.65));
  }}
  .cover-title {{
    font-size: 74px;
    font-weight: 900;
    letter-spacing: 2px;
    line-height: 1.05;
    color: #fbbf24;
    text-shadow: 0 4px 20px rgba(245, 158, 11, 0.5), 0 2px 5px rgba(0, 0, 0, 0.9);
  }}
  .cover-subtitle {{
    font-size: 26px;
    font-weight: 800;
    color: #38bdf8;
    letter-spacing: 3px;
    text-transform: uppercase;
  }}
  .cover-slogan-box {{
    background: linear-gradient(90deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.65) 50%, rgba(239, 68, 68, 0.3) 100%);
    border: 2px solid #ef4444;
    padding: 14px 48px;
    border-radius: 50px;
    margin: 8px 0 14px 0;
    box-shadow: 0 0 35px rgba(239, 68, 68, 0.4);
  }}
  .cover-slogan {{
    font-size: 32px;
    font-weight: 900;
    color: #ffffff;
    font-family: 'Hind', sans-serif;
    letter-spacing: 0.5px;
  }}
  .cover-features-row {{
    display: flex;
    gap: 20px;
    justify-content: center;
    width: 100%;
    margin-top: 6px;
  }}
  .cover-pill {{
    background: rgba(255, 255, 255, 0.08);
    border: 1.5px solid rgba(255, 255, 255, 0.22);
    padding: 13px 25px;
    border-radius: 14px;
    font-size: 18px;
    font-weight: 800;
    color: #f1f5f9;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 6px 18px rgba(0,0,0,0.35);
  }}
  .cover-pill strong {{
    color: #fbbf24;
  }}

  /* Grid Layouts */
  .grid-2 {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 26px;
    height: 100%;
  }}
  .grid-3 {{
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 22px;
  }}
  .grid-4 {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }}

  /* Tables */
  .plan-table {{
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 14px;
    overflow: hidden;
    font-size: 16px;
    border: 1.5px solid rgba(255, 255, 255, 0.18);
  }}
  .plan-table th {{
    background: linear-gradient(90deg, #1e293b, #0f172a);
    color: #fbbf24;
    font-weight: 900;
    text-transform: uppercase;
    font-size: 16px;
    padding: 15px 18px;
    border-bottom: 2.5px solid rgba(245, 158, 11, 0.6);
    text-align: center;
    letter-spacing: 0.5px;
  }}
  .plan-table td {{
    padding: 12px 18px;
    background: rgba(15, 23, 42, 0.7);
    border-bottom: 1px solid rgba(255, 255, 255, 0.09);
    text-align: center;
    font-weight: 700;
    color: #e2e8f0;
  }}
  .plan-table tr:nth-child(even) td {{
    background: rgba(30, 41, 59, 0.55);
  }}
  .plan-table tr:last-child td {{
    border-bottom: none;
  }}
  .plan-table .highlight-col {{
    color: #34d399;
    font-weight: 900;
  }}
  .plan-table .gold-col {{
    color: #fbbf24;
    font-weight: 900;
  }}

  /* Product Card */
  .product-card {{
    background: rgba(13, 22, 40, 0.9);
    border: 1.5px solid rgba(255, 255, 255, 0.18);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
  }}
  .product-img-box {{
    height: 220px;
    background: #09101c;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding: 12px;
  }}
  .product-img {{
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
    border-radius: 8px;
    filter: drop-shadow(0 6px 14px rgba(0,0,0,0.6));
  }}
  .product-badge-top {{
    position: absolute;
    top: 10px;
    right: 10px;
    background: #ef4444;
    color: white;
    font-size: 12px;
    font-weight: 900;
    padding: 4px 10px;
    border-radius: 20px;
    text-transform: uppercase;
  }}
  .product-details {{
    padding: 15px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
    gap: 6px;
  }}
  .product-name {{
    font-size: 18px;
    font-weight: 900;
    color: #ffffff;
    line-height: 1.25;
  }}
  .product-desc {{
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.4;
  }}
  .product-meta {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
  }}
  .mrp-tag {{
    font-size: 17px;
    font-weight: 900;
    color: #fbbf24;
  }}
  .pv-tag {{
    background: rgba(16, 185, 129, 0.22);
    border: 1.5px solid #10b981;
    color: #34d399;
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 800;
  }}

</style>
</head>
<body>

<!-- SLIDE 1: GRAND TITLE COVER PAGE -->
<div class="slide cover-slide">
  <div class="bg-circle-1"></div>
  <div class="bg-circle-2"></div>

  <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; z-index: 2;">
    <div style="display: flex; align-items: center; gap: 10px; background: rgba(16, 185, 129, 0.18); border: 1.5px solid rgba(16, 185, 129, 0.5); padding: 7px 20px; border-radius: 30px;">
      <span style="color: #10b981; font-size: 18px;">★</span>
      <span style="font-size: 14px; font-weight: 800; color: #a7f3d0; letter-spacing: 0.5px;">100% लीगल एवं स्वदेशी डायरेक्ट सेलिंग महा-अवसर</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px; background: rgba(245, 158, 11, 0.18); border: 1.5px solid rgba(245, 158, 11, 0.5); padding: 7px 20px; border-radius: 30px;">
      <span style="color: #fbbf24; font-size: 18px;">✦</span>
      <span style="font-size: 14px; font-weight: 800; color: #fde68a; letter-spacing: 0.5px;">ISO CERTIFIED BUSINESS MODEL</span>
    </div>
  </div>

  <div class="cover-hero" style="z-index: 2;">
    <div class="cover-logo-wrapper">
      <img src="{img_logo}" class="cover-logo" alt="SGM Mart Logo">
    </div>

    <h1 class="cover-title">SADGURU MART</h1>
    <p class="cover-subtitle">S G M MART ONLINE SERVICE</p>

    <div class="cover-slogan-box">
      <p class="cover-slogan">"S G M Mart का एक ही नारा — बेरोजगारी और रोग मुक्त हो भारत हमारा"</p>
    </div>

    <p style="font-size: 22px; color: #cbd5e1; font-weight: 700; max-width: 950px; line-height: 1.45;">
      देश का सबसे क्रांतिकारी <span style="color: #fbbf24; font-weight: 900;">वर्किंग एवं नॉन-वर्किंग 0% इन्वेस्टमेंट महा-प्लान</span><br>
      मार्केट रेट में ऑल मार्केट के ब्रांडेड प्रोडक्ट्स के साथ अनलिमिटेड इनकम प्राप्त करें!
    </p>

    <div class="cover-features-row">
      <div class="cover-pill"><span>🛍️</span> <span>मार्केट रेट पर <strong>ब्रांडेड प्रोडक्ट्स</strong></span></div>
      <div class="cover-pill"><span>💎</span> <span><strong>0% इन्वेस्टमेंट</strong> प्लान</span></div>
      <div class="cover-pill"><span>⚡</span> <span><strong>वर्किंग + ऑटोपूल</strong> प्लान</span></div>
      <div class="cover-pill"><span>💰</span> <span><strong>डेली क्लोजिंग</strong> वीकली विड्रॉल</span></div>
    </div>
  </div>

  <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.18); padding-top: 14px; z-index: 2;">
    <div style="font-size: 16px; font-weight: 800; color: #fbbf24; letter-spacing: 1px;">
      🌐 www.sadgurumart.online
    </div>
    <div style="font-size: 16px; font-weight: 700; color: #e2e8f0;">
      📞 कॉल: <span style="color: #34d399; font-weight: 900;">6267392508</span> &nbsp;|&nbsp; 💬 व्हाट्सऐप: <span style="color: #38bdf8; font-weight: 900;">7611148925</span>
    </div>
    <div style="font-size: 14px; font-weight: 800; background: linear-gradient(90deg, #10b981, #059669); padding: 6px 18px; border-radius: 20px; color: #ffffff;">
      महा बिजनेस प्लान
    </div>
  </div>
</div>

<!-- SLIDE 2: ABOUT US -->
<div class="slide">
  <div class="bg-circle-1"></div>
  <div class="slide-header">
    <div class="header-left">
      <img src="{img_logo}" class="header-logo" alt="SGM Logo">
      <div class="header-title-box">
        <h2>कंपनी परिचय <span class="sub-en">(ABOUT SADGURU MART)</span></h2>
        <p>A Powerful Vision for Economic & Health Freedom</p>
      </div>
    </div>
    <div class="header-badge">S G M MART ONLINE SERVICE</div>
  </div>

  <div class="slide-content">
    <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 30px; align-items: center;">
      <div>
        <div style="background: rgba(16, 185, 129, 0.12); border-left: 5px solid #10b981; padding: 18px 24px; border-radius: 0 14px 14px 0; margin-bottom: 22px;">
          <h3 style="font-size: 24px; font-weight: 900; color: #fef08a; margin-bottom: 8px;">
            सद्गुरु मार्ट (SGM Mart) — एक नई आर्थिक और स्वास्थ्य क्रांति
          </h3>
          <p style="font-size: 17px; line-height: 1.6; color: #e2e8f0; font-family: 'Hind', sans-serif;">
            <strong>SGM MART</strong> भारत का एक तेजी से बढ़ता ई-कॉमर्स व डायरेक्ट सेलिंग प्लेटफॉर्म है, जिसका उद्देश्य हर भारतीय नागरिक को स्वस्थ जीवन और आत्मनिर्भर भविष्य प्रदान करना है। हम दैनिक उपयोग के बेहतरीन ब्रांडेड और आयुर्वेदिक उत्पाद सीधे उपभोक्ता तक <strong>मार्केट रेट</strong> पर पहुंचाते हैं।
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="card card-green" style="padding: 16px;">
            <div style="font-size: 28px; margin-bottom: 6px;">🇮🇳</div>
            <h4 style="font-size: 18px; font-weight: 900; color: #34d399; margin-bottom: 4px;">100% स्वदेशी अभियान</h4>
            <p style="font-size: 13px; color: #cbd5e1; line-height: 1.4;">लोकल फॉर वोकल को बढ़ावा देकर भारत के धन को भारत में ही समृद्ध बनाना।</p>
          </div>
          <div class="card card-gold" style="padding: 16px;">
            <div style="font-size: 28px; margin-bottom: 6px;">🛡️</div>
            <h4 style="font-size: 18px; font-weight: 900; color: #fbbf24; margin-bottom: 4px;">0% रिस्क — नो लॉस</h4>
            <p style="font-size: 13px; color: #cbd5e1; line-height: 1.4;">बिना किसी भारी पूंजी निवेश के हर आम इंसान के लिए खुला सुरक्षित व्यापार।</p>
          </div>
          <div class="card card-gold" style="padding: 16px;">
            <div style="font-size: 28px; margin-bottom: 6px;">⚡</div>
            <h4 style="font-size: 18px; font-weight: 900; color: #fbbf24; margin-bottom: 4px;">वर्किंग + नॉन-वर्किंग</h4>
            <p style="font-size: 13px; color: #cbd5e1; line-height: 1.4;">सक्रिय लीडर्स और सामान्य सदस्यों दोनों के लिए संतुलित एवं निरंतर आय प्रणाली।</p>
          </div>
          <div class="card card-green" style="padding: 16px;">
            <div style="font-size: 28px; margin-bottom: 6px;">🤝</div>
            <h4 style="font-size: 18px; font-weight: 900; color: #34d399; margin-bottom: 4px;">पारदर्शी एवं विश्वसनीय</h4>
            <p style="font-size: 13px; color: #cbd5e1; line-height: 1.4;">डेली क्लोजिंग, वीकली बैंक विड्रॉल और 24x7 संपूर्ण डिजिटल सपोर्ट सिस्टम।</p>
          </div>
        </div>
      </div>

      <div class="card" style="background: linear-gradient(145deg, #132442 0%, #0c182e 100%); border: 2px solid rgba(245, 158, 11, 0.4); padding: 28px; text-align: center;">
        <div style="width: 80px; height: 80px; margin: 0 auto 15px auto; background: rgba(16, 185, 129, 0.18); border: 2px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 38px;">
          🌱
        </div>
        <h3 style="font-size: 23px; font-weight: 900; color: #ffffff; margin-bottom: 10px;">
          सद्गुरु मार्ट का मूल संदेश
        </h3>
        <div style="height: 3px; width: 70px; background: #fbbf24; margin: 0 auto 15px auto;"></div>
        <p style="font-size: 20px; font-weight: 800; color: #fbbf24; font-family: 'Hind', sans-serif; line-height: 1.5;">
          "लोगों को बताएं और अनलिमिटेड इनकम प्राप्त करें!"
        </p>
        <p style="font-size: 14px; color: #94a3b8; margin-top: 12px; line-height: 1.5;">
          अपनी रोज़मर्रा की सामान्य खरीदारी को अपनी सबसे बड़ी ताकत बनाएं। अपनी दुकान बदलें, अपनी ज़िंदगी बदलें!
        </p>

        <div style="margin-top: 22px; padding: 14px; background: rgba(255,255,255,0.06); border-radius: 12px; text-align: left;">
          <div style="font-size: 14px; font-weight: 800; color: #38bdf8; margin-bottom: 6px;">📍 हमारे प्रमुख स्तंभ:</div>
          <div style="font-size: 13px; color: #e2e8f0; display: flex; flex-direction: column; gap: 5px;">
            <div>✔ शुद्ध व प्रमाणित दैनिक उपभोग्य वस्तुएं</div>
            <div>✔ बिना किसी मध्यस्थ के सीधा लाभ उपभोक्ता को</div>
            <div>✔ डिजिटल इंडिया के साथ तेज गति से बढ़ता नेटवर्क</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-web">🌐 www.sadgurumart.online</div>
    <div class="footer-support">हेल्पलाइन कॉल: <span>6267392508</span> | व्हाट्सऐप: <span>7611148925</span></div>
    <div class="footer-tag">पेज 2 / 15</div>
  </div>
</div>

<!-- SLIDE 3: VISION & MISSION -->
<div class="slide">
  <div class="bg-circle-2"></div>
  <div class="slide-header">
    <div class="header-left">
      <img src="{img_logo}" class="header-logo" alt="SGM Logo">
      <div class="header-title-box">
        <h2>विज़न और मिशन <span class="sub-en">(VISION & MISSION)</span></h2>
        <p>Our Core Ideology & Guiding Principles</p>
      </div>
    </div>
    <div class="header-badge">भविष्य का संकल्प</div>
  </div>

  <div class="slide-content">
    <div class="grid-2" style="align-items: stretch; gap: 30px;">
      
      <!-- VISION CARD -->
      <div class="card card-green" style="padding: 30px; display: flex; flex-direction: column; justify-content: space-between; border-width: 2px;">
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <span style="font-size: 38px; background: rgba(16, 185, 129, 0.25); padding: 10px 16px; border-radius: 14px;">🎯</span>
              <h3 style="font-size: 28px; font-weight: 900; color: #34d399; letter-spacing: 0.5px;">हमारा विज़न (VISION)</h3>
            </div>
            <span class="badge-emerald highlight-badge">भविष्य दृष्टि</span>
          </div>

          <p style="font-size: 20px; font-weight: 800; color: #fef08a; line-height: 1.5; margin-bottom: 18px; font-family: 'Hind', sans-serif;">
            "भारत के हर परिवार को आर्थिक रूप से सशक्त, आत्मनिर्भर और बीमारियों से सुरक्षित बनाना।"
          </p>

          <div style="display: flex; flex-direction: column; gap: 14px; font-size: 15px; color: #e2e8f0; font-family: 'Hind', sans-serif;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <span style="color: #10b981; font-size: 20px;">✔</span>
              <span>देश के युवाओं और गृहणियों को घर बैठे सम्मानजनक रोजगार और स्वरोजगार के असीमित अवसर प्रदान करना।</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <span style="color: #10b981; font-size: 20px;">✔</span>
              <span>प्राकृतिक, आयुर्वेदिक और मिलावट-मुक्त उत्पादों को हर घर तक पहुंचाकर एक स्वस्थ समाज का निर्माण करना।</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <span style="color: #10b981; font-size: 20px;">✔</span>
              <span>लाखों परिवारों को आर्थिक स्वतंत्रता और स्थायी रॉयल्टी आय दिलाकर आत्मनिर्भर भारत में योगदान देना।</span>
            </div>
          </div>
        </div>

        <div style="background: rgba(0, 0, 0, 0.35); padding: 14px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.35); margin-top: 20px;">
          <span style="color: #a7f3d0; font-weight: 800; font-size: 14px;">विजन संदेश:</span>
          <span style="color: #ffffff; font-size: 14px; font-weight: 600;"> सोच बदलो, खुद को बदलो, दुनिया अपने आप बदल जाएगी!</span>
        </div>
      </div>

      <!-- MISSION CARD -->
      <div class="card card-gold" style="padding: 30px; display: flex; flex-direction: column; justify-content: space-between; border-width: 2px;">
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <span style="font-size: 38px; background: rgba(245, 158, 11, 0.25); padding: 10px 16px; border-radius: 14px;">🚀</span>
              <h3 style="font-size: 28px; font-weight: 900; color: #fbbf24; letter-spacing: 0.5px;">हमारा मिशन (MISSION)</h3>
            </div>
            <span class="badge-yellow highlight-badge">कार्रवाई लक्ष्य</span>
          </div>

          <p style="font-size: 20px; font-weight: 800; color: #ffffff; line-height: 1.5; margin-bottom: 18px; font-family: 'Hind', sans-serif;">
            "बेरोजगारी और रोग मुक्त हो भारत हमारा — इसी एक संकल्प के साथ निरंतर आगे बढ़ना।"
          </p>

          <div style="display: flex; flex-direction: column; gap: 14px; font-size: 15px; color: #e2e8f0; font-family: 'Hind', sans-serif;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <span style="color: #fbbf24; font-size: 20px;">★</span>
              <span><strong>किफायती मूल्य:</strong> उच्च गुणवत्ता वाले प्रीमियम ब्रांडेड उत्पाद आम नागरिक की जेब के अनुकूल मार्केट रेट पर उपलब्ध कराना।</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <span style="color: #fbbf24; font-size: 20px;">★</span>
              <span><strong>0% निवेश महा-प्लान:</strong> किसी भी व्यक्ति को आर्थिक जोखिम में डाले बिना शून्य निवेश से करोड़पति बनने का मार्ग प्रशस्त करना।</span>
            </div>
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <span style="color: #fbbf24; font-size: 20px;">★</span>
              <span><strong>पारदर्शी तकनीकी प्रणाली:</strong> अत्याधुनिक डिजिटल प्लेटफॉर्म के माध्यम से पारदर्शी, त्वरित और सुरक्षित पेआउट सुनिश्चित करना।</span>
            </div>
          </div>
        </div>

        <div style="background: rgba(0, 0, 0, 0.35); padding: 14px; border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.35); margin-top: 20px;">
          <span style="color: #fde68a; font-weight: 800; font-size: 14px;">मिशन प्रतिज्ञा:</span>
          <span style="color: #ffffff; font-size: 14px; font-weight: 600;"> हर घर खुशहाली, हर हाथ में काम, सद्गुरु मार्ट का यही पैगाम!</span>
        </div>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-web">🌐 www.sadgurumart.online</div>
    <div class="footer-support">हेल्पलाइन कॉल: <span>6267392508</span> | व्हाट्सऐप: <span>7611148925</span></div>
    <div class="footer-tag">पेज 3 / 15</div>
  </div>
</div>

<!-- SLIDE 4: PRODUCT CATEGORIES (9 SEGMENTS) -->
<div class="slide">
  <div class="bg-circle-1"></div>
  <div class="slide-header">
    <div class="header-left">
      <img src="{img_logo}" class="header-logo" alt="SGM Logo">
      <div class="header-title-box">
        <h2>प्रोडक्ट श्रेणियां <span class="sub-en">(PRODUCT CATEGORIES)</span></h2>
        <p>Comprehensive Multi-Category Marketplace</p>
      </div>
    </div>
    <div class="header-badge">9 विस्तृत श्रेणियां</div>
  </div>

  <div class="slide-content">
    <div style="text-align: center; margin-bottom: 16px;">
      <h3 style="font-size: 24px; font-weight: 900; color: #fbbf24;">
        सद्गुरु मार्ट — हर घर की दैनिक जरूरत, एक ही छत के नीचे!
      </h3>
      <p style="font-size: 15px; color: #cbd5e1; font-weight: 600;">मार्केट रेट में ऑल मार्केट के ब्रांडेड एवं शुद्ध आयुर्वेदिक प्रोडक्ट्स</p>
    </div>

    <!-- 9 Categories in 3x3 Grid -->
    <div class="grid-3" style="gap: 16px;">
      
      <!-- 1 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 5px solid #10b981;">
        <div style="font-size: 32px; background: rgba(16, 185, 129, 0.18); width: 55px; height: 55px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          🌿
        </div>
        <div>
          <div style="font-size: 12px; font-weight: 800; color: #10b981; text-transform: uppercase;">श्रेणी 1</div>
          <h4 style="font-size: 18px; font-weight: 900; color: #ffffff;">1. हेल्थ केयर (Health Care)</h4>
          <p style="font-size: 12px; color: #94a3b8;">तुलसी ड्रॉप्स, बेरी जूस, आयुर्वेदिक सिरप व सप्लीमेंट्स</p>
        </div>
      </div>

      <!-- 2 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 5px solid #38bdf8;">
        <div style="font-size: 32px; background: rgba(56, 189, 248, 0.18); width: 55px; height: 55px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          🏠
        </div>
        <div>
          <div style="font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">श्रेणी 2</div>
          <h4 style="font-size: 18px; font-weight: 900; color: #ffffff;">2. होम केयर (Home Care)</h4>
          <p style="font-size: 12px; color: #94a3b8;">प्रीमियम अगरबत्ती, धूप, क्लीनर्स व फ्लोर वॉश</p>
        </div>
      </div>

      <!-- 3 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 5px solid #fbbf24;">
        <div style="font-size: 32px; background: rgba(251, 191, 36, 0.18); width: 55px; height: 55px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          ☕
        </div>
        <div>
          <div style="font-size: 12px; font-weight: 800; color: #fbbf24; text-transform: uppercase;">श्रेणी 3</div>
          <h4 style="font-size: 18px; font-weight: 900; color: #ffffff;">3. किचन केयर (Kitchen Care)</h4>
          <p style="font-size: 12px; color: #94a3b8;">शाही इलायची चाय, अमृततुल्य चाय व शुद्ध मसाले</p>
        </div>
      </div>

      <!-- 4 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 5px solid #a855f7;">
        <div style="font-size: 32px; background: rgba(168, 85, 247, 0.18); width: 55px; height: 55px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          🧴
        </div>
        <div>
          <div style="font-size: 12px; font-weight: 800; color: #a855f7; text-transform: uppercase;">श्रेणी 4</div>
          <h4 style="font-size: 18px; font-weight: 900; color: #ffffff;">4. पर्सनल केयर (Personal Care)</h4>
          <p style="font-size: 12px; color: #94a3b8;">दंत बुट्टी हर्बल पेस्ट, 21 हर्ब्स हेयर ऑयल, साबुन</p>
        </div>
      </div>

      <!-- 5 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 5px solid #f43f5e;">
        <div style="font-size: 32px; background: rgba(244, 63, 94, 0.18); width: 55px; height: 55px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          🌸
        </div>
        <div>
          <div style="font-size: 12px; font-weight: 800; color: #f43f5e; text-transform: uppercase;">श्रेणी 5</div>
          <h4 style="font-size: 18px; font-weight: 900; color: #ffffff;">5. ब्यूटी केयर (Beauty Care)</h4>
          <p style="font-size: 12px; color: #94a3b8;">केसर फेस वॉश, अनियन शैम्पू, 7-इन-1 फेस क्रीम</p>
        </div>
      </div>

      <!-- 6 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 5px solid #06b6d4;">
        <div style="font-size: 32px; background: rgba(6, 182, 212, 0.18); width: 55px; height: 55px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          👕
        </div>
        <div>
          <div style="font-size: 12px; font-weight: 800; color: #06b6d4; text-transform: uppercase;">श्रेणी 6</div>
          <h4 style="font-size: 18px; font-weight: 900; color: #ffffff;">6. कपड़े (Apparel / Garments)</h4>
          <p style="font-size: 12px; color: #94a3b8;">पुरुष, महिला व बच्चों के उत्तम क्वालिटी परिधान</p>
        </div>
      </div>

      <!-- 7 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 5px solid #eab308;">
        <div style="font-size: 32px; background: rgba(234, 179, 8, 0.18); width: 55px; height: 55px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          💍
        </div>
        <div>
          <div style="font-size: 12px; font-weight: 800; color: #eab308; text-transform: uppercase;">श्रेणी 7</div>
          <h4 style="font-size: 18px; font-weight: 900; color: #ffffff;">7. ज्वेलरी (Fashion Jewellery)</h4>
          <p style="font-size: 12px; color: #94a3b8;">सुंदर व आकर्षक पारंपरिक व आधुनिक आभूषण</p>
        </div>
      </div>

      <!-- 8 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 5px solid #84cc16;">
        <div style="font-size: 32px; background: rgba(132, 204, 22, 0.18); width: 55px; height: 55px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          🌾
        </div>
        <div>
          <div style="font-size: 12px; font-weight: 800; color: #84cc16; text-transform: uppercase;">श्रेणी 8</div>
          <h4 style="font-size: 18px; font-weight: 900; color: #ffffff;">8. एग्रीकल्चर (Agriculture)</h4>
          <p style="font-size: 12px; color: #94a3b8;">जैविक खाद, पौध पोषण एवं फसल संवर्धन उत्पाद</p>
        </div>
      </div>

      <!-- 9 -->
      <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 5px solid #ec4899;">
        <div style="font-size: 32px; background: rgba(236, 72, 153, 0.18); width: 55px; height: 55px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          ⚡
        </div>
        <div>
          <div style="font-size: 12px; font-weight: 800; color: #ec4899; text-transform: uppercase;">श्रेणी 9</div>
          <h4 style="font-size: 18px; font-weight: 900; color: #ffffff;">9. इलेक्ट्रॉनिक (Electronics)</h4>
          <p style="font-size: 12px; color: #94a3b8;">स्मार्ट अप्लायंसेज, मोबाइल एक्सेसरीज व गैजेट्स</p>
        </div>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-web">🌐 www.sadgurumart.online</div>
    <div class="footer-support">हेल्पलाइन कॉल: <span>6267392508</span> | व्हाट्सऐप: <span>7611148925</span></div>
    <div class="footer-tag">पेज 4 / 15</div>
  </div>
</div>

<!-- SLIDE 5: FEATURED PRODUCTS - 1 (WELLNESS & HEALTH) -->
<div class="slide">
  <div class="bg-circle-2"></div>
  <div class="slide-header">
    <div class="header-left">
      <img src="{img_logo}" class="header-logo" alt="SGM Logo">
      <div class="header-title-box">
        <h2>प्रमुख उत्पाद <span class="sub-en">(FEATURED PRODUCTS - WELLNESS)</span></h2>
        <p>Premium Ayurvedic Formulations with High PV Benefits</p>
      </div>
    </div>
    <div class="header-badge">सुपर सेलिंग प्रोडक्ट्स</div>
  </div>

  <div class="slide-content">
    <div class="grid-3" style="gap: 24px;">
      
      <!-- Card 1: Shahi Chai -->
      <div class="product-card" style="border-color: rgba(251, 191, 36, 0.45);">
        <div class="product-img-box">
          <img src="{img_chai}" class="product-img" alt="SGM Shahi Chai">
          <div class="product-badge-top" style="background: #10b981;">बेस्ट सेलर</div>
        </div>
        <div class="product-details">
          <div>
            <div style="font-size: 12px; color: #fbbf24; font-weight: 800; text-transform: uppercase;">किचन केयर / बेवरेज</div>
            <h4 class="product-name">SGM शाही इलायची चाय</h4>
            <p class="product-desc" style="font-family: 'Hind', sans-serif;">
              हर घूंट में इलायची की शाही खुशबू! असम की कड़क चाय पत्तियों और असली हरी इलायची का संगम। ताजगी और ऊर्जा का वादा।
            </p>
          </div>
          <div class="product-meta">
            <div>
              <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">पैकिंग ऑप्शन्स</div>
              <div class="mrp-tag" style="font-size: 15px;">500g / 1 Kg</div>
            </div>
            <div style="text-align: right;">
              <span class="pv-tag">150 - 300 PV</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Tulsi Drops -->
      <div class="product-card" style="border-color: rgba(16, 185, 129, 0.45);">
        <div class="product-img-box">
          <img src="{img_tulsi}" class="product-img" alt="Tulsi Drops">
          <div class="product-badge-top" style="background: #3b82f6;">इम्यूनिटी बूस्टर</div>
        </div>
        <div class="product-details">
          <div>
            <div style="font-size: 12px; color: #34d399; font-weight: 800; text-transform: uppercase;">हेल्थ केयर / इम्यूनिटी</div>
            <h4 class="product-name">पंच तुलसी ड्रॉप्स (30 ml)</h4>
            <p class="product-desc" style="font-family: 'Hind', sans-serif;">
              5 दुर्लभ तुलसी प्रजातियों का शुद्ध प्राकृतिक अर्क। खून साफ करे, सर्दी-जुकाम, गले की खराश, खांसी और फ्लू से संपूर्ण सुरक्षा दे।
            </p>
          </div>
          <div class="product-meta">
            <div>
              <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">पैकेज मूल्य</div>
              <div class="mrp-tag">₹150 मात्र</div>
            </div>
            <div style="text-align: right;">
              <span class="pv-tag">100 PV</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 3: Mix Berries Juice -->
      <div class="product-card" style="border-color: rgba(236, 72, 153, 0.45);">
        <div class="product-img-box">
          <img src="{img_berry}" class="product-img" alt="Mix Berries Juice">
          <div class="product-badge-top" style="background: #ec4899;">52 दुर्लभ हर्ब्स</div>
        </div>
        <div class="product-details">
          <div>
            <div style="font-size: 12px; color: #f472b6; font-weight: 800; text-transform: uppercase;">हेल्थ केयर / ऑल इन वन</div>
            <h4 class="product-name">मिक्स बेरी जूस (500 ml)</h4>
            <p class="product-desc" style="font-family: 'Hind', sans-serif;">
              52 शक्तिशाली जड़ी-बूटियों व बेरीज का प्राकृतिक अर्क। एंटीऑक्सीडेंट से भरपूर, हृदय व मस्तिष्क को स्वस्थ रखे और नई ऊर्जा दे।
            </p>
          </div>
          <div class="product-meta">
            <div>
              <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">पैकेज मूल्य</div>
              <div class="mrp-tag">₹750 मात्र</div>
            </div>
            <div style="text-align: right;">
              <span class="pv-tag" style="background: rgba(236, 72, 153, 0.25); border-color: #ec4899; color: #f472b6;">500 PV</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-web">🌐 www.sadgurumart.online</div>
    <div class="footer-support">हेल्पलाइन कॉल: <span>6267392508</span> | व्हाट्सऐप: <span>7611148925</span></div>
    <div class="footer-tag">पेज 5 / 15</div>
  </div>
</div>

<!-- SLIDE 6: FEATURED PRODUCTS - 2 (PERSONAL & BEAUTY CARE) -->
<div class="slide">
  <div class="bg-circle-1"></div>
  <div class="slide-header">
    <div class="header-left">
      <img src="{img_logo}" class="header-logo" alt="SGM Logo">
      <div class="header-title-box">
        <h2>प्रमुख उत्पाद <span class="sub-en">(PERSONAL CARE & BEAUTY RANGE)</span></h2>
        <p>100% Ayurvedic Skin & Hair Solutions</p>
      </div>
    </div>
    <div class="header-badge">दैनिक सौंदर्य एवं केयर</div>
  </div>

  <div class="slide-content">
    <div class="grid-4" style="gap: 16px;">
      
      <!-- Product 1: Hair Oil -->
      <div class="product-card">
        <div class="product-img-box" style="height: 190px;">
          <img src="{img_oil}" class="product-img" alt="21 Herbs Hair Oil">
          <div class="product-badge-top" style="background: #eab308;">HOT SELLER</div>
        </div>
        <div class="product-details" style="padding: 10px;">
          <h4 style="font-size: 15px; font-weight: 900; color: #ffffff;">21 हर्ब्स हेयर ऑयल</h4>
          <p style="font-size: 11px; color: #94a3b8; line-height: 1.3;">भृंगराज, आंवला, ब्राह्मी युक्त। बाल झड़ना रोके व घना बनाए।</p>
          <div class="product-meta">
            <span style="font-size: 11px; color: #cbd5e1; font-weight: 700;">200ml + 10ml Free</span>
            <span class="mrp-tag" style="font-size: 15px;">₹499</span>
          </div>
        </div>
      </div>

      <!-- Product 2: Shampoo -->
      <div class="product-card">
        <div class="product-img-box" style="height: 190px;">
          <img src="{img_shampoo}" class="product-img" alt="Onion & Ginger Shampoo">
          <div class="product-badge-top" style="background: #dc2626;">ANTI-FALL</div>
        </div>
        <div class="product-details" style="padding: 10px;">
          <h4 style="font-size: 15px; font-weight: 900; color: #ffffff;">अनियन & जिंजर शैम्पू</h4>
          <p style="font-size: 11px; color: #94a3b8; line-height: 1.3;">100% प्राकृतिक। जड़ों को मजबूत कर हेयर ग्रोथ तेज करे।</p>
          <div class="product-meta">
            <span style="font-size: 11px; color: #cbd5e1; font-weight: 700;">300ml + 30ml Free</span>
            <span class="mrp-tag" style="font-size: 15px;">₹399</span>
          </div>
        </div>
      </div>

      <!-- Product 3: Face Wash -->
      <div class="product-card">
        <div class="product-img-box" style="height: 190px;">
          <img src="{img_face}" class="product-img" alt="Saffron Face Wash">
          <div class="product-badge-top" style="background: #f59e0b;">GLOW SKIN</div>
        </div>
        <div class="product-details" style="padding: 10px;">
          <h4 style="font-size: 15px; font-weight: 900; color: #ffffff;">कश्मीरी केसर फेस वॉश</h4>
          <p style="font-size: 11px; color: #94a3b8; line-height: 1.3;">केसर, नीम, एलोवेरा। पिंपल्स मिटाए और प्राकृतिक निखार दे।</p>
          <div class="product-meta">
            <span style="font-size: 11px; color: #cbd5e1; font-weight: 700;">200 ml पैक</span>
            <span class="mrp-tag" style="font-size: 15px;">₹280</span>
          </div>
        </div>
      </div>

      <!-- Product 4: Dant Butti -->
      <div class="product-card">
        <div class="product-img-box" style="height: 190px;">
          <img src="{img_dant}" class="product-img" alt="Dant Butti Toothpaste">
          <div class="product-badge-top" style="background: #10b981;">HERBAL</div>
        </div>
        <div class="product-details" style="padding: 10px;">
          <h4 style="font-size: 15px; font-weight: 900; color: #ffffff;">दंत बुट्टी हर्बल पेस्ट</h4>
          <p style="font-size: 11px; color: #94a3b8; line-height: 1.3;">11 दुर्लभ जड़ी-बूटी। पायरिया, सेंसिटिविटी व बदबू से मुक्ति।</p>
          <div class="product-meta">
            <span style="font-size: 11px; color: #cbd5e1; font-weight: 700;">100g हर्बल ट्यूब</span>
            <span class="mrp-tag" style="font-size: 15px;">₹95</span>
          </div>
        </div>
      </div>

    </div>

    <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 10px 16px; display: flex; align-items: center; gap: 14px;">
        <img src="{img_cream}" style="width: 45px; height: 45px; object-fit: contain; border-radius: 6px;" alt="Face Cream">
        <div>
          <span style="font-size: 14px; font-weight: 900; color: #ffffff;">b'Veda 7-इन-1 विटामिन E फेस क्रीम (50g):</span>
          <span style="font-size: 12px; color: #cbd5e1;"> दाग-धब्बे दूर करे, सूरज की किरणों से त्वचा की रक्षा करे।</span>
        </div>
      </div>
      <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 10px 16px; display: flex; align-items: center; gap: 14px;">
        <img src="{img_agarbatti}" style="width: 45px; height: 45px; object-fit: contain; border-radius: 6px;" alt="Agarbatti">
        <div>
          <span style="font-size: 14px; font-weight: 900; color: #ffffff;">प्रीमियम सुगंधित अगरबत्ती (गुलाब, मोगरा, चंदन):</span>
          <span style="font-size: 12px; color: #cbd5e1;"> मन को शांति और घर-मंदिर में सकारात्मक आध्यात्मिक वातावरण दे।</span>
        </div>
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-web">🌐 www.sadgurumart.online</div>
    <div class="footer-support">हेल्पलाइन कॉल: <span>6267392508</span> | व्हाट्सऐप: <span>7611148925</span></div>
    <div class="footer-tag">पेज 6 / 15</div>
  </div>
</div>

<!-- SLIDE 7: ACTIVATION PACKAGES & PRE-LAUNCH OFFER -->
<div class="slide">
  <div class="bg-circle-2"></div>
  <div class="slide-header">
    <div class="header-left">
      <img src="{img_logo}" class="header-logo" alt="SGM Logo">
      <div class="header-title-box">
        <h2>एक्टीवेशन पैकेज <span class="sub-en">(ACTIVATION PACKAGES)</span></h2>
        <p>Simple & Affordable Entry Packages for Every Citizen</p>
      </div>
    </div>
    <div class="header-badge">शुरुआत मात्र ₹150 से</div>
  </div>

  <div class="slide-content">
    <div style="display: grid; grid-template-columns: 1.4fr 0.8fr; gap: 24px; align-items: center;">
      
      <!-- Table of 6 Packages -->
      <div>
        <table class="plan-table">
          <thead>
            <tr>
              <th style="width: 12%;">क्र.</th>
              <th style="width: 25%;">पैकेज राशि (₹)</th>
              <th style="width: 20%;">पी वी (PV)</th>
              <th style="width: 43%;">उपलब्ध प्रोडक्ट</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 900; color: #fbbf24;">1</td>
              <td style="font-size: 18px; font-weight: 900; color: #ffffff;">₹ 349 /-</td>
              <td><span class="pv-tag">150 PV</span></td>
              <td style="text-align: left; font-weight: 800; color: #f1f5f9;">☕ इलायची चाय (500 gm)</td>
            </tr>
            <tr>
              <td style="font-weight: 900; color: #fbbf24;">2</td>
              <td style="font-size: 18px; font-weight: 900; color: #ffffff;">₹ 649 /-</td>
              <td><span class="pv-tag">300 PV</span></td>
              <td style="text-align: left; font-weight: 800; color: #f1f5f9;">☕ इलायची चाय (1 Kg)</td>
            </tr>
            <tr>
              <td style="font-weight: 900; color: #fbbf24;">3</td>
              <td style="font-size: 18px; font-weight: 900; color: #ffffff;">₹ 349 /-</td>
              <td><span class="pv-tag">150 PV</span></td>
              <td style="text-align: left; font-weight: 800; color: #f1f5f9;">🍃 अमृत तुल्य चाय (500 gm)</td>
            </tr>
            <tr>
              <td style="font-weight: 900; color: #fbbf24;">4</td>
              <td style="font-size: 18px; font-weight: 900; color: #ffffff;">₹ 699 /-</td>
              <td><span class="pv-tag">300 PV</span></td>
              <td style="text-align: left; font-weight: 800; color: #f1f5f9;">🍃 अमृत तुल्य चाय (1 Kg)</td>
            </tr>
            <tr>
              <td style="font-weight: 900; color: #fbbf24;">5</td>
              <td style="font-size: 18px; font-weight: 900; color: #34d399;">₹ 150 /-</td>
              <td><span class="pv-tag" style="background: rgba(16,185,129,0.3);">100 PV</span></td>
              <td style="text-align: left; font-weight: 800; color: #34d399;">🌿 तुलसी ड्रॉप (30 ml)</td>
            </tr>
            <tr>
              <td style="font-weight: 900; color: #fbbf24;">6</td>
              <td style="font-size: 18px; font-weight: 900; color: #ffffff;">₹ 750 /-</td>
              <td><span class="pv-tag" style="background: rgba(236,72,153,0.3); border-color: #ec4899; color: #f472b6;">500 PV</span></td>
              <td style="text-align: left; font-weight: 800; color: #f1f5f9;">🍇 मिक्स बेरी जूस (500 ml)</td>
            </tr>
          </tbody>
        </table>
        <p style="font-size: 13px; color: #cbd5e1; margin-top: 8px; font-weight: 600;">
          * किसी भी एक पैकेज के साथ अपनी आईडी एक्टिवेट करें और सभी 16 प्रकार की इनकम पाने के हकदार बनें!
        </p>
      </div>

      <!-- Pre-Launching Maha Offer Box -->
      <div class="card" style="background: radial-gradient(circle at center, #7f1d1d 0%, #450a0a 100%); border: 3px solid #ef4444; padding: 26px; text-align: center; box-shadow: 0 0 35px rgba(239, 68, 68, 0.45);">
        <div style="font-size: 34px; margin-bottom: 8px;">🔥 🌹 🔥</div>
        <div style="background: #ef4444; color: white; display: inline-block; padding: 4px 18px; border-radius: 20px; font-size: 14px; font-weight: 900; letter-spacing: 1px; margin-bottom: 12px;">
          सीमित समय का ऑफर!
        </div>
        <h3 style="font-size: 26px; font-weight: 900; color: #fef08a; margin-bottom: 8px; line-height: 1.2;">
          प्री-लॉन्चिंग स्पेशल ऑफर
        </h3>
        <div style="height: 3px; width: 80px; background: #fbbf24; margin: 0 auto 16px auto;"></div>
        
        <div style="background: rgba(0, 0, 0, 0.45); border: 2px dashed #fbbf24; padding: 18px; border-radius: 14px; margin-bottom: 15px;">
          <p style="font-size: 20px; font-weight: 800; color: #ffffff; font-family: 'Hind', sans-serif;">
            मात्र <span style="color: #fbbf24; font-size: 30px; font-weight: 900;">600 PV</span> का डायरेक्ट बिजनेस करने पर
          </p>
          <p style="font-size: 24px; font-weight: 900; color: #34d399; margin-top: 6px;">
            👉 1 ID बिल्कुल FREE एक्टिवेशन! 👈
          </p>
        </div>

        <p style="font-size: 13px; color: #fed7aa; line-height: 1.4; font-weight: 600;">
          जल्दी करें! अपनी टीम को बड़ा बनाएं और प्री-लॉन्चिंग ऑफर का भरपूर फायदा उठाएं!
        </p>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-web">🌐 www.sadgurumart.online</div>
    <div class="footer-support">हेल्पलाइन कॉल: <span>6267392508</span> | व्हाट्सऐप: <span>7611148925</span></div>
    <div class="footer-tag">पेज 7 / 15</div>
  </div>
</div>

<!-- SLIDE 8: 16 TYPES OF INCOME OVERVIEW -->
<div class="slide">
  <div class="bg-circle-1"></div>
  <div class="slide-header">
    <div class="header-left">
      <img src="{img_logo}" class="header-logo" alt="SGM Logo">
      <div class="header-title-box">
        <h2>इनकम के प्रकार <span class="sub-en">(16 TYPES OF INCOME)</span></h2>
        <p>A Multi-Tier Wealth Creation Opportunity</p>
      </div>
    </div>
    <div class="header-badge">16 महा इनकम का संगम</div>
  </div>

  <div class="slide-content">
    <div class="grid-4" style="gap: 14px;">
      
      <!-- 1 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #10b981;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 1</span>
          <span class="badge-emerald highlight-badge" style="font-size: 11px;">5% - 50%</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">1. रिटेल प्रॉफिट</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">MRP पर भारी छूट</p>
      </div>

      <!-- 2 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #fbbf24;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 2</span>
          <span class="badge-yellow highlight-badge" style="font-size: 11px;">10% PV</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">2. डायरेक्ट इनकम</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">प्रत्येक नए साथी जोड़ने पर</p>
      </div>

      <!-- 3 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #38bdf8;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 3</span>
          <span style="background: #38bdf8; color: #000; font-size: 11px;" class="highlight-badge">10% Match</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">3. मैचिंग इनकम</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">1:1 पेयर मैचिंग पर</p>
      </div>

      <!-- 4 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #a855f7;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 4</span>
          <span style="background: #a855f7; color: #fff; font-size: 11px;" class="highlight-badge">10%</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">4. डायरेक्ट स्पॉन्सर इनकम</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">स्पॉन्सर की मैचिंग पर</p>
      </div>

      <!-- 5 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #ec4899;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 5</span>
          <span style="background: #ec4899; color: #fff; font-size: 11px;" class="highlight-badge">3% Pool</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">5. अवार्ड & रिवार्ड्स</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">शानदार रैंक उपहार</p>
      </div>

      <!-- 6 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #f97316;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 6</span>
          <span style="background: #f97316; color: #fff; font-size: 11px;" class="highlight-badge">5% Royalty</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">6. लीडरशिप इनकम</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">3000 PV डायरेक्ट बिजनेस पर</p>
      </div>

      <!-- 7 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #14b8a6;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 7</span>
          <span style="background: #14b8a6; color: #fff; font-size: 11px;" class="highlight-badge">5% CTO</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">7. कंपनी CTO इनकम</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">5000 PV डायरेक्ट बिजनेस पर</p>
      </div>

      <!-- 8 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #ef4444;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 8</span>
          <span style="background: #ef4444; color: #fff; font-size: 11px;" class="highlight-badge">12.80 Cr</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">8. ऑटोपूल महा-इनकम</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">7 लेवल नॉन-वर्किंग पूल</p>
      </div>

      <!-- 9 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #84cc16;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 9</span>
          <span style="background: #84cc16; color: #000; font-size: 11px;" class="highlight-badge">10% BV</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">9. परचेस इनकम</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">अपनी हर खरीदारी पर</p>
      </div>

      <!-- 10 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #06b6d4;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 10</span>
          <span style="background: #06b6d4; color: #000; font-size: 11px;" class="highlight-badge">10% Team</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">10. रीपरचेस इनकम</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">टीम की पुनः खरीदारी पर</p>
      </div>

      <!-- 11 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #3b82f6;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 11</span>
          <span style="background: #3b82f6; color: #fff; font-size: 11px;" class="highlight-badge">2% CTO</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">11. मोबाइल फंड</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">स्मार्टफोन हेतु रॉयल्टी</p>
      </div>

      <!-- 12 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #6366f1;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 12</span>
          <span style="background: #6366f1; color: #fff; font-size: 11px;" class="highlight-badge">2% CTO</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">12. बाइक फंड</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">अपनी ड्रीम बाइक हेतु</p>
      </div>

      <!-- 13 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #d946ef;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 13</span>
          <span style="background: #d946ef; color: #fff; font-size: 11px;" class="highlight-badge">2% CTO</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">13. कार फंड</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">लक्ज़री कार लाइफस्टाइल</p>
      </div>

      <!-- 14 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #e11d48;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 14</span>
          <span style="background: #e11d48; color: #fff; font-size: 11px;" class="highlight-badge">2% CTO</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">14. हाउस फंड</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">सपनों के घर का निर्माण</p>
      </div>

      <!-- 15 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #10b981;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 15</span>
          <span class="badge-emerald highlight-badge" style="font-size: 11px;">2.50% Cash</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">15. मोबाइल रिचार्ज</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">हर प्रीपेड/पोस्टपेड रिचार्ज पर</p>
      </div>

      <!-- 16 -->
      <div class="card" style="padding: 12px 14px; border-left: 5px solid #fbbf24;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8; font-weight: 800;">इनकम 16</span>
          <span class="badge-yellow highlight-badge" style="font-size: 11px;">2.50% Cash</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 900; color: #ffffff; margin-top: 4px;">16. डीटीएच रिचार्ज</h4>
        <p style="font-size: 11px; color: #cbd5e1; font-weight: 600;">सभी टीवी डीटीएच रिचार्ज पर</p>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-web">🌐 www.sadgurumart.online</div>
    <div class="footer-support">हेल्पलाइन कॉल: <span>6267392508</span> | व्हाट्सऐप: <span>7611148925</span></div>
    <div class="footer-tag">पेज 8 / 15</div>
  </div>
</div>

<!-- SLIDE 9: WORKING INCOMES DETAIL -->
<div class="slide">
  <div class="bg-circle-2"></div>
  <div class="slide-header">
    <div class="header-left">
      <img src="{img_logo}" class="header-logo" alt="SGM Logo">
      <div class="header-title-box">
        <h2>वर्किंग इनकम प्लान <span class="sub-en">(WORKING INCOME DETAILED)</span></h2>
        <p>Direct, Matching, Sponsor, Leadership & Company CTO Incomes</p>
      </div>
    </div>
    <div class="header-badge">असीमित दैनिक कमाई</div>
  </div>

  <div class="slide-content">
    <div class="grid-2" style="gap: 26px; align-items: stretch;">
      
      <!-- Left Column: Direct, Matching & Sponsor -->
      <div style="display: flex; flex-direction: column; gap: 15px;">
        
        <!-- Direct -->
        <div class="card" style="border-left: 5px solid #10b981; padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <h4 style="font-size: 19px; font-weight: 900; color: #34d399;">1. डायरेक्ट इनकम — 10%</h4>
            <span class="badge-emerald highlight-badge">Instant Credit</span>
          </div>
          <p style="font-size: 14px; color: #cbd5e1; font-family: 'Hind', sans-serif; line-height: 1.45;">
            आप अपने रेफरल लिंक से जितने भी नए साथियों को सीधे एक्टिवेट कराते हैं, उनके एक्टिवेशन पैकेज के PV का <strong>10%</strong> तुरंत आपके वॉलेट में जमा होता है। असीमित डायरेक्ट स्पॉन्सर करें और असीमित कमाएं!
          </p>
        </div>

        <!-- Matching -->
        <div class="card" style="border-left: 5px solid #38bdf8; padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <h4 style="font-size: 19px; font-weight: 900; color: #38bdf8;">2. मैचिंग इनकम — 10% (1:1 Ratio)</h4>
            <span style="background: #38bdf8; color: #000;" class="highlight-badge">Daily Closing</span>
          </div>
          <p style="font-size: 14px; color: #cbd5e1; font-family: 'Hind', sans-serif; line-height: 1.45;">
            आपकी टीम (Left Team और Right Team) के बिजनेस मैचिंग पर <strong>10%</strong> मैचिंग इनकम मिलती है। पहला पेयर 1:2 या 2:1 और उसके बाद 1:1 के रेशियो में अनलिमिटेड डेप्थ तक मैचिंग इनकम मिलती है।
          </p>
        </div>

        <!-- Direct Sponsor Matching -->
        <div class="card" style="border-left: 5px solid #fbbf24; padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <h4 style="font-size: 19px; font-weight: 900; color: #fbbf24;">3. डायरेक्ट स्पॉन्सर इनकम — 10%</h4>
            <span class="badge-yellow highlight-badge">Lifetime Royalty</span>
          </div>
          <p style="font-size: 14px; color: #cbd5e1; font-family: 'Hind', sans-serif; line-height: 1.45;">
            आपके द्वारा सीधे स्पॉन्सर किए गए सदस्य जितनी भी मैचिंग इनकम कमाएंगे, उनकी कुल मैचिंग इनकम का <strong>10%</strong> आपको अलग से अतिरिक्त बोनस के रूप में लाइफटाइम मिलता रहेगा!
          </p>
        </div>

      </div>

      <!-- Right Column: Leadership & Company CTO -->
      <div style="display: flex; flex-direction: column; gap: 15px;">
        
        <!-- Leadership -->
        <div class="card card-gold" style="border-width: 2px; padding: 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 28px;">👑</span>
              <h4 style="font-size: 21px; font-weight: 900; color: #fbbf24;">4. लीडरशिप इनकम — 5%</h4>
            </div>
            <span style="background: rgba(251, 191, 36, 0.25); border: 1.5px solid #fbbf24; color: #fde68a; padding: 4px 14px; border-radius: 20px; font-size: 14px; font-weight: 900;">3000 PV डायरेक्ट</span>
          </div>
          <p style="font-size: 15px; color: #e2e8f0; line-height: 1.55; font-family: 'Hind', sans-serif;">
            जब आप अपनी स्वयं की डायरेक्ट आईडी से कुल <strong>3000 PV</strong> का डायरेक्ट बिजनेस पूरा कर लेते हैं, तो आप कंपनी के <strong>5% लीडरशिप क्लब</strong> में शामिल हो जाते हैं। कंपनी हर महीने अपने टर्नओवर का 5% सभी योग्य लीडर्स में बराबर बांटती है।
          </p>
        </div>

        <!-- Company CTO -->
        <div class="card card-green" style="border-width: 2px; padding: 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 28px;">🏛️</span>
              <h4 style="font-size: 21px; font-weight: 900; color: #34d399;">5. कंपनी CTO रॉयल्टी इनकम — 5%</h4>
            </div>
            <span style="background: rgba(16, 185, 129, 0.25); border: 1.5px solid #10b981; color: #a7f3d0; padding: 4px 14px; border-radius: 20px; font-size: 14px; font-weight: 900;">5000 PV डायरेक्ट</span>
          </div>
          <p style="font-size: 15px; color: #e2e8f0; line-height: 1.55; font-family: 'Hind', sans-serif;">
            जब आपका डायरेक्ट बिजनेस <strong>5000 PV</strong> का हो जाता है, तब आप कंपनी के सर्वोच्च <strong>CTO (Company Total Turnover) पार्टनर</strong> बन जाते हैं। कंपनी के कुल टर्नओवर से <strong>5%</strong> आजीवन रॉयल्टी आपके बैंक खाते में आती है!
          </p>
        </div>

      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-web">🌐 www.sadgurumart.online</div>
    <div class="footer-support">हेल्पलाइन कॉल: <span>6267392508</span> | व्हाट्सऐप: <span>7611148925</span></div>
    <div class="footer-tag">पेज 9 / 15</div>
  </div>
</div>

<!-- SLIDE 10: AUTOPOOL INCOME (7 LEVELS - 12.80+ CR) -->
<div class="slide">
  <div class="bg-circle-1"></div>
  <div class="slide-header">
    <div class="header-left">
      <img src="{img_logo}" class="header-logo" alt="SGM Logo">
      <div class="header-title-box">
        <h2>ऑटोपूल महा-इनकम <span class="sub-en">(NON-WORKING AUTO POOL PLAN)</span></h2>
        <p>Global Universal Matrix - Total Income Over 13 Crore Rupees</p>
      </div>
    </div>
    <div class="header-badge">ग्लोबल 2x2 ऑटो मैट्रिक्स</div>
  </div>

  <div class="slide-content">
    <div style="display: grid; grid-template-columns: 1.45fr 0.75fr; gap: 24px; align-items: center;">
      
      <!-- Table of 7 Levels -->
      <div>
        <table class="plan-table">
          <thead>
            <tr>
              <th style="width: 12%;">लेवल</th>
              <th style="width: 28%;">मैट्रिक्स गणना</th>
              <th style="width: 20%;">कुल अमाउंट (₹)</th>
              <th style="width: 20%;">अपग्रेड (₹)</th>
              <th style="width: 20%;">नेट इनकम (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 900; color: #fbbf24;">लेवल 1</td>
              <td style="font-family: monospace; font-size: 16px; font-weight: 700;">2 × ₹100</td>
              <td style="color: #ffffff;">₹ 200</td>
              <td style="color: #f87171;">₹ 125</td>
              <td class="highlight-col" style="font-size: 18px;">₹ 75</td>
            </tr>
            <tr>
              <td style="font-weight: 900; color: #fbbf24;">लेवल 2</td>
              <td style="font-family: monospace; font-size: 16px; font-weight: 700;">4 × ₹125</td>
              <td style="color: #ffffff;">₹ 500</td>
              <td style="color: #f87171;">₹ 300</td>
              <td class="highlight-col" style="font-size: 18px;">₹ 200</td>
            </tr>
            <tr>
              <td style="font-weight: 900; color: #fbbf24;">लेवल 3</td>
              <td style="font-family: monospace; font-size: 16px; font-weight: 700;">8 × ₹300</td>
              <td style="color: #ffffff;">₹ 2,400</td>
              <td style="color: #f87171;">₹ 1,000</td>
              <td class="highlight-col" style="font-size: 18px;">₹ 1,400</td>
            </tr>
            <tr>
              <td style="font-weight: 900; color: #fbbf24;">लेवल 4</td>
              <td style="font-family: monospace; font-size: 16px; font-weight: 700;">16 × ₹1,000</td>
              <td style="color: #ffffff;">₹ 16,000</td>
              <td style="color: #f87171;">₹ 6,000</td>
              <td class="highlight-col" style="font-size: 18px;">₹ 10,000</td>
            </tr>
            <tr>
              <td style="font-weight: 900; color: #fbbf24;">लेवल 5</td>
              <td style="font-family: monospace; font-size: 16px; font-weight: 700;">32 × ₹6,000</td>
              <td style="color: #ffffff;">₹ 1,92,000</td>
              <td style="color: #f87171;">₹ 75,000</td>
              <td class="highlight-col" style="font-size: 18px;">₹ 1,17,000</td>
            </tr>
            <tr>
              <td style="font-weight: 900; color: #fbbf24;">लेवल 6</td>
              <td style="font-family: monospace; font-size: 16px; font-weight: 700;">64 × ₹75,000</td>
              <td style="color: #ffffff;">₹ 48,00,000</td>
              <td style="color: #f87171;">₹ 10,00,000</td>
              <td class="highlight-col" style="font-size: 18px;">₹ 38,00,000</td>
            </tr>
            <tr style="background: rgba(16, 185, 129, 0.25);">
              <td style="font-weight: 900; color: #fef08a;">लेवल 7</td>
              <td style="font-family: monospace; font-size: 16px; font-weight: 900;">128 × ₹10,00,000</td>
              <td style="color: #fbbf24; font-weight: 900; font-size: 18px;">₹ 12,80,00,000</td>
              <td style="color: #34d399; font-weight: 900;">NIL (0)</td>
              <td class="gold-col" style="font-size: 21px; font-weight: 900;">₹ 12.80 करोड़</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Autopool Explanatory Card -->
      <div class="card card-green" style="padding: 24px; text-align: center;">
        <div style="font-size: 38px; margin-bottom: 10px;">🌐 ⚡ 💰</div>
        <h3 style="font-size: 23px; font-weight: 900; color: #34d399; margin-bottom: 8px;">
          ऑटोपूल कैसे काम करता है?
        </h3>
        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.55; font-family: 'Hind', sans-serif; text-align: left;">
          • यह एक <strong>ग्लोबल 2x2 ऑटोपूल</strong> है, जिसमें ऑल ओवर इंडिया से कंपनी में आने वाली नई आईडिया आपके नीचे ऑटोमैटिकली प्लेस होती हैं।<br><br>
          • हर लेवल पूरा होने पर तय अपग्रेड राशि काटकर बाकी राशि <strong>तुरंत आपके विड्रॉल वॉलेट</strong> में ट्रांसफर कर दी जाती है।<br><br>
          • सातवें लेवल पर बिना किसी अपग्रेड के पूरे <strong>12.80 करोड़ रुपये</strong> की ऐतिहासिक इनकम प्राप्त होती है!
        </p>

        <div style="margin-top: 18px; padding: 12px; background: rgba(0,0,0,0.45); border-radius: 12px; border: 1.5px solid rgba(251,191,36,0.35);">
          <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">कुल संभावित ऑटोपूल इनकम</div>
          <div style="font-size: 25px; font-weight: 900; color: #fbbf24;">₹ 13,19,28,675/-</div>
          <div style="font-size: 12px; color: #34d399; font-weight: 800;">(तेरह करोड़ उन्नीस लाख रुपये से अधिक)</div>
        </div>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-web">🌐 www.sadgurumart.online</div>
    <div class="footer-support">हेल्पलाइन कॉल: <span>6267392508</span> | व्हाट्सऐप: <span>7611148925</span></div>
    <div class="footer-tag">पेज 10 / 15</div>
  </div>
</div>

<!-- SLIDE 11: RANK & REWARDS - PART 1 (RANKS 1 TO 7) -->
<div class="slide">
  <div class="bg-circle-2"></div>
  <div class="slide-header">
    <div class="header-left">
      <img src="{img_logo}" class="header-logo" alt="SGM Logo">
      <div class="header-title-box">
        <h2>रैंक एवं रिवार्ड्स <span class="sub-en">(RANK & REWARDS - PART 1)</span></h2>
        <p>Rewarding Your Dedication & Leadership at Every Milestone</p>
      </div>
    </div>
    <div class="header-badge">रैंक 1 से 7 तक (3% रिवार्ड फंड)</div>
  </div>

  <div class="slide-content">
    <table class="plan-table" style="font-size: 16px;">
      <thead>
        <tr>
          <th style="width: 10%;">क्र.</th>
          <th style="width: 25%;">रैंक पदनाम (RANK)</th>
          <th style="width: 18%;">लेफ्ट (L - RP)</th>
          <th style="width: 18%;">राइट (R - RP)</th>
          <th style="width: 29%;">शानदार रिवार्ड / कैश प्राइज</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: 900; color: #fbbf24;">1</td>
          <td style="font-weight: 900; color: #ffffff; text-align: left; padding-left: 25px;">⭐ 1 - स्टार (1-Star)</td>
          <td>30 RP</td>
          <td>30 RP</td>
          <td class="gold-col" style="font-size: 18px;">₹ 100 /- कैश</td>
        </tr>
        <tr>
          <td style="font-weight: 900; color: #fbbf24;">2</td>
          <td style="font-weight: 900; color: #ffffff; text-align: left; padding-left: 25px;">⭐⭐ 2 - स्टार (2-Star)</td>
          <td>150 RP</td>
          <td>150 RP</td>
          <td class="highlight-col" style="font-size: 18px;">⌚ आकर्षक स्मार्ट रिस्ट वॉच (घड़ी)</td>
        </tr>
        <tr>
          <td style="font-weight: 900; color: #fbbf24;">3</td>
          <td style="font-weight: 900; color: #ffffff; text-align: left; padding-left: 25px;">⭐⭐⭐ 3 - स्टार (3-Star)</td>
          <td>500 RP</td>
          <td>500 RP</td>
          <td class="gold-col" style="font-size: 18px;">₹ 1,500 /- कैश</td>
        </tr>
        <tr style="background: rgba(148, 163, 184, 0.18);">
          <td style="font-weight: 900; color: #fbbf24;">4</td>
          <td style="font-weight: 900; color: #e2e8f0; text-align: left; padding-left: 25px;">🥈 सिल्वर (Silver)</td>
          <td style="color: #38bdf8; font-weight: 900;">3,000 RP</td>
          <td style="color: #38bdf8; font-weight: 900;">3,000 RP</td>
          <td style="color: #38bdf8; font-size: 18px; font-weight: 900;">🛕 जगन्नाथ पुरी टूर (Puri Tour)</td>
        </tr>
        <tr style="background: rgba(251, 191, 36, 0.18);">
          <td style="font-weight: 900; color: #fbbf24;">5</td>
          <td style="font-weight: 900; color: #fbbf24; text-align: left; padding-left: 25px;">🥇 गोल्ड (Gold)</td>
          <td style="color: #fbbf24; font-weight: 900;">5,000 RP</td>
          <td style="color: #fbbf24; font-weight: 900;">5,000 RP</td>
          <td class="gold-col" style="font-size: 18px;">📱 ब्रांडेड 5G स्मार्टफोन</td>
        </tr>
        <tr style="background: rgba(239, 68, 68, 0.18);">
          <td style="font-weight: 900; color: #fbbf24;">6</td>
          <td style="font-weight: 900; color: #f87171; text-align: left; padding-left: 25px;">💎 रूबी (Ruby)</td>
          <td style="color: #f87171; font-weight: 900;">10,000 RP</td>
          <td style="color: #f87171; font-weight: 900;">10,000 RP</td>
          <td class="gold-col" style="font-size: 18px;">₹ 30,000 /- कैश प्राइज</td>
        </tr>
        <tr style="background: rgba(56, 189, 248, 0.18);">
          <td style="font-weight: 900; color: #fbbf24;">7</td>
          <td style="font-weight: 900; color: #38bdf8; text-align: left; padding-left: 25px;">🏆 प्लेटिनम (Platinum)</td>
          <td style="color: #38bdf8; font-weight: 900;">20,000 RP</td>
          <td style="color: #38bdf8; font-weight: 900;">20,000 RP</td>
          <td style="color: #34d399; font-size: 18px; font-weight: 900;">🏝️ भव्य रामेश्वरम टूर (Rameshwaram Tour)</td>
        </tr>
      </tbody>
    </table>
    
    <div style="margin-top: 14px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.06); padding: 12px 22px; border-radius: 10px;">
      <span style="font-size: 14px; color: #cbd5e1; font-weight: 600;">* रिवार्ड पॉइंट्स (RP) की गणना दोनों लेग्स (Left & Right) के सफल बिजनेस मैचिंग पर की जाती है।</span>
      <span style="font-size: 14px; font-weight: 800; color: #fbbf24;">अगले पेज पर देखें: सुपर लक्ज़री बाइक, कार एवं करोड़ों के रिवॉर्ड्स! 👉</span>
    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-web">🌐 www.sadgurumart.online</div>
    <div class="footer-support">हेल्पलाइन कॉल: <span>6267392508</span> | व्हाट्सऐप: <span>7611148925</span></div>
    <div class="footer-tag">पेज 11 / 15</div>
  </div>
</div>

<!-- SLIDE 12: RANK & REWARDS - PART 2 (RANKS 8 TO 15) -->
<div class="slide">
  <div class="bg-circle-1"></div>
  <div class="slide-header">
    <div class="header-left">
      <img src="{img_logo}" class="header-logo" alt="SGM Logo">
      <div class="header-title-box">
        <h2>महा लक्ज़री रिवार्ड्स <span class="sub-en">(RANK & REWARDS - PART 2)</span></h2>
        <p>Bikes, Luxury Cars & Multi-Crore Cash Rewards</p>
      </div>
    </div>
    <div class="header-badge">रैंक 8 से 15 तक (करोड़पति क्लब)</div>
  </div>

  <div class="slide-content">
    <table class="plan-table" style="font-size: 15px;">
      <thead>
        <tr>
          <th style="width: 8%;">क्र.</th>
          <th style="width: 25%;">रैंक पदनाम (RANK)</th>
          <th style="width: 18%;">लेफ्ट (L - RP)</th>
          <th style="width: 18%;">राइट (R - RP)</th>
          <th style="width: 31%;">भव्य रिवार्ड / नगद उपहार</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: 900; color: #fbbf24;">8</td>
          <td style="font-weight: 900; color: #34d399; text-align: left; padding-left: 20px;">🟢 एमराल्ड (Emerald)</td>
          <td>40,000 RP</td>
          <td>40,000 RP</td>
          <td class="highlight-col" style="font-size: 16px;">🏍️ ब्रांड न्यू बाइक (Motorcycle)</td>
        </tr>
        <tr>
          <td style="font-weight: 900; color: #fbbf24;">9</td>
          <td style="font-weight: 900; color: #38bdf8; text-align: left; padding-left: 20px;">💎 डायमंड (Diamond)</td>
          <td>1,00,000 RP</td>
          <td>1,00,000 RP</td>
          <td class="gold-col" style="font-size: 16px;">💵 ₹ 3,00,000 /- (3 लाख कैश)</td>
        </tr>
        <tr style="background: rgba(245, 158, 11, 0.18);">
          <td style="font-weight: 900; color: #fbbf24;">10</td>
          <td style="font-weight: 900; color: #fbbf24; text-align: left; padding-left: 20px;">💎💎 डबल डायमंड</td>
          <td>5,00,000 RP</td>
          <td>5,00,000 RP</td>
          <td style="color: #fbbf24; font-size: 17px; font-weight: 900;">🚗 शानदार चमचमाती कार</td>
        </tr>
        <tr>
          <td style="font-weight: 900; color: #fbbf24;">11</td>
          <td style="font-weight: 900; color: #a855f7; text-align: left; padding-left: 20px;">💎💎💎 ट्रिपल डायमंड</td>
          <td>10,00,000 RP</td>
          <td>10,00,000 RP</td>
          <td class="gold-col" style="font-size: 16px;">💵 ₹ 30,00,000 /- (30 लाख कैश)</td>
        </tr>
        <tr style="background: rgba(56, 189, 248, 0.18);">
          <td style="font-weight: 900; color: #fbbf24;">12</td>
          <td style="font-weight: 900; color: #38bdf8; text-align: left; padding-left: 20px;">👑 कोहिनूर (Kohinoor)</td>
          <td>20,00,000 RP</td>
          <td>20,00,000 RP</td>
          <td class="gold-col" style="font-size: 16px;">💵 ₹ 60,00,000 /- (60 लाख कैश)</td>
        </tr>
        <tr style="background: rgba(16, 185, 129, 0.22);">
          <td style="font-weight: 900; color: #fbbf24;">13</td>
          <td style="font-weight: 900; color: #ffffff; text-align: left; padding-left: 20px;">🏛️ अम्बेडकर (Ambassador)</td>
          <td style="font-weight: 900;">40,00,000 RP</td>
          <td style="font-weight: 900;">40,00,000 RP</td>
          <td style="color: #34d399; font-size: 18px; font-weight: 900;">💰 ₹ 1,00,00,000 /- (1 करोड़)</td>
        </tr>
        <tr style="background: rgba(245, 158, 11, 0.25);">
          <td style="font-weight: 900; color: #fbbf24;">14</td>
          <td style="font-weight: 900; color: #fbbf24; text-align: left; padding-left: 20px;">👑 रॉयल एम्बेसडर</td>
          <td style="font-weight: 900;">80,00,000 RP</td>
          <td style="font-weight: 900;">80,00,000 RP</td>
          <td style="color: #fbbf24; font-size: 18px; font-weight: 900;">💰 ₹ 2,00,00,000 /- (2 करोड़)</td>
        </tr>
        <tr style="background: radial-gradient(circle, rgba(239, 68, 68, 0.35) 0%, rgba(185, 28, 28, 0.45) 100%);">
          <td style="font-weight: 900; color: #fbbf24;">15</td>
          <td style="font-weight: 900; color: #fef08a; text-align: left; padding-left: 20px;">👑👑 क्राउन एम्बेसडर</td>
          <td style="font-weight: 900; color: #ffffff;">2 करोड़ RP</td>
          <td style="font-weight: 900; color: #ffffff;">2 करोड़ RP</td>
          <td style="color: #fef08a; font-size: 20px; font-weight: 900;">🏆 ₹ 3,00,00,000 /- (3 करोड़)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="slide-footer">
    <div class="footer-web">🌐 www.sadgurumart.online</div>
    <div class="footer-support">हेल्पलाइन कॉल: <span>6267392508</span> | व्हाट्सऐप: <span>7611148925</span></div>
    <div class="footer-tag">पेज 12 / 15</div>
  </div>
</div>

<!-- SLIDE 13: FUNDS, REPURCHASE & UTILITY CASHBACK -->
<div class="slide">
  <div class="bg-circle-2"></div>
  <div class="slide-header">
    <div class="header-left">
      <img src="{img_logo}" class="header-logo" alt="SGM Logo">
      <div class="header-title-box">
        <h2>फंड्स, रीपरचेस एवं यूटिलिटी रिचार्ज <span class="sub-en">(FUNDS & UTILITIES)</span></h2>
        <p>Continuous Residual Income from Daily Lifestyle & Essential Services</p>
      </div>
    </div>
    <div class="header-badge">आजीवन पैसिव इनकम</div>
  </div>

  <div class="slide-content">
    <div class="grid-3" style="gap: 22px; align-items: stretch;">
      
      <!-- 4 Life Funds -->
      <div class="card card-gold" style="padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
            <span style="font-size: 32px;">🏦</span>
            <h3 style="font-size: 21px; font-weight: 900; color: #fbbf24;">4 लक्ज़री लाइफ फंड्स</h3>
          </div>
          <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 15px; font-weight: 600;">
            कंपनी अपने कुल मासिक टर्नओवर से अलग-अलग फंड्स में रॉयल्टी आवंटित करती है:
          </p>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.35); padding: 9px 12px; border-radius: 8px;">
              <span style="font-weight: 800; color: #ffffff;">📱 मोबाइल फंड (Mobile Fund)</span>
              <span class="badge-yellow highlight-badge">2% CTO</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.35); padding: 9px 12px; border-radius: 8px;">
              <span style="font-weight: 800; color: #ffffff;">🏍️ बाइक फंड (Bike Fund)</span>
              <span class="badge-yellow highlight-badge">2% CTO</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.35); padding: 9px 12px; border-radius: 8px;">
              <span style="font-weight: 800; color: #ffffff;">🚗 कार फंड (Car Fund)</span>
              <span class="badge-yellow highlight-badge">2% CTO</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.35); padding: 9px 12px; border-radius: 8px;">
              <span style="font-weight: 800; color: #ffffff;">🏠 हाउस फंड (House Fund)</span>
              <span class="badge-yellow highlight-badge">2% CTO</span>
            </div>
          </div>
        </div>

        <p style="font-size: 12px; color: #94a3b8; margin-top: 10px;">
          * संबंधित रैंक हासिल करने वाले सभी योग्य लीडर्स में यह फंड समान रूप से वितरित किया जाता है।
        </p>
      </div>

      <!-- Purchase & Repurchase -->
      <div class="card card-green" style="padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
            <span style="font-size: 32px;">🔄</span>
            <h3 style="font-size: 21px; font-weight: 900; color: #34d399;">परचेस & रीपरचेस इनकम</h3>
          </div>
          <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 15px; font-weight: 600;">
            अपनी और अपनी टीम की हर बार की खरीदारी पर स्थायी मासिक आय:
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="background: rgba(0,0,0,0.35); padding: 14px; border-radius: 10px; border-left: 5px solid #10b981;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <h4 style="font-size: 17px; font-weight: 900; color: #ffffff;">परचेस इनकम</h4>
                <span class="badge-emerald highlight-badge">10% BV</span>
              </div>
              <p style="font-size: 13px; color: #cbd5e1;">आप जब भी पोर्टल से अपनी जरूरत का सामान खरीदेंगे, आपको 10% सेल्फ परचेस इनकम मिलेगी।</p>
            </div>

            <div style="background: rgba(0,0,0,0.35); padding: 14px; border-radius: 10px; border-left: 5px solid #38bdf8;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <h4 style="font-size: 17px; font-weight: 900; color: #ffffff;">रीपरचेस इनकम</h4>
                <span style="background: #38bdf8; color: #000;" class="highlight-badge">10% Team</span>
              </div>
              <p style="font-size: 13px; color: #cbd5e1;">आपकी पूरी टीम जब भी दोबारा कोई भी सामान खरीदेगी, उनकी रीपरचेस पर आपको 10% इनकम मिलेगी।</p>
            </div>
          </div>
        </div>

        <p style="font-size: 12px; color: #94a3b8; margin-top: 10px;">
          * नो डिमोशन, केवल एक्युमुलेटिव ग्रोथ सिस्टम!
        </p>
      </div>

      <!-- Recharge Cashback -->
      <div class="card" style="border: 2px solid rgba(56, 189, 248, 0.45); padding: 22px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
            <span style="font-size: 32px;">📶</span>
            <h3 style="font-size: 21px; font-weight: 900; color: #38bdf8;">यूटिलिटी रिचार्ज कैशबैक</h3>
          </div>
          <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 15px; font-weight: 600;">
            SGM Mart पोर्टल से हर महीने अपने मोबाइल व टीवी रिचार्ज पर सीधी बचत:
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="background: rgba(0,0,0,0.35); padding: 14px; border-radius: 10px; border: 1.5px solid rgba(16, 185, 129, 0.45);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 16px; font-weight: 900; color: #ffffff;">📱 मोबाइल रिचार्ज</span>
                <span class="badge-emerald highlight-badge">2.50%</span>
              </div>
              <p style="font-size: 13px; color: #94a3b8;">Jio, Airtel, Vi, BSNL आदि सभी मोबाइल ऑपरेटर्स पर फ्लैट 2.50% कैशबैक।</p>
            </div>

            <div style="background: rgba(0,0,0,0.35); padding: 14px; border-radius: 10px; border: 1.5px solid rgba(251, 191, 36, 0.45);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 16px; font-weight: 900; color: #ffffff;">📺 डीटीएच (DTH) रिचार्ज</span>
                <span class="badge-yellow highlight-badge">2.50%</span>
              </div>
              <p style="font-size: 13px; color: #94a3b8;">Tata Play, Airtel DTH, Dish TV आदि पर हर रिचार्ज पर 2.50% इंस्टेंट कैशबैक।</p>
            </div>
          </div>
        </div>

        <p style="font-size: 12px; color: #94a3b8; margin-top: 10px;">
          * सर्विस का उपयोग करें और घर का खर्च बचाएं!
        </p>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-web">🌐 www.sadgurumart.online</div>
    <div class="footer-support">हेल्पलाइन कॉल: <span>6267392508</span> | व्हाट्सऐप: <span>7611148925</span></div>
    <div class="footer-tag">पेज 13 / 15</div>
  </div>
</div>

<!-- SLIDE 14: TERMS & CONDITIONS -->
<div class="slide">
  <div class="bg-circle-1"></div>
  <div class="slide-header">
    <div class="header-left">
      <img src="{img_logo}" class="header-logo" alt="SGM Logo">
      <div class="header-title-box">
        <h2>नियम एवं शर्तें <span class="sub-en">(TERMS & CONDITIONS)</span></h2>
        <p>Fair, Legal & Transparent Business Operations</p>
      </div>
    </div>
    <div class="header-badge">100% पारदर्शी नियम</div>
  </div>

  <div class="slide-content">
    <div class="grid-2" style="gap: 30px; align-items: center;">
      
      <!-- Left side rules list -->
      <div style="display: flex; flex-direction: column; gap: 14px;">
        
        <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 5px solid #10b981;">
          <div style="font-size: 32px;">💵</div>
          <div>
            <h4 style="font-size: 19px; font-weight: 900; color: #34d399;">न्यूनतम विड्रॉल (Minimum Withdrawal)</h4>
            <p style="font-size: 15px; color: #e2e8f0; font-family: 'Hind', sans-serif;">
              मात्र <strong style="color: #fbbf24; font-size: 19px;">₹ 100 /-</strong> होते ही आप कभी भी अपने बैंक खाते में विड्रॉल ले सकते हैं।
            </p>
          </div>
        </div>

        <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 5px solid #38bdf8;">
          <div style="font-size: 32px;">⏰</div>
          <div>
            <h4 style="font-size: 19px; font-weight: 900; color: #38bdf8;">क्लोजिंग एवं भुगतान (Closing & Payout)</h4>
            <p style="font-size: 15px; color: #e2e8f0; font-family: 'Hind', sans-serif;">
              <strong>डेली क्लोजिंग (Daily Closing)</strong> प्रतिदिन रात्रि 12:00 बजे एवं <strong>साप्ताहिक विड्रॉल (Weekly Withdrawal)</strong> सीधे आपके बैंक में।
            </p>
          </div>
        </div>

        <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 5px solid #fbbf24;">
          <div style="font-size: 32px;">⚖️</div>
          <div>
            <h4 style="font-size: 19px; font-weight: 900; color: #fbbf24;">कानूनी कटौती (Statutory Deductions)</h4>
            <p style="font-size: 15px; color: #e2e8f0; font-family: 'Hind', sans-serif;">
              प्रत्येक पेआउट पर <strong>एडमिन चार्ज 5%</strong> एवं भारत सरकार के नियमानुसार <strong>TDS 5%</strong> काटा जाएगा।
            </p>
          </div>
        </div>

        <div class="card" style="padding: 16px; display: flex; align-items: center; gap: 16px; border-left: 5px solid #a855f7;">
          <div style="font-size: 32px;">🔒</div>
          <div>
            <h4 style="font-size: 19px; font-weight: 900; color: #c084fc;">केवाईसी एवं सुरक्षा (KYC Verification)</h4>
            <p style="font-size: 15px; color: #e2e8f0; font-family: 'Hind', sans-serif;">
              विड्रॉल लेने हेतु बैंक खाता और पैन कार्ड विवरण सही होना अनिवार्य है। एक पैन कार्ड पर मान्य नियमानुसार आईडी।
            </p>
          </div>
        </div>

      </div>

      <!-- Right side highlights -->
      <div class="card card-gold" style="border-width: 2px; padding: 30px; text-align: center;">
        <div style="width: 75px; height: 75px; margin: 0 auto 15px auto; background: rgba(251, 191, 36, 0.18); border: 2.5px solid #fbbf24; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px;">
          ✓
        </div>
        <h3 style="font-size: 25px; font-weight: 900; color: #ffffff; margin-bottom: 8px;">
          सद्गुरु मार्ट की वचनबद्धता
        </h3>
        <p style="font-size: 16px; color: #fbbf24; font-weight: 800; margin-bottom: 18px;">
          "सुरक्षित सिस्टम • समय पर पेआउट • 100% लीगल प्रक्रिया"
        </p>

        <div style="text-align: left; background: rgba(0,0,0,0.35); padding: 18px; border-radius: 12px; font-size: 14px; color: #cbd5e1; display: flex; flex-direction: column; gap: 10px; font-family: 'Hind', sans-serif;">
          <div>✔ 24×7 सर्वर अपटाइम एवं तत्काल ऑटोमेशन पोर्टल।</div>
          <div>✔ सभी उत्पादों पर उच्च गुणवत्ता और संतुष्टि की गारंटी।</div>
          <div>✔ आपकी मेहनत की एक-एक पाई का पूरा हिसाब और पूर्ण सुरक्षा।</div>
          <div>✔ भारत सरकार की डायरेक्ट सेलिंग गाइडलाइन्स का 100% पालन।</div>
        </div>

        <div style="margin-top: 20px; font-size: 13px; color: #94a3b8; font-weight: 600;">
          किसी भी तकनीकी समस्या या सहायता हेतु हमारी कस्टमर केयर टीम हमेशा उपलब्ध है।
        </div>
      </div>

    </div>
  </div>

  <div class="slide-footer">
    <div class="footer-web">🌐 www.sadgurumart.online</div>
    <div class="footer-support">हेल्पलाइन कॉल: <span>6267392508</span> | व्हाट्सऐप: <span>7611148925</span></div>
    <div class="footer-tag">पेज 14 / 15</div>
  </div>
</div>

<!-- SLIDE 15: CONTACT DETAILS & THANK YOU -->
<div class="slide cover-slide" style="padding: 0.55in 0.8in;">
  <div class="bg-circle-1"></div>
  <div class="bg-circle-2"></div>

  <!-- Top Badge -->
  <div style="z-index: 2;">
    <div style="background: rgba(245, 158, 11, 0.2); border: 2px solid #fbbf24; display: inline-block; padding: 8px 32px; border-radius: 30px; font-size: 16px; font-weight: 900; color: #fef08a; letter-spacing: 1px;">
      ★ आपका उज्ज्वल भविष्य, हमारी सर्वोच्च प्राथमिकता ★
    </div>
  </div>

  <!-- Middle Center Box -->
  <div style="z-index: 2; display: flex; flex-direction: column; align-items: center; max-width: 1050px; gap: 14px;">
    <img src="{img_logo}" style="width: 115px; height: 115px; object-fit: contain; filter: drop-shadow(0 0 25px rgba(16, 185, 129, 0.7));" alt="SGM Logo">
    
    <h1 style="font-size: 60px; font-weight: 900; color: #fbbf24; text-shadow: 0 4px 25px rgba(245, 158, 11, 0.45); line-height: 1;">
      THANK YOU! (धन्यवाद)
    </h1>
    
    <p style="font-size: 26px; font-weight: 900; color: #38bdf8; letter-spacing: 1px;">
      सद्गुरु मार्ट परिवार में आपका हार्दिक स्वागत है!
    </p>

    <div style="background: rgba(255, 255, 255, 0.08); border: 1.5px solid rgba(255,255,255,0.22); padding: 12px 38px; border-radius: 40px; margin: 4px 0;">
      <p style="font-size: 23px; font-weight: 800; color: #34d399; font-family: 'Hind', sans-serif;">
        "आज ही जुड़ें और अपने सपनों को नई उड़ान दें!"
      </p>
    </div>

    <!-- Contact Cards Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; width: 100%; margin-top: 8px;">
      
      <!-- Call -->
      <div class="card card-green" style="padding: 18px; text-align: center; border-width: 2px;">
        <div style="font-size: 34px; margin-bottom: 6px;">📞</div>
        <div style="font-size: 13px; font-weight: 800; color: #a7f3d0; text-transform: uppercase;">कॉल करें (Call Us)</div>
        <div style="font-size: 24px; font-weight: 900; color: #ffffff; margin-top: 4px;">6267392508</div>
        <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px; font-weight: 600;">सोमवार - शनिवार (10 AM - 7 PM)</div>
      </div>

      <!-- WhatsApp -->
      <div class="card card-green" style="padding: 18px; text-align: center; border-width: 2px;">
        <div style="font-size: 34px; margin-bottom: 6px;">💬</div>
        <div style="font-size: 13px; font-weight: 800; color: #a7f3d0; text-transform: uppercase;">व्हाट्सऐप (WhatsApp)</div>
        <div style="font-size: 24px; font-weight: 900; color: #34d399; margin-top: 4px;">7611148925</div>
        <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px; font-weight: 600;">24×7 मैसेज सपोर्ट</div>
      </div>

      <!-- Website -->
      <div class="card card-gold" style="padding: 18px; text-align: center; border-width: 2px;">
        <div style="font-size: 34px; margin-bottom: 6px;">🌐</div>
        <div style="font-size: 13px; font-weight: 800; color: #fde68a; text-transform: uppercase;">ऑफिशियल वेबसाइट</div>
        <div style="font-size: 20px; font-weight: 900; color: #fbbf24; margin-top: 6px;">sadgurumart.online</div>
        <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px; font-weight: 600;">ऑनलाइन शॉपिंग & आईडी लॉगिन</div>
      </div>

    </div>
  </div>

  <div style="z-index: 2; width: 100%; text-align: center; border-top: 1px solid rgba(255,255,255,0.18); padding-top: 12px;">
    <p style="font-size: 17px; font-weight: 800; color: #cbd5e1; font-family: 'Hind', sans-serif;">
      "S G M Mart का एक ही नारा — बेरोजगारी और रोग मुक्त हो भारत हमारा"
    </p>
  </div>
</div>

</body>
</html>
"""

with open("Sadguru_Mart_MLM_Plan.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("Saved updated Sadguru_Mart_MLM_Plan.html.")
