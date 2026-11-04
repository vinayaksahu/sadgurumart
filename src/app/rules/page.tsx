import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  CheckCircle2, 
  Scale, 
  Building2, 
  Award,
  Lock,
  Clock,
  ArrowRight
} from 'lucide-react';

export const metadata = {
  title: 'Rules & Legal Documents | SGM Mart (सद्गुरु मार्ट)',
  description: 'SGM Mart आधिकारिक वैधानिक दस्तावेज़, GST, FSSAI, PAN, Udyam MSME रजिस्ट्रेशन एवं नियम व शर्तें। 100% Direct Selling Rules 2021 Compliant.',
};

const legalDocs = [
  {
    id: 'gst',
    title: 'जीएसटी रजिस्ट्रेशन प्रमाणपत्र (GST Certificate)',
    subTitle: 'Goods and Services Tax Registration (Form GST REG-06)',
    regNumber: '22AGCFS2395A1ZC',
    regLabel: 'GSTIN',
    authority: 'Government of India (भारत सरकार)',
    date: '28/10/2026',
    thumb: '/legal/gst_thumb.png',
    pdfUrl: '/legal/SGM_Mart_GST_Certificate.pdf',
    badge: 'Form GST REG-06',
    color: 'emerald',
  },
  {
    id: 'fssai',
    title: 'FSSAI खाद्य सुरक्षा एवं मानक प्रमाणपत्र',
    subTitle: 'Registration Certificate under Food Safety and Standards Act, 2006',
    regNumber: '20526059000322',
    regLabel: 'पंजीकरण संख्या (FSSAI Reg. No.)',
    authority: 'Food Safety and Standards Authority of India (Govt. of Chhattisgarh)',
    date: 'मान्य (Active)',
    thumb: '/legal/fssai_thumb.png',
    pdfUrl: '/legal/SGM_Mart_FSSAI_Certificate.pdf',
    badge: 'FSS Act 2006 Compliant',
    color: 'amber',
  },
  {
    id: 'pan',
    title: 'कंपनी पैन कार्ड (Income Tax Department PAN)',
    subTitle: 'Permanent Account Number Card - Government of India',
    regNumber: 'AGCFS2395A',
    regLabel: 'PAN Number',
    authority: 'Income Tax Department (आयकर विभाग, भारत सरकार)',
    date: '15/10/2026',
    thumb: '/legal/pan_thumb.png',
    pdfUrl: '/legal/SGM_Mart_PAN_Card.pdf',
    badge: 'e-PAN Digitally Verified',
    color: 'blue',
  },
  {
    id: 'udyam',
    title: 'एमएसएमई उद्यम रजिस्ट्रेशन प्रमाणपत्र (MSME Udyam)',
    subTitle: 'Ministry of Micro, Small and Medium Enterprises Registration',
    regNumber: 'UDYAM-CG-09-0021023',
    regLabel: 'उद्यम रजिस्ट्रेशन संख्या',
    authority: 'Ministry of MSME, Govt. of India (सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय)',
    date: '02/11/2026',
    thumb: '/legal/udyam_thumb.png',
    pdfUrl: '/legal/SGM_Mart_Udyam_Registration.pdf',
    badge: 'Micro Enterprise (Govt. of India)',
    color: 'purple',
  },
  {
    id: 'deed',
    title: 'पार्टनरशिप डीड (Registered Partnership Deed)',
    subTitle: 'Legal Deed of Partnership - S G M MART ONLINE SERVICE',
    regNumber: 'REG-CG-P-DEED-2026',
    regLabel: 'दस्तावेज़ संख्या',
    authority: 'Government of Chhattisgarh (छ.ग. राज्य)',
    date: 'अक्टूबर 2026',
    thumb: '/legal/deed_thumb.png',
    pdfUrl: '/legal/SGM_Mart_Partnership_Deed.pdf',
    badge: 'Registered Entity Deed',
    color: 'teal',
  },
];

