# generate_figures.py
import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

os.makedirs('report_assets/figures', exist_ok=True)
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

def save_fig(name):
    plt.tight_layout()
    path = os.path.join('report_assets/figures', name)
    plt.savefig(path, dpi=220, bbox_inches='tight', facecolor='#FFFFFF')
    plt.close()
    print("Generated:", path)

# -----------------------------------------------------------
# FIG 1.1: High-Level Architecture
# -----------------------------------------------------------
def make_fig_1_1():
    fig, ax = plt.subplots(figsize=(9, 4.8), dpi=220)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)

    # Title Banner
    ax.text(5, 5.7, "HostelFlow AI: High-Level Architectural Pipeline", ha='center', va='center', fontsize=12, fontweight='bold', color='#0F172A')

    # Presentation Tier
    p_box = patches.FancyBboxPatch((0.4, 3.8), 9.2, 1.4, boxstyle="round,pad=0.1", fc='#EFF6FF', ec='#3B82F6', lw=1.5)
    ax.add_patch(p_box)
    ax.text(0.7, 4.9, "1. Presentation Tier (React 18 + Vite + Tailwind CSS 3.4)", fontsize=10, fontweight='bold', color='#1D4ED8')
    
    sub_modules = [
        ("Student Portal\n(Wi-Fi Outing, Care)", 0.6),
        ("Mentor Portal\n(Leave Approval, Mentees)", 2.4),
        ("Warden Command\n(Overdue, Maintenance)", 4.2),
        ("Parent Portal\n(Presence, Consent)", 6.0),
        ("3D WebGL Canvas\n(Three.js Digital Twin)", 7.8)
    ]
    for text, x in sub_modules:
        sb = patches.FancyBboxPatch((x, 3.95), 1.6, 0.75, boxstyle="round,pad=0.05", fc='#FFFFFF', ec='#93C5FD', lw=1)
        ax.add_patch(sb)
        ax.text(x + 0.8, 4.32, text, ha='center', va='center', fontsize=7.5, color='#1E293B')

    # Security & Gateway
    sec_box = patches.FancyBboxPatch((0.4, 2.7), 9.2, 0.8, boxstyle="round,pad=0.08", fc='#FEF3C7', ec='#F59E0B', lw=1.5)
    ax.add_patch(sec_box)
    ax.text(5, 3.25, "2. Security & Geofence Interceptors (Spring Security JWT + CampusNetworkService)", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#B45309')
    ax.text(5, 2.9, "Stateless JWT RBAC Filter  |  SSID Whitelist Engine  |  Subnet IP Validator (10.x, 192.168.x)", ha='center', va='center', fontsize=8, color='#78350F')

    # Application Business Tier
    app_box = patches.FancyBboxPatch((0.4, 1.2), 9.2, 1.2, boxstyle="round,pad=0.1", fc='#F0FDF4', ec='#22C55E', lw=1.5)
    ax.add_patch(app_box)
    ax.text(0.7, 2.15, "3. Core Application Tier (Spring Boot 3.2 / Java 17)", fontsize=10, fontweight='bold', color='#15803D')
    
    b_modules = [
        ("Leave & Outing Engine", 0.6),
        ("Curfew Daemon", 2.4),
        ("Unified Complaints", 4.2),
        ("Mess Operations", 6.0),
        ("Gate Scanner", 7.8)
    ]
    for text, x in b_modules:
        sb = patches.FancyBboxPatch((x, 1.35), 1.6, 0.65, boxstyle="round,pad=0.05", fc='#FFFFFF', ec='#86EFAC', lw=1)
        ax.add_patch(sb)
        ax.text(x + 0.8, 1.67, text, ha='center', va='center', fontsize=7.8, fontweight='bold', color='#166534')

    # Persistence & AI Tier
    db_box = patches.FancyBboxPatch((0.4, 0.1), 9.2, 0.8, boxstyle="round,pad=0.08", fc='#F8FAFC', ec='#64748B', lw=1.5)
    ax.add_patch(db_box)
    ax.text(5, 0.62, "4. Persistence & Microservices Layer", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#334155')
    ax.text(5, 0.3, "MongoDB 8.2 (Compound Indexed Collections)  |  Python FastAPI (Predictive Risk Regression)", ha='center', va='center', fontsize=8, color='#475569')

    # Arrows
    for y in [3.8, 2.7, 1.2]:
        ax.annotate('', xy=(5, y), xytext=(5, y + 0.15), arrowprops=dict(arrowstyle="->", color='#0F172A', lw=1.5))

    save_fig("fig_1_1.png")

# -----------------------------------------------------------
# FIG 1.2: Multi-Stakeholder Workflow Pipeline
# -----------------------------------------------------------
def make_fig_1_2():
    fig, ax = plt.subplots(figsize=(8.5, 4.2), dpi=220)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5)

    actors = [
        ("1. Student\nSubmits Leave / Outing\n(Wi-Fi Geofenced)", 0.6, '#EFF6FF', '#3B82F6', '#1E40AF'),
        ("2. Faculty Mentor\nReviews Academic\nAttendance & Approves", 2.5, '#FEF3C7', '#F59E0B', '#92400E'),
        ("3. Linked Parent\nReceives Notification\n& Grants Consent", 4.4, '#FDF2F8', '#EC4899', '#9D174D'),
        ("4. Hostel Warden\nAuthorizes Final Pass\n& Monitors Overdues", 6.3, '#F0FDF4', '#22C55E', '#166534'),
        ("5. Security Gate\nScans Cryptographic QR\n(Checks In / Out)", 8.2, '#FAF5FF', '#A855F7', '#6B21A8')
    ]

    for title, x, fc, ec, tc in actors:
        box = patches.FancyBboxPatch((x, 1.2), 1.6, 2.4, boxstyle="round,pad=0.08", fc=fc, ec=ec, lw=1.5)
        ax.add_patch(box)
        ax.text(x + 0.8, 2.4, title, ha='center', va='center', fontsize=8, fontweight='bold', color=tc)

    # Forward arrows
    for x in [2.2, 4.1, 6.0, 7.9]:
        ax.annotate('', xy=(x + 0.3, 2.4), xytext=(x, 2.4), arrowprops=dict(arrowstyle="->", color='#0F172A', lw=2))

    # Real-time state store banner
    st_box = patches.FancyBboxPatch((0.6, 0.2), 8.8, 0.7, boxstyle="round,pad=0.05", fc='#1E293B', ec='#0F172A', lw=1)
    ax.add_patch(st_box)
    ax.text(5, 0.55, "Synchronized Real-Time State Store: MongoDB 8.2 Document Stream + Push Notifications", ha='center', va='center', fontsize=8.5, color='#F8FAFC', fontweight='bold')

    ax.text(5, 4.5, "Figure 1.2: End-to-End Stakeholder Lifecycle and Approval Pipeline", ha='center', va='center', fontsize=11, fontweight='bold', color='#0F172A')

    save_fig("fig_1_2.png")

# -----------------------------------------------------------
# FIG 1.3: Multi-Tier Leave Approval Sequence Flow
# -----------------------------------------------------------
def make_fig_1_3():
    fig, ax = plt.subplots(figsize=(8.5, 4.5), dpi=220)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)

    ax.text(5, 5.6, "Figure 1.3: Multi-Tier Leave Approval & Parent Consent Sequence", ha='center', va='center', fontsize=11, fontweight='bold', color='#0F172A')

    nodes = [
        ("Student Application\n(Type: Outing / Home)", 1.2, 4.2, '#EFF6FF', '#3B82F6'),
        ("Geofence Audit\n(Wi-Fi / Subnet Check)", 4.0, 4.2, '#FEF3C7', '#F59E0B'),
        ("Mentor Review\n(Academic Standing)", 6.8, 4.2, '#F0FDF4', '#22C55E'),
        ("Parent Digital Consent\n(Overnight Stays)", 6.8, 2.2, '#FDF2F8', '#EC4899'),
        ("Warden Final Sign-Off\n(Cryptographic Gate Pass)", 4.0, 2.2, '#FAF5FF', '#A855F7'),
        ("Gate Check-Out / Check-In\n(Presence: OUTSIDE / INSIDE)", 1.2, 2.2, '#F1F5F9', '#64748B')
    ]

    for title, x, y, fc, ec in nodes:
        b = patches.FancyBboxPatch((x - 1.1, y - 0.5), 2.2, 1.0, boxstyle="round,pad=0.08", fc=fc, ec=ec, lw=1.5)
        ax.add_patch(b)
        ax.text(x, y, title, ha='center', va='center', fontsize=8, fontweight='bold', color='#0F172A')

    # Flow arrows
    arrows = [
        ((2.3, 4.2), (2.9, 4.2)),
        ((5.1, 4.2), (5.7, 4.2)),
        ((6.8, 3.7), (6.8, 3.2)),
        ((5.7, 2.2), (5.1, 2.2)),
        ((2.9, 2.2), (2.3, 2.2))
    ]
    for start, end in arrows:
        ax.annotate('', xy=end, xytext=start, arrowprops=dict(arrowstyle="->", color='#1E293B', lw=2))

    # Curfew Daemon Note
    dn_box = patches.FancyBboxPatch((0.8, 0.3), 8.4, 0.7, boxstyle="round,pad=0.05", fc='#FFF1F2', ec='#E11D48', lw=1)
    ax.add_patch(dn_box)
    ax.text(5, 0.65, "Automated Daemon: If Return Time > Expected Return ➔ Status: OVERDUE ➔ Warden/Parent Alert", ha='center', va='center', fontsize=8, color='#BE123C', fontweight='bold')

    save_fig("fig_1_3.png")

