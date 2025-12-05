import {expect, Page} from '@playwright/test';

export class AccessibilityScan {
    async accessibilityScanResults(page: Page): Promise<void> {
        // Inject axe-core script into the page
        await page.addScriptTag({path: require.resolve('axe-core')});

        // Run axe accessibility checks
        const accessibilityScanResults = await page.evaluate((tags) => {
            return new Promise(resolve => {
                axe.run({runOnly: {type: 'tag', values: tags}}, (err: any, results: unknown) => {
                    if (err) throw err;
                    resolve(results);
                });
            });
        }, ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);

        // Log the accessibility scan results
        console.log('Accessibility Scan Results:', JSON.stringify(accessibilityScanResults, null, 2));

        // Check for violations
        expect(accessibilityScanResults.violations).toEqual([]);
    }
}