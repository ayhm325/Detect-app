"""
netron_capture.py

Start Netron programmatically and capture a screenshot using Playwright.
This tries to keep Netron in-process so it stays alive during the capture.
"""
import threading
import time
import netron
from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8080"
OUT = "netron_screenshot.png"


def run_netron():
    try:
        # browse=False prevents opening a browser window
        netron.start('resnet18.onnx', host='127.0.0.1', port=8080, browse=False)
    except Exception as e:
        print('Netron start error:', e)


def capture():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={'width': 1600, 'height': 1200})
        # retry a couple times to let server start
        for _ in range(6):
            try:
                page.goto(URL, timeout=10000)
                break
            except Exception:
                time.sleep(1)
        page.wait_for_selector('body', timeout=15000)
        time.sleep(2)
        page.screenshot(path=OUT, full_page=True)
        print('Saved screenshot:', OUT)
        browser.close()


def main():
    t = threading.Thread(target=run_netron, daemon=True)
    t.start()
    # Give Netron a moment to start
    time.sleep(2)
    try:
        capture()
    finally:
        # Try to stop Netron if API available
        try:
            netron.stop()
        except Exception:
            pass


if __name__ == '__main__':
    main()