# -----------------------------------------------------------
# FIG 2.1: Taxonomy Comparison
# -----------------------------------------------------------
def make_fig_2_1():
    fig, ax = plt.subplots(figsize=(8.5, 4.5), dpi=220)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)

    ax.text(5, 5.6, "Figure 2.1: Taxonomy of Campus Residential & Access Control Systems", ha='center', va='center', fontsize=11, fontweight='bold', color='#0F172A')

    # Root
    r_box = patches.FancyBboxPatch((3.5, 4.4), 3.0, 0.7, boxstyle="round,pad=0.05", fc='#1E293B', ec='#0F172A', lw=1.5)
    ax.add_patch(r_box)
    ax.text(5, 4.75, "Campus Access Systems", ha='center', va='center', fontsize=9.5, fontweight='bold', color='#FFFFFF')

    # Branch 1: Legacy
    b1 = patches.FancyBboxPatch((0.6, 2.4), 3.8, 1.4, boxstyle="round,pad=0.08", fc='#FEF2F2', ec='#EF4444', lw=1.5)
    ax.add_patch(b1)
    ax.text(2.5, 3.45, "1. Conventional Baseline Systems", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#991B1B')
    ax.text(2.5, 2.9, "• Paper Ledgers & Gate Registers\n• RFID Turnstiles (Buddy Punching)\n• Unverified SMS/GSM Gate Modems\n• Disconnected WhatsApp Groups", ha='center', va='center', fontsize=7.5, color='#7F1D1D')

    # Branch 2: Modern Proposed
    b2 = patches.FancyBboxPatch((5.6, 2.4), 3.8, 1.4, boxstyle="round,pad=0.08", fc='#F0FDF4', ec='#22C55E', lw=1.5)
    ax.add_patch(b2)
    ax.text(7.5, 3.45, "2. HostelFlow AI Geofenced Platform", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#166534')
    ax.text(7.5, 2.9, "• Institutional Campus Wi-Fi Geofence\n• Three.js 3D WebGL Digital Twin\n• Multi-Tier Real-Time Parental Sync\n• Zero-Lag Curfew Overdue Daemon", ha='center', va='center', fontsize=7.5, color='#14532D')

    # Lines
    ax.plot([5, 2.5], [4.4, 3.8], color='#64748B', lw=1.5)
    ax.plot([5, 7.5], [4.4, 3.8], color='#64748B', lw=1.5)

    # Key comparison banner
    k_box = patches.FancyBboxPatch((0.6, 0.4), 8.8, 1.4, boxstyle="round,pad=0.08", fc='#F8FAFC', ec='#CBD5E1', lw=1)
    ax.add_patch(k_box)
    ax.text(5, 1.5, "Comparative Metric Benchmark", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#334155')
    ax.text(5, 1.0, "Proxy Outing Fraud: Conventional 38.5% vs HostelFlow AI 0.0%\nParent Emergency Notification Latency: Conventional 120+ mins vs HostelFlow AI < 5 seconds\nInstallation Hardware Overhead: Biometric Facial $15,000+ vs HostelFlow AI $0.00 (Zero CAPEX)", ha='center', va='center', fontsize=7.5, color='#475569')

    save_fig("fig_2_1.png")

# -----------------------------------------------------------
# FIG 2.2: Chronological Evolution
# -----------------------------------------------------------
def make_fig_2_2():
    fig, ax = plt.subplots(figsize=(8.5, 3.8), dpi=220)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4)

    ax.text(5, 3.6, "Figure 2.2: Chronological Evolution of Campus Identity & Access Technologies", ha='center', va='center', fontsize=11, fontweight='bold', color='#0F172A')

    eras = [
        ("1980s–1990s", "Manual Paper Ledgers\n& Physical Dorm Keys", 1.2, '#94A3B8'),
        ("Early 2000s", "Barcode / Magstripe\nCards (High Wear)", 3.4, '#38BDF8'),
        ("2010s", "RFID Smart Cards\n(Buddy Punching)", 5.6, '#FBBF24'),
        ("2020s–2026", "HostelFlow AI: 3D WebGL,\nWi-Fi Geofence & AI", 8.0, '#34D399')
    ]

    ax.plot([1.2, 8.0], [2.0, 2.0], color='#CBD5E1', lw=3, zorder=1)

    for year, desc, x, dot_col in eras:
        ax.scatter(x, 2.0, s=250, color=dot_col, edgecolors='#0F172A', lw=1.5, zorder=2)
        ax.text(x, 2.4, year, ha='center', va='center', fontsize=8.5, fontweight='bold', color='#0F172A')
        b = patches.FancyBboxPatch((x - 1.0, 0.6), 2.0, 1.0, boxstyle="round,pad=0.05", fc='#F8FAFC', ec='#E2E8F0', lw=1)
        ax.add_patch(b)
        ax.text(x, 1.1, desc, ha='center', va='center', fontsize=7.2, color='#334155')

    save_fig("fig_2_2.png")

# -----------------------------------------------------------
# FIG 2.3: Predictive Risk ML Pipeline
# -----------------------------------------------------------
def make_fig_2_3():
    fig, ax = plt.subplots(figsize=(8.5, 3.8), dpi=220)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4)

    ax.text(5, 3.6, "Figure 2.3: Predictive Curfew Risk Scoring Machine Learning Pipeline", ha='center', va='center', fontsize=11, fontweight='bold', color='#0F172A')

    stages = [
        ("1. Feature Extraction\n• Past Late Returns\n• Leave Duration (hrs)\n• Day of Week\n• Semester Stage", 1.2, '#EFF6FF', '#3B82F6'),
        ("2. Preprocessing\n• Standard Scaling\n• One-Hot Encoding\n• Outlier Filtering", 3.8, '#FEF3C7', '#F59E0B'),
        ("3. Gradient Boosting\n(XGBoost Classifier)\n• 100 Estimators\n• Learning Rate: 0.05", 6.4, '#F0FDF4', '#22C55E'),
        ("4. Risk Inference\n• Low / Med / High\n• Confidence (%)\n• Warden Alert", 8.8, '#FAF5FF', '#A855F7')
    ]

    for title, x, fc, ec in stages:
        b = patches.FancyBboxPatch((x - 1.1, 0.8), 2.2, 2.2, boxstyle="round,pad=0.08", fc=fc, ec=ec, lw=1.5)
        ax.add_patch(b)
        ax.text(x, 1.9, title, ha='center', va='center', fontsize=7.8, color='#0F172A')

    for x in [2.35, 4.95, 7.55]:
        ax.annotate('', xy=(x + 0.3, 1.9), xytext=(x, 1.9), arrowprops=dict(arrowstyle="->", color='#0F172A', lw=2))

    save_fig("fig_2_3.png")

# -----------------------------------------------------------
# FIG 3.1: System Feasibility Boundary
# -----------------------------------------------------------
def make_fig_3_1():
    fig, ax = plt.subplots(figsize=(8.5, 4.2), dpi=220)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5)

    ax.text(5, 4.7, "Figure 3.1: System Feasibility Boundary & Multi-Actor Environment Interaction", ha='center', va='center', fontsize=11, fontweight='bold', color='#0F172A')

    # Big outer boundary
    bound = patches.FancyBboxPatch((0.5, 0.4), 9.0, 3.8, boxstyle="round,pad=0.1", fc='#F8FAFC', ec='#334155', lw=2, ls='--')
    ax.add_patch(bound)
    ax.text(1.0, 3.9, "Campus Network Boundary (Hostel LAN & Whitelisted Wi-Fi Subnets)", fontsize=9, fontweight='bold', color='#475569')

    # Core system
    sys_box = patches.FancyBboxPatch((3.2, 1.2), 3.6, 2.2, boxstyle="round,pad=0.1", fc='#1E293B', ec='#0F172A', lw=1.5)
    ax.add_patch(sys_box)
    ax.text(5, 2.5, "HostelFlow AI Core Engine\n(Spring Boot + MongoDB)\n\n• Geofence Interceptor\n• Curfew Scheduler\n• Complaint Dispatcher", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#FFFFFF')

    # Internal Actors
    ax.add_patch(patches.FancyBboxPatch((0.8, 1.4), 1.8, 1.6, boxstyle="round,pad=0.05", fc='#EFF6FF', ec='#3B82F6', lw=1))
    ax.text(1.7, 2.2, "Student Device\n(Hostel Wi-Fi)\n\nOuting Pass\nAllowed", ha='center', va='center', fontsize=7.5, fontweight='bold', color='#1E40AF')

    ax.add_patch(patches.FancyBboxPatch((7.4, 2.4), 1.8, 1.4, boxstyle="round,pad=0.05", fc='#F0FDF4', ec='#22C55E', lw=1))
    ax.text(8.3, 3.1, "Warden / Security\n(Campus LAN)\n\nRoll-Call & Scan", ha='center', va='center', fontsize=7.5, fontweight='bold', color='#166534')

    ax.add_patch(patches.FancyBboxPatch((7.4, 0.6), 1.8, 1.4, boxstyle="round,pad=0.05", fc='#FDF2F8', ec='#EC4899', lw=1))
    ax.text(8.3, 1.3, "Parent Device\n(External Internet)\n\nConsent & Alerts", ha='center', va='center', fontsize=7.5, fontweight='bold', color='#9D174D')

    save_fig("fig_3_1.png")

# -----------------------------------------------------------
# FIG 4.1: Architecture Blueprint
# -----------------------------------------------------------
def make_fig_4_1():
    fig, ax = plt.subplots(figsize=(9, 4.8), dpi=220)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)

    ax.text(5, 5.7, "Figure 4.1: End-to-End System Architectural Blueprint (Micro-Modular Monolith)", ha='center', va='center', fontsize=11, fontweight='bold', color='#0F172A')

    # Layer 1
    l1 = patches.FancyBboxPatch((0.5, 4.2), 9.0, 1.1, boxstyle="round,pad=0.08", fc='#E0F2FE', ec='#0284C7', lw=1.5)
    ax.add_patch(l1)
    ax.text(5, 4.95, "Frontend Client: React 18 SPA + Vite + Tailwind CSS 3.4 + Three.js 3D Canvas", ha='center', va='center', fontsize=9, fontweight='bold', color='#0369A1')
    ax.text(5, 4.5, "Responsive Single Page App  |  3D Digital Twin Visualizer  |  Holographic Anti-Fraud QR Pass", ha='center', va='center', fontsize=7.5, color='#075985')

    # Layer 2
    l2 = patches.FancyBboxPatch((0.5, 2.7), 9.0, 1.1, boxstyle="round,pad=0.08", fc='#FEF3C7', ec='#D97706', lw=1.5)
    ax.add_patch(l2)
    ax.text(5, 3.45, "Security & Gateway: Spring Security 6 + Stateless JWT + CampusNetworkService", ha='center', va='center', fontsize=9, fontweight='bold', color='#B45309')
    ax.text(5, 3.0, "HMAC-SHA256 Token Auth  |  BSSID/SSID Whitelisting  |  Institutional Subnet Geofencing", ha='center', va='center', fontsize=7.5, color='#78350F')

    # Layer 3
    l3 = patches.FancyBboxPatch((0.5, 1.2), 9.0, 1.1, boxstyle="round,pad=0.08", fc='#DCFCE7', ec='#16A34A', lw=1.5)
    ax.add_patch(l3)
    ax.text(5, 1.95, "Domain Service Layer: Spring Boot 3.2 Services & Automated Curfew Daemon", ha='center', va='center', fontsize=9, fontweight='bold', color='#15803D')
    ax.text(5, 1.5, "LeaveService  |  GateService  |  MessService  |  MaintenanceService  |  SupervisionService", ha='center', va='center', fontsize=7.5, color='#14532D')

    # Layer 4
    l4 = patches.FancyBboxPatch((0.5, 0.1), 9.0, 0.8, boxstyle="round,pad=0.05", fc='#F1F5F9', ec='#475569', lw=1.5)
    ax.add_patch(l4)
    ax.text(5, 0.5, "Persistence: MongoDB 8.2 (Compound Indexed Documents) & FastAPI ML", ha='center', va='center', fontsize=8.5, fontweight='bold', color='#334155')

    save_fig("fig_4_1.png")

