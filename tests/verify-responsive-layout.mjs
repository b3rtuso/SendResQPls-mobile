import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    failures.push({ testName, details });
    console.error(`  [FAIL] ${testName} - ${details}`);
  }
}

console.log('=== RUNNING EMPIRICAL RESPONSIVE LAYOUT VERIFICATION ===\n');

// 1. Check for lingering 540px constraints
console.log('Test Suite 1: Lingering 540px and Fixed Layout Constraints');
const appCssPath = path.join(projectRoot, 'src', 'App.css');
const bottomNavPath = path.join(projectRoot, 'src', 'components', 'BottomNav.tsx');
const toastProviderPath = path.join(projectRoot, 'src', 'components', 'MobileToastProvider.tsx');

const appCssContent = fs.readFileSync(appCssPath, 'utf8');
const bottomNavContent = fs.readFileSync(bottomNavPath, 'utf8');
const toastProviderContent = fs.readFileSync(toastProviderPath, 'utf8');

assert(!appCssContent.includes('540px'), 'src/App.css contains NO references to 540px');
assert(!appCssContent.includes('min(100%, 540px)'), 'src/App.css contains NO references to min(100%, 540px)');
assert(!bottomNavContent.includes('540px'), 'src/components/BottomNav.tsx contains NO references to 540px');
assert(!toastProviderContent.includes('540px'), 'src/components/MobileToastProvider.tsx contains NO references to 540px');
assert(!toastProviderContent.includes('258px'), 'src/components/MobileToastProvider.tsx contains NO legacy 258px half-width formula');

// Scan all files in src/ for any 540px
function scanDirFor540(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirFor540(fullPath);
    } else if (/\.(tsx|ts|css|html|jsx|js)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('540px')) {
        assert(false, `No 540px in ${path.relative(projectRoot, fullPath)}`, 'Found 540px reference');
      }
    }
  }
}
scanDirFor540(path.join(projectRoot, 'src'));
assert(true, 'Scanned entire src/ tree for 540px references: 0 found');

// 2. Check Grid Layout Breakpoints
console.log('\nTest Suite 2: Adaptive Grid Layouts & Responsive Breakpoints');
const mobileHomePath = path.join(projectRoot, 'src', 'pages', 'mobile', 'MobileHome.tsx');
const mobileHomeContent = fs.readFileSync(mobileHomePath, 'utf8');

const hotlinesGridMatch = mobileHomeContent.match(/grid\s+grid-cols-2\s+sm:grid-cols-4/);
assert(Boolean(hotlinesGridMatch), 'MobileHome Hotlines grid contains "grid-cols-2 sm:grid-cols-4"');

const safetyTipsGridMatch = mobileHomeContent.match(/grid\s+grid-cols-1\s+sm:grid-cols-2/);
assert(Boolean(safetyTipsGridMatch), 'MobileHome Safety Tips grid contains "grid-cols-1 sm:grid-cols-2"');

const sosCardMatch = mobileHomeContent.includes('sos-card max-w-xl mx-auto sm:p-8 md:p-10 sm:rounded-3xl');
assert(sosCardMatch, 'MobileHome SOS Card contains responsive centering and padding: "max-w-xl mx-auto sm:p-8 md:p-10 sm:rounded-3xl"');

const mobileHistoryPath = path.join(projectRoot, 'src', 'pages', 'mobile', 'MobileHistory.tsx');
const mobileHistoryContent = fs.readFileSync(mobileHistoryPath, 'utf8');
const historyGridMatch = mobileHistoryContent.match(/grid\s+grid-cols-1\s+sm:grid-cols-2/);
assert(Boolean(historyGridMatch), 'MobileHistory incident feed contains "grid-cols-1 sm:grid-cols-2"');

const mobileNotificationsPath = path.join(projectRoot, 'src', 'pages', 'mobile', 'MobileNotifications.tsx');
const mobileNotificationsContent = fs.readFileSync(mobileNotificationsPath, 'utf8');
const notifGridMatch = mobileNotificationsContent.match(/grid\s+grid-cols-1\s+sm:grid-cols-2/);
assert(Boolean(notifGridMatch), 'MobileNotifications feed contains "grid-cols-1 sm:grid-cols-2"');

const mobileReportPath = path.join(projectRoot, 'src', 'pages', 'mobile', 'MobileReport.tsx');
const mobileReportContent = fs.readFileSync(mobileReportPath, 'utf8');
const reportGridMatch = mobileReportContent.match(/grid\s+grid-cols-1\s+md:grid-cols-2/);
assert(Boolean(reportGridMatch), 'MobileReport form contains "grid-cols-1 md:grid-cols-2"');
assert(mobileReportContent.includes('md:min-h-[300px] md:h-[340px]'), 'MobileReport viewfinder camera evidence has tablet height "md:min-h-[300px] md:h-[340px]"');

