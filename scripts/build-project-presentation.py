from pathlib import Path
import json, html, re
from reportlab.pdfgen import canvas
from reportlab.platypus import BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, PageBreak, Image, Table, TableStyle, KeepTogether, Flowable
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf/Presentation_projet_SSDC-RDC_LOKALA_LOMBOTO_Jonathan.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
SHOTS=ROOT/'docs/manual/screenshots'
EMBLEM=ROOT/'apps/frontend/public/assets/embleme-rdc.jpeg'
W,H=A4; LEFT=44; RIGHT=44; CONTENT=W-LEFT-RIGHT
NAVY=colors.HexColor('#0A2542'); INK=colors.HexColor('#17334C'); GOLD=colors.HexColor('#A1844E'); MUTED=colors.HexColor('#566C7D'); PALE=colors.HexColor('#EDF2F4'); LINE=colors.HexColor('#CFDBE3')
fontroot=Path('C:/Windows/Fonts')
for name,file in [('Manual','segoeui.ttf'),('ManualBold','segoeuib.ttf'),('ManualItalic','segoeuii.ttf')]:pdfmetrics.registerFont(TTFont(name,str(fontroot/file)))
pdfmetrics.registerFontFamily('Manual',normal='Manual',bold='ManualBold',italic='ManualItalic',boldItalic='ManualBold')
styles={
 'Body':ParagraphStyle('Body',fontName='Manual',fontSize=9.5,leading=14.5,textColor=INK,spaceAfter=9),
 'Title':ParagraphStyle('Title',fontName='ManualBold',fontSize=21,leading=26,textColor=NAVY,spaceAfter=15),
 'Eyebrow':ParagraphStyle('Eyebrow',fontName='ManualBold',fontSize=7.6,leading=11,textColor=GOLD,spaceAfter=7),
 'Caption':ParagraphStyle('Caption',fontName='ManualItalic',fontSize=7.4,leading=10.5,textColor=MUTED,spaceBefore=5,spaceAfter=14),
 'Step':ParagraphStyle('Step',fontName='Manual',fontSize=9.1,leading=13.8,textColor=INK,leftIndent=23,firstLineIndent=-18,spaceAfter=6),
 'Note':ParagraphStyle('Note',fontName='Manual',fontSize=8.3,leading=12.3,textColor=MUTED,spaceAfter=0),
 'Small':ParagraphStyle('Small',fontName='Manual',fontSize=8.3,leading=12.2,textColor=MUTED,spaceAfter=9),
}
def clean(s):return s.replace('–','-').replace('—','-').replace('‑','-')
def para(text,style='Body'):
 escaped=html.escape(clean(text))
 escaped=re.sub(r'(https?://[^\s<]+)',r'<link href="\1" color="#2F638B">\1</link>',escaped)
 return Paragraph(escaped,styles[style])
def photograph(name,maxw=CONTENT,maxh=252):
 path=SHOTS/(name+'.png')
 if not path.exists():raise FileNotFoundError('Real screenshot required: '+str(path))
 with PILImage.open(path) as im:w,h=im.size
 scale=min(maxw/w,maxh/h)
 return Image(str(path),width=w*scale,height=h*scale,hAlign='CENTER')
def note(text):
 t=Table([[Paragraph('<b>À retenir</b><br/>'+html.escape(clean(text)),styles['Note'])]],colWidths=[CONTENT])
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),PALE),('BOX',(0,0),(-1,-1),.6,LINE),('LINEBEFORE',(0,0),(0,-1),3,GOLD),('LEFTPADDING',(0,0),(-1,-1),13),('RIGHTPADDING',(0,0),(-1,-1),12),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),10)]))
 return t