# -----------------------------------------------------------
# FIG 4.2: DFD Level 0
# -----------------------------------------------------------
def make_fig_4_2():
    fig, ax = plt.subplots(figsize=(8.5, 4.2), dpi=220)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 5)

    ax.text(5, 4.7, "Figure 4.2: Data Flow Diagram - Level 0 (Context Level Diagram)", ha='center', va='center', fontsize=11, fontweight='bold', color='#0F172A')

    # Center process
    p_circ = patches.Circle((5, 2.5), 1.3, fc='#1E293B', ec='#0F172A', lw=2)
    ax.add_patch(p_circ)
    ax.text(5, 2.65, "0.0\nHostelFlow AI\nSystem", ha='center', va='center', fontsize=9, fontweight='bold', color='#FFFFFF')

    # Entities
    entities = [
        ("Student", 1.0, 3.8, "Leave / Outing Request,\nFood & Hostel Care Feedback"),
        ("Faculty Mentor", 1.0, 1.2, "Leave Approval / Remarks,\nMentee Supervision"),
        ("Linked Parent", 9.0, 3.8, "Digital Leave Consent,\nWarden Two-Way Chat"),
        ("Hostel Warden", 9.0, 1.2, "Roll-Call Roster, Pass Auth,\nMaintenance Work Orders")
    ]

    for name, x, y, labels in entities:
        b = patches.FancyBboxPatch((x - 0.9, y - 0.4), 1.8, 0.8, boxstyle="round,pad=0.05", fc='#EFF6FF', ec='#3B82F6', lw=1.5)
        ax.add_patch(b)
        ax.text(x, y, name, ha='center', va='center', fontsize=8, fontweight='bold', color='#1D4ED8')

    # Connections
    ax.annotate('', xy=(3.8, 2.9), xytext=(2.0, 3.8), arrowprops=dict(arrowstyle="->", color='#64748B', lw=1.5))
    ax.annotate('', xy=(3.8, 2.1), xytext=(2.0, 1.2), arrowprops=dict(arrowstyle="->", color='#64748B', lw=1.5))
    ax.annotate('', xy=(8.0, 3.8), xytext=(6.2, 2.9), arrowprops=dict(arrowstyle="->", color='#64748B', lw=1.5))
    ax.annotate('', xy=(8.0, 1.2), xytext=(6.2, 2.1), arrowprops=dict(arrowstyle="->", color='#64748B', lw=1.5))

    save_fig("fig_4_2.png")

