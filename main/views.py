# main/views.py

from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
import json
import requests
from django.shortcuts import render

def index(request):
    return render(request, 'main/index.html')

VISION_API_URL = "https://api.vansh.one/"
AUTH_KEY = "9lOXn0chZYjI3RmSF6iHrB5oxM1CLbfs"

@csrf_exempt
def get_explanation(request):
    if request.method != 'POST':
        return HttpResponseBadRequest("Only POST method is allowed for this endpoint")
    
    try:
        raw_body = request.body
        print("Raw request body:", raw_body)
        
        body_str = raw_body.decode('utf-8')
        data = json.loads(body_str)
        print("Decoded JSON data:", data)
        
        model = data.get('model')

        if model == "Vision":
            tools = data.get('tools', [])
            messages = data.get('messages', [])

            if not isinstance(tools, list) or not all(isinstance(tool, str) for tool in tools):
                return HttpResponseBadRequest("Invalid 'tools' structure")
            if not isinstance(messages, list) or not all(isinstance(message, dict) for message in messages):
                return HttpResponseBadRequest("Invalid 'messages' structure")

            payload = {
                "model": "Vision",
                "tools": tools,
                "messages": messages
            }

        elif model == "VisionBrush":
            text = data.get('text')

            payload = {
                "model": "Vision Brush",
                "text": text
            }

        elif model == "IsBrush":
            image = data.get('image')

            payload = {
                "model": "IsBrush",
                "image": image
            }

        else:
            return HttpResponseBadRequest("Invalid 'model' specified")

        headers = {
            "Content-Type": "application/json",
            "AuthKey": AUTH_KEY
        }

        response = requests.post(VISION_API_URL, headers=headers, json=payload)
        response_data = response.json()

        return JsonResponse(response_data)

    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")  # Log the JSON decode error for debugging
        return HttpResponseBadRequest("Invalid JSON format in request body")
    except Exception as e:
        print(f"Error: {e}")  # Log any other exceptions for debugging
        return HttpResponseBadRequest(f"Error: {str(e)}")