class Cover(Flowable):
 def __init__(self):super().__init__();self.width=CONTENT;self.height=680
 def draw(self):
  c=self.canv; mid=CONTENT/2
  c.setStrokeColor(colors.HexColor('#D6B678'));c.setLineWidth(.9);c.circle(mid,543,64,fill=0,stroke=1);c.setStrokeColor(colors.HexColor('#64717B'));c.setLineWidth(.35);c.circle(mid,543,70,fill=0,stroke=1);c.saveState();clip=c.beginPath();clip.circle(mid,543,57);c.clipPath(clip,stroke=0);c.drawImage(str(EMBLEM),mid-57,486,114,114,mask='auto');c.restoreState()
  c.setFillColor(colors.HexColor('#DCC18A'));c.setFont('ManualBold',10);c.drawCentredString(mid,454,"DOSSIER DE PRÉSENTATION DU PROJET")
  c.setFillColor(colors.HexColor('#F0F4F7'));c.setFont('ManualBold',38);c.drawCentredString(mid,398,'SSDC-RDC')
  c.setFont('Manual',14);c.drawCentredString(mid,365,'Système de Sécurité des')
  c.drawCentredString(mid,342,'Données Classifiées')
  c.setStrokeColor(GOLD);c.setLineWidth(1);c.line(90,318,CONTENT-90,318)
  c.setFillColor(colors.HexColor('#BBCDDD'));c.setFont('Manual',9);c.drawCentredString(mid,292,'PRÉSENTATION DU LUNDI 2 NOVEMBRE 2026  |  VERSION 0.1.0')
  c.setFillColor(colors.HexColor('#DCC18A'));c.setFont('ManualBold',8);c.drawCentredString(mid,245,'INITIATEUR ET PROPRIÉTAIRE DU PROJET')
  c.setFillColor(colors.HexColor('#F0F4F7'));c.setFont('ManualBold',20);c.drawCentredString(mid,211,'LOKALA LOMBOTO Jonathan')
  c.setFillColor(colors.HexColor('#BBCDDD'));c.setFont('Manual',9);c.drawCentredString(mid,187,'Initiative, conception et propriété du projet')
  c.setFont('ManualItalic',12);c.setFillColor(colors.HexColor('#DCC18A'));c.drawCentredString(mid,125,"Protéger l’information, préserver la souveraineté nationale.")
  c.setFillColor(colors.HexColor('#AEC2D4'));c.setFont('Manual',8);c.drawCentredString(mid,78,'Vision, architecture, résultats et trajectoire de déploiement')
  c.setFont('ManualBold',8);c.drawCentredString(mid,43,'PROJET PROPOSÉ - NON ACCRÉDITÉ - DONNÉES FICTIVES')

def decoration(c,doc):
 c.saveState();cover=doc.page==1
 if cover:
  c.setFillColor(colors.HexColor('#071C35'));c.rect(0,0,W,H,fill=1,stroke=0)
  c.setFillColor(colors.HexColor('#0B2C4B'));shape=c.beginPath();shape.moveTo(W,0);shape.lineTo(W,H*.64);shape.curveTo(W*.76,H*.54,W*.73,H*.23,W*.29,0);shape.close();c.drawPath(shape,fill=1,stroke=0)
  c.setFillColor(colors.HexColor('#103956'));shape=c.beginPath();shape.moveTo(0,H);shape.lineTo(W*.68,H);shape.curveTo(W*.44,H*.93,W*.24,H*.84,0,H*.82);shape.close();c.drawPath(shape,fill=1,stroke=0)
  c.saveState();c.setStrokeAlpha(.15);c.setStrokeColor(colors.HexColor('#D5AE60'));c.setLineWidth(.65);c.circle(W+25,H+40,220,fill=0,stroke=1);c.circle(W+25,H+40,245,fill=0,stroke=1);c.restoreState()
  for x,color in [(0,'#007FFF'),(3,'#F7D618'),(6,'#CE1021')]:c.setFillColor(colors.HexColor(color));c.rect(x,0,3,H,fill=1,stroke=0)

 else:c.setFillColor(colors.HexColor('#FAFCFD'));c.rect(0,0,W,H,fill=1,stroke=0)
 c.saveState();c.setFillAlpha(.035 if not cover else .025);watermark_clip=c.beginPath();watermark_clip.circle(W/2,H/2,147);c.clipPath(watermark_clip,stroke=0);c.drawImage(str(EMBLEM),W/2-147,H/2-147,294,294,mask=[240,255,240,255,240,255]);c.restoreState()
 c.drawImage(str(EMBLEM),LEFT,H-58,29,29,mask='auto')
 c.setFillColor(colors.HexColor('#D9E5EF') if cover else NAVY);c.setFont('ManualBold',7.4);c.drawString(LEFT+39,H-37,'RÉPUBLIQUE DÉMOCRATIQUE DU CONGO')
 c.setFillColor(colors.HexColor('#AFC3D5') if cover else MUTED);c.setFont('Manual',7);c.drawString(LEFT+39,H-50,'Présidence de la République | Secrétariat Général | DANTIC')
 c.setStrokeColor(GOLD);c.setLineWidth(.6);c.line(LEFT,H-68,W-RIGHT,H-68)
 c.setStrokeColor(colors.HexColor('#37546D') if cover else LINE);c.line(LEFT,43,W-RIGHT,43)
 c.setFillColor(colors.HexColor('#AFC3D5') if cover else MUTED);c.setFont('Manual',7.1);c.drawString(LEFT,29,'LOKALA LOMBOTO Jonathan | Initiateur et propriétaire du projet')
 c.setFont('ManualBold',8);c.drawRightString(W-RIGHT,29,f'{doc.page:02d}')
 c.restoreState()
