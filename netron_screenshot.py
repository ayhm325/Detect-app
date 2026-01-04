"""
netron_screenshot.py

Headless script that captures a full-page screenshot of Netron UI served at
http://127.0.0.1:8080 and saves it as `netron_screenshot.png` in the repo root.

Usage:
  .venv\Scripts\python netron_screenshot.py
"""
from playwright.sync_api import sync_playwright
import time
import urllib.request
import urllib.error

URL = "http://127.0.0.1:8080"
OUT = "netron_screenshot.png"


def _server_reachable(url: str, timeout_s: float = 1.5) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=timeout_s) as resp:
            return 200 <= getattr(resp, "status", 200) < 500
    except (urllib.error.URLError, ValueError):
        return False

def main():
    if not _server_reachable(URL):
        print(f"Netron server is not reachable at {URL}.")
        print("Start it first, then re-run this script. Example:")
        print(r"  .venv\Scripts\python -m netron resnet18.onnx --host 127.0.0.1 --port 8080")
        raise SystemExit(2)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1600, 'height': 1200})
        # Give Netron a moment if it's still starting
        try:
            page.goto(URL, timeout=30000)
        except Exception:
            time.sleep(2)
            page.goto(URL, timeout=30000)

        # Wait for main content; Netron renders a canvas and tree
        page.wait_for_selector('body', timeout=15000)
        # small delay to allow dynamic content to render
        time.sleep(2)
        page.screenshot(path=OUT, full_page=True)
        print(f"Saved screenshot: {OUT}")
        browser.close()

if __name__ == '__main__':
    main()
