import os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

PAGE_WIDTH, PAGE_HEIGHT = landscape(letter)  # 792 x 612 pt

class SlideCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pages = []

    def showPage(self):
        self.pages.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self.pages)
        for page in self.pages:
            self.__dict__.update(page)
            self.draw_slide_frame(num_pages)
            super().showPage()
        super().save()

    def draw_slide_frame(self, total_pages):
        self.saveState()
        # Top gradient bars
        self.setFillColor(colors.HexColor('#6366F1'))  # Indigo
        self.rect(0, PAGE_HEIGHT - 6, PAGE_WIDTH * 0.45, 6, fill=True, stroke=False)
        self.setFillColor(colors.HexColor('#F43F5E'))  # Rose
        self.rect(PAGE_WIDTH * 0.45, PAGE_HEIGHT - 6, PAGE_WIDTH * 0.30, 6, fill=True, stroke=False)
        self.setFillColor(colors.HexColor('#10B981'))  # Emerald
        self.rect(PAGE_WIDTH * 0.75, PAGE_HEIGHT - 6, PAGE_WIDTH * 0.25, 6, fill=True, stroke=False)

        # Footer divider
        self.setStrokeColor(colors.HexColor('#E2E8F0'))
        self.setLineWidth(0.8)
        self.line(40, 30, PAGE_WIDTH - 40, 30)

        # Footer branding
        self.setFont('Helvetica-Bold', 8)
        self.setFillColor(colors.HexColor('#4F46E5'))
        self.drawString(40, 18, 'STORYNEST')
        
        self.setFont('Helvetica', 8)
        self.setFillColor(colors.HexColor('#64748B'))
        self.drawString(100, 18, '•  AI-Powered Bilingual Reading & Literacy Ecosystem')
        
        self.drawRightString(PAGE_WIDTH - 40, 18, f'Slide {self._pageNumber} of {total_pages}')
        self.restoreState()