const rules = [
  {
    icon: '💰',
    title: 'मिनिमम विड्रॉल मात्र ₹100/-',
    desc: 'सदस्यों के वॉलेट में मात्र ₹100/- होते ही तुरंत बैंक ट्रांसफर के लिए विड्रॉल रिक्वेस्ट लगा सकते हैं।',
    tag: '₹100 Minimum',
  },
  {
    icon: '⏱️',
    title: 'डेली क्लोजिंग एवं वीकली विड्रॉल',
    desc: 'प्रतिदिन रात्रि 12:00 बजे बिजनेस का स्वचालित क्लोजिंग होता है और साप्ताहिक आधार पर बैंक खातों में पेआउट दिया जाता है।',
    tag: 'Daily Closing • Weekly Payout',
  },
  {
    icon: '🏛️',
    title: 'वैधानिक कटौती: 5% Admin + 5% TDS',
    desc: 'भारत सरकार के नियमों के अनुसार 5% TDS (पैन कार्ड आधारित) और 5% पोर्टल मेंटेनेंस एवं एडमिन चार्ज काटा जाता है।',
    tag: '100% Tax Compliant',
  },
  {
    icon: '🔒',
    title: 'केवाईसी एवं सुरक्षा (KYC Mandatory)',
    desc: 'बैंक खाता व पैन सत्यापन अनिवार्य है। प्रत्यक्ष बिक्री नियमों के तहत 1 पैन कार्ड पर अधिकतम 3 मुख्य आईडी मान्य हैं।',
    tag: 'Max 3 IDs per PAN',
  },
  {
    icon: '📦',
    title: '100% उत्पाद-आधारित व्यापार (Product-First)',
    desc: 'हर एक्टिवेशन और रीपरचेस पर वास्तविक उपयोगी व ब्रांडेड उत्पाद प्रदान किए जाते हैं। कोई मनी-सर्कुलेशन नहीं।',
    tag: 'Direct Selling 2021',
  },
  {
    icon: '🤝',
    title: 'पारदर्शिता व उपभोक्ता संरक्षण',
    desc: 'उपभोक्ता संरक्षण (प्रत्यक्ष बिक्री) नियम 2021 के तहत सभी नियम पारदर्शी हैं। 24×7 टिकट सपोर्ट सिस्टम सक्रिय है।',
    tag: 'Consumer Protection',
  },
];