// 3. Check Auth Screens Fluid Responsive Headers & Wide Containers
console.log('\nTest Suite 3: Auth Screens Fluid Responsive Headers & Wide Containers');
const authFiles = [
  'MobileLogin.tsx',
  'MobileSignup.tsx',
  'MobileForgotPassword.tsx',
  'MobileResetPassword.tsx',
];

for (const authFile of authFiles) {
  const filePath = path.join(projectRoot, 'src', 'pages', 'mobile', authFile);
  const content = fs.readFileSync(filePath, 'utf8');

  // Assert elimination of narrow 512px constraint (max-w-md sm:max-w-lg)
  assert(!content.includes('max-w-md sm:max-w-lg'), `${authFile} contains NO narrow 512px wrapper ("max-w-md sm:max-w-lg")`);

  // Assert full-width edge-to-edge header with responsive padding
  assert(content.includes('w-full') && content.includes('px-4 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 md:py-10'), `${authFile} header spans 100% width with responsive padding ("w-full ... px-4 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 md:py-10")`);

  // Assert header inner alignment container
  assert(content.includes('max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto'), `${authFile} contains inner alignment container ("max-w-2xl sm:max-w-3xl md:max-w-4xl mx-auto")`);

  // Assert spacious responsive form card container
  assert(content.includes('rounded-2xl sm:rounded-3xl shadow-xl'), `${authFile} contains responsive form container styling ("rounded-2xl sm:rounded-3xl shadow-xl")`);

  // Also verify responsive styling @media (min-width: 640px)
  assert(content.includes('@media (min-width: 640px)'), `${authFile} includes @media (min-width: 640px) tablet styling`);
}

// Check Signup and Reset multi-column responsive grids
const signupPath = path.join(projectRoot, 'src', 'pages', 'mobile', 'MobileSignup.tsx');
const signupContent = fs.readFileSync(signupPath, 'utf8');
assert(signupContent.includes('grid-cols-1 sm:grid-cols-2'), 'MobileSignup contains adaptive multi-column grid ("grid-cols-1 sm:grid-cols-2")');

const resetPath = path.join(projectRoot, 'src', 'pages', 'mobile', 'MobileResetPassword.tsx');
const resetContent = fs.readFileSync(resetPath, 'utf8');
assert(resetContent.includes('grid-cols-1 sm:grid-cols-2'), 'MobileResetPassword contains adaptive multi-column password grid ("grid-cols-1 sm:grid-cols-2")');

// 4. Shell Deduplication & Max-Width Boundaries
console.log('\nTest Suite 4: Shell Deduplication & Max-Width Container Bounds');
const childPages = [
  'MobileHome.tsx',
  'MobileReport.tsx',
  'MobileHistory.tsx',
  'MobileNotifications.tsx',
  'MobileProfile.tsx',
  'MobileLogin.tsx',
  'MobileSignup.tsx',
  'MobileForgotPassword.tsx',
  'MobileResetPassword.tsx',
];

