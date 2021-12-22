import xmltodict, json
import requests, re


def quitar_tildes(texto):
    raw_text = re.sub(u"[Áá]", 'a', texto)
    raw_text = re.sub(u"[Éé]", 'e', raw_text)
    raw_text = re.sub(u"[Íí]", 'i', raw_text)
    raw_text = re.sub(u"[Óó]", 'o', raw_text)
    raw_text = re.sub(u"[úÚ]", 'u', raw_text)
    return raw_text

url = "https://bedca.net/bdpub/procquery.php"
session=requests.Session()
proxies = {"http": "http://127.0.0.1:8080","https": "http://127.0.0.1:8080"}
headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
        "Content-Type":"application/x-www-form-urlencoded",
        "Accept": "application/json, text/plain, */*",
        "Cookie": "PHPSESSID=25010fac417c7e6c1c181bcc25bf2c32",
        "Origin": "https://bedca.net",
        "Content-Type": "text/xml",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Referer": "https://bedca.net",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "es-ES,es;q=0.9,zh-TW;q=0.8,zh;q=0.7"
        }
data = '<?xml version="1.0" encoding="utf-8"?><foodquery><type level="1"/><selection><atribute name="f_id"/><atribute name="f_ori_name"/><atribute name="langual"/><atribute name="f_eng_name"/><atribute name="f_origen"/><atribute name="edible_portion"/></selection><condition><cond1><atribute1 name="f_origen"/></cond1><relation type="EQUAL"/><cond3>BEDCA</cond3></condition><order ordtype="ASC"><atribute3 name="f_ori_name"/></order></foodquery>'
r=session.post(url,headers=headers,data=data)
obj = xmltodict.parse(r.text)
string = json.dumps(obj)
resp_json = json.loads(string)
text_file = open("data.txt", "w")

for i in range(0, len(resp_json['foodresponse']['food'])):
    print(resp_json['foodresponse']['food'][i]['f_ori_name'])
    ingrediente = resp_json['foodresponse']['food'][i]['f_ori_name']
    ingrediente = quitar_tildes(ingrediente)
    n = text_file.write(ingrediente.lower()+"\n")
    
text_file.close()