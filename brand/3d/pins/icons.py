# ไอคอนบนหน้าหมุด — วาดเองด้วยรูปทรงง่ายๆ (ไม่ใช้อีโมจิของระบบ เพราะภาพอีโมจิเป็นของเจ้าของฟอนต์)
# รัน: python brand/3d/pins/icons.py  → brand/3d/pins/icons/*.png (512×512 พื้นใส)
import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'icons')
os.makedirs(OUT, exist_ok=True)
KIND = {'food': '#ff8a3d', 'boot': '#b48cf0', 'event': '#2cc9b5', 'park': '#5aaeea', 'spot': '#6b5fa8', 'moto': '#5aaeea', 'wc': '#6b5fa8', 'seat': '#2cc9b5'}
S = 512


def canvas():
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def food(c):   # ไม้ลูกชิ้น 3 ลูก
    im, d = canvas()
    d.line([(120, 410), (400, 110)], fill=c, width=26)
    for t in (.3, .52, .74):
        x, y = 120 + (400 - 120) * t, 410 + (110 - 410) * t
        d.ellipse([x - 62, y - 62, x + 62, y + 62], fill=c)
    return im


def boot(c):   # รถเปิดท้าย: ตัวรถ + ฝาท้ายยกขึ้น + ล้อ
    im, d = canvas()
    d.rounded_rectangle([70, 250, 400, 360], 34, fill=c)               # ตัวรถ
    d.polygon([(130, 250), (190, 170), (330, 170), (370, 250)], fill=c)  # หลังคา
    d.line([(370, 250), (455, 150)], fill=c, width=26)                 # ฝาท้ายเปิด
    for x in (150, 330):
        d.ellipse([x - 48, 320, x + 48, 416], fill=c)
        d.ellipse([x - 20, 348, x + 20, 388], fill=(255, 255, 255, 255))
    return im


def event(c):  # เต็นท์งาน + ธง
    im, d = canvas()
    d.polygon([(256, 120), (440, 400), (72, 400)], fill=c)
    d.polygon([(256, 250), (316, 400), (196, 400)], fill=(255, 255, 255, 255))
    d.line([(256, 120), (256, 50)], fill=c, width=16)
    d.polygon([(256, 50), (340, 74), (256, 98)], fill=c)
    return im


def park(c):   # ตัว P
    im, d = canvas()
    f = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 400)
    d.text((S / 2, S / 2 + 10), 'P', font=f, fill=c, anchor='mm')
    return im


def moto(c):   # มอเตอร์ไซค์: 2 ล้อ + ตัวรถ + เบาะ + แฮนด์
    im, d = canvas()
    for x in (130, 382):
        d.ellipse([x - 78, 262, x + 78, 418], fill=c)
        d.ellipse([x - 36, 304, x + 36, 376], fill=(255, 255, 255, 255))
    d.polygon([(150, 300), (210, 220), (330, 220), (382, 300), (300, 330), (200, 330)], fill=c)   # ตัวรถ
    d.rounded_rectangle([150, 190, 290, 226], 18, fill=c)                                        # เบาะ
    d.line([(330, 222), (372, 130)], fill=c, width=26)                                           # โช้คหน้า
    d.line([(340, 128), (420, 128)], fill=c, width=24)                                           # แฮนด์
    return im


def spot(c):   # จุดบริการ: ตัว i ในวง
    im, d = canvas()
    d.ellipse([226, 96, 286, 156], fill=c)
    d.rounded_rectangle([222, 196, 290, 420], 20, fill=c)
    return im


def wc(c):     # ห้องน้ำ: คนชาย (ตัวตรง) | เส้นคั่น | คนหญิง (กระโปรงสามเหลี่ยม)
    im, d = canvas()
    for x in (150, 362):
        d.ellipse([x - 40, 70, x + 40, 150], fill=c)                         # หัว
    d.rounded_rectangle([100, 170, 200, 320], 26, fill=c)                     # ตัวชาย
    d.rounded_rectangle([108, 300, 146, 450], 16, fill=c); d.rounded_rectangle([154, 300, 192, 450], 16, fill=c)
    d.polygon([(362, 165), (440, 345), (284, 345)], fill=c)                   # ชุดหญิง
    d.rounded_rectangle([324, 330, 356, 450], 14, fill=c); d.rounded_rectangle([368, 330, 400, 450], 14, fill=c)
    d.rounded_rectangle([246, 70, 266, 450], 10, fill=c)                      # เส้นคั่น
    return im


def seat(c):   # ที่นั่งทานอาหาร: โต๊ะกลาง (หน้าโต๊ะ + ขาเดี่ยว + ฐาน) + เก้าอี้ 2 ข้าง (พนัก + ที่นั่ง + ขา)
    im, d = canvas()
    d.rounded_rectangle([150, 200, 362, 236], 18, fill=c)                     # หน้าโต๊ะ
    d.rounded_rectangle([238, 230, 274, 410], 14, fill=c)                     # ขาโต๊ะ
    d.rounded_rectangle([196, 394, 316, 420], 13, fill=c)                     # ฐานโต๊ะ
    for sx in (1, -1):                                                        # เก้าอี้ซ้าย / ขวา (กลับด้าน)
        box = lambda x0, y0, x1, y1, r: d.rounded_rectangle([min(256 + sx * (x0 - 256), 256 + sx * (x1 - 256)), y0,
                                                             max(256 + sx * (x0 - 256), 256 + sx * (x1 - 256)), y1], r, fill=c)
        box(40, 150, 72, 330, 14)    # พนัก
        box(40, 300, 128, 334, 14)   # ที่นั่ง
        box(46, 320, 74, 420, 12)    # ขาหลัง
        box(100, 320, 128, 420, 12)  # ขาหน้า
    return im


for k, col in KIND.items():
    globals()[k](col).save(os.path.join(OUT, k + '.png'))
    print('wrote', k)