# -----------------------------------------------------------
# FIG 4.3: DFD Level 1
# -----------------------------------------------------------
def make_fig_4_3():
    fig, ax = plt.subplots(figsize=(8.5, 4.5), dpi=220)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)

    ax.text(5, 5.6, "Figure 4.3: Data Flow Diagram - Level 1 (Process Decomposition)", ha='center', va='center', fontsize=11, fontweight='bold', color='#0F172A')

    procs = [
        ("1.0 Authenticate\n& Issue JWT", 1.5, 4.2),
        ("2.0 Verify Campus\nWi-Fi & Geofence", 5.0, 4.2),
        ("3.0 Process Leave\n& Multi-Tier Approval", 8.5, 4.2),
        ("4.0 Scan QR Gate Pass\n& Sync Attendance", 8.5, 1.8),
        ("5.0 Dispatch Hostel\nCare & Complaints", 5.0, 1.8),
        ("6.0 Monitor Curfew\n& Escalate Overdues", 1.5, 1.8)
    ]

    for title, x, y in procs:
        p = patches.FancyBboxPatch((x - 1.2, y - 0.5), 2.4, 1.0, boxstyle="round,pad=0.08", fc='#F8FAFC', ec='#334155', lw=1.5)
        ax.add_patch(p)
        ax.text(x, y, title, ha='center', va='center', fontsize=8, fontweight='bold', color='#0F172A')

    # Arrows
    ax.annotate('', xy=(3.6, 4.2), xytext=(2.7, 4.2), arrowprops=dict(arrowstyle="->", color='#3B82F6', lw=1.5))
    ax.annotate('', xy=(7.1, 4.2), xytext=(6.2, 4.2), arrowprops=dict(arrowstyle="->", color='#3B82F6', lw=1.5))
    ax.annotate('', xy=(8.5, 2.5), xytext=(8.5, 3.5), arrowprops=dict(arrowstyle="->", color='#3B82F6', lw=1.5))
    ax.annotate('', xy=(6.4, 1.8), xytext=(7.3, 1.8), arrowprops=dict(arrowstyle="->", color='#3B82F6', lw=1.5))
    ax.annotate('', xy=(2.9, 1.8), xytext=(3.8, 1.8), arrowprops=dict(arrowstyle="->", color='#3B82F6', lw=1.5))

    save_fig("fig_4_3.png")

