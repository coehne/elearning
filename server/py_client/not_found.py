import requests

endpoint = "http://localhost:8000/api/courses/1123125412"

get_response = requests.get(endpoint)
print(get_response.json())