class ProjectDoc(BaseDocTemplate):
 def __init__(self,filename):
  super().__init__(filename,pagesize=A4,leftMargin=LEFT,rightMargin=RIGHT,topMargin=84,bottomMargin=57,title='SSDC-RDC - Présentation du projet',author='LOKALA LOMBOTO Jonathan',subject='Dossier de présentation du projet pour le 2 novembre 2026',creator='SSDC-RDC / LOKALA LOMBOTO Jonathan')
  frame=Frame(LEFT,57,CONTENT,H-84-57,id='normal',leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
  self.addPageTemplates(PageTemplate(id='manual',frames=frame,onPage=decoration))
 def afterFlowable(self,flowable):
  if hasattr(flowable,'bookmark'):
   self.canv.bookmarkPage(flowable.bookmark);self.canv.addOutlineEntry(flowable.getPlainText(),flowable.bookmark,level=0,closed=False)
   self.notify('TOCEntry',(0,flowable.getPlainText(),self.page,flowable.bookmark))

styles['Lead']=ParagraphStyle('Lead',fontName='Manual',fontSize=11.2,leading=16,textColor=MUTED,spaceAfter=15)
styles['Cell']=ParagraphStyle('Cell',fontName='Manual',fontSize=8.7,leading=12.5,textColor=INK)
styles['CellHead']=ParagraphStyle('CellHead',fontName='ManualBold',fontSize=8.7,leading=12.5,textColor=colors.HexColor('#EDF3F7'))

def project_table(rows):
 data=[]
 for i,row in enumerate(rows):data.append([para_cell(text,'CellHead' if i==0 else 'Cell') for text in row])
 table=Table(data,colWidths=[CONTENT*.27,CONTENT*.73],hAlign='LEFT',repeatRows=1)
 table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),NAVY),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.HexColor('#E9EFF3'),colors.HexColor('#F3F6F8')]),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),('LINEBELOW',(0,0),(-1,0),1,GOLD),('LINEBELOW',(0,1),(-1,-1),.35,LINE)]))
 return table

def para_cell(text,style):
 return Paragraph(html.escape(clean(text)),styles[style])

