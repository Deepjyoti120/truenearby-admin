# Graph Report - apps/admin  (2026-05-14)

## Corpus Check
- 79 files · ~115,925 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 191 nodes · 150 edges · 59 communities detected
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_API Client & Auth Flow|API Client & Auth Flow]]
- [[_COMMUNITY_Sidebar Navigation|Sidebar Navigation]]
- [[_COMMUNITY_Select Component|Select Component]]
- [[_COMMUNITY_Sheet Component|Sheet Component]]
- [[_COMMUNITY_Pagination Component|Pagination Component]]
- [[_COMMUNITY_Users Dashboard Page|Users Dashboard Page]]
- [[_COMMUNITY_Admin Profile & Sidebar Wiring|Admin Profile & Sidebar Wiring]]
- [[_COMMUNITY_Next.js Default Brand Assets|Next.js Default Brand Assets]]
- [[_COMMUNITY_Breadcrumb Component|Breadcrumb Component]]
- [[_COMMUNITY_App Bootstrap Concepts|App Bootstrap Concepts]]
- [[_COMMUNITY_Table Component|Table Component]]
- [[_COMMUNITY_Store Buttons|Store Buttons]]
- [[_COMMUNITY_Users Query Hooks|Users Query Hooks]]
- [[_COMMUNITY_Card Component|Card Component]]
- [[_COMMUNITY_Avatar Component|Avatar Component]]
- [[_COMMUNITY_Dropdown Menu|Dropdown Menu]]
- [[_COMMUNITY_Main Nav|Main Nav]]
- [[_COMMUNITY_Root Layout|Root Layout]]
- [[_COMMUNITY_Refund Cancellation Page|Refund Cancellation Page]]
- [[_COMMUNITY_Account Delete Page|Account Delete Page]]
- [[_COMMUNITY_Contact Us Page|Contact Us Page]]
- [[_COMMUNITY_Dashboard Layout|Dashboard Layout]]
- [[_COMMUNITY_Settings Page|Settings Page]]
- [[_COMMUNITY_Links Page|Links Page]]
- [[_COMMUNITY_Auth Guard|Auth Guard]]
- [[_COMMUNITY_Creative Attribution Notice|Creative Attribution Notice]]
- [[_COMMUNITY_Nav Secondary|Nav Secondary]]
- [[_COMMUNITY_Field Primitive|Field Primitive]]
- [[_COMMUNITY_Label Primitive|Label Primitive]]
- [[_COMMUNITY_Tooltip Primitive|Tooltip Primitive]]
- [[_COMMUNITY_Separator Primitive|Separator Primitive]]
- [[_COMMUNITY_Button Primitive|Button Primitive]]
- [[_COMMUNITY_Collapsible Primitive|Collapsible Primitive]]
- [[_COMMUNITY_Input Primitive|Input Primitive]]
- [[_COMMUNITY_Skeleton Primitive|Skeleton Primitive]]
- [[_COMMUNITY_Query Provider|Query Provider]]
- [[_COMMUNITY_App Sidebar Layout|App Sidebar Layout]]
- [[_COMMUNITY_App Content|App Content]]
- [[_COMMUNITY_App Shell|App Shell]]
- [[_COMMUNITY_Mobile Detection Hook|Mobile Detection Hook]]
- [[_COMMUNITY_cn() Utility|cn() Utility]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Next.js Env Types|Next.js Env Types]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Features Index|Features Index]]
- [[_COMMUNITY_Privacy Policy Page|Privacy Policy Page]]
- [[_COMMUNITY_Other Standalone Page (a)|Other Standalone Page (a)]]
- [[_COMMUNITY_Other Standalone Page (b)|Other Standalone Page (b)]]
- [[_COMMUNITY_Other Standalone Page (c)|Other Standalone Page (c)]]
- [[_COMMUNITY_Other Standalone Page (d)|Other Standalone Page (d)]]
- [[_COMMUNITY_Other Standalone Page (e)|Other Standalone Page (e)]]
- [[_COMMUNITY_Other Standalone Page (f)|Other Standalone Page (f)]]
- [[_COMMUNITY_App Sidebar Header|App Sidebar Header]]
- [[_COMMUNITY_App Sidebar Layout File|App Sidebar Layout File]]
- [[_COMMUNITY_Sonner Toast|Sonner Toast]]
- [[_COMMUNITY_Switch Primitive|Switch Primitive]]
- [[_COMMUNITY_Creative Resources|Creative Resources]]
- [[_COMMUNITY_Constants|Constants]]

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 10 edges
2. `parseApiError()` - 6 edges
3. `Next.js Default Public Assets` - 6 edges
4. `apiLogin()` - 5 edges
5. `Next.js Admin App` - 5 edges
6. `updateProfileSettings()` - 4 edges
7. `useSidebar()` - 4 edges
8. `getProfileDisplayModel()` - 3 edges
9. `fetchProfile()` - 3 edges
10. `fetchUsers()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `fetchProfile()` --calls--> `apiFetch()`  [INFERRED]
  /Users/deepjyotibaishya/Projects/next/deepjyoti-next-admin/apps/admin/src/features/profile/api.ts → apps/admin/src/lib/api.ts
- `fetchProfile()` --calls--> `parseApiError()`  [INFERRED]
  /Users/deepjyotibaishya/Projects/next/deepjyoti-next-admin/apps/admin/src/features/profile/api.ts → apps/admin/src/lib/api.ts
- `onSubmit()` --calls--> `apiLogin()`  [INFERRED]
  /Users/deepjyotibaishya/Projects/next/deepjyoti-next-admin/apps/admin/src/components/login-form.tsx → apps/admin/src/lib/api.ts
- `updateProfileSettings()` --calls--> `apiFetch()`  [INFERRED]
  /Users/deepjyotibaishya/Projects/next/deepjyoti-next-admin/apps/admin/src/features/profile/api.ts → apps/admin/src/lib/api.ts
- `updateProfileSettings()` --calls--> `parseApiError()`  [INFERRED]
  /Users/deepjyotibaishya/Projects/next/deepjyoti-next-admin/apps/admin/src/features/profile/api.ts → apps/admin/src/lib/api.ts

## Communities

### Community 0 - "API Client & Auth Flow"
Cohesion: 0.17
Nodes (13): apiFetch(), apiLogin(), apiLogout(), fetchUsers(), getPlatform(), isAuthRoute(), parseApiError(), redirectToLogin() (+5 more)

### Community 1 - "Sidebar Navigation"
Cohesion: 0.2
Nodes (4): NavProjects(), NavUser(), SidebarMenuButton(), useSidebar()

### Community 2 - "Select Component"
Cohesion: 0.18
Nodes (0): 

### Community 3 - "Sheet Component"
Cohesion: 0.2
Nodes (0): 

### Community 4 - "Pagination Component"
Cohesion: 0.22
Nodes (0): 

### Community 5 - "Users Dashboard Page"
Cohesion: 0.25
Nodes (0): 

### Community 6 - "Admin Profile & Sidebar Wiring"
Cohesion: 0.29
Nodes (5): fetchProfile(), formatRoleLabel(), getProfileDisplayModel(), AppSidebar(), useAdminProfileQuery()

### Community 7 - "Next.js Default Brand Assets"
Cohesion: 0.29
Nodes (8): File Document Icon, Globe World Icon, Next.js Wordmark Logo, Next.js Framework, Next.js Default Public Assets, Vercel Platform, Vercel Triangle Logo, Window Browser Icon

### Community 8 - "Breadcrumb Component"
Cohesion: 0.29
Nodes (0): 

### Community 9 - "App Bootstrap Concepts"
Cohesion: 0.33
Nodes (6): app/page.tsx Entry, create-next-app bootstrap, Development Server (npm/yarn/pnpm/bun dev), Geist Font (next/font), Next.js Admin App, Vercel Deployment Platform

### Community 10 - "Table Component"
Cohesion: 0.4
Nodes (0): 

### Community 11 - "Store Buttons"
Cohesion: 0.5
Nodes (0): 

### Community 12 - "Users Query Hooks"
Cohesion: 0.67
Nodes (2): usersQueryKey(), useUsersQuery()

### Community 13 - "Card Component"
Cohesion: 0.5
Nodes (0): 

### Community 14 - "Avatar Component"
Cohesion: 0.5
Nodes (0): 

### Community 15 - "Dropdown Menu"
Cohesion: 0.5
Nodes (0): 

### Community 16 - "Main Nav"
Cohesion: 0.67
Nodes (0): 

### Community 17 - "Root Layout"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Refund Cancellation Page"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Account Delete Page"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Contact Us Page"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Dashboard Layout"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Settings Page"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Links Page"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Auth Guard"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Creative Attribution Notice"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Nav Secondary"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Field Primitive"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Label Primitive"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Tooltip Primitive"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Separator Primitive"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Button Primitive"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Collapsible Primitive"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Input Primitive"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Skeleton Primitive"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Query Provider"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "App Sidebar Layout"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "App Content"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "App Shell"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Mobile Detection Hook"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "cn() Utility"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Next.js Env Types"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "ESLint Config"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Next.js Config"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Features Index"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Privacy Policy Page"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Other Standalone Page (a)"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Other Standalone Page (b)"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Other Standalone Page (c)"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Other Standalone Page (d)"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Other Standalone Page (e)"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Other Standalone Page (f)"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "App Sidebar Header"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "App Sidebar Layout File"
Cohesion: 1.0
Nodes (0): 

### Community 55 - "Sonner Toast"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Switch Primitive"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Creative Resources"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Constants"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **9 isolated node(s):** `create-next-app bootstrap`, `Development Server (npm/yarn/pnpm/bun dev)`, `app/page.tsx Entry`, `Geist Font (next/font)`, `Vercel Deployment Platform` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Root Layout`** (2 nodes): `RootLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Refund Cancellation Page`** (2 nodes): `page.tsx`, `RefundCancellationPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Account Delete Page`** (2 nodes): `AccountDeletePage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Contact Us Page`** (2 nodes): `page.tsx`, `ContactUsPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard Layout`** (2 nodes): `DashboardLayout()`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings Page`** (2 nodes): `SettingsPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Links Page`** (2 nodes): `LinksPage()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Guard`** (2 nodes): `AuthGuard()`, `auth-guard.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Creative Attribution Notice`** (2 nodes): `CreativeAttributionNotice()`, `creative-attribution-notice.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Nav Secondary`** (2 nodes): `nav-secondary.tsx`, `NavSecondary()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Field Primitive`** (2 nodes): `cn()`, `field.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Label Primitive`** (2 nodes): `Label()`, `label.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tooltip Primitive`** (2 nodes): `tooltip.tsx`, `TooltipContent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Separator Primitive`** (2 nodes): `Separator()`, `separator.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Button Primitive`** (2 nodes): `cn()`, `button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Collapsible Primitive`** (2 nodes): `collapsible.tsx`, `Collapsible()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Input Primitive`** (2 nodes): `Input()`, `input.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Skeleton Primitive`** (2 nodes): `skeleton.tsx`, `Skeleton()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Query Provider`** (2 nodes): `AppQueryProvider()`, `query-provider.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Sidebar Layout`** (2 nodes): `AppSidebarLayout.tsx`, `AppSidebarLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Content`** (2 nodes): `AppContent()`, `AppContent.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Shell`** (2 nodes): `AppShell.tsx`, `AppShell()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Mobile Detection Hook`** (2 nodes): `use-mobile.ts`, `useIsMobile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `cn() Utility`** (2 nodes): `utils.ts`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Env Types`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Features Index`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Privacy Policy Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Other Standalone Page (a)`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Other Standalone Page (b)`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Other Standalone Page (c)`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Other Standalone Page (d)`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Other Standalone Page (e)`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Other Standalone Page (f)`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Sidebar Header`** (1 nodes): `app-sidebar-header.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `App Sidebar Layout File`** (1 nodes): `app-sidebar-layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sonner Toast`** (1 nodes): `sonner.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Switch Primitive`** (1 nodes): `switch.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Creative Resources`** (1 nodes): `creative-resources.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Constants`** (1 nodes): `constants.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `apiFetch()` connect `API Client & Auth Flow` to `Admin Profile & Sidebar Wiring`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `updateProfileSettings()` connect `API Client & Auth Flow` to `Admin Profile & Sidebar Wiring`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `apiFetch()` (e.g. with `fetchProfile()` and `updateProfileSettings()`) actually correct?**
  _`apiFetch()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `parseApiError()` (e.g. with `fetchProfile()` and `updateProfileSettings()`) actually correct?**
  _`parseApiError()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `Next.js Default Public Assets` (e.g. with `File Document Icon` and `Vercel Triangle Logo`) actually correct?**
  _`Next.js Default Public Assets` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `create-next-app bootstrap`, `Development Server (npm/yarn/pnpm/bun dev)`, `app/page.tsx Entry` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._