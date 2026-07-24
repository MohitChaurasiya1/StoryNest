import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Formats date into a human readable string.
 */
const formatDate = (dateInput) => {
  try {
    const d = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(d.getTime())) return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
};

/**
 * Renders an offscreen DOM element, captures it with html2canvas, and adds it as a page in jsPDF.
 */
const appendContainerToPdf = async (pdf, container, isFirstPage = false) => {
  if (!isFirstPage) {
    pdf.addPage();
  }

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#FAF7F2',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  if (imgHeight <= pdfHeight) {
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  } else {
    // Scaling down if taller than page height
    const ratio = pdfHeight / imgHeight;
    const finalWidth = pdfWidth * ratio;
    const xOffset = (pdfWidth - finalWidth) / 2;
    pdf.addImage(imgData, 'PNG', xOffset, 0, finalWidth, pdfHeight);
  }
};

/**
 * Generates and downloads a multi-page Story PDF using real story data.
 */
export const generateStoryPDF = async (storyData) => {
  if (!storyData) {
    console.error('No story data provided for PDF generation.');
    return;
  }

  const childName = storyData.child_name || storyData.childName || 'Young Reader';
  const titleEn = storyData.title_en || storyData.titleEn || storyData.title || 'A Magical Adventure';
  const titleHi = storyData.title_hi || storyData.titleHi || '';
  const moral = storyData.moral || storyData.moral_lesson || 'Kindness & Growth';
  const completionDate = formatDate(storyData.created_at || storyData.createdAt);
  const pages = storyData.pages || [];

  // Create temporary hidden container for rendering PDF slides
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '-9999px';
  wrapper.style.left = '-9999px';
  wrapper.style.width = '794px'; // A4 width at 96DPI ~794px
  wrapper.style.fontFamily = "'Comic Sans MS', 'Inter', sans-serif";
  wrapper.style.color = '#2F3B2A';
  document.body.appendChild(wrapper);

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // ================= PAGE 1: COVER PAGE =================
    const coverContainer = document.createElement('div');
    coverContainer.style.width = '794px';
    coverContainer.style.minHeight = '1123px'; // A4 height at 96DPI ~1123px
    coverContainer.style.backgroundColor = '#FAF7F2';
    coverContainer.style.padding = '48px';
    coverContainer.style.boxSizing = 'border-box';
    coverContainer.style.display = 'flex';
    coverContainer.style.flexDirection = 'column';
    coverContainer.style.justifyContent = 'space-between';
    coverContainer.style.border = '12px solid #418C84';

    coverContainer.innerHTML = `
      <div style="text-align: center; margin-top: 24px;">
        <div style="display: inline-block; background: #418C84; color: #FFF; padding: 8px 24px; border-radius: 20px; font-weight: 700; font-size: 14px; letter-spacing: 1px; margin-bottom: 20px;">
          📖 STORYNEST AI STORYBOOK
        </div>
        <h1 style="font-size: 36px; color: #418C84; margin: 0 0 12px 0; font-family: Georgia, serif; line-height: 1.2;">
          ${titleEn}
        </h1>
        ${titleHi ? `<h2 style="font-size: 26px; color: #B5822A; margin: 0 0 24px 0; font-weight: 600;">${titleHi}</h2>` : ''}
        <div style="width: 100px; height: 4px; background: #B5822A; margin: 0 auto 30px auto; border-radius: 2px;"></div>
      </div>

      <div style="text-align: center; margin: 40px 0; background: #FFFFFF; border: 3px dashed #5AB0A6; border-radius: 24px; padding: 40px;">
        <div style="font-size: 64px; margin-bottom: 16px;">🦁✨📚</div>
        <h3 style="font-size: 22px; color: #2F3B2A; margin: 0 0 8px 0;">Specially Created For:</h3>
        <div style="font-size: 32px; font-weight: 800; color: #B5822A; letter-spacing: 0.5px;">
          ${childName}
        </div>
      </div>

      <div style="background: #E8F4F2; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-around; font-size: 14px; color: #2F3B2A;">
          <div><strong>🌟 Core Moral:</strong> ${moral}</div>
          <div><strong>📅 Date:</strong> ${completionDate}</div>
          <div><strong>📄 Pages:</strong> ${pages.length}</div>
        </div>
      </div>

      <div style="text-align: center; color: #71A87D; font-size: 13px; font-weight: 600;">
        Powered by StoryNest Learning Academy • Personalized AI Children Stories
      </div>
    `;

    wrapper.appendChild(coverContainer);
    await appendContainerToPdf(pdf, coverContainer, true);
    wrapper.removeChild(coverContainer);

    // ================= STORY PAGES =================
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageNum = page.page_number || (i + 1);
      const textEn = page.text_en || page.en || '';
      const textHi = page.text_hi || page.hi || '';
      const illustrationPrompt = page.illustration_prompt || '';
      const dictionary = page.dictionary || {};

      const pageContainer = document.createElement('div');
      pageContainer.style.width = '794px';
      pageContainer.style.minHeight = '1123px';
      pageContainer.style.backgroundColor = '#FAF7F2';
      pageContainer.style.padding = '40px';
      pageContainer.style.boxSizing = 'border-box';
      pageContainer.style.display = 'flex';
      pageContainer.style.flexDirection = 'column';
      pageContainer.style.justifyContent = 'space-between';
      pageContainer.style.border = '4px solid #5AB0A6';

      let vocabHtml = '';
      if (dictionary && Object.keys(dictionary).length > 0) {
        vocabHtml = `
          <div style="margin-top: 16px; background: #FFF8EA; border: 1.5px solid #FCE38A; border-radius: 12px; padding: 14px;">
            <div style="font-size: 12px; font-weight: 800; color: #B5822A; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
              <span>📖</span> VOCABULARY FOR THIS PAGE:
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              ${Object.entries(dictionary).map(([word, def]) => `
                <div style="font-size: 11px; color: #2F3B2A; background: #FFF; padding: 6px 10px; border-radius: 6px; border: 1px solid #E8C27A;">
                  <strong style="color: #418C84;">${word}:</strong> ${def}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      pageContainer.innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #5AB0A6; padding-bottom: 10px; margin-bottom: 20px;">
            <span style="font-size: 14px; font-weight: 700; color: #418C84;">${titleEn}</span>
            <span style="background: #418C84; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700;">
              Page ${pageNum} of ${pages.length}
            </span>
          </div>

          <div style="background: #FFFFFF; border: 2px solid #E2E8F0; border-radius: 16px; padding: 20px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 42px; margin-bottom: 8px;">🎨</div>
            <div style="font-size: 13px; color: #418C84; font-weight: 700; margin-bottom: 4px;">Story Illustration Prompt</div>
            <div style="font-size: 12px; color: #64748B; font-style: italic;">"${illustrationPrompt || 'Whimsical watercolor scene illustration'}"</div>
          </div>

          <div style="background: #FFFFFF; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 16px;">
            <h4 style="font-size: 12px; text-transform: uppercase; color: #71A87D; letter-spacing: 1px; margin: 0 0 8px 0;">English Text</h4>
            <p style="font-size: 16px; line-height: 1.6; color: #2F3B2A; margin: 0; font-family: Georgia, serif;">
              ${textEn}
            </p>
          </div>

          ${textHi ? `
            <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 16px; padding: 24px;">
              <h4 style="font-size: 12px; text-transform: uppercase; color: #166534; letter-spacing: 1px; margin: 0 0 8px 0;">Hindi Translation (हिंदी)</h4>
              <p style="font-size: 16px; line-height: 1.6; color: #14532D; margin: 0; font-family: 'Segoe UI', Tahoma, sans-serif;">
                ${textHi}
              </p>
            </div>
          ` : ''}

          ${vocabHtml}
        </div>

        <div style="text-align: center; font-size: 11px; color: #94A3B8; margin-top: 16px;">
          StoryNest • Page ${pageNum}
        </div>
      `;

      wrapper.appendChild(pageContainer);
      await appendContainerToPdf(pdf, pageContainer, false);
      wrapper.removeChild(pageContainer);
    }

    // ================= PAGE FINAL: MORAL & GLOSSARY =================
    const summaryContainer = document.createElement('div');
    summaryContainer.style.width = '794px';
    summaryContainer.style.minHeight = '1123px';
    summaryContainer.style.backgroundColor = '#FAF7F2';
    summaryContainer.style.padding = '40px';
    summaryContainer.style.boxSizing = 'border-box';
    summaryContainer.style.display = 'flex';
    summaryContainer.style.flexDirection = 'column';
    summaryContainer.style.justifyContent = 'space-between';
    summaryContainer.style.border = '4px solid #B5822A';

    let allVocabHtml = '';
    const allDict = {};
    pages.forEach(p => {
      if (p.dictionary) Object.assign(allDict, p.dictionary);
    });

    if (Object.keys(allDict).length > 0) {
      allVocabHtml = `
        <div style="background: #FFFFFF; border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1.5px solid #FCE38A;">
          <h3 style="font-size: 18px; color: #B5822A; margin: 0 0 16px 0; font-family: Georgia, serif;">
            📚 Complete Story Vocabulary Glossary
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            ${Object.entries(allDict).map(([w, d]) => `
              <div style="background: #FFF8EA; padding: 10px; border-radius: 8px; font-size: 12px;">
                <strong style="color: #418C84; font-size: 13px;">${w}</strong>
                <div style="color: #475569; margin-top: 2px;">${d}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    summaryContainer.innerHTML = `
      <div>
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px;">🌟</div>
          <h2 style="font-size: 26px; color: #418C84; margin: 8px 0; font-family: Georgia, serif;">Story Moral & Lessons</h2>
          <div style="font-size: 14px; color: #64748B;">Reflect on the journey of ${childName}</div>
        </div>

        <div style="background: #418C84; color: #FFFFFF; border-radius: 20px; padding: 30px; text-align: center; margin-bottom: 30px;">
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #FCE38A; margin: 0 0 10px 0;">
            THE MORAL OF THE STORY
          </h3>
          <p style="font-size: 22px; font-family: Georgia, serif; line-height: 1.4; margin: 0;">
            "${moral}"
          </p>
        </div>

        ${allVocabHtml}
      </div>

      <div style="text-align: center; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px;">
        <h4 style="font-size: 16px; color: #2F3B2A; margin: 0 0 6px 0;">🎉 Great Reading Achievement!</h4>
        <p style="font-size: 13px; color: #64748B; margin: 0;">
          Keep exploring, learning, and dreaming with StoryNest!
        </p>
      </div>
    `;

    wrapper.appendChild(summaryContainer);
    await appendContainerToPdf(pdf, summaryContainer, false);
    wrapper.removeChild(summaryContainer);

    // Save output PDF
    const safeTitle = titleEn.replace(/[^a-zA-Z0-9]/g, '_');
    pdf.save(`${childName}_StoryBook_${safeTitle}.pdf`);
  } catch (error) {
    console.error('Error generating Story PDF:', error);
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
};

/**
 * Generates and downloads a landscape Certificate PDF using real story data.
 */
export const generateCertificatePDF = async (storyData) => {
  if (!storyData) {
    console.error('No story data provided for Certificate PDF generation.');
    return;
  }

  const childName = (storyData.child_name || storyData.childName || 'Young Reader').toUpperCase();
  const titleEn = storyData.title_en || storyData.titleEn || storyData.title || 'A Magical Adventure';
  const titleHi = storyData.title_hi || storyData.titleHi || '';
  const moral = storyData.moral || storyData.moral_lesson || 'Kindness & Learning';
  const completionDate = formatDate(storyData.created_at || storyData.createdAt);

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '-9999px';
  wrapper.style.left = '-9999px';
  wrapper.style.width = '1056px'; // Landscape width ~1056px at 96DPI (11 in)
  wrapper.style.fontFamily = "'Inter', sans-serif";
  document.body.appendChild(wrapper);

  try {
    const certContainer = document.createElement('div');
    certContainer.style.width = '1056px';
    certContainer.style.minHeight = '816px'; // Landscape height ~816px at 96DPI (8.5 in)
    certContainer.style.backgroundColor = '#FAF7F2';
    certContainer.style.padding = '36px';
    certContainer.style.boxSizing = 'border-box';
    certContainer.style.position = 'relative';

    certContainer.innerHTML = `
      <div style="border: 6px solid #418C84; height: 100%; min-height: 744px; padding: 24px; box-sizing: border-box; position: relative;">
        <div style="border: 2px solid #B5822A; height: 100%; min-height: 692px; padding: 30px; box-sizing: border-box; text-align: center; display: flex; flex-direction: column; justify-content: space-between; background: #FFFFFF; border-radius: 8px;">

          <!-- Top Academy Header -->
          <div>
            <div style="font-size: 13px; font-weight: 700; color: #71A87D; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 8px;">
              STORYNEST ACADEMY OF LEARNING
            </div>
            <h1 style="font-size: 40px; font-family: Georgia, serif; color: #418C84; margin: 0 0 6px 0; letter-spacing: 1px; font-weight: 800;">
              CERTIFICATE OF READING
            </h1>
            <div style="width: 180px; height: 3px; background: linear-gradient(90deg, #418C84, #B5822A); margin: 0 auto;"></div>
          </div>

          <!-- Certificate Recipient Section -->
          <div style="margin: 20px 0;">
            <div style="font-size: 16px; color: #64748B; font-style: italic; margin-bottom: 12px;">
              This proud achievement is officially awarded to
            </div>
            <div style="font-size: 38px; font-weight: 900; color: #B5822A; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; font-family: Georgia, serif;">
              ${childName}
            </div>
            <div style="font-size: 15px; color: #334155; line-height: 1.5; max-width: 750px; margin: 0 auto;">
              For successfully reading, comprehending, and reflecting upon the custom storybook:
            </div>
            <div style="font-size: 24px; font-weight: 700; color: #418C84; margin: 10px 0 4px 0; font-family: Georgia, serif;">
              "${titleEn}"
            </div>
            ${titleHi ? `<div style="font-size: 18px; color: #B5822A; font-weight: 600;">"${titleHi}"</div>` : ''}
          </div>

          <!-- Moral / Achievement Badge -->
          <div style="display: flex; justify-content: center; align-items: center; gap: 30px; margin: 10px 0;">
            <div style="background: #F0FDF4; border: 1.5px solid #86EFAC; padding: 10px 24px; border-radius: 12px; font-size: 13px; color: #166534;">
              <strong>🌟 Moral Learned:</strong> ${moral}
            </div>

            <!-- Gold Medal Seal -->
            <div style="background: linear-gradient(135deg, #FCE38A, #B5822A); color: #FFF; width: 74px; height: 74px; border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 4px 10px rgba(181, 130, 42, 0.4); border: 2px solid #FFF;">
              <span style="font-size: 22px;">🏆</span>
              <span style="font-size: 7px; font-weight: 900; letter-spacing: 0.5px; text-align: center; text-transform: uppercase;">CHAMPION</span>
            </div>

            <div style="background: #EFF6FF; border: 1.5px solid #93C5FD; padding: 10px 24px; border-radius: 12px; font-size: 13px; color: #1E40AF;">
              <strong>📅 Completion Date:</strong> ${completionDate}
            </div>
          </div>

          <!-- Signatures Footer -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 40px; margin-top: 10px;">
            <div style="text-align: center; width: 220px;">
              <div style="font-family: 'Brush Script MT', cursive, Georgia, serif; font-size: 22px; color: #418C84; margin-bottom: 4px;">StoryNest Guide</div>
              <div style="border-top: 1.5px solid #CBD5E1; padding-top: 4px; font-size: 12px; font-weight: 700; color: #475569;">
                StoryNest AI Instructor
              </div>
            </div>

            <div style="text-align: center; width: 220px;">
              <div style="font-family: 'Brush Script MT', cursive, Georgia, serif; font-size: 22px; color: #B5822A; margin-bottom: 4px;">Parent / Educator</div>
              <div style="border-top: 1.5px solid #CBD5E1; padding-top: 4px; font-size: 12px; font-weight: 700; color: #475569;">
                Parent / Educator Signature
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    wrapper.appendChild(certContainer);

    const canvas = await html2canvas(certContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FAF7F2',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`StoryNest_Certificate_${childName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  } catch (error) {
    console.error('Error generating Certificate PDF:', error);
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }
};
