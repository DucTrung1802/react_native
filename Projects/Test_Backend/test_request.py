import requests

base_url = "https://dummyjson.com/carts"

# response = requests.get(base_url, params=base_params)
response = requests.get(base_url)
results = response.json()
print(results)
