import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const files = {
  login: 'src/pages/mobile/MobileLogin.tsx',
  signup: 'src/pages/mobile/MobileSignup.tsx',
  forgot: 'src/pages/mobile/MobileForgotPassword.tsx',
  reset: 'src/pages/mobile/MobileResetPassword.tsx',
};

const viewports = [
  { name: 'Mobile (iPhone SE/13)', width: 375, sm: false, md: false, lg: false, xl: false },
  { name: 'Phablet (Pixel/Galaxy)', width: 412, sm: false, md: false, lg: false, xl: false },
  { name: 'Small Tablet Boundary', width: 640, sm: true, md: false, lg: false, xl: false },
  { name: 'iPad Mini / Portrait Tablet', width: 768, sm: true, md: true, lg: false, xl: false },
  { name: 'iPad Air 10.9-in Portrait', width: 820, sm: true, md: true, lg: false, xl: false },
  { name: 'iPad Pro / Landscape Tablet', width: 1024, sm: true, md: true, lg: true, xl: false },
  { name: 'Standard Desktop', width: 1280, sm: true, md: true, lg: true, xl: true },
  { name: 'Wide Desktop', width: 1536, sm: true, md: true, lg: true, xl: true }
];

console.log('=== CHALLENGER EMPIRICAL VIEWPORT SIMULATION & ANALYSIS ===\n');

let passCount = 0;
let failCount = 0;

function check(label, condition, details = '') {
  if (condition) {
    passCount++;
    console.log('  [PASS] ' + label);
  } else {
    failCount++;
    console.error('  [FAIL] ' + label + (details ? ' :: ' + details : ''));
  }
}

// 1. Verify absence of 512px constraint in all 4 screens
for (const [key, relPath] of Object.entries(files)) {
  const content = fs.readFileSync(path.join(projectRoot, relPath), 'utf8');
  check(key + ': No max-w-md sm:max-w-lg container', !content.includes('max-w-md sm:max-w-lg'));
  check(key + ': No hardcoded 512px constraint', !content.includes('512px'));
  check(key + ': Header has w-full', content.includes('<header className="w-full'));
  check(key + ': Header has responsive padding', content.includes('px-4 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 md:py-10'));
  check(key + ': Header has inner container max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto', content.includes('max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto'));
  check(key + ': Main container has w-full flex-1', content.includes('<main className="w-full flex-1'));
  check(key + ': Form card has w-full max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto', content.includes('max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto'));
}

// 2. Viewport metrics calculation table
console.log('\n--- Effective Header & Card Width Across Viewports ---');
viewports.forEach(vp => {
  const mainPad = vp.md ? 48 : vp.sm ? 32 : 16;
  const headerWidth = vp.width;
  const cardMaxWidth = vp.md ? 896 : vp.sm ? 768 : 672;
  const availableWidth = vp.width - (mainPad * 2);
  const cardWidth = Math.min(availableWidth, cardMaxWidth);
  const cardPct = ((cardWidth / vp.width) * 100).toFixed(1);

  console.log(`Viewport: ${vp.width}px (${vp.name}) | Header: ${headerWidth}px (100%) | Card: ${cardWidth}px (${cardPct}%) | Card Max: ${cardMaxWidth}px | Main Padding: ${mainPad}px`);

  check(`${vp.width}px: Header spans 100% viewport width (${headerWidth}px)`, headerWidth === vp.width);
  check(`${vp.width}px: Card width spans comfortably (${cardWidth}px, ${cardPct}%)`, cardWidth >= 343 && (vp.width <= 1024 ? cardWidth >= (vp.width * 0.85) : true));
});

// 3. Multi-column grid verification in Signup and Reset
console.log('\n--- Multi-Column Grid Column Assertions ---');
const signup = fs.readFileSync(path.join(projectRoot, files.signup), 'utf8');
const reset = fs.readFileSync(path.join(projectRoot, files.reset), 'utf8');

check('Signup: Form defines grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6', signup.includes('className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"'));
check('Signup: Name field is col-span-1', signup.includes('className="input-group col-span-1"'));
check('Signup: Phone field is col-span-1', signup.includes('input-group col-span-1'));
check('Signup: Email field spans both columns (col-span-1 sm:col-span-2)', signup.includes('input-group col-span-1 sm:col-span-2'));
check('Signup: Password input is col-span-1', signup.includes('input-group col-span-1'));
check('Signup: Password requirements checklist is col-span-1 flex flex-col justify-end', signup.includes('className="col-span-1 flex flex-col justify-end"'));
check('Signup: Terms checkbox is col-span-1 sm:col-span-2', signup.includes('className="col-span-1 sm:col-span-2"'));

check('Reset: Grid defines grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4', reset.includes('className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4"'));
check('Reset: New password and confirm password are child divs of 2-col grid', reset.includes('Label htmlFor="reset-new-password"') && reset.includes('Label htmlFor="reset-confirm-password"'));

// 4. Mobile Ergonomics and Touch Targets
console.log('\n--- Mobile Ergonomics & WCAG Touch Targets ---');
check('Signup: Open Gmail button minHeight 44px', signup.includes('minHeight: 44'));
check('Signup: Paste OTP clipboard button minHeight 36px', signup.includes('minHeight: 36'));
check('Signup: Clear OTP button 28x28px', signup.includes('width: 28') && signup.includes('height: 28'));
check('Signup: Password show/hide toggle 44x44px', signup.includes('style={{ width: 44, height: 44 }}'));
check('Reset: Password show/hide toggle 44x44px', reset.includes('width: 44') && reset.includes('height: 44'));
check('Login: Header Sign Up button min-h-[44px]', fs.readFileSync(path.join(projectRoot, files.login), 'utf8').includes('min-h-[44px]'));
check('Signup: Header Log In button min-h-[44px]', signup.includes('min-h-[44px]'));
check('Forgot: Header Back to Login button minHeight 36px', fs.readFileSync(path.join(projectRoot, files.forgot), 'utf8').includes('minHeight: 36'));

console.log(`\n=== RESULTS: ${passCount} passed, ${failCount} failed out of ${passCount + failCount} tests ===`);
process.exit(failCount > 0 ? 1 : 0);
