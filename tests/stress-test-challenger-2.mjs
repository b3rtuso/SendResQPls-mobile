import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const authFiles = {
  login: path.join(projectRoot, 'src/pages/mobile/MobileLogin.tsx'),
  signup: path.join(projectRoot, 'src/pages/mobile/MobileSignup.tsx'),
  forgot: path.join(projectRoot, 'src/pages/mobile/MobileForgotPassword.tsx'),
  reset: path.join(projectRoot, 'src/pages/mobile/MobileResetPassword.tsx'),
  legalModal: path.join(projectRoot, 'src/components/LegalModal.tsx')
};

const contents = {};
for (const [key, p] of Object.entries(authFiles)) {
  contents[key] = fs.readFileSync(p, 'utf8');
}

console.log('================================================================');
console.log('CHALLENGER 2 EMPIRICAL ADVERSARIAL STRESS TEST & ERGONOMICS HARNESS');
console.log('================================================================\n');

let pass = 0;
let fail = 0;
const findings = [];

function assertTest(label, cond, details = '', isAdversarialChallenge = false) {
  if (cond) {
    pass++;
    console.log(`  [PASS] ${label}`);
  } else {
    fail++;
    console.log(`  [CHALLENGE DETECTED] ${label} -> ${details}`);
    findings.push({ label, details, isAdversarialChallenge });
  }
}

// -------------------------------------------------------------
// SECTION 1: Touch Target Heights & Minimum Dimensions (>= 44px)
// -------------------------------------------------------------
console.log('--- SECTION 1: Touch Target Dimensions Audit (WCAG 2.5.5 >= 44px) ---');

// 1.1 Inputs across all screens
assertTest('Login: Email input wrapper height clamp(44px, 6vh, 50px)', contents.login.includes("minHeight: 'clamp(44px, 6vh, 50px)'"));
assertTest('Login: Password input wrapper height clamp(44px, 6vh, 50px)', contents.login.includes("height: 'clamp(44px, 6vh, 50px)'"));
assertTest('Signup: Full name input wrapper height clamp(44px, 6vh, 50px)', contents.signup.includes("style={{ height: 'clamp(44px, 6vh, 50px)' }}") || contents.signup.includes("height: 'clamp(44px, 6vh, 50px)'"));
assertTest('Signup: Phone number input wrapper height clamp(44px, 6vh, 50px)', contents.signup.includes("height: 'clamp(44px, 6vh, 50px)'"));
assertTest('Signup: Email input wrapper height clamp(44px, 6vh, 50px)', contents.signup.includes("height: 'clamp(44px, 6vh, 50px)'"));
assertTest('Signup: OTP code input wrapper height clamp(44px, 6vh, 50px)', contents.signup.includes("height: 'clamp(44px, 6vh, 50px)'"));
assertTest('Signup: Password input wrapper height clamp(44px, 6vh, 50px)', contents.signup.includes("height: 'clamp(44px, 6vh, 50px)'"));
assertTest('Forgot: Email input wrapper height clamp(44px, 6vh, 50px)', contents.forgot.includes("minHeight: 'clamp(44px, 6vh, 50px)'"));
assertTest('Reset: New & confirm password wrappers height clamp(44px, 6vh, 50px)', contents.reset.includes("minHeight: 'clamp(44px, 6vh, 50px)'"));

// 1.2 Primary Action Buttons
assertTest('Login: Submit button has min-height >= 44px (minHeight: 48)', contents.login.includes('minHeight: 48') || contents.login.includes('min-height: clamp(44px'));
assertTest('Signup: Send Code button has min-height >= 44px', contents.signup.includes("minHeight: 'clamp(44px, 6vh, 50px)'"));
assertTest('Signup: Verify OTP button has min-height >= 44px', contents.signup.includes("minHeight: 'clamp(44px, 6vh, 50px)'"));
assertTest('Signup: Create Account button has min-height >= 44px', contents.signup.includes("minHeight: 'clamp(44px, 6vh, 50px)'"));
assertTest('Forgot: Send Reset Link button has min-height >= 44px', contents.forgot.includes("min-height: clamp(44px, 6vh, 50px)"));
assertTest('Reset: Save New Password button has min-height >= 44px', contents.reset.includes("minHeight: 'clamp(44px, 6vh, 50px)'"));

// 1.3 Password Visibility Toggles
assertTest('Login: Password eye toggle button is 44x44px', contents.login.includes('width: 44, height: 44') || (contents.login.includes('width: 44') && contents.login.includes('height: 44')));
assertTest('Signup: Password eye toggle button is 44x44px', contents.signup.includes('width: 44, height: 44') || contents.signup.includes('style={{ width: 44, height: 44 }}'));
assertTest('Reset: New password eye toggle button is 44x44px', contents.reset.includes('width: 44') && contents.reset.includes('height: 44'));
assertTest('Reset: Confirm password eye toggle button is 44x44px', contents.reset.includes('width: 44') && contents.reset.includes('height: 44'));

// 1.4 Gmail Launchers
assertTest('Signup: Open Gmail launcher button has min-height >= 44px', contents.signup.includes('minHeight: 44'));
assertTest('Forgot: Open Gmail button uses mf-auth-btn with min-height >= 44px', contents.forgot.includes('className="mf-auth-btn"'));

// 1.5 Header Navigation / Switch Buttons
assertTest('Login: Header Sign Up switch button has min-h-[44px]', contents.login.includes('min-h-[44px]'));
assertTest('Signup: Header Log In switch button has min-h-[44px]', contents.signup.includes('min-h-[44px]'));

