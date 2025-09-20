#!/usr/bin/env python3
"""
Music Generator API Test Script
===============================
This script tests the Music Generator API endpoint with comprehensive error handling.
"""

import requests
import json
import time
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://thzhvpxpkajthfkzfxbr.supabase.co/functions/v1/agents"
ENDPOINTS = {
    'test': f"{BASE_URL}/test",
    'music_generator': f"{BASE_URL}/music-generator",
    'agents_list': "https://thzhvpxpkajthfkzfxbr.supabase.co/functions/v1/agents"
}

def print_separator(title: str = ""):
    """Print a visual separator with optional title."""
    print("\n" + "="*60)
    if title:
        print(f"🎼 {title}")
        print("="*60)

def test_endpoint_connectivity():
    """Test basic endpoint connectivity."""
    print_separator("Testing Endpoint Connectivity")
    
    # Test the test endpoint first
    try:
        print("🔍 Testing debug endpoint...")
        response = requests.get(ENDPOINTS['test'], timeout=10)
        print(f"📊 Test endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Test endpoint working!")
            print(f"📄 Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"⚠️ Test endpoint returned: {response.status_code}")
            print(f"📄 Response: {response.text}")
    except Exception as e:
        print(f"🚨 Test endpoint error: {str(e)}")
    
    return False

def test_agents_list():
    """Test the agents list endpoint."""
    print_separator("Testing Agents List")
    
    try:
        print("📋 Fetching agents list...")
        response = requests.get(ENDPOINTS['agents_list'], timeout=10)
        print(f"📊 Agents list status: {response.status_code}")
        
        if response.status_code == 200:
            agents = response.json()
            print("✅ Agents list retrieved successfully!")
            print(f"📄 Found {len(agents)} agents:")
            for agent in agents:
                print(f"  • {agent.get('name', 'Unknown')} - {agent.get('status', 'Unknown')}")
            return True
        else:
            print(f"⚠️ Agents list returned: {response.status_code}")
            print(f"📄 Response: {response.text}")
    except Exception as e:
        print(f"🚨 Agents list error: {str(e)}")
    
    return False

def test_music_generation(api_key: Optional[str] = None, test_name: str = ""):
    """Test the music generation endpoint."""
    title = f"Music Generation Test{f' ({test_name})' if test_name else ''}"
    print_separator(title)
    
    headers = {
        "Content-Type": "application/json"
    }
    
    if api_key:
        headers["X-API-Key"] = api_key
        print(f"🔑 Using API key: {api_key[:8]}...")
    else:
        print("🔓 Testing without API key...")
    
    payload = {
        "prompt": "Create a peaceful meditation track with soft piano and gentle strings",
        "duration": 30,
        "style": "ambient",
        "mood": "peaceful",
        "tempo": 70,
        "key": "C minor",
        "instruments": ["piano", "strings"]
    }
    
    try:
        print("🚀 Sending music generation request...")
        print(f"📝 Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(
            ENDPOINTS['music_generator'],
            headers=headers,
            json=payload,
            timeout=60  # Music generation can take time
        )
        
        print(f"📊 Response status: {response.status_code}")
        print(f"📄 Response headers: {dict(response.headers)}")
        
        try:
            result = response.json()
            print(f"📄 Response body: {json.dumps(result, indent=2)}")
            
            if response.status_code == 200 and result.get('status') == 'success':
                print("✅ Music generation successful!")
                if 'url' in result:
                    print(f"🎵 Audio URL: {result['url']}")
                return True
            else:
                print(f"⚠️ Generation failed: {result.get('error', 'Unknown error')}")
                return False
                
        except json.JSONDecodeError:
            print(f"📄 Raw response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out (music generation can take 1-3 minutes)")
        return False
    except Exception as e:
        print(f"🚨 Request error: {str(e)}")
        return False

def main():
    """Run comprehensive API tests."""
    print("🎼 Music Generator API Test Suite")
    
    # Test 1: Basic connectivity
    connectivity_ok = test_endpoint_connectivity()
    
    # Test 2: Agents list
    agents_ok = test_agents_list()
    
    # Test 3: Music generation without API key
    no_key_result = test_music_generation(test_name="No API Key")
    
    # Test 4: Music generation with API key (if provided)
    api_key = input("\n🔑 Enter your API key (or press Enter to skip): ").strip()
    
    if api_key:
        api_key_result = test_music_generation(api_key, "With API Key")
    else:
        print("⏭️ Skipping API key test")
        api_key_result = None
    
    # Summary
    print_separator("Test Results Summary")
    print(f"🔗 Connectivity Test: {'✅ PASS' if connectivity_ok else '❌ FAIL'}")
    print(f"📋 Agents List Test: {'✅ PASS' if agents_ok else '❌ FAIL'}")
    print(f"🎵 Music Gen (No Key): {'✅ PASS' if no_key_result else '❌ FAIL'}")
    if api_key_result is not None:
        print(f"🔑 Music Gen (With Key): {'✅ PASS' if api_key_result else '❌ FAIL'}")
    
    if not any([connectivity_ok, agents_ok]):
        print("\n💡 Troubleshooting Tips:")
        print("  • Check if the edge function is deployed")
        print("  • Verify the base URL is correct")
        print("  • Check the console logs in Supabase for more details")
    
    print("\n🏁 Test completed!")

if __name__ == "__main__":
    main()