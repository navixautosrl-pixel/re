import json
USD=4.7616; EUR=5.3527   # BNR 06.10.2026
VAT_IMPORT=0.21           # TVA plătit la checkout AliExpress (IOSS), presupus NErecuperabil
PARCEL_UNITS=50           # unități per colet de test
PARCEL_FIX=3*EUR+25       # 3 EUR taxă vamală/linie tarifară (1 linie) + 25 lei taxă logistică națională
SHIP={'L':0.15,'M':0.50,'H':1.50}   # USD/unitate transport China->RO (ipoteză)
BUFFER=1.05               # +5% variație preț/curs
PACK=2.0; HANDLE=1.5; SHIPOUT=17.0; PLATFORM=2.0
PAY=0.025; MICRO=0.01
RET_RATE=0.06; DEF_RATE=0.03
CAC={'organic':3,'moderat':20,'scump':40}
LAUNCH_FIXED=250          # lei/produs: mostre, foto/video, setup listare

def landed(usd, w):
    return round((usd*USD*(1+VAT_IMPORT) + SHIP[w]*USD + PARCEL_FIX/PARCEL_UNITS)*BUFFER,2)

def scen(price, units, unit_cost, cac):
    cogs=units*unit_cost
    var=cogs+PACK+HANDLE+SHIPOUT+PLATFORM+price*(PAY+MICRO)
    var+=RET_RATE*(SHIPOUT+0.5*cogs)+DEF_RATE*(unit_cost+SHIPOUT)
    total=var+cac
    contrib=price-total
    return dict(cost=round(total,1),contrib=round(contrib,1),margin=round(100*contrib/price,1),
                be=('n/a' if contrib<=0 else int(-(-LAUNCH_FIXED//contrib))))

P=json.load(open('products.json'))
out=[]
for p in P:
    uc=landed(p['usd'],p['w'])
    r={'id':p['id'],'name':p['name'],'unit_cost':uc,'price':p['price'],'units':p['units']}
    for k,v in CAC.items(): r[k]=scen(p['price'],p['units'],uc,v)
    out.append(r)
for r in out:
    print(f"{r['id']:>2} {r['name'][:38]:38} cost/u={r['unit_cost']:6.2f} pret={r['price']:5} x{r['units']} | " +
          " | ".join(f"{k}: {r[k]['contrib']:6.1f} ({r[k]['margin']:5.1f}%) BE={r[k]['be']}" for k in CAC))
json.dump(out,open('results.json','w'),ensure_ascii=False,indent=1)