class ProjectDiagram(Flowable):
 def __init__(self,kind):super().__init__();self.kind=kind;self.width=CONTENT;self.height={'architecture':260,'encryption':208,'journey':172}[kind]
 def draw(self):
  c=self.canv
  def box(x,y,w,h,title,subtitle='',dark=False):
   c.setFillColor(NAVY if dark else PALE);c.setStrokeColor(GOLD if dark else LINE);c.setLineWidth(.7);c.roundRect(x,y,w,h,7,fill=1,stroke=1)
   c.setFillColor(colors.HexColor('#EDF3F7') if dark else INK);c.setFont('ManualBold',9);c.drawCentredString(x+w/2,y+h-20,title)
   if subtitle:c.setFillColor(colors.HexColor('#BCD0DF') if dark else MUTED);c.setFont('Manual',7.1);c.drawCentredString(x+w/2,y+12,subtitle)
  def arrow(x1,y1,x2,y2):
   import math
   c.setStrokeColor(GOLD);c.setFillColor(GOLD);c.setLineWidth(.9);c.line(x1,y1,x2,y2)
   a=math.atan2(y2-y1,x2-x1);p=c.beginPath();p.moveTo(x2,y2);p.lineTo(x2-6*math.cos(a-.45),y2-6*math.sin(a-.45));p.lineTo(x2-6*math.cos(a+.45),y2-6*math.sin(a+.45));p.close();c.drawPath(p,fill=1,stroke=0)
  if self.kind=='architecture':
   width=150;cx=(CONTENT-width)/2
   box(0,196,width,54,'Client web / PWA','React, session en mémoire')
   box(CONTENT-width,196,width,54,'Keycloak','Identité et second facteur')
   box(cx,108,width,60,'API FastAPI','Politique et orchestration',True)
   box(0,14,width,54,'PostgreSQL','Métadonnées, droits, audit')
   box(cx,14,width,54,'ClamAV','Analyse avant publication')
   box(CONTENT-width,14,width,54,'Chiffrement + clés','Objets chiffrés et KMS')
   arrow(width,224,CONTENT-width,224)
   arrow(width/2,196,cx+35,168);arrow(cx+width-35,168,CONTENT-width/2,196)
   arrow(cx+28,108,width/2,68);arrow(CONTENT/2,108,CONTENT/2,68);arrow(cx+width-28,108,CONTENT-width/2,68)
  elif self.kind=='encryption':
   box(0,134,145,54,'Contenu accepté','Après autorisation et scan')
   box(180,134,145,54,'AES-256-GCM','Clé de données par document',True)
   box(360,134,145,54,'Objet chiffré','Stockage privé')
   arrow(145,161,180,161);arrow(325,161,360,161)
   box(180,28,145,54,'Garde externe','KMS/HSM : envelopper la clé')
   box(360,28,145,54,'Clé enveloppée','Référence conservée en base')
   arrow(252,134,252,82);arrow(325,55,360,55)
  else:
   labels=[('1. Identité','Compte et MFA'),('2. Politique','Rôles et attributs'),('3. Contrôle','Format, taille, antivirus'),('4. Chiffrement','Clé par document'),('5. Accès','Droit nominatif'),('6. Traçabilité','Événement et expiration')]
   gap=12;w=(CONTENT-gap*2)/3
   for i,(title,subtitle) in enumerate(labels):
    col=i%3;row=i//3;x=col*(w+gap);y=96-row*84;box(x,y,w,58,title,subtitle,dark=i in [1,3])
    if col<2:arrow(x+w,y+29,x+w+gap,y+29)
   arrow(CONTENT-20,94,CONTENT-20,85);arrow(CONTENT-20,85,20,85);arrow(20,85,20,70)

sections=json.loads((ROOT/'docs/presentation/project_content.json').read_text(encoding='utf-8'))
records=json.loads((SHOTS/'captures.json').read_text(encoding='utf-8'));recordmap={Path(r['file']).stem:r for r in records}
story=[Cover(),PageBreak(),para('DOSSIER DE PRÉSENTATION','Eyebrow'),para('Sommaire','Title')]
toc=TableOfContents();toc.levelStyles=[ParagraphStyle('TocProject',fontName='Manual',fontSize=9.2,leading=14,textColor=INK,spaceBefore=1,leftIndent=0,firstLineIndent=0)];story+=[toc,PageBreak()]
for index,section in enumerate(sections,1):
 story.append(para(f'{index:02d} / PRÉSENTATION DU PROJET','Eyebrow'))
 heading=para(section['title'],'Title');heading.bookmark=f'project-{index}';story.append(heading)
 story.append(para(section['lead'],'Lead'))
 if section.get('screen'):
  screen=section['screen'];story.append(photograph(screen,maxh=260 if screen!='23-mobile-connexion' else 285));story.append(para('Capture réelle du prototype - '+recordmap[screen]['title']+'. Données fictives.','Caption'))
 if section.get('diagram'):story+=[ProjectDiagram(section['diagram']),para('Schéma de principe du projet ; il ne représente pas un déploiement institutionnel déjà autorisé.','Caption')]
 for text in section['paragraphs']:story.append(para(text))
 if section.get('table'):story+=[Spacer(1,5),project_table(section['table']),Spacer(1,12)]
 for item in section.get('bullets',[]):story.append(para('•  '+item,'Step'))
 if section.get('callout'):story+=[Spacer(1,5),note(section['callout'])]
 if index<len(sections):story.append(PageBreak())
doc=ProjectDoc(str(OUT));doc.multiBuild(story);print(str(OUT))