def create_presentation_pdf(output_path="StoryNest_Presentation.pdf"):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=landscape(letter),
        leftMargin=40,
        rightMargin=40,
        topMargin=28,
        bottomMargin=38,
    )

    styles = getSampleStyleSheet()
    
    s_title_cover = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=32,
        leading=38,
        textColor=colors.HexColor('#0F172A'),
    )
    s_subtitle_cover = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#4F46E5'),
    )
    s_desc_cover = ParagraphStyle(
        'CoverDesc',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10.5,
        leading=15,
        textColor=colors.HexColor('#334155'),
    )
    s_slide_heading = ParagraphStyle(
        'SlideHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=19,
        leading=23,
        textColor=colors.HexColor('#0F172A'),
    )
    s_slide_subheading = ParagraphStyle(
        'SlideSubheading',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#64748B'),
    )
    s_card_title = ParagraphStyle(
        'CardTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor('#1E293B'),
    )
    s_card_body = ParagraphStyle(
        'CardBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.5,
        textColor=colors.HexColor('#475569'),
    )
    s_live_explain = ParagraphStyle(
        'LiveExplain',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#4338CA'),
    )
    s_badge = ParagraphStyle(
        'BadgeText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9,
        textColor=colors.HexColor('#FFFFFF'),
        alignment=1
    )

    story = []

    # =========================================================================
    # SLIDE 1 — TITLE & OVERVIEW
    # =========================================================================
    story.append(Spacer(1, 6))
    badge_table = Table([[
        Paragraph('<font color="#FFFFFF"><b>STORYNEST PRODUCT PITCH & LIVE DEMO</b></font>', s_badge)
    ]], colWidths=[240], rowHeights=[18])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#4F46E5')),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("StoryNest", s_title_cover))
    story.append(Spacer(1, 3))
    story.append(Paragraph("An AI-Powered Bilingual (English + Hindi) Reading & Literacy Platform", s_subtitle_cover))
    story.append(Spacer(1, 6))
    story.append(Paragraph("Creating personalized stories, interactive narration, and gamified comprehension experiences for children (Ages 3–12).", s_desc_cover))
    story.append(Spacer(1, 12))

    c1 = [
        Paragraph("<b>🤖 Google Gemini AI</b>", s_card_title),
        Spacer(1, 2),
        Paragraph("Generates personalized bilingual stories + vocabulary + quizzes atomically.", s_card_body)
    ]
    c2 = [
        Paragraph("<b>🌐 Bilingual Literacy</b>", s_card_title),
        Spacer(1, 2),
        Paragraph("English + Hindi text side-by-side with synchronized Web Speech TTS narration.", s_card_body)
    ]
    c3 = [
        Paragraph("<b>🎮 Gamified Quizzes</b>", s_card_title),
        Spacer(1, 2),
        Paragraph("Comprehension checks, star rewards, daily streaks & printable certificates.", s_card_body)
    ]
    c4 = [
        Paragraph("<b>📊 Dual Dashboards</b>", s_card_title),
        Spacer(1, 2),
        Paragraph("Dedicated Parent & Teacher portals with learning velocity & reading analytics.", s_card_body)
    ]

    cards_table = Table([[c1, c2, c3, c4]], colWidths=[172, 172, 172, 172])
    cards_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (3,0), (3,0), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#CBD5E1')),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#CBD5E1')),
        ('BOX', (2,0), (2,0), 1, colors.HexColor('#CBD5E1')),
        ('BOX', (3,0), (3,0), 1, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(cards_table)
    story.append(Spacer(1, 10))

    speaker_box = Table([[
        Paragraph('<b>🎤 Live Explanation Guide:</b><br/><i>“StoryNest ek AI-powered educational platform hai jo children ke liye personalized English-Hindi stories generate karta hai aur interactive reading, quizzes aur gamification ke through literacy improve karta hai.”</i>', s_live_explain)
    ]], colWidths=[712])
    speaker_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EEF2FF')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#818CF8')),
        ('PADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(speaker_box)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 2 — CORE LEARNING & AI FLOW (VISUAL-HEAVY)
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(Paragraph("Slide 2 — Core Learning & AI Architecture Flow", s_slide_heading))
    story.append(Paragraph("Visual step-by-step pipeline from child personalization to gamification and analytics", s_slide_subheading))
    story.append(Spacer(1, 8))

    step1 = [Paragraph("<b>1. Input</b>", s_card_title), Paragraph("Child profile, age, genre, morals", s_card_body)]
    step2 = [Paragraph("<b>2. Django API</b>", s_card_title), Paragraph("Structured JSON prompt contract", s_card_body)]
    step3 = [Paragraph("<b>3. Gemini AI</b>", s_card_title), Paragraph("Bilingual pages + dictionary + quiz", s_card_body)]
    step4 = [Paragraph("<b>4. PostgreSQL</b>", s_card_title), Paragraph("Atomic transactional save", s_card_body)]

    flow_row1 = Table([[step1, Paragraph("➔", s_card_title), step2, Paragraph("➔", s_card_title), step3, Paragraph("➔", s_card_title), step4]],
                      colWidths=[150, 20, 150, 20, 150, 20, 150])
    flow_row1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (4,0), (4,0), colors.HexColor('#F1F5F9')),
        ('BACKGROUND', (6,0), (6,0), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#CBD5E1')),
        ('BOX', (2,0), (2,0), 1, colors.HexColor('#CBD5E1')),
        ('BOX', (4,0), (4,0), 1, colors.HexColor('#CBD5E1')),
        ('BOX', (6,0), (6,0), 1, colors.HexColor('#CBD5E1')),
        ('ALIGN', (1,0), (1,0), 'CENTER'),
        ('ALIGN', (3,0), (3,0), 'CENTER'),
        ('ALIGN', (5,0), (5,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(flow_row1)
    story.append(Spacer(1, 4))

    down_arrow = Table([[Paragraph("⬇", s_card_title)]], colWidths=[710])
    down_arrow.setStyle(TableStyle([('ALIGN', (0,0), (-1,-1), 'RIGHT'), ('RIGHTPADDING', (0,0), (-1,-1), 80)]))
    story.append(down_arrow)
    story.append(Spacer(1, 3))

    step5 = [Paragraph("<b>5. Reader</b>", s_card_title), Paragraph("Flipbook viewer + TTS narration", s_card_body)]
    step6 = [Paragraph("<b>6. Quiz Engine</b>", s_card_title), Paragraph("Interactive MCQ comprehension", s_card_body)]
    step7 = [Paragraph("<b>7. Rewards</b>", s_card_title), Paragraph("Stars, streaks, badges, certs", s_card_body)]
    step8 = [Paragraph("<b>8. Analytics</b>", s_card_title), Paragraph("Parent velocity & Teacher charts", s_card_body)]

    flow_row2 = Table([[step8, Paragraph("⬅", s_card_title), step7, Paragraph("⬅", s_card_title), step6, Paragraph("⬅", s_card_title), step5]],
                      colWidths=[150, 20, 150, 20, 150, 20, 150])
    flow_row2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#ECFDF5')),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor('#FEF3C7')),
        ('BACKGROUND', (4,0), (4,0), colors.HexColor('#F3E8FF')),
        ('BACKGROUND', (6,0), (6,0), colors.HexColor('#EFF6FF')),
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#A7F3D0')),
        ('BOX', (2,0), (2,0), 1, colors.HexColor('#FDE68A')),
        ('BOX', (4,0), (4,0), 1, colors.HexColor('#E9D5FF')),
        ('BOX', (6,0), (6,0), 1, colors.HexColor('#BFDBFE')),
        ('ALIGN', (1,0), (1,0), 'CENTER'),
        ('ALIGN', (3,0), (3,0), 'CENTER'),
        ('ALIGN', (5,0), (5,0), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(flow_row2)
    story.append(Spacer(1, 8))

    bullet_left = [
        Paragraph("• <b>Age & Profile Adaptation:</b> Personalizes vocabulary difficulty based on child age (3–12).", s_card_body),
        Paragraph("• <b>Atomic Transaction:</b> Saves Story + Pages + Quiz atomically in PostgreSQL to prevent partial records.", s_card_body),
        Paragraph("• <b>Bilingual Synergy:</b> English + Hindi side-by-side with dictionary definitions on difficult words.", s_card_body),
    ]
    bullet_right = [
        Paragraph("• <b>Web Speech Narration:</b> Browser speech synthesis reads text aloud for early learners.", s_card_body),
        Paragraph("• <b>Instant Feedback:</b> Comprehension quiz auto-grades answers and updates streak multipliers.", s_card_body),
        Paragraph("• <b>Real-time Dashboards:</b> Reading velocity, quiz history, and progress reflect instantly.", s_card_body),
    ]
    bullets_table = Table([[bullet_left, bullet_right]], colWidths=[350, 350])
    bullets_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
        ('PADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(bullets_table)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 3 — USER ROLES, PERMISSIONS & DATA SECURITY
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(Paragraph("Slide 3 — User Roles, Permissions & Security Architecture", s_slide_heading))
    story.append(Paragraph("Strict role separation and row-level ownership validation across all portals", s_slide_subheading))
    story.append(Spacer(1, 8))

    r1 = [
        Paragraph("<b>👨‍👩‍👧 PARENT PORTAL</b>", s_card_title),
        Paragraph("• Manage child profiles & interests<br/>• Generate & read custom stories<br/>• Track daily streaks, goals & bedtime schedule<br/>• View AI vocabulary growth & progress reports<br/>• Download milestone achievement certificates", s_card_body)
    ]
    r2 = [
        Paragraph("<b>👩‍🏫 TEACHER HUB</b>", s_card_title),
        Paragraph("• Classroom management & unique join codes<br/>• Student rosters & individual skill breakdowns<br/>• Story homework assignments with due dates<br/>• Quiz submissions grading & pass rate metrics<br/>• Automated academic PDF report cards", s_card_body)
    ]
    r3 = [
        Paragraph("<b>🛡️ ADMIN SUITE</b>", s_card_title),
        Paragraph("• System-wide user directory & role controls<br/>• Overall platform usage analytics & story counts<br/>• System health monitoring & active logs<br/>• Content moderation & database management", s_card_body)
    ]

    roles_table = Table([[r1, r2, r3]], colWidths=[232, 232, 232])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#EFF6FF')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F5F3FF')),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor('#FFF7ED')),
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#BFDBFE')),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#DDD6FE')),
        ('BOX', (2,0), (2,0), 1, colors.HexColor('#FED7AA')),
        ('PADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(roles_table)
    story.append(Spacer(1, 8))

    sec_left = [
        Paragraph("<b>🔐 Verified Row-Level Data Isolation:</b>", s_card_title),
        Spacer(1, 3),
        Paragraph("• <b>Parent A ➔ Child A Data:</b> <font color='#16A34A'><b>HTTP 200 OK (Authorized)</b></font>", s_card_body),
        Paragraph("• <b>Parent A ➔ Child B Data:</b> <font color='#DC2626'><b>HTTP 404 NOT FOUND (Access Denied)</b></font>", s_card_body),
        Paragraph("• <b>Parent B ➔ Child A Data:</b> <font color='#DC2626'><b>HTTP 404 NOT FOUND (Protected)</b></font>", s_card_body),
    ]
    sec_right = [
        Paragraph("<b>🎤 Live Explanation Note:</b>", s_card_title),
        Spacer(1, 3),
        Paragraph("<i>“Backend ownership validation filters ensure karte hain ki changing an object ID in API requests will never leak or expose another parent's children, reading logs, or private data.”</i>", s_live_explain),
    ]
    sec_table = Table([[sec_left, sec_right]], colWidths=[350, 350])
    sec_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(sec_table)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 4 — TECH ARCHITECTURE & DEPLOYMENT
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(Paragraph("Slide 4 — Technology Architecture & Cloud Deployment", s_slide_heading))
    story.append(Paragraph("Production-grade decoupled stack with high performance and security guarantees", s_slide_subheading))
    story.append(Spacer(1, 8))

    b_fe = [
        Paragraph("<b>🎨 FRONTEND CLIENT</b>", s_card_title),
        Spacer(1, 2),
        Paragraph("• <b>React 19</b> + <b>Vite 8</b><br/>• <b>Tailwind CSS 4</b> Glassmorphism<br/>• <b>Axios</b> with JWT Interceptors<br/>• <b>Framer Motion</b> Flipbook Reader<br/>• <b>jsPDF</b> & <b>html2canvas</b><br/>• <i>Hosted on:</i> <b>Netlify / Vercel</b>", s_card_body)
    ]
    b_be = [
        Paragraph("<b>⚙️ BACKEND API</b>", s_card_title),
        Spacer(1, 2),
        Paragraph("• <b>Python 3.12 / Django 5</b><br/>• <b>Django REST Framework</b><br/>• <b>SimpleJWT</b> Token Rotation<br/>• <b>Atomic Transactions</b><br/>• <b>WhiteNoise</b> Static Assets<br/>• <i>Hosted on:</i> <b>Render / AWS</b>", s_card_body)
    ]
    b_infra = [
        Paragraph("<b>☁️ DATABASE & AI SERVICES</b>", s_card_title),
        Spacer(1, 2),
        Paragraph("• <b>PostgreSQL Cloud Database</b><br/>• <b>Google Gemini 1.5 / 2.0 API</b><br/>• <b>Web Speech Audio API</b><br/>• <b>Environment Key Isolation</b><br/>• <b>CORS Whitelisting</b><br/>• <i>Storage:</i> <b>Managed DB</b>", s_card_body)
    ]

    arch_table = Table([[b_fe, b_be, b_infra]], colWidths=[232, 232, 232])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (1,0), (1,0), colors.HexColor('#F8FAFC')),
        ('BACKGROUND', (2,0), (2,0), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (0,0), 1, colors.HexColor('#CBD5E1')),
        ('BOX', (1,0), (1,0), 1, colors.HexColor('#CBD5E1')),
        ('BOX', (2,0), (2,0), 1, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 8))

    sec_items_1 = [
        Paragraph("✅ <b>JWT Authentication:</b> Access + Refresh tokens with expiry", s_card_body),
        Paragraph("✅ <b>Role Authorization:</b> Route guards on Parent, Teacher, Admin", s_card_body),
        Paragraph("✅ <b>Ownership Validation:</b> Child/Story access scoped strictly to user", s_card_body),
    ]
    sec_items_2 = [
        Paragraph("✅ <b>Zero Secret Exposure:</b> Gemini & DB keys strictly in .env", s_card_body),
        Paragraph("✅ <b>Production CORS:</b> Whitelisted domain origins only", s_card_body),
        Paragraph("✅ <b>Clean Builds:</b> 0 Vite compile errors & 0 Django check issues", s_card_body),
    ]
    sec_checklist = Table([[sec_items_1, sec_items_2]], colWidths=[350, 350])
    sec_checklist.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ECFDF5')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#A7F3D0')),
        ('PADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(sec_checklist)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 5 — DEVELOPER GOLDEN RULES & CONCLUSION
    # =========================================================================
    story.append(Spacer(1, 4))
    story.append(Paragraph("Slide 5 — Developer Golden Rules & Project Status", s_slide_heading))
    story.append(Paragraph("Standards for maintaining stability, scalability, and seamless integration", s_slide_subheading))
    story.append(Spacer(1, 6))

    status_table = Table([[
        Paragraph("<b>🟢 PARENT MODULE STATUS: 100% COMPLETE, VERIFIED & PRODUCTION READY</b>", s_card_title)
    ]], colWidths=[710])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#D1FAE5')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#10B981')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ]))
    story.append(status_table)
    story.append(Spacer(1, 6))

    gr1 = [
        Paragraph("<b>1. Preserve Existing Contracts</b>", s_card_title),
        Paragraph("Never break or rework working Parent & Teacher logic or existing API response formats.", s_card_body)
    ]
    gr2 = [
        Paragraph("<b>2. Instant Database Migrations</b>", s_card_title),
        Paragraph("Any model modification must be followed immediately by makemigrations and migrate.", s_card_body)
    ]
    gr3 = [
        Paragraph("<b>3. Security Testing Mandatory</b>", s_card_title),
        Paragraph("Always execute cross-user ID tampering tests (asserting HTTP 404 on unauthorized data).", s_card_body)
    ]
    gr4 = [
        Paragraph("<b>4. Full-Stack Verification</b>", s_card_title),
        Paragraph("Always run `npm run build` and `python manage.py check` before committing changes.", s_card_body)
    ]

    gr_table = Table([[gr1, gr2], [gr3, gr4]], colWidths=[350, 350])
    gr_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(gr_table)
    story.append(Spacer(1, 8))

    closing_box = Table([[
        Paragraph(
            "<b>🌟 Final Presentation Conclusion:</b><br/>"
            "<i>“StoryNest is not just an AI story generator; it is a complete bilingual literacy ecosystem that combines personalized storytelling, interactive reading, assessment, gamification, and learning analytics in one secure, production-ready platform.”</i>",
            s_live_explain
        )
    ]], colWidths=[710])
    closing_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EEF2FF')),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor('#6366F1')),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(closing_box)

    doc.build(story, canvasmaker=SlideCanvas)
    print(f"PDF Generated: {output_path}")

if __name__ == "__main__":
    create_presentation_pdf("StoryNest_Presentation.pdf")