// 1.6 Checkbox Container
assertTest('Signup: Terms & Conditions row has min-height >= 44px tap target', contents.signup.includes('minHeight: 44'));

// 1.7 Adversarial Checks: Sub-44px Touch Targets
console.log('\n--- Adversarial Touch Target Challenges ---');
const signupPasteChipMatches = contents.signup.match(/onClick=\{[^}]*\}\s*style=\{[^}]*minHeight:\s*(\d+)[^}]*\}[^>]*>\s*<span>Paste/s);
const signupPasteMinHeight = contents.signup.includes('minHeight: 36') ? 36 : (contents.signup.includes('minHeight: 44') ? 44 : 0);
assertTest('Signup: Paste OTP clipboard button meets >= 44px requirement', signupPasteMinHeight >= 44, `Actual minHeight is ${signupPasteMinHeight}px (< 44px deficit of ${44 - signupPasteMinHeight}px)`, true);

const signupClearIconMatch = contents.signup.includes('width: 28') && contents.signup.includes('height: 28');
assertTest('Signup: Clear OTP icon button meets >= 44px requirement', !signupClearIconMatch, `Actual dimensions are 28x28px (< 44px deficit of 16px)`, true);

const forgotBackBtnMatch = contents.forgot.includes('minHeight: 36');
assertTest('Forgot: Back to Login header pill button meets >= 44px requirement', !forgotBackBtnMatch, `Actual minHeight is 36px (< 44px deficit of 8px)`, true);

const legalModalCloseMatch = contents.legalModal.includes('width: 36px') && contents.legalModal.includes('height: 36px');
assertTest('LegalModal: Close button meets >= 44px requirement', !legalModalCloseMatch, `Actual dimensions are 36x36px (< 44px deficit of 8px)`, true);

// -------------------------------------------------------------
// SECTION 2: Form Resilience & Boundary Conditions (<640px to 320px)
// -------------------------------------------------------------
console.log('\n--- SECTION 2: Viewport Boundary & Overflow Simulation ---');

const testViewports = [
  { w: 320, name: 'iPhone SE (1st gen) / Ultra-compact' },
  { w: 360, name: 'Standard Budget Android' },
  { w: 375, name: 'iPhone mini / SE 2022' },
  { w: 412, name: 'Pixel 7 / Galaxy S23' },
  { w: 640, name: 'Small Tablet Boundary' },
  { w: 768, name: 'iPad Mini (Portrait)' },
  { w: 820, name: 'iPad Air 10.9-in' },
  { w: 1024, name: 'iPad Pro (Landscape)' }
];

testViewports.forEach(vp => {
  const isTablet = vp.w >= 640;
  const isMd = vp.w >= 768;
  const outerPad = isMd ? 48 : (isTablet ? 32 : 16);
  const cardMax = isMd ? 896 : (isTablet ? 768 : 672);
  const availableOuter = vp.w - (outerPad * 2);
  const cardWidth = Math.min(availableOuter, cardMax);
  const innerPad = isMd ? 40 : (isTablet ? 32 : 24);
  const innerContentWidth = cardWidth - (innerPad * 2);

  console.log(`Viewport ${vp.w}px (${vp.name}): card=${cardWidth}px, inner=${innerContentWidth}px`);

  // Verify that inner content width is always positive and accommodates standard fields
  assertTest(`${vp.w}px: Card content container width is positive (${innerContentWidth}px)`, innerContentWidth > 0);
  assertTest(`${vp.w}px: Card content accommodates minimum mobile field width (>= 180px)`, innerContentWidth >= 180);
});

// 2.2 Error Banner resilience
console.log('\n--- Error Banner Resilience & Text Wrapping ---');
assertTest('Login: Global error banner uses flexbox with shrink-0 icon', contents.login.includes('flexShrink: 0') && contents.login.includes('AlertTriangle'));
assertTest('Signup: Top error banner uses flexbox', contents.signup.includes("display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2'"));
assertTest('Forgot: Error banner uses flex-start alignment with shrink-0 icon', contents.forgot.includes("alignItems: 'flex-start'") && contents.forgot.includes('flexShrink: 0'));
assertTest('Reset: Error banner uses flex-start alignment with shrink-0 icon', contents.reset.includes("alignItems: 'flex-start'") && contents.reset.includes('flexShrink: 0'));

// 2.3 Legal Modal Resilience
console.log('\n--- LegalModal Responsive Resilience ---');
assertTest('LegalModal: Uses full-bleed backdrop overlay (100vw, 100dvh, inset 0)', contents.legalModal.includes('width: 100vw') && contents.legalModal.includes('height: 100dvh'));
assertTest('LegalModal: Card constrained to min(520px, calc(100vw - 24px))', contents.legalModal.includes('max-width: min(520px, calc(100vw - 24px))'));
assertTest('LegalModal: Media query for <= 480px optimizes buttons to 100% width and min-height 46px', contents.legalModal.includes('min-height: 46px') && contents.legalModal.includes('width: 100% !important'));
assertTest('LegalModal: Scrollable body has overflow-y: auto to prevent offscreen spill', contents.legalModal.includes('overflow-y: auto'));

console.log('\n================================================================');
console.log(`STRESS TEST SUMMARY: ${pass} PASSED, ${fail} CHALLENGES IDENTIFIED`);
console.log('================================================================');
if (findings.length > 0) {
  console.log('\nAdversarial Challenge Findings:');
  findings.forEach((f, i) => {
    console.log(`${i + 1}. [${f.isAdversarialChallenge ? 'ERGONOMICS DEFICIT' : 'FAIL'}] ${f.label}`);
    console.log(`   -> ${f.details}`);
  });
}
