import urllib.request
url = "https://images.unsplash.com/photo-1590502593747-42299792e118?q=100&w=2560&auto=format&fit=crop"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response, open('real_nairobi_aerial.jpg', 'wb') as out_file:
    out_file.write(response.read())
print("Downloaded")
