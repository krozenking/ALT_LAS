import requests
import json

url = "http://localhost:8002/segment"
payload = {
    "command": "Test command for segmentation",
    "mode": "Normal",
    "persona": "technical_expert",
    "user_id": "test_user_123",
    "metadata": {"source": "test_script"}
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    response.raise_for_status()  # Raise an exception for HTTP errors
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(response.json())
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
    if hasattr(e, 'response') and e.response is not None:
        print(f"Response content: {e.response.text}")

