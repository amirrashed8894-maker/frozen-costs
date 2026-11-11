# يبني index.html من index.src.html: الـ CSS والخط Cairo جوه الصفحة نفسها (عشان الـ PDF يطلع مظبوط من غير نت)
import base64,re,pathlib
d=pathlib.Path(__file__).parent
css=(d/'style.css').read_text()
css=re.sub(r"url\(fonts/([\w.-]+)\)",lambda m:"url(data:font/woff2;base64,"+base64.b64encode((d/'fonts'/m.group(1)).read_bytes()).decode()+")",css)
html=(d/'index.src.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
assert '<style>' in html;(d/'index.html').write_text(html);print('index.html',len(html))
