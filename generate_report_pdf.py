"""
generate_report_pdf.py

Converts `reports/final_model_report.md` to HTML and renders a PDF using Playwright.

Requirements: this script will install the Python `markdown` package if missing and
uses Playwright (browsers should already be installed in the project's venv).

Output: `reports/final_model_report.html` and `reports/final_model_report.pdf`
"""
import sys
import subprocess
from pathlib import Path


def ensure_markdown():
    try:
        import markdown  # noqa: F401
    except Exception:
        print("Installing markdown package...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "markdown"])


def build_html(md_path: Path, html_path: Path):
    import markdown

    md_text = md_path.read_text(encoding="utf-8")
    # Convert markdown to HTML (supports fenced code blocks and tables)
    html_body = markdown.markdown(md_text, extensions=["fenced_code", "tables"]) 

    css = """
    body { font-family: Arial, Helvetica, sans-serif; margin: 28px; color: #111 }
    img { max-width: 100%; height: auto; display:block; margin: 8px 0 }
    pre { background: #f6f8fa; padding: 12px; overflow:auto }
    code { font-family: monospace }
    a { color: #0366d6 }
    h1,h2,h3 { color: #222 }
    """

    repo_link = "https://github.com/ayhm325/Detect-app"

    html = f"""
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Final Model Report</title>
      <style>{css}</style>
    </head>
    <body>
      <div style="font-size:12px;color:#666;margin-bottom:8px">Generated from repository: <a href="{repo_link}">{repo_link}</a></div>
      {html_body}
    </body>
    </html>
    """

    html_path.write_text(html, encoding="utf-8")
    return html_path


def render_pdf(html_path: Path, pdf_path: Path):
    # Use Playwright to render the HTML to PDF
    try:
        from playwright.sync_api import sync_playwright
    except Exception:
        print("Playwright not available in Python. Please install Playwright in the venv and run 'playwright install'.")
        raise

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 1600})
        page.goto(html_path.as_uri())
        page.wait_for_timeout(1000)
        # Save as PDF
        page.pdf(path=str(pdf_path), format="A4", print_background=True)
        browser.close()


def main():
    root = Path(__file__).parent
    md = root / "reports" / "final_model_report.md"
    html = root / "reports" / "final_model_report.html"
    pdf = root / "reports" / "final_model_report.pdf"

    if not md.exists():
        print(f"Markdown report not found: {md}")
        sys.exit(1)

    ensure_markdown()
    build_html(md, html)
    print(f"Wrote HTML: {html}")
    try:
        render_pdf(html, pdf)
        print(f"Wrote PDF: {pdf}")
    except Exception as e:
        print("PDF render failed:", e)
        sys.exit(1)


if __name__ == '__main__':
    main()