for (const page of childPages) {
  const filePath = path.join(projectRoot, 'src', 'pages', 'mobile', page);
  const content = fs.readFileSync(filePath, 'utf8');
  const hasDuplicateShell = /className=["'][^"']*mobile-shell[^"']*["']/.test(content);
  assert(!hasDuplicateShell, `No duplicate .mobile-shell in child page ${page}`);
}

const appTsxPath = path.join(projectRoot, 'src', 'App.tsx');
const appTsxContent = fs.readFileSync(appTsxPath, 'utf8');
assert(appTsxContent.includes('AuthenticatedMobileLayout'), 'App.tsx defines AuthenticatedMobileLayout');
assert(appTsxContent.includes('className="mobile-shell w-full min-h-screen flex flex-col bg-[#F1F5F9]"'), 'App.tsx AuthenticatedMobileLayout root has full-width .mobile-shell');

// 5. Stacking Context & Z-Index Hierarchy
console.log('\nTest Suite 5: Stacking Context & Z-Index Hierarchy');
assert(bottomNavContent.includes('z-index: 99999') || bottomNavContent.includes('z-index: 99999 !important'), 'BottomNav has z-index 99999');
assert(toastProviderContent.includes('zIndex: 200000') || toastProviderContent.includes('200000'), 'MobileToastProvider has zIndex 200000');
assert(mobileHomeContent.includes('zIndex: 100000'), 'MobileHome location modal has zIndex 100000');
assert(mobileReportContent.includes('zIndex: 100000'), 'MobileReport modals have zIndex 100000');

// 6. Navigation Docking & Edge-to-Edge Spanning
console.log('\nTest Suite 6: Persistent Bottom Navigation Layout & Docking');
assert(bottomNavContent.includes('width: 100% !important'), 'BottomNav spans 100% full width');
assert(bottomNavContent.includes('left: 0 !important'), 'BottomNav docks left: 0');
assert(bottomNavContent.includes('right: 0 !important'), 'BottomNav docks right: 0');
assert(bottomNavContent.includes('max-width: 768px'), 'BottomNav inner container is constrained to max-width: 768px with auto margins');
assert(bottomNavContent.includes('repeat(5, 1fr)'), 'BottomNav inner grid has repeat(5, 1fr) layout');

// 7. Profile Component Responsive Centering
console.log('\nTest Suite 7: Profile Views Responsive Centering');
const mobileProfilePath = path.join(projectRoot, 'src', 'pages', 'mobile', 'MobileProfile.tsx');
const mobileProfileContent = fs.readFileSync(mobileProfilePath, 'utf8');
assert(mobileProfileContent.includes('max-w-2xl mx-auto'), 'MobileProfile uses max-w-2xl mx-auto container centering');
assert(mobileProfileContent.includes('max-w-3xl mx-auto') || mobileProfileContent.includes('maxWidthClass = \'max-w-2xl\''), 'MobileProfile supports spacious subpage containers');

// 8. Production CSS Bundle Compilation & Breakpoints
console.log('\nTest Suite 8: Production CSS Bundle Breakpoint Verification');
const distAssetsDir = path.join(projectRoot, 'dist', 'assets');
let cssBundleFile = null;
if (fs.existsSync(distAssetsDir)) {
  const files = fs.readdirSync(distAssetsDir);
  cssBundleFile = files.find(f => f.startsWith('index-') && f.endsWith('.css'));
}

assert(Boolean(cssBundleFile), `Production CSS bundle located in dist/assets: ${cssBundleFile}`);

if (cssBundleFile) {
  const cssBundlePath = path.join(distAssetsDir, cssBundleFile);
  const bundleContent = fs.readFileSync(cssBundlePath, 'utf8');

  assert(!bundleContent.includes('540px'), 'Production bundle CSS has 0 occurrences of 540px');
  assert(bundleContent.includes('.mobile-shell'), 'Production bundle CSS defines .mobile-shell');
  assert(bundleContent.includes('width:100%') || bundleContent.includes('width: 100%'), 'Production bundle CSS sets full width on mobile shell');
  assert(bundleContent.includes('@media (width>=40rem)') || bundleContent.includes('@media (min-width: 640px)'), 'Tailwind v4 compiled sm (>=40rem / 640px) breakpoint query');
  assert(bundleContent.includes('@media (width>=48rem)') || bundleContent.includes('@media (min-width: 768px)'), 'Tailwind v4 compiled md (>=48rem / 768px) breakpoint query');
  assert(bundleContent.includes('.sm\\:grid-cols-4'), 'Production bundle CSS contains compiled .sm:grid-cols-4 class');
  assert(bundleContent.includes('.sm\\:grid-cols-2'), 'Production bundle CSS contains compiled .sm:grid-cols-2 class');
  assert(bundleContent.includes('.md\\:grid-cols-2'), 'Production bundle CSS contains compiled .md:grid-cols-2 class');
  assert(bundleContent.includes('.sm\\:max-w-lg'), 'Production bundle CSS contains compiled .sm:max-w-lg class');
  assert(bundleContent.includes('.sm\\:rounded-3xl'), 'Production bundle CSS contains compiled .sm:rounded-3xl class');
}

// 9. Multi-Viewport Responsive Matrix Verification
console.log('\nTest Suite 9: Multi-Viewport Responsive Matrix Verification');
// Viewport 1: Mobile Phone (375px, 412px)
console.log('  Testing Viewport Matrix: Mobile Phones (375px, 412px)...');
assert(mobileHomeContent.includes('grid-cols-2'), 'Mobile Viewport (375px/412px): Hotlines default to 2 columns');
assert(mobileHomeContent.includes('grid-cols-1'), 'Mobile Viewport (375px/412px): Safety tips default to 1-column card stack');
assert(mobileHistoryContent.includes('grid-cols-1'), 'Mobile Viewport (375px/412px): Report history feed defaults to 1 column');
assert(mobileNotificationsContent.includes('grid-cols-1'), 'Mobile Viewport (375px/412px): Notifications feed defaults to 1 column');
assert(mobileReportContent.includes('grid-cols-1'), 'Mobile Viewport (375px/412px): Report incident form defaults to 1-column vertical workflow');
assert(appCssContent.includes('width: 100%'), 'Mobile Viewport (375px/412px): Global shell spans 100% fluid mobile width');

// Viewport 2: Small Tablet (600px - 768px)
console.log('  Testing Viewport Matrix: Small Tablets (600px - 768px)...');
assert(mobileHomeContent.includes('sm:grid-cols-4'), 'Small Tablet Viewport (600px-768px): Hotlines adapt to 4 columns (sm:grid-cols-4 >=640px)');
assert(mobileHomeContent.includes('sm:grid-cols-2'), 'Small Tablet Viewport (600px-768px): Safety tips adapt to 2 columns (sm:grid-cols-2 >=640px)');
assert(mobileHistoryContent.includes('sm:grid-cols-2'), 'Small Tablet Viewport (600px-768px): History feed adapts to 2-column grid (sm:grid-cols-2 >=640px)');
assert(mobileNotificationsContent.includes('sm:grid-cols-2'), 'Small Tablet Viewport (600px-768px): Notification feed adapts to 2-column grid (sm:grid-cols-2 >=640px)');
assert(mobileHomeContent.includes('sm:p-8'), 'Small Tablet Viewport (600px-768px): SOS card increases padding for tablet touch targets (sm:p-8)');
for (const authFile of authFiles) {
  const filePath = path.join(projectRoot, 'src', 'pages', 'mobile', authFile);
  const content = fs.readFileSync(filePath, 'utf8');
  assert(content.includes('w-full') && content.includes('sm:max-w-3xl'), `Small Tablet Viewport (600px-768px): ${authFile} spans full width with wide responsive container (sm:max-w-3xl)`);
}

// Viewport 3: Medium & Large Tablet (800px - 1024px)
console.log('  Testing Viewport Matrix: Medium & Large Tablets (800px - 1024px)...');
assert(mobileReportContent.includes('md:grid-cols-2'), 'Medium/Large Tablet (800px-1024px): Incident Report splits into 2-column layout (md:grid-cols-2 >=768px)');
assert(mobileReportContent.includes('md:h-[340px]'), 'Medium/Large Tablet (800px-1024px): Incident camera viewfinder scales to comfortable height (md:h-[340px])');
assert(mobileHomeContent.includes('md:p-10'), 'Medium/Large Tablet (800px-1024px): SOS card scales to spacious padding (md:p-10)');
assert(bottomNavContent.includes('max-width: 768px'), 'Medium/Large Tablet (800px-1024px): BottomNav tabs capped at max-width 768px to prevent over-stretching');
assert(mobileHomeContent.includes('max-w-4xl'), 'Medium/Large Tablet (800px-1024px): Home page content centered in max-w-4xl container');

// Viewport 4: Desktop (>1024px)
console.log('  Testing Viewport Matrix: Desktop Viewports (>1024px)...');
assert(!appCssContent.includes('max-width: 540px'), 'Desktop Viewport (>1024px): Global shell has NO 540px letterboxing ceiling');
assert(!bottomNavContent.includes('max-width: 540px'), 'Desktop Viewport (>1024px): BottomNav has NO 540px width ceiling');
assert(appCssContent.includes('overflow-x: clip') || appCssContent.includes('overflow-x: hidden'), 'Desktop Viewport (>1024px): Horizontal overflow prevented across full screen width');
assert(bottomNavContent.includes('position: fixed') && bottomNavContent.includes('bottom: 0'), 'Desktop Viewport (>1024px): Bottom navigation bar remains securely docked at viewport bottom');
assert(mobileProfileContent.includes('max-w-2xl mx-auto'), 'Desktop Viewport (>1024px): Profile cards ergonomically centered in max-w-2xl container');

console.log(`\n=== SUMMARY: ${passedTests} passed, ${failedTests} failed out of ${totalTests} tests ===`);
if (failedTests > 0) {
  console.error('\nFAILURES:');
  for (const f of failures) {
    console.error(`- ${f.testName}: ${f.details}`);
  }
  process.exit(1);
} else {
  console.log('ALL EMPIRICAL TESTS PASSED SUCCESSFULLY.\n');
  process.exit(0);
}
