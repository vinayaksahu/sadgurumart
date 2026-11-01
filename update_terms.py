import sys

with open("build_expanded_bold_plan.py", "r", encoding="utf-8") as f:
    code = f.read()

old_slide24 = """# ==============================================================================
# SLIDE 24: TERMS, CLOSING & WITHDRAWAL
# ==============================================================================
s24 = f\"\"\"
<div class="slide">
  {slide_header("23", "नियम एवं शर्तें", "सिस्टम नियम, विड्रॉल एवं बैंकिंग प्रक्रिया", "System Rules, Weekly Withdrawal & Banking Compliance", "100% पारदर्शी, सुरक्षित एवं सरकारी गाइडलाइंस के अनुरूप बैंकिंग व्यवस्था", "100% Transparent, Secure & Compliant Payout Operations")}
  
  <div class="slide-body" style="justify-content:center;">
    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:26px;">
      <!-- Rule 1 -->
      <div class="card-white border-accent-green" style="padding:28px 32px; display:flex; align-items:center; gap:24px;">
        <div style="font-size:44px;">💵</div>
        <div>
          <div style="font-size:24px; font-weight:900; color:#144732; margin-bottom:6px;">न्यूनतम विड्रॉल मात्र ₹ 100/-</div>
          <div style="font-size:18px; color:#374151; font-weight:600; line-height:1.5;">
            वॉलेट में मात्र ₹100 होते ही आप अपने बैंक खाते में सीधे विड्रॉल ले सकते हैं।
          </div>
        </div>
      </div>

      <!-- Rule 2 -->
      <div class="card-white border-accent-gold" style="padding:28px 32px; display:flex; align-items:center; gap:24px;">
        <div style="font-size:44px;">⏰</div>
        <div>
          <div style="font-size:24px; font-weight:900; color:#92580a; margin-bottom:6px;">डेली क्लोजिंग एवं वीकली विड्रॉल</div>
          <div style="font-size:18px; color:#374151; font-weight:600; line-height:1.5;">
            प्रतिदिन रात्रि 12:00 बजे हिसाब क्लोजिंग और साप्ताहिक सीधा बैंक NEFT/IMPS ट्रांसफर।
          </div>
        </div>
      </div>

      <!-- Rule 3 -->
      <div class="card-white border-accent-green" style="padding:28px 32px; display:flex; align-items:center; gap:24px;">
        <div style="font-size:44px;">⚖️</div>
        <div>
          <div style="font-size:24px; font-weight:900; color:#144732; margin-bottom:6px;">वैधानिक कटौती (5% Admin + 5% TDS)</div>
          <div style="font-size:18px; color:#374151; font-weight:600; line-height:1.5;">
            सरकारी नियमानुसार 5% TDS और 5% सिस्टम एडमिन चार्ज का पारदर्शी समायोजन।
          </div>
        </div>
      </div>

      <!-- Rule 4 -->
      <div class="card-white border-accent-gold" style="padding:28px 32px; display:flex; align-items:center; gap:24px;">
        <div style="font-size:44px;">🔒</div>
        <div>
          <div style="font-size:24px; font-weight:900; color:#92580a; margin-bottom:6px;">केवाईसी एवं सुरक्षा (KYC Mandatory)</div>
          <div style="font-size:18px; color:#374151; font-weight:600; line-height:1.5;">
            विड्रॉल हेतु बैंक खाता व पैन विवरण अनिवार्य। एक पैन कार्ड पर एक ही मुख्य आईडी मान्य।
          </div>
        </div>
      </div>
    </div>

    <!-- Assurance Banner -->
    <div style="margin-top:24px; background:#144732; border-radius:20px; padding:18px 36px; display:flex; justify-content:space-between; align-items:center;">
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
\"\"\""""

new_slide24 = """# ==============================================================================
# SLIDE 24: TERMS, CLOSING & WITHDRAWAL
# ==============================================================================
s24 = f\"\"\"
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
\"\"\""""

if old_slide24 in code:
    code = code.replace(old_slide24, new_slide24)
    with open("build_expanded_bold_plan.py", "w", encoding="utf-8") as f:
        f.write(code)
    print("Slide 24 updated successfully!")
else:
    print("Match not found, trying normalized search...")
    old_norm = old_slide24.replace("\r\n", "\n")
    code_norm = code.replace("\r\n", "\n")
    if old_norm in code_norm:
        code_norm = code_norm.replace(old_norm, new_slide24.replace("\r\n", "\n"))
        with open("build_expanded_bold_plan.py", "w", encoding="utf-8") as f:
            f.write(code_norm)
        print("Slide 24 updated successfully via normalization!")
    else:
        print("Normalization match failed.")