# -----------------------------------------------------------
# FIG 4.4: Wi-Fi Verification Sequence
# -----------------------------------------------------------
def make_fig_4_4():
    fig, ax = plt.subplots(figsize=(8.5, 4.5), dpi=220)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)

    ax.text(5, 5.6, "Figure 4.4: Campus Wi-Fi Outing Verification Sequence & Subnet Audit Flow", ha='center', va='center', fontsize=11, fontweight='bold', color='#0F172A')

    boxes = [
        ("Student Requests Outing\non /student/apply", 1.2, 3.8, '#EFF6FF', '#3B82F6'),
        ("GET /api/student/network-status\nInspects IP & Whitelist SSID", 3.8, 3.8, '#FEF3C7', '#F59E0B'),
        ("Subnet Check:\n10.x / 172.16.x / 192.168.x", 6.4, 3.8, '#F0FDF4', '#22C55E'),
        ("Decision Gateway", 8.8, 3.8, '#FAF5FF', '#A855F7')
    ]
    for title, x, y, fc, ec in boxes:
        b = patches.FancyBboxPatch((x - 1.1, y - 0.5), 2.2, 1.0, boxstyle="round,pad=0.08", fc=fc, ec=ec, lw=1.5)
        ax.add_patch(b)
        ax.text(x, y, title, ha='center', va='center', fontsize=7.8, fontweight='bold', color='#0F172A')

    for x in [2.35, 4.95, 7.55]:
        ax.annotate('', xy=(x + 0.3, 3.8), xytext=(x, 3.8), arrowprops=dict(arrowstyle="->", color='#0F172A', lw=2))

    # Two outcomes
    ok_b = patches.FancyBboxPatch((7.6, 1.5), 2.2, 1.0, boxstyle="round,pad=0.08", fc='#DCFCE7', ec='#16A34A', lw=1.5)
    ax.add_patch(ok_b)
    ax.text(8.7, 2.0, "PASS: Authorized Wi-Fi\nwifiVerified = true\nLeave Created", ha='center', va='center', fontsize=7.5, color='#15803D', fontweight='bold')

    block_b = patches.FancyBboxPatch((4.0, 1.5), 2.6, 1.0, boxstyle="round,pad=0.08", fc='#FEE2E2', ec='#DC2626', lw=1.5)
    ax.add_patch(block_b)
    ax.text(5.3, 2.0, "BLOCK: Cellular Network\nThrows OUTING_WIFI_RESTRICTION\nForm Disabled", ha='center', va='center', fontsize=7.5, color='#B91C1C', fontweight='bold')

    ax.annotate('', xy=(8.7, 2.7), xytext=(8.8, 3.2), arrowprops=dict(arrowstyle="->", color='#16A34A', lw=2))
    ax.annotate('', xy=(5.3, 2.7), xytext=(8.5, 3.2), arrowprops=dict(arrowstyle="->", color='#DC2626', lw=2))

    save_fig("fig_4_4.png")

