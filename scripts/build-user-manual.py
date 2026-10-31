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
OUT=ROOT/'output/pdf/Manuel_utilisateur_SSDC-RDC_LOKALA_LOMBOTO_Jonathan.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
SHOTS=ROOT/'docs/manual/screenshots'
EMBLEM=ROOT/'apps/frontend/public/assets/embleme-rdc.jpeg'
W,H=A4; LEFT=44; RIGHT=44; CONTENT=W-LEFT-RIGHT
NAVY=colors.HexColor('#0A2542'); INK=colors.HexColor('#17334C'); GOLD=colors.HexColor('#A1844E'); MUTED=colors.HexColor('#566C7D'); PALE=colors.HexColor('#EDF2F4'); LINE=colors.HexColor('#CFDBE3')
fontroot=Path('C:/Windows/Fonts')
for name,file in [('Manual','segoeui.ttf'),('ManualBold','segoeuib.ttf'),('ManualItalic','segoeuii.ttf')]:pdfmetrics.registerFont(TTFont(name,str(fontroot/file)))
pdfmetrics.registerFontFamily('Manual',normal='Manual',bold='ManualBold',italic='ManualItalic',boldItalic='ManualBold')
styles={
 'Body':ParagraphStyle('Body',fontName='Manual',fontSize=9.2,leading=14.3,textColor=INK,spaceAfter=9),
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
  c.setFillColor(colors.HexColor('#DCC18A'));c.setFont('ManualBold',10);c.drawCentredString(mid,454,"MANUEL D’UTILISATION")
  c.setFillColor(colors.HexColor('#F0F4F7'));c.setFont('ManualBold',38);c.drawCentredString(mid,398,'SSDC-RDC')
  c.setFont('Manual',14);c.drawCentredString(mid,365,'Système de Sécurité des')
  c.drawCentredString(mid,342,'Données Classifiées')
  c.setStrokeColor(GOLD);c.setLineWidth(1);c.line(90,318,CONTENT-90,318)
  c.setFillColor(colors.HexColor('#BBCDDD'));c.setFont('Manual',9);c.drawCentredString(mid,292,'ÉDITION 1.0  |  APPLICATION 0.1.0  |  31 OCTOBRE 2026')
  c.setFillColor(colors.HexColor('#DCC18A'));c.setFont('ManualBold',8);c.drawCentredString(mid,245,'CONCEPTEUR ET PROPRIÉTAIRE')
  c.setFillColor(colors.HexColor('#F0F4F7'));c.setFont('ManualBold',20);c.drawCentredString(mid,211,'LOKALA LOMBOTO Jonathan')
  c.setFillColor(colors.HexColor('#BBCDDD'));c.setFont('Manual',9);c.drawCentredString(mid,187,'Projet SSDC-RDC et présent document')
  c.setFont('ManualItalic',12);c.setFillColor(colors.HexColor('#DCC18A'));c.drawCentredString(mid,125,"Protéger l’information, préserver la souveraineté nationale.")
  c.setFillColor(colors.HexColor('#AEC2D4'));c.setFont('Manual',8);c.drawCentredString(mid,78,'Guide des parcours disponibles et des opérations institutionnelles à déployer')
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
 c.setFillColor(colors.HexColor('#AFC3D5') if cover else MUTED);c.setFont('Manual',7.1);c.drawString(LEFT,29,'LOKALA LOMBOTO Jonathan | Concepteur et propriétaire')
 c.setFont('ManualBold',8);c.drawRightString(W-RIGHT,29,f'{doc.page:02d}')
 c.restoreState()
class ManualDoc(BaseDocTemplate):
 def __init__(self,filename):
  super().__init__(filename,pagesize=A4,leftMargin=LEFT,rightMargin=RIGHT,topMargin=84,bottomMargin=57,title='SSDC-RDC - Manuel utilisateur',author='LOKALA LOMBOTO Jonathan',subject='Manuel utilisateur illustré du prototype SSDC-RDC',creator='SSDC-RDC / LOKALA LOMBOTO Jonathan')
  frame=Frame(LEFT,57,CONTENT,H-84-57,id='normal',leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0)
  self.addPageTemplates(PageTemplate(id='manual',frames=frame,onPage=decoration))
 def afterFlowable(self,flowable):
  if hasattr(flowable,'bookmark'):
   self.canv.bookmarkPage(flowable.bookmark);self.canv.addOutlineEntry(flowable.getPlainText(),flowable.bookmark,level=0,closed=False)
   self.notify('TOCEntry',(0,flowable.getPlainText(),self.page,flowable.bookmark))
chapters=json.loads((ROOT/'docs/manual/manual_content.json').read_text(encoding='utf-8'))
records=json.loads((SHOTS/'captures.json').read_text(encoding='utf-8'))
recordmap={Path(r['file']).stem:r for r in records}
story=[Cover(),PageBreak(),para('REPÈRES DE LECTURE','Eyebrow'),para('Sommaire','Title')]
toc=TableOfContents();toc.levelStyles=[ParagraphStyle('Toc',fontName='Manual',fontSize=8.8,leading=12,textColor=INK,spaceBefore=0,leftIndent=0,firstLineIndent=0)]
story+=[toc,PageBreak()]
for index,ch in enumerate(chapters,1):
 story.append(para(f'{index:02d} / MANUEL UTILISATEUR','Eyebrow'))
 heading=para(ch['title'],'Title');heading.bookmark=f'chapter-{index}';story.append(heading)
 if ch.get('screen'):
  screen=ch['screen'];caption=recordmap[screen]['title']
  if ch.get('extra_screen'):
   t=Table([[photograph(screen,CONTENT*.44,250),photograph(ch['extra_screen'],CONTENT*.52,250)]],colWidths=[CONTENT*.47,CONTENT*.53]);t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0)]));story.append(t);caption='Captures réelles : téléphone à 390 px et tablette à 768 px.'
  else:story.append(photograph(screen,maxh=275 if len(ch['paragraphs'])>2 else 330))
  story.append(para('Figure '+str(index)+' - '+caption+'. Démonstration sur données fictives.','Caption'))
 for text in ch['paragraphs']:story.append(para(text))
 if ch.get('steps'):
  story.append(para('PARCOURS À SUIVRE','Eyebrow'))
  for n,text in enumerate(ch['steps'],1):story.append(para(f'{n}.  {text}','Step'))
 if ch.get('note'):story+=[Spacer(1,6),note(ch['note'])]
 if index<len(chapters):story.append(PageBreak())
doc=ManualDoc(str(OUT));doc.multiBuild(story)
print(str(OUT))
