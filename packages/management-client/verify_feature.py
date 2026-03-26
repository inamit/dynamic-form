from playwright.sync_api import Page, expect, sync_playwright

def verify_feature(page: Page):
  page.goto("http://localhost:5173/entities")
  page.wait_for_timeout(2000)

  page.locator("a:has-text('Add Entity')").click()
  page.wait_for_timeout(1000)

  page.get_by_label("Name *").fill("TestEntity")
  page.locator("div[role='combobox']").first.click()
  page.locator("li[role='option']:has-text('store-graphql')").click()
  page.wait_for_timeout(1000)

  page.locator("button:has-text('Introspect Schema')").click()
  page.wait_for_timeout(3000)

  page.locator("text=GraphQL Introspection").wait_for(state="visible", timeout=10000)
  page.wait_for_timeout(1000)

  page.screenshot(path="/home/jules/verification/verification.png")
  page.wait_for_timeout(1000)

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(record_video_dir="/home/jules/verification/video")
    page = context.new_page()
    try:
      verify_feature(page)
    finally:
      context.close()
      browser.close()