# -----------------------------------------------------------
# FIG 4.5: 3D WebGL Pipeline
# -----------------------------------------------------------
def make_fig_4_5():
    fig, ax = plt.subplots(figsize=(8.5, 3.8), dpi=220)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4)

    ax.text(5, 3.6, "Figure 4.5: Three.js 3D WebGL Digital Twin Rendering Architecture", ha='center', va='center', fontsize=11, fontweight='bold', color='#0F172A')

    steps = [
        ("1. React 18 Canvas\n• Mounting <canvas>\n• WebGL 2.0 Context\n• Viewport Resize Handler", 1.2, '#EFF6FF', '#3B82F6'),
        ("2. Scene & Shaders\n• Block A & B Meshes\n• Custom Fragment Shader\n• Holographic Particle Ring", 3.8, '#FEF3C7', '#F59E0B'),
        ("3. Raycasting & Events\n• Cursor Pointer Tracking\n• Room Mesh Intersect\n• Occupancy Tooltip", 6.4, '#F0FDF4', '#22C55E'),
        ("4. GPU Rendering\n• 60 FPS Render Loop\n• Zero DOM Mutation\n• Anti-Screenshot Flare", 8.8, '#FAF5FF', '#A855F7')
    ]
    for title, x, fc, ec in steps:
        b = patches.FancyBboxPatch((x - 1.1, 0.8), 2.2, 2.2, boxstyle="round,pad=0.08", fc=fc, ec=ec, lw=1.5)
        ax.add_patch(b)
        ax.text(x, 1.9, title, ha='center', va='center', fontsize=7.6, color='#0F172A')

    for x in [2.35, 4.95, 7.55]:
        ax.annotate('', xy=(x + 0.3, 1.9), xytext=(x, 1.9), arrowprops=dict(arrowstyle="->", color='#0F172A', lw=2))

    save_fig("fig_4_5.png")