export default function RulesAndLegalPage() {
  return (
    <div className="min-h-screen bg-[#f8f6f0] text-slate-800 font-sans flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#0b2b1e] via-[#144732] to-[#144732] text-white pt-16 pb-20 border-b-4 border-[#d4a359]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#fef08a] text-xs font-black uppercase tracking-widest mb-4">
            <ShieldCheck className="w-4 h-4 text-[#a3e635]" />
            <span>100% Legal & Government Compliant Entity</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            वैधानिक दस्तावेज़ एवं नियम व शर्तें
          </h1>
          <p className="text-sm sm:text-base text-slate-200 mt-3 max-w-2xl mx-auto font-medium">
            S G M MART ONLINE SERVICE — भारत सरकार के प्रत्यक्ष बिक्री नियम 2021, GST, FSSAI और आयकर नियमों के पूर्ण अनुपालन के साथ संचालित।
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> GST रजिस्टर्ड
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> FSSAI सर्टिफाइड
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> MSME उद्यम प्रमाणित
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-white/10 text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> आयकर पैन सत्यापित
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16 flex-1 w-full">

        {/* SECTION 1: Legal Registration Certificates */}
        <section id="certificates" className="space-y-6">
          <div className="border-b border-[#e8e3d5] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-[#92580a]">
                OFFICIAL CERTIFICATES & LICENSES
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#144732] mt-1">
                कंपनी के कानूनी रजिस्ट्रेशन प्रमाणपत्र (Legal Documents)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                सद्गुरु मार्ट के सभी सरकारी पंजीकरण दस्तावेज़ पूर्ण पारदर्शिता के साथ यहाँ उपलब्ध हैं। आप प्रत्येक प्रमाणपत्र को देख व डाउनलोड कर सकते हैं।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {legalDocs.map((doc) => (
              <div 
                key={doc.id}
                className="bg-white rounded-3xl border border-[#e8e3d5] overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group hover:border-[#144732]/40"
              >
                <div>
                  {/* Certificate Thumbnail Preview */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden border-b border-slate-100 flex items-center justify-center p-3">
                    <img 
                      src={doc.thumb} 
                      alt={doc.title} 
                      className="w-full h-full object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-[#144732]/90 text-white font-mono text-[10px] font-black uppercase tracking-wider backdrop-blur-sm shadow">
                        {doc.badge}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-black text-[#144732] group-hover:text-[#92580a] transition-colors leading-snug">
                        {doc.title}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {doc.subTitle}
                      </div>
                    </div>

                    {/* Registration Details Box */}
                    <div className="bg-[#faf8f4] border border-[#d8d0bf] rounded-xl p-3 space-y-1.5">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        {doc.regLabel}:
                      </div>
                      <div className="font-mono text-sm font-black text-[#144732] break-all">
                        {doc.regNumber}
                      </div>
                      <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-200">
                        <strong>प्राधिकरण:</strong> {doc.authority}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-5 pt-0 flex items-center gap-2">
                  <a
                    href={doc.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#144732] hover:bg-[#0b2b1e] text-white text-xs font-black text-center transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#fef08a]" />
                    <span>PDF देखें</span>
                  </a>
                  <a
                    href={doc.pdfUrl}
                    download
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    title="PDF डाउनलोड करें"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>डाउनलोड</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: Rules & Business Conditions */}
        <section id="rules" className="space-y-6 pt-6">
          <div className="border-b border-[#e8e3d5] pb-4">
            <div className="text-xs uppercase font-extrabold tracking-widest text-[#92580a]">
              COMPLIANCE & TERMS
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#144732] mt-1">
              बिज़नेस नियम एवं शर्तें (Terms & Conditions)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              प्रत्यक्ष बिक्री नियम 2021 के दिशा-निर्देशों के अनुरूप सद्गुरु मार्ट के सभी नियम पूर्णतः पारदर्शी और स्पष्ट हैं।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-[#e8e3d5] shadow-sm hover:border-[#144732]/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-3xl">{rule.icon}</div>
                  <span className="px-2.5 py-1 rounded-lg bg-[#144732]/10 text-[#144732] font-mono text-[10px] font-black uppercase">
                    {rule.tag}
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#144732]">
                  {rule.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: Official Presentation PDF Download Box */}
        <section className="bg-gradient-to-r from-[#144732] to-[#0b2b1e] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#fef08a] text-xs font-black uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>Full Presentation Deck</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              सद्गुरु मार्ट ऑफिशियल बिज़नेस प्लान PDF
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              16 प्रकार की महा इनकम, सभी 9 प्रोडक्ट श्रेणियां, रिवॉर्ड्स एवं वैधानिक दस्तावेजों से सुसज्जित संपूर्ण 32-पेज प्रेजेंटेशन डाउनलोड करें।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <a
              href="/Sadguru_Mart.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#d4a359] hover:bg-[#b8863b] text-[#144732] font-black text-xs text-center transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <FileText className="w-4 h-4" />
              <span>Sadguru_Mart.pdf देखें</span>
            </a>
            <a
              href="/Sadguru_Mart.pdf"
              download
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-xs text-center transition-all flex items-center justify-center gap-2 border border-white/20"
            >
              <Download className="w-4 h-4" />
              <span>डाउनलोड करें</span>
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#0b2b1e] text-white py-8 border-t-4 border-[#d4a359] text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 SGM MART ONLINE SERVICE • All Rights Reserved</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Consumer Protection (Direct Selling) Rules, 2021 Compliant • 100% Legal Direct Selling Entity
          </p>
        </div>
      </footer>
    </div>
  );
}
