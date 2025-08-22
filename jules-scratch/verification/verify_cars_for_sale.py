from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Listen for console events
    page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

    # Navigate to the cars for sale page
    page.goto("http://localhost:5000/cars-for-sale")

    # Wait for the page to load
    page.wait_for_load_state("networkidle")

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/cars_for_sale.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