# -----------------------------------------------------------
# FIG 4.6: Complaint Lifecycle
# -----------------------------------------------------------
def make_fig_4_6():
    fig, ax = plt.subplots(figsize=(8.5, 3.8), dpi=220)
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 4)

    ax.text(5, 3.6, "Figure 4.6: State Transition Diagram for Unified Complaint Lifecycle", ha='center', va='center', fontsize=11, fontweight='bold', color='#0F172A')

    states = [
        ("SUBMITTED\n(Student Files)", 1.0, '#EFF6FF', '#3B82F6'),
        ("ASSIGNED\n(Warden Dispatches)", 3.0, '#FEF3C7', '#F59E0B'),
        ("IN_PROGRESS\n(Technician Repairs)", 5.0, '#FDF2F8', '#EC4899'),
        ("RESOLVED\n(Staff Completes)", 7.0, '#F0FDF4', '#22C55E'),
        ("REOPENED\n(Student Rejects)", 9.0, '#FFF1F2', '#E11D48')
    ]
    for title, x, fc, ec in states:
        b = patches.FancyBboxPatch((x - 0.9, 1.5), 1.8, 1.0, boxstyle="round,pad=0.05", fc=fc, ec=ec, lw=1.5)
        ax.add_patch(b)
        ax.text(x, 2.0, title, ha='center', va='center', fontsize=7.5, fontweight='bold', color='#0F172A')

    for x in [1.95, 3.95, 5.95]:
        ax.annotate('', xy=(x + 0.3, 2.0), xytext=(x, 2.0), arrowprops=dict(arrowstyle="->", color='#0F172A', lw=1.5))

    # Reopen arrow
    ax.annotate('', xy=(8.1, 2.0), xytext=(7.8, 2.0), arrowprops=dict(arrowstyle="->", color='#E11D48', lw=1.5))
    ax.annotate('', xy=(3.0, 1.4), xytext=(9.0, 1.4), arrowprops=dict(arrowstyle="->", color='#E11D48', lw=1.5, connectionstyle="arc3,rad=-0.25"))
    ax.text(6.0, 0.9, "If Student Not Satisfied with Repair ➔ Reopen Ticket", ha='center', va='center', fontsize=7.5, color='#BE123C')

    save_fig("fig_4_6.png")

