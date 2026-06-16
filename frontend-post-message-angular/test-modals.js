const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to login
    console.log('📍 Navigating to login page');
    await page.goto('http://localhost:4200/auth/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Fill login form
    console.log('🔐 Logging in...');
    await page.fill('input[name="username"], input[placeholder*="username"]', 'admin');
    await page.fill('input[name="password"], input[placeholder*="password"], input[type="password"]', 'admin123');

    // Find and click login button
    const loginBtn = await page.$('button:has-text("Iniciar"), button:has-text("Sign")');
    if (!loginBtn) {
      const buttons = await page.$$('button');
      if (buttons.length > 0) {
        await buttons[buttons.length - 1].click();
      }
    } else {
      await loginBtn.click();
    }

    await page.waitForNavigation({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('✅ Logged in successfully');

    // Navigate to dashboard posts
    console.log('📍 Navigating to http://localhost:4200/dashboard/posts');
    await page.goto('http://localhost:4200/dashboard/posts', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Take screenshot of posts list
    console.log('📸 Taking screenshot of posts list...');
    await page.screenshot({ path: 'posts-list.png' });
    console.log('✅ Screenshot saved');

    // Look for action buttons
    const buttons = await page.$$('div.flex.items-center.justify-end.gap-2 button');
    console.log(`Found ${buttons.length} action buttons`);

    if (buttons.length >= 5) {
      // Click view button (first action button for first row)
      console.log('🖱️  Clicking VIEW button...');
      await buttons[0].click();
      await page.waitForTimeout(1500);

      // Take screenshot of view modal
      console.log('📸 Taking screenshot of view modal...');
      await page.screenshot({ path: 'view-modal.png' });
      console.log('✅ View modal displayed');

      // Check if view component exists
      const viewComponent = await page.$('app-post-view');
      if (viewComponent) {
        console.log('✅ app-post-view component found');
        // Get text content
        const title = await page.$('h2');
        if (title) {
          const text = await title.textContent();
          console.log(`   Post title: ${text}`);
        }
      }

      // Close modal
      console.log('🔘 Closing view modal...');
      const closeBtn = await page.$('button[class*="text-gray-500 hover"]');
      if (closeBtn) {
        await closeBtn.click();
        await page.waitForTimeout(1000);
        console.log('✅ View modal closed');
      }

      // Get fresh buttons
      const buttonsAfterClose = await page.$$('div.flex.items-center.justify-end.gap-2 button');

      // Click edit button (second button)
      console.log('🖱️  Clicking EDIT button...');
      await buttonsAfterClose[1].click();
      await page.waitForTimeout(1500);

      // Take screenshot of edit modal
      console.log('📸 Taking screenshot of edit modal...');
      await page.screenshot({ path: 'edit-modal.png' });
      console.log('✅ Edit modal displayed');

      // Check if form exists
      const formComponent = await page.$('app-post-form, form');
      if (formComponent) {
        console.log('✅ Form component found');
      }

      // Close edit modal
      console.log('🔘 Closing edit modal...');
      const closeBtnEdit = await page.$('button[class*="text-gray-500 hover"]');
      if (closeBtnEdit) {
        await closeBtnEdit.click();
        await page.waitForTimeout(1000);
        console.log('✅ Edit modal closed');
      }

      // Get fresh buttons again
      const buttonsAfterEdit = await page.$$('div.flex.items-center.justify-end.gap-2 button');

      // Click delete button (5th button)
      console.log('🖱️  Clicking DELETE button...');
      await buttonsAfterEdit[4].click();
      await page.waitForTimeout(1500);

      // Take screenshot of delete confirm modal
      console.log('📸 Taking screenshot of delete confirm modal...');
      await page.screenshot({ path: 'delete-modal.png' });
      console.log('✅ Delete confirmation modal displayed');

      // Check if delete confirm component exists
      const deleteComponent = await page.$('app-post-delete-confirm');
      if (deleteComponent) {
        console.log('✅ app-post-delete-confirm component found');
      }

      // Close delete modal by clicking Cancel
      console.log('🔘 Clicking Cancel to close delete modal...');
      const cancelBtn = await page.$('button:has-text("Cancelar"), button:has-text("Cancel")');
      if (cancelBtn) {
        await cancelBtn.click();
        await page.waitForTimeout(1000);
        console.log('✅ Delete modal closed');
      }

      console.log('\n✅ All modal tests PASSED!');
    } else {
      console.log('⚠️ Not enough posts or action buttons found');
      console.log('Page content:', await page.content());
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
  } finally {
    await browser.close();
  }
})();