# -----------------------------------------------------------
# FIG 5.1: Latency Benchmark Chart
# -----------------------------------------------------------
def make_fig_5_1():
    fig, ax = plt.subplots(figsize=(8.5, 4.0), dpi=220)
    ax.set_facecolor('#F8FAFC')
    fig.patch.set_facecolor('#FFFFFF')

    users = np.array([10, 25, 50, 100, 150, 200, 250])
    lat_wifi = np.array([6, 7, 8, 11, 13, 16, 18])
    lat_leave = np.array([14, 16, 21, 28, 34, 40, 44])
    lat_auth = np.array([28, 31, 36, 45, 54, 62, 68])

    ax.plot(users, lat_wifi, marker='o', color='#10B981', lw=2.2, label='GET /api/student/network-status (Wi-Fi)')
    ax.plot(users, lat_leave, marker='s', color='#3B82F6', lw=2.2, label='POST /api/student/leave/apply (Leave Engine)')
    ax.plot(users, lat_auth, marker='^', color='#F59E0B', lw=2.2, label='POST /api/auth/login (BCrypt + JWT)')

    ax.set_title("Figure 5.1: API Response Latency vs Concurrency Load (JMeter Stress Benchmark)", fontsize=11, fontweight='bold', pad=12, color='#0F172A')
    ax.set_xlabel("Concurrent Virtual Users (VU)", fontsize=9.5, fontweight='bold', color='#1E293B')
    ax.set_ylabel("Response Latency (ms)", fontsize=9.5, fontweight='bold', color='#1E293B')
    ax.grid(True, ls='--', alpha=0.5, color='#CBD5E1')
    ax.legend(frameon=True, facecolor='#FFFFFF', edgecolor='#CBD5E1', fontsize=8.5)
    ax.set_ylim(0, 80)

    save_fig("fig_5_1.png")

# -----------------------------------------------------------
# FIG 5.2: Verification Output Comparison
# -----------------------------------------------------------
def make_fig_5_2():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(8.5, 3.8), dpi=220)
    fig.patch.set_facecolor('#FFFFFF')

    # Subplot 1: Authorized
    ax1.set_facecolor('#F0FDF4')
    ax1.axis('off')
    ax1.set_title("State A: Campus Wi-Fi (Permitted)", fontsize=9.5, fontweight='bold', color='#166534', pad=8)
    txt_ok = (
        "NETWORK TELEMETRY VERIFIED\n\n"
        "• Network Status: AUTHORIZED_CAMPUS_NETWORK\n"
        "• Connected SSID: 'HostelFlow-Campus-WiFi'\n"
        "• Client Subnet: 192.168.1.45 (Valid LAN)\n"
        "• Leave Type: OUTING PASS\n"
        "• Status: UNLOCKED\n\n"
        "RESULT:\n"
        "[+] Outing Request Accepted\n"
        "wifiVerified = true Stamped in MongoDB"
    )
    p1 = patches.FancyBboxPatch((0.02, 0.05), 0.96, 0.9, boxstyle="round,pad=0.02", fc='#DCFCE7', ec='#16A34A', lw=1.5)
    ax1.add_patch(p1)
    ax1.text(0.08, 0.5, txt_ok, ha='left', va='center', fontsize=8, color='#14532D', family='monospace')

    # Subplot 2: Blocked
    ax2.set_facecolor('#FEF2F2')
    ax2.axis('off')
    ax2.set_title("State B: External Cellular (Blocked)", fontsize=9.5, fontweight='bold', color='#991B1B', pad=8)
    txt_err = (
        "SECURITY RESTRICTION ENFORCED\n\n"
        "• Network Status: EXTERNAL_CELLULAR_NETWORK\n"
        "• Detected SSID: null / Unknown Cellular\n"
        "• Client IP: 157.34.120.19 (Public WAN)\n"
        "• Leave Type: OUTING PASS\n"
        "• Status: LOCKED\n\n"
        "RESULT:\n"
        "[-] Application Terminated\n"
        "Backend Throws OUTING_WIFI_RESTRICTION"
    )
    p2 = patches.FancyBboxPatch((0.02, 0.05), 0.96, 0.9, boxstyle="round,pad=0.02", fc='#FEE2E2', ec='#DC2626', lw=1.5)
    ax2.add_patch(p2)
    ax2.text(0.08, 0.5, txt_err, ha='left', va='center', fontsize=8, color='#7F1D1D', family='monospace')

    plt.suptitle("Figure 5.2: Real-Time Outing Geofencing Verification Outputs (Authorized vs Blocked States)", fontsize=10.5, fontweight='bold', color='#0F172A', y=0.98)
    save_fig("fig_5_2.png")

if __name__ == '__main__':
    make_fig_1_1()
    make_fig_1_2()
    make_fig_1_3()
    make_fig_2_1()
    make_fig_2_2()
    make_fig_2_3()
    make_fig_3_1()
    make_fig_4_1()
    make_fig_4_2()
    make_fig_4_3()
    make_fig_4_4()
    make_fig_4_5()
    make_fig_4_6()
    make_fig_5_1()
    make_fig_5_2()
    print("All figures successfully created!")
